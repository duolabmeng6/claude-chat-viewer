'use client'

import { Component, ReactNode } from 'react'

/**
 * 组件类型枚举，用于提供不同的降级 UI
 */
export enum ComponentType {
  DEFAULT = 'default',
  MESSAGE = 'message',      // 消息组件
  SIDEBAR = 'sidebar',      // 侧边栏组件
  INPUT = 'input',          // 输入组件
  LIST = 'list',            // 列表组件
  MODAL = 'modal',          // 弹窗组件
}

interface Props {
  children: ReactNode
  /** 自定义降级 UI */
  fallback?: ReactNode
  /** 组件类型，用于选择合适的降级 UI */
  componentType?: ComponentType
  /** 组件名称，用于错误日志 */
  componentName?: string
  /** 错误恢复回调 */
  onReset?: () => void
  /** 是否显示详细错误信息（开发模式） */
  showErrorDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

/**
 * 判断是否为开发环境
 */
const isDev = process.env.NODE_ENV === 'development'

/**
 * 增强版错误边界组件
 *
 * 功能特性：
 * 1. 局部错误隔离 - 只影响出错组件，不崩溃整个页面
 * 2. 降级 UI - 为不同类型组件提供友好的降级界面
 * 3. 详细错误信息 - 开发环境显示堆栈，生产环境简化
 * 4. 错误恢复 - 提供重试和重置功能
 * 5. 错误上报 - 完整的 console.error 日志
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName } = this.props

    // 错误上报日志
    console.error('🚨 ErrorBoundary 捕获到错误:', {
      组件名称: componentName || '未命名组件',
      错误信息: error.message,
      错误堆栈: error.stack,
      组件堆栈: errorInfo.componentStack,
      重试次数: this.state.retryCount,
      时间戳: new Date().toISOString(),
    })

    this.setState({ errorInfo })

    // 可扩展：在这里添加错误上报到监控服务的逻辑
    // reportErrorToService(error, errorInfo, componentName)
  }

  /**
   * 重置错误状态并尝试恢复
   */
  handleReset = () => {
    const { onReset } = this.props

    console.log('🔄 尝试重置错误边界:', {
      组件名称: this.props.componentName || '未命名组件',
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    })

    onReset?.()
  }

  /**
   * 重试渲染（保留错误状态但尝试重新渲染）
   */
  handleRetry = () => {
    const { onReset } = this.props
    const newRetryCount = this.state.retryCount + 1

    console.log('🔁 尝试重新渲染组件:', {
      组件名称: this.props.componentName || '未命名组件',
      重试次数: newRetryCount,
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
    })

    onReset?.()
  }

  /**
   * 根据组件类型渲染不同的降级 UI
   */
  renderFallbackUI() {
    const { fallback, componentType = ComponentType.DEFAULT, showErrorDetails = isDev } = this.props
    const { error, errorInfo, retryCount } = this.state

    // 如果提供了自定义 fallback，优先使用
    if (fallback) {
      return fallback
    }

    // 根据组件类型返回不同的降级 UI
    switch (componentType) {
      case ComponentType.MESSAGE:
        return this.renderMessageFallback()
      case ComponentType.SIDEBAR:
        return this.renderSidebarFallback()
      case ComponentType.INPUT:
        return this.renderInputFallback()
      case ComponentType.LIST:
        return this.renderListFallback()
      case ComponentType.MODAL:
        return this.renderModalFallback()
      default:
        return this.renderDefaultFallback()
    }
  }

  /**
   * 默认降级 UI
   */
  renderDefaultFallback() {
    const { error, retryCount } = this.state
    const { showErrorDetails = isDev } = this.props

    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-dark-bg rounded-lg border border-dark-border">
        <div className="max-w-md w-full text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-dark-text mb-2">
            组件加载失败
          </h3>
          <p className="text-sm text-dark-muted mb-4">
            该组件遇到了问题，可以尝试重试或刷新页面
          </p>

          {/* 错误详情（开发环境显示完整堆栈） */}
          {error && showErrorDetails && (
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-sm text-dark-muted hover:text-dark-text transition-colors">
                查看错误详情
              </summary>
              <div className="mt-2 p-3 bg-dark-card rounded border border-dark-border">
                <p className="text-xs text-red-400 font-mono mb-2">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-dark-muted overflow-auto max-h-40 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              重试 {retryCount > 0 && `(${retryCount})`}
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-dark-border text-dark-text text-sm rounded hover:bg-dark-muted transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>
    )
  }

  /**
   * 消息组件降级 UI
   */
  renderMessageFallback() {
    return (
      <div className="flex items-center justify-center p-4 bg-red-900/10 border border-red-900/20 rounded-lg">
        <span className="text-sm text-red-400">⚠️ 消息加载失败</span>
        <button
          onClick={this.handleRetry}
          className="ml-3 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  /**
   * 侧边栏降级 UI
   */
  renderSidebarFallback() {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-dark-card">
        <span className="text-2xl mb-2">📂</span>
        <p className="text-xs text-dark-muted text-center mb-3">侧边栏加载失败</p>
        <button
          onClick={this.handleRetry}
          className="px-3 py-1 text-xs bg-dark-border text-dark-text rounded hover:bg-dark-muted transition-colors"
        >
          重新加载
        </button>
      </div>
    )
  }

  /**
   * 输入组件降级 UI
   */
  renderInputFallback() {
    return (
      <div className="flex items-center gap-2 p-3 bg-dark-card border border-red-900/20 rounded-lg">
        <span className="text-red-400">⚠️</span>
        <span className="text-sm text-dark-muted flex-1">输入组件异常</span>
        <button
          onClick={this.handleRetry}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  /**
   * 列表组件降级 UI
   */
  renderListFallback() {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-dark-bg border border-dark-border rounded-lg">
        <span className="text-2xl mb-2">📋</span>
        <p className="text-sm text-dark-muted mb-3">列表加载失败</p>
        <button
          onClick={this.handleRetry}
          className="px-4 py-2 text-sm bg-dark-border text-dark-text rounded hover:bg-dark-muted transition-colors"
        >
          重新加载
        </button>
      </div>
    )
  }

  /**
   * 弹窗组件降级 UI
   */
  renderModalFallback() {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-sm">
          <div className="text-center">
            <span className="text-3xl mb-3 block">⚠️</span>
            <h3 className="text-lg font-semibold text-dark-text mb-2">弹窗加载失败</h3>
            <p className="text-sm text-dark-muted mb-4">弹窗组件遇到问题</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm bg-dark-border text-dark-text rounded hover:bg-dark-muted transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI()
    }

    return this.props.children
  }
}

/**
 * 高阶组件：为函数组件添加错误边界
 *
 * 使用示例：
 * ```tsx
 * const SafeMessageList = withErrorBoundary(MessageList, {
 *   componentType: ComponentType.LIST,
 *   componentName: 'MessageList',
 * })
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function SafeComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
