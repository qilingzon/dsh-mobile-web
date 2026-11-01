/**
 * upload-guard — 移动端图片防 OOM 卫士：
 *
 * 根因与教训：
 * 1. 之前在 input[type="file"] 的 change 事件捕获阶段调用 stopImmediatePropagation / preventDefault，
 *    彻底破坏了 React 18 对文件选择的合成事件触发机制，导致用户选了图片后第一次被完全丢弃，必须反复操作多次。
 * 2. 宿主对图片发送采用 encodeImage(file) -> base64ImageOf(file) -> FileReader.readAsDataURL(file)。
 *    手机拍摄的 20MP~50MP 超大照片直接转 Base64 会暴涨至几百兆堆内存，导致移动端浏览器内核 OOM 崩溃/闪退。
 *
 * 正确架构解法：
 * 绝不在 input 上阻断或取消 change 事件！
 * 方案：在全局原生对 FileReader.prototype.readAsDataURL 进行拦截代理。
 * 当宿主尝试对大于 COMPRESS_THRESHOLD_BYTES 的超大图片执行 readAsDataURL 时，在底层无缝下采样后再进行 Base64 读取，
 * 既 100% 保证 React 的 onChange 一次性顺畅触发（绝不丢失选图），
 * 又彻底切断超大 Base64 暴涨引发的手机内存溢出与闪退！
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'

const MAX_IMAGE_SIDE = 2048 // 移动端主流显示与大模型视觉输入上限（2048px）
const JPEG_QUALITY = 0.82
const COMPRESS_THRESHOLD_BYTES = 2.0 * 1024 * 1024 // > 2MB 图片触发安全下采样

/** 将超大图片文件转换为安全尺寸与体积的 Blob */
async function downsampleImage(file: File | Blob): Promise<Blob> {
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height

      if (w <= 0 || h <= 0) {
        resolve(file)
        return
      }

      if (w > MAX_IMAGE_SIDE || h > MAX_IMAGE_SIDE) {
        if (w >= h) {
          h = Math.round((h * MAX_IMAGE_SIDE) / w)
          w = MAX_IMAGE_SIDE
        } else {
          w = Math.round((w * MAX_IMAGE_SIDE) / h)
          h = MAX_IMAGE_SIDE
        }
      }

      try {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          JPEG_QUALITY
        )
      } catch (err) {
        console.warn('[dsh-mobile-web-pro] downsample error, keeping original:', err)
        resolve(file)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}

let fileReaderPatched = false

/** 代理 FileReader.prototype.readAsDataURL 拦截并防护大图转 Base64 造成的 OOM */
export function installFileReaderGuard(): () => void {
  if (fileReaderPatched || typeof window === 'undefined' || !window.FileReader) return () => {}
  fileReaderPatched = true

  const originalReadAsDataURL = FileReader.prototype.readAsDataURL

  FileReader.prototype.readAsDataURL = function (blobOrFile: Blob) {
    if (
      blobOrFile instanceof Blob &&
      ['image/jpeg', 'image/png', 'image/webp'].includes(blobOrFile.type) &&
      blobOrFile.size > COMPRESS_THRESHOLD_BYTES
    ) {
      // 异步下采样后再执行原生 readAsDataURL，避免几百兆 Base64 挤爆移动端 WebView
      downsampleImage(blobOrFile)
        .then((safeBlob) => {
          originalReadAsDataURL.call(this, safeBlob)
        })
        .catch(() => {
          originalReadAsDataURL.call(this, blobOrFile)
        })
      return
    }

    return originalReadAsDataURL.call(this, blobOrFile)
  }

  return () => {
    FileReader.prototype.readAsDataURL = originalReadAsDataURL
    fileReaderPatched = false
  }
}

/** 辅助 Task：为手机端文件选择框补充原生相机支持，绝不拦截阻止 change 事件 */
export function createUploadGuardTask(): ReconcilerTask {
  return {
    name: 'upload-guard',
    scopes: ['*'],
    ensure() {
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]')
      for (const input of inputs) {
        if (input.dataset.uploadGuarded === 'true') continue
        input.dataset.uploadGuarded = 'true'

        // 移动端体验优化：允许图片及常见文件选择
        if (!input.hasAttribute('accept')) {
          input.setAttribute('accept', 'image/*,*/*')
        }
      }
    },
    cleanup() {
      // 保持轻量
    },
  }
}
