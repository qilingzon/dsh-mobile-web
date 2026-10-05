#!/usr/bin/env bash
# ==============================================================================
# dsh-mobile-web 一键安装与更新脚本
# 支持新装、覆盖更新并自动平滑重载 DSH Web 服务
# ==============================================================================
set -e

GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

log_info() { echo -e "${BLUE}[dsh-mobile-web]${RESET} $1"; }
log_ok() { echo -e "${GREEN}[dsh-mobile-web]${RESET} $1"; }
log_warn() { echo -e "${YELLOW}[dsh-mobile-web]${RESET} $1"; }
log_err() { echo -e "${RED}[dsh-mobile-web]${RESET} $1"; }

TARGET_DIR="${DSH_MOBILE_DIR:-/root/dsh/1/dsh-mobile-web}"
PROFILE_NAME="${DSH_PROFILE:-web}"
REPO_URL="https://github.com/qilingzon/dsh-mobile-web.git"

log_info "开始部署 / 更新 dsh-mobile-web 手机适配插件..."

# 1. 确保安装目录与源码就绪
if [ -d "$TARGET_DIR/.git" ]; then
    log_info "发现已有安装目录 ($TARGET_DIR)，正在拉取最新代码..."
    cd "$TARGET_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    log_info "未检测到本地源码，正在从 GitHub 克隆 ($REPO_URL)..."
    mkdir -p "$(dirname "$TARGET_DIR")"
    rm -rf "$TARGET_DIR"
    git clone "$REPO_URL" "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

# 2. 编译生产产物
log_info "正在编译移动端客户端产物 (lib/client.js)..."
if command -v node >/dev/null 2>&1; then
    node build.mjs
else
    log_err "未找到 node 环境，请检查 Node.js 是否安装并加入 PATH"
    exit 1
fi

# 3. 注册到 DSH Profile
DSH_BIN="/app/user-packages/node/bin/dsh"
if ! command -v "$DSH_BIN" >/dev/null 2>&1; then
    DSH_BIN="$(command -v dsh || true)"
fi

if [ -n "$DSH_BIN" ] && [ -x "$DSH_BIN" ]; then
    log_info "正在将插件挂载至 DSH Profile ($PROFILE_NAME)..."
    PATH="/app/user-packages/node/bin:$PATH" "$DSH_BIN" plugin --profile "$PROFILE_NAME" add "file:$TARGET_DIR" || {
        log_warn "dsh plugin 提示有 peer 警告或已挂载，继续执行物化拷贝..."
    }
else
    log_warn "未找到 dsh 可执行命令，将直接物化拷贝至 profile node_modules..."
fi

# 4. 确保 node_modules 强一致性物化
PROFILE_NODE_MODULES="${DSH_HOME:-/root/.dsh}/profiles/$PROFILE_NAME/node_modules/dsh-mobile-web"
if [ -d "$(dirname "$PROFILE_NODE_MODULES")" ]; then
    mkdir -p "$PROFILE_NODE_MODULES"
    cp -a "$TARGET_DIR/." "$PROFILE_NODE_MODULES/"
    log_ok "已完成 Profile node_modules 产物同步"
fi

# 5. 平滑优雅重载 DSH Web 服务
log_info "准备平滑重载 dsh web 服务（避免中断当前命令）..."

find_dsh() {
    local p cmd
    for p in /proc/[0-9]*; do
        p=${p#/proc/}
        [ "$p" = "$$" ] && continue
        cmd=$(tr '\0' ' ' <"/proc/$p/cmdline" 2>/dev/null) || continue
        case "$cmd" in
            *"bin/dsh web"*) echo "$p"; return 0 ;;
        esac
    done
    return 1
}

OLD_PID=$(find_dsh || true)
if [ -n "$OLD_PID" ]; then
    log_info "通知旧进程 (PID: $OLD_PID) 优雅退出..."
    kill -TERM "$OLD_PID" 2>/dev/null || true
    for _ in $(seq 1 30); do
        sleep 0.5
        NEW_PID=$(find_dsh || true)
        if [ -n "$NEW_PID" ] && [ "$NEW_PID" != "$OLD_PID" ]; then
            break
        fi
    done
fi

log_ok "=========================================================="
log_ok " dsh-mobile-web 部署完成！"
log_ok " 请在手机浏览器中刷新页面即可体验最新的移动端适配界面。"
log_ok "=========================================================="
