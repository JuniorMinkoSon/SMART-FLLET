/**
 * PERMISSION SERVICE - RBAC centralisé
 * Définit qui peut faire quoi, de manière granulaire, pour les 3 rôles MVP.
 */

import type { UserRole } from '@/types'

type Permission = string

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'vehicle.create', 'vehicle.create_external', 'vehicle.edit', 'vehicle.verify',
    'vehicle.view_all', 'vehicle.send_maintenance', 'vehicle.release_from_maintenance',
    'driver.create', 'driver.edit', 'driver.view_all', 'driver.suspend',
    'assignment.create', 'assignment.edit', 'assignment.delete',
    'mission.create', 'mission.edit', 'mission.assign', 'mission.view_all',
    'mission.start', 'mission.return', 'mission.validate',
    'fuel.create', 'fuel.view_own', 'fuel.view_operational', 'fuel.view_financial',
    'incident.create', 'incident.view_all',
    'users.manage', 'settings.manage',
    'audit.view', 'analytics.view', 'dashboard.admin', 'dashboard.fleet_command',
  ],

  gestionnaire: [
    'vehicle.view_all', 'vehicle.verify', 'vehicle.send_maintenance',
    'vehicle.release_from_maintenance',
    'driver.view_all',
    'assignment.create', 'assignment.view_all',
    'mission.create', 'mission.assign', 'mission.view_all', 'mission.return',
    'mission.validate',
    'fuel.create', 'fuel.view_operational', 'fuel.view_financial',
    'incident.create', 'incident.view_all',
    'dashboard.gestionnaire', 'dashboard.fleet_command',
  ],

  conducteur: [
    'mission.view_own', 'mission.start', 'mission.return',
    'fuel.create', 'fuel.view_own',
    'incident.create',
    'dashboard.conducteur',
  ],
}

class PermissionService {
  hasPermission(role: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
  }

  canCreateVehicle(role: UserRole): boolean {
    return this.hasPermission(role, 'vehicle.create')
  }

  canSendToMaintenance(role: UserRole): boolean {
    return this.hasPermission(role, 'vehicle.send_maintenance')
  }

  canCreateDriver(role: UserRole): boolean {
    return this.hasPermission(role, 'driver.create')
  }

  canCreateMission(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.create')
  }

  canStartMission(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.start')
  }

  canReturnMission(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.return')
  }

  canValidateReturn(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.validate')
  }

  canViewAllMissions(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.view_all')
  }

  canViewOwnMissions(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.view_own')
  }

  canRecordFuel(role: UserRole): boolean {
    return this.hasPermission(role, 'fuel.create')
  }

  canViewFuelCosts(role: UserRole): boolean {
    return this.hasPermission(role, 'fuel.view_financial')
  }

  canManageUsers(role: UserRole): boolean {
    return this.hasPermission(role, 'users.manage')
  }

  getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] ?? []
  }
}

export const permissionService = new PermissionService()
