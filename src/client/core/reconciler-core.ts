/**
 * reconciler-core — DOM-free 调度核（对 dsh-mobile-nav 的设计再实现）。
 *
 * 零 import（node:test 可直接加载做单测）。浏览器侧（client/index.ts）以
 * 单全树 MutationObserver -> 脏键集合 -> 本核 note() -> rAF 合并 flush，
 * 按 task.scopes 只执行交集任务；任务在窄屏激活、幂等、错误隔离。
 */

export interface ReconcilerTask {
  /** 任务名（错误上报与调试用）。 */
  readonly name: string
  /**
   * 脏键白名单：任一命中即触发本轮 ensure()。undefined = 每轮都跑
   * （仅适合极少数必须全量重查的任务，如 TPS 读数）。
   */
  readonly scopes?: readonly string[]
  /** 激活时 + 每次匹配的 DOM 变更后执行；必须幂等。 */
  ensure(): void
  /** 停用/移除/插件卸载时执行；必须完整还原。 */
  dispose(): void
}

export type FrameRequest = (flush: () => void) => () => void

export interface ReconcilerCoreOptions {
  readonly requestFrame: FrameRequest
  readonly onError?: (taskName: string, error: unknown, phase: 'ensure' | 'dispose') => void
}

export interface ReconcilerCore {
  readonly size: number
  register(task: ReconcilerTask): () => void
  activate(): void
  deactivate(): void
  note(keys: Iterable<string>): void
  flush(): void
}

export function createReconcilerCore(options: ReconcilerCoreOptions): ReconcilerCore {
  const onError: ReconcilerCoreOptions['onError'] =
    options.onError ??
    ((taskName, error, phase) => {
      console.error(
        '[dsh-mobile-xc] reconciler task ' + taskName + (phase === 'dispose' ? ' dispose' : '') + ' failed',
        error,
      )
    })

  const registered = new Set<ReconcilerTask>()
  let active: Set<ReconcilerTask> | null = null
  let dirty = new Set<string>()
  let forceAll = false
  let pending: (() => void) | null = null

  const runEnsure = (task: ReconcilerTask): void => {
    try {
      task.ensure()
    } catch (error) {
      onError(task.name, error, 'ensure')
    }
  }

  const runDispose = (task: ReconcilerTask): void => {
    try {
      task.dispose()
    } catch (error) {
      onError(task.name, error, 'dispose')
    }
  }

  const flush = (): void => {
    if (pending !== null) {
      pending()
      pending = null
    }
    if (active === null) {
      dirty.clear()
      forceAll = false
      return
    }
    if (forceAll) {
      for (const task of active) runEnsure(task)
    } else if (dirty.size > 0) {
      for (const task of active) {
        const scopes = task.scopes
        if (scopes === undefined || scopes.some((key) => dirty.has(key))) runEnsure(task)
      }
    }
    dirty.clear()
    forceAll = false
  }

  const schedule = (): void => {
    if (pending !== null) return
    pending = options.requestFrame(() => {
      pending = null
      flush()
    })
  }

  const register = (task: ReconcilerTask): () => void => {
    registered.add(task)
    return () => {
      registered.delete(task)
      if (active !== null && active.has(task)) {
        active.delete(task)
        runDispose(task)
      }
    }
  }

  const activate = (): void => {
    active = new Set(registered)
    forceAll = true
    schedule()
  }

  const deactivate = (): void => {
    if (active === null) return
    for (const task of active) runDispose(task)
    active = null
    dirty.clear()
    forceAll = false
    if (pending !== null) {
      pending()
      pending = null
    }
  }

  const note = (keys: Iterable<string>): void => {
    if (active === null) return
    for (const key of keys) dirty.add(key)
    schedule()
  }

  return {
    get size(): number {
      return registered.size
    },
    register,
    activate,
    deactivate,
    note,
    flush: () => {
      flush()
    },
  }
}
