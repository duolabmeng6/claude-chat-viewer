import fs from 'fs'
import path from 'path'
import { Message, UserMessage, AssistantMessage } from '@/types'

/**
 * 解析单个 JSONL 文件
 * @param filePath JSONL 文件路径
 * @returns 解析后的消息数组
 */
export function parseJSONL(filePath: string): Message[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.trim().split('\n')

    const messages: Message[] = []
    for (const line of lines) {
      if (!line.trim()) continue

      try {
        const message = JSON.parse(line) as Message
        messages.push(message)
      } catch {
        // 跳过无法解析的行
      }
    }

    return messages
  } catch {
    return []
  }
}

/**
 * 提取会话元数据
 * @param messages 消息数组
 * @returns 会话基本信息
 */
export function extractSessionMetadata(messages: Message[]): {
  startTime: string
  endTime?: string
  messageCount: number
  gitBranch?: string
  cwd?: string
} {
  const userMessages = messages.filter(m => m.type === 'user') as UserMessage[]

  if (userMessages.length === 0) {
    return {
      startTime: new Date().toISOString(),
      messageCount: 0,
      gitBranch: undefined,
      cwd: undefined,
    }
  }

  const firstMessage = userMessages[0]
  const lastMessage = userMessages[userMessages.length - 1]

  return {
    startTime: firstMessage.timestamp,
    endTime: lastMessage.timestamp,
    messageCount: userMessages.length,
    gitBranch: firstMessage.gitBranch,
    cwd: firstMessage.cwd,
  }
}

/**
 * 过滤并格式化消息（仅返回用户和助手消息）
 * @param messages 原始消息数组
 * @returns 过滤后的消息数组
 */
export function filterMessages(messages: Message[]): Array<UserMessage | AssistantMessage> {
  return messages.filter(
    (m): m is UserMessage | AssistantMessage =>
      m.type === 'user' || m.type === 'assistant'
  )
}

/**
 * 获取会话摘要
 * @param messages 消息数组
 * @returns 摘要文本
 */
export function getSessionSummary(messages: Message[]): string | undefined {
  const summary = messages.find(m => m.type === 'summary')
  return summary && 'summary' in summary ? summary.summary : undefined
}

/**
 * 解码项目路径名称
 * Claude Code 将路径中的 "/" 替换为 "-" 进行编码
 * @param encodedPath 编码后的路径（如 "-Users-ll-Desktop-2025-project"）
 * @returns 解码后的路径（如 "/Users/ll/Desktop/2025/project"）
 */
export function decodeProjectPath(encodedPath: string): string {
  const decoded = encodedPath.startsWith('-') ? encodedPath.substring(1) : encodedPath
  return '/' + decoded.replace(/-/g, '/')
}

/**
 * 从文件路径提取 sessionId
 * @param filePath JSONL 文件路径
 * @returns sessionId（不含扩展名的文件名）
 */
export function extractSessionId(filePath: string): string {
  return path.basename(filePath, '.jsonl')
}
