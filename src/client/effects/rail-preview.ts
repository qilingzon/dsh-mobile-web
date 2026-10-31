/**
 * rail-preview — 轮次导航 rail 移动端"点击出预览、再点击跳转"（两段式 tap）。
 *
 * vendor TurnNavigator（dsh-client-ui-chat）的 preview 浮层由两个途径驱动：
 *  - 桌面 hover：frame 的 onPointerMove → setPreviewTurn（触屏没有 hover，此路失效）；
 *  - mark 按钮 onFocus → setPreviewTurn（键盘/编程聚焦同样生效）。
 * 原样行为下移动端点击 rail 会在毫无预览的情况下直接跳转（点错即跳错，体验差）。
 *
 * 本层在窄屏（≤1023px）把 rail 点击改造成两段式：
 *   第一击：window 捕获阶段拦截 click（stopPropagation 阻断 vendor 的 onClick 跳转），
 *          换算命中位置的刻度 index，`focus({ preventScroll })` 对应 mark 按钮 →
 *          触发 vendor onFocus → preview 浮层（"第 N 轮"+摘要）显示，该刻度同时
 *          获得 markPreview 高亮 —— 点击即见轮次内容；
 *   第二击同一刻度：放行，vendor onClick 按原算法跳转该轮；
 *   点击 rail 外：解除武装（mark 失焦自动撤 preview，下次点击重新两段式）。
 *   index 换算与 vendor itemAtPointer 同源（TURN_SPACING=10px、RAIL_INSET=6px、
 *   scroller.scrollTop 代入），命中判定不会因 rail 内部滚动而偏斜。
 *
 * 桌面 ≥1024px 不装配（installMobileEffect 门禁），vendor hover 预览原样保留。
 * rail 缺失（非会话页 / vendor 漂移）时点击走 vendor 原逻辑，无功能损害。
 */
import type { EffectHost } from '../breakpoints.ts'
import { installMobileEffect } from '../breakpoints.ts'
import { getConfig } from '../config.ts'

/** vendor TurnNavigator 固定间距与内边距（与 itemAtPointer 同源）。 */
const TURN_SPACING_PX = 10
const RAIL_INSET_PX = 6
/** rail 相关哈希类（eGxaPq_slot 已登记 canary；frame/markPosition/scroller 同模块族）。 */
const FRAME_SELECTOR = '[class*="eGxaPq_frame"]'
const MARK_POSITION_SELECTOR = '[class*="eGxaPq_markPosition"]'
const SCROLLER_SELECTOR = '[class*="eGxaPq_scroller"]'

/** 与 vendor itemAtPointer 相同的命中换算：clientY → 刻度下标（clamp 到合法区间）。 */
function indexAtPoint(frame: HTMLElement, clientY: number): number | null {
  const scroller = frame.querySelector<HTMLElement>(SCROLLER_SELECTOR)
  const positions = frame.querySelectorAll<HTMLElement>(MARK_POSITION_SELECTOR)
  if (positions.length === 0) return null
  const scrollTop = scroller === null ? 0 : scroller.scrollTop
  const offset = clientY - frame.getBoundingClientRect().top + scrollTop - RAIL_INSET_PX
  return Math.max(0, Math.min(positions.length - 1, Math.round(offset / TURN_SPACING_PX)))
}

/** 聚焦刻度按钮触发 vendor onFocus 预览（preventScroll 避免页面跳动）。 */
function focusMarkAt(frame: HTMLElement, index: number): void {
  const positions = frame.querySelectorAll<HTMLElement>(MARK_POSITION_SELECTOR)
  const position = positions[index]
  if (position === undefined) return
  const button = position.querySelector<HTMLButtonElement>('button')
  button?.focus({ preventScroll: true })
}


/** html 级功能总闸属性：存在 = 轮次导航开启（config.turnRail 驱动，CSS 与 JS 均看它）。 */
export const TURN_RAIL_ATTR = 'data-xc-turn-rail'

/**
 * 轮次导航门控任务：随 reconciler 周期把配置状态投影到 html 属性。
 *  - turnRail=true  → <html data-xc-turn-rail>  → misc.css 的 rail 段生效、点击拦截生效；
 *  - turnRail=false → 属性摘除 → rail 恢复 vendor 原状（窄屏默认隐藏）。
 * 属性在非会话页 / 选择器漂移时同样摘除（保证不误伤桌面）。
 */
export function createTurnRailTask() {
  return {
    name: 'turn-rail',
    scopes: ['*'],
    ensure() {
      const html = document.documentElement
      if (!getConfig().turnRail || document.querySelector('[data-slot="conversation.chat"], [data-mobile-nav="frame"] [class*="eGxaPq_slot"]') === null) {
        html.removeAttribute(TURN_RAIL_ATTR)
        return
      }
      html.setAttribute(TURN_RAIL_ATTR, '')
    },
    dispose() {
      document.documentElement.removeAttribute(TURN_RAIL_ATTR)
    },
  }
}

export function installRailPreviewTap(ctx: EffectHost): void {
  installMobileEffect(ctx, 'dsh-mobile-xc: rail preview tap', () => {
    // 武装态：上次第一击命中的 frame + 刻度下标。第二击命中同一组才放行跳转。
    let armed: { frame: HTMLElement; index: number } | null = null

    const onClickCapture = (event: MouseEvent): void => {
      if (!document.documentElement.hasAttribute(TURN_RAIL_ATTR)) return
      const target = event.target as Element | null
      const frame = target === null ? null : target.closest<HTMLElement>(FRAME_SELECTOR)
      if (frame === null) {
        // 点击 rail 外：解除武装，并主动把聚焦在 rail 内的 mark 失焦（回收 preview 浮层）
        armed = null
        const active = document.activeElement
        if (active instanceof HTMLElement && active.closest(FRAME_SELECTOR) !== null) active.blur()
        return
      }
      const index = indexAtPoint(frame, event.clientY)
      if (index === null) return
      if (armed !== null && armed.frame === frame && armed.index === index) {
        // 第二击同一刻度：确认跳转，放行 vendor onClick；解除武装
        armed = null
        // 主动失焦触发 vendor onBlur → 预览浮层回收（跳转完成，不残留 tooltip）
        const active = document.activeElement
        if (active instanceof HTMLElement && active.closest(FRAME_SELECTOR) !== null) active.blur()
        return
      }
      // 第一击（或换刻度）：拦截跳转，聚焦 mark 显示预览
      armed = { frame, index }
      event.preventDefault()
      event.stopPropagation()
      focusMarkAt(frame, index)
    }

    window.addEventListener('click', onClickCapture, true)
    return () => {
      window.removeEventListener('click', onClickCapture, true)
      armed = null
    }
  })
}
