# Claude Code Chat Viewer

一个用于查看 Claude Code CLI 聊天记录的 Web 界面。

## 功能特性

- ✅ 按目录查看所有项目
- ✅ 查看单个项目的所有会话
- ✅ 查看单个会话的完整对话
- ✅ 按时间排序会话
- ✅ 显示 Git 分支和工作目录信息
- ✅ 消息气泡样式展示
- ✅ 思考过程折叠显示
- ✅ Token 使用统计

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据源**: `~/.claude/projects/` 目录下的 JSONL 文件

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
claude-chat-viewer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 主页面
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   ├── lib/                   # 工具库
│   └── types/                 # TypeScript 类型
├── public/                    # 静态资源
└── package.json
```

## API 接口

### 获取项目列表
```
GET /api/projects
```

### 获取会话列表
```
GET /api/sessions/[projectPath]
```

### 获取会话详情
```
GET /api/session/[sessionId]?projectPath=xxx
```

## 使用说明

1. 左侧显示所有 Claude Code 项目
2. 点击项目后，中间显示该项目的所有会话
3. 点击会话后，右侧显示完整的对话记录

## 注意事项

- 本应用仅用于查看本地 Claude Code 聊天记录
- 数据来源于 `~/.claude/projects/` 目录
- 不需要网络连接，所有数据在本地处理

## 许可证

MIT
