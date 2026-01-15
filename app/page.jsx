"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, isAdmin, loading, user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      router.push("/admin")
    }
  }, [loading, isAuthenticated, isAdmin, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500">
          <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">E-Commerce Store</h1>
        <p className="mt-2 text-gray-500">Welcome to our online store</p>

        {isAuthenticated ? (
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">
              Logged in as <span className="font-medium">{user?.name || user?.email}</span>
            </p>
            {!isAdmin && (
              <p className="text-sm text-gray-500">
                You do not have admin access. Contact an administrator for access.
              </p>
            )}
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <Link href="/login">
              <Button className="bg-orange-500 hover:bg-orange-600">Admin Login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
