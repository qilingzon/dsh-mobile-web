/**
 * compat — 第三方兼容行为（M3）：
 *  - createMarketNavTask：检测 dshmarket 对话框挂载，按 COMPAT.dshmarketNavFix
 *    在 <html> 上打 data-xc-market-fix，CSS 据此镜像反制 nav 隐藏死路
 *    （dshmarket >=1.20 在 <=560px 隐藏 [role=dialog]:has([data-dsh-market-root]) > nav）。
 *  - 任务幂等；dispose 移除标记。
 */
import type { ReconcilerTask } from '../core/reconciler-core.ts'
import { getConfig } from '../config.ts'

export function createMarketNavTask(): ReconcilerTask {
  let present = false
  return {
    name: 'market-nav-fix',
    scopes: ['*'],
    ensure() {
      const now = document.querySelector('[data-dsh-market-root]') !== null
      if (now === present) return
      present = now
      if (getConfig().dshmarketNavFix) {
        document.documentElement.toggleAttribute('data-xc-market-fix', now)
      }
    },
    dispose() {
      present = false
      document.documentElement.removeAttribute('data-xc-market-fix')
    },
  }
}