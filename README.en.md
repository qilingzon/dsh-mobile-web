# dsh-mobile-web

Full mobile-web adaptation for the DeepSeek Harness console — **without ever touching the desktop layout**.

[English](README.en.md) | [简体中文](README.md)

A DSH profile plugin: one host no-op plus one browser bundle that injects a gated stylesheet and a small behaviour layer. It patches no DSH source file.

---

## 🚀 Quick Start & Installation

Choose one of the following installation methods based on your deployment environment:

### Method 1: One-line Automated Install & Update (Recommended)

Run this single command on your DSH host server. It will automatically clone, build, mount to the `web` profile, and smoothly reload the service:

```bash
curl -fsSL https://raw.githubusercontent.com/qilingzon/dsh-mobile-web/main/install.sh | bash
```

> **Note**:
> - First run performs a clean installation.
> - Running this command again at any time performs a **zero-downtime update** to the latest release without dropping in-flight agent sessions.

---

### Method 2: Offline / Production Release Package (`.tgz`)

For air-gapped servers or production setups where you prefer not to install build dependencies (node/esbuild), use the pre-built GitHub Release tarball:

1. **Download Release Tarball**:
   ```bash
   wget https://github.com/qilingzon/dsh-mobile-web/releases/download/v1.0.0/dsh-mobile-web-1.0.0.tgz
   ```

2. **Install via DSH Plugin CLI**:
   ```bash
   dsh plugin --profile web add ./dsh-mobile-web-1.0.0.tgz
   ```

3. **Restart / Reload DSH**:
   ```bash
   pkill -f "dsh web" && nohup dsh web >/dev/null 2>&1 &
   ```

---

### Method 3: Developer Source Build

If you are modifying CSS or contributing improvements:

1. **Clone & Build**:
   ```bash
   git clone https://github.com/qilingzon/dsh-mobile-web.git
   cd dsh-mobile-web
   node build.mjs          # compiles src/ into lib/client.js
   node test/contract.mjs  # executes 63 contract checks
   ```

2. **Mount to Profile**:
   ```bash
   dsh plugin --profile web add "file:$(pwd)"
   mkdir -p ~/.dsh/profiles/web/node_modules/dsh-mobile-web
   cp -a . ~/.dsh/profiles/web/node_modules/dsh-mobile-web/
   ```

---

## 📱 Mobile Usage & Navigation Guide

This plugin is **strictly gated** to mobile viewports (`max-width: 860px`). When accessed from desktop monitors, the native console UI remains 100% untouched.

When visiting from a mobile browser:

1. **Drawer Navigation**:
   - Tap the `☰` top-left icon to slide out the session drawer.
   - Tap any session to switch immediately **without triggering the on-screen keyboard**.
   - Tap outside the drawer to dismiss smoothly.

2. **Wide Markdown Tables**:
   - Comparison tables wrap cell text cleanly (`word-break: break-word`) to eliminate overlapping text.
   - Swipe horizontally with touch to inspect wide tables without breaking the page width.

3. **Modern Settings UI**:
   - Redesigned into horizontal pill categories and clean cards.
   - Swipe pills horizontally to switch tabs, and tap the floating circular close button at top-right to return.

4. **Keyboard & Input Handling**:
   - Inputs are normalized to 16px to prevent iOS Safari auto-zoom.
   - The message input automatically floats above the soft keyboard.
   - Tapping the `+` command button does not falsely trigger the keyboard.

---

## 🗑️ Uninstallation

To completely remove the mobile plugin and restore native layout:

```bash
dsh plugin --profile web remove dsh-mobile-web
pkill -f "dsh web" && nohup dsh web >/dev/null 2>&1 &
```

---

## The problem it solves

Measured on the stock console at a 390×844 phone viewport:

| Feature / Area | Stock | With dsh-mobile-web |
|---|---|---|
| Left navigation | fixed 56px icon rail eating 12% of screen width | **Gone** — content gets full width; actions move to top bar |
| Content width (390px phone) | 334px | **390px** |
| Sidebar when opened | Squeezed content to 110px | **Overlay drawer**; content width unchanged |
| Markdown Tables | Text clipped/overlapping without wrap | Natural wrapping and smooth horizontal scrolling |
| Settings panel | 188px nav + 154px squeezed content | Modern horizontal capsule pills + full-width cards |
| Inputs under soft keyboard | Hidden behind keyboard | Automatically floats above keyboard |
| Input font size | <16px (triggers iOS auto-zoom shift) | 16px (prevents auto-zoom) |
| Tap targets | As small as 28px | **≥44px** touch targets (Apple HIG) |

---

## How it avoids conflicting with desktop

Three independent mechanisms, each asserted by the test suite:

1. **The gate.** Every declaration in `src/mobile.css` sits inside
   `@media (max-width: 860px), ((max-height: 500px) and (pointer: coarse))`.
   Above the gate the stylesheet contributes *nothing*. `test/contract.mjs`
   proves this by walking the CSS at brace depth 0 and failing if any top-level
   construct is not a `@media` — a stray rule cannot slip in unnoticed.
2. **It does not drive the app's state machine.** Opening and closing the
   sidebar is still the app's own toggle. The plugin only observes the app's
   inline `grid-template-columns` and re-geometries the result.
3. **Regression against a pre-install baseline.** `test/e2e.py` compares
   sidebar width, content width and computed grid columns at 900/1024/1280/1440
   against `before-metrics.json`, captured from the live console *before*
   installation.
