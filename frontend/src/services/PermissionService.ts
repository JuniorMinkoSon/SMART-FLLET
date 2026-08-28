/**
 * PERMISSION SERVICE - RBAC Centralisé
 * Définit qui peut faire quoi, de manière granulaire
 */

import { UserRole } from '@/types'

type Permission = string

interface RolePermissions {
  [key: string]: Permission[]
}

const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [
    'vehicle.create', 'vehicle.create_external', 'vehicle.edit', 'vehicle.verify',
    'vehicle.view_all', 'vehicle.send_maintenance', 'vehicle.release_from_maintenance',
    'driver.create', 'driver.edit', 'driver.view_all', 'driver.suspend',
    'assignment.create', 'assignment.edit', 'assignment.delete',
    'mission.create', 'mission.edit', 'mission.assign', 'mission.view_all',
    'mission.start', 'mission.return', 'mission.validate',
    'fuel.create', 'fuel.view_own', 'fuel.view_operational', 'fuel.view_financial',
    'incident.create', 'incident.view_all',
    'audit.view', 'analytics.view', 'dashboard.admin', 'dashboard.fleet_command'
  ],

  [UserRole.GESTIONNAIRE]: [
    'vehicle.view_all', 'vehicle.verify', 'vehicle.send_maintenance',
    'vehicle.release_from_maintenance',
    'driver.view_all',
    'assignment.create', 'assignment.view_all',
    'mission.create', 'mission.assign', 'mission.view_all', 'mission.return',
    'mission.validate',
    'fuel.view_operational',
    'incident.create', 'incident.view_all',
    'dashboard.gestionnaire', 'dashboard.fleet_command'
  ],

  [UserRole.CONDUCTEUR]: [
    'mission.view_own', 'mission.start', 'mission.return',
    'fuel.create', 'fuel.view_own',
    'incident.create',
    'dashboard.conducteur'
  ],

  [UserRole.DG]: [
    'mission.view_all',
    'dashboard.dg', 'dashboard.fleet_command',
    'analytics.view_summary'
  ]
}

class PermissionService {
  hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePerms = ROLE_PERMISSIONS[role]
    if (!rolePerms) return false
    return rolePerms.includes(permission)
  }

  canCreateVehicle(role: UserRole): boolean {
    return this.hasPermission(role, 'vehicle.create')
  }

  canVerifyVehicle(role: UserRole): boolean {
    return this.hasPermission(role, 'vehicle.verify')
  }

  canSendToMaintenance(role: UserRole): boolean {
    return this.hasPermission(role, 'vehicle.send_maintenance')
  }

  canCreateDriver(role: UserRole): boolean {
    return this.hasPermission(role, 'driver.create')
  }

  canAssignDriver(role: UserRole): boolean {
    return this.hasPermission(role, 'assignment.create')
  }

  canCreateMission(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.create')
  }

  canAssignMission(role: UserRole): boolean {
    return this.hasPermission(role, 'mission.assign')
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

  canViewAudit(role: UserRole): boolean {
    return this.hasPermission(role, 'audit.view')
  }

  canAccessAdminDashboard(role: UserRole): boolean {
    return this.hasPermission(role, 'dashboard.admin')
  }

  canAccessFleetCommand(role: UserRole): boolean {
    return this.hasPermission(role, 'dashboard.fleet_command')
  }

  getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || []
  }
}

export const permissionService = new PermissionService()
