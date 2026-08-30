import { create } from 'zustand'

const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? `http://${window.location.hostname}:3000/api`
  : 'http://localhost:3000/api'

interface ApiState {
  token: string | null
  setToken: (token: string | null) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: (endpoint: string, options?: RequestInit) => Promise<any>
}

export const useApiStore = create<ApiState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  setToken: (token) => {
    set({ token })
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },

  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const state = get()
    const headers = {
      'Content-Type': 'application/json',
      ...(state.token && { 'Authorization': `Bearer ${state.token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API error')
    }

    return response.json()
  },
}))
