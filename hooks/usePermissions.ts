"use client";

import { useSession } from "next-auth/react";

export function usePermission() {
  const { data: session } = useSession();

  const hasPermission = (permission: string): boolean => {
    const permissions = session?.user?.permissions;
    if (!permissions) return false;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionsList: string[]): boolean => {
    const permissions = session?.user?.permissions;
    if (!permissions) return false;
    return permissionsList.some((permission) =>
      permissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissionsList: string[]): boolean => {
    const permissions = session?.user?.permissions;
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