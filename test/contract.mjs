#!/usr/bin/env node
/**
 * dsh-mobile-web — contract + static-safety suite (no browser needed).
 *
 * The interesting test here is `every rule is gated`. The plugin's whole
 * promise is that the desktop console is untouched, and that promise is only
 * kept if no declaration in src/mobile.css can apply outside the mobile media
 * query. So this walks the stylesheet at brace depth 0 and asserts that every
 * top-level construct is a media query (or a comment) — a stray rule above the
 * gate fails the build here rather than silently changing the desktop UI.
 *
 * Usage: node test/contract.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let failures = 0
let checks = 0

function check(name, ok, detail = '') {
	checks++
	console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${ok || !detail ? '' : `\n         -> ${detail}`}`)
	if (!ok) failures++
}

console.log('=== package contract ===')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

check('name is dsh-mobile-web', pkg.name === 'dsh-mobile-web', pkg.name)
check('declares dsh.bundle.patch', pkg.dsh?.bundle?.patch === './cordis.patch.yml',
	JSON.stringify(pkg.dsh?.bundle))
check('declares dsh.client for platform web', pkg.dsh?.client?.platform === 'web',
	JSON.stringify(pkg.dsh?.client))
check('loads immediately (UI adaptation must not be lazy)', pkg.dsh?.client?.immediately === true)
check('exports["./client"] resolves to a string',
	typeof pkg.exports?.['./client']?.default === 'string',
	JSON.stringify(pkg.exports?.['./client']))
check('main points at the host half', pkg.main === './lib/index.js', pkg.main)

const patchPath = join(root, 'cordis.patch.yml')
check('cordis.patch.yml exists', existsSync(patchPath))
if (existsSync(patchPath)) {
	const patch = readFileSync(patchPath, 'utf8')
	check('patch inserts the plugin id', /id:\s*mobile-web/.test(patch))
	check('patch names the package', /name:\s*dsh-mobile-web/.test(patch))
}

console.log('\n=== bundle ===')
const clientPath = join(root, 'lib/client.js')
check('lib/client.js exists', existsSync(clientPath))
try {
	execFileSync('node', ['build.mjs', '--check'], { cwd: root, stdio: 'pipe' })
	check('lib/client.js is up to date with src/', true)
} catch (e) {
	check('lib/client.js is up to date with src/', false, String(e.stdout || e.message).slice(0, 200))
}

const bundle = readFileSync(clientPath, 'utf8')
check('bundle registers the expected module id', /id:\s*"dsh-mobile-web"/.test(bundle))
check('bundle uses the __ModuleLoader__ contract', bundle.includes('window.__ModuleLoader__.load'))
check('bundle embeds the stylesheet', bundle.includes('__DSH_MW_CSS__'))
check('bundle exports a cordis shape', /exports\.apply\s*=/.test(bundle) && /exports\.name\s*=/.test(bundle))
try {
	execFileSync('node', ['--check', clientPath], { stdio: 'pipe' })
	check('bundle is syntactically valid', true)
} catch (e) {
	check('bundle is syntactically valid', false, String(e.stderr || e.message).slice(0, 200))
}

console.log('\n=== static safety: every rule is gated ===')
const css = readFileSync(join(root, 'src/mobile.css'), 'utf8')

/** Strip comments so they cannot confuse the scanner. */
const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Walk brace depth 0 and collect each top-level construct. */
const topLevel = []
let depth = 0
let start = 0
for (let i = 0; i < stripped.length; i++) {
	const ch = stripped[i]
	if (ch === '{') {
		if (depth === 0) topLevel.push(stripped.slice(start, i).trim())
		depth++
	} else if (ch === '}') {
		depth--
		if (depth === 0) start = i + 1
	}
}
check('braces are balanced', depth === 0, `final depth ${depth}`)

const atRules = topLevel.filter((t) => t.length > 0)
const offenders = atRules.filter((t) => !/^@media\b/.test(t))
check(`all ${atRules.length} top-level constructs are @media queries`, offenders.length === 0,
	offenders.length ? `ungated: ${offenders.slice(0, 3).map((s) => s.slice(0, 60)).join(' | ')}` : '')

check('mobile gate uses max-width: 860px', /@media\s*\(max-width:\s*860px\)/.test(css))
check('gate covers landscape phones via coarse pointer',
	/max-height:\s*500px\)\s*and\s*\(pointer:\s*coarse/.test(css))

// The desktop regression and the rail-free layout rely on these guards.
check('rail-free layout is GATED on html.dsh-mw-on (no JS => stock rail stays)',
	/html\.dsh-mw-on\s+\[class\*="_frame"\]\s*\{[^}]*grid-template-columns:\s*0px\s*minmax\(0,\s*1fr\)\s*0px\s*!important/.test(css))
check('frame reserves room for the top bar',
	/padding-top:\s*calc\(var\(--dsh-mw-topbar-h\)\s*\+\s*var\(--dsh-mw-safe-t\)\)\s*!important/.test(css))
check('rail is hidden with visibility, NOT display:none',
	/html\.dsh-mw-on\s+\[class\*="_sidebarCol"\]\s*\{[^}]*visibility:\s*hidden\s*!important/.test(css))
check('rail is not hidden with display:none (would kill the Settings dialog)',
	!/\[class\*="_sidebarCol"\]\s*\{\s*display:\s*none/.test(css))
check('settings dialog inside the rail stays visible',
	/html\.dsh-mw-on\s+\[class\*="_sidebarCol"\]\s+\[class\*="_overlay"\]\s*\{\s*visibility:\s*visible\s*!important/.test(css))
check('composer does NOT hand-compensate the keyboard height',
	!/padding-bottom:\s*calc\([^)]*--dsh-mw-kb/.test(css))
check('viewport meta declares interactive-widget=resizes-content',
	/interactive-widget=resizes-content/.test(bundle))
check('viewport meta declares viewport-fit=cover', /viewport-fit=cover/.test(bundle))
check('drawer re-shows the sidebar as an overlay',
	/html\.dsh-mw-drawer\s+\[class\*="_sidebarCol"\]\s*\{[^}]*display:\s*block\s*!important/.test(css))
check('drawer is scoped to html.dsh-mw-drawer', /html\.dsh-mw-drawer\s+\[class\*="_sidebarCol"\]/.test(css))
check('top bar has styles inside the gate', /\.dsh-mw-topbar\s*\{/.test(css))
check('top bar is built by the behaviour half', /dsh-mw-topbar/.test(bundle))
check('control lookup is not English-only (localised app handled)',
	/打开侧边栏/.test(bundle) && /新建会话/.test(bundle) && /搜索会话/.test(bundle) && /收起/.test(bundle))
check('control lookup prefers class suffixes over labels',
	/\[class\*="_newSession"\]/.test(bundle) && /\[class\*="_searchButton"\]/.test(bundle))
check('lookup can never target the injected bar itself',
	/closest\(['"]\.dsh-mw-topbar['"]\)/.test(bundle))

// ---------------------------------------------------------------------------
// Per-row action menus (rename / fork / ARCHIVE) are hover-only in the app.
// A mouse reproduces the hover for free, so a desktop test run cannot see the
// loss — these checks are what keep the touch path from regressing silently.
// ---------------------------------------------------------------------------
check('per-row action menu is force-shown inside the gate (hover-only in the app)',
	/html\.dsh-mw-on\s+\[class\*="_sessionRow"\]\s+\[class\*="_rowActions"\][^}]*display:\s*inline-flex\s*!important/.test(css))
check('workspace row menu is force-shown too',
	/html\.dsh-mw-on\s+\[class\*="_projectRow"\]\s+\[class\*="_rowActions"\]\s*\{[^}]*display:\s*inline-flex\s*!important/.test(css))
check('row-action override is scoped to rows (does not hit unrelated _rowActions)',
	!/html\.dsh-mw-on\s+\[class\*="_rowActions"\]\s*\{/.test(css))
check('drawer rows are grown to the 44px touch minimum',
	/html\.dsh-mw-drawer\s+\[class\*="_sessionRow"\][^}]*min-height:\s*44px/.test(css))
check('drawer-dismiss guard is STRUCTURAL, not English-only (zh-CN 会话"x"的操作)',
	/closest\(['"]\[class\*="_rowActions"\]['"]\)/.test(bundle))
check('drawer-dismiss guard also carries localised tokens',
	/操作/.test(bundle) && /视图选项/.test(bundle) && /添加工作区/.test(bundle))

// ---------------------------------------------------------------------------
// Workspaces are folders in the drawer tree, and the header's own controls must
// fit at the 44px touch size. Both defects below shipped to a phone and were
// invisible to a desktop run (the desktop header is sized for 28px buttons, and
// a mouse never hits the clipped sliver).
// ---------------------------------------------------------------------------
check('only a SESSION selection dismisses the drawer (workspace rows stay open)',
	/el\.closest\(\s*'\[class\*="_sessionRow"\]'\s*\)/.test(bundle) &&
	!/closest\(\s*'\[class\*="_sessionRow"\], \[class\*="_projectRow"\]'\s*\)/.test(bundle))
check('the workspaces header is re-flowed for 44px controls',
	/html\.dsh-mw-drawer\s+\[class\*="_sectionHeader"\]\s*\{[^}]*overflow:\s*visible\s*!important/.test(css) &&
	/html\.dsh-mw-drawer\s+\[class\*="_sectionHeader"\]\s+\[class\*="_headerActions"\]\s*\{[^}]*max-width:\s*none\s*!important/.test(css))
check('the search slot stops being capped at the app\'s 28px size',
	/html\.dsh-mw-drawer\s+\[class\*="_sectionHeader"\]\s+\[class\*="_searchSlot"\]\s*\{[^}]*max-width:\s*none\s*!important/.test(css))
check('the header re-flow is scoped to the open drawer',
	/html\.dsh-mw-drawer\s+\[class\*="_sectionHeader"\]/.test(css) &&
	!/^\s*\[class\*="_sectionHeader"\]/m.test(css))

// ---------------------------------------------------------------------------
// Touch affordances. The app ships both edge swipes natively, but the plugin's
// `!important` sidebar geometry overrides the inline geometry the app's drag
// writes, so under the plugin they silently stop working and the plugin has to
// re-provide them. Separately, the app's conversation/composer controls are
// 28px: the hit area is grown with a transparent ::after, never by re-flowing
// the app's tightly laid-out rows.
// ---------------------------------------------------------------------------
check('swipe gestures are reimplemented (the app\'s own are disabled by !important geometry)',
	/EDGE_PX\s*=\s*24/.test(bundle) && /OPEN_SWIPE_PX\s*=\s*40/.test(bundle) &&
	/CLOSE_SWIPE_PX\s*=\s*60/.test(bundle) && /swipeIntent\(/.test(bundle))
check('swipe paths are gated on the mobile viewport (a desktop touch screen is untouched)',
	/e\.touches\.length !== 1 \|\| !isMobileViewport\(\)/.test(bundle))
check('expanded hit areas are transparent ::after overlays (no layout change)',
	/html\.dsh-mw-on\s+\[class\*="_actions"\]\s*>\s*\[class\*="_action"\]::after[^}]*inset:\s*-8px\s+-4px/.test(css) &&
	/html\.dsh-mw-on\s+\[class\*="_composerSeat"\]\s+button\[class\*="_add"\]::after[^}]*inset:\s*-8px\s+-5px/.test(css))
check('workspace chevron is force-shown on touch (hover-only in the app)',
	/html\.dsh-mw-on\s+\[class\*="_projectRow"\]\s+\[class\*="_chevron"\]\s*\{[^}]*display:\s*inline-flex\s*!important/.test(css))
check('theme-color meta is kept in step with the app surface',
	/meta\[name="theme-color"\]/.test(bundle) && /setAttribute\('content',\s*bg\)/.test(bundle))

// ---------------------------------------------------------------------------
// `_frame` and `_card` are generic suffixes. The ask_user_question card carries
// both, so the shell geometry has to be scoped off any frame that is not the
// app shell, and the card needs phone-sized room or its options sit below an
// invisible inner scroll.
// ---------------------------------------------------------------------------
check('shell `_frame` geometry is scoped off the question card\'s frame',
	/\[class\*="_frame"\]:not\(:has\(\[class\*="_sidebarCol"\]\)\)/.test(css))
check('the question card gets phone room (taller cap, wider frame)',
	/max-height:\s*min\(86dvh,\s*780px\)\s*!important/.test(css) &&
	/padding:\s*6px\s+8px\s+10px\s*!important/.test(css))
check('the frame lookup prefers the shell frame over a question-card frame',
	/\[class\*="_frame"\]:has\(\[class\*="_sidebarCol"\]\)/.test(bundle))

// ---------------------------------------------------------------------------
// Manual reordering is HTML5 drag-and-drop in the app, and no browser starts
// an HTML5 drag from a touch point. The shim must only ever re-dispatch the
// events the app already listens for — never reimplement the move.
// ---------------------------------------------------------------------------
check('touch reorder re-dispatches the app\'s own drag events',
	/DragEvent\(/.test(bundle) && /'dragstart'/.test(bundle) &&
	/'dragover'/.test(bundle) && /'drop'/.test(bundle) && /'dragend'/.test(bundle))
check('touch reorder only targets draggable rows inside the sidebar',
	/\[draggable="true"\]/.test(bundle) && /_sidebarCol/.test(bundle))
check('touchmove is registered non-passive (the only handler that may preventDefault)',
	/'touchmove',\s*onTouchMove,\s*\{\s*passive:\s*false\s*\}/.test(bundle))
check('touchstart/touchend stay passive (scrolling must never be blocked)',
	/'touchstart',\s*onTouchStart,\s*\{\s*passive:\s*true\s*\}/.test(bundle) &&
	/'touchend',\s*onTouchEnd,\s*\{\s*passive:\s*true\s*\}/.test(bundle))
check('drop target is resolved from the release point (self-drop is a no-op)',
	/elementFromPoint\(t\.clientX,\s*t\.clientY\)/.test(bundle))
check('long press, not a plain tap, arms the drag',
	/pressTimer\s*=\s*setTimeout\(/.test(bundle) && /PRESS_MS\s*=\s*280/.test(bundle))

// ---------------------------------------------------------------------------
// A fullscreen file preview puts the app's own close control under the injected
// bar. The bar must yield, or opening a file is a one-way trip.
// ---------------------------------------------------------------------------
check('top bar yields while the app shows a fullscreen right panel',
	/html\.dsh-mw-rightfull\s+\.dsh-mw-topbar\s*\{\s*visibility:\s*hidden/.test(css))
check('fullscreen right panel is detected from the app\'s own frame attribute',
	/data-rightbar-fullscreen/.test(bundle) && /dsh-mw-rightfull/.test(bundle))
check('the frame observer watches the right-panel attributes',
	/attributeFilter:\s*\[[^\]]*data-rightbar-fullscreen/.test(bundle))
check('the app\'s 28px close control gets a 44px hit area',
	/html\.dsh-mw-rightfull\s+\[class\*="_iconButton"\]::after/.test(css) &&
	/inset:\s*-8px/.test(css))

console.log(`\n${'='.repeat(62)}`)
console.log(`TOTAL ${checks} checks, ${checks - failures} passed, ${failures} failed`)
process.exit(failures ? 1 : 0)
