#!/bin/bash

# Claude Chat Viewer 技能安装脚本
# 将此项目安装为 Claude Code CLI 的技能

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="claude-chat-viewer"
SKILL_DIR="$HOME/.claude/skills/$SKILL_NAME"

echo -e "${BLUE}ℹ 正在安装 Claude Chat Viewer 技能...${NC}"

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ 未找到 pnpm，请先安装 pnpm${NC}"
    echo "  npm install -g pnpm"
    exit 1
fi

# 创建技能目录
echo -e "${BLUE}ℹ 创建技能目录...${NC}"
mkdir -p "$SKILL_DIR"

# 复制技能文件到 Claude 技能目录
echo -e "${BLUE}ℹ 复制技能文件...${NC}"
cp -r "$SCRIPT_DIR" "$SKILL_DIR/project"

# 创建启动脚本
cat > "$SKILL_DIR/start.sh" << 'STARTSCRIPT'
#!/bin/bash

# Claude Chat Viewer 启动脚本

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$HOME/.claude/skills/claude-chat-viewer/project"
PID_FILE="/tmp/claude-chat-viewer.pid"
LOG_FILE="/tmp/claude-chat-viewer.log"
DEFAULT_PORT=3000

# 查找可用端口
find_available_port() {
    local port=$DEFAULT_PORT
    while [ $port -le 3010 ]; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    echo ""
    return 1
}

# 启动服务
start_server() {
    local port=$1

    echo -e "${BLUE}ℹ 正在启动服务...${NC}"
    echo -e "${BLUE}ℹ 访问地址: http://localhost:$port${NC}"
    echo -e "${BLUE}ℹ 按 Ctrl+C 停止服务${NC}"
    echo "----------------------------------------"

    cd "$PROJECT_DIR"
    PORT=$port pnpm start 2>&1 | tee "$LOG_FILE" &
    echo $! > "$PID_FILE"
    wait $!
}

# 检查服务状态
check_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${GREEN}✓ 服务正在运行 (PID: $pid)${NC}"
            if [ -f "$LOG_FILE" ]; then
                local port=$(grep -o "localhost:[0-9]*" "$LOG_FILE" | head -1 | cut -d: -f2)
                if [ ! -z "$port" ]; then
                    echo -e "${GREEN}✓ 访问地址: http://localhost:$port${NC}"
                fi
            fi
            return 0
        fi
    fi
    echo -e "${YELLOW}⚠ 服务未运行${NC}"
    return 1
}

# 停止服务
stop_server() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid
            rm -f "$PID_FILE"
            echo -e "${GREEN}✓ 服务已停止${NC}"
            return 0
        fi
    fi
    echo -e "${YELLOW}⚠ 服务未运行${NC}"
}

# 查看日志
view_logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        echo -e "${YELLOW}⚠ 日志文件不存在${NC}"
    fi
}

# 主逻辑
case "${1:-}" in
    --stop)
        stop_server
        ;;
    --status)
        check_status
        ;;
    --logs)
        view_logs
        ;;
    --restart)
        stop_server
        sleep 2
        port=$(find_available_port)
        if [ -z "$port" ]; then
            echo -e "${RED}✗ 无法找到可用端口 (3000-3010)${NC}"
            exit 1
        fi
        start_server $port
        ;;
    --detach)
        port=$(find_available_port)
        if [ -z "$port" ]; then
            echo -e "${RED}✗ 无法找到可用端口 (3000-3010)${NC}"
            exit 1
        fi
        cd "$PROJECT_DIR"
        PORT=$port pnpm start > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        sleep 2
        if check_status > /dev/null; then
            echo -e "${GREEN}✓ 服务已在后台启动${NC}"
            echo -e "${GREEN}✓ 访问地址: http://localhost:$port${NC}"
            # 尝试打开浏览器
            if command -v open > /dev/null; then
                open "http://localhost:$port"
            fi
        else
            echo -e "${RED}✗ 服务启动失败${NC}"
            exit 1
        fi
        ;;
    *)
        # 检查是否已有服务在运行
        if [ -f "$PID_FILE" ]; then
            local pid=$(cat "$PID_FILE")
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠ 服务已在运行 (PID: $pid)${NC}"
                check_status
                exit 0
            fi
        fi

        # 查找可用端口
        port=$(find_available_port)
        if [ -z "$port" ]; then
            echo -e "${RED}✗ 无法找到可用端口 (3000-3010)${NC}"
            exit 1
        fi

        start_server $port
        ;;
esac
STARTSCRIPT

chmod +x "$SKILL_DIR/start.sh"

# 创建技能元数据文件
cat > "$SKILL_DIR/skill.md" << 'SKILLMD'
# Claude Chat Viewer

查看 Claude Code CLI 聊天记录的 Web 界面。

## 使用场景

1. 查看所有项目的聊天记录
2. 浏览会话历史
3. 搜索和回顾对话内容

## 使用方法

当用户说"查看聊天记录"、"查看会话"、"chat viewer"、"聊天浏览器"等关键词时触发。

或者直接运行：
```bash
claude-chat-viewer
```

## 功能特性

- 📂 项目管理 - 按目录查看所有 Claude Code 项目
- 💬 会话浏览 - 查看单个项目的所有会话，按时间排序
- 🎨 优雅界面 - 消息气泡样式展示，思考过程可折叠
- 📊 数据统计 - Token 使用情况一目了然
- 🌿 Git 集成 - 显示分支和工作目录信息
- ⚡ 高性能 - 基于 Next.js 15，响应迅速
SKILLMD

# 安装依赖并构建项目
echo -e "${BLUE}ℹ 安装依赖...${NC}"
cd "$SKILL_DIR/project"
pnpm install

echo -e "${BLUE}ℹ 构建项目...${NC}"
pnpm build

echo -e "${GREEN}✓ 安装完成！${NC}"
echo ""
echo -e "${GREEN}使用方法：${NC}"
echo "  claude-chat-viewer          # 启动服务"
echo "  claude-chat-viewer --stop   # 停止服务"
echo "  claude-chat-viewer --status # 查看状态"
echo "  claude-chat-viewer --logs   # 查看日志"
echo ""
echo -e "${GREEN}首次使用时，在 Claude Code CLI 中说\"查看聊天记录\"即可自动启动${NC}"
