import { memo, useCallback, useRef, type ComponentType, type ReactNode } from 'react'

/**
 * 为列表项组件创建优化版本的 HOC
 * 自动应用 memo 并添加 key 支持
 */
export function createOptimizedComponent<P extends object>(
  Component: ComponentType<P>,
  arePropsEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, arePropsEqual)
}

/**
 * 事件处理器防抖
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

/**
 * 事件处理器节流
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef(0)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      }
    },
    [callback, delay]
  )
}

/**
 * 虚拟滚动辅助函数 - 计算可见项目范围
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  buffer: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + buffer * 2)

  return { start, end }
}
