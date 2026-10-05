# dsh-mobile-web

Full mobile-web adaptation for the DeepSeek Harness console — **without ever
touching the desktop layout**.

A DSH profile plugin: one host no-op plus one browser bundle that injects a
gated stylesheet and a small behaviour layer. It patches no DSH source file.

```
dsh plugin --profile web add file:/root/dsh/1/dsh-mobile-web
# then restart dsh web
```

---

## The problem it solves

Measured on the stock console at a 390×844 phone viewport:

| | stock | after |
|---|---|---|
| Left navigation | fixed 56px icon rail eating 12% of the screen width | **gone** — content gets the full viewport; menu / new-session / search / settings move to a **top bar** |
| Content width (390px phone) | 334px | **390px** |
| Sidebar when opened | **squeezed the content to 110px** (40px at 320px wide) | **overlay drawer**; content width unchanged |
| Settings panel | split into a 188px nav + **154px content** column | nav stacked above content, both full width |
| Composer under the on-screen keyboard | hidden behind it | rides above it |
| Inputs | <16px → iOS zooms the whole page on focus | 16px |
| Navigation tap targets | as small as 28px | ≥44px |
| Workspace (folder) row | tapping it **closed the drawer** instead of expanding the folder | expands in place; the drawer stays open |
| 添加工作区 (new workspace) | clipped to a ~12px sliver, its centre covered by the list root | full 44px control; opens the directory dialog |
| Edge swipe / swipe-to-close | app-native, but **silently disabled by this plugin's own `!important` geometry** | restored as threshold gestures, gated to the mobile viewport |
| Conversation & composer controls | 28×28 (send 34×34) | same visuals, 36–38×44 transparent hit area |

The content-squeeze was the headline defect: opening the sidebar on a phone left
almost nothing for the conversation.

## How it avoids conflicting with desktop

Three independent mechanisms, each asserted by the test suite:

1. **The gate.** Every declaration in `src/mobile.css` sits inside
   `@media (max-width: 860px), ((max-height: 500px) and (pointer: coarse))`.
   Above the gate the stylesheet contributes *nothing*. `test/contract.mjs`
   proves this by walking the CSS at brace depth 0 and failing if any top-level
   construct is not a `@media` — a stray rule cannot slip in unnoticed.
   `pointer: coarse` on the landscape clause is what keeps a short *desktop*
   window (mouse) out of the mobile branch.
2. **It does not drive the app's state machine.** Opening and closing the
   sidebar is still the app's own toggle. The plugin only observes the app's
   inline `grid-template-columns` and re-geometries the result.
3. **Regression against a pre-install baseline.** `test/e2e.py` compares
   sidebar width, content width and computed grid columns at 900/1024/1280/1440
   against `before-metrics.json`, captured from the live console *before*
   installation. Any drift is a failure.

## How it works

The app writes its geometry inline on the frame element:

```
closed:  grid-template-columns: 56px  minmax(0px, 1fr) 0px
open:    grid-template-columns: 280px minmax(0px, 1fr) 0px
```

On a 390px screen the "open" value is what crushes the content. The stylesheet
zeroes the first track in both states, so the content always gets the full
viewport width; the behaviour half notices the transition and lifts the sidebar
out of the grid into a fixed overlay with a scrim behind it.

`!important` overrides the *computed* value but leaves the inline attribute
readable — which is exactly the signal the behaviour half needs.

### The top bar

The rail's controls stay in the DOM and are hidden with `visibility`, not
`display: none`. The injected top bar forwards a click to each of them, so
new-session / search / settings keep the app's real handlers and the bar holds
no logic of its own.

`visibility` rather than `display` is load-bearing: **the app renders the
Settings dialog inside the sidebar column**, so `display: none` there silently
killed the entire settings panel (it opened and measured 0×0). `visibility` is
inheritable and descendants can opt back out, which is what keeps that dialog
alive. `test/contract.mjs` asserts both halves of this.

### Selector strategy

The app uses CSS modules, so class names look like `pI_x6G_sidebarCol`. The hash
changes between builds; the semantic suffix does not. Every selector therefore
matches the suffix via `[class*="_sidebarCol"]`, which survives version bumps.
The same applies to `_frame`, `_centerCol`, `_rightbarCol`, `_composerSeat`,
`_overlay > _panel > _nav/_content`, and so on.

### Deliberate non-goals

- The composer toolbar is left dense. It is a tightly packed row by design;
  inflating its 28px buttons to 44px would wrap the layout. Only the persistent
  navigation surfaces get the 44px minimum.
- The top bar does not reimplement anything. If a future app version renames a
  control's `aria-label`, that button stops working rather than misbehaving —
  the failure is visible and cheap, which is the right trade against silently
  drifting behaviour.

## Files

```
src/mobile.css    the stylesheet — the actual adaptation (source of truth)
src/mobile.js     behaviour: keyboard height, drawer state, scrim, back button
build.mjs         concatenates the two into lib/client.js
lib/index.js      host half — a deliberate no-op
lib/client.js     GENERATED bundle served to the browser
test/contract.mjs package/bundle/gating checks, no browser needed
test/e2e.py       Playwright suite: mobile behaviour + desktop regression
```

Rebuild after editing `src/`:

```sh
node build.mjs          # or: node build.mjs --check  to verify freshness
```

## Testing

```sh
node test/contract.mjs                    # 63 static checks
python3 test/e2e.py --url "http://127.0.0.1:3080/?token=$TOK" \
                    --baseline /root/dsh-mobile-work/before-metrics.json
# --destructive additionally EXECUTES 归档会话 and commits a reorder. It changes
# the session list, so it is opt-in; the default run is non-destructive.
```

The e2e suite runs **323 checks** across 9 mobile viewports (320→932px, portrait
and landscape), 3 locales and 4 desktop viewports. It asserts, per mobile
viewport:

- the plugin is active, the style tag is injected, there is no horizontal overflow
- closed: the rail is hidden and zero-width, and the content takes the **full**
  viewport width
- the top bar renders, spans the viewport, sits above the content without
  overlapping it, carries menu / new-session / search / settings, and every one
  of its buttons is ≥44px
- open: the drawer is `position: fixed`, fits within 88vw, **and the content
  width is unchanged** (the stock console squeezes it)
- the scrim is visible and interactive, a scrim tap closes the drawer
- drawer navigation tap targets are ≥44px; the composer field is ≥16px
- settings: nav and content are stacked and full width

Two further groups exist because a **mouse cannot see their failures** — a
desktop run reproduces `:hover` for free, so a touch-only loss passes silently:

- **row menus** (zh-CN, real touch): the per-row action trigger is rendered, the
  row is ≥44px, tapping it does **not** dismiss the drawer, the menu offers
  rename / fork / **归档会话** and survives a touch pointer.
- **touch reorder**: rows are draggable, a long press engages the app's drag,
  dragging paints the app's own drop marker, and a self-drop leaves the order
  untouched.
- **file panel**: opening a file is not a one-way trip. Asserted as a **hit
  test** (`elementFromPoint` at the app's close control), because the control was
  visible and correctly sized the whole time — only the stacking order was wrong,
  which geometry cannot see. Runs at phone width (fullscreen mode) *and* tablet
  width (grid-track mode), which are different code paths.
- **workspaces** (zh-CN, real touch): 添加工作区 is inside the drawer and wins its
  own **hit test** (the list root used to cover its centre), a real touch opens
  the 选择工作区目录 dialog, tapping a workspace row toggles `aria-expanded`
  **without** dismissing the drawer, and a session tap still dismisses it.
- **touch** (real touch): edge right-swipe opens the drawer, left-swipe closes
  it, a horizontal pan in the content does **not** toggle it, every small
  control has a generated hit-area overlay that wins a hit test outside its
  visual box, the workspace chevron is visible, and `theme-color` matches the
  app surface.
- **qcard**: the shell's frame geometry must not leak onto the ask_user_question
  card. The card only mounts while a question is pending, so this group injects
  a synthetic frame/card with the component's real class names and asserts the
  computed geometry — the shell keeps 100dvh/52px, the card frame gets natural
  height and 8px side padding, and the card's cap is no longer 60vh.

…and per desktop viewport: the plugin is present but **inactive**, **no top bar
is injected**, sidebar and content widths and computed grid columns match the
pre-install baseline, and the expanded sidebar still uses the app's own in-flow
geometry (not an overlay).

Latest run on the live console: **323/323 passed, 0 failed** (contract 63/63).

## Browser walkthrough findings

A headed-browser pass (`/root/dsh-mobile-work/walkthrough.py`, 18 steps across
390/320/844/1440px) produced **0 console errors** and confirmed the core
adaptation at every viewport. It also surfaced three things the assertions had
not:

1. **Fixed — the drawer was dismissed by the wrong tap.** The auto-close
   heuristic matched anything inside `_regionArea`, so tapping the
   *"Workspaces" section header* closed the drawer without selecting anything.
   Now scoped to `_sessionRow` / `_projectRow` only. Re-verified in the browser:
   a header tap keeps the drawer open, a session tap closes it.
2. **Not a defect — the closed right-hand panel.** 19 elements report as
   extending past the viewport (`P3OORG_*`, `_pane_*` at x=390…780), but they
   belong to the *closed* right sidebar, are clipped by its zero-width column,
   and leave `document.scrollWidth` at exactly the viewport width. Benign.
3. **Third-party, deliberately out of scope.** The Plugin Market settings page
   (dshmarket's own UI) is wider than a phone screen — its tab strip and some
   header buttons overflow. They sit inside a horizontally scrollable container
   so they stay reachable, and restyling another plugin's internal markup would
   be brittle coupling that breaks on its next release.

### The localisation bug (the expensive one)

The top bar shipped **completely dead on a zh-CN device** while the en-US suite
stayed green. Cause: the app localises its `aria-label`s, so a Chinese browser
renders `打开侧边栏` / `新建会话` / `搜索会话` / `设置`, and the bar's original
English-label lookups all returned `null`. Every button silently did nothing.

Two fixes, both now locked by tests:

- **Look controls up by CSS-module suffix, not by label.** `[class*="_newSession"]`,
  `[class*="_searchButton"]`, `[class*="_toggle"]` are language-independent. The
  aria labels stay as a fallback, in both languages.
- **The suite now runs a localised pass** (`zh-CN`, `en-US`, `ja-JP`) that
  asserts each button resolves to a real app control and that clicking works.
  A green en-US run was never evidence that the bar worked.

Two related traps this exposed:

- The bar's own buttons carry the English aria labels, so an unguarded
  document-level lookup finds *our own button* and clicking it re-enters the
  handler — an infinite loop. Every lookup is guarded with
  `closest('.dsh-mw-topbar')`.
- The sidebar control is a **toggle**, so an unguarded `closeDrawer()` on an
  already-closed drawer *opens* it. Both directions are now state-guarded.

### The touch-reachability audit (功能缺了一下，比如归档)

Reported from a real phone: *"features are missing, e.g. 归档 (archive)"*. It was
not one bug but four, and **none of them was visible to a desktop test run** —
a mouse reproduces `:hover` for free, so every hover-gated control worked in
every automated pass while being unreachable on a touch screen.

Found by enumerating the app's own stylesheets at runtime (3,186 rules) and
diffing which of them gate visibility on `:hover`, then diffing the interactive
controls of a desktop render against a touch render.

1. **Per-row action menus are hover-only.** The app's rule is
   `.YDXeBa_sessionRow:hover .YDXeBa_rowActions { display: inline-flex }`, and
   the `⋯` trigger lives *inside* the container it reveals — so on a touch screen
   it can never be tapped into existence. This hid the entire per-row menu:
   重命名 / 分叉会话 / **归档会话** for a session, and rename / delete / new
   session for a workspace. Fixed by mirroring the app's own hover state inside
   the mobile gate.
2. **This plugin's own drawer-dismiss guard was English-only.** It skipped the
   auto-close for labels matching `/actions/i`. In zh-CN the label is
   `会话"x"的操作` / `工作区"x"的操作`, which does not match — so tapping `⋯`
   (once reachable) closed the drawer and dismissed the menu before it could be
   seen. The guard is now **structural first** (`closest('[class*="_rowActions"]')`,
   language-independent) with a localised regex as fallback. This is the same
   class of bug as the top-bar localisation failure above, in a second place.
3. **Rows are 32px tall**, under the 44px touch minimum and shorter than the
   44px action button the plugin forces — the button overflowed its row. Rows
   are grown to 44px inside the drawer.
4. **Manual reordering is HTML5 drag-and-drop**, which no browser starts from a
   touch point. The app's path has `draggable` + `onDragStart`/`onDragOver`/
   `onDrop` and **zero touch or pointer handlers**, so with 排序方式 = 手动排序 a
   phone could select the mode and never move a row. The plugin now re-dispatches
   the app's own drag events after a 350ms long press; the app's handlers do the
   move and paint its own drop marker. The drop target is resolved from the
   *release* point, which makes the app's existing self-drop guard
   (`anchor === sessionId → return`) keep a cancelled drag a no-op.

Deliberately **not** changed: the timestamp is not hidden to make room for the
action button. The app hides it on hover; following that on touch would delete
the relative time from every row on the phone, so the title ellipsises instead.

### The fullscreen file preview (打开文件之后就回不去对话了)

Reported from a phone: opening a file left no way back to the conversation.

The app presents a file preview as a fullscreen right panel and puts its **own**
close control (收起右侧边栏) in the top-right corner — the exact spot the injected
top bar's settings button occupies. The bar sat above it (`z-index: 60`) and won
the hit test:

```
elementFromPoint at the close button  ->  BUTTON.dsh-mw-topbar__settings
```

The control was visible, correctly sized and in the DOM the whole time. **Only
the stacking order was wrong** — which is why every geometry assertion in the
suite passed while the phone was genuinely trapped. This is the case that argues
for hit tests over bounding boxes.

Fixed by detecting the app's own signal (`data-rightbar-fullscreen` on the frame,
which is what the app already sets) and having the bar yield while the app owns
the screen. Two presentation modes exist and both are now tested, because a fix
for one does not cover the other:

| width | mode | plugin state | way back |
|---|---|---|---|
| 390px | app goes fullscreen | `html.dsh-mw-rightfull`, bar hidden | app's own 收起右侧边栏 |
| 820px | app opens a grid track | `html.dsh-mw-right` | app's own 收起右侧边栏 |

The app's control is 28px in its header; a `::after { inset: -8px }` overlay
gives it the 44px touch minimum without touching the header's layout.

Also checked and found **already safe**: the settings dialog's own 关闭 control
wins its hit test on a phone, so that overlay is not a trap.

### The workspace folder and the new-workspace button (打不开文件夹 / 不能新开工作区)

Reported from a phone: workspaces could not be opened, and a new workspace could
not be created. Two independent defects, both invisible to the suite that was
green at the time:

1. **A workspace row is a folder, and tapping it dismissed the drawer.** The app
   renders a workspace as a `treeitem` with `aria-expanded` and toggles that
   expansion on click — on desktop, clicking the row expands or collapses the
   sessions under it. The plugin's drawer-dismiss guard matched
   `_sessionRow, _projectRow` and closed the drawer for either, so on a phone the
   folder collapsed into nothing the instant it was tapped. Only a **session**
   selection dismisses now. The row's own controls (its ⋯ menu and
   在"x"中新建会话) were already excluded structurally, so they are unaffected.

2. **添加工作区 was clipped to a ~12px sliver and its centre covered.** Section 8
   grows every drawer icon button to the 44px touch minimum, but the app sizes
   this header for 28px buttons: `_headerActions` is capped at
   `max-width: 60px` with `overflow: hidden`, and `_searchSlot` at 28px. Three
   44px controls no longer fit, so the third was clipped at the drawer edge and
   the list root covered its centre — measured: `elementFromPoint` at the button
   centre returned `DIV.bhn1Oq_root`, and only its leftmost ~12px was hittable.
   The header is re-flowed for 44px controls (the search slot takes the free
   space and right-aligns its icon; the actions row sizes to its two buttons), so
   the button sits fully inside the drawer and wins its hit test. The same
   control in the hero's 选择工作区 popover kept working the whole time, which is
   why the feature looked half-present rather than missing.

Both are now locked by the `workspaces` group in `test/e2e.py` — a hit test at
the button centre, a **real touch** opening the 选择工作区目录 dialog, the
`aria-expanded` toggle keeping the drawer open, and a session tap still
dismissing — plus four static checks in `test/contract.mjs`.

Also swept and found **already working** on a phone: the top-bar search (opens
the drawer with the field focused), the top-bar new-session, the hero's
选择工作区 popover (both the workspace item and 添加工作区…), per-row rename and
archive menus, session rename dialogs, settings section switching, the
`展开其余 N 个会话` expander, touch scrolling of the drawer list, and the model
popover (fits within 360px).

## Mobile audit — what else was checked, and what changed

A later pass enumerated every interactive control in a rich conversation (128 of
them) at 390×844, walked all 3,399 app CSS rules for `:hover`-gated visibility,
and exercised landscape, dark mode, the directory dialog and the settings
sections. Four things came out of it.

### 1. The plugin had silently disabled the app's own swipe gestures

Measured with the plugin **disabled**: an edge right-swipe opens the sidebar and
a left-swipe on the open sidebar closes it. Measured with the plugin **enabled**:
**neither works**. The cause is this plugin's own `!important` geometry — the
rail-free layout pins `_sidebarCol`'s width and visibility, which overrides the
inline width the app's drag writes while it animates, so the app's gesture has
nothing to move.

The plugin now reimplements both as threshold gestures (`EDGE_PX`,
`OPEN_SWIPE_PX`, `CLOSE_SWIPE_PX` in `src/mobile.js`): a touch that starts within
24px of the left edge and moves right >40px opens the drawer; a left-swipe >60px
on the open drawer closes it. Intent is checked against the vertical axis first,
so a vertical scroll that drifts sideways never toggles the drawer, and the whole
path is gated on the mobile viewport so a desktop touch screen is untouched.
Still a threshold flip of the app's own toggle — the plugin never drives the
app's state machine.

### 2. Conversation and composer controls were 28px

Every control in a rich conversation measured under 44px in one dimension. Many
are legitimately dense (tabs, breadcrumbs, pills), but the ones a phone user taps
constantly were all 28×28: message 复制 / 好的回答 / 有问题的回答 / 在新对话中分支,
the header's 更多操作 and 打开右侧边栏, and the composer's 指令 / 添加附件 /
permission / model / context / send controls.

Inflating them visually would re-flow rows the app lays out tightly (the reason
the composer was deliberately left dense). Instead a transparent `::after`
overlay grows the *hit* area — the same technique already used for the
right-sidebar close control. Insets are chosen against the measured gaps so
expanded targets only ever touch, never overlap: 28px boxes 8px apart grow by
`-8px -4px` (36×44), the composer's 28px boxes 12px apart by `-8px -5px`
(38×44), and the 34px send button by `-5px -6px`. The visual density is
unchanged; only the thumb target grows.

### 3. The workspace chevron was hover-only

`.YDXeBa_projectRow:hover .YDXeBa_chevron { display: inline-flex }` — so on a
touch screen a workspace row showed a folder but no sign that it opens. The
chevron is now force-shown on touch, with the app's own `_arrowOpen` state still
indicating expanded vs collapsed.

### 4. The browser chrome did not follow the theme

`syncSurface()` already borrowed the app's surface colour for the injected bar;
it now also writes it to a `theme-color` meta tag, so Android's address bar and
the iOS status-bar area match light and dark mode.

### 5. The ask_user_question card inherited the shell's frame geometry (看不到全文)

`_frame` is a generic suffix, and the question card's own frame (`<hash>_frame`)
matched this plugin's shell rules. Measured on a live card at 390×844: the frame
received the shell's **52px top-bar padding** and a forced `height: 100dvh`, and
the component's own `padding: calc(--dsh-composer-side-clearance + 16px)` left
only **296px of the 390px screen** for the text. The stock
`max-height: min(60vh, 520px)` then left ~270px for the options, so option 3 and
every description sat below an inner scroll with no visible affordance — the
on-device report was "看不到全文" with a screenshot showing option 2 cut off at
the footer.

The shell geometry is now scoped off any frame that is not the app shell
(`[class*="_frame"]:not(:has([class*="_sidebarCol"]))`), the card frame's side
padding drops to 8px on a phone (card **296 → 374px** wide), and the card's cap
rises to `min(86dvh, 780px)` so a full question fits without inner scrolling.
`findFrame()` prefers the shell frame too. `:has` is ignored by older browsers,
which then keep the previous behaviour rather than losing the shell rules.

### 6. Command '+' Menu & Input Focus Ergonomics (菜单防误唤软键盘)

In the stock desktop web app, clicking the '+' button in the composer keeps input
focused so desktop users can immediately use arrow keys. On touch devices, this
instantly popped up the virtual soft keyboard, eating half the screen before the
user even selected an option. Furthermore, tapping '+' a second time re-focused
the input rather than dismissing the popup.

The mobile adaptation intercepts the '+' interaction on mobile viewports:
- Blurs the textarea/editable element on open so the soft keyboard stays closed;
- Clicking '+' while the menu is open cleanly dismisses it;
- Clicking outside the menu (on the chat transcript) cleanly closes the menu;
- When switching sessions in the drawer, suppresses the automatic focus behavior
  that previously popped up the on-screen keyboard unexpectedly.

### 7. Compact Session Header & Reading Area Maximization (紧凑头部与阅读空间释放)

On mobile screens, the stock session header and tab strip forced a `76px` minimum
height and extensive padding. On mobile viewports:
- Header height and padding are compressed to compact ratios;
- Conversation tab gaps are reduced from 36px to 14px with scrollable overflow;
- The floating diff approval (Pending changes) panel is positioned below the 52px
  mobile topbar so its close button (`×`) is always visible and one-touch reachable,
  with auto-dismissal on mobile back gesture.

### Checked and already correct

Landscape 844×390 (full-width 52px bar, no overflow), dark mode (bar, drawer and
scrim all track the app's palette), the 选择工作区目录 dialog (folder rows
navigate, 新建文件夹 / 显示隐藏文件 / 取消 / 打开 all reachable), settings section
switching including 📁文件管理, the model and workspace popovers, drawer list
scrolling with 24 rows, and the top-bar search / new-session buttons. The
reasoning/thinking rows expand on tap too — the collapsed summary is a one-line
preview by design, and the full reasoning is reachable.

### Remaining known-dense areas (deliberate, not bugs)

- The settings 文件管理 toolbar icons are 14–21px wide (44px tall) and sit in a
  tight row; widening their hit area would overlap neighbours.
- The directory dialog's folder rows are 28px tall but 294px wide.
- The Plugin Market page is third-party UI (dshmarket) and still wider than a
  phone; it lives inside a horizontal scroller and is out of scope.

## Uninstall

```sh
dsh plugin --profile web remove dsh-mobile-web   # then restart dsh web
```

Removing the package removes the bundle from the profile; the injected
`<style id="dsh-mobile-web-style">` disappears with the page.

## Runtime API

For debugging and for the test suite:

```js
window.dshMobileWeb.version          // "1.0.0"
window.dshMobileWeb.isMobileViewport()
window.dshMobileWeb.state()          // {mobile, drawer, right, keyboard, hasScrim}
window.dshMobileWeb.openDrawer() / closeDrawer()
window.dshMobileWeb.disable() / enable()   // live CSS toggle
```

`html.dsh-mw-on` marks an adapted document; `html.dsh-mw-drawer` and
`html.dsh-mw-right` mark the overlay states.
