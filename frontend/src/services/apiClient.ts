/**
 * Client HTTP unique de l'application.
 *
 * - Base `/api` relative : le proxy Vite relaie vers le backend en dev, et en
 *   production le reverse-proxy sert front et API sur la même origine.
 *   `VITE_API_URL` permet de viser un backend distant.
 * - Traduit les statuts HTTP en erreurs typées pour que l'UI puisse afficher
 *   « session expirée », « accès interdit » ou un conflit d'affectation.
 */

const RAW = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '')
export const API_BASE = RAW ? `${RAW}/api` : '/api'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* stockage indisponible (navigation privée) : la session reste en mémoire */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

/** Détail d'une mission en conflit renvoyé par l'anti-overbooking. */
export interface ConflictDetail {
  missionId: string
  missionCode: string
  site: string
  startDate: string
  endDate: string
  status: string
}

/** Engin alternatif réellement libre sur la période. */
export interface AlternativeVehicle {
  id: string
  code: string
  type: string
  status: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Renseignés uniquement pour un 409 d'anti-overbooking. */
  readonly conflicts?: ConflictDetail[]
  readonly alternatives?: AlternativeVehicle[]

  constructor(
    status: number,
    code: string,
    message: string,
    extra?: { conflicts?: ConflictDetail[]; alternatives?: AlternativeVehicle[] },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.conflicts = extra?.conflicts
    this.alternatives = extra?.alternatives
  }

  /** Le backend est joignable mais refuse : distinguer d'une panne réseau. */
  get isUnauthenticated() {
    return this.status === 401
  }
  get isForbidden() {
    return this.status === 403
  }
  get isConflict() {
    return this.status === 409
  }
  /** Aucune réponse du serveur (backend éteint, DNS, coupure). */
  get isNetwork() {
    return this.status === 0
  }
}

/** Notifie l'application qu'il faut revenir à l'écran de connexion. */
type SessionExpiredHandler = () => void
let onSessionExpired: SessionExpiredHandler | null = null
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Ne pas déclencher la redirection globale sur 401 (écran de login). */
  skipAuthRedirect?: boolean
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuthRedirect, headers, ...rest } = options
  const token = getToken()

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Serveur injoignable. Vérifiez votre connexion.')
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const code = payload?.code ?? `HTTP_${response.status}`
    const message = payload?.message ?? defaultMessage(response.status)

    if (response.status === 401 && !skipAuthRedirect) {
      clearSession()
      onSessionExpired?.()
    }

    throw new ApiError(response.status, code, message, {
      conflicts: payload?.conflicts,
      alternatives: payload?.alternatives,
    })
  }

  return payload as T
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Requête invalide.'
    case 401:
      return 'Session expirée, veuillez vous reconnecter.'
    case 403:
      return "Vous n'avez pas les droits nécessaires pour cette action."
    case 404:
      return 'Ressource introuvable.'
    case 409:
      return 'Conflit détecté.'
    default:
      return 'Une erreur est survenue.'
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  del: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
}
