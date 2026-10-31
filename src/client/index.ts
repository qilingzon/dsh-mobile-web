/**
 * dsh-mobile-web-pro — Client half 入口（Pro 旗舰增强版）。
 *
 * 结构：
 *  - PWA 关闭标记与自动更新
 *  - 样式注入与 CSS 隔离（含会话触屏保底、Markdown 表格自适应横滑、长会话渲染加速）
 *  - canary 失配自检
 *  - reconciler 调度生命周期（drawer / composer / compat / header-scroll / history-scroll 平滑翻页）
 *  - 交互层（Escape / 点外 / 导航自动关 / 轮次两段式预览）
 *  - 手势层（从左边缘滑动开抽屉）
 *  - phone-chrome + focus-guard + 软键盘高度适配
 *  - recover 离线自愈胶囊
 *  - 设置卡片配置
 */
import { MOBILE_CSS } from './styles/index.ts'
import { getConfig, setConfig, onConfigChange, resolveSettingsValue } from './config.ts'
import type { XcConfig } from './config.ts'
import { installMobileEffect, MOBILE_QUERY } from './breakpoints.ts'
import { checkHashedSelectors, checkStructuralAnchors, formatCanaryReport } from './core/selector-map.ts'
import { createReconcilerCore } from './core/reconciler-core.ts'
import { installDebugBadge } from './effects/debug.ts'
import { installOverlayInteractions, makeSidebarToggle } from './effects/drawer.ts'
import { installMobileGesture } from './effects/gesture.ts'
import { installRailPreviewTap } from './effects/rail-preview.ts'
import { registerDrawerTasks, registerComposerTasks, registerCompatTasks } from './effects/tasks.ts'
import { installFocusGuard } from './effects/focus-guard.ts'
import { installXcPluginCard } from './effects/plugin-card.ts'
import { installPhoneChrome } from './effects/phone-chrome.ts'
import { installComposerAutoCollapse } from './effects/composer.ts'
import { installKeyboardInset } from './effects/keyboard.ts'
import { installRecoverEffect } from './effects/recover.ts'

interface ClientContext {
  effect<T>(fn: () => T | (() => void) | undefined, label?: string): void
  get(name: string): unknown
}

declare global {
  interface Window {
    __ModuleLoader__: {
      load(options: {
        id: string
        factory: (require: (spec: string) => unknown) => Record<string, unknown>
      }): void
    }
  }
}

const factory = (require: (spec: string) => unknown): Record<string, unknown> => {
  const module: { exports: Record<string, unknown> } = { exports: {} }
  const exports = module.exports
  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
  const react = require('react') as typeof import('react')

  const disablePwa = (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dsh-mobile-web-pro.pwa', 'off')
      localStorage.setItem('dsh-mobile-xc.pwa', 'off')
    }
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister()
      })
    }
  }
  const enablePwa = (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dsh-mobile-web-pro.pwa')
      localStorage.removeItem('dsh-mobile-xc.pwa')
    }
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {})
    }
  }

  function apply(ctx: ClientContext): void {
    // 0) PWA 状态
    ctx.effect(() => {
      if (
        typeof localStorage !== 'undefined' &&
        (localStorage.getItem('dsh-mobile-web-pro.pwa') === 'off' || localStorage.getItem('dsh-mobile-xc.pwa') === 'off')
      ) {
        disablePwa()
      }
      return () => {}
    }, 'dsh-mobile-web-pro: pwa flag')

    // 0.1) 插件配置命名空间订阅（设置 -> 插件）
    ctx.effect(() => {
      try {
        const anyCtx = ctx as unknown as { configForms?: unknown; get?(name: string): unknown }
        const face = (anyCtx.configForms ?? (typeof anyCtx.get === 'function' ? anyCtx.get('configForms') : undefined)) as
          | {
              get(ns: string): {
                getSnapshot(): unknown
                subscribe(listener: () => void): () => void
              }
            }
          | undefined
        if (face === undefined || typeof face.get !== 'function') return () => {}
        const scope = face.get('dsh-mobile-web-pro') ?? face.get('dsh-mobile-xc')
        if (scope === undefined || scope === null) return () => {}
        const readOnce = (): unknown => {
          try {
            return typeof scope.getSnapshot === 'function' ? resolveSettingsValue(scope.getSnapshot()) : undefined
          } catch {
            return undefined
          }
        }
        const seeded = readOnce()
        if (seeded !== undefined && seeded !== null) {
          try {
            setConfig(seeded as Partial<XcConfig>)
          } catch {
            /* 忽略 */
          }
        }
        if (typeof scope.subscribe === 'function') {
          const off = scope.subscribe(() => {
            const next = readOnce()
            if (next !== undefined && next !== null) {
              try {
                setConfig(next as Partial<XcConfig>)
              } catch {
                /* 忽略 */
              }
            }
          })
          return () => {
            try {
              off()
            } catch {
              /* 忽略 */
            }
          }
        }
        return () => {}
      } catch {
        return () => {}
      }
    }, 'dsh-mobile-web-pro: settings namespace')

    // 0.2) 配置即时生效（PWA 开关）
    ctx.effect(() =>
      onConfigChange((cfg) => {
        try {
          if (cfg.pwaEnabled) enablePwa()
          else disablePwa()
        } catch {
          /* 忽略 */
        }
      }),
      'dsh-mobile-web-pro: pwa config reaction',
    )

    // 1) 样式注入（含所有 Pro 增强）
    ctx.effect(() => {
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-mobile-web-pro'
      tag.textContent = MOBILE_CSS
      document.head.appendChild(tag)
      return () => {
        tag.remove()
      }
    }, 'dsh-mobile-web-pro: styles')

    // 2) canary 失配自检
    ctx.effect(() => {
      const run = (): void => {
        const report = formatCanaryReport(checkStructuralAnchors(document), checkHashedSelectors(document))
        if (report !== null) console.warn('[dsh-mobile-web-pro] ' + report)
      }
      const raf = requestAnimationFrame(() => requestAnimationFrame(run))
      return () => {
        cancelAnimationFrame(raf)
      }
    }, 'dsh-mobile-web-pro: canary')

    // 3) reconciler 生命周期（任务注册：抽屉、composer、compat、历史平滑滚动等）
    const core = createReconcilerCore({
      requestFrame: (flush) => {
        let id = 0
        const run = (): void => {
          id = 0
          flush()
        }
        id = requestAnimationFrame(run)
        return () => {
          if (id !== 0) cancelAnimationFrame(id)
        }
      },
    })
    const toggleSidebar = makeSidebarToggle(ctx)
    registerDrawerTasks(core, toggleSidebar)
    registerComposerTasks(core)
    registerCompatTasks(core)

    ctx.effect(() =>
      onConfigChange(() => {
        try {
          core.note(['*'])
        } catch {
          /* 忽略 */
        }
      }),
      'dsh-mobile-web-pro: reconciler config reaction',
    )

    installMobileEffect(ctx, 'dsh-mobile-web-pro: reconciler', () => {
      const observer = new MutationObserver((records) => {
        const keys = new Set<string>()
        for (const record of records) {
          keys.add(
            record.type === 'attributes' && record.attributeName !== null ? record.attributeName : '*',
          )
        }
        core.note(keys)
      })
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'data-sidebar-collapsed', 'data-details-collapsed', 'data-rightbar-collapsed', 'data-rightbar-fullscreen'],
      })
      core.activate()
      return () => {
        observer.disconnect()
        core.deactivate()
      }
    })

    // 4) 交互层与手势
    installOverlayInteractions(ctx, toggleSidebar)
    installRailPreviewTap(ctx)
    installMobileGesture(ctx, toggleSidebar)

    // 5) 移动端基线与软键盘高度修正
    installMobileEffect(ctx, 'dsh-mobile-web-pro: phone chrome', () => installPhoneChrome())
    installMobileEffect(ctx, 'dsh-mobile-web-pro: focus guard', () => installFocusGuard())
    installMobileEffect(ctx, 'dsh-mobile-web-pro: composer auto-collapse', () => installComposerAutoCollapse())
    installMobileEffect(ctx, 'dsh-mobile-web-pro: keyboard inset', () => installKeyboardInset())

    // 5.1) 网络断开自愈微胶囊
    installMobileEffect(ctx, 'dsh-mobile-web-pro: recover banner', () => installRecoverEffect())

    // 6) 调试徽标
    ctx.effect(() =>
      installDebugBadge(() => {
        const structural = checkStructuralAnchors(document)
        const hashed = checkHashedSelectors(document)
        const narrow = window.matchMedia(MOBILE_QUERY).matches
        const frameShape = structural.frameShape
        return (
          'view=' + window.innerWidth + 'px' +
          ' mq=' + (narrow ? 'narrow' : 'wide') +
          ' shell=' + (structural.shellOverlay ? 'ok' : 'MISS') +
          ' rightbar=' + (structural.rightbarContract ? 'ok' : 'MISS') +
          ' frame=' + (frameShape && structural.shellOverlay ? 'ok' : 'MISS') +
          ' composer=' + (structural.composerSlot ? 'ok' : 'MISS') +
          ' hash=' + hashed.hits + '/' + hashed.declared
        )
      }),
      'dsh-mobile-web-pro: debug badge',
    )

    // 7) 设置卡片
    try {
      installXcPluginCard(ctx, react as unknown as { createElement(...a: unknown[]): unknown; useState<T>(i: T | (() => T)): [T, (v: T) => void]; useEffect(f: () => unknown, d: unknown[]): void; useRef<T>(i: T): { current: T } })
    } catch {
      /* 忽略 */
    }
  }

  exports.apply = apply
  exports.disablePwa = disablePwa
  exports.inject = ['slots', 'locale', 'configForms']
  return module.exports
}

// 注册主 ID 以及兼容 ID，确保任何引用方式都能被 Cordis ModuleLoader 成功装载
window.__ModuleLoader__.load({ id: 'dsh-mobile-web-pro', factory })
window.__ModuleLoader__.load({ id: 'dsh-mobile-web', factory })
