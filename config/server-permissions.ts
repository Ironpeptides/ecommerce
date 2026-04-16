// utils/server-permissions.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getServerPermissions() {
  const session = await getServerSession(authOptions);

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