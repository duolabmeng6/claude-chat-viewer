#!/bin/bash

# 快速安装脚本 - 通过 git clone 一键安装
# 使用方法: curl -fsSL https://raw.githubusercontent.com/your-username/claude-chat-viewer/main/quick-install.sh | bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

REPO_URL="https://github.com/your-username/claude-chat-viewer.git"
TEMP_DIR=$(mktemp -d)

echo -e "${BLUE}ℹ 正在下载 Claude Chat Viewer...${NC}"

# 克隆仓库
git clone "$REPO_URL" "$TEMP_DIR"

# 运行安装脚本
cd "$TEMP_DIR"
./install.sh

# 清理临时目录
cd ~
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✓ 安装完成！${NC}"
echo -e "${GREEN}在 Claude Code CLI 中说\"查看聊天记录\"即可启动${NC}"
