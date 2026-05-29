"use client"

import { useState } from "react"
import { Search, Bell, User } from "lucide-react"

interface NavbarProps {
  onSearch: (term: string) => void
  mentorName?: string
  mentorInitial?: string
  notificationCount?: number
}

export default function Navbar({
  onSearch,
  mentorName = "Rodrigo Paes",
  mentorInitial = "RP",
  notificationCount = 0,
}: NavbarProps) {
  const [searchInput, setSearchInput] = useState("")

  const handleSearch = (value: string) => {
    setSearchInput(value)
    onSearch(value)
  }

  return (
    <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              Ω
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-white">S.O. MENTORIA</h1>
              <p className="text-xs text-slate-400">MENTOR: {mentorName}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar Mentorado..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-400 hover:text-blue-400 transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 transition-shadow">
              {mentorInitial}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
