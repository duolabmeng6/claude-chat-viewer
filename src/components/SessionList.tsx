'use client'

import { useState, useEffect, memo } from 'react'
import { Session } from '@/types'
import { getRelativeTime } from '@/lib/date-utils'
import { truncate } from '@/lib/utils'
import { SessionListSkeleton } from '@/components/Skeleton'
import ErrorDisplay from '@/components/ErrorDisplay'
import { NoProjectSelected, NoSessionsFound } from '@/components/EmptyState'

interface SessionListProps {
  projectPath?: string
  onSelectSession: (session: Session) => void
  selectedSessionId?: string
}

// 会话卡片组件 - 使用 memo 优化
const SessionCard = memo(function SessionCard({
  session,
  isSelected,
  onSelect
}: {
  session: Session
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'hover:bg-dark-card text-dark-text'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm opacity-75">
          {getRelativeTime(session.startTime)}
        </span>
        <span className="text-xs opacity-60">
          {session.messageCount} 条消息
        </span>
      </div>

      {session.summary && (
        <div className="text-sm mb-1 truncate">
          {truncate(session.summary, 60)}
        </div>
      )}

      {session.gitBranch && (
        <div className="text-xs opacity-60 mt-1">
          🌿 {session.gitBranch}
        </div>
      )}
    </button>
  )
})

function SessionListInner({ projectPath, onSelectSession, selectedSessionId }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectPath) {
      fetchSessions(projectPath)
    } else {
      setSessions([])
      setError(null)
    }
  }, [projectPath])

  const fetchSessions = async (path: string) => {
    try {
      setLoading(true)
      setError(null)

      const encodedPath = encodeURIComponent(path)
      const response = await fetch(`/api/sessions/${encodedPath}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // 过滤掉消息数为0的会话
        const filteredSessions = data.sessions.filter((session: Session) => session.messageCount > 0)
        setSessions(filteredSessions)
      } else {
        setError(data.error || '获取会话列表失败')
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  if (!projectPath) {
    return <NoProjectSelected />
  }

  if (loading) {
    return <SessionListSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => fetchSessions(projectPath)} />
  }

  if (sessions.length === 0) {
    return <NoSessionsFound />
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-dark-text">会话列表</h2>
        <p className="text-sm text-dark-muted mt-1">共 {sessions.length} 个会话</p>
      </div>

      <div className="p-2">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isSelected={selectedSessionId === session.id}
            onSelect={() => onSelectSession(session)}
          />
        ))}
      </div>
    </div>
  )
}

// 使用 memo 导出
export default memo(SessionListInner)
