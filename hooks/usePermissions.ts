// hooks/usePermissions.ts
"use client";

type Session = {
  user?: {
    permissions?: string[];
  };
} | null;

export function usePermission(session: Session) {
  const permissions = session?.user?.permissions;

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionsList: string[]): boolean => {
    if (!permissions) return false;
    return permissionsList.some((permission) =>
      permissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissionsList: string[]): boolean => {
    if (!permissions) return false;
    return permissionsList.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}