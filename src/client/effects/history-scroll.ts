/**
 * history-scroll.ts
 *
 * 彻底解决历史对话在顶部加载期间，用户快速向下滑动引发疯狂抖动的问题：
 *
 * 【成因机理】：
 * 1. 官方聊天流在 loadEarlier() 时会标记当前视口锚点（beginPaging），
 *    期望在几百条历史消息前插后，调用 preserve() 把 scrollTop += 前插高度，使读者阅读视角平滑无感知。
 * 2. 但是，一旦用户在加载中的几百毫秒内手指碰到屏幕（touchstart/wheel），
 *    官方 ChatViewport 的 onIntent 事件会直接执行 stopPreserving() 放弃锚定保护！
 * 3. 此时若用户正向下滑动（例如滑动了 +300px），突发插入了 +4000px 的历史消息，
 *    由于锚定被取消且容器 overflow-anchor 被官方误关，scrollTop 会在用户的滚动与 DOM 的巨变之间发生
 *    激烈冲突与反复跳变，导致严重视口抖动。
 *
 * 【解决方案】：
 * 插件安装「滚动锚定强化守卫（Scroll Anchor Guard）」：
 * 1. 当 older 按钮进入 disabled 加载态时，锁定当前锚点元素（首个在视口内的消息卡片）及其相对视口顶部的相对偏移；
 * 2. 使用 ResizeObserver / MutationObserver 监听内容流高度扩增与前插；
 * 3. 当历史节点插入且容器 scrollHeight 突增时，若官方 preserve 未执行或被用户划动手势取消，
 *    守卫通过微任务以 rAF 精准补齐因顶部前插产生的 deltaH，保持当前可视区域绝对平稳；
 * 4. 彻底消除疯狂抖动与上下拉扯感。
 */

import { getConfig } from '../config'
import type { ReconcilerTask } from '../core/reconciler-core'

const TOP_THRESHOLD_PX = 180
const COOLDOWN_MS = 2000
const OLDER_BTN_SEL = '[class*="_older"] button, [data-chat-flow] button'
const SCROLLER_SEL = '[class*="_scrollBody"], [data-conversation-scroll]'

export function createHistoryScrollTask(): ReconcilerTask {
  let boundScroller: HTMLElement | null = null
  let isTouching = false
  let lastTriggerTime = 0
  let checkTimer: number | null = null
  let lastScrollTop = 0

  // 滚动锚定强化守卫状态（基于绝对内容坐标系，杜绝用户滑动的相对位移误补偿）
  let isPagingActive = false
  let anchorEl: HTMLElement | null = null
  let anchorAbsoluteTop = 0
  let mo: MutationObserver | null = null

  const findScroller = (): HTMLElement | null => {
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')
    if (flow === null) return null
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

  /** 获取当前视口中最高的第一张可视消息卡片作为锚点，记录其在可滚动内容绝对坐标系中的位置 */
  const captureAnchor = (scroller: HTMLElement): void => {
    const scrollerRect = scroller.getBoundingClientRect()
    const cards = Array.from(scroller.querySelectorAll<HTMLElement>('[data-chat-flow-key]'))
    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      // 找到第一张在视口内或紧邻视口上方的基准卡片
      if (rect.bottom > scrollerRect.top) {
        anchorEl = card
        // 关键：在内容绝对坐标系下记录位置 = 相对视口顶部的相对偏移 + 当前 scroller.scrollTop
        anchorAbsoluteTop = (rect.top - scrollerRect.top) + scroller.scrollTop
        lastCompensatedScrollTop = scroller.scrollTop
        return
      }
    }
    anchorEl = null
  }

  /** 上次观察到的 scrollTop，用于区分是用户自己滚动还是系统/外部补偿 */
  let lastCompensatedScrollTop = 0

  /** 当历史消息插入导致顶部新增 DOM 节点时，平稳对齐锚点 */
  const reconcileAnchor = (): void => {
    if (!isPagingActive || boundScroller === null || anchorEl === null) return
    if (!anchorEl.isConnected) {
      // 锚点被替换或卸载，退出保护
      isPagingActive = false
      return
    }

    const scroller = boundScroller
    const scrollerRect = scroller.getBoundingClientRect()
    // 计算当前锚点在可滚动内容整体坐标系下的实际绝对位置
    const currentAbsoluteTop = (anchorEl.getBoundingClientRect().top - scrollerRect.top) + scroller.scrollTop
    // 真正的 DOM 插入前插总高度 = 当前绝对坐标 - 触发前锁定的基准绝对坐标
    const prependHeight = currentAbsoluteTop - anchorAbsoluteTop

    if (Math.abs(prependHeight) > 2) {
      // 检查官方 ChatViewport 或外部是否已经补偿过 scrollTop：
      // 官方如果调用了 preserve()，scroller.scrollTop 会自动增加 prependHeight
      // 如果用户在这个瞬间快速滑动，或者官方在用户手势下调用了 stopPreserving() 放弃了补偿，
      // 则未补偿的缺口 = prependHeight - (scroller.scrollTop - lastCompensatedScrollTop)
      const alreadyAdjusted = scroller.scrollTop - lastCompensatedScrollTop
      const uncompensatedGap = prependHeight - alreadyAdjusted

      if (Math.abs(uncompensatedGap) > 2) {
        // 精确补足官方放弃或尚未补偿的缺口，消除瞬间视觉跳动
        scroller.scrollTop += uncompensatedGap
      }

      // 同步基准点与最新状态，防止多次 DOM mutation 重复累加
      anchorAbsoluteTop = (anchorEl.getBoundingClientRect().top - scrollerRect.top) + scroller.scrollTop
      lastCompensatedScrollTop = scroller.scrollTop
    }
  }

  const startAnchorGuard = (scroller: HTMLElement): void => {
    if (isPagingActive) return
    isPagingActive = true
    captureAnchor(scroller)

    if (mo !== null) mo.disconnect()
    const flow = scroller.querySelector('[data-chat-flow]') ?? scroller
    mo = new MutationObserver(() => {
      // 历史卡片前插发生时，立即调和
      reconcileAnchor()
    })
    mo.observe(flow, { childList: true, subtree: false })
  }

  const stopAnchorGuard = (): void => {
    isPagingActive = false
    anchorEl = null
    if (mo !== null) {
      mo.disconnect()
      mo = null
    }
  }

  const maybeTrigger = (): void => {
    if (!getConfig().autoLoadEarlier) return
    const now = Date.now()
    if (now - lastTriggerTime < COOLDOWN_MS) return
    if (isTouching) return

    const btn = findOlderButton()
    if (btn === null || !btn.isConnected || btn.disabled) return

    const scroller = boundScroller ?? findScroller()
    if (scroller !== null && scroller.scrollTop > TOP_THRESHOLD_PX) return

    lastTriggerTime = now

    // 触发前启动强韧锚定守卫，防护期间用户向下滑动导致的官方 preserve 失效
    if (scroller !== null) {
      startAnchorGuard(scroller)
    }

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
    }, 250)
  }

  const onScroll = (): void => {
    const scroller = boundScroller
    if (scroller === null) return
    const currentTop = scroller.scrollTop
    const isScrollingUp = currentTop < lastScrollTop
    lastScrollTop = currentTop

    // 检查按钮状态：如果加载已经完成（或者按钮恢复启用/消失），结束锚定守卫
    const btn = findOlderButton()
    if (isPagingActive && (btn === null || !btn.disabled)) {
      stopAnchorGuard()
    }

    // 只有当用户确实在往上滑（接近顶部），且位于顶部阈值内，才触发计划检测
    if (currentTop <= TOP_THRESHOLD_PX && isScrollingUp) {
      scheduleCheck()
    }
  }

  const onTouchStart = (): void => {
    isTouching = true
  }

  const onTouchEnd = (): void => {
    isTouching = false
    window.setTimeout(() => {
      maybeTrigger()
    }, 80)
  }

  const onPointerDown = (e: Event): void => {
    // 监听用户点击 Load earlier 按钮的动作，确保即使是手动点击也能启动防抖锚定守卫
    const target = e.target as HTMLElement | null
    if (target && target.closest(OLDER_BTN_SEL)) {
      const scroller = boundScroller ?? findScroller()
      if (scroller !== null) {
        startAnchorGuard(scroller)
      }
    }
  }

  const bind = (scroller: HTMLElement): void => {
    if (boundScroller === scroller) return
    unbind()
    boundScroller = scroller
    scroller.addEventListener('scroll', onScroll, { passive: true })
    scroller.addEventListener('touchstart', onTouchStart, { passive: true })
    scroller.addEventListener('touchend', onTouchEnd, { passive: true })
    scroller.addEventListener('touchcancel', onTouchEnd, { passive: true })
    scroller.addEventListener('pointerdown', onPointerDown, { passive: true })
  }

  const unbind = (): void => {
    if (boundScroller !== null) {
      boundScroller.removeEventListener('scroll', onScroll)
      boundScroller.removeEventListener('touchstart', onTouchStart)
      boundScroller.removeEventListener('touchend', onTouchEnd)
      boundScroller.removeEventListener('touchcancel', onTouchEnd)
      boundScroller.removeEventListener('pointerdown', onPointerDown)
      boundScroller = null
    }
    stopAnchorGuard()
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
      } else {
        unbind()
      }
    },
    dispose(): void {
      unbind()
    },
  }
}
