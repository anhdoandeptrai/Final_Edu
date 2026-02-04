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
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Get existing users
      const usersStr = localStorage.getItem('users') || '[]'
      const users = JSON.parse(usersStr)
      
      // Check if email exists
      if (users.some((u: any) => u.email === email)) {
        return false
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role
      }

      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      // Set current user
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))

      return true
    } catch (e) {
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem('users') || '[]'
      const users = JSON.parse(usersStr)
      
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      )

      if (!foundUser) {
        return false
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))

      return true
    } catch (e) {
      return false
    }
  }

  const logout = () => {
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
