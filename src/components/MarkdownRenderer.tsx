'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { memo } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Markdown 渲染器组件
 * 支持：
 * - GitHub 风格的 Markdown (GFM)
 * - 代码语法高亮
 * - HTML 标签（自动过滤未知标签）
 * - 表格、列表、任务列表等
 */
const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = ''
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        // 过滤掉未知的 HTML 标签，避免 React 报错
        allowElement={(element) => {
          // 允许所有标准 HTML 标签
          const standardTags = new Set([
            'a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio',
            'b', 'bdi', 'bdo', 'big', 'blockquote', 'br', 'button', 'body',
            'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
            'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt',
            'em', 'embed',
            'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
            'i', 'iframe', 'img', 'input', 'ins',
            'kbd',
            'label', 'legend', 'li', 'link',
            'main', 'map', 'mark', 'menu', 'menuitem', 'meter', 'meta',
            'nav', 'noscript',
            'object', 'ol', 'optgroup', 'option', 'output',
            'p', 'param', 'picture', 'pre', 'progress',
            'q',
            'rp', 'rt', 'ruby',
            's', 'samp', 'script', 'search', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup',
            'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt',
            'u', 'ul',
            'var', 'video',
            'wbr'
          ])

          // 如果元素类型不在标准标签列表中，过滤掉
          if (!standardTags.has(element.tagName.toLowerCase())) {
            return false
          }

          return true
        }}
        components={{
        // 自定义代码块渲染
        code({ node, inline, className: codeClassName, children, ...props }: any) {
          const match = /language-(\w+)/.exec(codeClassName || '')
          const language = match ? match[1] : ''

          // 如果是内联代码（没有语言标记且在段落中）
          if (inline || !language) {
            return (
              <code
                className="px-1.5 py-0.5 bg-gray-800/80 text-pink-400 rounded text-sm font-mono border border-gray-700"
                {...props}
              >
                {children}
              </code>
            )
          }

          // 代码块
          return (
            <div className="relative group my-3">
              {/* 语言标签 */}
              {language && (
                <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 bg-gray-800 rounded-bl border-l border-b border-gray-700 font-mono">
                  {language}
                </div>
              )}
              <pre className={`!bg-gray-900 !p-4 rounded-lg border border-gray-700 overflow-x-auto ${codeClassName}`}>
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          )
        },
        // 自定义链接渲染
        a({ node, children, href, ...props }: any) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
              {...props}
            >
              {children}
            </a>
          )
        },
        // 自定义表格渲染
        table({ node, children, ...props }: any) {
          return (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden" {...props}>
                {children}
              </table>
            </div>
          )
        },
        // 自定义表格头
        th({ node, children, ...props }: any) {
          return (
            <th className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-left font-semibold" {...props}>
              {children}
            </th>
          )
        },
        // 自定义表格单元格
        td({ node, children, ...props }: any) {
          return (
            <td className="px-4 py-2 border-b border-gray-700/50" {...props}>
              {children}
            </td>
          )
        },
        // 自定义列表
        ul({ node, children, ...props }: any) {
          return (
            <ul className="list-disc list-inside my-2 space-y-1 pl-4" {...props}>
              {children}
            </ul>
          )
        },
        ol({ node, children, ...props }: any) {
          return (
            <ol className="list-decimal list-inside my-2 space-y-1 pl-4" {...props}>
              {children}
            </ol>
          )
        },
        // 自定义引用块
        blockquote({ node, children, ...props }: any) {
          return (
            <blockquote className="my-3 pl-4 border-l-4 border-gray-600 text-gray-400 italic" {...props}>
              {children}
            </blockquote>
          )
        },
        // 自定义标题
        h1({ node, children, ...props }: any) {
          return <h1 className="text-2xl font-bold my-3" {...props}>{children}</h1>
        },
        h2({ node, children, ...props }: any) {
          return <h2 className="text-xl font-bold my-3" {...props}>{children}</h2>
        },
        h3({ node, children, ...props }: any) {
          return <h3 className="text-lg font-bold my-2" {...props}>{children}</h3>
        },
        h4({ node, children, ...props }: any) {
          return <h4 className="text-base font-bold my-2" {...props}>{children}</h4>
        },
        // 自定义段落
        p({ node, children, ...props }: any) {
          return <p className="my-2 leading-relaxed" {...props}>{children}</p>
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
})

export default MarkdownRenderer
