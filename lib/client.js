/*
 * dsh-mobile-web — GENERATED FILE, do not edit.
 * Source: src/mobile.css + src/mobile.js   Regenerate: node build.mjs
 */
window.__ModuleLoader__.load({
	id: "dsh-mobile-web",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/* The stylesheet, handed to the behaviour half for injection. */
		window.__DSH_MW_CSS__ = "/* ==========================================================================\n   dsh-mobile-web — full mobile-web adaptation for the DeepSeek Harness console\n   --------------------------------------------------------------------------\n   DESIGN RULE (the \"no desktop conflict\" guarantee)\n   Every single rule below lives inside the mobile gate. Above the gate this\n   stylesheet contributes exactly nothing, so the desktop console renders\n   bit-identically to a stock install. test/regression.py asserts this by\n   comparing layout metrics against a baseline captured before installation.\n\n   GATE\n   `max-width: 860px` — phones and small tablets in portrait. 860px sits below\n   the app's own ~1000px rail breakpoint, so the two compose rather than fight:\n   the app still owns collapsed/expanded state, we only change geometry.\n   `(max-height: 500px) and (pointer: coarse)` — landscape phones (e.g. a\n   932x430 iPhone), which are wide but short. The `pointer: coarse` half is\n   what keeps a short *desktop* window (mouse = fine pointer) untouched.\n\n   SELECTOR STRATEGY\n   The app uses CSS modules, so class names are `<hash>_<semantic>` (e.g.\n   `pI_x6G_sidebarCol`). Hashes change between builds; the semantic suffix does\n   not. Every selector here therefore matches on the suffix via [class*=\"_x\"],\n   which survives version bumps.\n   ========================================================================== */\n\n@media (max-width: 860px), ((max-height: 500px) and (pointer: coarse)) {\n\n  /* ------------------------------------------------------------------ *\n   * 1. Viewport, safe areas, on-screen keyboard                        *\n   * ------------------------------------------------------------------ */\n  :root {\n    /* Notch / home-indicator insets. Zero on devices without them. */\n    --dsh-mw-safe-t: env(safe-area-inset-top, 0px);\n    --dsh-mw-safe-b: env(safe-area-inset-bottom, 0px);\n    --dsh-mw-safe-l: env(safe-area-inset-left, 0px);\n    --dsh-mw-safe-r: env(safe-area-inset-right, 0px);\n    /* Keyboard height, published by the JS half from visualViewport. */\n    --dsh-mw-kb: 0px;\n    /* Height of the injected navigation bar (safe-area inset is added on top). */\n    --dsh-mw-topbar-h: 52px;\n  }\n\n  html {\n    /* Stop iOS/Android text inflation from breaking every measurement. */\n    -webkit-text-size-adjust: 100%;\n    text-size-adjust: 100%;\n  }\n\n  html, body {\n    /* No rubber-band pull-to-refresh chaining into the app shell. */\n    overscroll-behavior-y: none;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 2. App frame — keep the rail, never let the drawer squeeze content  *\n   * ------------------------------------------------------------------ *\n   * The app writes its geometry inline, e.g.\n   *   closed:  grid-template-columns: 56px  minmax(0px, 1fr) 0px\n   *   open:    grid-template-columns: 280px minmax(0px, 1fr) 0px\n   * On a 390px phone the \"open\" value crushes the content column to 110px\n   * (and to 40px at 320px). We pin the first track to the rail width so the\n   * content keeps its full width in BOTH states, and the expanded sidebar is\n   * floated over the content by rule 3 instead.\n   *\n   * The inline value stays readable from JS, which is how the behaviour half\n   * detects the open/closed transition. */\n  [class*=\"_frame\"] {\n    box-sizing: border-box !important;\n    height: 100dvh !important;\n    min-height: 100dvh !important;\n  }\n\n  /* The rail-free layout is gated on `html.dsh-mw-on`, which the behaviour half\n     sets only once it has actually built the replacement top bar. If that script\n     ever fails to run, the stock rail stays visible and navigation still works:\n     the failure degrades to \"unadapted\", never to \"no navigation at all\". */\n  html.dsh-mw-on [class*=\"_frame\"] {\n    grid-template-columns: 0px minmax(0, 1fr) 0px !important;\n    /* Reserve the top bar's height. The bar is `position: fixed`, so this\n       padding is what keeps the columns from sliding underneath it — no\n       child-height hacks, and inner scroll areas keep working. */\n    padding-top: calc(var(--dsh-mw-topbar-h) + var(--dsh-mw-safe-t)) !important;\n  }\n\n  /* `_frame` is a GENERIC suffix. The ask_user_question card's own frame\n     (`<hash>_frame`) matches the shell rules above too — measured on a live\n     question card at 390x844: it received the shell's 52px top-bar padding and\n     a forced `height: 100dvh`, which shifted the card inside a full-height\n     block and wasted a third of the room the question and its options need.\n     Undo the shell geometry on any frame that is not the app shell. The shell\n     is the only frame containing the sidebar column, and `:has` is ignored by\n     older browsers, which then keep the previous behaviour instead of losing\n     the shell rules. */\n  html.dsh-mw-on [class*=\"_frame\"]:not(:has([class*=\"_sidebarCol\"])) {\n    grid-template-columns: none !important;\n    height: auto !important;\n    min-height: 0 !important;\n    /* The component's own padding is `6px calc(clearance + 16px) 10px`, which\n       left only 296px of a 390px phone for the question text. */\n    padding: 6px 8px 10px !important;\n  }\n\n  /* A phone has to fit a whole question. The stock cap is `min(60vh, 520px)`,\n     and once a long question wrapped, that left ~270px for the options — so\n     option 3 and the descriptions sat below an inner scroll with no visible\n     affordance (reported as \"看不到全文\"). 86dvh fits one full question. */\n  html.dsh-mw-on [class*=\"_frame\"]:not(:has([class*=\"_sidebarCol\"])) [class*=\"_card\"] {\n    max-height: min(86dvh, 780px) !important;\n  }\n\n  /* Grid children must be allowed to shrink, or long code/URLs blow the\n     column past the viewport and create a horizontal scrollbar. */\n  [class*=\"_centerCol\"],\n  [class*=\"_rightbarCol\"] {\n    min-width: 0 !important;\n    max-width: 100vw;\n  }\n\n  /* Pin each column to its own track.\n     Without this, lifting the sidebar out of flow lets the grid auto-place the\n     remaining children one track to the left — the content column lands in the\n     zero-width track and collapses. Measured, not theorised: centerCol went to\n     exactly 56px on every phone viewport before these lines existed. */\n  [class*=\"_sidebarCol\"]  { grid-column: 1 !important; grid-row: 1 !important; }\n  [class*=\"_centerCol\"]   { grid-column: 2 !important; grid-row: 1 !important; }\n  [class*=\"_rightbarCol\"] { grid-column: 3 !important; grid-row: 1 !important; }\n\n  /* The rail is hidden, but deliberately NOT with `display: none`.\n     The app renders the Settings dialog INSIDE this column (measured: the\n     hidden ancestor of `VOzbGW_overlay` was `pI_x6G_sidebarCol`), so\n     `display: none` here silently killed the whole settings panel — the panel\n     opened and measured 0x0. `visibility` hides the rail while letting that\n     dialog opt back in, and it still leaves the buttons clickable for the top\n     bar (a programmatic .click() fires React's handler regardless). */\n  html.dsh-mw-on [class*=\"_sidebarCol\"] {\n    visibility: hidden !important;\n    width: 0 !important;\n    min-width: 0 !important;\n  }\n  html.dsh-mw-on [class*=\"_sidebarCol\"] [class*=\"_overlay\"] { visibility: visible !important; }\n\n  /* ------------------------------------------------------------------ *\n   * 3. Expanded sidebar becomes an overlay drawer                       *\n   * ------------------------------------------------------------------ *\n   * Closed  -> hidden entirely (rule 2 above); navigation is in the top bar.\n   * Open    -> the app has widened the column; we un-hide it, lift it out of\n   *            the grid, overlay it on the content and add a scrim behind. */\n  html.dsh-mw-drawer [class*=\"_sidebarCol\"] {\n    display: block !important;\n    visibility: visible !important;\n    position: fixed !important;\n    top: 0 !important;\n    bottom: 0 !important;\n    left: 0 !important;\n    width: min(285px, 76vw) !important;\n    height: 100dvh !important;\n    z-index: 70 !important;\n    margin: 0 !important;\n    box-shadow: 0 0 0 1px rgba(0, 0, 0, .06), 0 18px 48px rgba(0, 0, 0, .30);\n    overscroll-behavior: contain;\n    -webkit-overflow-scrolling: touch;\n    padding-top: var(--dsh-mw-safe-t);\n    padding-bottom: var(--dsh-mw-safe-b);\n    padding-left: max(6px, var(--dsh-mw-safe-l)) !important;\n    padding-right: 6px !important;\n    animation: dsh-mw-drawer-in .2s cubic-bezier(.22, .61, .36, 1);\n  }\n\n  @keyframes dsh-mw-drawer-in {\n    from { transform: translateX(-14px); opacity: .55; }\n    to   { transform: none; opacity: 1; }\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 3b. Injected top bar — replaces the left rail                       *\n   * ------------------------------------------------------------------ *\n   * Every button drives the app's OWN control (which is still in the DOM,\n   * just hidden), so new-session / search / settings keep the app's real\n   * behaviour and this bar owns no logic beyond forwarding a click.\n   *\n   * `--dsh-mw-surface` is filled in at runtime from the app's own computed\n   * background colour, so the bar matches light AND dark themes without a\n   * hardcoded colour. */\n  .dsh-mw-topbar {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    z-index: 60;\n    display: flex;\n    align-items: center;\n    gap: 2px;\n    box-sizing: border-box;\n    height: calc(var(--dsh-mw-topbar-h) + var(--dsh-mw-safe-t));\n    padding-top: var(--dsh-mw-safe-t);\n    padding-left: max(6px, var(--dsh-mw-safe-l));\n    padding-right: max(6px, var(--dsh-mw-safe-r));\n    background: var(--dsh-mw-surface, #fff);\n    border-bottom: 1px solid rgba(127, 127, 127, .20);\n    -webkit-backdrop-filter: blur(12px);\n    backdrop-filter: blur(12px);\n  }\n\n  /* Push the settings button to the far right. */\n  .dsh-mw-topbar__spacer { flex: 1 1 auto; }\n\n  .dsh-mw-topbar button {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 44px;\n    height: 44px;\n    padding: 0;\n    border: 0;\n    border-radius: 12px;\n    background: transparent;\n    color: inherit;\n    cursor: pointer;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n    -webkit-user-select: none;\n    user-select: none;\n  }\n  .dsh-mw-topbar button:active { background: rgba(127, 127, 127, .18); }\n  .dsh-mw-topbar button svg { display: block; pointer-events: none; }\n\n  /* While the drawer is open it provides the navigation, and the scrim dims\n     everything behind it. Leaving the bar visible put a lone settings icon on\n     top of the darkened area — so the bar hides with the rest. */\n  html.dsh-mw-drawer .dsh-mw-scrim { z-index: 55; }\n  html.dsh-mw-drawer .dsh-mw-topbar { visibility: hidden; }\n\n  /* Scrim — created and owned by the JS half. */\n  .dsh-mw-scrim {\n    position: fixed;\n    inset: 0;\n    z-index: 65;\n    background: rgba(0, 0, 0, .42);\n    opacity: 0;\n    pointer-events: none;\n    transition: opacity .2s ease;\n    -webkit-tap-highlight-color: transparent;\n  }\n  html.dsh-mw-drawer .dsh-mw-scrim {\n    opacity: 1;\n    pointer-events: auto;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 4. Right sidebar — full-screen sheet instead of a squeezed column   *\n   * ------------------------------------------------------------------ */\n  html.dsh-mw-right [class*=\"_rightbarCol\"] {\n    position: fixed !important;\n    inset: 0 !important;\n    width: 100vw !important;\n    max-width: 100vw !important;\n    height: 100dvh !important;\n    z-index: 68 !important;\n  }\n  html.dsh-mw-right [class*=\"_rightbarCol\"] > * {\n    width: 100% !important;\n    max-width: 100vw !important;\n    height: 100dvh !important;\n    padding-top: var(--dsh-mw-safe-t);\n    padding-bottom: var(--dsh-mw-safe-b);\n  }\n\n  /* The app presents a file preview as a fullscreen right panel and puts its\n     own close control (收起右侧边栏) in the top-right corner — the exact spot the\n     injected bar's settings button occupies. Measured: the bar won the hit test\n     (`elementFromPoint` at the close button returned\n     `BUTTON.dsh-mw-topbar__settings`), so opening a file left NO WAY BACK to\n     the conversation. While the app owns the screen fullscreen, the bar yields;\n     the app's own control is the way back. */\n  html.dsh-mw-rightfull .dsh-mw-topbar { visibility: hidden; }\n\n  /* That control is 28px in the app's header. Expand its hit area to the 44px\n     touch minimum with an overlay rather than by resizing it, so the panel\n     header's layout is untouched. */\n  html.dsh-mw-rightfull [class*=\"_iconButton\"] { position: relative; }\n  html.dsh-mw-rightfull [class*=\"_iconButton\"]::after {\n    content: '';\n    position: absolute;\n    inset: -8px;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 5. Settings modal overlay — modern mobile card & capsule design    *\n   * ------------------------------------------------------------------ *\n   * Replaced the clunky desktop-style split column with an ultra-clean\n   * iOS / Material style layout:\n   *  - Top header with Title + floating circular Close button\n   *  - Horizontal swipeable capsule pills for categories\n   *  - Clean grouped cards with subtle borders & soft elevation\n   *  - Maximize content readability and thumb-friendly touch targets   */\n  [class*=\"_overlay\"] > [class*=\"_panel\"] {\n    display: flex !important;\n    flex-direction: column !important;\n    width: 100vw !important;\n    max-width: 100vw !important;\n    height: 100dvh !important;\n    max-height: 100dvh !important;\n    border-radius: 0 !important;\n    margin: 0 !important;\n    background: var(--dsw-alias-bg-module-platform, #f6f8fa) !important;\n  }\n\n  [class*=\"_overlay\"] > [class*=\"_panel\"] > [class*=\"_nav\"] {\n    flex: 0 0 auto !important;\n    width: 100% !important;\n    max-width: none !important;\n    height: auto !important;\n    max-height: none !important;\n    padding: calc(var(--dsh-mw-safe-t) + 8px) 16px 10px !important;\n    background: var(--dsw-alias-bg-base, #ffffff) !important;\n    border-right: none !important;\n    border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .06)) !important;\n    overflow: visible !important;\n    display: flex !important;\n    flex-direction: column !important;\n    gap: 10px !important;\n    box-sizing: border-box !important;\n  }\n\n  [class*=\"_overlay\"] [class*=\"_navTitle\"] {\n    display: flex !important;\n    align-items: center !important;\n    font-size: 20px !important;\n    font-weight: 700 !important;\n    letter-spacing: -0.4px !important;\n    color: var(--dsw-alias-label-primary, #111) !important;\n    margin: 0 !important;\n    padding: 0 2px !important;\n    min-height: 36px !important;\n  }\n\n  [class*=\"_overlay\"] [class*=\"_navList\"] {\n    display: flex !important;\n    flex-direction: row !important;\n    align-items: center !important;\n    gap: 8px !important;\n    overflow-x: auto !important;\n    overflow-y: hidden !important;\n    margin: 0 -16px 0 !important;\n    padding: 2px 16px 4px !important;\n    scrollbar-width: none !important;\n    -webkit-overflow-scrolling: touch !important;\n  }\n  [class*=\"_overlay\"] [class*=\"_navList\"]::-webkit-scrollbar {\n    display: none !important;\n  }\n\n  [class*=\"_overlay\"] [class*=\"_navList\"] button {\n    display: inline-flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    gap: 6px !important;\n    padding: 6px 14px !important;\n    border-radius: 999px !important;\n    font-size: 13px !important;\n    font-weight: 500 !important;\n    white-space: nowrap !important;\n    flex-shrink: 0 !important;\n    min-height: 32px !important;\n    background: var(--dsw-alias-bg-module-platform, rgba(0, 0, 0, .05)) !important;\n    color: var(--dsw-alias-label-secondary, #666) !important;\n    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .05)) !important;\n    transition: all .16s ease !important;\n  }\n  [class*=\"_overlay\"] [class*=\"_navList\"] button[class*=\"_active\"] {\n    background: var(--dsw-alias-label-primary, #111) !important;\n    color: var(--dsw-alias-label-primary-foreground, #fff) !important;\n    border-color: transparent !important;\n    font-weight: 600 !important;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, .15) !important;\n  }\n\n  [class*=\"_overlay\"] > [class*=\"_panel\"] > [class*=\"_content\"] {\n    flex: 1 1 auto !important;\n    width: 100% !important;\n    min-width: 0 !important;\n    overflow-y: auto !important;\n    padding: 12px 14px max(24px, var(--dsh-mw-safe-b)) !important;\n    background: transparent !important;\n    box-sizing: border-box !important;\n    -webkit-overflow-scrolling: touch;\n  }\n\n  [class*=\"_overlay\"] [class*=\"_content\"] [class*=\"_header\"] {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: flex-start !important;\n    padding: 0 2px 10px !important;\n    min-height: 0 !important;\n  }\n  [class*=\"_overlay\"] [class*=\"_content\"] [class*=\"_close\"] {\n    position: fixed !important;\n    top: calc(var(--dsh-mw-safe-t) + 8px) !important;\n    right: 14px !important;\n    z-index: 10 !important;\n    width: 32px !important;\n    height: 32px !important;\n    border-radius: 50% !important;\n    background: var(--dsw-alias-bg-module-platform, rgba(0, 0, 0, .05)) !important;\n    border: none !important;\n    color: var(--dsw-alias-label-primary, #111) !important;\n    display: inline-flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n  }\n\n  [class*=\"_overlay\"] [class*=\"_content\"] [class*=\"_section\"] {\n    background: var(--dsw-alias-bg-base, #fff) !important;\n    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .06)) !important;\n    border-radius: 16px !important;\n    padding: 16px 14px !important;\n    margin-bottom: 14px !important;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, .03) !important;\n  }\n\n  /* Generic dialogs: never wider than the screen. */\n  [role=\"dialog\"] {\n    max-width: 100vw !important;\n    max-height: 100dvh !important;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 6. Composer — above the keyboard, clear of the home indicator       *\n   * ------------------------------------------------------------------ */\n  [class*=\"_composerSeat\"],\n  [class*=\"_composerStack\"] {\n    padding-left: max(10px, var(--dsh-mw-safe-l)) !important;\n    padding-right: max(10px, var(--dsh-mw-safe-r)) !important;\n    /* Only the home-indicator inset. The keyboard is NOT compensated here.\n       An earlier revision added `+ var(--dsh-mw-kb)`, which inflated this box\n       instead of lifting it: measured at 390x844, the seat went from 275px tall\n       at y=311 to 875px tall at y=11 with 300px of bottom padding — the\n       composer drifted into the middle of the screen with a large empty gap\n       below it, exactly as reported on-device. The viewport meta now declares\n       `interactive-widget=resizes-content`, so the browser shrinks the layout\n       viewport itself and the app's own 100dvh frame does the right thing. */\n    padding-bottom: var(--dsh-mw-safe-b) !important;\n  }\n\n  /* iOS Safari zooms the whole page when a field under 16px receives focus.\n     Forcing 16px is the standard fix and is why this is !important. */\n  input,\n  textarea,\n  select,\n  [contenteditable=\"true\"],\n  [class*=\"_input\"] {\n    font-size: 16px !important;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 7. Content — nothing may overflow the viewport sideways             *\n   * ------------------------------------------------------------------ *\n   * `overflow-x: clip`, NEVER `overflow-x: hidden`, on anything that is\n   * not already a scroll container.\n   *\n   * CSS Overflow 3: when one axis is `visible` and the other is neither\n   * `visible` nor `clip`, the `visible` axis is forced to compute to\n   * `auto`. `_body` is the app's plain non-scrolling flex wrapper\n   * (`overflow: visible`), so `overflow-x: hidden` silently promoted its\n   * `overflow-y` to `auto` — making `_body` a SECOND scroll container\n   * nested inside the app's real one, `_scrollBody`. Two nested touch\n   * scrollers with `overscroll-behavior: contain` on both is what made\n   * conversation panning intermittent.\n   *\n   * Measured on the live console, 390x844, one long transcript, six\n   * CDP touch swipes of 370px each, reading scrollTop before/after:\n   *\n   *   rule as `hidden`  _body overflow-y=auto    3/6 swipes moved 0px\n   *                     (deltas: 0, +40, -355, -355, 0, 0)\n   *   rule as `clip`    _body overflow-y=visible 6/6 swipes moved -355px\n   *   rule removed      _body overflow-y=visible 6/6 swipes moved -355px\n   *\n   * `clip` contains the sideways overflow without creating a scroll\n   * container, so `_body` keeps `overflow-y: visible` and the app's own\n   * scroller stays the only one in the chain.\n   *\n   * `_scrollBody` is deliberately NOT overridden any more: the app already\n   * gives it `overflow-x: auto`, and forcing `hidden` there turned wide\n   * code blocks and tables into clipped, unreachable content. */\n  [class*=\"_centerCol\"] [class*=\"_body\"] {\n    max-width: 100vw;\n    overflow-x: clip !important;\n  }\n\n  /* Keep the app's scroller from chaining its overscroll into the page.\n     This is the one declaration here that is safe on a real scroller. */\n  [class*=\"_scrollBody\"] {\n    overscroll-behavior: contain;\n    -webkit-overflow-scrolling: touch;\n  }\n\n  /* Code, tables and other intrinsically wide blocks scroll inside\n     themselves rather than stretching the page. */\n  pre,\n  table,\n  code,\n  [class*=\"_code\"] {\n    max-width: 100% !important;\n  }\n  pre,\n  table {\n    overflow-x: auto !important;\n    -webkit-overflow-scrolling: touch;\n  }\n\n  img,\n  video,\n  canvas {\n    max-width: 100% !important;\n    height: auto;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 8. Touch ergonomics                                                 *\n   * ------------------------------------------------------------------ *\n   * 44px is the iOS HIG / Material minimum. Applied to the persistent\n   * navigation surfaces (rail, drawer, settings nav) where a mis-tap is\n   * costly. The composer toolbar is deliberately left dense — it is a\n   * tightly packed row by design and inflating it would wrap the layout. */\n  [class*=\"_sidebarCol\"] button,\n  [class*=\"_sidebarCol\"] [role=\"button\"],\n  [class*=\"_sidebarCol\"] a {\n    min-height: 44px;\n  }\n  [class*=\"_sidebarCol\"] [class*=\"_iconButton\"],\n  [class*=\"_sidebarCol\"] [class*=\"_toggle\"] {\n    min-width: 44px;\n    min-height: 44px;\n  }\n\n  [class*=\"_overlay\"] > [class*=\"_panel\"] > [class*=\"_nav\"] button,\n  [class*=\"_overlay\"] > [class*=\"_panel\"] > [class*=\"_nav\"] [role=\"button\"] {\n    min-height: 44px;\n  }\n\n  /* Kill the 300ms double-tap-zoom delay on every control, and stop long-press\n     from selecting button labels. */\n  button,\n  a,\n  [role=\"button\"],\n  [class*=\"_trigger\"],\n  [class*=\"_seat\"],\n  [class*=\"_tab\"] {\n    touch-action: manipulation;\n    -webkit-user-select: none;\n    user-select: none;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 9. Session list rows inside the drawer                              *\n   * ------------------------------------------------------------------ */\n  html.dsh-mw-drawer [class*=\"_listArea\"] {\n    max-height: none !important;\n    overflow-y: auto !important;\n    -webkit-overflow-scrolling: touch;\n  }\n\n  /* The workspaces header is sized by the app for its 28px icon buttons:\n     `_searchSlot` is capped at 28px and `_headerActions` is a fixed 60px with\n     `overflow: hidden`. Section 8 then grows every icon button to the 44px\n     touch minimum, so the third control — 添加工作区 (new workspace) — no\n     longer fits: it was clipped to a ~12px sliver at the drawer's edge and the\n     list root covered its centre (measured: `elementFromPoint` at the button\n     centre returned `DIV.bhn1Oq_root`). \"New workspace\" was therefore\n     unreachable from the sidebar on a phone, while the same control in the\n     hero's 选择工作区 popover still worked. Re-flow the header for 44px\n     controls: the search slot takes the free space and right-aligns its icon,\n     and the actions row sizes to its two buttons. Desktop is untouched — this\n     is inside `html.dsh-mw-drawer`, which only exists under the gate. */\n  html.dsh-mw-drawer [class*=\"_sectionHeader\"] {\n    overflow: visible !important;\n  }\n  html.dsh-mw-drawer [class*=\"_sectionHeader\"] [class*=\"_searchSlot\"] {\n    max-width: none !important;\n    margin-left: 0 !important;\n    justify-content: flex-end !important;\n  }\n  html.dsh-mw-drawer [class*=\"_sectionHeader\"] [class*=\"_searchButton\"] {\n    min-width: 44px !important;\n  }\n  html.dsh-mw-drawer [class*=\"_sectionHeader\"] [class*=\"_headerActions\"] {\n    width: auto !important;\n    max-width: none !important;\n    flex: 0 0 auto !important;\n    overflow: visible !important;\n  }\n\n  /* Per-row action menus are HOVER-ONLY in the app:\n   *   .YDXeBa_sessionRow:hover .YDXeBa_rowActions,\n   *   .YDXeBa_sessionRow.YDXeBa_menuOpen .YDXeBa_rowActions { display: inline-flex }\n   * A touch screen has no hover, and the trigger lives *inside* the container\n   * it reveals, so it can never be tapped into existence. The entire per-row\n   * menu was therefore unreachable on a phone — for a session: 重命名 /\n   * 分叉会话 / **归档会话**; for a workspace: rename / delete / new session.\n   * That is a real feature loss, not a cosmetic one, and it is invisible to a\n   * desktop test run because a mouse reproduces the hover for free.\n   *\n   * Mirror the app's own hover state permanently. Descendant (not `>`) to\n   * match the shape of the app's own selectors, so a markup change to the\n   * wrapping element does not silently break reachability again. */\n  html.dsh-mw-on [class*=\"_sessionRow\"] [class*=\"_rowActions\"],\n  html.dsh-mw-on [class*=\"_projectRow\"] [class*=\"_rowActions\"] {\n    display: inline-flex !important;\n  }\n\n  /* In mobile session rows, show only the essential '⋯' menu trigger and\n     hide redundant inline pin/archive icons, giving the session title maximal\n     horizontal room to be fully readable. */\n  html.dsh-mw-on [class*=\"_sessionRow\"] {\n    padding: 0 6px !important;\n    gap: 4px !important;\n  }\n  html.dsh-mw-on [class*=\"_sessionRow\"] [class*=\"_title\"] {\n    flex: 1 1 auto !important;\n    min-width: 0 !important;\n  }\n  html.dsh-mw-on [class*=\"_sessionRow\"] [class*=\"_rowActions\"] {\n    gap: 2px !important;\n    margin-left: auto !important;\n  }\n  html.dsh-mw-on [class*=\"_sessionRow\"] [class*=\"_rowActions\"] > :not(:first-child) {\n    display: none !important;\n  }\n  html.dsh-mw-drawer [class*=\"_sessionRow\"] [class*=\"_iconButton\"],\n  html.dsh-mw-drawer [class*=\"_projectRow\"] [class*=\"_iconButton\"] {\n    width: 32px !important;\n    min-width: 32px !important;\n    height: 32px !important;\n    min-height: 32px !important;\n  }\n  html.dsh-mw-on [class*=\"_sessionRow\"] [class*=\"_time\"] {\n    font-size: 11px !important;\n    margin-right: 2px !important;\n    flex-shrink: 0 !important;\n  }\n\n  /* The app hides the timestamp while a row's actions are showing\n     (`.YDXeBa_sessionRow:hover .YDXeBa_time { display: none }`). On touch the\n     actions are always showing, so following that rule would delete the\n     relative time from every row on the phone. Keep it, and let the title\n     ellipsise instead — the menu costs width, not information. */\n\n  /* Rows are 32px tall in the app. That is under the 44px touch minimum for\n     the row itself, and it is also shorter than the 44px action button that\n     section 8 forces — so with the actions now visible the button would\n     overflow the row and overlap its neighbour. Grow the rows to fit both. */\n  html.dsh-mw-drawer [class*=\"_sessionRow\"],\n  html.dsh-mw-drawer [class*=\"_projectRow\"] {\n    min-height: 44px;\n  }\n\n  /* Manual reordering is HTML5 drag-and-drop in the app, which a touch screen\n     never initiates; the JS half re-dispatches the app's own drag events from a\n     long press. These two declarations are what let that long press be a drag\n     instead of a text selection / native callout. */\n  html.dsh-mw-on [class*=\"_sessionRow\"],\n  html.dsh-mw-on [class*=\"_projectRow\"] {\n    -webkit-touch-callout: none;\n    -webkit-user-select: none;\n    user-select: none;\n  }\n  /* While a reorder drag is live the list must not scroll under the finger. */\n  html.dsh-mw-dragging [class*=\"_listArea\"] {\n    overflow: hidden !important;\n  }\n  /* Long-press feedback: the row subtly scales while the 280 ms timer runs,\n     so the user knows the gesture was recognised before the drag starts. */\n  html.dsh-mw-drawer .dsh-mw-pressing {\n    transform: scale(.98);\n    transition: transform .18s ease;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 10. Touch hit areas — keep the app's density, grow the target       *\n   * ------------------------------------------------------------------ *\n   * The app renders its conversation and composer controls at 28px (and the\n   * send button at 34px). Inflating them visually would re-flow rows the app\n   * lays out tightly — the reason the composer was left dense on purpose. But\n   * 28px is well under the 44px touch minimum, and a phone user taps these\n   * constantly: message 复制 / 好的回答 / 有问题的回答 / 在新对话中分支, the\n   * header's 更多操作 and 打开右侧边栏, and the composer's attach / model /\n   * permission / send controls.\n   *\n   * A transparent `::after` overlay grows the *hit* area without touching\n   * layout — the same technique already used for the right-sidebar close\n   * control. Insets are chosen against the measured gaps so expanded targets\n   * only ever touch, never overlap:\n   *\n   *   message actions + header corner   28px box, 8px apart  -> -8px / -4px\n   *   composer toolbar                  28px box, 12px apart -> -8px / -5px\n   *   composer send                     34px box, 12px apart -> -5px / -6px\n   *\n   * That yields 36x44 and 38x44 targets: the 44px dimension is the one that\n   * matters for a thumb, and the width stays inside the app's own spacing. */\n  html.dsh-mw-on [class*=\"_actions\"] > [class*=\"_action\"],\n  html.dsh-mw-on [class*=\"_headerCorner\"] button,\n  html.dsh-mw-on [class*=\"_moreButton\"],\n  html.dsh-mw-on [class*=\"_composerSeat\"] button[class*=\"_add\"],\n  html.dsh-mw-on [class*=\"_composerSeat\"] button[class*=\"_primary\"],\n  html.dsh-mw-on [class*=\"_composerSeat\"] button[class*=\"_trigger\"] {\n    position: relative;\n  }\n  html.dsh-mw-on [class*=\"_actions\"] > [class*=\"_action\"]::after,\n  html.dsh-mw-on [class*=\"_headerCorner\"] button::after,\n  html.dsh-mw-on [class*=\"_moreButton\"]::after {\n    content: '';\n    position: absolute;\n    inset: -8px -4px;\n  }\n  html.dsh-mw-on [class*=\"_composerSeat\"] button[class*=\"_add\"]::after,\n  html.dsh-mw-on [class*=\"_composerSeat\"] button[class*=\"_trigger\"]::after {\n    content: '';\n    position: absolute;\n    inset: -8px -5px;\n  }\n  html.dsh-mw-on [class*=\"_composerSeat\"] button[class*=\"_primary\"]::after {\n    content: '';\n    position: absolute;\n    inset: -5px -6px;\n  }\n\n  /* A workspace row is a FOLDER, but the app only reveals the expand/collapse\n     chevron on `:hover` (`.YDXeBa_projectRow:hover .YDXeBa_chevron`), so on a\n     touch screen the row gave no sign that it opens. Mirror the chevron — the\n     folder icon stays, and the app's own `_arrowOpen` state still shows whether\n     the folder is expanded or collapsed. */\n  html.dsh-mw-on [class*=\"_projectRow\"] [class*=\"_chevron\"] {\n    display: inline-flex !important;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 11. Full-screen modal / overlay sheets (insights panel etc.)       *\n   * ------------------------------------------------------------------ *\n   * On mobile, full-screen overlay panels (such as insights-kit) have\n   * their header/tabs and close control pushed down so they are not\n   * clipped behind the injected 52px top bar.                          */\n  div[style*=\"z-index: 9999\"],\n  div[style*=\"z-index:9999\"] {\n    padding-top: calc(var(--dsh-mw-topbar-h) + var(--dsh-mw-safe-t)) !important;\n    box-sizing: border-box !important;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 12. Compact Session Header & Tabs for Maximum Reading Area        *\n   * ------------------------------------------------------------------ */\n  html.dsh-mw-on [class*=\"_header\"] {\n    min-height: 0 !important;\n    padding: 4px 10px 4px 10px !important;\n  }\n  html.dsh-mw-on [class*=\"_titleRow\"] {\n    min-height: 28px !important;\n  }\n  html.dsh-mw-on [class*=\"_tabs\"] {\n    gap: 14px !important;\n    margin-top: 2px !important;\n    padding-left: 2px !important;\n    overflow-x: auto !important;\n    scrollbar-width: none !important;\n    -webkit-overflow-scrolling: touch;\n  }\n  html.dsh-mw-on [class*=\"_tabs\"]::-webkit-scrollbar {\n    display: none;\n  }\n  html.dsh-mw-on [class*=\"_tab\"] {\n    padding: 0 2px 4px !important;\n    font-size: 13px !important;\n    white-space: nowrap !important;\n  }\n  html.dsh-mw-on [class*=\"_scroll\"] {\n    padding: 8px 10px !important;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 13. Mobile Header Utilities & Badge Polish                         *\n   * ------------------------------------------------------------------ *\n   * The pending changes entry in mobile header utilities should display\n   * cleanly without an oversized black badge blocking adjacent icons.  */\n  html.dsh-mw-on [class*=\"_headerEntry\"] {\n    position: relative !important;\n    overflow: visible !important;\n  }\n  html.dsh-mw-on [class*=\"_headerEntryCount\"] {\n    top: -4px !important;\n    right: -6px !important;\n    min-width: 15px !important;\n    height: 15px !important;\n    padding: 0 3px !important;\n    font-size: 10px !important;\n    line-height: 15px !important;\n    border-radius: 8px !important;\n    background-color: var(--dsw-alias-state-business-primary, #2563eb) !important;\n    color: #fff !important;\n    box-shadow: 0 0 0 1.5px var(--dsw-alias-bg-base, #fff) !important;\n  }\n\n  /* ------------------------------------------------------------------ *\n   * 14. Diff Approval Panel (Pending Changes) Mobile Ergonomics        *\n   * ------------------------------------------------------------------ *\n   * The floating diff approval panel sits below the mobile top bar so\n   * its header and close button (×) are completely visible and easy to\n   * tap, allowing one-click return to the conversation.                */\n  html.dsh-mw-on [data-diff-approval-panel] {\n    top: calc(var(--dsh-mw-topbar-h) + var(--dsh-mw-safe-t) + 6px) !important;\n    bottom: max(12px, var(--dsh-mw-safe-b)) !important;\n    left: max(6px, var(--dsh-mw-safe-l)) !important;\n    right: max(6px, var(--dsh-mw-safe-r)) !important;\n    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25) !important;\n  }\n  html.dsh-mw-on [data-diff-approval-panel] > header {\n    min-height: 48px !important;\n    padding: 8px 12px !important;\n    background: var(--dsw-alias-bg-layer-2, var(--dsw-alias-bg-base)) !important;\n    border-bottom: 1px solid var(--dsw-alias-border-l2) !important;\n  }\n  html.dsh-mw-on [data-diff-approval-close] {\n    min-width: 36px !important;\n    min-height: 36px !important;\n    display: inline-flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    border-radius: 8px !important;\n    background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06)) !important;\n  }\n}\n\n/* ---------------------------------------------------------------------- *\n * Forced mode was removed                                              *\n * ---------------------------------------------------------------------- *\n * An earlier revision exposed `html.dsh-mw-force` so the mobile layout could\n * be previewed at a desktop size. It duplicated the whole gate, and after the\n * rail-free rework that duplication was a second source of truth that had\n * already drifted. The test suite drives real mobile viewports through\n * Playwright instead, so the copy bought nothing and was deleted. */\n\n";

/* ==== src/mobile.js ================================================== */
/* ==========================================================================
 * dsh-mobile-web — behaviour half
 * --------------------------------------------------------------------------
 * The stylesheet does the layout work. This file only does what CSS cannot:
 *
 *   1. publish the on-screen keyboard height from `visualViewport` so the
 *      composer can ride above the keyboard (CSS has no way to see it);
 *   2. mirror the app's own sidebar open/closed state onto <html> so the
 *      stylesheet can turn the expanded sidebar into an overlay drawer;
 *   3. own the scrim, Escape, and Android back-button dismissal;
 *   4. close the drawer after the user picks a session.
 *
 * It never drives the app's state machine: opening and closing is still the
 * app's own toggle button. We only observe and re-geometry.
 * ========================================================================== */

(function () {
	'use strict';

	// Idempotent: a hot reload or a second bundle instance must not double-bind.
	if (window.dshMobileWeb && window.dshMobileWeb.__installed) return;

	var VERSION = '1.0.0';

	/** The mobile gate, kept in sync with the stylesheet by hand. */
	var MOBILE_QUERY = '(max-width: 860px), ((max-height: 500px) and (pointer: coarse))';

	/** A first grid track wider than this means the app expanded the sidebar. */
	var EXPANDED_TRACK_MIN = 100;

	var root = document.documentElement;
	var cssText = window.__DSH_MW_CSS__ || '';

	/* ---------------------------------------------------------------- *
	 * CSS injection                                                     *
	 * ---------------------------------------------------------------- */
	var styleEl = document.getElementById('dsh-mobile-web-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'dsh-mobile-web-style';
		styleEl.setAttribute('data-dsh-plugin', 'dsh-mobile-web');
		(document.head || root).appendChild(styleEl);
	}
	if (cssText && styleEl.textContent !== cssText) styleEl.textContent = cssText;

	/* ---------------------------------------------------------------- *
	 * Viewport meta                                                     *
	 * ---------------------------------------------------------------- *
	 * `interactive-widget=resizes-content` tells the browser to shrink the
	 * LAYOUT viewport when the on-screen keyboard opens, instead of only the
	 * visual viewport. That makes the app's own `100dvh` frame resize with the
	 * keyboard, which is what actually keeps the composer in the right place —
	 * and it is why this plugin no longer hand-compensates the keyboard height.
	 * `viewport-fit=cover` is what makes the safe-area insets non-zero on
	 * notched devices. Unsupported values are ignored by other browsers, and
	 * the existing viewport meta is edited in place rather than duplicated. */
	function syncViewportMeta() {
		var meta = document.querySelector('meta[name="viewport"]');
		if (!meta) {
			meta = document.createElement('meta');
			meta.setAttribute('name', 'viewport');
			(document.head || root).appendChild(meta);
		}
		var parts = ['width=device-width', 'initial-scale=1', 'viewport-fit=cover',
			'interactive-widget=resizes-content'];
		var want = parts.join(', ');
		if (meta.getAttribute('content') !== want) meta.setAttribute('content', want);
	}

	/* ---------------------------------------------------------------- *
	 * Scrim                                                             *
	 * ---------------------------------------------------------------- */
	var scrim = document.createElement('div');
	scrim.className = 'dsh-mw-scrim';
	scrim.setAttribute('aria-hidden', 'true');

	function ensureScrim() {
		if (!scrim.isConnected) (document.body || root).appendChild(scrim);
	}

	/* ---------------------------------------------------------------- *
	 * Top bar — replaces the left rail                                  *
	 * ---------------------------------------------------------------- *
	 * Each button forwards a click to the app's own control. Those controls
	 * are still in the DOM (the stylesheet hides the rail with
	 * `display: none`, which does not stop a programmatic click from firing
	 * React's handler), so "new session", "search" and "settings" keep the
	 * app's real behaviour and this bar holds no logic of its own.
	 *
	 * The bar is only ever created while the mobile gate matches, which is why
	 * the stylesheet can keep every one of its rules inside the gate without
	 * needing an ungated `display: none` fallback. */
	var ICONS = {
		menu: '<path d="M3.5 6h13M3.5 10h13M3.5 14h13"/>',
		plus: '<path d="M10 4.5v11M4.5 10h11"/>',
		search: '<circle cx="9" cy="9" r="5"/><path d="M12.8 12.8 16.5 16.5"/>',
		settings: '<circle cx="10" cy="10" r="2.6"/><path d="M10 3.2v2M10 14.8v2M3.2 10h2M14.8 10h2M5.2 5.2l1.4 1.4M13.4 13.4l1.4 1.4M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4"/>',
	};

	var topbar = null;

	function svg(name) {
		return '<svg width="21" height="21" viewBox="0 0 20 20" fill="none" ' +
			'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
			'stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
	}

	/**
	 * How to find each app control the top bar drives.
	 *
	 * Class suffixes come first because they are LANGUAGE-INDEPENDENT: the app
	 * localises its `aria-label`s, so a Chinese browser renders 打开侧边栏 /
	 * 新建会话 / 搜索会话 / 设置 and every English label lookup silently returns
	 * nothing — which is exactly how the top bar shipped broken to a zh-CN
	 * device while passing an en-US test run. The aria labels are kept as a
	 * fallback for the (unlikely) case that a suffix is renamed.
	 */
	var CONTROLS = {
		menu: ['[class*="_toggle"]', '[aria-label="Open sidebar"]', '[aria-label="打开侧边栏"]'],
		plus: ['[class*="_newSession"]', '[aria-label="New session"]', '[aria-label="新建会话"]'],
		search: ['[class*="_searchButton"]', '[aria-label="Search sessions"]', '[aria-label="搜索会话"]'],
		settings: [
			'button[class*="_trigger"][class*="_rail"]',
			'[class*="_rail"] button[class*="_trigger"]',
			'[aria-label="Settings"]',
			'[aria-label="设置"]',
		],
	};

	/**
	 * Find the app's control for `kind`, preferring the one inside the sidebar.
	 *
	 * The `closest('.dsh-mw-topbar')` guard is load-bearing, not defensive
	 * noise: this bar's own buttons carry the English aria-labels, so an
	 * unguarded document-level lookup finds *our own button* and clicking it
	 * re-enters this handler — an infinite loop rather than a no-op.
	 */
	function railControl(kind) {
		var side = document.querySelector('[class*="_sidebarCol"]');
		var roots = side ? [side, document] : [document];
		var list = CONTROLS[kind] || [];
		for (var i = 0; i < roots.length; i++) {
			for (var j = 0; j < list.length; j++) {
				var el = roots[i].querySelector(list[j]);
				if (el && !el.closest('.dsh-mw-topbar')) return el;
			}
		}
		return null;
	}

	function makeButton(name, title) {
		var b = document.createElement('button');
		b.type = 'button';
		b.className = 'dsh-mw-topbar__' + name;
		b.setAttribute('aria-label', title);
		b.innerHTML = svg(name);
		b.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (name === 'menu') return openDrawer();
			var el = railControl(name);
			if (el) el.click();
		});
		return b;
	}

	function buildTopbar() {
		topbar = document.createElement('div');
		topbar.className = 'dsh-mw-topbar';
		topbar.setAttribute('role', 'toolbar');
		topbar.setAttribute('aria-label', 'Navigation');
		topbar.appendChild(makeButton('menu', 'Open navigation'));
		topbar.appendChild(makeButton('plus', 'New session'));
		topbar.appendChild(makeButton('search', 'Search sessions'));
		var spacer = document.createElement('div');
		spacer.className = 'dsh-mw-topbar__spacer';
		topbar.appendChild(spacer);
		topbar.appendChild(makeButton('settings', 'Settings'));
	}

	function ensureTopbar() {
		if (!isMobileViewport()) {
			// Outside the gate the stylesheet no longer applies, so the bar must
			// not exist at all — otherwise it would render unstyled on desktop.
			if (topbar && topbar.parentNode) topbar.parentNode.removeChild(topbar);
			return;
		}
		if (!topbar) buildTopbar();
		if (!topbar.isConnected) (document.body || root).appendChild(topbar);
	}

	/**
	 * The bar has to match the app's surface in both themes, and the app owns
	 * the palette. Rather than hardcode a colour, copy whatever the app is
	 * already painting its own columns with.
	 */
	function syncSurface() {
		if (!topbar) return;
		var probe = document.querySelector('[class*="_sidebarCol"]') ||
			document.querySelector('[class*="_centerCol"]');
		if (!probe) return;
		var bg = window.getComputedStyle(probe).backgroundColor;
		if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
			root.style.setProperty('--dsh-mw-surface', bg);
			// Keep the browser's own chrome in step with the app: on Android the
			// address bar, on iOS the status-bar area. Created once, edited in
			// place afterwards so a theme switch updates it rather than adding a
			// second tag.
			var meta = document.querySelector('meta[name="theme-color"]');
			if (!meta) {
				meta = document.createElement('meta');
				meta.setAttribute('name', 'theme-color');
				(document.head || root).appendChild(meta);
			}
			if (meta.getAttribute('content') !== bg) meta.setAttribute('content', bg);
		}
	}

	/* ---------------------------------------------------------------- *
	 * State                                                             *
	 * ---------------------------------------------------------------- */
	var frame = null;
	var observedFrame = null;
	var frameObserver = null;
	var domObserver = null;
	var drawerOpen = false;
	var keyboardHeight = 0;
	var pushedHistory = false;

	function isMobileViewport() {
		try {
			return window.matchMedia(MOBILE_QUERY).matches;
		} catch (e) {
			return window.innerWidth <= 860;
		}
	}

	function findFrame() {
		// `_frame` is a generic suffix — the ask_user_question card's frame
		// carries it too. Prefer the shell frame (the one containing the sidebar
		// column) so a live question card can never be mistaken for the app
		// frame, with the broad lookup kept as a fallback.
		return document.querySelector('[class*="_frame"]:has([class*="_sidebarCol"])') ||
			document.querySelector('[class*="_frame"]');
	}

	/**
	 * The app writes its geometry inline:
	 *   closed: grid-template-columns: 56px  minmax(0px, 1fr) 0px
	 *   open:   grid-template-columns: 280px minmax(0px, 1fr) 0px
	 * `!important` in the stylesheet overrides the *computed* value but leaves
	 * the inline attribute readable, which is exactly the signal we want.
	 */
	function readTracks() {
		if (!frame) return { first: 0, third: 0 };
		var inline = frame.style.gridTemplateColumns || '';
		if (!inline) return { first: 0, third: 0 };
		var px = inline.match(/(\d+(?:\.\d+)?)px/g) || [];
		var first = px.length ? parseFloat(px[0]) : 0;
		var third = px.length >= 3 ? parseFloat(px[px.length - 1]) : 0;
		return { first: first, third: third };
	}

	/**
	 * Geometry first, because it is LANGUAGE-INDEPENDENT: the app localises the
	 * toggle's label (打开侧边栏 / 收起侧边栏 in zh-CN), so a label-only check
	 * reports "closed" forever on a localised device. The label is kept as a
	 * fallback for the case where the inline geometry is missing.
	 */
	function readSidebarOpen(firstTrack) {
		if (firstTrack === undefined) firstTrack = readTracks().first;
		if (firstTrack > EXPANDED_TRACK_MIN) return true;
		var el = document.querySelector('[class*="_sidebarCol"] [class*="_toggle"]') ||
			document.querySelector('[class*="_toggle"]');
		var label = el ? (el.getAttribute('aria-label') || '') : '';
		return /Collapse|Close|收起|关闭/.test(label);
	}

	function sync() {
		if (!isMobileViewport()) {
			// Leaving the gate: hand the layout back to the app untouched.
			root.classList.remove('dsh-mw-drawer', 'dsh-mw-right');
			drawerOpen = false;
			return;
		}

		ensureScrim();
		ensureTopbar();
		syncSurface();

		// Read tracks once — readSidebarOpen() also calls readTracks(),
		// so passing the result avoids a redundant regex scan per frame.
		var tracks = readTracks();
		var open = readSidebarOpen(tracks.first);
		root.classList.toggle('dsh-mw-drawer', open);

		var right = tracks.third > 0;
		root.classList.toggle('dsh-mw-right', right);

		// The app presents a file preview as a fullscreen right panel and puts
		// its OWN close control (收起右侧边栏) in the top-right corner — the exact
		// spot this bar's settings button occupies. The bar sat above it in the
		// stacking order and swallowed the tap, so opening a file left no way
		// back to the conversation. While the app owns the screen fullscreen,
		// the bar gets out of the way; the app's own control is the way back.
		var fullRight = !!frame &&
			frame.getAttribute('data-rightbar-fullscreen') !== null;
		root.classList.toggle('dsh-mw-rightfull', fullRight);

		if (open && !drawerOpen) onDrawerOpened();
		else if (!open && drawerOpen) onDrawerClosed();
	}

	/* ---------------------------------------------------------------- *
	 * Drawer lifecycle                                                  *
	 * ---------------------------------------------------------------- */
	function onDrawerOpened() {
		drawerOpen = true;
		// Android hardware back should close the drawer, not leave the app.
		try {
			history.pushState({ dshMobileWeb: 'drawer' }, '');
			pushedHistory = true;
		} catch (e) { /* history may be unavailable in exotic embeds */ }
	}

	function onDrawerClosed() {
		drawerOpen = false;
		if (pushedHistory) {
			pushedHistory = false;
			try { history.back(); } catch (e) { /* ignore */ }
		}
	}

	/**
	 * The app's sidebar toggle is the SAME element in both directions — its
	 * label flips between "Open sidebar"/"Collapse sidebar" (打开/收起 in
	 * zh-CN). So both directions resolve it the same, language-independent way.
	 *
	 * Both are guarded by the current state: the control is a TOGGLE, so an
	 * unguarded closeDrawer() on an already-closed drawer would open it. That
	 * is not hypothetical — it is what the scrim-tap-then-close sequence does.
	 */
	function closeDrawer() {
		if (!readSidebarOpen()) return;
		var el = railControl('menu');
		if (el) el.click();
		else root.classList.remove('dsh-mw-drawer');
	}

	function openDrawer() {
		if (readSidebarOpen()) return;
		var el = railControl('menu');
		if (el) el.click();
	}

	function dismissOverlays() {
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		var diffPanel = document.querySelector('[data-diff-approval-panel]');
		if (diffPanel) {
			window.dispatchEvent(new CustomEvent('diff-approval:toggle-panel'));
		}
	}

	window.addEventListener('popstate', function () {
		dismissOverlays();
		if (drawerOpen) {
			pushedHistory = false; // the state was already consumed
			closeDrawer();
		}
	});

	window.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') {
			var diffPanel = document.querySelector('[data-diff-approval-panel]');
			if (diffPanel) {
				window.dispatchEvent(new CustomEvent('diff-approval:toggle-panel'));
			}
			if (drawerOpen) closeDrawer();
		}
	});

	scrim.addEventListener('click', function () { closeDrawer(); });

	/* ---------------------------------------------------------------- *
	 * Selecting a session / workspace should dismiss the drawer         *
	 * ---------------------------------------------------------------- *
	 * Deliberately narrow: only a real session or workspace row dismisses the
	 * drawer. An earlier version matched anything inside `_regionArea`, which
	 * also fired on the "Workspaces" section header — observed in the browser
	 * walkthrough, where tapping that header closed the drawer without
	 * selecting anything. */
	function onSidebarClick(e) {
		if (!drawerOpen) return;
		var el = e.target;
		if (!el || el.nodeType !== 1) return;
		// Never dismiss while the user is typing.
		if (el.closest('input, textarea, select, [contenteditable="true"]')) return;
		// STRUCTURAL, and therefore language-independent: the per-row menu
		// trigger lives inside `_rowActions`. Matching only the English word
		// "actions" is precisely what broke this on a zh-CN device — the app
		// renders 会话"x"的操作 / 工作区"x"的操作, the regex missed, and the
		// drawer slammed shut the instant the user tapped ⋯ to reach 归档会话.
		// The menu never got a chance to appear, so archive/rename/fork read as
		// "missing features" rather than as a dismissed drawer.
		if (el.closest('[class*="_rowActions"]')) return;
		// Localised fallback, for the case where the suffix is ever renamed.
		var labelled = el.closest('[aria-label]');
		var label = labelled ? (labelled.getAttribute('aria-label') || '') : '';
		if (/actions|操作|Collapse|Close|收起|关闭|Search|搜索|Add workspace|添加工作区|View options|视图选项|Update|Delete|Rename|重命名|删除|归档|分叉/i.test(label)) return;
		// Only selecting a SESSION dismisses the drawer. A workspace row is a
		// FOLDER in the tree: the app toggles its `aria-expanded` on click, and
		// dismissing here made the folder impossible to open — measured on a
		// phone, tapping 工作区 closed the drawer instead of expanding it, which
		// is the "打不开文件夹" report. Every button that lives inside a
		// workspace row (its ⋯ menu, 在"x"中新建会话) already returned above, so
		// the row's own click is the only thing left here.
		if (!el.closest('[class*="_sessionRow"]')) return;
		// Dismiss any modal/insights sheet that might be overlaying the conversation
		dismissOverlays();
		// Let the app process the selection first, then get out of the way.
		setTimeout(closeDrawer, 80);
	}

	/* ---------------------------------------------------------------- *
	 * Mobile command '+' button touch ergonomics                        *
	 * ---------------------------------------------------------------- *
	 * In the desktop app, clicking '+' keeps input focused so typing continues.
	 * On touch screens, focusing the textarea immediately summons the soft
	 * keyboard, eating half the screen when the user only wanted to pick a menu
	 * command (goal, plan, files). A second tap on '+' also re-focused rather
	 * than dismissing the menu.
	 *
	 * Fix on mobile viewports:
	 * 1. Blur the editor on tap so the virtual keyboard stays closed.
	 * 2. If the menu is already open, tapping '+' dismisses it cleanly.
	 * 3. Tapping anywhere outside the menu also dismisses it cleanly. */
	function dismissTriggerMenu() {
		var editor = document.querySelector('[class*="_composerSeat"] [contenteditable="true"], [class*="_composerSeat"] textarea');
		if (editor) {
			editor.dispatchEvent(new KeyboardEvent('keydown', {
				key: 'Escape',
				code: 'Escape',
				keyCode: 27,
				which: 27,
				bubbles: true,
				cancelable: true
			}));
		}
	}

	var menuWasOpenOnDown = false;

	function onTriggerMenuPointerDown(e) {
		if (!isMobileViewport()) return;
		var menu = document.querySelector('[data-trigger-menu]');
		menuWasOpenOnDown = !!menu;

		var addBtn = e.target && e.target.closest && e.target.closest('[class*="_composerSeat"] button[class*="_add"]');
		if (addBtn) {
			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur();
			}
			if (menu) {
				e.preventDefault();
				e.stopPropagation();
				dismissTriggerMenu();
			}
			return;
		}

		if (menu && !menu.contains(e.target)) {
			dismissTriggerMenu();
		}
	}

	function onTriggerMenuClick(e) {
		if (!isMobileViewport()) return;
		var addBtn = e.target && e.target.closest && e.target.closest('[class*="_composerSeat"] button[class*="_add"]');
		if (addBtn) {
			if (menuWasOpenOnDown) {
				e.preventDefault();
				e.stopPropagation();
				dismissTriggerMenu();
				menuWasOpenOnDown = false;
			}
			setTimeout(function () {
				var editor = document.querySelector('[class*="_composerSeat"] [contenteditable="true"], [class*="_composerSeat"] textarea');
				if (editor && document.activeElement === editor && typeof editor.blur === 'function') {
					editor.blur();
				}
			}, 30);
		}

		// When closing the diff approval panel, ensure the keyboard does not pop up.
		var diffClose = e.target && e.target.closest && e.target.closest('[data-diff-approval-close]');
		if (diffClose) {
			setTimeout(function () {
				if (document.activeElement && (document.activeElement.matches('input, textarea, [contenteditable="true"], [data-composer-input]'))) {
					document.activeElement.blur();
				}
			}, 10);
		}
	}

	/* ---------------------------------------------------------------- *
	 * On-screen keyboard                                                *
	 * ---------------------------------------------------------------- */
	function syncKeyboard() {
		var vv = window.visualViewport;
		if (!vv) return;
		var covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
		// Below ~80px this is browser chrome, not a keyboard.
		var kb = covered > 80 ? Math.round(covered) : 0;
		if (kb === keyboardHeight) return;
		keyboardHeight = kb;
		root.style.setProperty('--dsh-mw-kb', kb + 'px');
		root.classList.toggle('dsh-mw-kb-open', kb > 0);
	}

	/* ---------------------------------------------------------------- *
	 * Manual reordering on a touch screen                               *
	 * ---------------------------------------------------------------- *
	 * The app implements row reordering with HTML5 drag-and-drop ONLY: a row is
	 * `draggable` and carries onDragStart / onDragOver / onDrop. Measured in the
	 * sidebar bundle: zero touch or pointer handlers anywhere on that path, and
	 * neither Chromium nor Safari ever begins an HTML5 drag from a touch point.
	 * So with 排序方式 = 手动排序 a phone can select the mode and then never
	 * actually move a row — the mode is reachable, the capability is not.
	 *
	 * This shim re-dispatches the very events the app already listens for, from
	 * a long press. Nothing app-specific is reimplemented: the app's own
	 * handlers perform the move and paint its own drop marker.
	 */
	var PRESS_MS = 280;
	var pressTimer = null;
	var pressAt = null;
	var dragSrc = null;
	var dragDT = null;
	var dragOverRow = null;

	/* Swipe gestures, which the plugin has to REIMPLEMENT.
	 *
	 * The app already ships both gestures natively (measured with the plugin
	 * disabled: an edge right-swipe opens the sidebar, a left-swipe on the open
	 * sidebar closes it). But the rail-free layout pins the sidebar's width and
	 * visibility with `!important`, which overrides the inline geometry the
	 * app's drag writes while it animates — so under the plugin BOTH gestures
	 * silently stop working. That is a regression this plugin introduced, and
	 * re-adding the gestures here is the fix.
	 *
	 * These are threshold gestures, not live drags: the drawer is the app's own
	 * element, and this plugin never drives the app's state machine. A
	 * threshold flip of the app's own toggle keeps that boundary intact. Intent
	 * is checked against the vertical axis first, so a vertical scroll that
	 * happens to drift sideways never opens or closes the drawer, and the whole
	 * path is gated on the mobile viewport so a desktop touch screen is
	 * untouched. */
	var EDGE_PX = 24;
	var OPEN_SWIPE_PX = 40;
	var CLOSE_SWIPE_PX = 60;
	var swipe = null;

	function swipeIntent(t) {
		var dx = t.clientX - swipe.x0;
		var dy = t.clientY - swipe.y0;
		if (Math.abs(dx) < 12) return null;                       // not yet
		if (Math.abs(dx) <= Math.abs(dy) * 1.5) return null;      // scrolling
		return { dx: dx };
	}

	/** The draggable sidebar row containing `node`, if any. */
	function draggableRow(node) {
		if (!node || node.nodeType !== 1) return null;
		var row = node.closest('[draggable="true"]');
		if (!row || !row.closest('[class*="_sidebarCol"]')) return null;
		return row;
	}

	function fireDrag(type, target, x, y, dt) {
		var ev;
		try {
			ev = new DragEvent(type, {
				bubbles: true,
				cancelable: true,
				composed: true,
				clientX: x,
				clientY: y,
				dataTransfer: dt || dragDT,
			});
		} catch (e) {
			return;
		}
		target.dispatchEvent(ev);
	}

	function endDrag(x, y) {
		// Defer drop/dragend to next frame so React's state update from
		// dragstart has time to commit before the drop handler checks
		// `drag.active`. On a phone's slower CPU the state update can
		// lag behind our synthetic events.
		var row = dragOverRow;
		var src = dragSrc;
		var dt = dragDT;
		requestAnimationFrame(function () {
			if (row) fireDrag('drop', row, x, y, dt);
			if (src) fireDrag('dragend', src, x, y, dt);
		});
		dragSrc = null;
		dragDT = null;
		dragOverRow = null;
		root.classList.remove('dsh-mw-dragging');
	}

	function onTouchStart(e) {
		if (e.touches.length !== 1 || !isMobileViewport()) return;
		var t = e.touches[0];
		if (!drawerOpen) {
			// Only a touch that begins at the very left edge can be a swipe to
			// open, so a horizontal pan inside content is never hijacked.
			if (t.clientX <= EDGE_PX) swipe = { x0: t.clientX, y0: t.clientY, open: true };
			return;
		}
		// The drawer is open: this may be a swipe to close, and (on a row) the
		// long press that starts a reorder drag.
		swipe = { x0: t.clientX, y0: t.clientY, open: false };
		var row = draggableRow(e.target);
		if (!row) return;
		pressAt = { x: t.clientX, y: t.clientY };
		row.classList.add('dsh-mw-pressing');
		clearTimeout(pressTimer);
		pressTimer = setTimeout(function () {
			pressTimer = null;
			dragSrc = row;
			row.classList.remove('dsh-mw-pressing');
			try {
				dragDT = new DataTransfer();
			} catch (err) {
				dragSrc = null;
				return;
			}
			fireDrag('dragstart', row, pressAt.x, pressAt.y);
			root.classList.add('dsh-mw-dragging');
			if (navigator.vibrate) {
				try { navigator.vibrate(15); } catch (err) { /* ignore */ }
			}
		}, PRESS_MS);
	}

	function onTouchMove(e) {
		if (!dragSrc) {
			// A finger that moves before the timer fires is scrolling, not a
			// long press.  25 px is generous enough for natural finger tremor
			// on a touch screen while still distinguishing intent from scroll.
			if (pressTimer && pressAt) {
				var t0 = e.touches[0];
				if (Math.abs(t0.clientX - pressAt.x) > 25 ||
					Math.abs(t0.clientY - pressAt.y) > 25) {
					clearTimeout(pressTimer);
					pressTimer = null;
					var pressing = document.querySelector('.dsh-mw-pressing');
					if (pressing) pressing.classList.remove('dsh-mw-pressing');
				}
			}
			// Swipe-to-open / swipe-to-close. One flip per gesture: the state is
			// cleared as soon as it fires.
			if (swipe) {
				var intent = swipeIntent(e.touches[0]);
				if (intent) {
					if (swipe.open) {
						if (intent.dx > OPEN_SWIPE_PX) {
							swipe = null;
							openDrawer();
						}
					} else if (-intent.dx > CLOSE_SWIPE_PX) {
						swipe = null;
						closeDrawer();
					}
				}
			}
			return;
		}
		// Dragging: the list must not scroll under the finger.
		e.preventDefault();
		var t = e.touches[0];
		var row = draggableRow(document.elementFromPoint(t.clientX, t.clientY));
		if (!row) return;
		dragOverRow = row;
		fireDrag('dragover', row, t.clientX, t.clientY);
	}

	function onTouchEnd(e) {
		swipe = null;
		if (pressTimer) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
		var pressing = document.querySelector('.dsh-mw-pressing');
		if (pressing) pressing.classList.remove('dsh-mw-pressing');
		if (!dragSrc) return;
		var t = (e.changedTouches && e.changedTouches[0]) || pressAt;
		// Resolve the drop target from the RELEASE point rather than from the
		// last row the finger happened to cross. The app's commit is a no-op
		// when the anchor is the dragged row itself, so resolving here is what
		// makes "drag out and back, then release" correctly change nothing.
		var row = draggableRow(document.elementFromPoint(t.clientX, t.clientY));
		if (row) {
			dragOverRow = row;
			fireDrag('dragover', row, t.clientX, t.clientY);
		}
		endDrag(t.clientX, t.clientY);
	}

	/* ---------------------------------------------------------------- *
	 * Binding — the frame can be replaced by the SPA, so re-bind on DOM  *
	 * mutation rather than assuming the first element is forever.        *
	 * ---------------------------------------------------------------- */
	function bind() {
		var next = findFrame();
		if (next && next !== observedFrame) {
			observedFrame = next;
			frame = next;
			if (frameObserver) frameObserver.disconnect();
			var syncRaf = false;
			frameObserver = new MutationObserver(function () {
				// rAF-debounce: collapse rapid attribute changes (sidebar
				// animation, keyboard resize) into one sync per frame.
				if (!syncRaf) {
					syncRaf = true;
					requestAnimationFrame(function () {
						syncRaf = false;
						sync();
					});
				}
			});
			frameObserver.observe(frame, {
				attributes: true,
				attributeFilter: ['style', 'class', 'data-rightbar-fullscreen',
					'data-rightbar-collapsed', 'data-sidebar-collapsed'],
			});
		}
		frame = next || frame;
		sync();
	}

	function start() {
		// The rail-free layout is gated on this class in the stylesheet, so it
		// must be set before the first sync() builds the replacement bar —
		// otherwise there is a frame with neither rail nor top bar.
		root.classList.add('dsh-mw-on');
		root.setAttribute('data-dsh-mw', VERSION);
		syncViewportMeta();

		bind();

		if (window.MutationObserver && !domObserver) {
			var findRaf = false;
			domObserver = new MutationObserver(function () {
				// rAF-debounce: during streaming the app mutates the DOM
				// hundreds of times per second; a single findFrame() per
				// frame is enough to detect the SPA frame swap.
				if (!findRaf) {
					findRaf = true;
					requestAnimationFrame(function () {
						findRaf = false;
						if (findFrame() !== observedFrame) bind();
					});
				}
			});
			domObserver.observe(root, { childList: true, subtree: true });
		}

		// The app switches light/dark by mutating <html>, so the top bar's
		// borrowed surface colour has to be re-read when that happens.
		// rAF-debounce: getComputedStyle forces layout; once per frame is enough.
		if (window.MutationObserver) {
			var surfRaf = false;
			new MutationObserver(function () {
				if (!surfRaf) {
					surfRaf = true;
					requestAnimationFrame(function () {
						surfRaf = false;
						syncSurface();
					});
				}
			}).observe(root, {
				attributes: true,
				attributeFilter: ['class', 'style', 'data-theme'],
			});
		}

		// ResizeObserver removed: the frameObserver already watches `style`
		// attribute changes, which is what drives the layout geometry.

		if (window.visualViewport) {
			// rAF-debounce: visualViewport fires at 60+ fps during keyboard
			// animation; one syncKeyboard per frame is sufficient.
			var kbRaf = false;
			var scheduleKb = function () {
				if (!kbRaf) {
					kbRaf = true;
					requestAnimationFrame(function () {
						kbRaf = false;
						syncKeyboard();
					});
				}
			};
			window.visualViewport.addEventListener('resize', scheduleKb);
			window.visualViewport.addEventListener('scroll', scheduleKb);
			syncKeyboard();
		}
		window.addEventListener('resize', sync);
		window.addEventListener('orientationchange', function () {
			setTimeout(sync, 250);
		});
		document.addEventListener('click', onSidebarClick, true);

		// Touch command '+' button ergonomics: blur input on open, dismiss on second tap or outside.
		document.addEventListener('pointerdown', onTriggerMenuPointerDown, true);
		document.addEventListener('click', onTriggerMenuClick, true);

		// Touch reorder shim. `touchmove` must be non-passive because it calls
		// preventDefault once a drag is live; the other two stay passive so the
		// scroll path is never blocked.
		document.addEventListener('touchstart', onTouchStart, { passive: true });
		document.addEventListener('touchmove', onTouchMove, { passive: false });
		document.addEventListener('touchend', onTouchEnd, { passive: true });
		document.addEventListener('touchcancel', onTouchEnd, { passive: true });

		sync();
	}

	/* ---------------------------------------------------------------- *
	 * Public API (also what the test suite drives)                      *
	 * ---------------------------------------------------------------- */
	window.dshMobileWeb = {
		__installed: true,
		version: VERSION,
		query: MOBILE_QUERY,
		isMobileViewport: isMobileViewport,
		openDrawer: openDrawer,
		closeDrawer: closeDrawer,
		sync: sync,
		/**
		 * What each top-bar button would drive, for tests. `inTopbar` must
		 * always be false — a true value means the lookup found this bar's own
		 * button and clicking it would re-enter the handler.
		 */
		resolve: function (kind) {
			var el = railControl(kind);
			return el ? {
				cls: String(el.className).slice(0, 60),
				tag: el.tagName.toLowerCase(),
				inTopbar: !!el.closest('.dsh-mw-topbar'),
			} : null;
		},
		state: function () {
			return {
				mobile: isMobileViewport(),
				drawer: root.classList.contains('dsh-mw-drawer'),
				right: root.classList.contains('dsh-mw-right'),
				keyboard: keyboardHeight,
				hasScrim: scrim.isConnected,
				hasTopbar: !!(topbar && topbar.isConnected),
			};
		},
		disable: function () {
			if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
			if (topbar && topbar.parentNode) topbar.parentNode.removeChild(topbar);
			root.classList.remove('dsh-mw-on', 'dsh-mw-drawer', 'dsh-mw-right');
		},
		enable: function () {
			if (!styleEl.parentNode) (document.head || root).appendChild(styleEl);
			root.classList.add('dsh-mw-on');
			sync();
		},
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();

/* ==== end src/mobile.js ============================================== */

		/*
		 * The work already happened when this factory ran, which is as early as
		 * the loader allows. apply() therefore has nothing left to do; it is
		 * exported only because a client plugin must present a cordis shape.
		 */
		exports.apply = function apply() {};
		exports.inject = [];
		exports.name = "mobile-web";
		return module.exports;
	}
});
