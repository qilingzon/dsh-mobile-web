/**
 * upload-guard — 移动端图片上传防崩溃与防 OOM 卫士：
 * 1. 移动端照片（手机主摄通常为 5000万~2亿 像素，单图解码内存高达 200MB~800MB）
 *    原图直传并转 base64 极易触发移动浏览器/Webview 500MB 内存阈值引发白屏或标签页崩溃 (OOM Crash)。
 * 2. 拦截 <input type="file">，对于过大图片在客户端使用 Canvas 平滑下采样（上限 2560px 边长，85% JPEG 压缩），
 *    将内存占用与 Base64 大小从几十兆降低到几百 KB，并保留清晰度。
 * 3. 增强 input 属性支持移动端相机与图库选取规范。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'

const MAX_IMAGE_SIDE = 2560
const JPEG_QUALITY = 0.85
const COMPRESS_THRESHOLD_BYTES = 2.5 * 1024 * 1024 // > 2.5MB 图片进行移动端内存安全压缩

async function downsampleImage(file: File): Promise<File> {
  // 只对常见位图进行安全降采样
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const origW = img.naturalWidth || img.width
      const origH = img.naturalHeight || img.height
      if (origW <= 0 || origH <= 0) {
        resolve(file)
        return
      }

      // 计算等比例缩放
      let targetW = origW
      let targetH = origH
      if (origW > MAX_IMAGE_SIDE || origH > MAX_IMAGE_SIDE) {
        if (origW >= origH) {
          targetW = MAX_IMAGE_SIDE
          targetH = Math.round((origH * MAX_IMAGE_SIDE) / origW)
        } else {
          targetH = MAX_IMAGE_SIDE
          targetW = Math.round((origW * MAX_IMAGE_SIDE) / origH)
        }
      } else if (file.size <= COMPRESS_THRESHOLD_BYTES) {
        resolve(file)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d', { alpha: file.type === 'image/png' })
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, targetW, targetH)
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file)
            return
          }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, outputType === 'image/jpeg' ? '.jpg' : '.png'), {
            type: outputType,
            lastModified: Date.now(),
          })
          resolve(compressed)
        },
        outputType,
        JPEG_QUALITY
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

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

        let isCompressing = false

        // 拦截 change 事件，在文件被交付给宿主 intakeFiles 之前进行防 OOM 下采样
        input.addEventListener(
          'change',
          (event) => {
            if (isCompressing) return
            const files = input.files
            if (!files || files.length === 0) return

            // 检查是否有超大图片需要压缩
            const needsCompression = Array.from(files).some(
              (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size > COMPRESS_THRESHOLD_BYTES
            )
            if (!needsCompression) return

            // 阻止当前事件冒泡扩散，执行异步压缩后重新派发安全事件
            event.stopImmediatePropagation()
            event.preventDefault()

            isCompressing = true
            const fileList = Array.from(files)
            Promise.all(fileList.map((f) => downsampleImage(f)))
              .then((safeFiles) => {
                const dt = new DataTransfer()
                for (const sf of safeFiles) {
                  dt.items.add(sf)
                }
                input.files = dt.files
                // 重新派发原生 change 事件（此时 input.dataset.uploadGuarded 已就位，且图片体积已安全）
                input.dispatchEvent(new Event('change', { bubbles: true }))
              })
              .catch((err) => {
                console.warn('[dsh-mobile-web-pro] image compression failed, falling back to original:', err)
                input.dispatchEvent(new Event('change', { bubbles: true }))
              })
              .finally(() => {
                isCompressing = false
              })
          },
          true // 捕获阶段拦截
        )
      }
    },
    cleanup() {
      // 保持轻量
    },
  }
}
