/**
 * Breakpoint 单一事实源。
 *
 * 对齐 vendor SIDEBAR_AUTO_COLLAPSE = 1024（dsh-client-ui-layout）：<1024 即窄屏。
 * 因此窄屏 CSS/JS 一律以 (max-width: 1023px) 为准；桌面零影响以 (min-width: 1024px) 兜底。
 * 768-1023 平板与手机共用同一套移动布局（需求决策 7，不设 rail 第二档）。
 */

export const NARROW_MAX_WIDTH = 1023

export const MOBILE_QUERY = '(max-width: ' + NARROW_MAX_WIDTH + 'px)'

export const DESKTOP_QUERY = '(min-width: 1024px)'

/** 纯函数：宽度是否属于窄屏（可单测）。 */
export function isNarrowWidth(width: number): boolean {
  return width <= NARROW_MAX_WIDTH
}

/** ctx.effect 的最小结构面（测试可用假实现注入）。 */
export interface EffectHost {
  effect<T>(fn: () => T | (() => void) | undefined, label?: string): void
}

/**
 * 统一 matchMedia + change 重武装范式：窄屏命中时安装效果，离开时卸载，
 * 跨断点变化（含旋转）自动 re-arm。所有自定义效果必须经此入口安装。
 */
export function installMobileEffect(
  ctx: EffectHost,
  label: string,
  install: (narrow: MediaQueryList) => (() => void) | undefined,
): void {
  if (typeof window === 'undefined') return
  ctx.effect(() => {
    const narrow = window.matchMedia(MOBILE_QUERY)
    let cleanup: (() => void) | undefined
    const arm = (): void => {
      cleanup?.()
      cleanup = narrow.matches ? install(narrow) : undefined
    }
    arm()
    narrow.addEventListener('change', arm)
    return () => {
      narrow.removeEventListener('change', arm)
      cleanup?.()
    }
  }, label)
}
