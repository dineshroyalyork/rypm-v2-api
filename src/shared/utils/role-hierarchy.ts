export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT'
}

export class RoleHierarchy {
  // Define who can create/manage whom
  private static hierarchy: { [key: string]: UserRole[] } = {
    [UserRole.SUPER_ADMIN]: [
      UserRole.MANAGER,
      UserRole.AGENT
    ],
    [UserRole.MANAGER]: [
      UserRole.AGENT
    ],
    [UserRole.AGENT]: [] // Cannot create users
  };

  // Define who can manage whom
  private static management: { [key: string]: UserRole[] } = {
    [UserRole.SUPER_ADMIN]: [
      UserRole.MANAGER,
      UserRole.AGENT
    ],
    [UserRole.MANAGER]: [
      UserRole.AGENT
    ],
    [UserRole.AGENT]: []
  };

  // Check if a role can create another role
  static canCreateRole(creatorRole: string, targetRole: string): boolean {
    const allowedRoles = this.hierarchy[creatorRole] || [];
    return allowedRoles.includes(targetRole as UserRole);
  }

  // Check if a role can manage another role
  static canManageRole(managerRole: string, targetRole: string): boolean {
    const manageableRoles = this.management[managerRole] || [];
    return manageableRoles.includes(targetRole as UserRole);
  }

  // Get all roles that a given role can create
  static getCreatableRoles(role: string): UserRole[] {
    return this.hierarchy[role] || [];
  }

  // Get all roles that a given role can manage
  static getManageableRoles(role: string): UserRole[] {
    return this.management[role] || [];
  }

  // Get role level (higher number = higher level)
  static getRoleLevel(role: string): number {
    const levels: { [key: string]: number } = {
      [UserRole.SUPER_ADMIN]: 3,
      [UserRole.MANAGER]: 2,
      [UserRole.AGENT]: 1
    };
    return levels[role] || 0;
  }

  // Check if role A is higher than role B
  static isHigherRole(roleA: string, roleB: string): boolean {
    return this.getRoleLevel(roleA) > this.getRoleLevel(roleB);
  }
} 