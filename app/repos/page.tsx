"use client"

import { useState } from "react"
import HistoryPanel from "@/components/chat/ChatHistory"
import RepoSidebar from "@/components/chat/RepoSidebar"

export default function Home() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex h-[calc(100vh-58px)] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden sm:flex w-80 bg-gray-100  flex-col">
        <RepoSidebar
          selectedRepo={selectedRepo}
          onSelectRepo={(id) => {
            setSelectedRepo(id)
          }}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed top-14.5 left-0 h-[calc(100vh-58px)] w-72 bg-white  z-50 transform transition-transform duration-300 sm:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <RepoSidebar
          selectedRepo={selectedRepo}
          onSelectRepo={(id) => {
            setSelectedRepo(id)
            setSidebarOpen(false)
          }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header Bar */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700"
          >
            ☰
          </button>

          <div className="text-sm font-medium">
            {selectedRepo ? "Chat" : "Select Repository"}
          </div>

          <div className="w-6" />
        </div>

        {/* Chat Area */}
        {selectedRepo ? (
          <div className="flex-1 overflow-hidden">
            <HistoryPanel repoId={selectedRepo} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm px-6 text-center">
            Select a repository to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
