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

	var VERSION = '1.0.0';

	/** The mobile gate, kept in sync with the stylesheet by hand. */
	var MOBILE_QUERY = '(max-width: 860px), ((max-height: 500px) and (pointer: coarse))';

	/** A first grid track wider than this means the app expanded the sidebar. */
	var EXPANDED_TRACK_MIN = 100;

	var root = document.documentElement;
	var cssText = window.__DSH_MW_CSS__ || '';

	/* ---------------------------------------------------------------- *
	 * CSS injection                                                     *
	 * ---------------------------------------------------------------- *
	 * Load-bearing ordering: this runs BEFORE the idempotence guard below,
	 * and is re-runnable at any time.
	 *
	 * The app's client-module loader claims every untagged `<style>` right
	 * after a factory materialises and deletes the claimed tags on each hot
	 * reload of that plugin — then re-runs the factory
	 * (`@deepseek-ai/dsh-client-modules/lib/client.js`):
	 *
	 *     const claimStyles = (id) => {
	 *       for (const el of document.querySelectorAll("style:not([data-plugin])"))
	 *         el.setAttribute("data-plugin", id);
	 *     };
	 *     function removeOwnedStyles(id) {
	 *       for (const el of document.querySelectorAll("style[data-plugin]"))
	 *         if (el.getAttribute("data-plugin") === id) el.remove();
	 *     }
	 *
	 * With the guard first, a hot reload removed this stylesheet and the
	 * re-run returned at the guard, so the CSS never came back while the
	 * injected bar stayed in the DOM: the stock desktop layout plus four
	 * unstyled buttons at the end of <body> — reported from a real phone as
	 * "每天第一次进浏览器看都是这样", cured only by a manual refresh.
	 * So: inject first, guard second, and keep the tag alive afterwards. */
	var styleEl = null;
	var styleWanted = true;
	var headObserver = null;
	var cssLen = cssText.length;

	/** (Re)attach and refill the stylesheet. Safe to call at any time.
	 *
	 * The first branch is the hot path: this runs on every head mutation and on
	 * every sync(), so the intact case costs two boolean reads and a number
	 * compare — never a 43KB string comparison. */
	function ensureStyle() {
		if (!styleWanted) return;
		if (styleEl && styleEl.isConnected && styleEl.textContent.length === cssLen) return;
		/* A bundle that ran while `window.__DSH_MW_CSS__` was still empty can
		   still heal itself: re-read the global instead of caching the miss. */
		if (!cssText) {
			cssText = window.__DSH_MW_CSS__ || '';
			cssLen = cssText.length;
		}
		var found;
		if (!styleEl || !styleEl.isConnected) {
			found = document.getElementById('dsh-mobile-web-style');
			styleEl = found || document.createElement('style');
			styleEl.id = 'dsh-mobile-web-style';
			/* `data-plugin` is the loader's own attribution attribute: setting it
			   ourselves keeps the tag ours instead of letting whichever plugin
			   materialises next claim it (and then delete it on its own reload). */
			styleEl.setAttribute('data-plugin', 'dsh-mobile-web');
			styleEl.setAttribute('data-dsh-plugin', 'dsh-mobile-web');
		}
		if (!styleEl.isConnected) (document.head || root).appendChild(styleEl);
		if (cssText && styleEl.textContent !== cssText) styleEl.textContent = cssText;
	}

	ensureStyle();

	/** Put the stylesheet back if anything detaches or empties it. */
	function watchStyle() {
		if (headObserver || typeof window.MutationObserver !== 'function') return;
		headObserver = new MutationObserver(function () {
			ensureStyle();
		});
		var head = document.head || root;
		headObserver.observe(head, {childList: true, subtree: true, characterData: true});
	}

	// Idempotent: a hot reload or a second bundle instance must not double-bind.
	if (window.dshMobileWeb && window.dshMobileWeb.__installed) return;

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
		for (let i = 0; i < roots.length; i++) {
			for (let j = 0; j < list.length; j++) {
				const el = roots[i].querySelector(list[j]);
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
			let meta = document.querySelector('meta[name="theme-color"]');
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
		} catch {
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
		/* The loader may have deleted the stylesheet since the last sync. */
		ensureStyle();
		if (!isMobileViewport()) {
			// Leaving the gate: hand the layout back to the app untouched.
			root.classList.remove('dsh-mw-drawer', 'dsh-mw-right');
			drawerOpen = false;
			return;
		}

		ensureScrim();
		ensureTopbar();
		syncSurface();
		// A viewport can cross the gate (rotation, window resize), so arming the
		// watchdog here — not only at start() — keeps it alive. Idempotent.
		startRecover();
		startAutoload();
		syncHeadBlank();
		markSmallTargets();

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
		} catch { /* history may be unavailable in exotic embeds */ }
	}

	function onDrawerClosed() {
		drawerOpen = false;
		if (pushedHistory) {
			pushedHistory = false;
			try { history.back(); } catch { /* ignore */ }
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
			const diffPanel = document.querySelector('[data-diff-approval-panel]');
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
		} catch {
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
			} catch {
				dragSrc = null;
				return;
			}
			fireDrag('dragstart', row, pressAt.x, pressAt.y);
			root.classList.add('dsh-mw-dragging');
			if (navigator.vibrate) {
				try { navigator.vibrate(15); } catch { /* ignore */ }
			}
		}, PRESS_MS);
	}

	function onTouchMove(e) {
		if (!dragSrc) {
			// A finger that moves before the timer fires is scrolling, not a
			// long press.  25 px is generous enough for natural finger tremor
			// on a touch screen while still distinguishing intent from scroll.
			if (pressTimer && pressAt) {
				const t0 = e.touches[0];
				if (Math.abs(t0.clientX - pressAt.x) > 25 ||
					Math.abs(t0.clientY - pressAt.y) > 25) {
					clearTimeout(pressTimer);
					pressTimer = null;
					const pressing = document.querySelector('.dsh-mw-pressing');
					if (pressing) pressing.classList.remove('dsh-mw-pressing');
				}
			}
			// Swipe-to-open / swipe-to-close. One flip per gesture: the state is
			// cleared as soon as it fires.
			if (swipe) {
				const intent = swipeIntent(e.touches[0]);
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
			let syncRaf = false;
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
		ensureStyle();
		watchStyle();
		syncViewportMeta();

		bind();

		if (window.MutationObserver && !domObserver) {
			let findRaf = false;
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
			let surfRaf = false;
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
			let kbRaf = false;
			const scheduleKb = function () {
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

		startRecover();
		startAutoload();
		sync();
	}

	/* ---------------------------------------------------------------- *
	 * Recovery — a stuck page has to be able to un-stick itself.        *
	 *                                                                   *
	 * The app reconnects its socket with backoff but NEVER reloads the   *
	 * document, so a page holding a stale bundle or a dead connection    *
	 * stays stuck until the user force-refreshes by hand. The document   *
	 * is `cache-control: no-store`, ~39KB, and carries                   *
	 * `window.__DSH_BOOT__.rev` — the revision of the plugin set the     *
	 * server is serving right now. So one cheap, uncached fetch of our   *
	 * own document answers both questions: "can I still reach the        *
	 * server?" and "is this build still the current one?".               *
	 * ---------------------------------------------------------------- */
	var RECOVER_MS = 60000;          // probe cadence
	var RECOVER_IDLE_MS = 20000;     // no input for this long counts as idle
	var RECOVER_WINDOW_MS = 300000;  // auto-reload budget window
	var RECOVER_MAX = 2;             // …and at most this many reloads in it
	var recoverTimer = null;
	var recoverEl = null;
	var recoverKind = '';
	var recoverProbing = false;
	var lastInputAt = Date.now();

	function bootRev() {
		try {
			return (window.__DSH_BOOT__ && window.__DSH_BOOT__.rev) || '';
		} catch (e) {
			return '';
		}
	}

	/** Never reload on top of text the user has typed but not sent. */
	function composerHasText() {
		var el = document.querySelector('textarea, [contenteditable="true"]');
		if (!el) return false;
		var v = el.value != null ? el.value : el.textContent;
		return String(v || '').trim().length > 0;
	}

	function recoverIdle() {
		return document.visibilityState === 'visible' &&
			(Date.now() - lastInputAt) > RECOVER_IDLE_MS &&
			!composerHasText();
	}

	/**
	 * Reloads are budgeted across the reload itself (sessionStorage survives
	 * it): if the edge keeps serving the old build, the page shows the bar
	 * instead of looping forever. Without sessionStorage it never auto-reloads.
	 */
	function reloadBudgetLeft() {
		var rec;
		try {
			rec = JSON.parse(sessionStorage.getItem('dsh-mw-reload') || 'null');
			if (!rec || typeof rec.n !== 'number' || (Date.now() - rec.t) > RECOVER_WINDOW_MS) {
				return RECOVER_MAX;
			}
			return RECOVER_MAX - rec.n;
		} catch (e) {
			return 0;
		}
	}

	function noteReload() {
		var rec, fresh;
		try {
			rec = JSON.parse(sessionStorage.getItem('dsh-mw-reload') || 'null');
			fresh = rec && (Date.now() - rec.t) <= RECOVER_WINDOW_MS;
			sessionStorage.setItem('dsh-mw-reload', JSON.stringify({
				t: Date.now(),
				n: fresh ? rec.n + 1 : 1,
			}));
		} catch (e) { /* private mode: bar only, never auto-reload */ }
	}

	function showRecover(kind) {
		var label, go;
		if (!isMobileViewport()) return;
		if (recoverKind === kind && recoverEl && recoverEl.isConnected) return;
		recoverKind = kind;
		if (!recoverEl) {
			recoverEl = document.createElement('div');
			recoverEl.className = 'dsh-mw-recover';
			recoverEl.setAttribute('role', 'status');
			label = document.createElement('span');
			label.className = 'dsh-mw-recover__text';
			go = document.createElement('button');
			go.type = 'button';
			go.className = 'dsh-mw-recover__go';
			go.textContent = '重新加载';
			// Idempotent: tapping again just asks the browser again.
			go.addEventListener('click', function () { location.reload(); });
			recoverEl.appendChild(label);
			recoverEl.appendChild(go);
		}
		recoverEl.querySelector('.dsh-mw-recover__text').textContent =
			kind === 'offline' ? '连接已断开' : '有新版本可用';
		(document.body || root).appendChild(recoverEl);
	}

	function hideRecover() {
		recoverKind = '';
		if (recoverEl && recoverEl.parentNode) recoverEl.parentNode.removeChild(recoverEl);
	}

	function probeRecover() {
		if (!isMobileViewport() || recoverProbing) return;
		recoverProbing = true;
		var done = function (err, rev) {
			recoverProbing = false;
			if (err) {
				// Unreachable: offer the reload, but never perform it — a reload
				// with no network would just replace the page with an error.
				showRecover('offline');
				return;
			}
			var mine = bootRev();
			if (!rev || !mine) { hideRecover(); return; }   // cannot tell → say nothing
			if (rev === mine) { hideRecover(); return; }
			if (recoverIdle() && reloadBudgetLeft() > 0) {
				noteReload();
				location.reload();
				return;
			}
			showRecover('update');
		};
		try {
			fetch(location.href, { cache: 'no-store', credentials: 'same-origin' })
				.then(function (r) {
					if (!r.ok) throw new Error('http ' + r.status);
					return r.text();
				})
				.then(function (html) {
					var m = /"rev"\s*:\s*"([A-Za-z0-9]+)"/.exec(html);
					done(null, m ? m[1] : '');
				})
				.catch(function () { done(new Error('probe failed')); });
		} catch (e) {
			recoverProbing = false;
			hideRecover();
		}
	}

	function startRecover() {
		if (recoverTimer || !isMobileViewport()) return;
		lastInputAt = Date.now();
		var markInput = function () { lastInputAt = Date.now(); };
		['pointerdown', 'keydown', 'touchstart', 'input'].forEach(function (t) {
			document.addEventListener(t, markInput, { passive: true, capture: true });
		});
		document.addEventListener('visibilitychange', function () {
			if (document.visibilityState === 'visible') probeRecover();
		});
		window.addEventListener('online', probeRecover);
		window.addEventListener('offline', function () { showRecover('offline'); });
		recoverTimer = setInterval(probeRecover, RECOVER_MS);
	}

	function stopRecover() {
		if (recoverTimer) { clearInterval(recoverTimer); recoverTimer = null; }
		hideRecover();
	}

	/* ---------------------------------------------------------------- *
	 * Auto-load older messages.                                         *
	 *                                                                   *
	 * The app renders its own 「加载更早」control at the top of the message *
	 * list (`<hash>_older > button`) and anchors the reader's place when *
	 * it prepends a batch. On touch the list simply stops at the top and *
	 * the control is never pressed — measured: eight real swipes to the  *
	 * top left scrollHeight at 1014px, unchanged. So all this has to do  *
	 * is press the app's own control when the reader reaches the top; it *
	 * never fetches anything itself.                                    *
	 * ---------------------------------------------------------------- */
	var AUTOLOAD_PX = 320;             // start the next batch before the edge
	var AUTOLOAD_IDLE_MS = 260;        // ...but only once the finger has settled
	var AUTOLOAD_SETTLE_MS = 1800;     // poll period while waiting for a batch
	var AUTOLOAD_WAIT_TRIES = 75;      // ...up to ~30s for a very long conversation
	var AUTOLOAD_SOFT_BACKOFF_MS = 3000; // short pause after a press that shows nothing
	var AUTOLOAD_BACKOFF_MS = 12000;   // nothing grew → leave the control alone
	var AUTOLOAD_USER_MS = 2500;       // only while the reader is really scrolling
	var autoArmed = false;
	var autoBusy = false;
	var autoBackoff = null;            // WeakMap: scroller → retry-not-before
	var autoLastBackoffUntil = 0;
	var autoLastUserAt = 0;
	var autoLoads = 0;
	var autoGrew = false;
	var autoSettleTimer = null;
	var autoIdleTimer = null;
	var autoWatch = null;
	var autoBusyTimer = null;

	function autoBackoffLeft(el) {
		if (!autoBackoff) return 0;
		return Math.max(0, (autoBackoff.get(el) || 0) - Date.now());
	}

	function autoBackoffSet(el, until) {
		if (!autoBackoff) {
			if (typeof WeakMap !== 'function') return;
			autoBackoff = new WeakMap();
		}
		autoBackoff.set(el, until);
		autoLastBackoffUntil = until;
	}

	function autoLoadNow(el) {
		if (!isMobileViewport() || autoBusy) return;
		if (el.scrollTop > AUTOLOAD_PX) return;
		if (autoBackoffLeft(el) > 0) return;
		// A scroll the app performed itself (anchoring a batch, restoring a
		// position) must not pull in more history — only a real gesture may.
		// That is also what stops an idle page at the top from draining the
		// whole session in the background.
		if ((Date.now() - autoLastUserAt) > AUTOLOAD_USER_MS) return;
		var btn = el.querySelector('[class*="_older"] button');
		if (!btn) return;                 // no earlier history → do nothing
		autoBusy = true;
		autoLoads++;
		var before = el.scrollHeight;
		var topBefore = el.scrollTop;
		btn.click();
		// Two clocks on purpose. The press guard is short, so a reader who keeps
		// swiping is never blocked for long; the watch below is patient, because
		// a batch on a very long conversation can take seconds to render and the
		// anchoring fix must still run when it finally lands.
		if (autoBusyTimer) clearTimeout(autoBusyTimer);
		autoBusyTimer = setTimeout(function () {
			autoBusy = false;
			if (el.scrollHeight <= before) {
				autoBackoffSet(el, Date.now() + AUTOLOAD_SOFT_BACKOFF_MS);
			}
		}, AUTOLOAD_SETTLE_MS);
		// Watch for the batch instead of assuming how long it takes: on a long
		// conversation the prepend was measured blocking the main thread for
		// ~20s, and a fixed 1.8s timeout called that a failure while the content
		// was still coming — then the batch landed un-anchored and the text under
		// the reader's finger jumped. Once it does arrive, put the reader back
		// where they were if the app did not.
		if (autoWatch) { clearInterval(autoWatch); autoWatch = null; }
		var tries = 0;
		autoWatch = setInterval(function () {
			var grew, drift;
			tries++;
			grew = el.scrollHeight - before;
			if (!el.isConnected) {
				clearInterval(autoWatch); autoWatch = null; autoBusy = false; return;
			}
			if (grew > 0) {
				clearInterval(autoWatch); autoWatch = null;
				autoBusy = false;
				autoGrew = true;
				autoBackoffSet(el, 0);          // the batch arrived after all
				drift = el.scrollTop - topBefore;
				if (grew > 8 && drift < grew / 2) el.scrollTop = topBefore + grew;
			} else if (tries > AUTOLOAD_WAIT_TRIES) {
				clearInterval(autoWatch); autoWatch = null;
				autoBusy = false;
				autoGrew = false;
				autoBackoffSet(el, Date.now() + AUTOLOAD_BACKOFF_MS);
			}
		}, 400);
	}

	function autoLoadOnScroll(e) {
		if (!isMobileViewport()) return;
		var el = e.target;
		if (!el || typeof el.scrollTop !== 'number') return;
		if (el.scrollHeight <= el.clientHeight + 40) return;   // not a scroller
		if (el.closest && el.closest('[class*="_overlay"]')) return;
		if (el.scrollTop > AUTOLOAD_PX) return;
		// Wait for the gesture to settle first. Prepending a batch is expensive
		// (a measured one blocked the main thread for ~20s and inserted 4400px),
		// and doing that under a moving finger is what read as the list
		// "jittering". Loading while the finger is still keeps the anchor
		// meaningful and the motion smooth.
		if (autoIdleTimer) clearTimeout(autoIdleTimer);
		autoIdleTimer = setTimeout(function () { autoLoadNow(el); }, AUTOLOAD_IDLE_MS);
	}
	/* The product's own header row is an empty strip above the transcript. The
	   CSS collapses it only while this class marks it blank; a header with
	   content keeps its place. */
	function syncHeadBlank() {
		var blank = !!document.querySelector('[class*="_headerBlank"]');
		document.documentElement.classList.toggle('dsh-mw-headblank', blank);
	}

	/* Controls the app renders at 22-28px get a 44px thumb area. The CSS can
	   cover the composer's own row; this covers whatever else other plugins drop
	   into the composer area, and opens a clipping (non-scrolling) row when that
	   is what hides the area. A real scroller is never touched. */
	var markAt = 0;
	function markSmallTargets(force) {
		// Called from sync(), which runs once per animation frame while the app
		// streams. Measuring every button that often is a forced layout per
		// frame on a phone, so it runs at most twice a second.
		var now = Date.now();
		if (!force && now - markAt < 500) return;
		markAt = now;
		var els = document.querySelectorAll(
			'[class*="_composerSeat"] button, [data-slot^="conversation.input."] button, ' +
			'[data-slot="conversation.composer"] button, [class*="_composerStack"] button');
		var el, r, n, hops, oy, i;
		for (i = 0; i < els.length; i++) {
			el = els[i];
			r = el.getBoundingClientRect();
			if (r.height < 1) continue;
			if (r.height >= 44) { el.classList.remove('dsh-mw-tap'); continue; }
			el.classList.add('dsh-mw-tap');
			n = el.parentElement;
			hops = 0;
			while (n && n !== document.body && hops++ < 4) {
				oy = getComputedStyle(n).overflowY;
				if (oy === 'hidden' || oy === 'clip') { n.classList.add('dsh-mw-taprow'); break; }
				if (oy === 'auto' || oy === 'scroll') break;   // never un-clip a scroller
				n = n.parentElement;
			}
		}
	}

	function startAutoload() {
		if (autoArmed || !isMobileViewport()) return;
		autoArmed = true;
		var markUser = function () { autoLastUserAt = Date.now(); };
		['touchstart', 'touchmove', 'wheel'].forEach(function (t) {
			document.addEventListener(t, markUser, { passive: true, capture: true });
		});
		// Scroll events do not bubble, but they can be captured on the
		// document, so nothing has to be re-bound when the SPA swaps the list.
		document.addEventListener('scroll', autoLoadOnScroll, { capture: true, passive: true });
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
		/* Recovery, exposed so the suite can drive it without waiting 60s. */
		probeRecover: probeRecover,
		recoverState: function () {
			return {
				running: !!recoverTimer,
				shown: recoverKind,
				bootRev: bootRev(),
				lastInputAgo: Date.now() - lastInputAt,
				budgetLeft: reloadBudgetLeft(),
			};
		},
		/* The bar never hides itself: `tucked` stays false, and the suite
		   asserts exactly that. An earlier revision tucked it away while
		   reading, which took the ☰ (and so the sidebar) off the screen —
		   reported from a real phone. 44px is not worth losing navigation. */
		barState: function () {
			return {tucked: false, armed: false,
				headBlank: document.documentElement.classList.contains('dsh-mw-headblank')};
		},
		/* Auto-load, exposed so the suite can assert the throttle honestly. */
		autoLoadState: function () {
			return {
				armed: autoArmed,
				loads: autoLoads,
				grew: autoGrew,
				busy: autoBusy,
				backoffMs: Math.max(0, autoLastBackoffUntil - Date.now()),
				lastUserAgo: autoLastUserAt ? Date.now() - autoLastUserAt : null,
			};
		},
		disable: function () {
			stopRecover();
			styleWanted = false;
			if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
			if (topbar && topbar.parentNode) topbar.parentNode.removeChild(topbar);
			root.classList.remove('dsh-mw-on', 'dsh-mw-drawer', 'dsh-mw-right');
		},
		enable: function () {
			styleWanted = true;
			ensureStyle();
			root.classList.add('dsh-mw-on');
			startRecover();
			sync();
		},
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();
