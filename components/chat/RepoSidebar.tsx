"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type Repo = {
    id: string
    owner: string
    name: string
    branch: string
}

type Props = {
    selectedRepo: string | null
    onSelectRepo: (repoId: string) => void
}

export default function RepoSidebar({
    selectedRepo,
    onSelectRepo,
}: Props) {
    const [repos, setRepos] = useState<Repo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadRepos() {
            try {
                const res = await fetch("/api/repos")
                const data = await res.json()
                setRepos(data.repos || [])
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                console.error("Failed to load repos")
            } finally {
                setLoading(false)
            }
        }

        loadRepos()
    }, [])

    return (
        <div className="flex flex-col h-full  ">
            {/* Header */}
            <div className="sticky top-0  z-10 p-4 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                        Repositories
                    </h2>

                    <Link
                        href="/upload"
                        className="text-xs font-medium px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-800 transition"
                    >
                        Upload
                    </Link>
                </div>
            </div>

            {/* Repo List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                
                {loading && (
                    <div className="text-sm text-gray-400">
                        Loading repositories...
                    </div>
                )}

                {!loading && repos.length === 0 && (
                    <div className="text-sm text-gray-400">
                        No repositories Uploaded yet.
                    </div>
                )}

                {!loading &&

                    repos.map((repo) => {
                        const isActive = selectedRepo === repo.id

                        return (
                            <button
                                key={repo.id}
                                onClick={() => onSelectRepo(repo.id)}
                                className={`w-full text-left p-3 rounded-lg transition group
                  ${isActive
                                        ? "bg-gray-800 text-white shadow-sm"
                                        : "bg-gray-50 hover:bg-gray-100"
                                    }
                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm truncate">
                                        {repo.owner}/{repo.name}
                                    </div>

                                    {isActive && (
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                    )}
                                </div>

                                <div
                                    className={`text-xs mt-1 ${isActive
                                            ? "text-gray-300"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {repo.branch}
                                </div>
                            </button>
                        )
                    })}
            </div>
        </div>
    )
}
