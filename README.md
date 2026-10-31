# dsh-mobile-web-pro

[![license](https://img.shields.io/github/license/qilingzon/dsh-mobile-web.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/qilingzon/dsh-mobile-web.svg)](https://github.com/qilingzon/dsh-mobile-web/releases)
[![DSH](https://img.shields.io/badge/DeepSeek-Harness-blue)](https://github.com/deepseek-ai/DeepSeek-Harness)

[中文](README.md)

**DSH 移动端全功能旗舰适配插件 (Pro)** —— 为 DeepSeek Harness 提供原生的移动端全场景交互体验。

基于经过长期实战检验的高可用架构打造，融合平滑历史分页、长会话渲染加速、全设备安全区与触控细节，彻底攻克长会话卡顿、滑动加载突兀跳变、文字重叠与选项栏截断等历史难题。

---

## ✨ 核心特性与重大升级 (Pro)

### ⚡ 1. 超长会话平滑历史加载与极速渲染
* **平滑自动加载 (Smooth History Streaming)**：在对话列表中滑动至顶部附近时，自动且平滑地触发上一页历史加载，无需手动反复寻觅点击按钮。
* **动量保护与防突兀跳变 (Zero Scroll Jump)**：彻底解决旧版“滑动加载历史对话不平滑很陡”的顽疾。尊重手势惯性动量，配合 DSH 原生 `viewport.preserve()` 滚动锚定，绝不粗暴强设 `scrollTop`，画面沉浸平稳不跳帧。
* **DOM 渲染加速 (Render Acceleration)**：对消息流注入现代 Web `content-visibility: auto` 与盒模型占位优化，视口外海量历史消息按需合成渲染，大幅减轻成百上千条超长会话在主线程的布局重排（Reflow）负担。

### 🛡️ 2. 排版自适应与彻底杜绝负优化
* **彻底根除文字重叠 (Zero Text Overlap)**：优化 Markdown 排版与表格渲染容器，表格单元格支持自适应折行与平滑横向滚动，彻底杜绝不同渲染层相互穿透、文字重合以及视口溢出的 bug。
* **选项栏完整呈现 (No Toolbar Clipping)**：页头集成弹性横向滑动机制（Header Scroll），在小屏手机上无论是会话长标题、操作按钮还是 PTC/用量徽标，均能单行横向滑动查看，绝不截断、绝不挤压变形。
* **移动端会话操作菜单修复 (Touch Row Actions)**：针对手机没有鼠标 hover 的特性，在侧栏会话列表中常驻显示 `⋯` 操作菜单，让重命名、分叉会话、归档等关键功能在触屏端一触即达。

### 📱 3. 原生移动端交互与手势体验
* **边缘滑动抽屉 (Swipe Drawer)**：支持从屏幕左边缘向右平滑滑动唤出侧边栏抽屉，附带毛玻璃遮罩（Scrim），点击遮罩或按 Escape 即可随时收起。
* **轮次刻度预览与跳转 (Turn Rail Preview)**：右侧轮次刻度条采用两段式交互——触碰先弹窗预览对应轮次发言摘要，再次确认点击直达，避免误触跳跃。
* **Safe Area 全屏适配**：深度适配 iPhone 刘海、灵动岛、底部手势条（Home Indicator）及各类 Android 打孔屏。
* **软键盘自适应高度**：结合 `visualViewport` 动态计算真实视口高度，键盘弹出时输入框与视图自然顶起，不遮挡最后一条消息。
* **网络断开浮动自愈 (Offline Recovery)**：网络异常时非侵入式弹出自愈提示胶囊，网络恢复时一键重连，保障编辑草稿不丢失。

---

## 🎯 响应式断点设计

| 视口断点 | 运行模式 | 行为说明 |
|:---|:---|:---|
| **≤ 1023px** | **Pro 移动模式** | 激活全部移动端手势、抽屉、长会话加速与触控优化 |
| **≥ 1024px** | **原生桌面模式** | 零介入、零影响，保持 DSH 桌面端原生纯净体验 |

与 DSH 核心 `SIDEBAR_AUTO_COLLAPSE = 1024` 断点严格对齐，折叠屏展开与平板横屏自动无缝切换。

---

## 📦 安装与使用

### 方式一：克隆仓库安装（推荐）

```bash
cd /workspace/.dsh/profiles/web/node_modules
git clone https://github.com/qilingzon/dsh-mobile-web.git dsh-mobile-web-pro
cd dsh-mobile-web-pro
npm install
npm run build
```

在你的 Profile（例如 `web`）中启用插件：
```bash
dsh plugin --profile web enable dsh-mobile-web-pro
```
重启 DSH 服务即可立即体验。

### 方式二：DSH CLI 注册

```bash
dsh plugin --profile web add dsh-mobile-web-pro
```

---

## ⚙️ 个性化配置

在 DSH 界面点击 **「设置」 -> 「插件」 -> 「移动端适配 (Pro)」**，即可可视化开关以下特性：

| 配置项 | 默认值 | 详细说明 |
|:---|:---:|:---|
| **滑动打开抽屉** (`swipeEnabled`) | `true` | 允许从屏幕左侧边缘右滑直接拉出侧边栏抽屉 |
| **平滑自动加载历史** (`autoLoadEarlier`) | `true` | 在对话列表向上滑动至顶部附近时，平滑自动拉取更早历史 |
| **页头横向滑动** (`headerScroll`) | `true` | 窄屏下页头标题与操作按钮保持单行，溢出部分支持平滑滑动查看 |
| **轮次导航** (`turnRail`) | `true` | 对话右侧轮次刻度条：触控预览轮次内容，再点精准定位跳转 |
| **PWA 离线缓存** (`pwaEnabled`) | `true` | 离线 Service Worker 支持与主屏幕安装 |
| **抽屉刷新按钮** (`drawerRefresh`) | `false` | 侧栏底部常驻刷新快捷键（用于无手势下拉刷新的场景） |
| **市场导航修复** (`dshmarketNavFix`) | `true` | 保持窄屏下市场插件等第三方扩展的导航通路 |

---

## 🛠️ 项目构建与验证

```bash
# 安装依赖
npm install

# 编译 Host 端与 Client 端 Bundle (生成 lib/index.js 和 lib/client.js)
npm run build
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
欢迎提出 Issue 与 Pull Request 共同完善！
