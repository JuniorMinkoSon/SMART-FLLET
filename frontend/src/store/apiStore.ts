import { create } from 'zustand'

/**
 * Base de l'API.
 * - En dev, laisser vide : les appels partent en `/api/...` et sont relayés
 *   au backend par le proxy Vite (voir vite.config.ts) — pas de CORS.
 * - En prod ou pour cibler un backend distant, définir `VITE_API_URL`
 *   (ex. `https://api.smartfleet.example`). Le suffixe `/api` est ajouté ici.
 */
const RAW = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '')
const API_BASE = RAW ? `${RAW}/api` : '/api'

interface ApiState {
  token: string | null
  setToken: (token: string | null) => void
  fetch: <T = unknown>(endpoint: string, options?: RequestInit) => Promise<T>
}

export const useApiStore = create<ApiState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  setToken: (token) => {
    set({ token })
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  },

  fetch: async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const { token } = get()
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (res.status === 401) {
      // Session invalide / expirée : on purge et on laisse l'appelant gérer.
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || body.error || `Erreur API (${res.status})`)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  },
}))
