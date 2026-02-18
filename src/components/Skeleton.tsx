'use client'

import { memo } from 'react'

interface SkeletonProps {
  className?: string
  repeat?: number
}

/**
 * 基础骨架屏组件
 */
function Skeleton({ className = '', repeat = 1 }: SkeletonProps) {
  const items = Array.from({ length: repeat }, (_, i) => i)

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`animate-pulse bg-dark-border rounded ${className}`}
        />
      ))}
    </>
  )
}

/**
 * 项目列表骨架屏
 */
export const ProjectListSkeleton = memo(function ProjectListSkeleton() {
  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" repeat={5} />
      </div>
    </div>
  )
})

/**
 * 会话列表骨架屏
 */
export const SessionListSkeleton = memo(function SessionListSkeleton() {
  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-dark-card">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
})

/**
 * 消息骨架屏
 */
export const MessageSkeleton = memo(function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-3xl rounded-lg p-4 ${i % 2 === 0 ? 'bg-blue-600' : 'bg-dark-card'}`}>
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
})

/**
 * 会话详情骨架屏
 */
export const SessionDetailSkeleton = memo(function SessionDetailSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* 头部骨架 */}
      <div className="p-4 border-b border-dark-border">
        <Skeleton className="h-6 w-48 mb-2" />
        <div className="flex gap-4 mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
      {/* 消息骨架 */}
      <div className="flex-1 overflow-hidden">
        <MessageSkeleton />
      </div>
    </div>
  )
})

export default Skeleton
