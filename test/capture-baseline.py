#!/usr/bin/env python3
"""
dsh-mobile-web — capture the pre-install desktop baseline.

`run_desktop()` in test/e2e.py compares the live desktop console against
`before-metrics.json` to prove the adaptation is ABSENT above the gate. That
file has to come from somewhere; this is that somewhere.

It deliberately reuses e2e.py's own PROBE and open_page, so the numbers are
produced by exactly the code that later asserts on them. A baseline captured by
a second, divergent implementation would be worse than no baseline at all.

Usage:
  python3 test/capture-baseline.py --url http://127.0.0.1:3080 \
                                   [--out before-metrics.json]
"""
import argparse
import importlib.util
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def load_e2e():
    """Import test/e2e.py as a module without running its main()."""
    spec = importlib.util.spec_from_file_location("dsh_mobile_web_e2e", HERE / "e2e.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--out", default=str(ROOT / "before-metrics.json"))
    args = ap.parse_args()

    e2e = load_e2e()
    baseline = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for w, h, label in e2e.DESKTOP_VPS:
            ctx, pg = e2e.open_page(browser, args.url, w, h, False)
            d = pg.evaluate(e2e.PROBE)

            # Refuse to capture while the adaptation is active. If it were, the
            # baseline would bake the plugin's own geometry in and run_desktop
            # could never fail — the guarantee would be asserted against itself.
            if d["plugin"] and d["plugin"]["mobile"]:
                print(f"  REFUSING: plugin reports mobile at {w}x{h} — this is not a "
                      f"pre-install desktop state", file=sys.stderr)
                ctx.close()
                browser.close()
                return 2

            center_w = d["center"]["w"] if d["center"] else None
            baseline[f"{w}x{h}"] = {
                "label": label,
                "closed": {
                    "side": {"w": d["sideW"]},
                    "center": {"w": center_w},
                    "frameCols": d["frameCols"],
                },
            }
            print(f"  {w}x{h} {label}: side={d['sideW']} center={center_w} "
                  f"cols={d['frameCols']}")
            ctx.close()
        browser.close()

    with open(args.out, "w") as f:
        json.dump(baseline, f, indent=1)
        f.write("\n")
    print(f"wrote {args.out} ({len(baseline)} desktop viewports)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
