export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type Permission =
  | 'queries.execute'
  | 'queries.view.own'
  | 'queries.view.all'
  | 'queries.delete.own'
  | 'queries.delete.all'
  | 'connections.create'
  | 'connections.edit'
  | 'connections.delete'
  | 'connections.view.all'
  | 'users.manage'
  | 'admin.access'
  | 'analytics.view'

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    'queries.execute',
    'queries.view.own',
    'queries.delete.own',
  ],
  [Role.ADMIN]: [
    'queries.execute',
    'queries.view.own',
    'queries.view.all',
    'queries.delete.own',
    'queries.delete.all',
    'connections.create',
    'connections.edit',
    'connections.delete',
    'connections.view.all',
    'users.manage',
    'admin.access',
    'analytics.view',
  ],
}

export function hasPermission(
  userRole: Role,
  permission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false
}

export function requirePermission(
  userRole: Role,
  permission: Permission
): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Insufficient permissions: ${permission}`)
  }
}

export function isAdmin(userRole: Role): boolean {
  return userRole === Role.ADMIN
}
