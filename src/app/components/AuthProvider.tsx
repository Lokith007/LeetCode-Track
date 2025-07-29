"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = localStorage.getItem("isAuthenticated")
    const email = localStorage.getItem("userEmail")
    
    if (authStatus === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated and not already on login page
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login")
      }
      // Redirect to dashboard if authenticated and on login page
      else if (isAuthenticated && pathname === "/login") {
        router.push("/")
      }
    }
  }, [isAuthenticated, pathname, isLoading, router])

  const login = (email: string) => {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userEmail", email)
    setIsAuthenticated(true)
    setUserEmail(email)
  }

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    setIsAuthenticated(false)
    setUserEmail(null)
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 