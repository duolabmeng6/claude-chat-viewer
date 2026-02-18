import type { Metadata } from 'next'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'Claude Code Chat Viewer',
  description: '查看 Claude Code 聊天记录',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
