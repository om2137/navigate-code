"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { Components } from "react-markdown"

export default function MarkdownRenderer({
  content,
}: {
  content: string
}) {
  const components: Components = {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || "")

      if (match) {
        return (
          <SyntaxHighlighter
            language={match[1]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={oneDark as any}
            PreTag="div"
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        )
      }

      return (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
          {children}
        </code>
      )
    },
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
