import { describe, it, expect } from 'vitest'
import { permissionService } from '@/services/PermissionService'

describe('PermissionService', () => {
  it('admin should have all permissions', () => {
    expect(permissionService.hasPermission('admin', 'mission.create')).toBe(true)
    expect(permissionService.hasPermission('admin', 'mission.start')).toBe(true)
    expect(permissionService.hasPermission('admin', 'mission.return')).toBe(true)
    expect(permissionService.hasPermission('admin', 'mission.validate')).toBe(true)
  })

  it('gestionnaire should have mission and fuel permissions', () => {
    expect(permissionService.hasPermission('gestionnaire', 'mission.create')).toBe(true)
    expect(permissionService.hasPermission('gestionnaire', 'mission.validate')).toBe(true)
    expect(permissionService.hasPermission('gestionnaire', 'mission.return')).toBe(true)
  })

  it('gestionnaire should not have start/user management permissions', () => {
    expect(permissionService.hasPermission('gestionnaire', 'mission.start')).toBe(false)
    expect(permissionService.hasPermission('gestionnaire', 'users.manage')).toBe(false)
  })

  it('conducteur should only have limited permissions', () => {
    expect(permissionService.hasPermission('conducteur', 'mission.start')).toBe(true)
    expect(permissionService.hasPermission('conducteur', 'mission.return')).toBe(true)
    expect(permissionService.hasPermission('conducteur', 'mission.create')).toBe(false)
    expect(permissionService.hasPermission('conducteur', 'mission.validate')).toBe(false)
  })
})
