"use client"

import { useEffect, useState } from "react"

/* ✅ Move outside component */
function StatusBadge({ state }: { state: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        state === "ok"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {state.toUpperCase()}
    </span>
  )
}

export default function HealthPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then(setStatus)
  }, [])

  if (!status) {
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center">
        Checking system health...
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-58px)] h-full w-full flex flex-col items-center justify-start p-10">
      <h1 className="text-2xl font-semibold mb-8">
        System Status
      </h1>

      <div className="space-y-6 max-w-md">

        <div className="flex justify-between items-center border p-4 rounded-lg">
          <span>Backend API</span>
          <StatusBadge state={status.backend} />
        </div>

        <div className="flex justify-between items-center border p-4 rounded-lg">
          <span>Database (Supabase)</span>
          <StatusBadge state={status.database} />
        </div>

        <div className="flex justify-between items-center border p-4 rounded-lg">
          <span>LLM (Gemini)</span>
          <StatusBadge state={status.llm} />
        </div>

      </div>
    </div>
  )
}
