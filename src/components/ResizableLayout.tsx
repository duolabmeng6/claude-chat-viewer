'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface ResizableLayoutProps {
  leftPanel: React.ReactNode
  middlePanel: React.ReactNode
  rightPanel: React.ReactNode
}

export default function ResizableLayout({ leftPanel, middlePanel, rightPanel }: ResizableLayoutProps) {
  // 初始宽度设置
  const [leftWidth, setLeftWidth] = useState(256) // w-64 = 256px
  const [middleWidth, setMiddleWidth] = useState(320) // w-80 = 320px

  // 拖拽状态
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingMiddle, setIsDraggingMiddle] = useState(false)

  // 面板折叠状态
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [savedLeftWidth, setSavedLeftWidth] = useState(leftWidth)
  const [savedMiddleWidth, setSavedMiddleWidth] = useState(middleWidth)

  // 拖拽起始位置
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  // 左侧面板拖拽开始
  const handleLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingLeft(true)
    dragStartX.current = e.clientX
    dragStartWidth.current = leftWidth
  }, [leftWidth])

  // 中间面板拖拽开始
  const handleMiddleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingMiddle(true)
    dragStartX.current = e.clientX
    dragStartWidth.current = middleWidth
  }, [middleWidth])

  // 切换面板折叠状态
  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      // 展开：恢复之前保存的宽度
      setLeftWidth(savedLeftWidth)
      setMiddleWidth(savedMiddleWidth)
      setIsCollapsed(false)
    } else {
      // 折叠：保存当前宽度，然后设置为0
      setSavedLeftWidth(leftWidth)
      setSavedMiddleWidth(middleWidth)
      setIsCollapsed(true)
    }
  }, [isCollapsed, leftWidth, middleWidth, savedLeftWidth, savedMiddleWidth])

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const deltaX = e.clientX - dragStartX.current
        const newWidth = Math.max(200, Math.min(600, dragStartWidth.current + deltaX)) // 限制最小200px，最大600px
        setLeftWidth(newWidth)
      } else if (isDraggingMiddle) {
        const deltaX = e.clientX - dragStartX.current
        const newWidth = Math.max(250, Math.min(800, dragStartWidth.current + deltaX)) // 限制最小250px，最大800px
        setMiddleWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingLeft(false)
      setIsDraggingMiddle(false)
    }

    if (isDraggingLeft || isDraggingMiddle) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      // 拖拽时禁用选择文本
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDraggingLeft, isDraggingMiddle])

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text">
      {/* 左侧面板 */}
      {!isCollapsed && (
        <>
          <div style={{ width: leftWidth }} className="flex-shrink-0 border-r border-dark-border bg-dark-card transition-all duration-300">
            {leftPanel}
          </div>

          {/* 左侧拖拽条 */}
          <div
            className={`w-1 flex-shrink-0 cursor-col-resize hover:bg-blue-500 transition-colors ${
              isDraggingLeft ? 'bg-blue-500' : 'bg-dark-border'
            }`}
            onMouseDown={handleLeftMouseDown}
          />
        </>
      )}

      {/* 中间面板 */}
      {!isCollapsed && (
        <>
          <div style={{ width: middleWidth }} className="flex-shrink-0 border-r border-dark-border bg-dark-bg transition-all duration-300">
            {middlePanel}
          </div>
        </>
      )}

      {/* 中间拖拽条 + 折叠按钮 */}
      <div
        className={`relative flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-12' : 'w-1'
        } ${
          isDraggingMiddle && !isCollapsed ? 'bg-blue-500' : 'bg-dark-border'
        } ${
          !isCollapsed ? 'cursor-col-resize hover:bg-blue-500' : ''
        }`}
        onMouseDown={!isCollapsed ? handleMiddleMouseDown : undefined}
      >
        {/* 折叠/展开按钮 */}
        <button
          onClick={toggleCollapse}
          className={`absolute top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-dark-card border border-dark-border rounded-md hover:bg-dark-hover flex items-center justify-center transition-all duration-300 ${
            isCollapsed ? 'left-1/2 -translate-x-1/2' : '-left-4'
          }`}
          title={isCollapsed ? '展开面板' : '折叠面板'}
        >
          <svg
            className="w-5 h-5 text-dark-text transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* 右侧面板 */}
      <div className="flex-1 bg-dark-bg overflow-hidden">
        {rightPanel}
      </div>
    </div>
  )
}
