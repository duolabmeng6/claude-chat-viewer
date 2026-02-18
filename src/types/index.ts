// JSONL 消息类型
export type MessageType = 'user' | 'assistant' | 'summary' | 'file-history-snapshot'

// 基础消息接口
export interface BaseMessage {
  type: MessageType
  sessionId: string
  uuid: string
  timestamp: string
  parentUuid?: string | null
  isSidechain?: boolean
  userType?: string
  cwd?: string
  version?: string
  gitBranch?: string
}

// 用户消息
export interface UserMessage extends BaseMessage {
  type: 'user'
  message: {
    role: 'user'
    content: string | Array<{type: string; tool_use_id?: string; content?: any; [key: string]: any}>
  }
  gitBranch: string
  cwd: string
}

// 助手消息
export interface AssistantMessage extends BaseMessage {
  type: 'assistant'
  message: {
    role: 'assistant'
    content: Array<{
      type: string
      thinking?: string
      text?: string
      [key: string]: any
    }>
    model: string
    stop_reason?: string | null
    stop_sequence?: string | null
    usage?: {
      input_tokens: number
      output_tokens: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
    service_tier?: string
  }
}

// 摘要消息
export interface SummaryMessage extends BaseMessage {
  type: 'summary'
  summary: string
  leafUuid: string
}

// 文件历史快照
export interface FileHistorySnapshot extends BaseMessage {
  type: 'file-history-snapshot'
  messageId: string
  snapshot: {
    messageId: string
    trackedFileBackups: Record<string, any>
    timestamp: string
  }
  isSnapshotUpdate: boolean
}

// 消息联合类型
export type Message = UserMessage | AssistantMessage | SummaryMessage | FileHistorySnapshot

// 项目接口
export interface Project {
  name: string           // 显示名称（解码后）
  path: string           // 编码后的路径名
  fullPath: string       // 完整文件系统路径
  sessionCount: number   // 会话数量
  lastModified?: string  // 最后修改时间
}

// 会话接口
export interface Session {
  id: string             // sessionId
  projectId: string      // 所属项目路径
  filePath: string       // JSONL 文件路径
  startTime: string      // 开始时间
  endTime?: string       // 结束时间
  messageCount: number   // 消息数量
  gitBranch?: string     // Git 分支
  cwd?: string           // 工作目录
  summary?: string       // 会话摘要
}

// 会话详情接口
export interface SessionDetail extends Session {
  messages: Array<UserMessage | AssistantMessage>  // 过滤后的用户和助手消息
}
