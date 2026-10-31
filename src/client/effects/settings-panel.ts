/**
 * settings-panel — 移动端设置页头整理（M3 设置面板的补充整改）：
 *  - 隐藏「打开配置文件」按钮（移动端无用；与 workspace-compat 同款文本匹配，免哈希依赖）；
 *  - 把关闭按钮移入页头导航行、「设置」标题左侧（原位置在内容区头部右侧行内）；
 *  - 收起因此变空的 actions / header 行（54px 高度残留占位）。
 *
 * 复用 reconciler 幂等任务范式：scopes ['*']（任何子树变更都重跑），
 * 命中即收敛（无 DOM 写循环）；dispose 完整还原（样式清空 + 按钮归位）。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'

/** 打开配置文件按钮文本（zh/en；设置文档动作按钮，仅本地回环宿主存在）。 */
const OPEN_DOC_RE = /^(\u6253\u5f00\u914d\u7f6e\u6587\u4ef6|Open configuration file)$/

/** 求值状态钩子：设置对话框 = 含直系 nav 的 aria-modal 对话框（0.2.0 起为 body 级 portal；
 *  misc.css 设置族规则同集合，经 .VOzbGW_panel:has(> nav) 锚定）。 */
function findSettingsDialog(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  const dlg = document.querySelector('[role="dialog"][aria-modal="true"]')
  if (!(dlg instanceof HTMLElement)) return null
  if (dlg.querySelector(':scope > nav') === null) return null
  return dlg
}

/** 元素是否被样式隐藏（inline 或计算样式；SVG/无样式文本不在此列）。 */
function isHidden(el: HTMLElement): boolean {
  return el.style.display === 'none' || getComputedStyle(el).display === 'none'
}

/** 容器内是否还有「可见」的内容（递归：空的透明包装不算可见）。 */
function hasVisibleContent(el: Element): boolean {
  for (const child of el.children) {
    if (!(child instanceof HTMLElement)) {
      if ((child.textContent ?? '').trim() !== '') return true
      continue
    }
    if (isHidden(child)) continue
    if ((child.textContent ?? '').trim() !== '' && child.children.length === 0) return true
    if (hasVisibleContent(child)) return true
  }
  return false
}

export function createSettingsPanelTask(): ReconcilerTask {
  /** 隐藏掉的元素（恢复 display 用；含按钮与空的 actions/header 容器）。 */
  const hidden = new Set<HTMLElement>()
  /** 被移入 nav 的关闭按钮及其原位（parent/nextSibling，dispose 归位用）。 */
  let movedClose: HTMLElement | null = null
  let movedFrom: { parent: Node | null; next: Node | null } | null = null

  return {
    name: 'settings-panel-header',
    scopes: ['*'],
    ensure() {
      const dlg = findSettingsDialog()
      if (dlg === null) return
      const nav = dlg.querySelector(':scope > nav')
      if (!(nav instanceof HTMLElement)) return

      // 1) 隐藏「打开配置文件」按钮
      for (const btn of dlg.querySelectorAll('button')) {
        if (!(btn instanceof HTMLElement)) continue
        const text = (btn.textContent ?? '').trim()
        if (!OPEN_DOC_RE.test(text)) continue
        if (!hidden.has(btn)) hidden.add(btn)
        btn.style.display = 'none'
      }

      // 2) 关闭按钮移入 nav，插到「设置」标题左侧
      const close = dlg.querySelector('.VOzbGW_close')
      if (close instanceof HTMLElement) {
        const title = dlg.querySelector('.VOzbGW_navTitle')
        const anchor = title instanceof HTMLElement ? title : nav.firstElementChild
        const misplaced =
          close.parentElement !== nav ||
          (anchor !== null && close.nextElementSibling !== anchor && close !== anchor)
        if (misplaced) {
          if (close.parentElement !== nav) {
            movedFrom = { parent: close.parentNode, next: close.nextSibling }
          }
          nav.insertBefore(close, anchor)
          movedClose = close
        }
      }

      // 3) 「打开配置文件」隐藏后收掉空 actions 容器
      const actions = dlg.querySelector('.VOzbGW_actions')
      if (actions instanceof HTMLElement && !isHidden(actions) && !hasVisibleContent(actions)) {
        hidden.add(actions)
        actions.style.display = 'none'
      }

      // 4) header 行清空后收起（54px 高度占位）
      const header = dlg.querySelector('.VOzbGW_header')
      if (header instanceof HTMLElement && !isHidden(header) && !hasVisibleContent(header)) {
        hidden.add(header)
        header.style.display = 'none'
      }
    },
    dispose() {
      for (const el of hidden) {
        el.style.display = ''
      }
      hidden.clear()
      if (movedClose !== null && movedClose.isConnected && movedClose.parentElement !== null) {
        const back = movedFrom
        if (back !== null && back.parent !== null) {
          back.parent.insertBefore(movedClose, back.next)
        } else {
          // 原位父节点已不存在（对话框已卸载）：保守只放回原容器尾部
          const dialog = movedClose.closest('[role="dialog"]')
          const header = dialog === null ? null : dialog.querySelector('.VOzbGW_header')
          if (header !== null) header.appendChild(movedClose)
        }
      }
      movedClose = null
      movedFrom = null
    },
  }
}