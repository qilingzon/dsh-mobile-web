/**
 * focus-guard — 键盘防弹起（对治：会话切换后 vendor 自动聚焦 composer -> 手机键盘弹出）。
 * 策略：只有用户亲手点进 composer 的"书写区"才放行聚焦；其余任何进入 composer 的焦点
 * （含导航副作用、程序自动聚焦）一律 blur。
 * 特例（v0.6.8，真机反馈"点加号会弹出输入法不合理"）：composer 里的按钮（+、权限、模型、
 * 发送…）点击后 vendor 会顺手 focus 输入框（桌面为了"接着打字过滤指令"很方便，手机上是
 * 平白弹出键盘）。因此点在这些交互控件上时不放行聚焦——指令面板照常打开，键盘不动。
 * 窄屏范围内生效（由 installMobileEffect 装配）。
 */

const NOOP = (): void => {}

// 注意：composer 的 data-slot 只覆盖卡片内的一小段，书写区（.uV2eYG_input）在 slot 之外，
// 只靠 data-slot 会漏掉真正的聚焦目标——真机"点加号弹输入法"正是漏在这。故补哈希前缀兜底。
const COMPOSER_SEL = '[data-slot^="conversation.composer"], [data-composer-seat], [class*="uV2eYG_"]'

/** composer 内的按钮类控件：点它们只是"打开某个面板/触发某个动作"，不应把键盘顶起来 */
const CONTROL_SEL = 'button, a[href], select, [role="button"], [role="menuitem"], [role="tab"], input[type="checkbox"], input[type="radio"]'

const isComposerEl = (el: Element): boolean => el.closest(COMPOSER_SEL) !== null
const isControl = (el: Element): boolean => el.closest(CONTROL_SEL) !== null

export function installFocusGuard(): () => void {
  if (typeof document === 'undefined' || typeof HTMLElement === 'undefined') return NOOP
  // 放行只在"这一次手势"内有效（1s），否则一次点空白就长期放行，
  // vendor 之后任何一次程序化 focus 都能把键盘顶起来。
  const ALLOW_MS = 1000
  let allowUntil = 0
  const allowed = (): boolean => Date.now() < allowUntil
  const onPointerDown = (event: PointerEvent): void => {
    const hit = event.target instanceof Element && isComposerEl(event.target) && !isControl(event.target)
    allowUntil = hit ? Date.now() + ALLOW_MS : 0
  }
  const onFocusIn = (event: FocusEvent): void => {
    if (allowed()) return
    const target = event.target
    if (target instanceof HTMLElement && isComposerEl(target)) target.blur()
  }

  // 决定性一票：vendor 是"调用 focus()"把键盘顶起来的，光靠 focusin 兜底会有时序竞态
  // （真机上是"装载时就已 focus -> 用户点加号时手势让 iOS 立刻弹键盘"，此时根本没有新的
  //  focusin 事件）。这里直接在原型上按 allowFocus 放行/拦截 composer 的程序化聚焦。
  const nativeFocus = HTMLElement.prototype.focus as (...args: unknown[]) => void
  const patchedFocus = function patchedFocus(this: HTMLElement, ...args: unknown[]): void {
    if (!allowed() && isComposerEl(this)) return
    nativeFocus.apply(this, args)
  }
  HTMLElement.prototype.focus = patchedFocus as typeof HTMLElement.prototype.focus

  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('focusin', onFocusIn, true)

  // 装载时若已被 vendor 提前聚焦（正是"点加号弹输入法"的引信），先摘掉
  const active = document.activeElement
  if (active instanceof HTMLElement && isComposerEl(active)) active.blur()

  return () => {
    document.removeEventListener('pointerdown', onPointerDown, true)
    document.removeEventListener('focusin', onFocusIn, true)
    HTMLElement.prototype.focus = nativeFocus as typeof HTMLElement.prototype.focus
  }
}
