/**
 * ?mobile-nav-debug=1 调试徽标。
 *
 * 契约：不用 MutationObserver 自观（避免把自身输出喂回回调导致硬冻结，
 * dsh-mobile-nav 实测事故）；只用 resize（rAF 节流）+ 定时刷新。
 * 总是返回 disposer（不适用时返回 noop），供 ctx.effect 持有。
 */

export interface DebugBadgeState {
  /** 每帧显示文本（视口/断点/canary 状态等）。 */
  (): string
}

const NOOP = (): void => {}

export function installDebugBadge(readState: DebugBadgeState): () => void {
  if (typeof window === 'undefined') return NOOP
  if (new URLSearchParams(window.location.search).get('mobile-nav-debug') !== '1') return NOOP

  const badge = document.createElement('div')
  badge.dataset.mobileNav = 'debug'
  const css: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    right: '8px',
    bottom: '8px',
    zIndex: '2147483000',
    maxWidth: '90vw',
    padding: '6px 10px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.72)',
    color: '#7ee787',
    font: '11px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    whiteSpace: 'pre-wrap',
    pointerEvents: 'none',
  }
  Object.assign(badge.style, css)

  const paint = (): void => {
    try {
      const text = readState()
      if (badge.textContent !== text) badge.textContent = text
    } catch (error) {
      if (badge.textContent !== '[error]') badge.textContent = '[error] ' + String(error)
    }
  }
  paint()
  document.body.appendChild(badge)

  let raf = 0
  const onResize = (): void => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(paint)
  }
  const onError = (): void => {
    paint()
  }
  window.addEventListener('resize', onResize)
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onError)
  const timer = window.setInterval(paint, 2000)
  return () => {
    cancelAnimationFrame(raf)
    window.clearInterval(timer)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onError)
    badge.remove()
  }
}
