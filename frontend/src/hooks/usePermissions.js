import { useAuth } from '../context/AuthContext';

/**
 * Permission check hook.
 * Usage:
 *   const { can } = usePermissions();
 *   if (can('payroll.generate')) { ... }
 *   if (can('revenue.view')) { ... }
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || {};

  /**
   * Check a single permission.
   * @param {string} permissionPath - e.g. 'payroll.generate'
   */
  const can = (permissionPath) => {
    if (!permissionPath) return false;
    const [section, action] = permissionPath.split('.');
    if (!action) return !!permissions[section]; // section-level check
    return !!permissions[section]?.[action];
  };

  /**
   * Check if any of the listed permissions are true (OR logic).
   * @param {string[]} paths
   */
  const canAny = (paths) => paths.some(can);

  /**
   * Check all permissions are true (AND logic).
   * @param {string[]} paths
   */
  const canAll = (paths) => paths.every(can);

  return { can, canAny, canAll, permissions };
};
