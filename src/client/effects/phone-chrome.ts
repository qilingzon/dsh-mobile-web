/**
 * phone-chrome — M1 基线：viewport 元数据（不干预浏览器缩放）。
 * M2：追加 interactive-widget=resizes-content（Android 键盘重排；Safari 忽略系 WebKit bug，
 * iOS 靠 dvh 链覆盖）——由 installMobileEffect 窄屏装配，恢复时还原原文。
 * 缩放策略（v0.1.8）：不监听/不拦截 gesturestart —— 那会把 iOS 双指捏合缩放一起禁掉；
 * 双击缩放的抑制交给 base.css 的 touch-action: manipulation（不影响捏合）。
 * theme-color 由 vendor ThemePresenter 动态同步，不重复接管；M5 manifest 用运行时主题色。
 */

const NOOP = (): void => {}

/** 纯函数：组装窄屏 viewport 内容（可单测）。 */
export function composeViewportContent(lockedMaximumScale: boolean): string {
  return (
    'width=device-width, initial-scale=1' +
    (lockedMaximumScale ? ', maximum-scale=1' : '') +
    ', viewport-fit=cover' +
    ', interactive-widget=resizes-content'
  )
}

export function installPhoneChrome(): () => void {
  if (typeof document === 'undefined') return NOOP
  const meta = document.querySelector('meta[name="viewport"]')
  const prev = meta === null ? null : meta.getAttribute('content')
  if (meta !== null) {
    // 保留宿主已有的 maximum-scale 锁（iOS Safari 聚焦 <16px 输入自动缩放需要）
    const locked = /(^|,)\s*maximum-scale\s*=/.test(prev === null ? '' : prev)
    meta.setAttribute('content', composeViewportContent(locked))
  }
  // 注意：不要用 gesturestart/preventDefault 之类手段拦双击缩放——会误伤双指捏合。
  return () => {
    if (meta !== null && prev !== null) meta.setAttribute('content', prev)
  }
}
