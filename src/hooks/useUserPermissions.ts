import { useUserContext } from "./useUserContext";

/**
 * Hook para verificar permisos y roles del usuario actual.
 * Uso:
 *   const { hasPermission, hasRole, permissions, roles } = useUserPermissions();
 */
export function useUserPermissions() {
  const { data: userCtx } = useUserContext();
  const permissions = userCtx?.permissions || [];
  const roles = userCtx?.roles || [];

  function hasPermission(perm: string | string[]): boolean {
    if (!permissions) return false;
    if (Array.isArray(perm)) {
      return perm.every((p) => permissions.includes(p));
    }
    return permissions.includes(perm);
  }

  function hasRole(role: string | string[]): boolean {
    if (!roles) return false;
    if (Array.isArray(role)) {
      return role.some((r) => roles.includes(r));
    }
    return roles.includes(role);
  }

  return { hasPermission, hasRole, permissions, roles };
}
