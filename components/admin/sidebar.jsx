"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, ImageIcon, LogOut, Users, X } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/sliders", label: "Sliders", icon: ImageIcon },
  { href: "/admin/users", label: "Users", icon: Users }, 
]

export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 bg-orange-500 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col">
          {/* HEADER WITH CROSS BUTTON */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-orange-400">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <button 
              onClick={onClose}
              className="rounded-lg p-2 text-white hover:bg-orange-400 lg:hidden transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()} // Auto-close menu on mobile after navigation
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-white text-orange-500 shadow-md" 
                      : "text-white hover:bg-orange-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* LOGOUT */}
          <div className="border-t border-orange-400 p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-400"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}