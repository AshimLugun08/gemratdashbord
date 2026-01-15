"use client"

import { useState } from "react"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminNavbar } from "@/components/admin/navbar"

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        {/* SIDEBAR: Controls its own sliding via 'isOpen' */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* NAVBAR: Provides the button to open the sidebar */}
        <AdminNavbar 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        {/* MAIN CONTENT: Margin shifts only on large screens (lg) */}
        <main className="transition-all duration-300 lg:ml-64 min-h-screen pt-16">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  )
}