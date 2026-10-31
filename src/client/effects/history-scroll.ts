/**
 * history-scroll — 平滑向上滚动自动拉取更早历史（Pro 核心特性）。
 *
 * 核心设计原则（彻底吸取原仓库缺陷教训）：
 *  1) 绝对不修改、不覆写 scrollTop：完全交由 DSH 原生 this.viewport.preserve()
 *     与 [data-chat-paging-anchor] 机制维持滚动锚定，杜绝由于外部强制改动 scrollTop 造成的画面剧烈跳动。
 *  2) 触控动量保护：用户手指正在屏幕按压滑动时（touchstart 未 touchend）抑制自动触发，
 *     待手势释放后且滚动速度稳定再触发，避免突发打断手势惯性。
 *  3) 防抖与节流冷却：单次触发后设置 1200ms 冷却时间，正在加载中（button.disabled）时跳过。
 *  4) 遵循 ReconcilerTask 规范：幂等挂载与完整销毁清理。
 */

import type { ReconcilerTask } from '../core/reconciler-core.ts'
import { getConfig } from '../config.ts'

const SCROLLER_SEL = '[data-phase] [class*="_scrollBody"], [data-chat-flow]'
const OLDER_BTN_SEL = '[class*="_older"] button'

/** 触发阈值（距离顶部 px）*/
const TOP_THRESHOLD_PX = 180
/** 冷却防抖（ms）*/
const COOLDOWN_MS = 1200

export function createHistoryScrollTask(): ReconcilerTask {
  let boundScroller: HTMLElement | null = null
  let isTouching = false
  let lastTriggerTime = 0
  let checkTimer: number | null = null
  let io: IntersectionObserver | null = null

  const findScroller = (): HTMLElement | null => {
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')
    if (flow === null) return null
    // 优先取外层有滚动能力的容器
    let parent = flow.parentElement
    while (parent !== null && parent !== document.body) {
      const style = window.getComputedStyle(parent)
      const oy = style.overflowY
      if (oy === 'auto' || oy === 'scroll') return parent
      parent = parent.parentElement
    }
    return document.querySelector<HTMLElement>(SCROLLER_SEL)
  }

  const findOlderButton = (): HTMLButtonElement | null => {
    return document.querySelector<HTMLButtonElement>(OLDER_BTN_SEL)
  }

  const maybeTrigger = (): void => {
    if (!getConfig().autoLoadEarlier) return
    const now = Date.now()
    if (now - lastTriggerTime < COOLDOWN_MS) return
    if (isTouching) return

    const btn = findOlderButton()
    if (btn === null || !btn.isConnected || btn.disabled) return

    // 触发前检查滚动容器是否确实处于顶部附近
    const scroller = boundScroller ?? findScroller()
    if (scroller !== null && scroller.scrollTop > TOP_THRESHOLD_PX) return

    lastTriggerTime = now
    // 仅通过原生 click 事件交由 DSH 内置 loadEarlier 驱动
    // 零修改 scrollTop，保留官方完整的 beginPaging() / preserve() 锚定
    try {
      btn.click()
    } catch {
      /* 忽略异常 */
    }
  }

  const scheduleCheck = (): void => {
    if (checkTimer !== null) return
    checkTimer = window.setTimeout(() => {
      checkTimer = null
      maybeTrigger()
    }, 120)
  }

  const onScroll = (): void => {
    const scroller = boundScroller
    if (scroller === null) return
    if (scroller.scrollTop <= TOP_THRESHOLD_PX) {
      scheduleCheck()
    }
  }

  const onTouchStart = (): void => {
    isTouching = true
  }

  const onTouchEnd = (): void => {
    isTouching = false
    // 用户抬手后，若依然停留在顶部触发区，延时 80ms 平滑触发
    window.setTimeout(() => {
      maybeTrigger()
    }, 80)
  }

  const bind = (scroller: HTMLElement): void => {
    if (boundScroller === scroller) return
    unbind()
    boundScroller = scroller
    scroller.addEventListener('scroll', onScroll, { passive: true })
    scroller.addEventListener('touchstart', onTouchStart, { passive: true })
    scroller.addEventListener('touchend', onTouchEnd, { passive: true })
    scroller.addEventListener('touchcancel', onTouchEnd, { passive: true })

    // 结合 IntersectionObserver 监听 older 按钮的可见性
    if (typeof IntersectionObserver !== 'undefined') {
      try {
        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                maybeTrigger()
              }
            }
          },
          { root: scroller, rootMargin: '100px 0px 0px 0px', threshold: 0.1 },
        )
        const btn = findOlderButton()
        if (btn !== null && btn.parentElement !== null) {
          io.observe(btn.parentElement)
        }
      } catch {
        io = null
      }
    }
  }

  const unbind = (): void => {
    if (boundScroller !== null) {
      boundScroller.removeEventListener('scroll', onScroll)
      boundScroller.removeEventListener('touchstart', onTouchStart)
      boundScroller.removeEventListener('touchend', onTouchEnd)
      boundScroller.removeEventListener('touchcancel', onTouchEnd)
      boundScroller = null
    }
    if (io !== null) {
      io.disconnect()
      io = null
    }
    if (checkTimer !== null) {
      clearTimeout(checkTimer)
      checkTimer = null
    }
    isTouching = false
  }

  return {
    name: 'history-scroll',
    scopes: ['*'],
    ensure(): void {
      if (!getConfig().autoLoadEarlier) {
        unbind()
        return
      }
      const scroller = findScroller()
      if (scroller !== null && scroller.isConnected) {
        bind(scroller)
        // 若 older 按钮刚挂载，更新 IO 观察对象
        if (io !== null) {
          const btn = findOlderButton()
          if (btn !== null && btn.parentElement !== null) {
            try {
              io.observe(btn.parentElement)
            } catch {
              /* 忽略 */
            }
          }
        }
      } else {
        unbind()
      }
    },
    dispose(): void {
      unbind()
    },
  }
}
