'use client'

import { useState, useEffect, memo } from 'react'
import { Project } from '@/types'
import { ProjectListSkeleton } from '@/components/Skeleton'
import ErrorDisplay from '@/components/ErrorDisplay'
import { NoProjectsFound } from '@/components/EmptyState'

interface ProjectListProps {
  onSelectProject: (project: Project) => void
  selectedProjectPath?: string
}

// 项目卡片组件 - 使用 memo 优化
const ProjectCard = memo(function ProjectCard({
  project,
  isSelected,
  onSelect
}: {
  project: Project
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'hover:bg-dark-card text-dark-text'
      }`}
    >
      <div className="font-medium truncate">{project.name}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm opacity-75">
          {project.sessionCount} 个会话
        </span>
      </div>
    </button>
  )
})

function ProjectListInner({ onSelectProject, selectedProjectPath }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // 过滤掉会话数为0的项目
        const filteredProjects = data.projects.filter((project: Project) => project.sessionCount > 0)
        setProjects(filteredProjects)
      } else {
        setError(data.error || '获取项目列表失败')
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ProjectListSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchProjects} />
  }

  if (projects.length === 0) {
    return <NoProjectsFound />
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-dark-text">项目列表</h2>
        <p className="text-sm text-dark-muted mt-1">共 {projects.length} 个项目</p>
      </div>

      <div className="p-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.path}
            project={project}
            isSelected={selectedProjectPath === project.path}
            onSelect={() => onSelectProject(project)}
          />
        ))}
      </div>
    </div>
  )
}

// 使用 memo 导出
export default memo(ProjectListInner)
