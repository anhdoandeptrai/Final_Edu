'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) {
          const stored = localStorage.getItem('user')
          if (stored) {
            try {
              setUser(JSON.parse(stored))
            } catch {
              setUser(null)
              localStorage.removeItem('user')
            }
          } else {
            setUser(null)
          }
          return
        }

        const data = await response.json()
        const nextUser = data?.user as User
        setUser(nextUser)
        localStorage.setItem('user', JSON.stringify(nextUser))
      } catch {
        setUser(null)
      }
    }

    void loadCurrentUser()
  }, [])

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      const nextUser = data?.user as User
      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))

      return true
    } catch {
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      const nextUser = data?.user as User
      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))

      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    void fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
