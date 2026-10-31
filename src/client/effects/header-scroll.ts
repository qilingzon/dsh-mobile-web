/**
 * header-scroll — M6 页头标题簇横向可滑的**状态层**（样式见 styles/compat.css.ts 的 M6 段）。
 *
 * 只维护两个属性，不写任何 inline style：
 *  - html[data-xc-hscroll]                        功能开关（config.headerScroll）→ CSS 段总闸
 *  - .wSkVaW_titleCluster[data-xc-hscroll-more]   右端仍有未露出内容 → 只驱动右缘渐隐 mask
 *
 * 分工理由：overflow 常驻并由 CSS 声明。若让 JS 随溢出态翻转 overflow，会出现
 * "能滑 ↔ 不能滑"的裁切/滚动条跳动；mask 是唯一可以跟溢出态走的东西（不改变尺寸）。
 *
 * 复量时机三条，任一触发即 measure：
 *  1) reconciler ensure()：子树变更（徽标异步挂载、会话切换重渲染）；
 *  2) ResizeObserver：cluster 自身 = 视口宽度变化/旋转；first/last 子 = crumbs 变长、
 *     actions 组变宽（徽标数字 2.1M → 2.3M 这类**无 childList 变更**的宽度增长也在此捕获）；
 *  3) passive scroll：滑到最右撤渐隐，否则留一条洗不掉的灰边。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'
import { getConfig } from '../config.ts'

/** 标题簇 = 会话名 crumbs + 徽标组；哈希类已登记 selector-map（dsh 0.1.5-rc.2）。 */
const CLUSTER_SEL = '[data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_titleCluster'

/** 判定容差（px）：亚像素与 1px 边框抖动不算溢出。 */
const EPS = 2

/**
 * 纯函数：右边是否还有没露出来的内容（滑到最右 = false = 渐隐撤除）。
 * 与 CSS mask 的显示条件一一对应。
 */
export function hasMoreToReveal(scrollWidth: number, clientWidth: number, scrollLeft: number): boolean {
  return scrollWidth > clientWidth + EPS && scrollLeft + clientWidth < scrollWidth - EPS
}

export function createHeaderScrollTask(): ReconcilerTask {
  let cluster: HTMLElement | null = null
  let ro: ResizeObserver | null = null
  let lastTitle = ''

  const measure = (): void => {
    const el = cluster
    if (el === null || !el.isConnected) return
    el.toggleAttribute('data-xc-hscroll-more', hasMoreToReveal(el.scrollWidth, el.clientWidth, el.scrollLeft))
  }

  const onScroll = (): void => {
    measure()
  }

  /** 解除观察并还原元素级属性（html 级总闸由调用方负责）。 */
  const release = (): void => {
    if (ro !== null) {
      ro.disconnect()
      ro = null
    }
    if (cluster !== null) {
      cluster.removeEventListener('scroll', onScroll)
      cluster.removeAttribute('data-xc-hscroll-more')
    }
    cluster = null
    lastTitle = ''
  }

  const adopt = (el: HTMLElement): void => {
    release()
    cluster = el
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(measure)
      ro.observe(el)
      const first = el.firstElementChild
      const last = el.lastElementChild
      if (first !== null) ro.observe(first)
      if (last !== null) ro.observe(last)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
  }

  return {
    name: 'header-scroll',
    scopes: ['*'],
    ensure() {
      const html = document.documentElement
      if (!getConfig().headerScroll) {
        html.removeAttribute('data-xc-hscroll')
        release()
        return
      }
      html.setAttribute('data-xc-hscroll', '')
      const el = document.querySelector<HTMLElement>(CLUSTER_SEL)
      if (el === null) {
        // 非会话页 / 选择器漂移：退回 vendor 现状（canary 兜底路径）
        release()
        return
      }
      if (el !== cluster) adopt(el)
      // 会话切换复位到最左。结构锚取 cluster 首个子（vendor 的 crumbs nav），
      // 刻意不再多引一个 .wSkVaW_crumbCurrent 哈希类。
      const nav = el.firstElementChild
      const title = nav === null ? '' : nav.textContent ?? ''
      if (title !== lastTitle) {
        lastTitle = title
        if (el.scrollLeft !== 0) el.scrollLeft = 0
      }
      measure()
    },
    dispose() {
      document.documentElement.removeAttribute('data-xc-hscroll')
      release()
    },
  }
}
