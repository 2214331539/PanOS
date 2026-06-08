#!/usr/bin/env bash
#
# PanOS 一键本地启动脚本
# 同时启动 FastAPI 后端（panos/backend）与 Vite 前端（panos/frontend），Ctrl+C 一起退出。
#
# 用法：
#   ./dev.sh            启动前端 + 后端
#   ./dev.sh --web-only 只启动前端
#   ./dev.sh --api-only 只启动后端
#   ./dev.sh -h         查看帮助
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# ---- 可按需调整的配置 ----
API_PORT="${API_PORT:-8000}"
WEB_PORT="${WEB_PORT:-5173}"
# 前端访问后端的地址；导出后 Vite 会注入到 import.meta.env，并启用首页 bootstrap 请求。
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:${API_PORT}/api}"

RUN_API=1
RUN_WEB=1
case "${1:-}" in
  --web-only) RUN_API=0 ;;
  --api-only) RUN_WEB=0 ;;
  -h|--help)
    sed -n '3,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  "") ;;
  *) echo "未知参数：$1（用 -h 查看帮助）" >&2; exit 1 ;;
esac

# ---- 前置检查 ----
need() { command -v "$1" >/dev/null 2>&1 || { echo "缺少依赖：$1，请先安装。" >&2; exit 1; }; }
[ "$RUN_WEB" -eq 1 ] && need pnpm
[ "$RUN_API" -eq 1 ] && need uv

# ---- 依赖自动安装（缺失才装）----
if [ "$RUN_WEB" -eq 1 ] && [ ! -d "$ROOT/node_modules" ]; then
  echo "▶ 安装前端依赖（pnpm install）..."
  pnpm install
fi
if [ "$RUN_API" -eq 1 ] && [ ! -d "$ROOT/panos/backend/.venv" ]; then
  echo "▶ 同步后端依赖（uv sync）..."
  (cd "$ROOT/panos/backend" && uv sync)
fi

# ---- 起本地数据库（docker 可用时）----
if [ "$RUN_API" -eq 1 ] && command -v docker >/dev/null 2>&1; then
  echo "▶ 启动本地数据库（docker compose up -d）..."
  docker compose up -d >/dev/null 2>&1 || echo "  (docker compose 启动失败，请确认 Docker 已运行)"
fi

# ---- 退出时清理所有子进程 ----
cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "⏹  正在停止 PanOS ..."
  # 关闭本进程组下的全部子进程（uvicorn/vite 及其 reload 子进程）
  kill 0 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "──────────────────────────────────────────────"
echo "  PanOS dev"
[ "$RUN_API" -eq 1 ] && echo "  API  →  http://localhost:${API_PORT}        (docs: /docs)"
[ "$RUN_WEB" -eq 1 ] && echo "  Web  →  http://localhost:${WEB_PORT}        (端口被占用时 Vite 会自动顺延)"
echo "  按 Ctrl+C 退出"
echo "──────────────────────────────────────────────"

# ---- 启动后端 ----
if [ "$RUN_API" -eq 1 ]; then
  (cd "$ROOT/panos/backend" && uv run uvicorn app.main:app --reload --port "$API_PORT") &
fi

# ---- 启动前端 ----
if [ "$RUN_WEB" -eq 1 ]; then
  pnpm --dir "$ROOT/panos/frontend" run dev --port "$WEB_PORT" &
fi

# 等待任一进程退出，随后由 trap 统一清理
wait
