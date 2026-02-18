'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Project, Session } from '@/types'
import ProjectList from '@/components/ProjectList'
import SessionList from '@/components/SessionList'
import SessionDetail from '@/components/SessionDetail'
import ErrorBoundary from '@/components/ErrorBoundary'
import ResizableLayout from '@/components/ResizableLayout'

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 从 URL 参数初始化状态
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // 从 URL 恢复选中的项目和会话
  useEffect(() => {
    const projectPathFromUrl = searchParams.get('project')
    const sessionIdFromUrl = searchParams.get('session')

    // 如果 URL 中有项目路径，设置选中的项目
    if (projectPathFromUrl && (!selectedProject || selectedProject.path !== projectPathFromUrl)) {
      setSelectedProject({
        name: decodeURIComponent(projectPathFromUrl.split('/').pop() || ''),
        path: projectPathFromUrl,
        fullPath: decodeURIComponent(projectPathFromUrl),
        sessionCount: 0 // 这个值会在 ProjectList 中更新
      })
    }

    // 如果 URL 中有会话 ID，设置选中的会话
    if (sessionIdFromUrl && projectPathFromUrl && (!selectedSession || selectedSession.id !== sessionIdFromUrl)) {
      setSelectedSession({
        id: sessionIdFromUrl,
        projectId: projectPathFromUrl,
        filePath: '', // 这个值会在 SessionList 中更新
        startTime: '', // 这个值会在 SessionList 中更新
        messageCount: 0 // 这个值会在 SessionList 中更新
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]) // 只在 searchParams 变化时运行，避免无限循环

  // 更新 URL 参数
  const updateUrl = useCallback((projectPath?: string, sessionId?: string) => {
    const params = new URLSearchParams()

    if (projectPath) {
      params.set('project', projectPath)
    }
    if (sessionId) {
      params.set('session', sessionId)
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [pathname, router])

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project)
    setSelectedSession(null) // 切换项目时清空选中的会话
    updateUrl(project.path, undefined)
  }, [updateUrl])

  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session)
    if (selectedProject) {
      updateUrl(selectedProject.path, session.id)
    }
  }, [selectedProject, updateUrl])

  const leftPanel = (
    <ErrorBoundary>
      <ProjectList
        onSelectProject={handleSelectProject}
        selectedProjectPath={selectedProject?.path}
      />
    </ErrorBoundary>
  )

  const middlePanel = (
    <ErrorBoundary>
      <SessionList
        projectPath={selectedProject?.path}
        onSelectSession={handleSelectSession}
        selectedSessionId={selectedSession?.id}
      />
    </ErrorBoundary>
  )

  const rightPanel = (
    <ErrorBoundary>
      <SessionDetail
        sessionId={selectedSession?.id}
        projectPath={selectedProject?.path}
      />
    </ErrorBoundary>
  )

  return (
    <ResizableLayout
      leftPanel={leftPanel}
      middlePanel={middlePanel}
      rightPanel={rightPanel}
    />
  )
}
