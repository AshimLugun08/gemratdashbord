"use client"

import { useAuth } from "@/context/auth-context"
import { User, Menu } from "lucide-react"

export function AdminNavbar({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="fixed left-0 lg:left-64 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        
        {/* LEFT: Menu Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
        </div>

        {/* RIGHT: User Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 md:px-4 md:py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
              <User className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="hidden flex-col leading-none md:flex">
              <span className="text-sm font-bold text-gray-700">
                {user?.name || "Admin"}
              </span>
              <span className="text-[10px] font-bold uppercase text-orange-600">
                {user?.role || "Staff"}
              </span>
            </div>
            {/* Mobile-only badge */}
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-medium text-white md:hidden">
              {user?.role || "Staff"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}