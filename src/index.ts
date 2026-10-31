/**
 * dsh-mobile-web-pro — Host half（M5：PWA 面）。
 * 经 webServer 精确路由提供，不改任何 vendor 文件：
 *  /sw.js（no-cache，版本更新即时生效）、/manifest.webmanifest（遮蔽 dist 自带那份）、
 *  /pwa/icon-{192,512,180}.png（官方黑鲸鱼栅格化，immutable 缓存）、tapIndex 注入 SW 注册脚本。
 */
import type { Context } from '@deepseek-ai/cordis'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { HEAD_EXTRA, MANIFEST_JSON, SW_SOURCE } from './pwa.ts'
import z from '@deepseek-ai/schemastery'

export const name = 'dsh-mobile-web-pro'
export const inject = ['webServer'] as const

const ICON_SIZES = ['192', '512', '180'] as const

/**
 * 插件配置命名空间（设置 -> 插件 -> dsh-mobile-web-pro 配置卡）。
 * DSH >= 0.1.7 起，设置命名空间 id 恒等于「profile 条目 id」，而条目 id 由本插件
 * bundle 补丁 cordis.patch.yml 的 `insert[].id` 决定——两者必须一致。
 */
export const XC_SETTINGS_NS = 'dsh-mobile-web-pro'

/**
 * 给字段挂 volatile 标记：运行时经 schemastery `.extra()` 写入 `meta.volatile = true`。
 */
function markVolatile<S>(schema: S): S {
  return (schema as { extra(key: string, value: unknown): unknown }).extra('volatile', true) as S
}

/**
 * 移动端配置 schema：滑动开抽屉 / dshmarket 兼容修复 / PWA / 抽屉刷新按钮 / 页头横向滑动 / 轮次导航 / 平滑自动加载更早历史。
 */
export const XcSettings = z.object({
  swipeEnabled: markVolatile(z.boolean().default(true)),
  dshmarketNavFix: markVolatile(z.boolean().default(true)),
  pwaEnabled: markVolatile(z.boolean().default(true)),
  drawerRefresh: markVolatile(z.boolean().default(false)),
  headerScroll: markVolatile(z.boolean().default(true)),
  turnRail: markVolatile(z.boolean().default(true)),
  autoLoadEarlier: markVolatile(z.boolean().default(true)),
})

export const Config = XcSettings

interface ResFace {
  writeHead(code: number, headers?: Record<string, string>): void
  end(body?: string | Buffer): void
}

interface WsFace {
  register(options: {
    kind: 'exact'
    path: string
    handler: (req: unknown, res: ResFace) => void
  }): void
  tapIndex(fn: (html: string) => string): void
}

/** 以 effect 生命周期注册路由（回调恒返回 disposer，满足 cordis SyncEffect）。 */
const route = (effect: Context['effect'], label: string, fn: () => void): void => {
  effect(() => {
    fn()
    return () => {}
  }, label)
}

const readIcon = (size: string) =>
  readFile(fileURLToPath(new URL('../assets/pwa/icon-' + size + '.png', import.meta.url)))

export function apply(ctx: Context): void {
  const ws = (ctx as unknown as { webServer?: WsFace }).webServer
  if (ws === undefined) return
  const effect = ctx.effect.bind(ctx)

  route(effect, 'dsh-mobile-web-pro: /sw.js', () => ws.register({
    kind: 'exact',
    path: '/sw.js',
    handler: (_req: unknown, res: ResFace) => {
      res.writeHead(200, {
        'content-type': 'text/javascript; charset=utf-8',
        'cache-control': 'no-cache',
      })
      res.end(SW_SOURCE)
    },
  }))

  route(effect, 'dsh-mobile-web-pro: /manifest.webmanifest', () => ws.register({
    kind: 'exact',
    path: '/manifest.webmanifest',
    handler: (_req: unknown, res: ResFace) => {
      res.writeHead(200, { 'content-type': 'application/manifest+json' })
      res.end(MANIFEST_JSON)
    },
  }))

  for (const size of ICON_SIZES) {
    route(effect, 'dsh-mobile-web-pro: /pwa/icon-' + size + '.png', () => ws.register({
      kind: 'exact',
      path: '/pwa/icon-' + size + '.png',
      handler: async (_req: unknown, res: ResFace) => {
        try {
          const body = await readIcon(size)
          res.writeHead(200, {
            'content-type': 'image/png',
            'cache-control': 'public, max-age=31536000, immutable',
          })
          res.end(body)
        } catch {
          res.writeHead(404)
          res.end()
        }
      },
    }))
  }

  route(effect, 'dsh-mobile-web-pro: pwa index tap', () => ws.tapIndex((html: string) => {
    if (html.includes('data-dsh-xc-pwa')) return html
    if (!html.includes('</head>')) return html + HEAD_EXTRA
    return html.replace('</head>', HEAD_EXTRA + '</head>')
  }))
}
