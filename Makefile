.PHONY: install dev build start clean

install:
	@echo "安装 Claude Chat Viewer 技能..."
	@./install.sh

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

clean:
	rm -rf node_modules pnpm-lock.yaml .next
	@echo "清理完成"

help:
	@echo "可用命令:"
	@echo "  make install  - 一键安装为 Claude Code 技能"
	@echo "  make dev      - 开发模式运行"
	@echo "  make build    - 构建生产版本"
	@echo "  make start    - 启动生产服务器"
	@echo "  make clean    - 清理构建文件"
