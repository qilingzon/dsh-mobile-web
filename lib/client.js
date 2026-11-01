(() => {
  // src/client/styles/layout.css.ts
  var LINES = [
    "@media (max-width: 1023px) {",
    "  /* AppFrame\uFF1A\u804A\u5929\u5217\u6052\u5168\u5BBD\uFF1B\u4FA7\u680F/\u8BE6\u60C5\u5217\u51FA\u6D41\u4E3A\u6D6E\u5C42\u62BD\u5C49 */",
    "  /* \u5FC5\u987B border-box\uFF08v0.6.8 \u4FEE\u590D\uFF09\uFF1Avendor .pI_x6G_frame \u662F height:100% + box-sizing:content-box\uFF0C",
    "     \u672C\u63D2\u4EF6\u53C8\u7ED9\u5B83\u52A0 padding-top = \u5218\u6D77\u9AD8\u5EA6\u3002content-box \u4E0B padding \u4E0D\u5360\u9AD8\u5EA6\u989D\u5EA6\uFF0C\u6574\u5E27\u603B\u9AD8",
    "     = \u89C6\u53E3\u9AD8 + inset\uFF0C\u6491\u7834 #root(100dvh, overflow:visible) -> **\u6587\u6863\u672C\u8EAB\u53D8\u6210\u53EF\u7EB5\u5411\u6EDA\u52A8**\uFF1A",
    "     \u624B\u6307\u4E0A\u6ED1\u80FD\u4E00\u76F4\u628A\u9875\u9762\u63A8\u4E0A\u53BB\uFF08iOS \u5DE5\u5177\u6761\u968F\u6EDA\u52A8\u6536\u8D77 + html/body \u7684 100dvh \u53C8\u8DDF\u7740\u53D8\u9AD8\uFF0C",
    '     \u5F62\u6210"\u9875\u9762\u65E0\u7A77\u957F"\u7684\u89C2\u611F\uFF09\uFF0C\u4E14\u8D34\u5728\u5E27\u5E95\u7684\u8F93\u5165\u6846\u88AB\u9876\u5230\u6298\u53E0\u7EBF\u4EE5\u4E0B\u3001\u4E0D\u518D\u56FA\u5B9A\u5E95\u90E8\u3002',
    "     border-box \u8BA9\u5B89\u5168\u533A\u5185\u7F29\u4E8E 100% \u4E4B\u5185\uFF0C\u6587\u6863\u9AD8\u5EA6\u6052\u7B49\u4E8E\u89C6\u53E3\uFF08\u5B9E\u6D4B env=59px \u65F6 903px -> 844px\uFF09\u3002 */",
    '  [data-mobile-nav="frame"] {',
    "    box-sizing: border-box !important;",
    "    position: relative !important;",
    "    grid-template-columns: minmax(0, 1fr) 0 0 !important;",
    "    padding-top: env(safe-area-inset-top, 0px) !important;",
    "    /* \u8F6F\u952E\u76D8\u5728\u573A\u65F6 effects/keyboard.ts \u5199\u5165 --dsh-xc-frame-h\uFF08= visualViewport \u53EF\u89C6\u5E95\u8FB9\uFF09\uFF0C",
    "       \u5E27\u6536\u7A84\u5230\u952E\u76D8\u4E0A\u6CBF\uFF1Acomposer \u4E0D\u518D\u88AB\u952E\u76D8\u76D6\u4F4F\uFF0CWebKit \u4E5F\u4E0D\u9700\u8981\u81EA\u5DF1\u628A\u9875\u9762\u63A8\u4E0A\u53BB",
    '       \uFF08\u90A3\u4E00\u63A8\u6B63\u662F"\u952E\u76D8\u5F39\u8D77\u7A7A\u9699\u8FC7\u5927\u3001\u6536\u8D77\u540E\u9875\u9762\u56DE\u4E0D\u53BB"\u7684\u6765\u6E90\uFF09*/',
    "    height: var(--dsh-xc-frame-h, 100%) !important;",
    "  }",
    "  /* \u4E09\u5217\u663E\u5F0F\u9489\u4F4D\uFF1A\u4FA7\u680F\u5217\u51FA\u6D41\u540E\u5269\u4F59\u9879\u4E0D\u968F auto-placement \u5DE6\u79FB\uFF08TecFancy \u8E29\u5751\uFF09 */",
    '  [data-mobile-nav="frame"] > :first-child { grid-column: 1; }',
    '  [data-mobile-nav="frame"] > :nth-child(2) { grid-column: 1; }',
    '  [data-mobile-nav="frame"] > :nth-child(3) { grid-column: 3; }',
    "",
    "  /* \u5DE6\u62BD\u5C49\uFF08\u4FA7\u680F\uFF09 */",
    '  [data-mobile-nav="frame"] > [data-mobile-nav="drawer"] {',
    "    position: absolute !important;",
    "    inset: 0 auto 0 0 !important;",
    "    width: max-content;",
    "    max-width: 92vw;",
    "    z-index: 40 !important;",
    "    transform: translateX(-110%);",
    "    transition: transform .28s var(--ds-ease-in-out, ease-in-out);",
    "    background: var(--dsw-alias-bg-layer-1, #ffffff);",
    "    padding-top: env(safe-area-inset-top, 0px) !important;",
    "    border-right: none !important;",
    "  }",
    '  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) > [data-mobile-nav="drawer"] {',
    "    transform: none !important;",
    "  }",
    "",
    "  /* \u53F3\u62BD\u5C49\uFF08details\uFF09\uFF1A\u4E0E\u5DE6\u62BD\u5C49\u5BF9\u79F0 */",
    '  [data-mobile-nav="frame"] > [data-mobile-nav="details"] {',
    "    position: absolute !important;",
    "    inset: 0 0 0 auto !important;",
    "    width: max-content;",
    "    max-width: 92vw;",
    "    z-index: 41 !important;",
    "    transform: translateX(110%);",
    "    transition: transform .28s var(--ds-ease-in-out, ease-in-out);",
    "    background: var(--dsw-alias-bg-layer-1, #ffffff);",
    "    padding-top: env(safe-area-inset-top, 0px) !important;",
    "  }",
    '  [data-mobile-nav="frame"]:not([data-details-collapsed]):not([data-rightbar-collapsed]) > [data-mobile-nav="details"] {',
    "    transform: none !important;",
    "  }",
    /* vendor 原生右栏全屏态（<768px 自动；会话头右上 ExpandButton 打开）时强制解除
       details 列 transform：否则该列（绝对定位 + transform）成为面板 fixed 的包含块，
       面板被钉在零宽列上不可见（0.6.1 修复；参照桌面 vendor 行为 = fixed inset:0 盖满视口） */
    '  [data-mobile-nav="frame"][data-rightbar-fullscreen] > [data-mobile-nav="details"] {',
    "    transform: none !important;",
    "  }",
    "",
    "  /* \u906E\u7F69\uFF1Az 39 < \u62BD\u5C49 40\uFF1B\u6253\u5F00\u65F6\u53EF\u89C1 */",
    "  .dsh-xc-scrim {",
    "    display: none;",
    "    position: absolute;",
    "    inset: 0;",
    "    z-index: 39;",
    "    background: var(--dsw-alias-bg-mask-2, rgba(10, 14, 23, 0.42));",
    "    -webkit-tap-highlight-color: transparent;",
    "  }",
    '  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) > [data-mobile-nav="scrim"],',
    '  [data-mobile-nav="frame"]:not([data-details-collapsed]):not([data-rightbar-collapsed]) > [data-mobile-nav="scrim"] {',
    "    display: block;",
    "  }",
    "",
    "  /* \u6C49\u5821\uFF1Asafe-area \u504F\u79FB + 44px \u89E6\u63A7\u70ED\u533A */",
    "  .dsh-xc-ham {",
    "    position: fixed;",
    "    top: calc(10px + env(safe-area-inset-top, 0px));",
    "    left: 10px;",
    "    width: 44px;",
    "    height: 44px;",
    "    z-index: 60;",
    "    border: 1px solid rgba(127, 127, 127, 0.35);",
    "    border-radius: 13px;",
    "    background: var(--dsw-alias-bg-layer-1, #ffffff);",
    "    color: var(--dsw-alias-label-primary, #111827);",
    "    font-size: 22px;",
    "    display: flex;",
    "    align-items: center;",
    "    justify-content: center;",
    "    cursor: pointer;",
    "  }",
    "",
    "  /* shell.overlay \u62AC\u5347\uFF08\u91CD\u542F\u906E\u7F69/\u6A21\u6001/\u901A\u77E5\u5C42\uFF09\uFF1A\u5BBF\u4E3B overlayLayer \u4EC5 z 20\uFF0C",
    "     \u4F1A\u88AB\u62BD\u5C49(40)/details(41)/\u6C49\u5821(60)\u538B\u4F4F -> \u79FB\u52A8\u7AEF\u7EDF\u4E00\u62AC\u5230 1000\uFF0C",
    "     \u4FDD\u8BC1 dsh-power-button \u91CD\u542F\u906E\u7F69\u7B49\u6D6E\u5C42\u76D6\u4F4F\u5168\u90E8\u79FB\u52A8 chrome\uFF08\u684C\u9762\u5A92\u4F53\u5916\u96F6\u5F71\u54CD\uFF09*/",
    "  [data-shell-overlay] {",
    "    z-index: 1000 !important;",
    "  }",
    "",
    "  /* \u62BD\u5C49/\u8BE6\u60C5\u6253\u5F00\u65F6\u9690\u85CF\u6C49\u5821\uFF08\u907F\u514D\u6D6E\u76D6\u5728\u62BD\u5C49/\u906E\u7F69\u4E0A\uFF1B\u5173\u95ED\u9014\u5F84\uFF1Ascrim \u70B9\u51FB/\u70B9\u5916/Escape/\u5DE6\u6ED1\uFF09*/",
    '  [data-mobile-nav="frame"][data-xc-drawer] > .dsh-xc-ham,',
    '  [data-mobile-nav="frame"][data-xc-details] > .dsh-xc-ham {',
    "    display: none !important;",
    "  }",
    "",
    "  /* better-sidebar \u53F3\u62BD\u5C49\u6253\u5F00\u65F6\u4E5F\u9690\u85CF\u6C49\u5821\uFF08\u548C\u5E73\u5171\u5B58\u4E0B\u7684\u663E\u5F0F\u8BA9\u4F4D\uFF09 */",
    "  body:has([data-dsh-panel-host] .nArs4W_panel:not(.nArs4W_panelHidden)) .dsh-xc-ham {",
    "    display: none !important;",
    "  }",
    "",
    "  /* PWA standalone \u5E94\u7528\u5185\u300C\u5237\u65B0\u300D\u5165\u53E3\uFF08iOS \u65E0\u4E0B\u62C9\u5237\u65B0\u65F6\u7684\u624B\u52A8\u5237\u65B0\uFF09*/",
    "  .dsh-xc-refresh {",
    "    border: 1px solid var(--dsw-alias-border-l1, #334155);",
    "    border-radius: 14px;",
    "    padding: 6px 12px;",
    "    font-size: 12px;",
    "    line-height: 1;",
    "    white-space: nowrap;",
    "    color: var(--dsw-alias-label-secondary, #94a3b8);",
    "    background: var(--dsw-alias-bg-layer-1, #ffffff);",
    "    cursor: pointer;",
    "  }",
    "",
    "  /* \u89E6\u6478\u8BBE\u5907\u4E0A\u7528\u4E0D\u5230\u62D6\u62FD\u628A\u624B */",
    '  [data-mobile-nav="frame"] > [data-side] { display: none !important; }',
    "}",
    "",
    "@media (min-width: 1024px) {",
    "  .dsh-xc-ham, .dsh-xc-scrim { display: none !important; }",
    "}"
  ];
  var LAYOUT_CSS = LINES.join("\n");

  // src/client/styles/compat.css.ts
  var LINES2 = [
    "@media (max-width: 1023px) {",
    "  /* ---- \u952E\u76D8\uFF1Advh \u53CC\u58F0\u660E\uFF08100% \u515C\u5E95 + 100dvh \u8DDF\u968F\u6D4F\u89C8\u5668\u53EF\u89C6\u9AD8\u5EA6\uFF09---- */",
    "  html, body, #root {",
    "    height: 100%;",
    "    height: 100dvh;",
    "  }",
    "  /* \u6587\u6863\u7EA7\u7981\u6EDA\uFF1AAppShell \u6052\u7B49\u4E8E\u89C6\u53E3\uFF0C\u6EDA\u52A8\u53EA\u5141\u8BB8\u53D1\u751F\u5728\u9875\u9762\u5185\u90E8\u5BB9\u5668\u3002",
    "     \u7981\u6389\u6587\u6863\u6EDA\u52A8\u4E0E\u56DE\u5F39\uFF0C\u4E0D\u4F9D\u8D56\u5916\u90E8\u5143\u7D20\u662F\u5426\u6EA2\u51FA\u3002 */",
    "  html, body {",
    "    overflow: hidden !important;",
    "    overscroll-behavior: none;",
    "  }",
    "",
    "  /* ---- iOS Safari \u8F93\u5165\u805A\u7126\u9632\u81EA\u52A8\u653E\u5927\uFF1A\u805A\u7126\u5B57\u53F7 <16px \u7684\u8F93\u5165/\u7F16\u8F91\u533A\u4F1A\u6574\u9875\u653E\u5927 ---- */",
    '  input, textarea, select, [contenteditable="true"] {',
    "    font-size: 16px !important;",
    "  }",
    "  /* composer \u8F93\u5165\u533A\u4E0E\u5360\u4F4D\u63D0\u793A\u540C\u5347 16px\uFF0C\u907F\u514D\u8F93\u5165\u6587\u5B57\u4E0E placeholder \u5927\u5C0F\u4E0D\u4E00\u81F4 */",
    '  [data-mobile-nav="frame"] [data-composer-input],',
    '  [data-mobile-nav="frame"] [data-composer-placeholder] {',
    "    font-size: 16px !important;",
    "  }",
    "",
    "  /* ---- \u60AC\u6D6E\u73BB\u7483\u5361\u7247\uFF08glass \u89C6\u89C9\u8D44\u4EA7\u8FC1\u79FB\uFF09---- */",
    '  [data-mobile-nav="frame"] .uV2eYG_card {',
    "    border-radius: 20px !important;",
    "    background: var(--dsw-alias-bg-layer-1) !important;",
    "    background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent) !important;",
    "    backdrop-filter: blur(22px) saturate(180%);",
    "    -webkit-backdrop-filter: blur(22px) saturate(180%);",
    "    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.5);",
    "    max-width: min(86%, 460px) !important;",
    "    transition: max-width .32s cubic-bezier(.32, .72, .24, 1);",
    "  }",
    '  [data-mobile-nav="frame"] .uV2eYG_card:focus-within {',
    "    max-width: 100% !important;",
    "  }",
    "  /* \u8F93\u5165\u533A\uFF1A\u672A\u805A\u7126\u7D27\u51D1\u4E00\u884C\uFF08mirror 24px\uFF09\uFF0C\u805A\u7126\u5C55\u5F00\u7EA6 2.5 \u884C */",
    '  [data-mobile-nav="frame"] .uV2eYG_mirror {',
    "    min-height: 24px !important;",
    "  }",
    '  [data-mobile-nav="frame"] .uV2eYG_card:focus-within .uV2eYG_mirror {',
    "    min-height: 60px !important;",
    "  }",
    "",
    "  /* ---- \u4E00\u884C\u5951\u7EA6\uFF1Aadd/modes/model/send \u540C\u4E00\u884C\u4E0D\u6362\u884C\uFF1B\u56FA\u5B9A\u63A7\u4EF6\u8C41\u514D\u6536\u7F29 ---- */",
    '  [data-mobile-nav="frame"] .uV2eYG_row {',
    "    flex-wrap: nowrap !important;",
    "    gap: 6px;",
    "  }",
    '  [data-mobile-nav="frame"] .uV2eYG_tools,',
    '  [data-mobile-nav="frame"] .uV2eYG_modes {',
    "    gap: 6px;",
    "  }",
    '  [data-mobile-nav="frame"] .uV2eYG_trailing {',
    "    flex: 1 1 auto !important;",
    "    justify-content: flex-end;",
    "    gap: 6px;",
    "  }",
    "  /* \u56FA\u5B9A\u63A7\u4EF6\u9489\u6B7B\uFF1Aadd 28 / primary 34 */",
    '  [data-mobile-nav="frame"] .uV2eYG_add,',
    '  [data-mobile-nav="frame"] .uV2eYG_primary {',
    "    flex: none !important;",
    "  }",
    '  [data-mobile-nav="frame"] .uV2eYG_primary {',
    "    width: 34px !important;",
    "    height: 34px !important;",
    "  }",
    "  /* \u6A21\u578B\u9009\u62E9\u5668\uFF1A\u53EF\u6536\u7F29 + ellipsis\uFF1Beffort \u82AF\u7247\u4E0D\u6536\u7F29 */",
    '  [data-mobile-nav="frame"] ._7KE1Ra_trigger {',
    "    max-width: min(100%, 180px) !important;",
    "    min-width: 0;",
    "  }",
    '  [data-mobile-nav="frame"] ._7KE1Ra_triggerLabel {',
    "    overflow: hidden;",
    "    text-overflow: ellipsis;",
    "    white-space: nowrap;",
    "    min-width: 0;",
    "  }",
    "",
    "  /* ---- \u5E95\u90E8\u5B89\u5168\u533A\uFF08home indicator\uFF09---- */",
    '  [data-mobile-nav="frame"] .uV2eYG_root {',
    "    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;",
    "  }",
    '  html[data-xc-kb="1"] [data-mobile-nav="frame"] .uV2eYG_root {',
    "    padding-bottom: 8px !important;",
    "  }",
    "",
    "  /* ---- \u6C49\u5821\u907F\u8BA9\uFF1A\u804A\u5929\u5934\u53CA\u5168\u5C40\u72EC\u7ACB\u9875\u9762\uFF08\u63D2\u4EF6\u7BA1\u7406\u3001\u8BE6\u60C5\u9875\u9762\u5305\u5C51\u3001\u5B9A\u65F6\u4EFB\u52A1\u7B49\uFF09\u5934\u90E8\u5DE6\u79FB\uFF0C\u907F\u514D\u88AB 44px \u6C49\u5821\u76D6\u4F4F ---- */",
    '  [data-mobile-nav="frame"] .wSkVaW_titleRow,',
    '  [data-mobile-nav="frame"] :is([class*="_pageHead"], [class*="_pageHeading"], [class*="_detailTop"], [class*="_moreHead"]) {',
    "    padding-left: 52px !important;",
    "  }",
    "  /* \u9488\u5BF9\u9762\u5305\u5C51\u884C\u672C\u8EAB\uFF0C\u786E\u4FDD\u70B9\u51FB\u533A\u57DF\u4E0E\u56FE\u6807\u5B8C\u6574\u53EF\u89C1\u4E0D\u88AB\u6C49\u5821\u906E\u6321 */",
    '  [data-mobile-nav="frame"] [class*="_crumb"] {',
    "    margin-left: 0 !important;",
    "  }",
    "  /* \u6C49\u5821\u907F\u8BA9\uFF1A\u6807\u7B7E\u884C\uFF08\u5BF9\u8BDD/\u8F68\u8FF9/\u63D2\u4EF6\u5206\u7C7B\u7B49\uFF09\u540C\u6837\u8BA9\u51FA\u5DE6\u7F18 */",
    '  [data-mobile-nav="frame"] .wSkVaW_tabs,',
    '  [data-mobile-nav="frame"] :is([class*="_pageTabs"]) {',
    "    margin-left: 52px !important;",
    "  }",
    "",
    "  /* ---- M6 \u9875\u5934\u6807\u9898\u7C07\u6A2A\u5411\u53EF\u6ED1\uFF1A\u5355\u884C\u4E0D\u6362\u884C\uFF0C\u6EA2\u51FA\u9760\u6ED1 ---- */",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_titleCluster {',
    "    overflow-x: auto;",
    "    overflow-y: hidden;",
    "    flex-wrap: nowrap;",
    "    scrollbar-width: none;",
    "    overscroll-behavior-x: contain;",
    "    padding-block: 2px;",
    "    margin-block: -2px;",
    "    -webkit-tap-highlight-color: transparent;",
    "  }",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_titleCluster::-webkit-scrollbar {',
    "    display: none;",
    "  }",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_headerActions {',
    "    flex: 0 0 auto !important;",
    "    flex-wrap: nowrap !important;",
    "  }",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_headerActions > *,',
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_headerActions [data-slot="conversation.session.header.actions"] > * {',
    "    flex: 0 0 auto;",
    "  }",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_crumbs {',
    "    min-width: 96px;",
    "  }",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_titleCluster[data-xc-hscroll-more] {',
    "    -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);",
    "    mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);",
    "  }",
    '  html[data-xc-hscroll] [data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_titleCluster[data-xc-hscroll-more]:has([role="menu"], [role="dialog"], ul[aria-label]) {',
    "    -webkit-mask-image: none;",
    "    mask-image: none;",
    "  }",
    '  [data-mobile-nav="frame"] [data-slot="conversation.session.header.utilities"] .nL4_yW_moreButton {',
    "    display: none !important;",
    "  }",
    '  [data-mobile-nav="frame"] [data-slot="conversation.session.header.utilities"] .CAgGvG_split {',
    "    display: none !important;",
    "  }",
    "",
    "  /* ---- Pro \u7279\u6027 1\uFF1A\u4F1A\u8BDD\u5217\u8868\u89E6\u5C4F\u64CD\u4F5C\u4FDD\u5E95\uFF08\u624B\u673A\u65E0 hover \u4ECD\u53EF\u70B9\u51FB\u64CD\u4F5C\u83DC\u5355\uFF09---- */",
    '  [class*="_sessionRow"] [class*="_rowActions"],',
    '  [class*="_projectRow"] [class*="_rowActions"] {',
    "    display: inline-flex !important;",
    "    gap: 2px !important;",
    "    margin-left: auto !important;",
    "  }",
    '  [class*="_sessionRow"] [class*="_rowActions"] > :not(:first-child),',
    '  [class*="_projectRow"] [class*="_rowActions"] > :not(:first-child) {',
    "    display: none !important;",
    "  }",
    '  [class*="_sessionRow"] {',
    "    padding-inline: 8px !important;",
    "    gap: 6px !important;",
    "    min-height: 42px !important;",
    "  }",
    '  [class*="_sessionRow"] [class*="_title"] {',
    "    flex: 1 1 auto !important;",
    "    min-width: 0 !important;",
    "  }",
    "",
    "  /* ---- Pro \u7279\u6027 2\uFF1AMarkdown \u8868\u683C\u79FB\u52A8\u7AEF\u81EA\u9002\u5E94\u6A2A\u6ED1\uFF08\u9632\u6587\u5B57\u91CD\u53E0\u3001\u4E0D\u6539 line-height\uFF09---- */",
    "  [data-chat-flow] .markdown table,",
    '  [data-chat-flow] [class*="_tableScroll"] table {',
    "    display: block !important;",
    "    width: 100% !important;",
    "    max-width: 100% !important;",
    "    overflow-x: auto !important;",
    "    -webkit-overflow-scrolling: touch;",
    "    border-collapse: collapse !important;",
    "    margin-block: 8px !important;",
    "  }",
    "  [data-chat-flow] .markdown table th,",
    "  [data-chat-flow] .markdown table td,",
    '  [data-chat-flow] [class*="_tableScroll"] table th,',
    '  [data-chat-flow] [class*="_tableScroll"] table td {',
    "    white-space: normal !important;",
    "    word-break: break-word !important;",
    "    min-width: 80px;",
    "  }",
    "",
    "  /* ---- Pro \u7279\u6027 3\uFF1A\u8D85\u957F\u4F1A\u8BDD\u5386\u53F2 DOM \u6E32\u67D3\u4E0E\u6EDA\u52A8\u951A\u5B9A\u4FDD\u62A4 ---- */",
    "  /* \u6CE8\u610F\uFF1A\u7EDD\u4E0D\u80FD\u5BF9\u6D88\u606F\u8282\u70B9\u8BBE\u7F6E cv: auto\uFF01\u5728\u89C6\u53E3\u5916\u4F1A\u5C06\u8282\u70B9\u9AD8\u5EA6\u6298\u53E0\u4E3A intrinsic size\uFF0C\u5BFC\u81F4\u7528\u6237\u5411\u4E0B\u5FEB\u901F\u6ED1\u52A8\u65F6 */",
    "  /* \u5386\u53F2\u6D88\u606F\u9AD8\u5EA6\u77AC\u95F4\u7A81\u53D8\u3001scrollHeight \u5267\u70C8\u6536\u7F29\u53CD\u5F39\uFF0C\u9020\u6210\u75AF\u72C2\u6296\u52A8\uFF01 */",
    "  /* \u6539\u7528 contain: layout style \u63A7\u5236\u5C40\u90E8\u91CD\u6392\u8FB9\u754C\uFF0C\u7EDD\u4E0D\u7834\u574F\u6EDA\u52A8\u9AD8\u5EA6\u51E0\u4F55 */",
    "  /* \u6D88\u9664\u5386\u53F2\u6D88\u606F\u524D\u63D2\u65F6\u7684 margin-top \u52A8\u6001\u52A8\u753B\u8FC7\u6E21\uFF0C\u9632\u6B62\u524D\u63D2\u9AD8\u5EA6\u6E10\u53D8\u5F15\u53D1\u6EDA\u52A8\u8BA1\u7B97\u6296\u52A8\u4E0E\u5361\u7247\u91CD\u53E0 */",
    "  [data-chat-flow] [data-chat-entry],",
    "  [data-chat-flow] [data-chat-flow-key] {",
    "    transition: none !important;",
    "    contain: layout style;",
    "  }",
    "",
    "  /* \u5386\u53F2\u6D88\u606F\u524D\u63D2\u6EDA\u52A8\u951A\u5B9A\u4FDD\u62A4\uFF1A",
    "     \u5B98\u65B9\u804A\u5929\u6D41\u5728\u8DDF\u968F\u5C3E\u90E8\u65F6\u8BBE\u7F6E\u4E86 overflow-anchor: none\uFF0C",
    "     \u4F46\u5728\u8BFB\u8005\u5411\u4E0A\u7FFB\u9605\u65F6\uFF0C\u5FC5\u987B\u8BA9\u6EDA\u52A8\u89C6\u53E3\u62E5\u6709\u539F\u751F overflow-anchor: auto \u4FDD\u62A4\uFF0C",
    "     \u4E14\u8BA9\u6B63\u5728\u52A0\u8F7D\u66F4\u65E9\u5386\u53F2\u7684 older \u5360\u4F4D\u4FDD\u6301\u7A33\u5B9A\u5C3A\u5BF8\uFF0C\u9632\u6B62\u7528\u6237\u5728\u6B64\u671F\u95F4\u5212\u52A8\u4EA7\u751F\u50CF\u7D20\u7EA7\u7A81\u8DF3\u3002*/",
    '  [data-conversation-scroll] [class*="_scrollBody"]:not(:has([data-chat-following-tail])),',
    "  [data-conversation-scroll] .EvIC1a_root:not([data-chat-following-tail]) .EvIC1a_scroll {",
    "    overflow-anchor: auto !important;",
    "  }",
    "",
    "  /* \u52A0\u8F7D\u66F4\u65E9\u5386\u53F2\u7684\u6309\u94AE\u5BB9\u5668\uFF1A\u52A0\u8F7D\u4E2D\u4FDD\u6301\u7A33\u5B9A\u9AD8\u5EA6\u4E0E\u8FB9\u8DDD\uFF0C\u675C\u7EDD\u5185\u5BB9\u63D2\u5165\u524D\u540E\u7684\u5E03\u5C40\u6296\u52A8 */",
    '  [data-chat-flow] [class*="_older"] {',
    "    display: flex !important;",
    "    justify-content: center !important;",
    "    padding-block: 8px !important;",
    "    min-height: 48px !important;",
    "    overflow-anchor: none !important;",
    "  }",
    '  [data-chat-flow] [class*="_older"] button {',
    "    min-height: 34px !important;",
    "    padding-inline: 16px !important;",
    "    border-radius: 17px !important;",
    "    font-size: 13px !important;",
    "    transition: opacity .2s ease, background-color .2s ease !important;",
    "  }",
    '  [data-chat-flow] [class*="_older"] button:disabled {',
    "    opacity: 0.6 !important;",
    "    cursor: default !important;",
    "    pointer-events: none !important;",
    "  }",
    "}",
    "",
    "/* ---- Pro \u7279\u6027 5\uFF1A\u7F51\u7EDC\u65AD\u5F00\u81EA\u6108\u5FAE\u80F6\u56CA\uFF08\u8F7B\u91CF\u60AC\u6D6E\uFF0C\u4E0D\u906E\u6321\u4E3B\u529F\u80FD\u533A\uFF09---- */",
    ".dsh-mw-recover-pill {",
    "  position: fixed;",
    "  bottom: calc(72px + env(safe-area-inset-bottom, 0px));",
    "  left: 50%;",
    "  transform: translateX(-50%);",
    "  z-index: 1250;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  gap: 8px;",
    "  padding: 8px 16px;",
    "  border-radius: 999px;",
    "  font-size: 13px;",
    "  font-weight: 500;",
    "  color: #fff;",
    "  background: rgba(30, 41, 59, 0.92);",
    "  backdrop-filter: blur(12px);",
    "  -webkit-backdrop-filter: blur(12px);",
    "  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);",
    "  border: 1px solid rgba(255, 255, 255, 0.15);",
    "  transition: opacity .25s ease, transform .25s ease;",
    "  cursor: pointer;",
    "  user-select: none;",
    "  -webkit-user-select: none;",
    "}",
    '.dsh-mw-recover-pill[data-state="offline"] {',
    "  background: rgba(220, 38, 38, 0.92);",
    "}",
    '.dsh-mw-recover-pill[data-state="online"] {',
    "  background: rgba(22, 163, 74, 0.92);",
    "}",
    "",
    "@media (max-width: 1023px) and (pointer: coarse) {",
    "  /* 44px \u89E6\u63A7\u70ED\u533A\uFF1A::after \u6269\u5C55\u547D\u4E2D\u533A\uFF0C\u4E0D\u52A8\u89C6\u89C9\u5E03\u5C40 */",
    '  [data-mobile-nav="frame"] .uV2eYG_add,',
    '  [data-mobile-nav="frame"] .uV2eYG_primary {',
    "    position: relative;",
    "  }",
    '  [data-mobile-nav="frame"] .uV2eYG_add::after,',
    '  [data-mobile-nav="frame"] .uV2eYG_primary::after {',
    "    content: '';",
    "    position: absolute;",
    "    inset: -8px;",
    "  }",
    "}"
  ];
  var COMPAT_CSS = LINES2.join("\n");

  // src/client/styles/misc.css.ts
  var LINES3 = [
    "@media (max-width: 1023px) {",
    "  /* ---- \u8BBE\u7F6E/\u5BFC\u51FA/\u76EE\u5F55\u9009\u62E9\u5BF9\u8BDD\u6846\uFF1A\u62BD\u5C49\u5185\u542B aria-modal \u65F6\u89E3\u9664 transform \u9677\u9631\u5E76\u62AC\u5347 ---- */",
    '  [data-mobile-nav="frame"] > [data-mobile-nav="drawer"]:has([aria-modal="true"]) {',
    "    transform: none !important;",
    "    z-index: 50 !important;",
    "  }",
    "",
    "  /* ---- \u8BBE\u7F6E\u9762\u677F\uFF1A\u684C\u9762 800px \u5BF9\u8BDD\u6846 -> \u79FB\u52A8\u7AEF\u5168\u5C4F\u7EB5\u5411 ---- */",
    "  /* 0.2.0 \u8D77\u8BBE\u7F6E\u5BF9\u8BDD\u6846 createPortal \u5230 document.body\uFF08overlay>panel\uFF09\uFF0C\u4E0D\u518D\u6709 frame/drawer \u7956\u5148\uFF0C",
    "     \u6545\u6539\u951A .VOzbGW_panel \u54C8\u5E0C\u7C7B\uFF08canary \u5DF2\u767B\u8BB0\uFF09\uFF1B\u62BD\u5C49\u5185 transform \u9677\u9631\u89C4\u5219\u4EC5\u5BF9\u5176\u4F59\u62BD\u5C49\u5185\u5F39\u5C42\u751F\u6548 ---- */",
    "  .VOzbGW_panel {",
    "    width: 100vw !important;",
    "    max-width: 100vw !important;",
    "    height: 100dvh !important;",
    "    max-height: 100dvh !important;",
    "    border-radius: 0 !important;",
    "  }",
    "  /* nav \u6536\u6210\u9876\u90E8\u6A2A\u5411\u53EF\u6EDA\u52A8\u6309\u94AE\u6761\uFF08\u987A\u624B\u4FEE\u590D\u5BBF\u4E3B flex-basis:0 \u538B\u96F6\u5BBD bug\uFF09*/",
    "  .VOzbGW_panel:has(> nav) {",
    "    flex-direction: column !important;",
    "  }",
    "  .VOzbGW_panel:has(> nav) > nav {",
    "    flex: none !important;",
    "    flex-direction: row !important;",
    "    overflow-x: visible !important;",
    "    box-sizing: border-box !important;",
    "    width: 100% !important;",
    "    padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 6px !important;",
    "    gap: 8px !important;",
    "    align-items: center !important;",
    "  }",
    "  /* \u9875\u5934\u6807\u9898\uFF08\u8BBE\u7F6E\uFF09\u4E0D\u88AB flex \u538B\u7F29\u6362\u884C\uFF08div:not(:last-child)=\u6807\u9898\uFF1B\u5173\u95ED\u6309\u94AE\u79FB\u5165 nav \u540E\u4E3A button:first-child\uFF0C\u4E0D\u5F71\u54CD\uFF09*/",
    "  .VOzbGW_panel:has(> nav) > nav > div:not(:last-child) {",
    "    flex: none !important;",
    "    white-space: nowrap !important;",
    "  }",
    "  .VOzbGW_panel:has(> nav) > nav > div:last-child {",
    "    flex: 1 1 0 !important;",
    "    min-width: 0 !important;",
    "    flex-direction: row !important;",
    "    flex-wrap: nowrap !important;",
    "    gap: 6px !important;",
    "    overflow-x: auto !important;",
    "    scrollbar-width: thin;",
    "  }",
    "  .VOzbGW_panel:has(> nav) > nav button {",
    "    flex: 0 0 auto !important;",
    "    height: 36px !important;",
    "    padding: 6px 12px !important;",
    "    justify-content: center !important;",
    "  }",
    "  /* \u79FB\u5165 nav \u7684\u5173\u95ED\u6309\u94AE\uFF08nav \u76F4\u7CFB button\uFF09\u8C41\u514D\u5BFC\u822A\u6761\u6837\u5F0F\uFF1A\u7EF4\u6301 28px \u5706\u94AE + \u65E0 padding */",
    "  .VOzbGW_panel:has(> nav) > nav > button {",
    "    flex: 0 0 auto !important;",
    "    height: 28px !important;",
    "    width: 28px !important;",
    "    padding: 0 !important;",
    "  }",
    "  .VOzbGW_panel:has(> nav) > nav button > :last-child {",
    "    flex: 0 1 auto !important;",
    "    min-width: 0 !important;",
    "  }",
    "  /* \u5185\u5BB9\u533A\u6EDA\u52A8 + \u5E95\u90E8\u5B89\u5168\u533A */",
    "  .VOzbGW_panel:has(> nav) > nav + div {",
    "    flex: 1 1 0 !important;",
    "    min-height: 0 !important;",
    "    padding-bottom: env(safe-area-inset-bottom, 0px) !important;",
    "  }",
    "",
    "  /* ---- \u76EE\u5F55\u9009\u62E9\u5668\uFF1A\u5E95\u90E8\u53D6\u6D88/\u786E\u5B9A\u56FA\u5B9A\u5355\u884C ---- */",
    '  [data-mobile-nav="frame"] [role="dialog"]:has(> div:last-child > button[aria-pressed]) > div:last-child {',
    "    flex: none !important;",
    "    display: grid !important;",
    "    grid-template-columns: minmax(0, 1fr) auto auto !important;",
    "    gap: 8px !important;",
    "    align-items: center !important;",
    "    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)) !important;",
    "    border-top: 1px solid var(--dsw-alias-border-l1);",
    "  }",
    "",
    "  /* ---- popover \u91CD\u951A\u5B9A\uFF1Acomposer/header \u951A\u5B9A\u5F39\u5C42\u6539\u5C45\u4E2D\u5B9A\u5BBD\uFF08\u4E0A\u9650 100vw-32\uFF09---- */",
    "  /* \u73BB\u7483\u5361 backdrop-filter \u4F1A\u56F0\u4F4F fixed \u540E\u4EE3 -> \u5F39\u5C42\u6253\u5F00\u65F6\u4E34\u65F6\u79FB\u9664\u9677\u9631 */",
    '  [data-mobile-nav="frame"] .uV2eYG_card:has([role="menu"], [role="dialog"]) {',
    "    backdrop-filter: none !important;",
    "    -webkit-backdrop-filter: none !important;",
    "  }",
    "  /* composer \u5F39\u5C42\uFF08\u6A21\u578B\u5207\u6362/\u6743\u9650\u7B49\uFF09\uFF1A\u5E95\u90E8\u5F39\u5C42\uFF08\u5E95\u90E8\u5C45\u4E2D\u3001\u8D34 safe-area\u3001\u5411\u4E0A\u5F39\u5F00\uFF09\uFF0C",
    "     \u907F\u514D\u9875\u9762\u4E2D\u592E\u5C55\u5F00\uFF08v0.1.9 \u7528\u6237\u53CD\u9988\uFF09\uFF1Bheader \u83DC\u5355\u4FDD\u6301\u5C45\u4E2D\u5B9A\u5BBD */",
    '  [data-slot="conversation.composer.bar"] [role="menu"],',
    '  [data-slot="conversation.composer.bar"] [role="dialog"] {',
    "    position: fixed !important;",
    "    top: auto !important;",
    "    left: 50% !important;",
    "    right: auto !important;",
    "    bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;",
    "    transform: translateX(-50%) !important;",
    "    width: min(100% - 24px, 360px) !important;",
    "    max-width: 360px !important;",
    "    max-height: min(55dvh, 440px) !important;",
    "    overflow-y: auto;",
    "    z-index: 1200 !important;",
    "  }",
    '  [data-slot="conversation.session.header.actions"] ul[aria-label] {',
    "    position: fixed !important;",
    "    left: 50% !important;",
    "    top: 50% !important;",
    "    right: auto !important;",
    "    bottom: auto !important;",
    "    transform: translate(-50%, -50%) !important;",
    "    min-width: 0 !important;",
    "    max-width: calc(100vw - 32px) !important;",
    "    max-height: min(480px, calc(100dvh - 96px)) !important;",
    "    overflow-y: auto;",
    "    z-index: 1200 !important;",
    "  }",
    "",
    "  /* ---- \u6307\u4EE4/\u547D\u4EE4\u9762\u677F\uFF08composer \u73BB\u7483\u5361\u5185\u7684 [role=listbox] \u6D6E\u5C42\uFF09---- */",
    "  /* vendor \u4FA7\u8FD9\u5757\u9762\u677F\u6CA1\u6709\u81EA\u5DF1\u7684\u80CC\u666F\uFF0C\u843D\u5728\u73BB\u7483\u5361\uFF080.72 \u767D + blur\uFF09\u91CC\uFF0C\u79FB\u52A8\u7AEF\u4E00\u6253\u5F00\u5C31\u628A",
    "     \u5E95\u4E0B\u7684\u5BF9\u8BDD\u900F\u4E0A\u6765\uFF08\u771F\u673A\u53CD\u9988\u300C\u52A0\u53F7\u83DC\u5355\u592A\u900F\u660E\u3001\u5F71\u54CD\u4F7F\u7528\u300D\uFF09\u3002\u7ED9\u4E00\u5C42\u4E0D\u900F\u660E\u8868\u9762 + \u7EC6\u8FB9",
    "     + \u9634\u5F71\uFF0C\u989C\u8272\u8D70\u8BBE\u8BA1\u53D8\u91CF\uFF0C\u6DF1\u8272\u4E3B\u9898\u81EA\u52A8\u8DDF\u968F\u3002 */",
    '  [data-mobile-nav="frame"] [role="listbox"],',
    '  [role="listbox"][class*="_viewport"] {',
    "    background: var(--dsw-alias-bg-layer-1, #ffffff) !important;",
    "    border: 1px solid var(--dsw-alias-border-l2, rgba(15, 23, 42, 0.08)) !important;",
    "    border-radius: 16px !important;",
    "    box-shadow: 0 10px 32px rgba(15, 23, 42, 0.16) !important;",
    "  }",
    "",
    "  /* ---- agent-preset \u5E95\u90E8\u5F39\u5C42\uFF08body portal [role=menu]\uFF09---- */",
    '  [role="menu"]:has([class*="cubgiG_item"]) {',
    "    top: auto !important;",
    "    left: 50% !important;",
    "    right: auto !important;",
    "    bottom: 12px !important;",
    "    transform: translateX(-50%) !important;",
    "    width: min(100% - 24px, 360px) !important;",
    "    max-width: 360px !important;",
    "    max-height: min(55dvh, 440px) !important;",
    "    padding: 30px 6px 10px !important;",
    "    border-radius: 16px !important;",
    "    overflow-y: auto;",
    "    scrollbar-width: thin;",
    "  }",
    '  [role="menu"]:has([class*="cubgiG_item"])::before {',
    "    content: '';",
    "    position: absolute;",
    "    top: 6px;",
    "    left: 50%;",
    "    transform: translateX(-50%);",
    "    width: 36px;",
    "    height: 4px;",
    "    border-radius: 2px;",
    "    background: var(--dsw-alias-border-l2);",
    "  }",
    '  [role="menu"]:has([class*="cubgiG_item"])::-webkit-scrollbar {',
    "    width: 4px;",
    "  }",
    "",
    "  /* ---- \u6D88\u606F\u6D41\uFF1A\u6EDA\u52A8\u6761\u6BDB\u523A/\u4FA7\u8FB9\u8DDD/\u5B57\u53F7/\u64CD\u4F5C\u884C\u6EA2\u51FA ---- */",
    "  /* ---- \u8F6E\u6B21\u5BFC\u822A rail\uFF1Avendor \u5728\u804A\u5929\u5217\u5BB9\u5668 \u2264900px \u65F6\u7528 @container \u9690\u85CF\uFF08.eGxaPq_slot{display:none}\uFF09\uFF0C",
    "     \u79FB\u52A8\u7AEF\u804A\u5929\u5217\u6052\u5168\u5BBD\u5FC5\u547D\u4E2D \u2192 \u53F3\u4FA7\u8F6E\u6B21\u523B\u5EA6 rail \u6D88\u5931\uFF1B\u6B64\u5904\u53CD\u5236\u6062\u590D\u5E76\u505A\u89E6\u63A7\u589E\u5F3A\uFF1A",
    "     \u2460 \u53CD\u5236\u663E\u793A\uFF08display:block\uFF09\uFF1B\u2461 \u547D\u4E2D\u533A\u52A0\u5BBD\uFF1A\u89C6\u89C9 28px + ::after \u5411\u5DE6\u6269\u5C55 12px \u900F\u660E\u533A",
    "     \uFF08\u603B \u224840px\uFF0C\u89E6\u63A7\u53EF\u70B9\uFF1B\u70B9\u51FB\u547D\u4E2D\u4ECD\u843D\u5728\u5BBF\u4E3B frame \u4E0A\uFF0Cvendor \u6309 clientY \u6362\u7B97\u8F6E\u6B21\u4E0D\u53D7\u5F71\u54CD\uFF09\uFF1B",
    "     \u2462 \u5185\u79FB right:6px \u907F\u5F00 iOS 9px \u8FB9\u7F18\u624B\u52BF\u533A\uFF1B\u2463 \u523B\u5EA6\u52A0\u7C97\u52A0\u957F\u3001active \u54C1\u724C\u8272\u9AD8\u4EAE\uFF1B",
    "     \u2464 \u6309\u538B\u53CD\u9988\uFF08frame:active \u523B\u5EA6\u53D8\u7C97\u53D8\u4EAE\uFF09\u3002",
    "     \u54C8\u5E0C\u7C7B\u5DF2\u767B\u8BB0 canary\uFF1B\u6F02\u79FB\u515C\u5E95\uFF1Arail \u6062\u590D vendor \u9690\u85CF\u539F\u72B6\uFF08\u65E0\u529F\u80FD\u635F\u5BB3\uFF09\u3002 ---- */",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_slot {',
    "    display: block !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_frame {',
    "    right: 6px !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_frame::after {',
    "    content: '';",
    "    position: absolute;",
    "    top: 0;",
    "    bottom: 0;",
    "    left: -12px;",
    "    width: 40px;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_mark {',
    "    width: 30px !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_mark:before {',
    "    width: 18px !important;",
    "    height: 3px !important;",
    "    border-radius: 2px;",
    "    /* \u5E73\u65F6\u6DE1\uFF1A\u4E0D\u78B0 opacity\uFF08\u4F1A\u538B\u6B7B vendor busy \u95EA\u70C1\u52A8\u753B\uFF09\uFF0C\u6539\u80CC\u666F\u900F\u660E\u5EA6\uFF0C",
    "       \u6DF1\u6D45\u4E3B\u9898\u81EA\u9002\u5E94\uFF08color-mix \u4E0D\u652F\u6301\u65F6\u56DE\u9000\u539F border-l4 \u7EAF\u8272\uFF09 */",
    "    background: var(--dsw-alias-border-l4) !important;",
    "    background: color-mix(in srgb, var(--dsw-alias-border-l4) 50%, transparent) !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_markUnloaded:before {',
    "    width: 12px !important;",
    "    background: var(--dsw-alias-border-l4) !important;",
    "    background: color-mix(in srgb, var(--dsw-alias-border-l4) 28%, transparent) !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_markPreview:before {',
    "    width: 26px !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_markActive:before {',
    "    width: 28px !important;",
    "    background: var(--dsw-alias-state-business-primary, #4f6ef2) !important;",
    "  }",
    '  html[data-xc-turn-rail] [data-mobile-nav="frame"] .eGxaPq_frame:active .eGxaPq_markActive:before {',
    "    width: 30px !important;",
    "    background: var(--dsw-alias-state-business-primary, #4f6ef2) !important;",
    "  }",
    "",
    '  [data-phase] [class*="_scrollBody"] {',
    "    scrollbar-gutter: auto !important;",
    "    scrollbar-width: none;",
    "    /* v0.6.8\uFF1A\u4F1A\u8BDD\u5185\u6EDA\u52A8\u5230\u5C3D\u5934\u540E\u4E0D\u518D\u628A\u6EDA\u52A8\u94FE\u4F20\u7ED9\u4E0A\u5C42\uFF08\u5426\u5219\u771F\u673A\u4E0A\u6574\u9875\u88AB\u63A8\u8D70\uFF09 */",
    "    overscroll-behavior-y: contain;",
    "  }",
    '  [data-phase] [class*="_scrollBody"]::-webkit-scrollbar {',
    "    display: none !important;",
    "    width: 0;",
    "    height: 0;",
    "  }",
    '  [data-phase] [class*="_scroll"]:not([class*="_scrollBody"]):has(p) {',
    "    padding-left: 20px;",
    "    padding-right: 20px;",
    "    font-size: 15px !important;",
    "  }",
    '  [data-phase] [class*="_actions"] {',
    "    overflow: hidden;",
    "  }",
    '  [data-phase] [class*="_actions"] [class*="_timeEnd"] {',
    "    flex: 0 1 auto;",
    "    min-width: 0;",
    "    overflow: hidden;",
    "    text-overflow: ellipsis;",
    "    white-space: nowrap !important;",
    "  }",
    "}",
    "",
    "@media (max-width: 560px) {",
    "  /* dshmarket >=1.20 \u79FB\u52A8\u7AEF\u9690\u85CF\u8BBE\u7F6E nav \u7684\u6B7B\u8DEF\u53CD\u5236\uFF08\u6302 data-xc-market-fix\uFF0C\u7531 compat \u4EFB\u52A1\u6309\u5F00\u5173\u63A7\u5236\uFF09*/",
    '  html[data-xc-market-fix] [role="dialog"]:has([data-dsh-market-root]) > nav {',
    "    display: flex !important;",
    "  }",
    "}"
  ];
  var MISC_CSS = LINES3.join("\n");

  // src/client/styles/index.ts
  var BASE_LINES = [
    "/* ---------- base\uFF1A\u684C\u9762\u96F6\u5F71\u54CD\u7684\u4E0D\u53D8\u91CF ---------- */",
    "/* \u6291\u5236\u53CC\u51FB\u7F29\u653E\u4E0E 300ms \u70B9\u51FB\u5EF6\u8FDF\uFF1B\u684C\u9762/\u9F20\u6807\u4E0D\u53D7\u5F71\u54CD */",
    "html, body {",
    "  touch-action: manipulation;",
    "}",
    "@media (prefers-reduced-motion: reduce) {",
    "  /* \u6B63\u786E\u8BED\u6CD5\uFF08\u5BF9\u6CBB dsh-mobile-glass \u7684\u5C3E\u9017\u53F7\u8BED\u6CD5\u9519\u8BEF\uFF09\uFF1B\u540E\u7EED\u52A8\u6548\u4E00\u5F8B\u5728\u6B64\u5173\u95ED */",
    "  *, *::before, *::after {",
    "    animation-duration: 0.01ms !important;",
    "    transition-duration: 0.01ms !important;",
    "  }",
    "}"
  ];
  var BASE_CSS = BASE_LINES.join("\n");
  var MOBILE_CSS = BASE_CSS + "\n" + LAYOUT_CSS + "\n" + COMPAT_CSS + "\n" + MISC_CSS;

  // src/client/config.ts
  var KEY = "dsh-mobile-web-pro.config";
  var LEGACY_KEY = "dsh-mobile-xc.config";
  var DEFAULTS = {
    swipeEnabled: true,
    dshmarketNavFix: true,
    pwaEnabled: true,
    drawerRefresh: false,
    headerScroll: true,
    turnRail: true,
    autoLoadEarlier: true
  };
  function load() {
    if (typeof localStorage === "undefined") return { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
      if (raw === null) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch {
      return { ...DEFAULTS };
    }
  }
  var current = load();
  var listeners = /* @__PURE__ */ new Set();
  function resolveSettingsValue(raw) {
    if (raw !== null && typeof raw === "object") {
      const rec = raw;
      if ("value" in rec && ("status" in rec || "base" in rec || "revision" in rec)) {
        return rec.value;
      }
    }
    return raw;
  }
  function getConfig() {
    return current;
  }
  function setConfig(patch) {
    current = { ...current, ...patch };
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(KEY, JSON.stringify(current));
      } catch {
      }
    }
    for (const fn of listeners) {
      try {
        fn(current);
      } catch {
      }
    }
    return current;
  }
  function onConfigChange(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }

  // src/client/breakpoints.ts
  var NARROW_MAX_WIDTH = 1023;
  var MOBILE_QUERY = "(max-width: " + NARROW_MAX_WIDTH + "px)";
  function installMobileEffect(ctx, label, install) {
    if (typeof window === "undefined") return;
    ctx.effect(() => {
      const narrow = window.matchMedia(MOBILE_QUERY);
      let cleanup;
      const arm = () => {
        cleanup?.();
        cleanup = narrow.matches ? install(narrow) : void 0;
      };
      arm();
      narrow.addEventListener("change", arm);
      return () => {
        narrow.removeEventListener("change", arm);
        cleanup?.();
      };
    }, label);
  }

  // src/client/core/selector-map.ts
  var SELECTOR_MAP = [
    {
      selector: ".uV2eYG_card",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 composer \u73BB\u7483\u5361\u7247\uFF08compat.css.ts\uFF09",
      reason: "composer.bar slot \u4E4B\u4E0B\u65E0\u66F4\u7EC6\u8BED\u4E49\u951A\uFF1B\u5361\u7247\u672C\u4F53\u5373\u73BB\u7483\u62DF\u6001\u4F5C\u7528\u9762",
      fallback: '\u7ED3\u6784\u5B9A\u4F4D [data-slot="conversation.composer.bar"] \u7684\u5361\u7247\u6027\u7956\u5148\u6216\u4E22\u5F03\u6837\u5F0F\u89C4\u5219\uFF08\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF09'
    },
    {
      selector: ".uV2eYG_mirror",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u8F93\u5165\u533A\u9AD8\u5EA6\uFF08min-height 24/60\uFF09",
      reason: "\u955C\u50CF\u6587\u672C\u662F\u5361\u7247\u9AD8\u5EA6\u7684\u6392\u7248\u9A71\u52A8\uFF1B\u65E0\u8BED\u4E49\u951A",
      fallback: '\u6309 [data-slot="conversation.composer.bar"] \u5185\u90E8 textarea \u955C\u50CF\u5B9A\u4F4D'
    },
    {
      selector: ".uV2eYG_row",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u4E00\u884C\u5951\u7EA6\uFF08flex-wrap: nowrap\uFF09",
      reason: "\u5DE5\u5177\u680F\u884C\u65E0\u8BED\u4E49\u951A\uFF1B\u884C\u5185\u56FA\u5B9A\u63A7\u4EF6\u91CD\u53E0\u98CE\u9669\u7531\u51E0\u4F55\u65AD\u8A00\u5B88\u62A4",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D row = \u7B2C 4 \u4E2A flex \u5B50\u5143\u7D20\uFF1B\u4E0D\u53D8\u5F0F\uFF1Aadd/send \u4E0D\u91CD\u53E0"
    },
    {
      selector: ".uV2eYG_tools",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u5DE5\u5177\u680F\u95F4\u8DDD\uFF08gap 6\uFF09",
      reason: "\u65E0\u66F4\u7EC6\u8BED\u4E49\u951A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D row \u9996\u4E2A\u5B50\u5143\u7D20\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u56FE\u6807\u63A7\u4EF6 28px \u4E0D\u88AB\u538B\u7F29"
    },
    {
      selector: ".uV2eYG_trailing",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u53F3\u4FA7\u8F66\u9053\uFF08flex 1 + justify-end\uFF09",
      reason: "model/send \u6240\u5728\u8F66\u9053\u65E0\u8BED\u4E49\u951A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D row \u672B\u4E2A\u5B50\u5143\u7D20\uFF1B\u4E0D\u53D8\u5F0F\uFF1Asend \u8D34\u53F3\u7F18\u4E14\u4E0D\u4E0E model \u91CD\u53E0"
    },
    {
      selector: ".uV2eYG_add",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u56FA\u5B9A\u63A7\u4EF6\u8C41\u514D + 44px \u70ED\u533A",
      reason: "add 28x28 \u56FE\u6807\u6309\u94AE\uFF1B\u65E0\u8BED\u4E49\u951A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D row \u9996\u6309\u94AE\uFF1B\u4E0D\u53D8\u5F0F\uFF1A28px \u4E0D\u88AB\u538B\u7F29"
    },
    {
      selector: ".uV2eYG_primary",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u53D1\u9001\u952E\u9489\u6B7B 34px + 44px \u70ED\u533A",
      reason: "\u53D1\u9001\u952E\u65E0\u8BED\u4E49\u951A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D trailing \u672B\u6309\u94AE\uFF1B\u4E0D\u53D8\u5F0F\uFF1A34px + \u8D34\u53F3\u7F18"
    },
    {
      selector: ".uV2eYG_root",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u5E95\u90E8 safe-area",
      reason: "composer \u6839\u5BB9\u5668\u65E0\u72EC\u7ACB\u951A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D composer.bar \u7956\u94FE\u7B2C\u4E00\u4E2A flex \u5217"
    },
    {
      selector: "._7KE1Ra_trigger",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u6A21\u578B\u9009\u62E9\u5668\u6536\u7F29\uFF08max-width/min-width:0\uFF09",
      reason: "\u9009\u62E9\u5668\u6309\u94AE\u65E0\u8BED\u4E49\u951A\uFF1B\u4E00\u884C\u4E0B\u5FC5\u987B\u53EF\u6536\u7F29",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D trailing \u9996\u6309\u94AE\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u4E0D\u91CD\u53E0 send"
    },
    {
      selector: "._7KE1Ra_triggerLabel",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u6A21\u578B\u540D ellipsis",
      reason: "label \u65E0\u8BED\u4E49\u951A\uFF1B\u9700 min-width:0 + ellipsis",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D trigger \u9996 span\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u6EA2\u51FA\u7701\u7565\u800C\u975E\u6362\u884C"
    },
    {
      selector: ".wSkVaW_titleRow",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M2 \u6C49\u5821\u907F\u8BA9\uFF08padding-left 52px\uFF09",
      reason: "\u6807\u9898\u884C\u65E0\u8BED\u4E49\u951A\uFF1B\u6C49\u5821\u56FA\u5B9A\u4E8E frame \u5DE6\u4E0A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D header \u4E0B title \u884C\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u6807\u9898\u4E0D\u88AB\u6C49\u5821\u906E\u6321"
    },
    {
      selector: ".wSkVaW_tabs",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M5 \u6C49\u5821\u907F\u8BA9\uFF1A\u6807\u7B7E\u884C\uFF08\u5BF9\u8BDD/\u8F68\u8FF9\uFF09margin-left 52px",
      reason: "\u6807\u7B7E\u884C\u65E0\u8BED\u4E49\u951A\uFF1B\u6C49\u5821\u56FA\u5B9A\u4E8E frame \u5DE6\u4E0A",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D header \u4E0B tabs \u884C\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u6807\u7B7E\u4E0D\u88AB\u6C49\u5821\u906E\u6321"
    },
    {
      selector: ".wSkVaW_titleCluster",
      dshVersion: "0.1.5-rc.2",
      usedBy: "M6 \u9875\u5934\u6807\u9898\u7C07\u6A2A\u5411\u6EDA\u52A8\uFF08compat.css.ts + header-scroll.ts\uFF09",
      reason: "\u6807\u9898+\u5FBD\u6807\u7C07\u65E0 data-* \u8BED\u4E49\u951A\uFF08slot \u951A\u5728\u66F4\u5185\u5C42 actions/utilities\uFF09\uFF1B\u9700\u6574\u7C07\u4F5C\u6EDA\u52A8\u5BB9\u5668",
      fallback: "\u5BF9\u7B56=\u4E0D\u8FC1\u951A\u3001\u6574\u6BB5\u5931\u6548\uFF08\u63A5\u53D7 vendor \u73B0\u72B6\uFF09\uFF1A\u6F02\u79FB\u5219\u65E0\u6A2A\u6EDA\uFF0C\u56DE\u5230 vendor \u622A\u65AD\u73B0\u72B6\uFF08\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF09"
    },
    {
      selector: ".wSkVaW_crumbs",
      dshVersion: "0.1.5-rc.2",
      usedBy: "M6 \u6807\u9898\u5BBD\u5EA6\u5730\u677F 96px\uFF08compat.css.ts\uFF09",
      reason: "\u9875\u5934\u6807\u9898\u7C07\u5185\u7684\u4F1A\u8BDD\u9762\u5305\u5C51 nav\uFF08\u4F1A\u8BDD\u540D\u5BB9\u5668\uFF09\uFF1B\u65E0 data-* \u8BED\u4E49\u951A\uFF0C\u5BBD\u5EA6\u5730\u677F\u987B\u843D\u5728\u8BE5\u7C7B\u4E0A",
      fallback: "\u5BF9\u7B56=\u63A5\u53D7\u56DE\u9000\u5E76\u7559\u75D5\uFF1A\u5730\u677F\u5931\u6548 \u2192 \u6807\u9898\u53EF\u88AB\u538B\u5230 0 \u5BBD\uFF08\u6BD4 vendor \u66F4\u5DEE\uFF09\uFF0C\u9875\u5934\u6ED1\u52A8\u672C\u8EAB\u4ECD\u53EF\u7528"
    },
    {
      selector: ".wSkVaW_headerActions",
      dshVersion: "0.1.5-rc.2",
      usedBy: "M6 \u53CD\u5236 dsh-token-usage-xc \u2264380px \u6362\u884C + \u5FBD\u6807\u4E0D\u538B\u6241",
      reason: "actions \u69FD\u5BB9\u5668\u65E0\u66F4\u7EC6\u8BED\u4E49\u951A\uFF1B\u9700\u5B9A\u5411\u9489\u4F4F flex \u57FA\u51C6\uFF08\u5FBD\u6807\u6839\u4E3A\u69FD\u951A\u7684\u5B50\u5973\uFF09",
      fallback: "\u5BF9\u7B56=\u63A5\u53D7\u56DE\u9000\uFF08\u89C4\u5219\u7A7A\u8F6C\uFF09\uFF1A\u6700\u574F = \u2264380px \u4ECD\u6362\u884C\u957F\u9AD8\uFF08\u5373 0.5.8 \u884C\u4E3A\uFF09"
    },
    {
      selector: ".VOzbGW_panel",
      dshVersion: "0.2.0-rc.2",
      usedBy: "M3 \u8BBE\u7F6E\u9762\u677F\u5168\u5C4F + \u8BBE\u7F6E\u65CF\u89C4\u5219\u4F5C\u7528\u57DF\u951A\uFF08misc.css.ts\uFF09",
      reason: "0.2.0 \u8D77\u8BBE\u7F6E\u5BF9\u8BDD\u6846 createPortal \u5230 document.body\uFF0C\u65E0 frame/drawer \u7956\u5148\u4E5F\u65E0 data-* \u951A\uFF1B\u8BBE\u7F6E\u65CF\u89C4\u5219\u53EA\u80FD\u4EE5\u9762\u677F\u54C8\u5E0C\u7C7B\u4E3A\u4F5C\u7528\u57DF\u951A",
      fallback: '\u7ED3\u6784\u5B9A\u4F4D body > .VOzbGW_overlay > [role="dialog"][aria-modal] \u9762\u677F\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u5168\u5C4F\u53EF\u7528'
    },
    {
      selector: ".VOzbGW_nav",
      dshVersion: "0.2.0-rc.2",
      usedBy: "M3 \u8BBE\u7F6E\u5BFC\u822A\u6A2A\u5411\u6EDA\u52A8\u6761\uFF08nav \u4FEE\u590D\uFF1B0.2.0 \u7ECF .VOzbGW_panel:has(> nav) \u91CD\u951A\uFF09",
      reason: "\u5BFC\u822A\u65E0\u8BED\u4E49\u951A\uFF1Bflex-basis:0 \u538B\u96F6 bug \u9700\u5B9A\u5411\u4FEE\u590D",
      fallback: "\u7ED3\u6784\u5B9A\u4F4D dialog \u9996\u4E2A nav \u5B50\u5143\u7D20\uFF1B\u4E0D\u53D8\u5F0F\uFF1A\u6807\u7B7E\u53EF\u89C1\u53EF\u70B9"
    },
    {
      selector: ".cubgiG_item",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M3 agent-preset \u5E95\u90E8\u5F39\u5C42\uFF08:has \u5708\u5B9A\uFF09",
      reason: "body portal [role=menu] \u9700\u7CBE\u786E\u5708\u5B9A\u9632\u8BEF\u4F24\u5176\u4ED6\u83DC\u5355",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u6539\u6309\u83DC\u5355 position:fixed + bottom:12px \u7684\u51E0\u4F55\u7279\u5F81\u6216\u5220\u9664\u8BE5\u89C4\u5219"
    },
    {
      selector: ".CAgGvG_split",
      dshVersion: "0.1.5-rc.1",
      usedBy: "\u79FB\u52A8\u7AEF\u9690\u85CF open-in-app \u6253\u5F00\u8D44\u6E90\u7BA1\u7406\u5668\u6309\u94AE\uFF08compat.css \u7CBE\u786E\u89C4\u5219\uFF09",
      reason: "\u5B98\u65B9 dsh-client-ui-open-in-app split \u5BB9\u5668\u54C8\u5E0C\u7C7B\uFF0C\u65E0 data-* \u951A\uFF1B\u4EC5\u4F1A\u8BDD\u9875\u6E32\u67D3",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u8BE5\u6309\u94AE\u5728\u79FB\u52A8\u7AEF\u6062\u590D\u53EF\u89C1\uFF08\u65E0\u5BB3\uFF09"
    },
    {
      selector: ".nL4_yW_moreButton",
      dshVersion: "0.1.5-rc.1",
      usedBy: "\u79FB\u52A8\u7AEF\u9690\u85CF Session log \u4E0B\u8F7D\uFF08compat.css \u7CBE\u786E\u89C4\u5219\uFF09",
      reason: "\u5B98\u65B9 dsh-session-log-export more \u6309\u94AE\u54C8\u5E0C\u7C7B\uFF0C\u65E0 data-* \u951A\uFF1B\u4EC5\u4F1A\u8BDD\u9875\u6E32\u67D3",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u8BE5\u6309\u94AE\u79FB\u52A8\u7AEF\u6062\u590D\u53EF\u89C1\uFF08\u65E0\u5BB3\uFF09\uFF0C\u4E14\u4E0D\u518D\u9700\u8981\u515C\u5E95\u8FDE\u5750\u6574\u69FD"
    },
    {
      selector: ".YyYd_a_card",
      dshVersion: "0.1.5-rc.1",
      usedBy: "\u8BBE\u7F6E\u914D\u7F6E\u5361\u5361\u58F3\uFF08plugin-card.ts \u5185\u8054\u5F15\u7528\u5B98\u65B9 PluginCard \u7C7B\uFF09",
      reason: "\u5B98\u65B9\u5361\u58F3\u7C7B\u7531 settings-plugins \u5168\u5C40\u6CE8\u5165\uFF0C\u65E0 data-* \u8BED\u4E49\u951A\uFF1B\u4EC5\u8BBE\u7F6E\u9875\u6253\u5F00\u65F6\u6E32\u67D3",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u6539\u7528\u63D2\u4EF6\u81EA\u6709\u5361\u58F3\u6837\u5F0F\uFF08\u529F\u80FD\u4E0D\u53D8\uFF0C\u4EC5\u5916\u89C2\u964D\u7EA7\uFF09"
    },
    {
      selector: '[class*="_scrollBody"]',
      dshVersion: "0.1.5-rc.1",
      usedBy: "M3 \u6D88\u606F\u6EDA\u52A8\u6761\u6BDB\u523A\u4FEE\u590D",
      reason: "data-phase \u4E0B\u6EDA\u52A8\u4F53\u65E0\u8BED\u4E49\u951A\uFF1B\u5B50\u4E32\u5339\u914D\u5DF2\u52A0 :not(_scroll) \u5B88\u536B",
      fallback: "\u4E0D\u53D8\u5F0F\uFF1A\u79FB\u52A8\u7AEF\u6EDA\u52A8\u6761\u4E0D\u53EF\u89C1\uFF1B\u6F02\u79FB\u5219\u5220\u9664\u6837\u5F0F\uFF08\u89C6\u89C9\u6BDB\u523A\u53EF\u63A5\u53D7\uFF09"
    },
    {
      selector: '[class*="_actions"]',
      dshVersion: "0.1.5-rc.1",
      usedBy: "M3 \u6D88\u606F\u64CD\u4F5C\u884C\u6EA2\u51FA\u4FDD\u62A4",
      reason: "\u64CD\u4F5C\u884C\u5BB9\u5668\u65E0\u8BED\u4E49\u951A\uFF1B_[action]/_actions \u65CF\u5DF2\u7528\u5B8C\u6574\u5B50\u4E32\u9632\u8BEF\u4F24",
      fallback: "\u4E0D\u53D8\u5F0F\uFF1A\u64CD\u4F5C\u884C\u4E0D\u51FA\u53F3\u7F18\uFF1B\u6F02\u79FB\u5219\u5220\u9664"
    },
    {
      selector: '[class*="_timeEnd"]',
      dshVersion: "0.1.5-rc.1",
      usedBy: "M3 \u65F6\u95F4\u5FBD\u6807 ellipsis",
      reason: "\u5FBD\u6807\u65E0\u8BED\u4E49\u951A",
      fallback: "\u4E0D\u53D8\u5F0F\uFF1A\u5FBD\u6807\u4E0D\u6362\u884C\u4E0D\u6EA2\u51FA\uFF1B\u6F02\u79FB\u5219\u5220\u9664"
    },
    {
      selector: ".nArs4W_panel",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M5 better-sidebar \u53F3\u62BD\u5C49\u6253\u5F00\u65F6\u9690\u85CF\u6C49\u5821",
      reason: "\u5916\u90E8\u63D2\u4EF6\uFF08dsh-better-sidebar 0.15.2\uFF09\u9762\u677F\u7C7B\uFF0C\u65E0 data-* \u8BED\u4E49\u951A",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u5220\u9664\u8BE5\u89C4\u5219\uFF08\u6C49\u5821\u4E0D\u9690\u85CF\uFF0C\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF09"
    },
    {
      selector: ".nArs4W_panelHidden",
      dshVersion: "0.1.5-rc.1",
      usedBy: "M5 better-sidebar \u9762\u677F\u53EF\u89C1\u6027\u5224\u5B9A\uFF08:not \u6392\u9664\uFF09",
      reason: "\u9762\u677F\u9690\u85CF\u6001\u7C7B\uFF0C\u65E0\u8BED\u4E49\u951A",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u5220\u9664\u8BE5\u89C4\u5219\uFF08\u4FDD\u5B88\u5904\u7406\uFF09"
    },
    {
      selector: ".eGxaPq_slot",
      dshVersion: "0.1.5-rc.2",
      usedBy: "M7 \u8F6E\u6B21\u5BFC\u822A rail \u663E\u793A\uFF08misc.css.ts\uFF09",
      reason: "\u79FB\u52A8\u7AEF\u53CD\u5236 vendor @container \u9690\u85CF\u9700\u7CBE\u786E\u5708\u5B9A rail \u69FD\u5BB9\u5668\uFF1B\u8F6E\u6B21\u523B\u5EA6\u65E0\u8BED\u4E49\u951A",
      fallback: "\u82E5\u6F02\u79FB\uFF1A\u5220\u9664\u8BE5\u89C4\u5219\uFF08\u79FB\u52A8\u7AEF rail \u6062\u590D vendor \u9690\u85CF\u539F\u72B6\uFF0C\u8F6E\u6B21\u8DF3\u8F6C\u9000\u5316\u4E3A\u6EDA\u52A8\u624B\u7FFB\uFF0C\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF09"
    },
    {
      selector: ".eGxaPq_frame",
      dshVersion: "0.1.5-rc.2",
      usedBy: "M7 \u8F6E\u6B21\u5BFC\u822A rail \u547D\u4E2D\u6362\u7B97\u4E0E\u7126\u70B9\uFF08rail-preview.ts\uFF09",
      reason: "\u4E24\u6BB5\u5F0F tap \u9700\u4EE5 frame \u4E3A\u547D\u4E2D\u6362\u7B97\u5750\u6807\u539F\u70B9\u5E76\u7528\u5176\u5185\u90E8 markPosition/scroller \u5B9A\u4F4D\uFF1B\u65E0\u8BED\u4E49\u951A",
      fallback: "\u82E5\u6F02\u79FB\uFF1Arail-preview \u7684 closest \u5931\u914D \u2192 \u70B9\u51FB\u8D70 vendor \u539F\u903B\u8F91\uFF08\u5355\u51FB\u5373\u8DF3\uFF0C\u9884\u89C8\u7F3A\u5931\u4F46\u4E0D\u62A5\u9519\uFF09"
    }
  ];
  function checkStructuralAnchors(doc) {
    const overlay = doc.querySelector("[data-shell-overlay]");
    const frame = overlay === null ? null : overlay.parentElement;
    return {
      shellOverlay: overlay !== null,
      composerSlot: doc.querySelector('[data-slot="conversation.composer.bar"]') !== null,
      frameShape: frame !== null && frame.children.length >= 3,
      rightbarContract: frame !== null && (frame.querySelector(":scope > [data-rightbar-col]") !== null || frame.hasAttribute("data-rightbar-collapsed") || frame.hasAttribute("data-details-collapsed"))
    };
  }
  function checkHashedSelectors(root = document) {
    const missing = [];
    let hits = 0;
    for (const entry of SELECTOR_MAP) {
      let found = false;
      try {
        found = root.querySelector(entry.selector) !== null;
      } catch {
        found = false;
      }
      if (found) hits++;
      else missing.push(entry);
    }
    return { hits, declared: SELECTOR_MAP.length, missing };
  }
  function formatCanaryReport(structural, hashed) {
    const notes = [];
    if (!structural.shellOverlay) notes.push("\u7F3A\u5C11 [data-shell-overlay]\uFF08shell \u7ED3\u6784\u53EF\u80FD\u662F\u65B0\u7248\uFF09");
    if (!structural.composerSlot) notes.push("\u7F3A\u5C11 composer data-slot\uFF08composer \u53EF\u80FD\u662F\u65B0\u7248\uFF09");
    if (!structural.frameShape) notes.push("frame \u76F4\u7CFB\u5B50\u7ED3\u6784\u5F02\u5E38\uFF08\u62BD\u5C49\u5B9A\u4F4D\u53EF\u80FD\u5931\u6548\uFF09");
    if (!structural.rightbarContract) notes.push("\u53F3\u5217\u5951\u7EA6\u7F3A\u5931\uFF08[data-rightbar-col]/data-rightbar-collapsed/data-details-collapsed \u5747\u4E0D\u53EF\u89C1\uFF1B\u906E\u7F69\u4E0E\u53F3\u62BD\u5C49\u72B6\u6001\u53EF\u80FD\u5931\u771F\uFF09");
    if (hashed.missing.length > 0 && hashed.hits === 0) {
      for (const entry of hashed.missing) {
        notes.push(
          entry.selector + " \u672A\u547D\u4E2D\uFF08\u767B\u8BB0\u4E8E dsh " + entry.dshVersion + "\uFF0C\u515C\u5E95\uFF1A" + entry.fallback + "\uFF09"
        );
      }
    } else if (hashed.missing.length > 0 && hashed.hits > 0) {
      notes.push(
        "\u90E8\u5206\u767B\u8BB0\u9009\u62E9\u5668\u672A\u6E32\u67D3\uFF08\u547D\u4E2D " + hashed.hits + "/" + hashed.declared + "\uFF09\uFF0C\u53EF\u80FD\u4EC5\u56E0\u5F53\u524D\u9875\u9762\u72B6\u6001\u672A\u6302\u8F7D\u8BE5\u7EC4\u4EF6\uFF0C\u5DF2\u751F\u6548\u80FD\u529B\u4E0D\u53D7\u5F71\u54CD"
      );
    }
    if (notes.length === 0) return null;
    return "canary\uFF1A\u68C0\u6D4B\u5230 " + notes.length + " \u5904\u4E0E\u672C\u7248 DSH \u53EF\u80FD\u5931\u914D\uFF0C\u5DF2\u6309\u515C\u5E95\u964D\u7EA7\uFF08\u6700\u574F=\u684C\u9762\u539F\u72B6\uFF09\uFF1A\n  - " + notes.join("\n  - ");
  }

  // src/client/core/reconciler-core.ts
  function createReconcilerCore(options) {
    const onError = options.onError ?? ((taskName, error, phase) => {
      console.error(
        "[dsh-mobile-xc] reconciler task " + taskName + (phase === "dispose" ? " dispose" : "") + " failed",
        error
      );
    });
    const registered = /* @__PURE__ */ new Set();
    let active = null;
    let dirty = /* @__PURE__ */ new Set();
    let forceAll = false;
    let pending = null;
    const runEnsure = (task) => {
      try {
        task.ensure();
      } catch (error) {
        onError(task.name, error, "ensure");
      }
    };
    const runDispose = (task) => {
      try {
        task.dispose();
      } catch (error) {
        onError(task.name, error, "dispose");
      }
    };
    const flush = () => {
      if (pending !== null) {
        pending();
        pending = null;
      }
      if (active === null) {
        dirty.clear();
        forceAll = false;
        return;
      }
      if (forceAll) {
        for (const task of active) runEnsure(task);
      } else if (dirty.size > 0) {
        for (const task of active) {
          const scopes = task.scopes;
          if (scopes === void 0 || scopes.some((key) => dirty.has(key))) runEnsure(task);
        }
      }
      dirty.clear();
      forceAll = false;
    };
    const schedule = () => {
      if (pending !== null) return;
      pending = options.requestFrame(() => {
        pending = null;
        flush();
      });
    };
    const register = (task) => {
      registered.add(task);
      return () => {
        registered.delete(task);
        if (active !== null && active.has(task)) {
          active.delete(task);
          runDispose(task);
        }
      };
    };
    const activate = () => {
      active = new Set(registered);
      forceAll = true;
      schedule();
    };
    const deactivate = () => {
      if (active === null) return;
      for (const task of active) runDispose(task);
      active = null;
      dirty.clear();
      forceAll = false;
      if (pending !== null) {
        pending();
        pending = null;
      }
    };
    const note = (keys) => {
      if (active === null) return;
      for (const key of keys) dirty.add(key);
      schedule();
    };
    return {
      get size() {
        return registered.size;
      },
      register,
      activate,
      deactivate,
      note,
      flush: () => {
        flush();
      }
    };
  }

  // src/client/effects/debug.ts
  var NOOP = () => {
  };
  function installDebugBadge(readState) {
    if (typeof window === "undefined") return NOOP;
    if (new URLSearchParams(window.location.search).get("mobile-nav-debug") !== "1") return NOOP;
    const badge = document.createElement("div");
    badge.dataset.mobileNav = "debug";
    const css = {
      position: "fixed",
      right: "8px",
      bottom: "8px",
      zIndex: "2147483000",
      maxWidth: "90vw",
      padding: "6px 10px",
      borderRadius: "8px",
      background: "rgba(0,0,0,0.72)",
      color: "#7ee787",
      font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      whiteSpace: "pre-wrap",
      pointerEvents: "none"
    };
    Object.assign(badge.style, css);
    const paint = () => {
      try {
        const text = readState();
        if (badge.textContent !== text) badge.textContent = text;
      } catch (error) {
        if (badge.textContent !== "[error]") badge.textContent = "[error] " + String(error);
      }
    };
    paint();
    document.body.appendChild(badge);
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    const onError = () => {
      paint();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    const timer = window.setInterval(paint, 2e3);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
      badge.remove();
    };
  }

  // src/client/effects/drawer.ts
  function findFrame() {
    if (typeof document === "undefined") return null;
    const overlay = document.querySelector("[data-shell-overlay]");
    return overlay === null ? null : overlay.parentElement;
  }
  function makeSidebarToggle(ctx) {
    let warned = false;
    return () => {
      const layout = ctx.get("layout");
      if (layout !== null && layout !== void 0 && typeof layout.toggleSidebar === "function") {
        layout.toggleSidebar();
      } else if (!warned) {
        warned = true;
        console.warn("[dsh-mobile-xc] layout \u670D\u52A1\u7F3A\u5931\uFF1A\u62BD\u5C49\u5F00\u5408\u5DF2\u964D\u7EA7\uFF08\u4EC5 CSS \u5C55\u793A\uFF0C\u70B9\u51FB\u5931\u6548\uFF09");
      }
    };
  }
  function detailsOpen(f) {
    if (f.hasAttribute("data-rightbar-fullscreen")) return true;
    return !f.hasAttribute("data-details-collapsed") && !f.hasAttribute("data-rightbar-collapsed");
  }
  function findDetailsCol(f) {
    const anchored = f.querySelector(":scope > [data-rightbar-col]");
    if (anchored !== null) return anchored;
    const byIndex = f.children[2];
    return byIndex === void 0 ? null : byIndex;
  }
  function createFrameMarkerTask() {
    let frame = null;
    return {
      name: "frame-marker",
      scopes: ["*"],
      ensure() {
        const f = findFrame();
        frame = f;
        if (f === null) return;
        f.setAttribute("data-mobile-nav", "frame");
        const drawer = f.firstElementChild;
        if (drawer !== null) drawer.setAttribute("data-mobile-nav", "drawer");
        const overlay = f.querySelector(":scope > [data-shell-overlay]");
        const details = findDetailsCol(f);
        if (details !== null && details !== overlay) {
          details.setAttribute("data-mobile-nav", "details");
        }
        f.toggleAttribute("data-xc-drawer", !f.hasAttribute("data-sidebar-collapsed"));
        f.toggleAttribute("data-xc-details", detailsOpen(f));
      },
      dispose() {
        if (frame === null) return;
        const f = frame;
        frame = null;
        f.removeAttribute("data-mobile-nav");
        f.removeAttribute("data-xc-drawer");
        f.removeAttribute("data-xc-details");
        const drawer = f.firstElementChild;
        if (drawer !== null) drawer.removeAttribute("data-mobile-nav");
        const details = findDetailsCol(f);
        if (details !== null) details.removeAttribute("data-mobile-nav");
      }
    };
  }
  function createDrawerChromeTask(toggleSidebar) {
    let ham = null;
    let scrim = null;
    let refresh = null;
    let frame = null;
    const onHamClick = (event) => {
      event.stopPropagation();
      toggleSidebar();
    };
    const onScrimClick = (event) => {
      event.stopPropagation();
      toggleSidebar();
    };
    const onRefreshClick = (event) => {
      event.stopPropagation();
      window.location.reload();
    };
    return {
      name: "drawer-chrome",
      scopes: ["*"],
      ensure() {
        const f = findFrame();
        frame = f;
        if (f === null) return;
        const allHams = Array.from(document.querySelectorAll(".dsh-xc-ham"));
        if (allHams.length > 0) {
          ham = allHams[0];
          ham.removeEventListener("click", onHamClick);
          ham.addEventListener("click", onHamClick);
          for (let i = 1; i < allHams.length; i++) {
            allHams[i].remove();
          }
        } else {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "dsh-xc-ham";
          b.dataset.mobileNav = "ham";
          b.setAttribute("aria-label", "Toggle sidebar");
          b.textContent = "\u2261";
          b.addEventListener("click", onHamClick);
          f.appendChild(b);
          ham = b;
        }
        const allScrims = Array.from(document.querySelectorAll(".dsh-xc-scrim"));
        if (allScrims.length > 0) {
          scrim = allScrims[0];
          scrim.removeEventListener("click", onScrimClick);
          scrim.addEventListener("click", onScrimClick);
          for (let i = 1; i < allScrims.length; i++) {
            allScrims[i].remove();
          }
        } else {
          const s = document.createElement("div");
          s.className = "dsh-xc-scrim";
          s.dataset.mobileNav = "scrim";
          s.setAttribute("aria-hidden", "true");
          s.addEventListener("click", onScrimClick);
          f.appendChild(s);
          scrim = s;
        }
        if (getConfig().drawerRefresh) {
          if (refresh === null) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "dsh-xc-refresh";
            b.dataset.mobileNav = "refresh";
            b.setAttribute("aria-label", "\u5237\u65B0\u9875\u9762");
            b.textContent = "\u5237\u65B0";
            b.addEventListener("click", onRefreshClick);
            const footer = f.querySelector('[data-mobile-nav="drawer"] [class*="footerActions"], [data-mobile-nav="drawer"] [class*="footArea"]');
            if (footer !== null) footer.appendChild(b);
            else f.appendChild(b);
            refresh = b;
          }
        } else if (refresh !== null) {
          refresh.removeEventListener("click", onRefreshClick);
          refresh.remove();
          refresh = null;
        }
      },
      dispose() {
        if (ham !== null) {
          ham.removeEventListener("click", onHamClick);
          ham.remove();
          ham = null;
        }
        if (scrim !== null) {
          scrim.removeEventListener("click", onScrimClick);
          scrim.remove();
          scrim = null;
        }
        if (refresh !== null) {
          refresh.removeEventListener("click", onRefreshClick);
          refresh.remove();
          refresh = null;
        }
        frame = null;
      }
    };
  }
  var NAV_SELECTOR = '[role="treeitem"], [class*="newSession"], [class*="searchResultRow"], [class*="panelRow"]';
  function installOverlayInteractions(ctx, toggleSidebar) {
    installMobileEffect(ctx, "dsh-mobile-xc: overlay interactions", () => {
      const drawerOpen = () => {
        const f = findFrame();
        return f !== null && !f.hasAttribute("data-sidebar-collapsed");
      };
      const modalOpen = () => typeof document !== "undefined" && document.querySelector('[aria-modal="true"]') !== null;
      const drawerEl = () => {
        const f = findFrame();
        return f === null ? null : f.firstElementChild;
      };
      const isNavTarget = (target) => {
        const btn = target.closest("button");
        if (btn !== null && !btn.matches('[class*="newSession"], [class*="panelRow"]')) return false;
        const row = target.closest(NAV_SELECTOR);
        if (row === null) return false;
        if (row.hasAttribute("aria-expanded")) return false;
        return true;
      };
      const scheduleNavClose = () => {
        const f = findFrame();
        window.setTimeout(() => {
          if (f !== null && !f.hasAttribute("data-sidebar-collapsed")) toggleSidebar();
        }, 320);
      };
      const onKeyDown = (event) => {
        if (event.key !== "Escape") return;
        if (modalOpen()) return;
        if (document.querySelector('[role="menu"], [role="dialog"]') !== null) return;
        if (drawerOpen()) toggleSidebar();
      };
      const onClick = (event) => {
        if (modalOpen()) return;
        if (!drawerOpen()) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const drawer = drawerEl();
        if (drawer === null) return;
        if (target.closest('[data-mobile-nav="ham"], [data-mobile-nav="scrim"]') !== null) return;
        if (target.closest('[role="menu"], [role="dialog"], [role="menuitem"]') !== null) return;
        if (drawer.contains(target)) {
          if (isNavTarget(target)) scheduleNavClose();
        } else {
          toggleSidebar();
        }
      };
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("click", onClick, true);
      return () => {
        document.removeEventListener("keydown", onKeyDown, true);
        document.removeEventListener("click", onClick, true);
      };
    });
  }

  // src/client/effects/gesture.ts
  var EDGE_IGNORE_PX = 16;
  var SWIPE_THRESHOLD_PX = 64;
  function installMobileGesture(ctx, toggleSidebar) {
    installMobileEffect(ctx, "dsh-mobile-xc: gesture", () => {
      let drag = null;
      const modalOpen = () => document.querySelector('[aria-modal="true"]') !== null;
      const drawerOpen = () => {
        const f = document.querySelector("[data-shell-overlay]")?.parentElement;
        return f !== null && f !== void 0 && !f.hasAttribute("data-sidebar-collapsed");
      };
      const isHScrollable = (el) => {
        let n = el;
        while (n !== null && n !== document.body) {
          if (n.scrollWidth > n.clientWidth + 2) {
            const ox = getComputedStyle(n).overflowX;
            if (ox === "auto" || ox === "scroll") return true;
          }
          n = n.parentElement;
        }
        return false;
      };
      const shouldSkip = (target) => {
        if (!(target instanceof Element)) return true;
        if (target.closest('textarea, input, select, button, [contenteditable], [data-mobile-nav="ham"]') !== null) {
          return true;
        }
        return isHScrollable(target);
      };
      const onDown = (event) => {
        if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
        if (!event.isPrimary) return;
        if (modalOpen()) return;
        if (event.clientX < EDGE_IGNORE_PX) return;
        if (shouldSkip(event.target)) return;
        drag = {
          startX: event.clientX,
          startY: event.clientY,
          fired: false,
          pointer: event.pointerId,
          open: drawerOpen()
        };
      };
      const onMove = (event) => {
        const d = drag;
        if (d === null || d.pointer !== event.pointerId) return;
        const dx = event.clientX - d.startX;
        const dy = event.clientY - d.startY;
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          drag = null;
          return;
        }
        if (d.fired) return;
        if (!getConfig().swipeEnabled) return;
        if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
        const swipingRight = dx > 0;
        if (!d.open && swipingRight) toggleSidebar();
        else if (d.open && !swipingRight) toggleSidebar();
        d.fired = true;
      };
      const onUp = (event) => {
        if (drag === null || drag.pointer !== event.pointerId) return;
        drag = null;
      };
      const onCancel = (event) => {
        if (drag === null || drag.pointer !== event.pointerId) return;
        drag = null;
      };
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onCancel, true);
      return () => {
        window.removeEventListener("pointerdown", onDown, true);
        window.removeEventListener("pointermove", onMove, true);
        window.removeEventListener("pointerup", onUp, true);
        window.removeEventListener("pointercancel", onCancel, true);
      };
    });
  }

  // src/client/effects/rail-preview.ts
  var TURN_SPACING_PX = 10;
  var RAIL_INSET_PX = 6;
  var FRAME_SELECTOR = '[class*="eGxaPq_frame"]';
  var MARK_POSITION_SELECTOR = '[class*="eGxaPq_markPosition"]';
  var SCROLLER_SELECTOR = '[class*="eGxaPq_scroller"]';
  function indexAtPoint(frame, clientY) {
    const scroller = frame.querySelector(SCROLLER_SELECTOR);
    const positions = frame.querySelectorAll(MARK_POSITION_SELECTOR);
    if (positions.length === 0) return null;
    const scrollTop = scroller === null ? 0 : scroller.scrollTop;
    const offset = clientY - frame.getBoundingClientRect().top + scrollTop - RAIL_INSET_PX;
    return Math.max(0, Math.min(positions.length - 1, Math.round(offset / TURN_SPACING_PX)));
  }
  function focusMarkAt(frame, index) {
    const positions = frame.querySelectorAll(MARK_POSITION_SELECTOR);
    const position = positions[index];
    if (position === void 0) return;
    const button = position.querySelector("button");
    button?.focus({ preventScroll: true });
  }
  var TURN_RAIL_ATTR = "data-xc-turn-rail";
  function createTurnRailTask() {
    return {
      name: "turn-rail",
      scopes: ["*"],
      ensure() {
        const html = document.documentElement;
        if (!getConfig().turnRail || document.querySelector('[data-slot="conversation.chat"], [data-mobile-nav="frame"] [class*="eGxaPq_slot"]') === null) {
          html.removeAttribute(TURN_RAIL_ATTR);
          return;
        }
        html.setAttribute(TURN_RAIL_ATTR, "");
      },
      dispose() {
        document.documentElement.removeAttribute(TURN_RAIL_ATTR);
      }
    };
  }
  function installRailPreviewTap(ctx) {
    installMobileEffect(ctx, "dsh-mobile-xc: rail preview tap", () => {
      let armed = null;
      const onClickCapture = (event) => {
        if (!document.documentElement.hasAttribute(TURN_RAIL_ATTR)) return;
        const target = event.target;
        const frame = target === null ? null : target.closest(FRAME_SELECTOR);
        if (frame === null) {
          armed = null;
          const active = document.activeElement;
          if (active instanceof HTMLElement && active.closest(FRAME_SELECTOR) !== null) active.blur();
          return;
        }
        const index = indexAtPoint(frame, event.clientY);
        if (index === null) return;
        if (armed !== null && armed.frame === frame && armed.index === index) {
          armed = null;
          const active = document.activeElement;
          if (active instanceof HTMLElement && active.closest(FRAME_SELECTOR) !== null) active.blur();
          return;
        }
        armed = { frame, index };
        event.preventDefault();
        event.stopPropagation();
        focusMarkAt(frame, index);
      };
      window.addEventListener("click", onClickCapture, true);
      return () => {
        window.removeEventListener("click", onClickCapture, true);
        armed = null;
      };
    });
  }

  // src/client/effects/composer.ts
  var CARD_SEL = ".uV2eYG_card";
  var EASE = "height .32s cubic-bezier(.32, .72, .24, 1), max-width .32s cubic-bezier(.32, .72, .24, 1)";
  var NOOP2 = () => {
  };
  function installComposerAutoCollapse() {
    if (typeof document === "undefined") return NOOP2;
    const isComposerEl2 = (el) => el !== null && el.closest('[data-slot^="conversation.composer"], [data-composer-seat]') !== null;
    let lastSubmitTime = 0;
    const scheduleBlur = () => {
      window.setTimeout(() => {
        if (document.querySelector('[role="menu"], [role="dialog"]') !== null) return;
        const active = document.activeElement;
        if (!(active instanceof HTMLElement) || !isComposerEl2(active)) return;
        const input = active;
        if (typeof input.value === "string" && input.value.trim() !== "") return;
        if (typeof active.textContent === "string" && active.textContent.trim() !== "") return;
        active.blur();
      }, 220);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      if (!isComposerEl2(event.target)) return;
      const now = Date.now();
      if (now - lastSubmitTime < 600) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      lastSubmitTime = now;
      scheduleBlur();
    };
    const onClick = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".uV2eYG_primary") !== null) {
        const now = Date.now();
        if (now - lastSubmitTime < 600) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        lastSubmitTime = now;
        scheduleBlur();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }
  function createComposerHeightTask() {
    let card = null;
    let ro = null;
    let busy = false;
    let animateNext = false;
    let prevH = 0;
    const flipTo = (targetH) => {
      const el = card;
      if (el === null) return;
      const cur = el.getBoundingClientRect().height;
      busy = true;
      el.style.transition = "none";
      el.style.height = cur + "px";
      void el.offsetHeight;
      el.style.transition = EASE;
      el.style.height = targetH + "px";
      window.setTimeout(() => {
        if (el.isConnected) {
          el.style.height = "";
          el.style.transition = "";
        }
        busy = false;
        prevH = el.getBoundingClientRect().height;
      }, 400);
    };
    return {
      name: "composer-height",
      scopes: ["class", "*"],
      ensure() {
        const el = document.querySelector(CARD_SEL);
        if (el === card && card !== null) return;
        if (ro !== null && card !== null && card !== el) {
          ro.disconnect();
          ro = null;
        }
        card = el;
        if (card === null) return;
        prevH = card.getBoundingClientRect().height;
        const onFocus = () => {
          animateNext = true;
        };
        card.addEventListener("focusin", onFocus);
        card.addEventListener("focusout", onFocus);
        ro = new ResizeObserver(() => {
          if (card === null || !card.isConnected) return;
          const cur = card.getBoundingClientRect().height;
          if (Math.abs(cur - prevH) < 1) return;
          if (animateNext && !busy) {
            animateNext = false;
            flipTo(cur);
          } else if (!busy) {
            prevH = cur;
          }
        });
        ro.observe(card);
      },
      dispose() {
        ro?.disconnect();
        ro = null;
        if (card !== null) {
          card.style.height = "";
          card.style.transition = "";
          card = null;
        }
      }
    };
  }

  // src/client/effects/compat.ts
  function createMarketNavTask() {
    let present = false;
    return {
      name: "market-nav-fix",
      scopes: ["*"],
      ensure() {
        const now = document.querySelector("[data-dsh-market-root]") !== null;
        if (now === present) return;
        present = now;
        if (getConfig().dshmarketNavFix) {
          document.documentElement.toggleAttribute("data-xc-market-fix", now);
        }
      },
      dispose() {
        present = false;
        document.documentElement.removeAttribute("data-xc-market-fix");
      }
    };
  }

  // src/client/effects/workspace-compat.ts
  var RE = /^(\u6dfb\u52a0\u5de5\u4f5c\u533a|Add workspace)/;
  function collectRoots() {
    const roots = [];
    const menu = document.querySelector('[role="menu"]');
    if (menu !== null) roots.push(menu);
    const overlay = document.querySelector("[data-shell-overlay]");
    const drawer = overlay === null ? null : overlay.parentElement?.firstElementChild ?? null;
    if (drawer !== null) roots.push(drawer);
    return roots;
  }
  function createHideAddWorkspaceTask() {
    const hidden = /* @__PURE__ */ new Set();
    return {
      name: "hide-add-workspace",
      scopes: ["*"],
      ensure() {
        for (const root of collectRoots()) {
          const els = root.querySelectorAll('button, [role="menuitem"], [aria-label], [title]');
          for (const el of els) {
            if (!(el instanceof HTMLElement)) continue;
            const text = (el.textContent ?? "").trim();
            const aria = el.getAttribute("aria-label") ?? "";
            const title = el.getAttribute("title") ?? "";
            if (!RE.test(text) && !RE.test(aria) && !RE.test(title)) continue;
            const target = el.closest("button") ?? el;
            if (hidden.has(target)) continue;
            hidden.add(target);
            target.style.display = "none";
          }
        }
      },
      dispose() {
        for (const el of hidden) el.style.display = "";
        hidden.clear();
      }
    };
  }

  // src/client/effects/settings-panel.ts
  var OPEN_DOC_RE = /^(\u6253\u5f00\u914d\u7f6e\u6587\u4ef6|Open configuration file)$/;
  function findSettingsDialog() {
    if (typeof document === "undefined") return null;
    const dlg = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (!(dlg instanceof HTMLElement)) return null;
    if (dlg.querySelector(":scope > nav") === null) return null;
    return dlg;
  }
  function isHidden(el) {
    return el.style.display === "none" || getComputedStyle(el).display === "none";
  }
  function hasVisibleContent(el) {
    for (const child of el.children) {
      if (!(child instanceof HTMLElement)) {
        if ((child.textContent ?? "").trim() !== "") return true;
        continue;
      }
      if (isHidden(child)) continue;
      if ((child.textContent ?? "").trim() !== "" && child.children.length === 0) return true;
      if (hasVisibleContent(child)) return true;
    }
    return false;
  }
  function createSettingsPanelTask() {
    const hidden = /* @__PURE__ */ new Set();
    let movedClose = null;
    let movedFrom = null;
    return {
      name: "settings-panel-header",
      scopes: ["*"],
      ensure() {
        const dlg = findSettingsDialog();
        if (dlg === null) return;
        const nav = dlg.querySelector(":scope > nav");
        if (!(nav instanceof HTMLElement)) return;
        for (const btn of dlg.querySelectorAll("button")) {
          if (!(btn instanceof HTMLElement)) continue;
          const text = (btn.textContent ?? "").trim();
          if (!OPEN_DOC_RE.test(text)) continue;
          if (!hidden.has(btn)) hidden.add(btn);
          btn.style.display = "none";
        }
        const close = dlg.querySelector(".VOzbGW_close");
        if (close instanceof HTMLElement) {
          const title = dlg.querySelector(".VOzbGW_navTitle");
          const anchor = title instanceof HTMLElement ? title : nav.firstElementChild;
          const misplaced = close.parentElement !== nav || anchor !== null && close.nextElementSibling !== anchor && close !== anchor;
          if (misplaced) {
            if (close.parentElement !== nav) {
              movedFrom = { parent: close.parentNode, next: close.nextSibling };
            }
            nav.insertBefore(close, anchor);
            movedClose = close;
          }
        }
        const actions = dlg.querySelector(".VOzbGW_actions");
        if (actions instanceof HTMLElement && !isHidden(actions) && !hasVisibleContent(actions)) {
          hidden.add(actions);
          actions.style.display = "none";
        }
        const header = dlg.querySelector(".VOzbGW_header");
        if (header instanceof HTMLElement && !isHidden(header) && !hasVisibleContent(header)) {
          hidden.add(header);
          header.style.display = "none";
        }
      },
      dispose() {
        for (const el of hidden) {
          el.style.display = "";
        }
        hidden.clear();
        if (movedClose !== null && movedClose.isConnected && movedClose.parentElement !== null) {
          const back = movedFrom;
          if (back !== null && back.parent !== null) {
            back.parent.insertBefore(movedClose, back.next);
          } else {
            const dialog = movedClose.closest('[role="dialog"]');
            const header = dialog === null ? null : dialog.querySelector(".VOzbGW_header");
            if (header !== null) header.appendChild(movedClose);
          }
        }
        movedClose = null;
        movedFrom = null;
      }
    };
  }

  // src/client/effects/header-scroll.ts
  var CLUSTER_SEL = '[data-mobile-nav="frame"] .wSkVaW_titleRow .wSkVaW_titleCluster';
  var EPS = 2;
  function hasMoreToReveal(scrollWidth, clientWidth, scrollLeft) {
    return scrollWidth > clientWidth + EPS && scrollLeft + clientWidth < scrollWidth - EPS;
  }
  function createHeaderScrollTask() {
    let cluster = null;
    let ro = null;
    let lastTitle = "";
    const measure = () => {
      const el = cluster;
      if (el === null || !el.isConnected) return;
      el.toggleAttribute("data-xc-hscroll-more", hasMoreToReveal(el.scrollWidth, el.clientWidth, el.scrollLeft));
    };
    const onScroll = () => {
      measure();
    };
    const release = () => {
      if (ro !== null) {
        ro.disconnect();
        ro = null;
      }
      if (cluster !== null) {
        cluster.removeEventListener("scroll", onScroll);
        cluster.removeAttribute("data-xc-hscroll-more");
      }
      cluster = null;
      lastTitle = "";
    };
    const adopt = (el) => {
      release();
      cluster = el;
      if (typeof ResizeObserver === "function") {
        ro = new ResizeObserver(measure);
        ro.observe(el);
        const first = el.firstElementChild;
        const last = el.lastElementChild;
        if (first !== null) ro.observe(first);
        if (last !== null) ro.observe(last);
      }
      el.addEventListener("scroll", onScroll, { passive: true });
    };
    return {
      name: "header-scroll",
      scopes: ["*"],
      ensure() {
        const html = document.documentElement;
        if (!getConfig().headerScroll) {
          html.removeAttribute("data-xc-hscroll");
          release();
          return;
        }
        html.setAttribute("data-xc-hscroll", "");
        const el = document.querySelector(CLUSTER_SEL);
        if (el === null) {
          release();
          return;
        }
        if (el !== cluster) adopt(el);
        const nav = el.firstElementChild;
        const title = nav === null ? "" : nav.textContent ?? "";
        if (title !== lastTitle) {
          lastTitle = title;
          if (el.scrollLeft !== 0) el.scrollLeft = 0;
        }
        measure();
      },
      dispose() {
        document.documentElement.removeAttribute("data-xc-hscroll");
        release();
      }
    };
  }

  // src/client/effects/history-scroll.ts
  var TOP_THRESHOLD_PX = 180;
  var COOLDOWN_MS = 2e3;
  var OLDER_BTN_SEL = '[class*="_older"] button, [data-chat-flow] button';
  var SCROLLER_SEL = '[class*="_scrollBody"], [data-conversation-scroll]';
  function createHistoryScrollTask() {
    let boundScroller = null;
    let isTouching = false;
    let lastTriggerTime = 0;
    let checkTimer = null;
    let lastScrollTop = 0;
    let isPagingActive = false;
    let anchorEl = null;
    let anchorAbsoluteTop = 0;
    let mo = null;
    const findScroller = () => {
      const flow = document.querySelector("[data-chat-flow]");
      if (flow === null) return null;
      let parent = flow.parentElement;
      while (parent !== null && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const oy = style.overflowY;
        if (oy === "auto" || oy === "scroll") return parent;
        parent = parent.parentElement;
      }
      return document.querySelector(SCROLLER_SEL);
    };
    const findOlderButton = () => {
      return document.querySelector(OLDER_BTN_SEL);
    };
    const captureAnchor = (scroller) => {
      const scrollerRect = scroller.getBoundingClientRect();
      const cards = Array.from(scroller.querySelectorAll("[data-chat-flow-key]"));
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.bottom > scrollerRect.top) {
          anchorEl = card;
          anchorAbsoluteTop = rect.top - scrollerRect.top + scroller.scrollTop;
          lastCompensatedScrollTop = scroller.scrollTop;
          return;
        }
      }
      anchorEl = null;
    };
    let lastCompensatedScrollTop = 0;
    const reconcileAnchor = () => {
      if (!isPagingActive || boundScroller === null || anchorEl === null) return;
      if (!anchorEl.isConnected) {
        isPagingActive = false;
        return;
      }
      const scroller = boundScroller;
      const scrollerRect = scroller.getBoundingClientRect();
      const currentAbsoluteTop = anchorEl.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop;
      const prependHeight = currentAbsoluteTop - anchorAbsoluteTop;
      if (Math.abs(prependHeight) > 2) {
        const alreadyAdjusted = scroller.scrollTop - lastCompensatedScrollTop;
        const uncompensatedGap = prependHeight - alreadyAdjusted;
        if (Math.abs(uncompensatedGap) > 2) {
          scroller.scrollTop += uncompensatedGap;
        }
        anchorAbsoluteTop = anchorEl.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop;
        lastCompensatedScrollTop = scroller.scrollTop;
      }
    };
    const startAnchorGuard = (scroller) => {
      if (isPagingActive) return;
      isPagingActive = true;
      captureAnchor(scroller);
      if (mo !== null) mo.disconnect();
      const flow = scroller.querySelector("[data-chat-flow]") ?? scroller;
      mo = new MutationObserver(() => {
        reconcileAnchor();
      });
      mo.observe(flow, { childList: true, subtree: false });
    };
    const stopAnchorGuard = () => {
      isPagingActive = false;
      anchorEl = null;
      if (mo !== null) {
        mo.disconnect();
        mo = null;
      }
    };
    const maybeTrigger = () => {
      if (!getConfig().autoLoadEarlier) return;
      const now = Date.now();
      if (now - lastTriggerTime < COOLDOWN_MS) return;
      if (isTouching) return;
      const btn = findOlderButton();
      if (btn === null || !btn.isConnected || btn.disabled) return;
      const scroller = boundScroller ?? findScroller();
      if (scroller !== null && scroller.scrollTop > TOP_THRESHOLD_PX) return;
      lastTriggerTime = now;
      if (scroller !== null) {
        startAnchorGuard(scroller);
      }
      try {
        btn.click();
      } catch {
      }
    };
    const scheduleCheck = () => {
      if (checkTimer !== null) return;
      checkTimer = window.setTimeout(() => {
        checkTimer = null;
        maybeTrigger();
      }, 250);
    };
    const onScroll = () => {
      const scroller = boundScroller;
      if (scroller === null) return;
      const currentTop = scroller.scrollTop;
      const isScrollingUp = currentTop < lastScrollTop;
      lastScrollTop = currentTop;
      const btn = findOlderButton();
      if (isPagingActive && (btn === null || !btn.disabled)) {
        stopAnchorGuard();
      }
      if (currentTop <= TOP_THRESHOLD_PX && isScrollingUp) {
        scheduleCheck();
      }
    };
    const onTouchStart = () => {
      isTouching = true;
    };
    const onTouchEnd = () => {
      isTouching = false;
      window.setTimeout(() => {
        maybeTrigger();
      }, 80);
    };
    const onPointerDown = (e) => {
      const target = e.target;
      if (target && target.closest(OLDER_BTN_SEL)) {
        const scroller = boundScroller ?? findScroller();
        if (scroller !== null) {
          startAnchorGuard(scroller);
        }
      }
    };
    const bind = (scroller) => {
      if (boundScroller === scroller) return;
      unbind();
      boundScroller = scroller;
      scroller.addEventListener("scroll", onScroll, { passive: true });
      scroller.addEventListener("touchstart", onTouchStart, { passive: true });
      scroller.addEventListener("touchend", onTouchEnd, { passive: true });
      scroller.addEventListener("touchcancel", onTouchEnd, { passive: true });
      scroller.addEventListener("pointerdown", onPointerDown, { passive: true });
    };
    const unbind = () => {
      if (boundScroller !== null) {
        boundScroller.removeEventListener("scroll", onScroll);
        boundScroller.removeEventListener("touchstart", onTouchStart);
        boundScroller.removeEventListener("touchend", onTouchEnd);
        boundScroller.removeEventListener("touchcancel", onTouchEnd);
        boundScroller.removeEventListener("pointerdown", onPointerDown);
        boundScroller = null;
      }
      stopAnchorGuard();
      if (checkTimer !== null) {
        clearTimeout(checkTimer);
        checkTimer = null;
      }
      isTouching = false;
    };
    return {
      name: "history-scroll",
      scopes: ["*"],
      ensure() {
        if (!getConfig().autoLoadEarlier) {
          unbind();
          return;
        }
        const scroller = findScroller();
        if (scroller !== null && scroller.isConnected) {
          bind(scroller);
        } else {
          unbind();
        }
      },
      dispose() {
        unbind();
      }
    };
  }

  // src/client/effects/upload-guard.ts
  var MAX_IMAGE_SIDE = 2048;
  var JPEG_QUALITY = 0.82;
  var COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024;
  async function downsampleImage(file) {
    if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w <= 0 || h <= 0) {
          resolve(file);
          return;
        }
        if (w > MAX_IMAGE_SIDE || h > MAX_IMAGE_SIDE) {
          if (w >= h) {
            h = Math.round(h * MAX_IMAGE_SIDE / w);
            w = MAX_IMAGE_SIDE;
          } else {
            w = Math.round(w * MAX_IMAGE_SIDE / h);
            h = MAX_IMAGE_SIDE;
          }
        }
        try {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            JPEG_QUALITY
          );
        } catch (err) {
          console.warn("[dsh-mobile-web-pro] downsample error, keeping original:", err);
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }
  var fileReaderPatched = false;
  function installFileReaderGuard() {
    if (fileReaderPatched || typeof window === "undefined" || !window.FileReader) return () => {
    };
    fileReaderPatched = true;
    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function(blobOrFile) {
      if (blobOrFile instanceof Blob && ["image/jpeg", "image/png", "image/webp"].includes(blobOrFile.type) && blobOrFile.size > COMPRESS_THRESHOLD_BYTES) {
        downsampleImage(blobOrFile).then((safeBlob) => {
          originalReadAsDataURL.call(this, safeBlob);
        }).catch(() => {
          originalReadAsDataURL.call(this, blobOrFile);
        });
        return;
      }
      return originalReadAsDataURL.call(this, blobOrFile);
    };
    return () => {
      FileReader.prototype.readAsDataURL = originalReadAsDataURL;
      fileReaderPatched = false;
    };
  }
  function createUploadGuardTask() {
    return {
      name: "upload-guard",
      scopes: ["*"],
      ensure() {
        const inputs = document.querySelectorAll('input[type="file"]');
        for (const input of inputs) {
          if (input.dataset.uploadGuarded === "true") continue;
          input.dataset.uploadGuarded = "true";
          if (!input.hasAttribute("accept")) {
            input.setAttribute("accept", "image/*,*/*");
          }
        }
      },
      cleanup() {
      }
    };
  }

  // src/client/effects/tasks.ts
  function registerDrawerTasks(core, toggleSidebar) {
    const removeMarker = core.register(createFrameMarkerTask());
    const removeChrome = core.register(createDrawerChromeTask(toggleSidebar));
    return () => {
      removeMarker();
      removeChrome();
    };
  }
  function registerComposerTasks(core) {
    return core.register(createComposerHeightTask());
  }
  function registerCompatTasks(core) {
    const removeMarket = core.register(createMarketNavTask());
    const removeHideAdd = core.register(createHideAddWorkspaceTask());
    const removeSettingsPanel = core.register(createSettingsPanelTask());
    const removeHeaderScroll = core.register(createHeaderScrollTask());
    const removeTurnRail = core.register(createTurnRailTask());
    const removeHistoryScroll = core.register(createHistoryScrollTask());
    const removeUploadGuard = core.register(createUploadGuardTask());
    return () => {
      removeMarket();
      removeHideAdd();
      removeSettingsPanel();
      removeHeaderScroll();
      removeTurnRail();
      removeHistoryScroll();
      removeUploadGuard();
    };
  }

  // src/client/effects/focus-guard.ts
  var NOOP3 = () => {
  };
  var COMPOSER_SEL = '[data-slot^="conversation.composer"], [data-composer-seat], [class*="uV2eYG_"]';
  var CONTROL_SEL = 'button, a[href], select, [role="button"], [role="menuitem"], [role="tab"], input[type="checkbox"], input[type="radio"]';
  var isComposerEl = (el) => el.closest(COMPOSER_SEL) !== null;
  var isControl = (el) => el.closest(CONTROL_SEL) !== null;
  function installFocusGuard() {
    if (typeof document === "undefined" || typeof HTMLElement === "undefined") return NOOP3;
    const ALLOW_MS = 1e3;
    let allowUntil = 0;
    const allowed = () => Date.now() < allowUntil;
    const onPointerDown = (event) => {
      const hit = event.target instanceof Element && isComposerEl(event.target) && !isControl(event.target);
      allowUntil = hit ? Date.now() + ALLOW_MS : 0;
    };
    const onFocusIn = (event) => {
      if (allowed()) return;
      const target = event.target;
      if (target instanceof HTMLElement && isComposerEl(target)) target.blur();
    };
    const nativeFocus = HTMLElement.prototype.focus;
    const patchedFocus = function patchedFocus2(...args) {
      if (!allowed() && isComposerEl(this)) return;
      nativeFocus.apply(this, args);
    };
    HTMLElement.prototype.focus = patchedFocus;
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    const active = document.activeElement;
    if (active instanceof HTMLElement && isComposerEl(active)) active.blur();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      HTMLElement.prototype.focus = nativeFocus;
    };
  }

  // src/client/effects/plugin-card.ts
  var XC_NS = "dsh-mobile-web-pro";
  var FIELDS = [
    { key: "swipeEnabled", label: "\u6ED1\u52A8\u6253\u5F00\u62BD\u5C49", hint: "\u4ECE\u5C4F\u5E55\u5DE6\u8FB9\u7F18\u53F3\u6ED1\u6253\u5F00\u5DE5\u4F5C\u533A\u62BD\u5C49" },
    { key: "dshmarketNavFix", label: "dshmarket \u8BBE\u7F6E\u5BFC\u822A\u4FEE\u590D", hint: "\u7A84\u5C4F\u4FDD\u7559\u8BBE\u7F6E\u5BFC\u822A\uFF0C\u9632\u6B62\u5E02\u573A\u9875\u6B7B\u8DEF" },
    { key: "pwaEnabled", label: "PWA \u79BB\u7EBF\u7F13\u5B58", hint: "\u5173\u95ED\u540E\u7ACB\u5373\u5378\u8F7D\u7F13\u5B58\uFF0C\u9875\u9762\u8D70\u7F51\u7EDC" },
    { key: "drawerRefresh", label: "\u62BD\u5C49\u5237\u65B0\u6309\u94AE", hint: "\u4FA7\u680F\u5E95\u90E8\u5237\u65B0\u5165\u53E3\uFF0CPWA \u65E0\u4E0B\u62C9\u5237\u65B0\u65F6\u7684\u624B\u52A8\u5237\u65B0\uFF08\u9ED8\u8BA4\u9690\u85CF\uFF09" },
    { key: "headerScroll", label: "\u9875\u5934\u6A2A\u5411\u6ED1\u52A8", hint: "\u7A84\u5C4F\u4E0B\u9875\u5934\u6807\u9898\u4E0E PTC/\u7528\u91CF\u5FBD\u6807\u4FDD\u6301\u5355\u884C\uFF0C\u6EA2\u51FA\u90E8\u5206\u5DE6\u53F3\u6ED1\u52A8\u67E5\u770B" },
    { key: "turnRail", label: "\u8F6E\u6B21\u5BFC\u822A", hint: "\u5BF9\u8BDD\u53F3\u4FA7\u8F6E\u6B21\u523B\u5EA6\u6761\uFF1A\u5E73\u65F6\u6DE1\u663E\uFF0C\u70B9\u51FB\u5148\u9884\u89C8\u8F6E\u6B21\u3001\u518D\u70B9\u540C\u4E00\u523B\u5EA6\u8DF3\u8F6C" },
    { key: "autoLoadEarlier", label: "\u5E73\u6ED1\u81EA\u52A8\u52A0\u8F7D\u5386\u53F2", hint: "\u5728\u5BF9\u8BDD\u5217\u8868\u5411\u4E0A\u6ED1\u52A8\u81F3\u9876\u90E8\u9644\u8FD1\u65F6\uFF0C\u5E73\u6ED1\u81EA\u52A8\u62C9\u53D6\u66F4\u65E9\u5386\u53F2\uFF0C\u9632\u8DF3\u52A8\u4E0E\u52A8\u91CF\u4FDD\u62A4" }
  ];
  var rowClass = "dsh-xc-srow";
  var textClass = "dsh-xc-srow-text";
  var titleClass = "dsh-xc-srow-title";
  var hintClass = "dsh-xc-srow-hint";
  var swClass = "dsh-xc-switch";
  var cardInstalled = false;
  function installXcPluginCard(ctx, react) {
    if (cardInstalled) return;
    cardInstalled = true;
    try {
      const face = ctx;
      const slots = face.slots ?? (typeof face.get === "function" ? face.get("slots") : void 0);
      const scopeFace = face.configForms ?? (typeof face.get === "function" ? face.get("configForms") : void 0);
      if (slots === void 0 || typeof slots.inject !== "function") return;
      if (scopeFace === void 0 || typeof scopeFace.get !== "function") return;
      let scope = null;
      try {
        scope = scopeFace.get(XC_NS) ?? scopeFace.get?.("dsh-mobile-xc");
      } catch {
        return;
      }
      const s = scope;
      if (s === null || typeof s.getSnapshot !== "function" || typeof s.set !== "function") return;
      const CardComponent = (props) => {
        const view = props !== null && props !== void 0 ? props.view : void 0;
        const [open, setOpen] = react.useState(false);
        const page = view === "page";
        const expanded = page || open;
        const read = () => {
          try {
            const v = resolveSettingsValue(s.getSnapshot());
            return v !== void 0 && v !== null && typeof v === "object" ? v : {};
          } catch {
            return {};
          }
        };
        const [values, setValues] = react.useState(read);
        const dirtyRef = react.useRef(false);
        react.useEffect(() => {
          let alive = true;
          const sync = () => {
            if (!alive) return;
            try {
              const v = read();
              if (v !== void 0 && v !== null && Object.keys(v).length > 0) setValues(v);
            } catch {
            }
          };
          sync();
          const timer = window.setTimeout(sync, 400);
          const off = typeof s.subscribe === "function" ? s.subscribe(() => {
            if (!dirtyRef.current) sync();
          }) : null;
          return () => {
            alive = false;
            window.clearTimeout(timer);
            if (off !== null) {
              try {
                off();
              } catch {
              }
            }
          };
        }, []);
        const toggle = (field) => {
          dirtyRef.current = true;
          const currentVal = values[field] ?? true;
          const nextVal = !currentVal;
          setValues((prev) => ({ ...prev, [field]: nextVal }));
          try {
            setConfig({ [field]: nextVal });
          } catch {
          }
          try {
            const res = s.set(field, nextVal);
            if (res !== null && typeof res === "object" && "catch" in res && typeof res.catch === "function") {
              ;
              res.catch(() => {
              });
            }
          } catch {
          }
        };
        const rows = FIELDS.map(({ key, label, hint }) => {
          const checked = values[key] ?? true;
          return react.createElement(
            "div",
            {
              key,
              className: rowClass,
              onClick: () => toggle(key)
            },
            react.createElement(
              "div",
              { className: textClass },
              react.createElement("span", { className: titleClass }, label),
              react.createElement("span", { className: hintClass }, hint)
            ),
            react.createElement(
              "div",
              {
                className: swClass + (checked ? " on" : ""),
                role: "switch",
                "aria-checked": checked ? "true" : "false",
                "aria-label": label
              },
              react.createElement("span", { className: "dsh-xc-switch-thumb" })
            )
          );
        });
        if (page) {
          return react.createElement(
            "div",
            { className: "dsh-xc-page" },
            react.createElement("h3", { className: "dsh-xc-pagesec" }, "\u79FB\u52A8\u7AEF\u65D7\u8230\u7279\u6027 (Pro)"),
            ...rows
          );
        }
        return react.createElement(
          "div",
          { className: "YyYd_a_card" },
          react.createElement(
            "button",
            {
              type: "button",
              className: "YyYd_a_head",
              "aria-expanded": open ? "true" : "false",
              "aria-label": (open ? "Collapse" : "Expand") + ": \u79FB\u52A8\u7AEF\u9002\u914D (Pro)",
              onClick: () => setOpen(!open)
            },
            react.createElement(
              "span",
              { className: "YyYd_a_headText" },
              react.createElement("span", { className: "YyYd_a_name" }, "\u79FB\u52A8\u7AEF\u9002\u914D (Pro)"),
              react.createElement("span", { className: "YyYd_a_description" }, "\u65D7\u8230\u79FB\u52A8\u7AEF\u9009\u9879\uFF1A\u6ED1\u52A8\u62BD\u5C49 / \u5E02\u573A\u517C\u5BB9 / \u5237\u65B0\u6309\u94AE / PWA / \u9875\u5934\u6ED1\u52A8 / \u8F6E\u6B21\u5BFC\u822A / \u5E73\u6ED1\u81EA\u52A8\u52A0\u8F7D\u5386\u53F2")
            ),
            react.createElement(
              "svg",
              {
                className: "YyYd_a_chevron" + (open ? " YyYd_a_chevronOpen" : ""),
                width: "14",
                height: "14",
                viewBox: "0 0 16 16",
                fill: "none",
                "aria-hidden": "true"
              },
              react.createElement("path", { d: "M3 6L8 11L13 6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
            )
          ),
          open ? react.createElement("div", { className: "YyYd_a_body" }, ...rows) : null
        );
      };
      face.effect(() => {
        const styleTag = document.createElement("style");
        styleTag.dataset.pluginCss = "@dsh-mobile-web-pro/card";
        styleTag.textContent = [
          ".dsh-xc-srow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--dsw-alias-border-l1,#2a3342);cursor:pointer}",
          ".dsh-xc-srow:first-child{border-top:none}",
          ".dsh-xc-srow-text{display:flex;flex-direction:column;gap:2px;min-width:0;padding-right:8px}",
          ".dsh-xc-srow-title{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#e2e8f0);font-weight:500}",
          ".dsh-xc-srow-hint{font-size:12px;line-height:16px;color:var(--dsw-alias-label-caption,#94a3b8)}",
          ".dsh-xc-switch{position:relative;width:40px;height:24px;flex:none;border-radius:12px;background:var(--dsw-alias-border-l2,#3b4557);transition:background .18s var(--ds-ease-in-out,ease)}",
          ".dsh-xc-switch.on{background:var(--dsw-alias-button-info-fill,#3b82f6)}",
          ".dsh-xc-switch input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}",
          ".dsh-xc-switch-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .18s var(--ds-ease-in-out,ease);pointer-events:none}",
          ".dsh-xc-switch.on .dsh-xc-switch-thumb{transform:translateX(16px)}",
          ".dsh-xc-pagesec{margin:0 0 8px;font-size:14px;line-height:20px;font-weight:500;color:var(--dsw-alias-label-primary,#e2e8f0)}"
        ].join("");
        document.head.appendChild(styleTag);
        const remove = slots.inject("plugins.bundle.config", function* () {
          yield slots.register(
            {
              name: "plugins.bundle.config",
              key: XC_NS,
              order: 25
            },
            CardComponent
          );
        });
        return () => {
          styleTag.remove();
          if (remove !== void 0 && remove !== null && typeof remove === "function") {
            try {
              ;
              remove();
            } catch {
            }
          }
        };
      }, "dsh-mobile-web-pro: plugin config card");
    } catch {
    }
  }

  // src/client/effects/phone-chrome.ts
  var NOOP4 = () => {
  };
  function composeViewportContent(lockedMaximumScale) {
    return "width=device-width, initial-scale=1" + (lockedMaximumScale ? ", maximum-scale=1" : "") + ", viewport-fit=cover, interactive-widget=resizes-content";
  }
  function installPhoneChrome() {
    if (typeof document === "undefined") return NOOP4;
    const meta = document.querySelector('meta[name="viewport"]');
    const prev = meta === null ? null : meta.getAttribute("content");
    if (meta !== null) {
      const locked = /(^|,)\s*maximum-scale\s*=/.test(prev === null ? "" : prev);
      meta.setAttribute("content", composeViewportContent(locked));
    }
    return () => {
      if (meta !== null && prev !== null) meta.setAttribute("content", prev);
    };
  }

  // src/client/effects/keyboard.ts
  var KEYBOARD_MIN = 80;
  var FRAME_MIN = 120;
  function installKeyboardInset() {
    const vv = typeof window === "undefined" ? null : window.visualViewport;
    if (vv === null || vv === void 0) return () => {
    };
    const root = document.documentElement;
    let raf = 0;
    let alive = true;
    const setFrame = (px) => {
      if (px === null) root.style.removeProperty("--dsh-xc-frame-h");
      else root.style.setProperty("--dsh-xc-frame-h", Math.max(FRAME_MIN, Math.round(px)) + "px");
    };
    const apply = () => {
      if (!alive) return;
      try {
        const visibleBottom = vv.offsetTop + vv.height;
        const keyboard = Math.round(window.innerHeight - visibleBottom);
        if (keyboard >= KEYBOARD_MIN) {
          setFrame(visibleBottom);
          if (root.dataset.xcKb !== "1") root.dataset.xcKb = "1";
          if (window.scrollY !== 0) window.scrollTo(0, 0);
        } else {
          setFrame(null);
          if (root.dataset.xcKb !== void 0) delete root.dataset.xcKb;
          if (window.scrollY !== 0) window.scrollTo(0, 0);
        }
      } catch {
      }
    };
    const schedule = () => {
      if (raf !== 0 || !alive) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };
    const afterBlur = () => {
      if (!alive) return;
      const a = setTimeout(apply, 250);
      const b = setTimeout(apply, 650);
      timers.push(a, b);
    };
    const timers = [];
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
    document.addEventListener("focusout", afterBlur, true);
    window.addEventListener("orientationchange", afterBlur);
    apply();
    return () => {
      alive = false;
      if (raf !== 0) cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      document.removeEventListener("focusout", afterBlur, true);
      window.removeEventListener("orientationchange", afterBlur);
      root.style.removeProperty("--dsh-xc-frame-h");
      delete root.dataset.xcKb;
    };
  }

  // src/client/effects/recover.ts
  function installRecoverEffect() {
    if (typeof window === "undefined") return () => {
    };
    let pill = null;
    let hideTimer = null;
    const getOrCreatePill = () => {
      if (pill !== null && pill.isConnected) return pill;
      pill = document.createElement("div");
      pill.className = "dsh-mw-recover-pill";
      pill.onclick = () => {
        window.location.reload();
      };
      document.body.appendChild(pill);
      return pill;
    };
    const removePill = () => {
      if (pill !== null) {
        pill.remove();
        pill = null;
      }
      if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };
    const showOffline = () => {
      if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      const el = getOrCreatePill();
      el.dataset.state = "offline";
      el.innerHTML = "<span>\u26A0\uFE0F</span> <span>\u7F51\u7EDC\u5DF2\u65AD\u5F00 \xB7 \u70B9\u51FB\u91CD\u8FDE</span>";
      el.style.opacity = "1";
    };
    const showOnline = () => {
      if (pill === null) return;
      pill.dataset.state = "online";
      pill.innerHTML = "<span>\u2705</span> <span>\u7F51\u7EDC\u5DF2\u6062\u590D</span>";
      pill.style.opacity = "1";
      hideTimer = window.setTimeout(() => {
        if (pill !== null) {
          pill.style.opacity = "0";
          hideTimer = window.setTimeout(() => {
            removePill();
          }, 300);
        }
      }, 1500);
    };
    const onOffline = () => {
      showOffline();
    };
    const onOnline = () => {
      showOnline();
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showOffline();
    }
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      removePill();
    };
  }

  // src/client/index.ts
  var factory = (require2) => {
    const module = { exports: {} };
    const exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const react = require2("react");
    const disablePwa = () => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("dsh-mobile-web-pro.pwa", "off");
        localStorage.setItem("dsh-mobile-xc.pwa", "off");
      }
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        void navigator.serviceWorker.getRegistrations().then((regs) => {
          for (const reg of regs) void reg.unregister();
        });
      }
    };
    const enablePwa = () => {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("dsh-mobile-web-pro.pwa");
        localStorage.removeItem("dsh-mobile-xc.pwa");
      }
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        });
      }
    };
    function apply(ctx) {
      ctx.effect(() => {
        if (typeof localStorage !== "undefined" && (localStorage.getItem("dsh-mobile-web-pro.pwa") === "off" || localStorage.getItem("dsh-mobile-xc.pwa") === "off")) {
          disablePwa();
        }
        return () => {
        };
      }, "dsh-mobile-web-pro: pwa flag");
      ctx.effect(() => {
        try {
          const anyCtx = ctx;
          const face = anyCtx.configForms ?? (typeof anyCtx.get === "function" ? anyCtx.get("configForms") : void 0);
          if (face === void 0 || typeof face.get !== "function") return () => {
          };
          const scope = face.get("dsh-mobile-web-pro") ?? face.get("dsh-mobile-xc");
          if (scope === void 0 || scope === null) return () => {
          };
          const readOnce = () => {
            try {
              return typeof scope.getSnapshot === "function" ? resolveSettingsValue(scope.getSnapshot()) : void 0;
            } catch {
              return void 0;
            }
          };
          const seeded = readOnce();
          if (seeded !== void 0 && seeded !== null) {
            try {
              setConfig(seeded);
            } catch {
            }
          }
          if (typeof scope.subscribe === "function") {
            const off = scope.subscribe(() => {
              const next = readOnce();
              if (next !== void 0 && next !== null) {
                try {
                  setConfig(next);
                } catch {
                }
              }
            });
            return () => {
              try {
                off();
              } catch {
              }
            };
          }
          return () => {
          };
        } catch {
          return () => {
          };
        }
      }, "dsh-mobile-web-pro: settings namespace");
      ctx.effect(
        () => onConfigChange((cfg) => {
          try {
            if (cfg.pwaEnabled) enablePwa();
            else disablePwa();
          } catch {
          }
        }),
        "dsh-mobile-web-pro: pwa config reaction"
      );
      ctx.effect(() => {
        const tag = document.createElement("style");
        tag.dataset.plugin = "dsh-mobile-web-pro";
        tag.textContent = MOBILE_CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, "dsh-mobile-web-pro: styles");
      ctx.effect(() => {
        const run = () => {
          const report = formatCanaryReport(checkStructuralAnchors(document), checkHashedSelectors(document));
          if (report !== null) console.warn("[dsh-mobile-web-pro] " + report);
        };
        const raf = requestAnimationFrame(() => requestAnimationFrame(run));
        return () => {
          cancelAnimationFrame(raf);
        };
      }, "dsh-mobile-web-pro: canary");
      const core = createReconcilerCore({
        requestFrame: (flush) => {
          let id = 0;
          const run = () => {
            id = 0;
            flush();
          };
          id = requestAnimationFrame(run);
          return () => {
            if (id !== 0) cancelAnimationFrame(id);
          };
        }
      });
      const toggleSidebar = makeSidebarToggle(ctx);
      registerDrawerTasks(core, toggleSidebar);
      registerComposerTasks(core);
      registerCompatTasks(core);
      ctx.effect(
        () => onConfigChange(() => {
          try {
            core.note(["*"]);
          } catch {
          }
        }),
        "dsh-mobile-web-pro: reconciler config reaction"
      );
      installMobileEffect(ctx, "dsh-mobile-web-pro: reconciler", () => {
        const observer = new MutationObserver((records) => {
          const keys = /* @__PURE__ */ new Set();
          for (const record of records) {
            keys.add(
              record.type === "attributes" && record.attributeName !== null ? record.attributeName : "*"
            );
          }
          core.note(keys);
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class", "data-sidebar-collapsed", "data-details-collapsed", "data-rightbar-collapsed", "data-rightbar-fullscreen"]
        });
        core.activate();
        return () => {
          observer.disconnect();
          core.deactivate();
        };
      });
      installOverlayInteractions(ctx, toggleSidebar);
      installRailPreviewTap(ctx);
      installMobileGesture(ctx, toggleSidebar);
      installMobileEffect(ctx, "dsh-mobile-web-pro: phone chrome", () => installPhoneChrome());
      installMobileEffect(ctx, "dsh-mobile-web-pro: focus guard", () => installFocusGuard());
      installMobileEffect(ctx, "dsh-mobile-web-pro: composer auto-collapse", () => installComposerAutoCollapse());
      installMobileEffect(ctx, "dsh-mobile-web-pro: keyboard inset", () => installKeyboardInset());
      installMobileEffect(ctx, "dsh-mobile-web-pro: file reader guard", () => installFileReaderGuard());
      installMobileEffect(ctx, "dsh-mobile-web-pro: recover banner", () => installRecoverEffect());
      ctx.effect(
        () => installDebugBadge(() => {
          const structural = checkStructuralAnchors(document);
          const hashed = checkHashedSelectors(document);
          const narrow = window.matchMedia(MOBILE_QUERY).matches;
          const frameShape = structural.frameShape;
          return "view=" + window.innerWidth + "px mq=" + (narrow ? "narrow" : "wide") + " shell=" + (structural.shellOverlay ? "ok" : "MISS") + " rightbar=" + (structural.rightbarContract ? "ok" : "MISS") + " frame=" + (frameShape && structural.shellOverlay ? "ok" : "MISS") + " composer=" + (structural.composerSlot ? "ok" : "MISS") + " hash=" + hashed.hits + "/" + hashed.declared;
        }),
        "dsh-mobile-web-pro: debug badge"
      );
      try {
        installXcPluginCard(ctx, react);
      } catch {
      }
    }
    let applied = false;
    function safeApply(ctx) {
      if (applied) return;
      applied = true;
      apply(ctx);
    }
    exports.apply = safeApply;
    exports.disablePwa = disablePwa;
    exports.inject = ["slots", "locale", "configForms"];
    return module.exports;
  };
  if (typeof window !== "undefined" && window.__ModuleLoader__?.load) {
    try {
      window.__ModuleLoader__.load({ id: "dsh-mobile-web-pro", factory });
    } catch {
    }
  }
})();
