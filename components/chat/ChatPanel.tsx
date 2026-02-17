"use client"

import { useState } from "react"
import { toast } from "sonner"

type Props = {
    repoId: string
    onNewMessage: (qa: { question: string; answer: string }) => void
}

export default function AskPanel({ repoId, onNewMessage }: Props) {
    const [question, setQuestion] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleAsk() {
        if (!question.trim()) {
            toast.warning("Please enter a question before asking.")
            return
        }

        const currentQuestion = question
        setQuestion("")
        setLoading(true)
        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoId, question: currentQuestion }),
            })

            const data = await res.json()

            setLoading(false)

            if (data.answer) {
                onNewMessage({
                    question: currentQuestion,
                    answer: data.answer,
                })
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center">
            <textarea
                value={question}
                onChange={(e) => {
                    setQuestion(e.target.value)
                    const textarea = e.target
                    textarea.style.height = "auto"
                    textarea.style.height =
                        Math.min(textarea.scrollHeight, 4 * 12) + "px"
                }}
                placeholder="Ask about the codebase..."
                className="flex-1 border rounded-xl p-3 resize-none overflow-y-auto"
                rows={1}
            />

            <div>
                <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="mx-2 px-4 py-2 bg-black text-white rounded-full cursor-pointer"
                >
                    {loading ? "Thinking..." : "Ask"}
                </button>
            </div>
        </div>
    )
}
