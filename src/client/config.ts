/**
 * config — dsh-mobile-web-pro 可配置项（设置页「移动端」区块读写，localStorage 持久化）。
 * 默认值：滑动开抽屉开、dshmarket 反制开、PWA 开、页头横滑开、轮次刻度开、平滑自动加载更早历史开。
 */
export interface XcConfig {
  /** 滑动打开工作区抽屉（从左边缘右滑打开）。 */
  readonly swipeEnabled: boolean
  /** dshmarket >=1.20 在 <=560px 隐藏设置 nav 的死路反制。 */
  readonly dshmarketNavFix: boolean
  /** PWA Service Worker（关闭会立即卸载并跳过注册）。 */
  readonly pwaEnabled: boolean
  /** 工作区抽屉刷新按钮（PWA 无下拉刷新时的手动入口；默认隐藏）。 */
  readonly drawerRefresh: boolean
  /** 页头标题簇横向滑动（窄屏页头单行不换行，溢出内容靠滑）。 */
  readonly headerScroll: boolean
  /** 移动端轮次导航（对话右侧轮次刻度条：点击预览轮次、再点同一刻度跳转）。 */
  readonly turnRail: boolean
  /** 平滑自动加载更早历史（滑近顶部时平滑拉取，防跳动与动量保护）。 */
  readonly autoLoadEarlier: boolean
}

const KEY = 'dsh-mobile-web-pro.config'
const LEGACY_KEY = 'dsh-mobile-xc.config'
const DEFAULTS: XcConfig = {
  swipeEnabled: true,
  dshmarketNavFix: true,
  pwaEnabled: true,
  drawerRefresh: false,
  headerScroll: true,
  turnRail: true,
  autoLoadEarlier: true,
}

function load(): XcConfig {
  if (typeof localStorage === 'undefined') return { ...DEFAULTS }
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY)
    if (raw === null) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<XcConfig>
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

let current: XcConfig = load()
const listeners = new Set<(c: XcConfig) => void>()

/**
 * 设置服务返回的值可能是「描述符」（真实解析值在 value 子对象，
 * 顶层带 status/base/revision 等元数据键）；统一归一化为纯值对象。
 */
export function resolveSettingsValue(raw: unknown): unknown {
  if (raw !== null && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>
    if ('value' in rec && ('status' in rec || 'base' in rec || 'revision' in rec)) {
      return rec.value
    }
  }
  return raw
}

export function getConfig(): XcConfig {
  return current
}

export function setConfig(patch: Partial<XcConfig>): XcConfig {
  current = { ...current, ...patch }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(KEY, JSON.stringify(current))
    } catch {
      /* 存储不可用时仅内存生效 */
    }
  }
  for (const fn of listeners) {
    try {
      fn(current)
    } catch {
      /* 单个监听器异常不影响其余写入 */
    }
  }
  return current
}

export function onConfigChange(fn: (c: XcConfig) => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
