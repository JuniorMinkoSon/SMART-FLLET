/**
 * Status Normalization — Convert between frontend (lowercase) and backend (UPPERCASE)
 */

export function normalizeVehicleStatusToBackend(status: string): string {
  return status.toUpperCase()
}

export function normalizeVehicleStatusToFrontend(status: string): string {
  return status.toLowerCase()
}

export function normalizeDriverStatusToBackend(status: string): string {
  return status.toUpperCase()
}

export function normalizeDriverStatusToFrontend(status: string): string {
  return status.toLowerCase()
}

export function normalizeMissionStatusToBackend(status: string): string {
  return status.toUpperCase()
}

export function normalizeMissionStatusToFrontend(status: string): string {
  return status.toLowerCase()
}
