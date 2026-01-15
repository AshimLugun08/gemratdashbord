"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext(null)

const STATIC_ADMIN = {
  email: "admin@admin.com",
  password: "admin123",
  user: {
    id: 1,
    name: "Admin User",
    email: "admin@admin.com",
    role: "admin",
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check against static credentials
      if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
        const authToken = "static-admin-token-12345"
        const authUser = STATIC_ADMIN.user

        localStorage.setItem("token", authToken)
        localStorage.setItem("user", JSON.stringify(authUser))

        setToken(authToken)
        setUser(authUser)

        router.push("/admin")
        return { success: true }
      } else {
        return {
          success: false,
          error: "Invalid email or password",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: "Login failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
