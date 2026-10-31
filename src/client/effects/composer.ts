/**
 * composer — M2 高度 FLIP：只在 focus/blur 状态切换时动画卡片高度，
 * 打字增长即时（CSS 不含 height transition，避免逐键动画）。
 * 手法：ResizeObserver 跟踪高度；focusin/focusout 置为"动画帧"标记，
 * 下一 RO tick 用 FLIP（锁旧高 -> 过渡到新高 -> 清理内联）。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'

const CARD_SEL = '.uV2eYG_card'
const EASE = 'height .32s cubic-bezier(.32, .72, .24, 1), max-width .32s cubic-bezier(.32, .72, .24, 1)'

const NOOP = (): void => {}

/**
 * 发送后自动收起键盘（用户需求）：
 * - Enter（非 Shift、非 IME 组字确认）或点击发送键 -> 220ms 后 blur composer 输入；
 * - 若届时仍有菜单/对话框打开，或有未发出的内容（发送未成功），则跳过收起。
 */
export function installComposerAutoCollapse(): () => void {
  if (typeof document === 'undefined') return NOOP
  const isComposerEl = (el: Element | null): boolean =>
    el !== null && el.closest('[data-slot^="conversation.composer"], [data-composer-seat]') !== null
  const scheduleBlur = (): void => {
    window.setTimeout(() => {
      if (document.querySelector('[role="menu"], [role="dialog"]') !== null) return
      const active = document.activeElement
      if (!(active instanceof HTMLElement) || !isComposerEl(active)) return
      const input = active as HTMLTextAreaElement
      if (typeof input.value === 'string' && input.value.trim() !== '') return
      active.blur()
    }, 220)
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
    if (!isComposerEl(event.target as Element | null)) return
    scheduleBlur()
  }
  const onClick = (event: MouseEvent): void => {
    const target = event.target
    if (target instanceof Element && target.closest('.uV2eYG_primary') !== null) scheduleBlur()
  }
  document.addEventListener('keydown', onKeyDown, true)
  document.addEventListener('click', onClick, true)
  return () => {
    document.removeEventListener('keydown', onKeyDown, true)
    document.removeEventListener('click', onClick, true)
  }
}

export function createComposerHeightTask(): ReconcilerTask {
  let card: HTMLElement | null = null
  let ro: ResizeObserver | null = null
  let busy = false
  let animateNext = false
  let prevH = 0

  const flipTo = (targetH: number): void => {
    const el = card
    if (el === null) return
    const cur = el.getBoundingClientRect().height
    busy = true
    el.style.transition = 'none'
    el.style.height = cur + 'px'
    // 强制 reflow 使锁高生效
    void el.offsetHeight
    el.style.transition = EASE
    el.style.height = targetH + 'px'
    window.setTimeout(() => {
      if (el.isConnected) {
        el.style.height = ''
        el.style.transition = ''
      }
      busy = false
      prevH = el.getBoundingClientRect().height
    }, 400)
  }

  return {
    name: 'composer-height',
    scopes: ['class', '*'],
    ensure() {
      const el = document.querySelector<HTMLElement>(CARD_SEL)
      if (el === card && card !== null) return
      if (ro !== null && card !== null && card !== el) {
        ro.disconnect()
        ro = null
      }
      card = el
      if (card === null) return
      prevH = card.getBoundingClientRect().height
      const onFocus = (): void => {
        animateNext = true
      }
      card.addEventListener('focusin', onFocus)
      card.addEventListener('focusout', onFocus)
      ro = new ResizeObserver(() => {
        if (card === null || !card.isConnected) return
        const cur = card.getBoundingClientRect().height
        if (Math.abs(cur - prevH) < 1) return
        if (animateNext && !busy) {
          animateNext = false
          flipTo(cur)
        } else if (!busy) {
          prevH = cur
        }
      })
      ro.observe(card)
    },
    dispose() {
      ro?.disconnect()
      ro = null
      if (card !== null) {
        card.style.height = ''
        card.style.transition = ''
        card = null
      }
    },
  }
}