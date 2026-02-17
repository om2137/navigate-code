"use client"

import { useEffect, useRef, useState } from "react"
import MarkdownRenderer from "./MarkdownRenderer"
import AskPanel from "./ChatPanel"

type QA = {
  question: string
  answer: string
  answer_references?: {
    filePath: string
    startLine: number
    endLine: number
  }[]
  created_at?: string
}


export default function ChatPanel({
  repoId,
}: {
  repoId: string
}) {
  const [history, setHistory] = useState<QA[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  async function loadHistory() {
    const res = await fetch(`/api/history?repoId=${repoId}`)
    const data = await res.json()
    console.log(data)
    setHistory((data.history || []).reverse())
  }

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId])

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [history])

  function handleNewMessage(newQA: QA) {
    setHistory((prev) => [...prev, newQA])
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-6"
      >
        {history.map((item, index) => (
          <div key={index} className="space-y-3">
            {/* User */}
            <div className="flex justify-end">
              <div
                className="
                  bg-gray-800 text-white
                  px-4 py-2
                  rounded-2xl
                  max-w-[90%] sm:max-w-[70%]
                  text-sm sm:text-base
                  whitespace-pre-wrap
                  wrap-break-word
                "
              >
                {item.question}
              </div>
            </div>

            {/* Assistant */}
            <div className="flex justify-start">
              <div className="bg-gray-200 text-black px-4 py-3 rounded-2xl max-w-[85%]">

                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={item.answer} />
                </div>

                {/* References */}
                {item.answer_references?.length && item.answer_references?.length > 0 && (
                  <div className="mt-4 border-t pt-3 text-xs text-gray-600">
                    <div className="font-medium mb-2">Sources/References in repo</div>

                    <div className="flex flex-wrap gap-2">
                      {item.answer_references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                        >
                           {ref.filePath}{" "}
                           <span className="font-semibold">Line:</span>{ref.startLine}-{ref.endLine}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Input */}
      <div className=" px-3 sm:px-6 py-3 bg-white">
        <AskPanel
          repoId={repoId}
          onNewMessage={handleNewMessage}
        />
      </div>
    </div>
  )
}
