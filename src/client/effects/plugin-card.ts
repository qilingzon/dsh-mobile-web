/**
 * plugin-card — 在「设置 → 内置插件」注册 dsh-mobile-web-pro 配置页签（settings.plugins.tab）。
 * 命名空间若只注册 schema 而没有页签，可配置 tab 不会渲染任何东西；
 * DSH >= 0.1.7：本模块按 settings.plugins.tab 契约注册页签组件（id = 命名空间）。
 * 全链路形状防御 + try/catch：任何异常不影响插件 entry 加载。
 */

import { resolveSettingsValue, setConfig } from '../config.ts'

interface Reactish {
  createElement(type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): unknown
  useState<T>(init: T | (() => T)): [T, (v: T) => void]
  useEffect(fn: () => unknown, deps: unknown[]): void
  useRef<T>(init: T): { current: T }
}

interface ScopeLike {
  getSnapshot(): unknown
  set(field: string, value: unknown): Promise<unknown> | unknown
  subscribe(listener: () => void): () => void
}

interface SlotsFace {
  inject(name: string, factory: () => unknown): unknown
  register(options: Record<string, unknown>, component: unknown): unknown
}

/** DSH >= 0.1.7：客户端设置服务为 configForms，get(namespace) 直接返回命名空间 scope。 */
interface ConfigFormsFace {
  get(ns: string): ScopeLike
}

interface CtxFace {
  slots?: unknown
  configForms?: unknown
  get?(name: string): unknown
  effect(fn: () => unknown, label?: string): unknown
}

const XC_NS = 'dsh-mobile-web-pro'

const FIELDS: Array<{ key: string; label: string; hint: string }> = [
  { key: 'swipeEnabled', label: '滑动打开抽屉', hint: '从屏幕左边缘右滑打开工作区抽屉' },
  { key: 'dshmarketNavFix', label: 'dshmarket 设置导航修复', hint: '窄屏保留设置导航，防止市场页死路' },
  { key: 'pwaEnabled', label: 'PWA 离线缓存', hint: '关闭后立即卸载缓存，页面走网络' },
  { key: 'drawerRefresh', label: '抽屉刷新按钮', hint: '侧栏底部刷新入口，PWA 无下拉刷新时的手动刷新（默认隐藏）' },
  { key: 'headerScroll', label: '页头横向滑动', hint: '窄屏下页头标题与 PTC/用量徽标保持单行，溢出部分左右滑动查看' },
  { key: 'turnRail', label: '轮次导航', hint: '对话右侧轮次刻度条：平时淡显，点击先预览轮次、再点同一刻度跳转' },
  { key: 'autoLoadEarlier', label: '平滑自动加载历史', hint: '在对话列表向上滑动至顶部附近时，平滑自动拉取更早历史，防跳动与动量保护' },
]

const rowClass = 'dsh-xc-srow'
const textClass = 'dsh-xc-srow-text'
const titleClass = 'dsh-xc-srow-title'
const hintClass = 'dsh-xc-srow-hint'
const swClass = 'dsh-xc-switch'

let cardInstalled = false
export function installXcPluginCard(ctx: unknown, react: Reactish): void {
  if (cardInstalled) return
  cardInstalled = true
  try {
    const face = ctx as CtxFace
    const slots = (face.slots ?? (typeof face.get === 'function' ? face.get('slots') : undefined)) as SlotsFace | undefined
    const scopeFace = (face.configForms ?? (typeof face.get === 'function' ? face.get('configForms') : undefined)) as ConfigFormsFace | undefined
    if (slots === undefined || typeof slots.inject !== 'function') return
    if (scopeFace === undefined || typeof scopeFace.get !== 'function') return
    let scope: ScopeLike | null = null
    try {
      scope = scopeFace.get(XC_NS) ?? (scopeFace as Record<string, unknown>).get?.('dsh-mobile-xc')
    } catch {
      return
    }
    const s = scope
    if (s === null || typeof s.getSnapshot !== 'function' || typeof s.set !== 'function') return

    const CardComponent = (props?: { view?: string }): unknown => {
      const view = props !== null && props !== undefined ? props.view : undefined
      const [open, setOpen] = react.useState<boolean>(false)
      const page = view === 'page'
      const expanded = page || open
      const read = (): Record<string, boolean> => {
        try {
          const v = resolveSettingsValue(s.getSnapshot())
          return v !== undefined && v !== null && typeof v === 'object' ? (v as Record<string, boolean>) : {}
        } catch {
          return {}
        }
      }
      const [values, setValues] = react.useState<Record<string, boolean>>(read)
      const dirtyRef = react.useRef<boolean>(false)
      react.useEffect(() => {
        let alive = true
        const sync = (): void => {
          if (!alive) return
          try {
            const v = read()
            if (v !== undefined && v !== null && Object.keys(v).length > 0) setValues(v)
          } catch {
            /* 忽略 */
          }
        }
        sync()
        const timer = window.setTimeout(sync, 400)
        const off =
          typeof s.subscribe === 'function'
            ? s.subscribe(() => {
                if (!dirtyRef.current) sync()
              })
            : null
        return () => {
          alive = false
          window.clearTimeout(timer)
          if (off !== null) {
            try {
              off()
            } catch {
              /* 忽略 */
            }
          }
        }
      }, [])

      const toggle = (field: string): void => {
        dirtyRef.current = true
        const currentVal = values[field] ?? true
        const nextVal = !currentVal
        setValues((prev) => ({ ...prev, [field]: nextVal }))
        try {
          setConfig({ [field]: nextVal })
        } catch {
          /* 忽略 */
        }
        try {
          const res = s.set(field, nextVal)
          if (res !== null && typeof res === 'object' && 'catch' in res && typeof (res as Promise<unknown>).catch === 'function') {
            ;(res as Promise<unknown>).catch(() => {})
          }
        } catch {
          /* 忽略 */
        }
      }

      const rows = FIELDS.map(({ key, label, hint }) => {
        const checked = values[key] ?? true
        return react.createElement(
          'div',
          {
            key,
            className: rowClass,
            onClick: () => toggle(key),
          },
          react.createElement(
            'div',
            { className: textClass },
            react.createElement('span', { className: titleClass }, label),
            react.createElement('span', { className: hintClass }, hint),
          ),
          react.createElement(
            'div',
            {
              className: swClass + (checked ? ' on' : ''),
              role: 'switch',
              'aria-checked': checked ? 'true' : 'false',
              'aria-label': label,
            },
            react.createElement('span', { className: 'dsh-xc-switch-thumb' }),
          ),
        )
      })

      if (page) {
        return react.createElement(
          'div',
          { className: 'dsh-xc-page' },
          react.createElement('h3', { className: 'dsh-xc-pagesec' }, '移动端旗舰特性 (Pro)'),
          ...rows,
        )
      }

      return react.createElement(
        'div',
        { className: 'YyYd_a_card' },
        react.createElement(
          'button',
          {
            type: 'button',
            className: 'YyYd_a_head',
            'aria-expanded': open ? 'true' : 'false',
            'aria-label': (open ? 'Collapse' : 'Expand') + ': 移动端适配 (Pro)',
            onClick: () => setOpen(!open),
          },
          react.createElement(
            'span',
            { className: 'YyYd_a_headText' },
            react.createElement('span', { className: 'YyYd_a_name' }, '移动端适配 (Pro)'),
            react.createElement('span', { className: 'YyYd_a_description' }, '旗舰移动端选项：滑动抽屉 / 市场兼容 / 刷新按钮 / PWA / 页头滑动 / 轮次导航 / 平滑自动加载历史'),
          ),
          react.createElement(
            'svg',
            {
              className: 'YyYd_a_chevron' + (open ? ' YyYd_a_chevronOpen' : ''),
              width: '14',
              height: '14',
              viewBox: '0 0 16 16',
              fill: 'none',
              'aria-hidden': 'true',
            },
            react.createElement('path', { d: 'M3 6L8 11L13 6', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' }),
          ),
        ),
        open
          ? react.createElement('div', { className: 'YyYd_a_body' }, ...rows)
          : null,
      )
    }

    face.effect(() => {
      const styleTag = document.createElement('style')
      styleTag.dataset.pluginCss = '@dsh-mobile-web-pro/card'
      styleTag.textContent = [
        '.dsh-xc-srow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--dsw-alias-border-l1,#2a3342);cursor:pointer}',
        '.dsh-xc-srow:first-child{border-top:none}',
        '.dsh-xc-srow-text{display:flex;flex-direction:column;gap:2px;min-width:0;padding-right:8px}',
        '.dsh-xc-srow-title{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#e2e8f0);font-weight:500}',
        '.dsh-xc-srow-hint{font-size:12px;line-height:16px;color:var(--dsw-alias-label-caption,#94a3b8)}',
        '.dsh-xc-switch{position:relative;width:40px;height:24px;flex:none;border-radius:12px;background:var(--dsw-alias-border-l2,#3b4557);transition:background .18s var(--ds-ease-in-out,ease)}',
        '.dsh-xc-switch.on{background:var(--dsw-alias-button-info-fill,#3b82f6)}',
        '.dsh-xc-switch input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}',
        '.dsh-xc-switch-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .18s var(--ds-ease-in-out,ease);pointer-events:none}',
        '.dsh-xc-switch.on .dsh-xc-switch-thumb{transform:translateX(16px)}',
        '.dsh-xc-pagesec{margin:0 0 8px;font-size:14px;line-height:20px;font-weight:500;color:var(--dsw-alias-label-primary,#e2e8f0)}'
      ].join('')
      document.head.appendChild(styleTag)
      
      const remove = slots.inject('plugins.bundle.config', function* () {
        yield slots.register(
          {
            name: 'plugins.bundle.config',
            key: XC_NS,
            order: 25,
          },
          CardComponent,
        )
      })
      return () => {
        styleTag.remove()
        if (remove !== undefined && remove !== null && typeof remove === 'function') {
          try {
            ;(remove as () => void)()
          } catch {
            /* 忽略 */
          }
        }
      }
    }, 'dsh-mobile-web-pro: plugin config card')
  } catch {
    /* 任何异常都不阻断插件加载 */
  }
}
