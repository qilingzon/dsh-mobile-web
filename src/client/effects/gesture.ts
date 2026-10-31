/**
 * gesture — M4 手势层：从左边缘右滑打开抽屉，左滑关闭。
 *
 * 原则（odefined 教科书做法）：全 passive、永不 preventDefault、方向锁、
 * 跳过表单控件 / 横向可滚动区（pre/table）、让位屏幕边缘（系统返回手势）。
 */
import type { EffectHost } from '../breakpoints.ts'
import { installMobileEffect } from '../breakpoints.ts'
import { getConfig } from '../config.ts'

const EDGE_IGNORE_PX = 16
const SWIPE_THRESHOLD_PX = 64

interface DragState {
  startX: number
  startY: number
  fired: boolean
  pointer: number
  open: boolean
}

export function installMobileGesture(ctx: EffectHost, toggleSidebar: () => void): void {
  installMobileEffect(ctx, 'dsh-mobile-xc: gesture', () => {
    let drag: DragState | null = null

    const modalOpen = (): boolean => document.querySelector('[aria-modal="true"]') !== null
    const drawerOpen = (): boolean => {
      const f = document.querySelector('[data-shell-overlay]')?.parentElement
      return f !== null && f !== undefined && !f.hasAttribute('data-sidebar-collapsed')
    }

    const isHScrollable = (el: Element): boolean => {
      let n: Element | null = el
      while (n !== null && n !== document.body) {
        if (n.scrollWidth > n.clientWidth + 2) {
          const ox = getComputedStyle(n).overflowX
          if (ox === 'auto' || ox === 'scroll') return true
        }
        n = n.parentElement
      }
      return false
    }
    const shouldSkip = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return true
      if (target.closest('textarea, input, select, button, [contenteditable], [data-mobile-nav="ham"]') !== null) {
        return true
      }
      return isHScrollable(target)
    }

    const onDown = (event: PointerEvent): void => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
      if (!event.isPrimary) return
      if (modalOpen()) return
      if (event.clientX < EDGE_IGNORE_PX) return
      if (shouldSkip(event.target)) return
      drag = {
        startX: event.clientX,
        startY: event.clientY,
        fired: false,
        pointer: event.pointerId,
        open: drawerOpen(),
      }
    }

    const onMove = (event: PointerEvent): void => {
      const d = drag
      if (d === null || d.pointer !== event.pointerId) return
      const dx = event.clientX - d.startX
      const dy = event.clientY - d.startY
      // 还没达到最小移动阈值
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return
      // 垂直滚动意图，交给原生
      if (Math.abs(dy) > Math.abs(dx)) {
        drag = null
        return
      }
      if (d.fired) return
      // 滑动开关关闭时不触发手势
      if (!getConfig().swipeEnabled) return
      // 等待滑动阈值
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
      // 关闭中向右滑开、打开中向左滑关
      const swipingRight = dx > 0
      if (!d.open && swipingRight) toggleSidebar()
      else if (d.open && !swipingRight) toggleSidebar()
      d.fired = true
    }

    const onUp = (event: PointerEvent): void => {
      if (drag === null || drag.pointer !== event.pointerId) return
      drag = null
    }

    const onCancel = (event: PointerEvent): void => {
      if (drag === null || drag.pointer !== event.pointerId) return
      drag = null
    }

    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('pointercancel', onCancel, true)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onUp, true)
      window.removeEventListener('pointercancel', onCancel, true)
    }
  })
}
