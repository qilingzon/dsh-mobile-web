# dsh-mobile-web-pro

[![license](https://img.shields.io/github/license/qilingzon/dsh-mobile-web.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/qilingzon/dsh-mobile-web.svg)](https://github.com/qilingzon/dsh-mobile-web/releases)
[![DSH](https://img.shields.io/badge/DeepSeek-Harness-blue)](https://github.com/deepseek-ai/DeepSeek-Harness)

[English](README.en.md) | [中文](README.md)

**DSH Mobile Web Flagship UI Plugin (Pro)** — Delivering native mobile interactions and comprehensive adaptation for DeepSeek Harness (DSH Web).

Built upon a robust, battle-tested architecture, `dsh-mobile-web-pro` introduces smooth history pagination, DOM rendering acceleration for ultra-long sessions, full safe-area touch ergonomics, and fixes historical issues such as long-session lag, abrupt scroll jumping, text overlapping, and toolbar clipping.

---

## ✨ Key Features & Pro Enhancements

### ⚡ 1. Smooth History Loading & DOM Acceleration
* **Smooth History Auto-loading**: Automatically and smoothly triggers loading of earlier messages when scrolling near the top of the chat, removing the need to tap "load older" buttons manually.
* **Momentum-aware Jump Prevention**: Completely eliminates abrupt scroll jumps during touch momentum. Cooperates with DSH's native `viewport.preserve()` scroll anchoring to maintain seamless visual continuity.
* **DOM Rendering Acceleration**: Leverages `content-visibility: auto` on message elements, allowing thousands of historical turns to render on-demand and substantially reducing main-thread layout reflows.

### 🛡️ 2. Zero Regressions & Layout Integrity
* **Zero Text Overlapping**: Enhances Markdown and table layouts. Tables automatically scroll horizontally with natural cell wrapping, preventing text collisions and viewport blowouts.
* **Full Header & Toolbar Visibility**: Integrates smooth horizontal header scrolling, ensuring session titles, action buttons, and PTC/usage badges remain fully visible and clickable on narrow screens.
* **Touch-friendly Session Row Actions**: Permanently displays the `⋯` action menu trigger on session items for mobile devices (which lack mouse hover), making renaming, forking, and archiving readily accessible.

### 📱 3. Native Mobile Gestures & Ergonomics
* **Edge Swipe Drawer**: Swipe right from the left edge of the screen to smoothly reveal the workspace navigation drawer, complete with frosted backdrop scrim.
* **Two-step Turn Rail Preview**: Touch turn markers on the right edge to preview message abstracts before confirming navigation, preventing accidental jumps.
* **Comprehensive Safe Area Adaptation**: Full alignment with iPhone notches, Dynamic Island, home indicators, and Android cutouts.
* **Dynamic Keyboard Height Alignment**: Uses `visualViewport` tracking to adjust frame height when the on-screen keyboard opens.
* **Offline Recovery Pill**: Non-intrusive floating status indicator when offline, offering one-tap reconnection when network restores.

---

## 🎯 Breakpoints

| Breakpoint | Mode | Description |
|:---|:---|:---|
| **≤ 1023px** | **Pro Mobile Mode** | Activates mobile gestures, drawer, history acceleration, and touch optimizations |
| **≥ 1024px** | **Native Desktop Mode** | Zero intervention, retaining clean native desktop DSH experience |

Strictly aligned with DSH's native `SIDEBAR_AUTO_COLLAPSE = 1024` threshold.

---

## 📦 Installation

### Method 1: Git Clone (Recommended)

```bash
cd /workspace/.dsh/profiles/web/node_modules
git clone https://github.com/qilingzon/dsh-mobile-web.git dsh-mobile-web-pro
cd dsh-mobile-web-pro
npm install
npm run build
```

Enable in your DSH profile:
```bash
dsh plugin --profile web enable dsh-mobile-web-pro
```
Restart DSH to apply.

### Method 2: DSH CLI

```bash
dsh plugin --profile web add dsh-mobile-web-pro
```

---

## ⚙️ Configuration

In DSH Web: **Settings → Plugins → 移动端适配 (Pro)**:

| Setting | Default | Description |
|:---|:---:|:---|
| `swipeEnabled` | `true` | Swipe right from left edge to open drawer |
| `autoLoadEarlier` | `true` | Smooth auto-loading when scrolling near top |
| `headerScroll` | `true` | Single-line horizontal scroll for header items |
| `turnRail` | `true` | Turn navigator touch preview and navigation |
| `pwaEnabled` | `true` | Progressive Web App offline caching & install |
| `drawerRefresh` | `false` | Manual refresh button at bottom of sidebar |
| `dshmarketNavFix` | `true` | Preserve settings navigation for third-party marketplace |

---

## 🛠️ Build

```bash
npm install
npm run build
```

---

## 📄 License

Licensed under the [MIT License](LICENSE).
