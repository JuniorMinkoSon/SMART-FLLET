import { create } from 'zustand'
import { User } from '@/types'
import { USERS } from '@/data/mockData'

interface AuthState {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: (email: string, password: string) => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!found) return false
    const { password: _pw, ...user } = found
    void _pw
    set({ user })
    return true
  },

  logout: () => set({ user: null }),
}))
