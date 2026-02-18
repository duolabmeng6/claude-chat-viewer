'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * 空状态组件
 * 用于在没有数据时显示友好的提示
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-dark-text mb-2">{title}</h3>
      {description && (
        <p className="text-dark-muted text-center max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * 预设的空状态组件
 */
export function NoProjectSelected() {
  return (
    <EmptyState
      icon="📁"
      title="请选择一个项目"
      description="从左侧列表中选择一个项目来查看会话记录"
    />
  )
}

export function NoSessionSelected() {
  return (
    <EmptyState
      icon="💬"
      title="请选择一个会话"
      description="从中间列表中选择一个会话来查看详细内容"
    />
  )
}

export function NoProjectsFound() {
  return (
    <EmptyState
      icon="📂"
      title="没有找到任何项目"
      description="请确保 Claude Code 配置目录中有会话记录"
    />
  )
}

export function NoSessionsFound() {
  return (
    <EmptyState
      icon="💭"
      title="该项目没有会话记录"
      description="此项目还没有任何聊天会话"
    />
  )
}

export function SessionNotFound() {
  return (
    <EmptyState
      icon="🔍"
      title="会话不存在"
      description="该会话可能已被删除或移动"
    />
  )
}
