/**
 * workspace-compat — 移动端屏蔽「添加工作区」功能与入口（M6 用户需求）。
 *
 * 不依赖哈希类：工作区选择器菜单条目（ADD_WORKSPACE，图标 IconPlusOutline16）以
 * 文本 /^(添加工作区|Add workspace)/ 匹配（zh/en）；只在「有菜单打开 或 抽屉打开」时扫描，
 * 命中即 inline display:none（幂等；dispose 恢复）。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'

const RE = /^(\u6dfb\u52a0\u5de5\u4f5c\u533a|Add workspace)/

function collectRoots(): ParentNode[] {
  const roots: ParentNode[] = []
  const menu = document.querySelector('[role="menu"]')
  if (menu !== null) roots.push(menu)
  const overlay = document.querySelector('[data-shell-overlay]')
  const drawer = overlay === null ? null : (overlay.parentElement as Element | null)?.firstElementChild ?? null
  if (drawer !== null) roots.push(drawer)
  return roots
}

export function createHideAddWorkspaceTask(): ReconcilerTask {
  const hidden = new Set<HTMLElement>()
  return {
    name: 'hide-add-workspace',
    scopes: ['*'],
    ensure() {
      for (const root of collectRoots()) {
        const els = root.querySelectorAll('button, [role="menuitem"], [aria-label], [title]')
        for (const el of els) {
          if (!(el instanceof HTMLElement)) continue
          const text = (el.textContent ?? '').trim()
          const aria = el.getAttribute('aria-label') ?? ''
          const title = el.getAttribute('title') ?? ''
          if (!RE.test(text) && !RE.test(aria) && !RE.test(title)) continue
          // 命中的可能是内层元素：收口到最近的 button 外壳，保证整块入口消失
          const target = (el.closest('button') as HTMLElement | null) ?? el
          if (hidden.has(target)) continue
          hidden.add(target)
          target.style.display = 'none'
        }
      }
    },
    dispose() {
      for (const el of hidden) el.style.display = ''
      hidden.clear()
    },
  }
}