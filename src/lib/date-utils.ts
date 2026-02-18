/**
 * 日期时间格式化工具（客户端安全）
 */

/**
 * 格式化时间戳为可读字符串
 * @param timestamp ISO 时间戳
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return timestamp
  }
}

/**
 * 获取相对时间描述
 * @param timestamp ISO 时间戳
 * @returns 相对时间描述（如 "2小时前"）
 */
export function getRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    return formatTimestamp(timestamp)
  } catch {
    return timestamp
  }
}
