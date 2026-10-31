/**
 * tasks — 任务装配：把各里程碑 reconciler 任务注册进 core。
 * 返回 disposer（同环境插件重载时可重建）。
 *  - header-scroll：M6 页头标题簇横向可滑的属性层（开关 + 溢出态）。
 *  - history-scroll：Pro 平滑向上滚动自动拉取更早历史。
 */
import type { ReconcilerCore } from '../core/reconciler-core.ts'
import { createFrameMarkerTask, createDrawerChromeTask } from './drawer.ts'
import { createComposerHeightTask } from './composer.ts'
import { createMarketNavTask } from './compat.ts'
import { createHideAddWorkspaceTask } from './workspace-compat.ts'
import { createSettingsPanelTask } from './settings-panel.ts'
import { createHeaderScrollTask } from './header-scroll.ts'
import { createTurnRailTask } from './rail-preview.ts'
import { createHistoryScrollTask } from './history-scroll.ts'

export function registerDrawerTasks(core: ReconcilerCore, toggleSidebar: () => void): () => void {
  const removeMarker = core.register(createFrameMarkerTask())
  const removeChrome = core.register(createDrawerChromeTask(toggleSidebar))
  return () => {
    removeMarker()
    removeChrome()
  }
}

export function registerComposerTasks(core: ReconcilerCore): () => void {
  return core.register(createComposerHeightTask())
}

export function registerCompatTasks(core: ReconcilerCore): () => void {
  const removeMarket = core.register(createMarketNavTask())
  const removeHideAdd = core.register(createHideAddWorkspaceTask())
  const removeSettingsPanel = core.register(createSettingsPanelTask())
  const removeHeaderScroll = core.register(createHeaderScrollTask())
  const removeTurnRail = core.register(createTurnRailTask())
  const removeHistoryScroll = core.register(createHistoryScrollTask())
  return () => {
    removeMarket()
    removeHideAdd()
    removeSettingsPanel()
    removeHeaderScroll()
    removeTurnRail()
    removeHistoryScroll()
  }
}
