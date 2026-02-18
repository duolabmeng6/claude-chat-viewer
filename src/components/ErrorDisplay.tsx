'use client'

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

/**
 * 错误显示组件
 * 用于统一展示错误信息和重试按钮
 */
export default function ErrorDisplay({
  message,
  onRetry,
  retryLabel = '重试'
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-md w-full bg-dark-card rounded-lg p-6 border border-red-900/50">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-dark-text mb-2">加载失败</h3>
          <p className="text-dark-muted mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 网络错误组件
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      message="网络请求失败，请检查网络连接后重试"
      onRetry={onRetry}
    />
  )
}

/**
 * 服务器错误组件
 */
export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      message="服务器出现错误，请稍后重试"
      onRetry={onRetry}
    />
  )
}

/**
 * 未授权错误组件
 */
export function UnauthorizedError() {
  return (
    <ErrorDisplay
      message="没有权限访问此资源"
    />
  )
}
