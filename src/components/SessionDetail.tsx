'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { SessionDetail as SessionDetailType, UserMessage, AssistantMessage } from '@/types'
import { formatTimestamp } from '@/lib/date-utils'
import { SessionDetailSkeleton } from '@/components/Skeleton'
import ErrorDisplay from '@/components/ErrorDisplay'
import { NoSessionSelected, SessionNotFound } from '@/components/EmptyState'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface SessionDetailProps {
  sessionId?: string
  projectPath?: string
}

/**
 * 将消息内容转换为 Markdown 文本
 */
function contentToMarkdown(content: any, indent: string = ''): string {
  if (content === null || content === undefined) {
    return ''
  }

  // 字符串类型
  if (typeof content === 'string') {
    return content
  }

  // 数字或布尔类型
  if (typeof content === 'number' || typeof content === 'boolean') {
    return String(content)
  }

  // 数组类型
  if (Array.isArray(content)) {
    return content.map((item, index) => contentToMarkdown(item, indent)).join('\n\n')
  }

  // 对象类型
  if (typeof content === 'object') {
    const type = content.type

    // thinking 类型
    if (type === 'thinking' && content.thinking) {
      return `${indent}### 💭 思考过程\n\n${indent}\`\`\`\n${content.thinking}\n${indent}\`\`\``
    }

    // text 类型
    if (type === 'text' && content.text) {
      return content.text
    }

    // tool_use 类型
    if (type === 'tool_use') {
      const inputStr = content.input
        ? typeof content.input === 'string'
          ? content.input
          : JSON.stringify(content.input, null, 2)
        : ''
      return `${indent}### 🔧 工具调用: ${content.name || '未知工具'}\n\n${indent}**输入参数**:\n\n${indent}\`\`\`json\n${inputStr}\n${indent}\`\`\``
    }

    // tool_result 类型
    if (type === 'tool_result') {
      const isError = content.is_error === true
      const contentStr = content.content
        ? typeof content.content === 'string'
          ? content.content
          : JSON.stringify(content.content, null, 2)
        : ''
      const icon = isError ? '❌' : '✅'
      const title = isError ? '错误结果' : '执行结果'
      return `${indent}### ${icon} ${title}\n\n${indent}\`\`\`\n${contentStr}\n${indent}\`\`\``
    }

    // image 类型
    if (type === 'image' && content.source) {
      return `${indent}### 🖼️ 图片\n\n${indent}[图片: ${content.source.media_type || 'unknown'}]`
    }

    // 其他未知类型
    return `${indent}\`\`\`json\n${JSON.stringify(content, null, 2)}\n${indent}\`\`\``
  }

  return String(content)
}

/**
 * 生成会话的 Markdown 文本（不下载）
 */
function generateMarkdownContent(session: SessionDetailType): string {
  const lines: string[] = []

  // 标题
  lines.push(`# ${session.summary || '会话详情'}`)
  lines.push('')

  // 会话信息
  lines.push('## 📋 会话信息')
  lines.push('')
  lines.push(`- **消息数量**: ${session.messageCount} 条`)
  if (session.gitBranch) {
    lines.push(`- **Git 分支**: ${session.gitBranch}`)
  }
  if (session.cwd) {
    lines.push(`- **工作目录**: ${session.cwd}`)
  }
  lines.push(`- **开始时间**: ${formatTimestamp(session.startTime)}`)
  if (session.endTime) {
    lines.push(`- **结束时间**: ${formatTimestamp(session.endTime)}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // 消息内容
  lines.push('## 💬 对话记录')
  lines.push('')

  session.messages.forEach((message, index) => {
    const isUser = message.type === 'user'
    const icon = isUser ? '👤' : '🤖'
    const role = isUser ? '用户' : (message as AssistantMessage).message.model || 'Assistant'

    lines.push(`### ${icon} ${role}`)
    lines.push('')
    lines.push(`**时间**: ${formatTimestamp(message.timestamp)}`)
    lines.push('')

    if (isUser) {
      const userContent = (message as UserMessage).message.content
      lines.push(contentToMarkdown(userContent))
    } else {
      const assistantContent = (message as AssistantMessage).message.content
      lines.push(contentToMarkdown(assistantContent))
    }

    lines.push('')
    lines.push('---')
    lines.push('')
  })

  // 添加导出信息
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push(`<small>导出时间: ${new Date().toLocaleString('zh-CN')}</small>`)

  return lines.join('\n')
}

/**
 * 导出会话为 Markdown 格式
 */
function exportSessionToMarkdown(session: SessionDetailType) {
  const markdown = generateMarkdownContent(session)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${session.summary || '会话详情'}_${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 工具调用卡片组件 - 可折叠的工具调用展示
 */
function ToolUseCard({ data }: { data: Record<string, any> }) {
  const [isExpanded, setIsExpanded] = useState(true) // 默认展开
  const inputStr = data.input
    ? typeof data.input === 'string'
      ? data.input
      : JSON.stringify(data.input, null, 2)
    : ''

  return (
    <div className="mt-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-blue-600/10 overflow-hidden">
      {/* 头部 - 始终可见 */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-blue-500/5 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-lg">
            🔧
          </span>
          <div>
            <span className="font-medium text-blue-400 text-sm">
              {data.name || '工具调用'}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-blue-500/10">
          {inputStr && (
            <div className="mt-3">
              <div className="text-xs text-gray-400 mb-1.5 font-medium">输入参数</div>
              <pre className="text-xs bg-dark-bg/80 backdrop-blur rounded-lg p-3 overflow-x-auto text-gray-300 border border-gray-700/50">
                {inputStr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 工具结果卡片组件 - 可折叠的工具结果展示
 */
function ToolResultCard({ data }: { data: Record<string, any> }) {
  const [isExpanded, setIsExpanded] = useState(true) // 默认展开
  const isError = data.is_error === true
  const contentStr = data.content
    ? typeof data.content === 'string'
      ? data.content
      : JSON.stringify(data.content, null, 2)
    : ''

  return (
    <div
      className={`mt-3 rounded-xl border overflow-hidden ${
        isError
          ? 'border-red-500/20 bg-gradient-to-r from-red-500/5 to-red-600/10'
          : 'border-green-500/20 bg-gradient-to-r from-green-500/5 to-green-600/10'
      }`}
    >
      {/* 头部 - 始终可见 */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-200 ${
          isError ? 'hover:bg-red-500/5' : 'hover:bg-green-500/5'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${
            isError ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            {isError ? '❌' : '✓'}
          </span>
          <div>
            <span className={`font-medium text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>
              {isError ? '工具错误' : '工具结果'}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className={`px-4 pb-4 border-t ${isError ? 'border-red-500/10' : 'border-green-500/10'}`}>
          {contentStr && (
            <div className="mt-3">
              <pre className={`text-xs bg-dark-bg/80 backdrop-blur rounded-lg p-3 overflow-auto text-gray-300 border ${
                isError ? 'border-red-900/50 max-h-60' : 'border-gray-700/50 max-h-60'
              }`}>
                {contentStr.length > 5000
                  ? contentStr.substring(0, 5000) + '\n\n...(内容过长已截断)'
                  : contentStr
                }
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 思考过程卡片组件
 */
function ThinkingCard({ thinking }: { thinking: string }) {
  return (
    <details className="mb-3 group" open> {/* 默认展开 */}
      <summary className="cursor-pointer list-none flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors py-1.5">
        <svg
          className="w-4 h-4 transition-transform duration-200 group-open:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="flex items-center gap-1.5">
          <span className="text-base">💭</span>
          <span className="font-medium">思考过程</span>
        </span>
      </summary>
      <div className="mt-2 ml-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-purple-600/10 border border-purple-500/20">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words font-sans leading-relaxed">
          {thinking}
        </pre>
      </div>
    </details>
  )
}

/**
 * 安全渲染任意类型的内容
 * 递归处理对象、数组和基本类型，确保不会尝试直接渲染对象
 * 添加错误边界，确保任何渲染错误都有降级方案
 *
 * 支持的消息内容类型：
 * - 基本类型：string, number, boolean, null, undefined
 * - 数组：递归处理每个元素
 * - tool_use：工具调用
 * - tool_result：工具结果（包含 is_error 标志）
 * - thinking：思考过程
 * - text：文本内容
 * - image：图片内容（如果有）
 * - 其他未知类型：显示为 JSON
 */
function safeRenderContent(content: any, key?: number | string): React.ReactNode {
  try {
    // null 或 undefined
    if (content === null || content === undefined) {
      return null
    }

    // 基本类型：字符串使用 Markdown 渲染，数字和布尔值转换为字符串
    if (typeof content === 'string') {
      return <MarkdownRenderer content={content} />
    }
    if (typeof content === 'number' || typeof content === 'boolean') {
      return String(content)
    }

    // 数组：递归处理每个元素
    if (Array.isArray(content)) {
      return (
        <>
          {content.map((item, idx) => (
            <React.Fragment key={idx}>
              {safeRenderContent(item, idx)}
            </React.Fragment>
          ))}
        </>
      )
    }

    // 对象：根据类型特殊处理
    if (typeof content === 'object') {
      const obj = content as Record<string, any>
      const type = obj.type

      // tool_use 类型
      if (type === 'tool_use') {
        return <ToolUseCard key={key} data={obj} />
      }

      // tool_result 类型
      if (type === 'tool_result') {
        return <ToolResultCard key={key} data={obj} />
      }

      // thinking 类型
      if (type === 'thinking' && obj.thinking) {
        return <ThinkingCard key={key} thinking={String(obj.thinking)} />
      }

      // text 类型 - 使用 Markdown 渲染
      if (type === 'text' && obj.text) {
        return (
          <MarkdownRenderer key={key} content={String(obj.text)} />
        )
      }

      // image 类型（如果消息中包含图片）
      if (type === 'image' && (obj.source?.url || obj.source?.data)) {
        const imageUrl = obj.source?.url || `data:${obj.source?.media_type};base64,${obj.source?.data}`
        return (
          <div key={key} className="my-2">
            <img
              src={imageUrl}
              alt={obj.alt || '图片'}
              className="max-w-full h-auto rounded-lg border border-gray-700"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )
      }

      // 处理只有 content 字段的对象（某些简化的消息格式）
      if (obj.content !== undefined && !type) {
        return (
          <div key={key}>
            {safeRenderContent(obj.content)}
          </div>
        )
      }

      // 其他类型的对象：显示为格式化的 JSON
      console.warn('⚠️ 遇到未知类型的消息内容:', { type, keys: Object.keys(obj), sample: obj })
      return (
        <details key={key} className="my-2">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1">
            <span>📋</span>
            <span>原始数据 (类型: {type || '未知'})</span>
          </summary>
          <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700">
            <pre className="text-xs text-gray-400 overflow-auto max-h-40">
              {JSON.stringify(obj, null, 2)}
            </pre>
          </div>
        </details>
      )
    }

    // 未知类型：转换为字符串
    console.warn('⚠️ 遇到非对象类型的内容:', { type: typeof content, value: content })
    return String(content)
  } catch (error) {
    // 如果渲染过程中出现任何错误，返回降级UI
    console.error('safeRenderContent error:', error, 'content:', content)
    return (
      <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
        ⚠️ 内容渲染失败
      </div>
    )
  }
}

// 消息组件 - 使用 memo 优化，带有精美的视觉设计和错误边界
const MessageItem = memo(function MessageItem({
  message,
  index
}: {
  message: UserMessage | AssistantMessage
  index: number
}) {
  try {
    const isUser = message.type === 'user'

    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 message-bubble`}
      >
        <div
          className={`
            max-w-[85%] sm:max-w-[75%] lg:max-w-3xl
            rounded-2xl px-4 py-3 sm:px-5 sm:py-4
            ${isUser
              ? 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50 shadow-xl shadow-black/20'
              : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50 shadow-xl shadow-black/20'
            }
          `}
        >
          {/* 消息头部 */}
          <div className={`flex items-center justify-between mb-2.5 text-sm ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                isUser ? 'bg-slate-700/50' : 'bg-slate-700/50'
              }`}>
                {isUser ? '👤' : '🤖'}
              </span>
              <span className="font-medium">
                {isUser ? '用户' : (message.message.model || 'Assistant')}
              </span>
            </div>
            <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
          </div>

          {/* 消息内容 */}
          <div className={`whitespace-pre-wrap break-words leading-relaxed ${isUser ? 'text-slate-200' : 'text-slate-200'}`}>
            {isUser ? (
              <div>{safeRenderContent((message as UserMessage).message.content)}</div>
            ) : (
              <div>
                {safeRenderContent((message as AssistantMessage).message.content)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // 如果单条消息渲染失败，显示降级UI而不是崩溃整个页面
    console.error('MessageItem render error:', error, 'message:', message)
    return (
      <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-yellow-400 font-medium">
          <span>⚠️</span>
          <span>消息 #{index + 1} 渲染失败</span>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400">
            查看原始数据
          </summary>
          <pre className="mt-2 p-3 bg-black/20 rounded border border-gray-700 text-xs text-gray-400 overflow-auto max-h-40">
            {JSON.stringify(message, null, 2)}
          </pre>
        </details>
      </div>
    )
  }
})

/**
 * 导出预览对话框组件
 */
function ExportPreviewModal({
  isOpen,
  onClose,
  session
}: {
  isOpen: boolean
  onClose: () => void
  session: SessionDetailType | null
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  if (!isOpen || !session) return null

  const markdownContent = generateMarkdownContent(session)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const handleExport = () => {
    exportSessionToMarkdown(session)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 对话框 */}
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>📄</span>
            <span>导出预览</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 预览内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words font-mono leading-relaxed bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            {markdownContent}
          </pre>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/80">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              copyStatus === 'copied'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {copyStatus === 'copied' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>已复制</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>复制</span>
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>导出文件</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function SessionDetailInner({ sessionId, projectPath }: SessionDetailProps) {
  const [session, setSession] = useState<SessionDetailType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionId && projectPath) {
      fetchSessionDetail(sessionId, projectPath)
    } else {
      setSession(null)
      setError(null)
    }
  }, [sessionId, projectPath])

  // 注释掉自动滚动到底部的功能，改为显示在顶部
  // useEffect(() => {
  //   // 自动滚动到最新消息
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }, [session?.messages])

  const fetchSessionDetail = async (sid: string, pPath: string) => {
    try {
      setLoading(true)
      setError(null)

      const encodedSessionId = encodeURIComponent(sid)
      const encodedProjectPath = encodeURIComponent(pPath)
      const response = await fetch(
        `/api/session/${encodedSessionId}?projectPath=${encodedProjectPath}`
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSession(data.session)
      } else {
        setError(data.error || '获取会话详情失败')
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionId || !projectPath) {
    return <NoSessionSelected />
  }

  if (loading) {
    return <SessionDetailSkeleton />
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => fetchSessionDetail(sessionId, projectPath)}
      />
    )
  }

  if (!session) {
    return <SessionNotFound />
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 会话信息头部 */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/60 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 line-clamp-2">
              {session.summary || '会话详情'}
            </h2>
          </div>
          {/* 导出按钮 */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg hover:shadow-xl flex-shrink-0"
            title="导出为 Markdown"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">导出</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/30">
            <span>💬</span>
            <span>{session.messageCount} 条消息</span>
          </span>
          {session.gitBranch && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
              <span>🌿</span>
              <span>{session.gitBranch}</span>
            </span>
          )}
        </div>
        {session.cwd && (
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>📁</span>
            <span className="truncate font-mono" title={session.cwd}>
              {session.cwd}
            </span>
          </div>
        )}
        <div className="mt-2 text-xs text-slate-500/80">
          <span className="inline-flex items-center gap-1.5">
            <span>🕐</span>
            开始: {formatTimestamp(session.startTime)}
          </span>
          {session.endTime && (
            <span className="inline-flex items-center gap-1.5 ml-4">
              <span>🏁</span>
              结束: {formatTimestamp(session.endTime)}
            </span>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto">
          {session.messages.map((message, index) => (
            <MessageItem key={message.uuid || index} message={message} index={index} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 导出预览对话框 */}
      <ExportPreviewModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        session={session}
      />
    </div>
  )
}

// 使用 memo 导出
export default memo(SessionDetailInner)
