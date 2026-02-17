"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function RepoUploader() {
  const router = useRouter()

  const [zipFile, setZipFile] = useState<File | null>(null)
  const [githubUrl, setGithubUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!zipFile && !githubUrl) {
      setMessage("Please upload a ZIP file or provide a GitHub URL.")
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()

      if (zipFile) {
        formData.append("zip", zipFile)
      }

      if (githubUrl) {
        formData.append("githubUrl", githubUrl)
      }

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest repository")
      }

      if (data.alreadyIndexed) {
        router.push(`/repos`)
        return
      }

      router.push(`/repos`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-semibold mb-2">
          Add Repository
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Upload a ZIP file or connect a public GitHub repository.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ZIP Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload ZIP
            </label>

            <input
              type="file"
              accept=".zip"
              onChange={(e) =>
                setZipFile(e.target.files?.[0] || null)
              }
              className="w-full border rounded-lg p-3 text-sm file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase">
              Or
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Repository URL
            </label>

            <input
              type="text"
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-sm font-medium transition
              ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }
            `}
          >
            {loading ? "Indexing repository..." : "Add Repository"}
          </button>
        </form>

        {message && (
          <div className="mt-6 text-sm text-center text-red-500">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
