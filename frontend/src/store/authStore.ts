import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  restoreUser: () => void
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),

  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },

  logout: () => {
    set({ user: null })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  restoreUser: () => {
    const user = getStoredUser()
    set({ user })
  },
}))
