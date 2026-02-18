import fs from 'fs'
import path from 'path'
import os from 'os'
import { Project, Session, SessionDetail } from '@/types'
import {
  parseJSONL,
  extractSessionMetadata,
  filterMessages,
  getSessionSummary,
  decodeProjectPath,
  extractSessionId,
} from './jsonl-parser'

/**
 * 获取 Claude Code 项目根目录
 */
function getClaudeProjectsRoot(): string {
  return path.join(os.homedir(), '.claude', 'projects')
}

/**
 * 获取所有项目列表
 * @returns 项目数组
 */
export function getAllProjects(): Project[] {
  const projectsRoot = getClaudeProjectsRoot()

  if (!fs.existsSync(projectsRoot)) {
    return []
  }

  const projects: Project[] = []
  const entries = fs.readdirSync(projectsRoot, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const encodedPath = entry.name
    const projectPath = path.join(projectsRoot, encodedPath)

    try {
      const files = fs.readdirSync(projectPath)
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

      let lastModified: string | undefined
      if (jsonlFiles.length > 0) {
        const stats = fs.statSync(path.join(projectPath, jsonlFiles[0]))
        lastModified = stats.mtime.toISOString()
      }

      projects.push({
        name: decodeProjectPath(encodedPath),
        path: encodedPath,
        fullPath: projectPath,
        sessionCount: jsonlFiles.length,
        lastModified,
      })
    } catch {
      // 跳过无法读取的项目
    }
  }

  // 按最后修改时间排序
  projects.sort((a, b) => {
    if (!a.lastModified || !b.lastModified) return 0
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  })

  return projects
}

/**
 * 获取某个项目的所有会话
 * @param projectPath 项目路径（编码后的）
 * @returns 会话数组
 */
export function getProjectSessions(projectPath: string): Session[] {
  const projectsRoot = getClaudeProjectsRoot()
  const fullPath = path.join(projectsRoot, projectPath)

  if (!fs.existsSync(fullPath)) {
    return []
  }

  const sessions: Session[] = []
  const files = fs.readdirSync(fullPath)
  const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

  for (const file of jsonlFiles) {
    const filePath = path.join(fullPath, file)
    const sessionId = extractSessionId(filePath)

    try {
      const messages = parseJSONL(filePath)
      const metadata = extractSessionMetadata(messages)
      const summary = getSessionSummary(messages)

      sessions.push({
        id: sessionId,
        projectId: projectPath,
        filePath,
        startTime: metadata.startTime,
        endTime: metadata.endTime,
        messageCount: metadata.messageCount,
        gitBranch: metadata.gitBranch,
        cwd: metadata.cwd,
        summary,
      })
    } catch {
      // 跳过无法解析的会话
    }
  }

  // 按开始时间倒序排序
  sessions.sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  })

  return sessions
}

/**
 * 获取单个会话的详细信息
 * @param sessionId 会话 ID
 * @param projectPath 项目路径
 * @returns 会话详情，不存在时返回 null
 */
export function getSessionDetail(sessionId: string, projectPath: string): SessionDetail | null {
  const projectsRoot = getClaudeProjectsRoot()
  const filePath = path.join(projectsRoot, projectPath, `${sessionId}.jsonl`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const messages = parseJSONL(filePath)
    const metadata = extractSessionMetadata(messages)
    const summary = getSessionSummary(messages)
    const filteredMessages = filterMessages(messages)

    return {
      id: sessionId,
      projectId: projectPath,
      filePath,
      startTime: metadata.startTime,
      endTime: metadata.endTime,
      messageCount: filteredMessages.length,
      gitBranch: metadata.gitBranch,
      cwd: metadata.cwd,
      summary,
      messages: filteredMessages,
    }
  } catch {
    return null
  }
}
