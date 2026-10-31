/**
 * recover — 轻量网络自愈与离线恢复微胶囊（Pro 特性）。
 *
 * 核心设计：
 *  - 监听 window offline / online 事件；
 *  - 当断网时，在界面底部浮现轻量药丸胶囊（不遮挡主操作按钮与输入框）；
 *  - 点击可一键重试（重新加载或触探网络）；
 *  - 网络恢复后自动变绿并淡出销毁；
 *  - 纯非侵入式，完全隔离。
 */

export function installRecoverEffect(): () => void {
  if (typeof window === 'undefined') return () => {}

  let pill: HTMLDivElement | null = null
  let hideTimer: number | null = null

  const getOrCreatePill = (): HTMLDivElement => {
    if (pill !== null && pill.isConnected) return pill
    pill = document.createElement('div')
    pill.className = 'dsh-mw-recover-pill'
    pill.onclick = () => {
      window.location.reload()
    }
    document.body.appendChild(pill)
    return pill
  }

  const removePill = (): void => {
    if (pill !== null) {
      pill.remove()
      pill = null
    }
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  const showOffline = (): void => {
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    const el = getOrCreatePill()
    el.dataset.state = 'offline'
    el.innerHTML = '<span>⚠️</span> <span>网络已断开 · 点击重连</span>'
    el.style.opacity = '1'
  }

  const showOnline = (): void => {
    if (pill === null) return
    pill.dataset.state = 'online'
    pill.innerHTML = '<span>✅</span> <span>网络已恢复</span>'
    pill.style.opacity = '1'
    hideTimer = window.setTimeout(() => {
      if (pill !== null) {
        pill.style.opacity = '0'
        hideTimer = window.setTimeout(() => {
          removePill()
        }, 300)
      }
    }, 1500)
  }

  const onOffline = (): void => {
    showOffline()
  }

  const onOnline = (): void => {
    showOnline()
  }

  window.addEventListener('offline', onOffline)
  window.addEventListener('online', onOnline)

  // 初始状态自检
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    showOffline()
  }

  return () => {
    window.removeEventListener('offline', onOffline)
    window.removeEventListener('online', onOnline)
    removePill()
  }
}
