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
