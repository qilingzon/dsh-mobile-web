#!/usr/bin/env python3
"""
dsh-mobile-web — end-to-end suite.

Two halves, and the second one is the important one:

  MOBILE   the adaptation actually works: full-width content, an overlay
           drawer that does not squeeze the content column, safe composer,
           44px navigation targets, a stacked settings panel.

  DESKTOP  the adaptation is *absent*. Layout metrics are compared against
           `before-metrics.json`, captured from the live console BEFORE this
           plugin was installed. Any drift there is a conflict, which is the
           one thing this plugin promises not to do.

Usage:
  python3 test/e2e.py --url "http://127.0.0.1:3080/?token=..." \
                      [--baseline before-metrics.json] [--json report.json]
Exit code 0 only when every check passes.
"""
import argparse
import json
import re
import sys
from playwright.sync_api import sync_playwright

# ---------------------------------------------------------------- viewports
# (width, height, expect_mobile)
MOBILE_VPS = [
    (320, 568, "iPhone SE"),
    (360, 740, "Android small"),
    (390, 844, "iPhone 14"),
    (414, 896, "iPhone 11"),
    (430, 932, "iPhone 14 Pro Max"),
    (768, 1024, "iPad portrait"),
    (820, 1180, "iPad Air portrait"),
]
LANDSCAPE_VPS = [
    (844, 390, "iPhone 14 landscape"),
    (932, 430, "iPhone 14 Pro Max landscape"),
]
DESKTOP_VPS = [
    (900, 900, "small desktop"),
    (1024, 768, "desktop"),
    (1280, 800, "desktop wide"),
    (1440, 900, "desktop XL"),
]

MOBILE_GATE_PX = 860
RAIL_PX = 56

# ------------------------------------------------------------------ results
class Report:
    def __init__(self):
        self.rows = []

    def check(self, group, name, ok, detail=""):
        self.rows.append({"group": group, "name": name, "ok": bool(ok), "detail": detail})
        mark = "PASS" if ok else "FAIL"
        line = f"  [{mark}] {name}"
        if detail and not ok:
            line += f"\n         -> {detail}"
        print(line)
        return ok

    @property
    def failures(self):
        return [r for r in self.rows if not r["ok"]]


PROBE = r"""
() => {
  const q = (s) => document.querySelector(s);
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; };
  const frame  = q('[class*="_frame"]');
  const side   = q('[class*="_sidebarCol"]');
  const center = q('[class*="_centerCol"]');
  const right  = q('[class*="_rightbarCol"]');
  const scrim  = q('.dsh-mw-scrim');
  const api    = window.dshMobileWeb;
  const field  = q('textarea, [contenteditable="true"], [class*="_input"]');
  const nav    = q('[class*="_overlay"] > [class*="_panel"] > [class*="_nav"]');
  const content= q('[class*="_overlay"] > [class*="_panel"] > [class*="_content"]');
  const cs = (el, p) => el ? getComputedStyle(el)[p] : null;

  // Smallest tap target inside the sidebar navigation.
  let minTap = null;
  if (side) {
    const vals = [];
    for (const el of side.querySelectorAll('button, a, [role="button"]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      vals.push(Math.round(r.height));
    }
    if (vals.length) minTap = Math.min(...vals);
  }

  const topbar = q('.dsh-mw-topbar');
  let topbarBtns = [];
  if (topbar) {
    for (const b of topbar.querySelectorAll('button')) {
      const r = b.getBoundingClientRect();
      topbarBtns.push({label: b.getAttribute('aria-label') || '',
                       w: Math.round(r.width), h: Math.round(r.height)});
    }
  }

  return {
    vw: innerWidth, vh: innerHeight,
    scrollW: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    frameInline: frame ? (frame.getAttribute('style') || '') : null,
    frameCols: cs(frame, 'gridTemplateColumns'),
    side: box(side), sidePos: cs(side, 'position'), sideDisplay: cs(side, 'display'),
    sideVisibility: cs(side, 'visibility'),
    sideW: side ? Math.round(side.getBoundingClientRect().width) : null,
    center: box(center), right: box(right),
    topbar: box(topbar), topbarBtns: topbarBtns,
    topbarDisplay: cs(topbar, 'display'),
    viewportMeta: (q('meta[name="viewport"]') || {}).content || null,
    composerSeat: box(q('[class*="_composerSeat"]') || q('[class*="_composerStack"]')),
    scrim: box(scrim), scrimOpacity: cs(scrim, 'opacity'), scrimPointer: cs(scrim, 'pointerEvents'),
    fieldFont: cs(field, 'fontSize'),
    minTap: minTap,
    nav: box(nav), content: box(content),
    plugin: api ? { installed: !!api.__installed, version: api.version,
                    mobile: api.isMobileViewport(), state: api.state() } : null,
    styleTag: !!document.getElementById('dsh-mobile-web-style'),
  };
}
"""


def open_page(browser, url, w, h, mobile):
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                              is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page()
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(4500)
    return ctx, pg


def click_if(pg, selector):
    el = pg.query_selector(selector)
    if not el:
        return False
    try:
        el.click(timeout=4000)
    except Exception:
        return False
    pg.wait_for_timeout(1200)
    return True


def run_mobile(browser, url, rep):
    print("\n=== MOBILE: adaptation present and correct ===")
    for w, h, label in MOBILE_VPS + LANDSCAPE_VPS:
        ctx, pg = open_page(browser, url, w, h, True)
        d = pg.evaluate(PROBE)
        g = f"mobile {w}x{h} {label}"

        rep.check(g, "plugin loaded", d["plugin"] and d["plugin"]["installed"],
                  f"plugin={d['plugin']}")
        rep.check(g, "plugin reports mobile viewport", d["plugin"] and d["plugin"]["mobile"],
                  f"mobile={d['plugin']['mobile'] if d['plugin'] else None} (gate <= {MOBILE_GATE_PX}px)")
        rep.check(g, "style tag injected", d["styleTag"])
        rep.check(g, "no horizontal overflow", not d["overflowX"],
                  f"scrollW={d['scrollW']} vw={d['vw']}")

        # --- closed: no left rail, content is full width ---------------
        rep.check(g, "left rail is gone (hidden, zero width)",
                  d["sideW"] is not None and d["sideW"] <= 2 and d["sideVisibility"] == "hidden",
                  f"sidebarCol w={d['sideW']} visibility={d['sideVisibility']} "
                  f"(stock reserves {RAIL_PX}px here)")
        expect_center = w
        rep.check(g, "content column takes the FULL viewport width",
                  d["center"] and abs(d["center"]["w"] - expect_center) <= 6,
                  f"centerCol={d['center']['w'] if d['center'] else None} expected~{expect_center}")

        # --- the top bar that replaced the rail ------------------------
        rep.check(g, "top bar is rendered",
                  d["topbar"] is not None and d["topbar"]["h"] > 0
                  and d["topbarDisplay"] == "flex",
                  f"topbar={d['topbar']} display={d['topbarDisplay']}")
        if d["topbar"]:
            rep.check(g, "top bar spans the full width",
                      abs(d["topbar"]["w"] - w) <= 2,
                      f"topbar w={d['topbar']['w']} viewport={w}")
            rep.check(g, "top bar sits above the content (no overlap)",
                      d["center"] and (d["topbar"]["y"] + d["topbar"]["h"]) <= d["center"]["y"] + 2,
                      f"topbar bottom={d['topbar']['y'] + d['topbar']['h']} "
                      f"center y={d['center']['y'] if d['center'] else None}")
        labels = [b["label"] for b in d["topbarBtns"]]
        for want in ("Open navigation", "New session", "Search sessions", "Settings"):
            rep.check(g, f"top bar has '{want}'", want in labels, f"found={labels}")
        small = [b for b in d["topbarBtns"] if b["h"] < 44 or b["w"] < 44]
        rep.check(g, "top bar buttons are >=44px", not small, f"too small={small}")

        # --- open: overlay drawer, content NOT squeezed ----------------
        opened = click_if(pg, '.dsh-mw-topbar__menu')
        if opened:
            o = pg.evaluate(PROBE)
            rep.check(g, "drawer becomes an overlay (position:fixed)",
                      o["sidePos"] == "fixed", f"position={o['sidePos']}")
            rep.check(g, "drawer fits the screen (<=88vw)",
                      o["sideW"] is not None and o["sideW"] <= int(w * 0.88) + 2,
                      f"drawer={o['sideW']} limit={int(w*0.88)}")
            rep.check(g, "content width UNCHANGED while drawer is open",
                      o["center"] and abs(o["center"]["w"] - expect_center) <= 6,
                      f"centerCol={o['center']['w'] if o['center'] else None} expected~{expect_center} "
                      f"(stock console squeezes this to {w-280}px)")
            rep.check(g, "scrim visible and interactive while open",
                      o["scrim"] is not None and float(o["scrimOpacity"] or 0) > 0.5
                      and o["scrimPointer"] == "auto",
                      f"opacity={o['scrimOpacity']} pointerEvents={o['scrimPointer']}")
            rep.check(g, "state flag reflects the drawer",
                      o["plugin"] and o["plugin"]["state"]["drawer"],
                      f"state={o['plugin']['state'] if o['plugin'] else None}")
            rep.check(g, "drawer navigation tap targets >=44px",
                      o["minTap"] is not None and o["minTap"] >= 44,
                      f"smallest={o['minTap']}px")
            # close again by tapping the scrim. The drawer is up to 88vw wide,
            # so the scrim is only the strip to the RIGHT of it — clicking the
            # screen centre would land inside the drawer.
            try:
                drawer_w = o["sideW"] or 0
                tap_x = min(w - 6, int(drawer_w + (w - drawer_w) / 2))
                pg.mouse.click(tap_x, h // 2)
                pg.wait_for_timeout(1000)
                c = pg.evaluate(PROBE)
                rep.check(g, "scrim tap closes the drawer",
                          c["plugin"] and not c["plugin"]["state"]["drawer"],
                          f"tapped x={tap_x} (drawer={drawer_w}) state={c['plugin']['state'] if c['plugin'] else None}")
            except Exception as e:
                rep.check(g, "scrim tap closes the drawer", False, str(e)[:120])
        else:
            rep.check(g, "sidebar toggle reachable", False, "no [aria-label=\"Open sidebar\"]")

        # --- ergonomics -------------------------------------------------
        rep.check(g, "composer field >=16px (no iOS focus zoom)",
                  d["fieldFont"] is not None and float(d["fieldFont"].replace("px", "")) >= 16,
                  f"fontSize={d['fieldFont']}")
        rep.check(g, "viewport meta asks the browser to resize content for the keyboard",
                  d["viewportMeta"] and "interactive-widget=resizes-content" in d["viewportMeta"],
                  f"meta={d['viewportMeta']}")
        # Regression lock for the on-device bug: the composer must NOT grow when
        # the keyboard-height variable is set. The earlier revision did
        # `padding-bottom: calc(safe + var(--dsh-mw-kb))`, which inflated the
        # seat from 275px to 875px and pushed the composer into mid-screen.
        #
        # The variable is now unused by the stylesheet, so the only correct
        # reading is "no effect". A single before/after sample is not enough:
        # the app itself reflows the seat while a transcript settles (measured:
        # 270 -> 146 between two samples with no variable change at all), which
        # is a false failure. Sample the baseline on BOTH sides of the variable
        # and require the kb sample not to exceed the larger baseline by more
        # than a rounding allowance. The original bug added ~600px, so it is
        # still caught unambiguously.
        def seat_h():
            return (pg.evaluate(PROBE)["composerSeat"] or {}).get("h")

        pg.evaluate("document.documentElement.style.setProperty('--dsh-mw-kb','0px')")
        pg.wait_for_timeout(300)
        zero_a = seat_h()
        pg.evaluate("document.documentElement.style.setProperty('--dsh-mw-kb','300px')")
        pg.wait_for_timeout(400)
        kb = seat_h()
        pg.evaluate("document.documentElement.style.setProperty('--dsh-mw-kb','0px')")
        pg.wait_for_timeout(300)
        zero_b = seat_h()
        rep.check(g, "composer does not inflate when --dsh-mw-kb is set",
                  zero_a is not None and kb is not None and zero_b is not None
                  and kb <= max(zero_a, zero_b) + 8,
                  f"composerSeat h zero={zero_a}/{zero_b} kb300={kb} "
                  f"(the bug inflated this by ~600px)")
        # Tap targets are measured with the drawer OPEN: the rail is gone, so
        # the meaningful navigation surface is the drawer, not a hidden column.

        # --- settings panel stacked ------------------------------------
        # Make sure the drawer is out of the way first, or the Settings button
        # we want lives behind it.
        try:
            pg.evaluate("window.dshMobileWeb && window.dshMobileWeb.closeDrawer()")
            pg.wait_for_timeout(700)
        except Exception:
            pass
        if click_if(pg, '.dsh-mw-topbar__settings'):
            # The panel mounts asynchronously (the top bar forwards the click),
            # so poll until it has real geometry rather than asserting against a
            # zero-sized mid-mount node.
            s, nav, con = None, None, None
            for _ in range(20):
                s = pg.evaluate(PROBE)
                nav, con = s["nav"], s["content"]
                if nav and con and nav["w"] > 0 and con["w"] > 0:
                    break
                pg.wait_for_timeout(250)
            if nav and con and nav["w"] > 0:
                # "Stacked" means: both columns span the viewport AND the
                # content sits BELOW the nav. When stacked they are equal in
                # width, so comparing widths to each other would be wrong.
                both_full = nav["w"] >= w - 8 and con["w"] >= w - 8
                below = con["y"] >= nav["y"] + nav["h"] - 4
                rep.check(g, "settings: nav and content stacked, content full width",
                          both_full and below,
                          f"nav={nav['w']}x{nav['h']}@{nav['y']} content={con['w']}x{con['h']}@{con['y']} "
                          f"viewport={w} bothFull={both_full} contentBelowNav={below}")
            else:
                rep.check(g, "settings: nav/content found", False, f"nav={nav} content={con}")
        else:
            rep.check(g, "settings button reachable", False, "no [aria-label=\"Settings\"]")
        ctx.close()


def run_row_menus(browser, url, rep, destructive=False):
    """
    The per-row action menu must be reachable from a TOUCH device.

    This is the regression lock for the on-device report "功能缺了一下，比如归档".
    Two independent defects made archive unreachable on a phone, and a desktop
    test run can see neither because a mouse reproduces the hover for free:

      1. the app reveals `_rowActions` only on `:hover`, and the menu trigger
         lives *inside* the container it reveals, so on a touch screen it can
         never be tapped into existence;
      2. this plugin's own drawer-dismiss guard matched the English word
         "actions" only, so tapping the trigger (once reachable) closed the
         drawer — the menu was dismissed before it could be seen.

    Run in zh-CN on purpose: that is the locale where the label is
    会话"x"的操作 and an English-only guard silently fails.
    """
    print("\n=== ROW MENUS: per-row actions reachable on TOUCH (zh-CN) ===")
    g = "rowmenu"
    ctx = browser.new_context(viewport={"width": 390, "height": 844},
                              is_mobile=True, has_touch=True, locale="zh-CN")
    pg = ctx.new_page()
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(3000)
    pg.evaluate("window.dshMobileWeb && window.dshMobileWeb.openDrawer()")
    pg.wait_for_timeout(800)

    TITLES = """() => [...document.querySelectorAll('[class*="sessionRow"]')].map(r => {
        const t = r.querySelector('[class*="title"]'); return t ? t.textContent.trim() : '';
      })"""
    MENU = """() => [...document.querySelectorAll('[role="menuitem"]')]
        .map(e => (e.textContent || '').trim()).filter(Boolean)"""

    # --- 1. the trigger is actually rendered -------------------------------
    state = pg.evaluate("""() => {
      const ra = document.querySelector('[class*="sessionRow"] [class*="_rowActions"]');
      const row = document.querySelector('[class*="sessionRow"]');
      if (!ra || !row) return null;
      const b = ra.getBoundingClientRect();
      return {disp: getComputedStyle(ra).display, w: Math.round(b.width), h: Math.round(b.height),
              rowH: Math.round(row.getBoundingClientRect().height)};
    }""")
    rep.check(g, "session row action trigger is rendered on touch",
              bool(state) and state["disp"] != "none" and state["w"] > 0 and state["h"] > 0,
              f"{state}")
    if not state:
        ctx.close()
        return
    rep.check(g, "session row is >=44px tall (touch minimum)",
              state["rowH"] >= 44, f"rowH={state['rowH']}")

    # --- 2. tap it for real ------------------------------------------------
    titles_before = pg.evaluate(TITLES)
    # Identify the row by the TRIGGER'S OWN aria-label, not by list index.
    # The label is 会话“<name>”的操作 / Session "<name>" actions, so it names the
    # exact row the button belongs to. Using titles_before[0] instead produced a
    # false failure: the app re-sorts by "last updated", so the row at index 0
    # was not the row whose button got tapped.
    trig = pg.evaluate("""() => {
      const b = document.querySelector('[class*="sessionRow"] [class*="_rowActions"] button');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return {label: b.getAttribute('aria-label') || '',
              x: r.x + r.width / 2, y: r.y + r.height / 2};
    }""")
    m = re.search(r'[\u201c"](.*?)[\u201d"]', trig["label"]) if trig else None
    target = m.group(1) if m else None
    rep.check(g, "row trigger names its own session (identity for the archive check)",
              target is not None, f"aria-label={trig['label']!r}" if trig else "no trigger")
    try:
        pg.touchscreen.tap(trig["x"], trig["y"])
        tapped = True
    except Exception as e:
        tapped = False
        rep.check(g, "tap the row action trigger", False, str(e)[:160])
    if tapped:
        pg.wait_for_timeout(800)
        # THE bug: the drawer used to slam shut here, so the menu was never seen.
        still_open = pg.evaluate(
            "() => document.documentElement.classList.contains('dsh-mw-drawer')")
        rep.check(g, "tapping the row menu does NOT dismiss the drawer", still_open,
                  "drawer closed -> menu unreachable (the zh-CN guard bug)")
        items = pg.evaluate(MENU)
        rep.check(g, "menu offers rename / fork / ARCHIVE",
                  "归档会话" in items and "分叉会话" in items and "重命名" in items,
                  f"items={items}")
        # closeOnPointerLeave must not eat the menu on a touch device.
        pg.wait_for_timeout(1500)
        rep.check(g, "menu survives a touch pointer (closeOnPointerLeave)",
                  "归档会话" in pg.evaluate(MENU), "menu vanished after ~1.5s")

        # --- 3. the archive action actually archives -----------------------
        # DESTRUCTIVE: it really archives one of the user's sessions, so it is
        # opt-in via --destructive. Reachability (above) is the regression that
        # actually broke; this step is the end-to-end proof that the item is
        # wired to the app's own handler and not merely rendered.
        if destructive:
            pg.evaluate("""() => {
              const el = [...document.querySelectorAll('[role="menuitem"]')]
                .find(e => (e.textContent || '').trim() === '归档会话');
              if (el) el.click();
            }""")
            pg.wait_for_timeout(2500)
            titles_after = pg.evaluate(TITLES)
            # Sessions can share a title (measured: two sessions literally named
            # 你好), so `target not in after` is not a valid identity test — it
            # reported a false failure while the archive had in fact worked.
            # Compare occurrences instead: exactly one fewer of that title.
            was = titles_before.count(target)
            now = titles_after.count(target)
            rep.check(g, "归档会话 actually archives the targeted session",
                      target is not None and now == was - 1,
                      f"target={target!r} count {was} -> {now}\n"
                      f"            before={titles_before}\n            after ={titles_after}")
        else:
            print("  [SKIP] 归档会话 execution (destructive; pass --destructive to run)")

    # --- 4. the workspace row menu is reachable too ------------------------
    ws = pg.evaluate("""() => {
      const ra = document.querySelector('[class*="projectRow"] [class*="_rowActions"]');
      if (!ra) return null;
      const b = ra.getBoundingClientRect();
      return {disp: getComputedStyle(ra).display, w: Math.round(b.width)};
    }""")
    rep.check(g, "workspace row action trigger is rendered on touch",
              bool(ws) and ws["disp"] != "none" and ws["w"] > 0, f"{ws}")
    ctx.close()


def run_touch_reorder(browser, url, rep, destructive=False):
    """
    Manual reordering must be *possible* from a touch screen.

    The app reorders rows with HTML5 drag-and-drop only (`draggable` +
    onDragStart/onDragOver/onDrop, and measured: zero touch/pointer handlers on
    that path). No browser starts an HTML5 drag from a touch point, so the
    plugin re-dispatches the app's own drag events after a long press.

    Safe by default: it long-presses, proves the app's drag pipeline is live
    (the plugin's `dsh-mw-dragging` state), then releases WITHOUT moving — the
    app's `end()` sees `over === null` and commits nothing, so the list order is
    untouched. Pass --destructive to also perform a real move.
    """
    print("\n=== TOUCH REORDER: manual sort is drivable from a touch screen ===")
    g = "reorder"
    ctx = browser.new_context(viewport={"width": 390, "height": 844},
                              is_mobile=True, has_touch=True, locale="zh-CN")
    pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg)
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(3000)
    pg.evaluate("window.dshMobileWeb && window.dshMobileWeb.openDrawer()")
    pg.wait_for_timeout(900)

    TITLES = """() => [...document.querySelectorAll('[class*="sessionRow"]')].map(r => {
        const t = r.querySelector('[class*="title"]'); return t ? t.textContent.trim() : '';
      })"""

    # The tree is live user data: workspaces can be collapsed, and a workspace
    # with few sessions is legitimately short. Expand every collapsed folder and
    # reveal every virtualised tail first, so the reorder assertions do not
    # depend on which workspace happened to be open — measured: a run where a
    # collapsed 工作区 left only 2 draggable rows and failed a test that had
    # nothing to do with reordering.
    pg.evaluate("""() => {
      for (const r of document.querySelectorAll('[class*="_projectRow"][aria-expanded="false"]')) r.click();
    }""")
    pg.wait_for_timeout(900)
    for _ in range(4):
        clicked = pg.evaluate("""() => {
          const b = document.querySelector('[class*="_sessionOverflowButton"]');
          if (!b) return false;
          b.click();
          return true;
        }""")
        if not clicked:
            break
        pg.wait_for_timeout(900)

    rows = pg.evaluate("""() => {
      // Collect rows grouped by their workspace folder, and return the LARGEST
      // single group. Dragging must stay inside one workspace: a cross-workspace
      // drop is not the app's reorder path and would not paint its drop marker.
      const nodes = [...document.querySelectorAll(
        '[class*="_sidebarCol"] [class*="_projectRow"], [class*="_sidebarCol"] [class*="sessionRow"][draggable="true"]')];
      const groups = [];
      let cur = null;
      for (const el of nodes) {
        if ((el.className || '').toString().includes('_projectRow')) { cur = []; groups.push(cur); }
        else { if (!cur) { cur = []; groups.push(cur); } cur.push(el); }
      }
      groups.sort((a, b) => b.length - a.length);
      return (groups[0] || []).map(r => { const b = r.getBoundingClientRect();
        return {y: Math.round(b.y + b.height / 2), x: Math.round(b.x + b.width * 0.35)}; });
    }""")
    rep.check(g, "sidebar rows are draggable (app reorder path present)",
              len(rows) >= 3, f"{len(rows)} draggable rows")
    if len(rows) < 3:
        ctx.close()
        return

    def touch(kind, x, y):
        cdp.send("Input.dispatchTouchEvent", {
            "type": kind,
            "touchPoints": [] if kind == "touchEnd" else
                           [{"x": x, "y": y, "radiusX": 8, "radiusY": 8, "force": 1}],
        })

    order_before = pg.evaluate(TITLES)
    src, dst = rows[0], rows[2]

    touch("touchStart", src["x"], src["y"])
    pg.wait_for_timeout(500)          # > the 350ms long press
    engaged = pg.evaluate(
        "() => document.documentElement.classList.contains('dsh-mw-dragging')")
    rep.check(g, "long press starts a drag (shim engages the app's dragstart)", engaged,
              "dsh-mw-dragging not set")

    if engaged:
        # Moving must drive the APP's own dragover, which paints its marker.
        for i in range(1, 5):
            touch("touchMove", src["x"], src["y"] + (dst["y"] - src["y"]) * i / 4)
            pg.wait_for_timeout(80)
        marker = pg.evaluate("""() => document.querySelectorAll(
            '[class*="dropBefore"],[class*="dropAfter"]').length""")
        rep.check(g, "dragging paints the app's own drop marker", marker > 0,
                  "no dropBefore/dropAfter appeared -> app drag pipeline not driven")
        # ...then back to where we started, so the release is a self-drop.
        for i in range(4, -1, -1):
            touch("touchMove", src["x"], src["y"] + (dst["y"] - src["y"]) * i / 4)
            pg.wait_for_timeout(80)

    if destructive and engaged:
        touch("touchEnd", src["x"], dst["y"])
        pg.wait_for_timeout(1500)
        order_after = pg.evaluate(TITLES)
        rep.check(g, "releasing commits the reorder", order_after != order_before,
                  f"before={order_before} after={order_after}")
    else:
        # Released back over the source row. The app's own commit is a no-op
        # when the anchor is the dragged row (`anchor === sessionId -> return`),
        # so the default run leaves the list order untouched.
        touch("touchEnd", src["x"], src["y"])
        pg.wait_for_timeout(1200)
        order_after = pg.evaluate(TITLES)
        rep.check(g, "drag out and back leaves the order untouched (self-drop is a no-op)",
                  order_after == order_before,
                  f"before={order_before} after={order_after}")

    rep.check(g, "drag state is cleared after release",
              not pg.evaluate(
                  "() => document.documentElement.classList.contains('dsh-mw-dragging')"))
    ctx.close()


def run_file_panel(browser, url, rep):
    """
    Opening a file must not trap the user in the preview panel.

    The app presents a file preview as a fullscreen right panel and puts its own
    close control (收起右侧边栏) in the top-right corner — the exact spot the
    injected top bar's settings button occupies. Measured before the fix:
    `elementFromPoint` at the close button returned `BUTTON.dsh-mw-topbar__settings`,
    so the bar swallowed the tap and 打开文件之后就回不去对话了.

    Two presentation modes exist and they are different code paths:
      narrow -> the app goes fullscreen (`data-rightbar-fullscreen`, handled by
                `html.dsh-mw-rightfull`, which hides the bar)
      tablet -> the app opens a real grid track (`html.dsh-mw-right`)
    Both are exercised: a fix for one does not cover the other.

    The assertion is deliberately a HIT TEST, not a geometry check: the control
    was fully visible, correctly sized and present in the DOM the whole time —
    only the stacking order was wrong, which geometry cannot see.
    """
    print("\n=== FILE PANEL: opening a file is not a one-way trip ===")
    for w, h, name in ((390, 844, "phone/fullscreen"), (820, 1180, "tablet/track")):
        _file_panel_at(browser, url, rep, w, h, name)


def _file_panel_at(browser, url, rep, w, h, name):
    g = "filepanel"
    ctx = browser.new_context(viewport={"width": w, "height": h},
                              is_mobile=True, has_touch=True, locale="zh-CN")
    pg = ctx.new_page()
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(3000)

    # 打开右侧边栏 only exists in the conversation view, and only once a session
    # with real content is open — so try the sessions in turn rather than
    # assuming the first one works.
    opened = False
    for idx in range(6):
        pg.evaluate("window.dshMobileWeb && window.dshMobileWeb.openDrawer()")
        pg.wait_for_timeout(550)
        clicked = pg.evaluate("""(i) => {
          const rs = [...document.querySelectorAll('[class*="sessionRow"]')];
          if (!rs[i]) return false;
          rs[i].click();
          return true;
        }""", idx)
        if not clicked:
            break
        pg.wait_for_timeout(3200)
        pg.evaluate("window.dshMobileWeb && window.dshMobileWeb.closeDrawer()")
        pg.wait_for_timeout(550)
        opened = pg.evaluate("""() => {
          const b = document.querySelector('[aria-label="打开右侧边栏"]');
          if (!b) return false;
          b.click();
          return true;
        }""")
        if opened:
            break
    rep.check(g, f"[{name}] conversation offers 打开右侧边栏", opened,
              'no [aria-label="打开右侧边栏"]')
    if not opened:
        ctx.close()
        return
    pg.wait_for_timeout(1800)

    st = pg.evaluate("""() => {
      const close = document.querySelector('[aria-label="收起右侧边栏"]');
      const bar = document.querySelector('.dsh-mw-topbar');
      if (!close) return {err: 'no close control'};
      const r = close.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const barCs = bar ? getComputedStyle(bar) : null;
      return {
        fullscreen: document.querySelector('[class*="_frame"]')
                      ?.getAttribute('data-rightbar-fullscreen'),
        rightfull: document.documentElement.classList.contains('dsh-mw-rightfull'),
        closeW: Math.round(r.width), closeH: Math.round(r.height),
        inViewport: r.x >= 0 && r.x + r.width <= window.innerWidth,
        reachable: !!(hit && (hit === close || close.contains(hit))),
        hitCls: hit ? hit.tagName + '.' + (hit.className || '').toString().slice(0, 44) : null,
        barHidden: barCs ? (barCs.visibility === 'hidden') : null,
      };
    }""")
    if st.get("fullscreen") is not None:
        rep.check(g, f"[{name}] fullscreen mode hides the injected bar",
                  st.get("rightfull") and st.get("barHidden") is True, f"{st}")
    rep.check(g, f"[{name}] close control is inside the viewport",
              st.get("inViewport") is True,
              f"close={st.get('closeW')}x{st.get('closeH')}")
    # THE regression: the app's own close control must win the hit test.
    rep.check(g, f"[{name}] close control wins the hit test (a way back exists)",
              st.get("reachable") is True,
              f"elementFromPoint -> {st.get('hitCls')} (the top bar swallowed the tap)")

    # ...and a real touch must actually get back to the conversation.
    try:
        pg.tap('[aria-label="收起右侧边栏"]', timeout=6000)
        tapped = True
    except Exception as e:
        tapped = False
        rep.check(g, f"[{name}] tap 收起右侧边栏", False, str(e)[:160])
    if tapped:
        pg.wait_for_timeout(1500)
        after = pg.evaluate("""() => ({
          rightfull: document.documentElement.classList.contains('dsh-mw-rightfull'),
          barVisible: (() => { const b = document.querySelector('.dsh-mw-topbar');
            return b ? getComputedStyle(b).visibility !== 'hidden' : null; })(),
        })""")
        rep.check(g, f"[{name}] tapping it returns to the conversation",
                  not after["rightfull"] and after["barVisible"] is True,
                  f"after tap: {after}")
    ctx.close()


def run_touch_extras(browser, url, rep):
    """
    Gestures and hit areas the plugin has to provide on a touch screen.

    Swipe: the app ships both gestures natively (an edge right-swipe opens the
    sidebar, a left-swipe on it closes it) — but the rail-free layout pins the
    sidebar's width/visibility with `!important`, which overrides the inline
    geometry the app's drag writes, so under the plugin BOTH gestures silently
    stop working. The plugin reimplements them as threshold gestures. This group
    locks that they work, and that a horizontal pan in the content does not
    toggle the drawer.

    Hit areas: the app's conversation/composer controls are 28px (send 34px).
    A transparent ::after grows the hit area to 36-38 x 44 without touching
    layout. Asserted as hit tests just outside the visual box, because the
    point of the change is that the target is bigger than it looks.
    """
    print("\n=== TOUCH: swipes and expanded hit areas ===")
    g = "touch"
    ctx = browser.new_context(viewport={"width": 390, "height": 844},
                              is_mobile=True, has_touch=True, locale="zh-CN")
    pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg)
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(3500)

    def touch(kind, x, y):
        cdp.send("Input.dispatchTouchEvent", {
            "type": kind,
            "touchPoints": [] if kind == "touchEnd" else
                           [{"x": x, "y": y, "radiusX": 8, "radiusY": 8, "force": 1}],
        })

    def swipe(points, steps=6):
        touch("touchStart", *points[0])
        for a, c in zip(points, points[1:]):
            for i in range(1, steps + 1):
                touch("touchMove", a[0] + (c[0] - a[0]) * i / steps,
                      a[1] + (c[1] - a[1]) * i / steps)
                pg.wait_for_timeout(20)
        touch("touchEnd", *points[-1])
        pg.wait_for_timeout(900)

    drawer = lambda: pg.evaluate(
        "() => document.documentElement.classList.contains('dsh-mw-drawer')")

    # --- swipe to open from the left edge ---
    rep.check(g, "drawer starts closed", drawer() is False)
    swipe([(8, 420), (60, 420), (130, 420)])
    rep.check(g, "edge right-swipe opens the drawer", drawer() is True,
              "the plugin's !important width overrides the app's native drag")

    # --- swipe to close ---
    swipe([(220, 420), (140, 420), (70, 420)])
    rep.check(g, "left-swipe on the drawer closes it", drawer() is False)

    # --- a horizontal pan inside content must not toggle the drawer ---
    pg.wait_for_timeout(700)
    swipe([(200, 420), (150, 420), (100, 420)])
    rep.check(g, "a horizontal pan in the content does not toggle the drawer",
              drawer() is False)

    # --- expanded hit areas (probe just outside the 28px/34px visual box) ---
    # Open a session with real content first.
    for i in range(3):
        pg.evaluate("window.dshMobileWeb.openDrawer()")
        pg.wait_for_timeout(450)
        pg.evaluate("""(i) => { const rs = [...document.querySelectorAll('[class*="sessionRow"]')];
          if (rs[i]) rs[i].click(); }""", i)
        pg.wait_for_timeout(2400)
        pg.evaluate("window.dshMobileWeb.closeDrawer()")
        pg.wait_for_timeout(400)

    hits = pg.evaluate("""() => {
      const probe = (sel) => {
        let fallback = null;
        for (const e of document.querySelectorAll(sel)) {
          const r = e.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Skip controls scrolled out of the viewport: their rect exists but
          // every probe point is outside the document.
          if (r.y + r.height < 60 || r.y > window.innerHeight) continue;
          const cs = getComputedStyle(e, '::after');
          const self = (x, y) => { const h = document.elementFromPoint(x, y);
            return !!(h && (h === e || e.contains(h))); };
          // Probe 3px outside the visual box — inside the overlay's inset
          // (-4px horizontally / -5px vertically at the tightest), so a hit
          // proves the target really grew. Any direction counts: the message
          // above or below a row can legitimately paint over one of them.
          const up = (r.y - 3 >= 52) ? self(r.x + r.width / 2, r.y - 3) : null;
          const down = (r.y + r.height + 3 <= window.innerHeight)
                         ? self(r.x + r.width / 2, r.y + r.height + 3) : null;
          const leftHit = (r.x - 3 >= 0) ? self(r.x - 3, r.y + r.height / 2) : null;
          const rightHit = (r.x + r.width + 3 <= window.innerWidth)
                         ? self(r.x + r.width + 3, r.y + r.height / 2) : null;
          const rec = {w: Math.round(r.width), h: Math.round(r.height),
                  content: cs.content, top: cs.top, bottom: cs.bottom,
                  left: cs.left, right: cs.right,
                  anyHit: up === true || down === true || leftHit === true || rightHit === true,
                  up, down, leftHit, rightHit};
          if (rec.anyHit) return rec;      // prefer a control that proves the growth
          if (!fallback) fallback = rec;
        }
        return fallback;
      };
      return {action: probe('[class*="_actions"] > [class*="_action"]'),
              more: probe('[class*="_moreButton"]'),
              rightbar: probe('[class*="_headerCorner"] button'),
              attach: probe('[class*="_composerSeat"] [class*="_add"]'),
              send: probe('[class*="_composerSeat"] [class*="_primary"]')};
    }""")
    for name, key in (("message action", "action"), ("更多操作", "more"),
                      ("打开右侧边栏", "rightbar"), ("添加附件", "attach")):
        h = hits.get(key)
        rep.check(g, f"{name} has a generated hit-area overlay",
                  bool(h) and h["content"] not in (None, "none", ""),
                  f"::after content={h['content'] if h else None} insets={h}")
        rep.check(g, f"{name} hit area extends beyond its {h['w'] if h else '?'}px box",
                  bool(h) and h["anyHit"] is True,
                  f"probe at 3px outside: {h}")
    s = hits.get("send")
    rep.check(g, "send button hit area extends sideways",
              bool(s) and (s["leftHit"] is True or s["rightHit"] is True),
              f"probe at 3px outside: {s}")

    # --- workspace chevron affordance ---
    pg.evaluate("window.dshMobileWeb.openDrawer()")
    pg.wait_for_timeout(900)
    ch = pg.evaluate("""() => {
      const c = document.querySelector('[class*="_projectRow"] [class*="_chevron"]');
      if (!c) return null;
      const cs = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      return {disp: cs.display, w: Math.round(r.width)};
    }""")
    rep.check(g, "workspace row shows its expand chevron on touch (hover-only in the app)",
              bool(ch) and ch["disp"] != "none" and ch["w"] > 0, f"{ch}")
    pg.evaluate("window.dshMobileWeb.closeDrawer()")
    pg.wait_for_timeout(500)

    # --- browser chrome follows the app's theme ---
    meta = pg.evaluate("""() => {
      const m = document.querySelector('meta[name="theme-color"]');
      const surface = getComputedStyle(document.documentElement)
        .getPropertyValue('--dsh-mw-surface').trim();
      return m ? {content: m.getAttribute('content'), surface} : null;
    }""")
    rep.check(g, "theme-color meta matches the app surface",
              bool(meta) and meta["content"] == meta["surface"] and meta["content"] != "",
              f"{meta}")
    ctx.close()


def run_question_card(browser, url, rep):
    """
    The ask_user_question card must not inherit the shell's frame geometry.

    `_frame` and `_card` are generic suffixes: the card's own frame
    (`<hash>_frame`) matched the plugin's shell rules, so a live question card
    measured at 390x844 received the shell's 52px top-bar padding and a forced
    `height: 100dvh`, and the component's `calc(clearance + 16px)` side padding
    left only 296px of the 390px screen for the text. The stock 60vh cap then
    left ~270px for the options, so option 3 and the descriptions sat below an
    inner scroll — reported on-device as "看不到全文".

    The card only mounts while a question is pending, so this group injects a
    synthetic frame/card with the component's real class names and asserts the
    computed geometry. That is deterministic and asks the user nothing.
    """
    print("\n=== QUESTION CARD: shell geometry must not leak onto it ===")
    g = "qcard"
    ctx = browser.new_context(viewport={"width": 390, "height": 844},
                              is_mobile=True, has_touch=True, locale="zh-CN")
    pg = ctx.new_page()
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(3500)
    d = pg.evaluate("""() => {
      const shell = document.querySelector('[class*="_frame"]:has([class*="_sidebarCol"])');
      const scs = getComputedStyle(shell);
      const frame = document.createElement('div'); frame.className = 'Mbwy4a_frame';
      const card = document.createElement('div'); card.className = 'Mbwy4a_card';
      const body = document.createElement('div'); body.className = 'Mbwy4a_body';
      body.innerHTML = '<div class="Mbwy4a_options"><button class="Mbwy4a_option">' +
                       '<span class="Mbwy4a_optionLabel">x</span></button></div>';
      card.appendChild(body); frame.appendChild(card); document.body.appendChild(frame);
      const fcs = getComputedStyle(frame); const ccs = getComputedStyle(card);
      const out = {shellH: Math.round(shell.getBoundingClientRect().height),
                   shellPad: scs.paddingTop,
                   frameH: Math.round(frame.getBoundingClientRect().height),
                   framePad: fcs.padding,
                   cardMaxH: ccs.maxHeight,
                   cardW: Math.round(card.getBoundingClientRect().width),
                   shellIsCard: shell.matches('[class*="_frame"]:not(:has([class*="_sidebarCol"]))'),
                   overflow: document.documentElement.scrollWidth > innerWidth + 1};
      frame.remove();
      return out;
    }""")
    rep.check(g, "the app shell frame keeps its rail-free geometry",
              d["shellH"] >= 800 and d["shellPad"].startswith("52"), f"{d}")
    rep.check(g, "the shell frame is NOT treated as a question-card frame",
              d["shellIsCard"] is False, f"{d}")
    rep.check(g, "a question-card frame gets natural height, not 100dvh",
              d["frameH"] < 200, f"{d}")
    rep.check(g, "a question-card frame loses the 52px top-bar padding",
              d["framePad"].startswith("6px 8px"), f"{d}")
    rep.check(g, "the card is widened for the phone (was 296px of 390px)",
              d["cardW"] >= 360, f"{d}")
    try:
        max_h = float(str(d["cardMaxH"]).replace("px", ""))
    except ValueError:
        max_h = 0
    rep.check(g, "the card may use most of the viewport height (was 60vh)",
              max_h > 600, f"{d}")
    rep.check(g, "injecting the card causes no horizontal overflow",
              d["overflow"] is False, f"{d}")
    ctx.close()


def run_workspaces(browser, url, rep):
    """
    Workspaces are FOLDERS in the drawer tree, and the header's controls must be
    reachable on a touch device.

    Two on-device bugs are locked here:

      1. 打不开文件夹 — tapping a workspace row dismissed the drawer. The app
         toggles the row's `aria-expanded` (it is a tree folder, exactly like on
         desktop), but this plugin's drawer-dismiss guard treated a workspace
         row like a session selection and closed the drawer, so the folder could
         never be opened. Only a SESSION selection may dismiss now.

      2. 不能新开工作区 — 添加工作区 (new workspace) was unreachable. Section 8
         grows every drawer icon button to the 44px touch minimum, but the app
         sizes this header for 28px buttons: `_headerActions` was capped at
         60px with `overflow: hidden`, so the third control was clipped to a
         ~12px sliver and the list root covered its centre (`elementFromPoint`
         at the button centre returned `DIV.bhn1Oq_root`). The header is
         re-flowed for 44px controls, so the button is inside the drawer and
         wins its own hit test.

    Both assertions are HIT TESTS or state checks, not geometry: the button was
    visible-but-covered, and the folder row worked on desktop all along.
    """
    print("\n=== WORKSPACES: folders open, and new-workspace is reachable ===")
    g = "workspaces"
    ctx = browser.new_context(viewport={"width": 390, "height": 844},
                              is_mobile=True, has_touch=True, locale="zh-CN")
    pg = ctx.new_page()
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(3500)
    pg.evaluate("window.dshMobileWeb.openDrawer()")
    pg.wait_for_timeout(900)

    # --- 1. the add-workspace control is inside the drawer and hittable ---
    aw = pg.evaluate("""() => {
      const e = document.querySelector('[aria-label="添加工作区"]');
      if (!e) return null;
      const r = e.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const drawer = document.querySelector('[class*="_sidebarCol"]').getBoundingClientRect();
      return {x: r.x, y: r.y, w: r.width, h: r.height,
              insideDrawer: r.x >= drawer.x && r.x + r.width <= drawer.right + 1,
              hitIsSelf: !!(hit && (hit === e || e.contains(hit))),
              hit: hit ? hit.tagName + '.' + (hit.className || '').toString().slice(0, 40) : null};
    }""")
    rep.check(g, "添加工作区 is rendered in the drawer", bool(aw), f"{aw}")
    if aw:
        rep.check(g, "添加工作区 sits fully inside the drawer",
                  aw["insideDrawer"], f"box={aw['x']:.0f}..{aw['x']+aw['w']:.0f} {aw}")
        rep.check(g, "添加工作区 wins its own hit test (the list root used to cover it)",
                  aw["hitIsSelf"], f"elementFromPoint -> {aw['hit']}")
        # ...and a real touch actually opens the directory dialog.
        pg.touchscreen.tap(aw["x"] + aw["w"] / 2, aw["y"] + aw["h"] / 2)
        dlg = None
        for _ in range(16):
            dlg = pg.evaluate("""() => {
              const vis = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
                return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
              const d = [...document.querySelectorAll('[class*="_dialog"], [role="dialog"]')].filter(vis)[0];
              if (!d) return null;
              const r = d.getBoundingClientRect();
              return {txt: (d.textContent || '').trim().slice(0, 40),
                      x: Math.round(r.x), w: Math.round(r.width),
                      inView: r.x >= 0 && r.x + r.width <= window.innerWidth + 1};
            }""")
            if dlg:
                break
            pg.wait_for_timeout(250)
        rep.check(g, "tapping it opens the 选择工作区目录 dialog",
                  bool(dlg) and "选择工作区目录" in (dlg or {}).get("txt", ""),
                  f"dialog={dlg}")
        if dlg:
            rep.check(g, "the directory dialog fits the phone viewport",
                      dlg["inView"], f"{dlg}")
            # Non-destructive: cancel instead of choosing a directory.
            pg.evaluate("""() => {
              const b = [...document.querySelectorAll('button')].find(
                e => (e.textContent || '').trim() === '取消');
              if (b) b.click();
            }""")
            pg.wait_for_timeout(700)

    # --- 2. a workspace row is a folder: tap toggles, drawer stays open ---
    # Make sure the tree is grouped by workspace (按工作区), or there is no row.
    if not pg.query_selector('[class*="_projectRow"]'):
        pg.evaluate("""() => document.querySelector('[aria-label="视图选项"]').click()""")
        pg.wait_for_timeout(700)
        pg.evaluate("""() => {
          const el = [...document.querySelectorAll('[role="menuitem"], button, div')]
            .find(e => (e.textContent || '').trim() === '按工作区');
          if (el) el.click();
        }""")
        pg.wait_for_timeout(1200)

    row = pg.evaluate("""() => {
      const e = document.querySelector('[class*="_projectRow"]');
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return {x: r.x + r.width * 0.35, y: r.y + r.height / 2,
              expanded: e.getAttribute('aria-expanded')};
    }""")
    rep.check(g, "a workspace (folder) row exists in the drawer", bool(row), f"{row}")
    if row:
        pg.touchscreen.tap(row["x"], row["y"])
        pg.wait_for_timeout(1100)
        after = pg.evaluate("""() => {
          const e = document.querySelector('[class*="_projectRow"]');
          return {expanded: e ? e.getAttribute('aria-expanded') : null,
                  drawer: document.documentElement.classList.contains('dsh-mw-drawer')};
        }""")
        rep.check(g, "tapping the folder toggles it (aria-expanded flips)",
                  after["expanded"] != row["expanded"],
                  f"expanded {row['expanded']} -> {after['expanded']}")
        rep.check(g, "tapping the folder does NOT dismiss the drawer",
                  after["drawer"] is True,
                  "drawer closed -> the folder can never be opened (the 打不开文件夹 bug)")
        # put it back the way we found it
        pg.touchscreen.tap(row["x"], row["y"])
        pg.wait_for_timeout(900)

    # --- 3. selecting a session still dismisses the drawer ---
    sess = pg.evaluate("""() => {
      const e = document.querySelector('[class*="_sessionRow"]');
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return {x: r.x + r.width * 0.4, y: r.y + r.height / 2};
    }""")
    if sess:
        pg.touchscreen.tap(sess["x"], sess["y"])
        pg.wait_for_timeout(1400)
        rep.check(g, "selecting a session still dismisses the drawer",
                  pg.evaluate(
                      "() => !document.documentElement.classList.contains('dsh-mw-drawer')"),
                  "session tap left the drawer open")
    ctx.close()


def run_desktop(browser, url, rep, baseline_path):
    print("\n=== DESKTOP: adaptation absent (the no-conflict guarantee) ===")
    try:
        with open(baseline_path) as f:
            baseline = json.load(f)
    except Exception as e:
        rep.check("desktop", "baseline available", False, f"{baseline_path}: {e}")
        return

    for w, h, label in DESKTOP_VPS:
        ctx, pg = open_page(browser, url, w, h, False)
        d = pg.evaluate(PROBE)
        g = f"desktop {w}x{h} {label}"

        rep.check(g, "plugin present but INACTIVE", d["plugin"] and not d["plugin"]["mobile"],
                  f"mobile={d['plugin']['mobile'] if d['plugin'] else None}")
        rep.check(g, "NO injected top bar on desktop",
                  d["topbar"] is None and not d["plugin"]["state"]["hasTopbar"],
                  f"topbar={d['topbar']} state={d['plugin']['state'] if d['plugin'] else None}")

        key = f"{w}x{h}"
        base = baseline.get(key)
        if not base:
            rep.check(g, "baseline row exists", False, f"no baseline for {key}")
            ctx.close()
            continue

        bc = base["closed"]
        rep.check(g, "sidebar width matches pre-install baseline",
                  d["sideW"] == bc["side"]["w"],
                  f"now={d['sideW']} before={bc['side']['w']}")
        rep.check(g, "content width matches pre-install baseline",
                  d["center"] and d["center"]["w"] == bc["center"]["w"],
                  f"now={d['center']['w'] if d['center'] else None} before={bc['center']['w']}")
        rep.check(g, "grid columns match pre-install baseline",
                  d["frameCols"] == bc["frameCols"],
                  f"now={d['frameCols']} before={bc['frameCols']}")
        rep.check(g, "no horizontal overflow", not d["overflowX"],
                  f"scrollW={d['scrollW']} vw={d['vw']}")

        # expanded geometry must be the app's own, untouched
        if click_if(pg, '[aria-label="Open sidebar"]'):
            o = pg.evaluate(PROBE)
            rep.check(g, "expanded sidebar still uses app geometry (in-flow, not overlay)",
                      o["sidePos"] != "fixed",
                      f"position={o['sidePos']} (must NOT be fixed on desktop)")
        ctx.close()


def run_locale(browser, url, rep):
    """The top bar must work in a LOCALISED app.

    This is the bug that shipped: the app localises its `aria-label`s, so a
    zh-CN browser renders 打开侧边栏 / 新建会话 / 搜索会话 / 设置, and the bar's
    original English-label lookups all returned null. Every button silently did
    nothing on the user's phone while the en-US suite stayed green.
    """
    print("\n=== LOCALISED: the top bar still drives the app ===")
    for locale in ("zh-CN", "en-US", "ja-JP"):
        ctx = browser.new_context(viewport={"width": 412, "height": 915},
                                  is_mobile=True, has_touch=True, locale=locale)
        pg = ctx.new_page()
        pg.goto(url, wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_timeout(5000)
        g = f"locale {locale}"

        lang = pg.evaluate("() => document.documentElement.lang")
        rep.check(g, "app language applied", bool(lang),
                  f"documentElement.lang={lang}")

        # Every button must resolve to a REAL app control, never to our own bar.
        resolved = pg.evaluate("""() => {
          const api = window.dshMobileWeb;
          const out = {};
          for (const k of ['menu','plus','search','settings']) out[k] = api.resolve(k);
          return out;
        }""")
        for kind in ("menu", "plus", "search", "settings"):
            r = resolved.get(kind)
            rep.check(g, f"'{kind}' resolves to an app control",
                      r is not None and r.get("inTopbar") is False,
                      f"resolved={r}")

        # And the wiring actually works end to end.
        before = pg.evaluate("() => window.dshMobileWeb.state().drawer")
        pg.click(".dsh-mw-topbar__menu")
        pg.wait_for_timeout(1500)
        after = pg.evaluate("() => window.dshMobileWeb.state().drawer")
        rep.check(g, "menu opens the drawer", before is False and after is True,
                  f"drawer {before} -> {after}")
        pg.evaluate("window.dshMobileWeb.closeDrawer()")
        pg.wait_for_timeout(900)

        pg.click(".dsh-mw-topbar__settings")
        pg.wait_for_timeout(2500)
        opened = pg.evaluate(
            "() => !!document.querySelector('[class*=\"_overlay\"] > [class*=\"_panel\"] > [class*=\"_nav\"]')")
        rep.check(g, "settings opens the panel", opened, f"settingsOpen={opened}")
        ctx.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--baseline", default="before-metrics.json")
    ap.add_argument("--json", default=None)
    ap.add_argument("--destructive", action="store_true",
                    help="also execute the archive action (modifies the user's session list)")
    args = ap.parse_args()

    rep = Report()
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/chromium",
                              args=["--no-sandbox", "--disable-dev-shm-usage"])
        run_mobile(b, args.url, rep)
        run_row_menus(b, args.url, rep, destructive=args.destructive)
        run_touch_reorder(b, args.url, rep, destructive=args.destructive)
        run_file_panel(b, args.url, rep)
        run_touch_extras(b, args.url, rep)
        run_question_card(b, args.url, rep)
        run_workspaces(b, args.url, rep)
        run_locale(b, args.url, rep)
        run_desktop(b, args.url, rep, args.baseline)
        b.close()

    total = len(rep.rows)
    failed = len(rep.failures)
    print(f"\n{'='*62}")
    print(f"TOTAL {total} checks, {total-failed} passed, {failed} failed")
    if failed:
        print("\nFAILURES:")
        for r in rep.failures:
            print(f"  - [{r['group']}] {r['name']}: {r['detail']}")
    if args.json:
        with open(args.json, "w") as f:
            json.dump({"total": total, "failed": failed, "rows": rep.rows}, f, indent=1)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
