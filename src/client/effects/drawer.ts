/**
 * drawer — 抽屉核心（DR1/DR4/DR10）：
 *  - findFrame / makeSidebarToggle：定位与安全的开合入口（layout 服务，缺失降级告警）；
 *  - createFrameMarkerTask：frame 标记 + 角色标注（drawer/details）+ 状态桥
 *    （vendor 的 data-sidebar-collapsed / data-details-collapsed -> 插件自有 data-xc-*；
 *    0.1.5 起右列属性更名 data-rightbar-collapsed，双识别兼容）；
 *  - createDrawerChromeTask：汉堡 + 遮罩两个注入节点（固定/绝对定位，脱离 grid 流）；
 *  - installOverlayInteractions：Escape（让位 [aria-modal]）+ 点外关闭 +
 *    treeitem 导航自动关（触屏走 pointerup 平行路径 + 抑制合成 click）。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'
import type { EffectHost } from '../breakpoints.ts'
import { installMobileEffect } from '../breakpoints.ts'
import { getConfig } from '../config.ts'

/** 查找 AppFrame：data-shell-overlay 的直接父元素。 */
export function findFrame(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  const overlay = document.querySelector('[data-shell-overlay]')
  return overlay === null ? null : (overlay.parentElement as HTMLElement)
}

/** layout 服务的最小结构面。 */
export interface LayoutFace {
  toggleSidebar(): void
}

/** 安全开合入口：layout 缺失时提示一次并降级（纯 CSS 展示）。 */
export function makeSidebarToggle(ctx: { get(name: string): unknown }): () => void {
  let warned = false
  return () => {
    const layout = ctx.get('layout') as LayoutFace | null | undefined
    if (layout !== null && layout !== undefined && typeof layout.toggleSidebar === 'function') {
      layout.toggleSidebar()
    } else if (!warned) {
      warned = true
      console.warn('[dsh-mobile-xc] layout 服务缺失：抽屉开合已降级（仅 CSS 展示，点击失效）')
    }
  }
}

/** 右列是否展开：0.1.5 起 vendor 用 data-rightbar-collapsed（旧名 data-details-collapsed），双识别。
 *  0.1.5 右栏全屏态（data-rightbar-fullscreen，<768px 打开右侧栏自动进入）视为展开：
 *  面板此时 fixed 盖满视口，汉堡应让位（CSS 侧已解除 details 列 transform 陷阱）。 */
function detailsOpen(f: HTMLElement): boolean {
  if (f.hasAttribute('data-rightbar-fullscreen')) return true
  return !f.hasAttribute('data-details-collapsed') && !f.hasAttribute('data-rightbar-collapsed')
}

/** 右列元素：新 vendor 有 [data-rightbar-col] 语义锚；旧 vendor 回退第 3 个直系子元素。 */
function findDetailsCol(f: HTMLElement): Element | null {
  const anchored = f.querySelector(':scope > [data-rightbar-col]')
  if (anchored !== null) return anchored
  const byIndex = f.children[2]
  return byIndex === undefined ? null : byIndex
}

/**
 * frame-marker：AppFrame 标记 + 子角色标注 + 状态桥。
 * scopes ['*']：每轮 flush 幂等重写（同值 setAttribute 不产生 mutation，不会自循环）。
 */
export function createFrameMarkerTask(): ReconcilerTask {
  let frame: HTMLElement | null = null
  return {
    name: 'frame-marker',
    scopes: ['*'],
    ensure() {
      const f = findFrame()
      frame = f
      if (f === null) return
      f.setAttribute('data-mobile-nav', 'frame')
      const drawer = f.firstElementChild
      if (drawer !== null) drawer.setAttribute('data-mobile-nav', 'drawer')
      const overlay = f.querySelector(':scope > [data-shell-overlay]')
      const details = findDetailsCol(f)
      if (details !== null && details !== overlay) {
        details.setAttribute('data-mobile-nav', 'details')
      }
      // 状态桥：镜像 vendor 开合属性（CSS/遮罩只认插件自有标记）
      f.toggleAttribute('data-xc-drawer', !f.hasAttribute('data-sidebar-collapsed'))
      f.toggleAttribute('data-xc-details', detailsOpen(f))
    },
    dispose() {
      if (frame === null) return
      const f = frame
      frame = null
      f.removeAttribute('data-mobile-nav')
      f.removeAttribute('data-xc-drawer')
      f.removeAttribute('data-xc-details')
      const drawer = f.firstElementChild
      if (drawer !== null) drawer.removeAttribute('data-mobile-nav')
      const details = findDetailsCol(f)
      if (details !== null) details.removeAttribute('data-mobile-nav')
    },
  }
}

/** drawer-chrome：汉堡 + 遮罩 + 可配置刷新按钮（插件注入节点，卸载清理）。 */
export function createDrawerChromeTask(toggleSidebar: () => void): ReconcilerTask {
  let ham: HTMLButtonElement | null = null
  let scrim: HTMLDivElement | null = null
  let refresh: HTMLButtonElement | null = null
  let frame: HTMLElement | null = null
  const onHamClick = (event: MouseEvent): void => {
    event.stopPropagation()
    toggleSidebar()
  }
  const onScrimClick = (event: MouseEvent): void => {
    event.stopPropagation()
    toggleSidebar()
  }
  const onRefreshClick = (event: MouseEvent): void => {
    event.stopPropagation()
    window.location.reload()
  }
  return {
    name: 'drawer-chrome',
    scopes: ['*'],
    ensure() {
      const f = findFrame()
      frame = f
      if (f === null) return

      // 若页面上已存在孤儿 ham/scrim（例如重复执行或旧实例残余），先清洗复用
      if (ham === null || !ham.isConnected) {
        const existingHam = f.querySelector<HTMLButtonElement>('.dsh-xc-ham')
        if (existingHam !== null) {
          ham = existingHam
        } else {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'dsh-xc-ham'
          b.dataset.mobileNav = 'ham'
          b.setAttribute('aria-label', 'Toggle sidebar')
          b.textContent = '\u2261'
          b.addEventListener('click', onHamClick)
          f.appendChild(b)
          ham = b
        }
      }

      if (scrim === null || !scrim.isConnected) {
        const existingScrim = f.querySelector<HTMLDivElement>('.dsh-xc-scrim')
        if (existingScrim !== null) {
          scrim = existingScrim
        } else {
          const s = document.createElement('div')
          s.className = 'dsh-xc-scrim'
          s.dataset.mobileNav = 'scrim'
          s.setAttribute('aria-hidden', 'true')
          s.addEventListener('click', onScrimClick)
          f.appendChild(s)
          scrim = s
        }
      }
      // 刷新按钮由配置 drawerRefresh 控制（默认隐藏；设置开启后即插即显）
      if (getConfig().drawerRefresh) {
        if (refresh === null) {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'dsh-xc-refresh'
          b.dataset.mobileNav = 'refresh'
          b.setAttribute('aria-label', '\u5237\u65b0\u9875\u9762')
          b.textContent = '\u5237\u65b0'
          b.addEventListener('click', onRefreshClick)
          // 优先挂进 vendor 侧栏底部操作区；找不到则挂在抽屉尾（CSS 兜底布局）
          const footer = f.querySelector('[data-mobile-nav="drawer"] [class*="footerActions"], [data-mobile-nav="drawer"] [class*="footArea"]')
          if (footer !== null) footer.appendChild(b)
          else f.appendChild(b)
          refresh = b
        }
      } else if (refresh !== null) {
        refresh.removeEventListener('click', onRefreshClick)
        refresh.remove()
        refresh = null
      }
    },
    dispose() {
      if (ham !== null) {
        ham.removeEventListener('click', onHamClick)
        ham.remove()
        ham = null
      }
      if (scrim !== null) {
        scrim.removeEventListener('click', onScrimClick)
        scrim.remove()
        scrim = null
      }
      if (refresh !== null) {
        refresh.removeEventListener('click', onRefreshClick)
        refresh.remove()
        refresh = null
      }
      frame = null
    },
  }
}

/** 抽屉内导航类条目的最小集合（避免把第三方新增入口纳入硬编码清单）。 */
const NAV_SELECTOR = '[role="treeitem"], [class*="newSession"], [class*="searchResultRow"], [class*="panelRow"]'

/**
 * 交互层（installMobileEffect 窄屏装配）：
 *  - Escape 关抽屉，让位任何 [aria-modal="true"] 对话框；
 *  - 点抽屉外 / 抽屉内导航条目 -> 关抽屉（鼠标走 click；touch/pen 走 pointerup 平行路径，
 *    因为导航会卸载行节点，合成 click 可能落空；随后 600ms 内抑制合成 click 防双触发）。
 */
export function installOverlayInteractions(ctx: EffectHost, toggleSidebar: () => void): void {
  installMobileEffect(ctx, 'dsh-mobile-xc: overlay interactions', () => {
    const drawerOpen = (): boolean => {
      const f = findFrame()
      return f !== null && !f.hasAttribute('data-sidebar-collapsed')
    }
    const modalOpen = (): boolean =>
      typeof document !== 'undefined' && document.querySelector('[aria-modal="true"]') !== null
    const drawerEl = (): Element | null => {
      const f = findFrame()
      return f === null ? null : f.firstElementChild
    }
    const isNavTarget = (target: Element): boolean => {
      const btn = target.closest('button')
      // 如果点在普通按钮上（如折叠按钮、菜单按钮等），不是页面导航；
      // 但如果是新建会话按钮或面板行按钮，属于导航目标
      if (btn !== null && !btn.matches('[class*="newSession"], [class*="panelRow"]')) return false
      const row = target.closest(NAV_SELECTOR)
      if (row === null) return false
      // 可展开节点（工作区/文件夹，vendor 以 aria-expanded 标记）→ 不是导航：不自动关抽屉，让用户展开
      if (row.hasAttribute('aria-expanded')) return false
      return true
    }

    /** 导航（打开会话）后的统一收抽屉：延迟 320ms，确认仍在打开态则收回。
     *  延迟让 vendor 的合成 click 先完成导航（同步收会卸载行节点导致会话打不开）；
     *  无 crumb 依赖——任何一次生效的会话点击都会收。 */
    const scheduleNavClose = (): void => {
      const f = findFrame()
      window.setTimeout(() => {
        if (f !== null && !f.hasAttribute('data-sidebar-collapsed')) toggleSidebar()
      }, 320)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      if (modalOpen()) return
      if (document.querySelector('[role="menu"], [role="dialog"]') !== null) return
      if (drawerOpen()) toggleSidebar()
    }

    /**
     * 只依赖「真实 click」收抽屉（对治真机首击 click 被取消时 pointerup 抢先关抽屉）：
     * - 首击（click 可能被浏览器取消）-> 不关抽屉，停留在 vendor 的选中态，等用户的稳定第二击；
     * - 第二击 click 生效 -> 打开会话 + 延迟收抽屉（工作区行同理，行为对齐）。
     */
    const onClick = (event: MouseEvent): void => {
      if (modalOpen()) return
      if (!drawerOpen()) return
      const target = event.target
      if (!(target instanceof Element)) return
      const drawer = drawerEl()
      if (drawer === null) return
      if (target.closest('[data-mobile-nav="ham"], [data-mobile-nav="scrim"]') !== null) return
      // 菜单/对话框（含 portal 到 body 的分组/排序等）内的点击不视为「点抽屉外」——不关抽屉
      if (target.closest('[role="menu"], [role="dialog"], [role="menuitem"]') !== null) return
      if (drawer.contains(target)) {
        if (isNavTarget(target)) scheduleNavClose()
      } else {
        toggleSidebar()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('click', onClick, true)
    }
  })
}