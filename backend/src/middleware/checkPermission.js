/**
 * Permission guard factory.
 * Usage: checkPermission('payroll.generate')
 *
 * Reads req.user.permissions (already loaded by protect middleware)
 * and returns 403 if the user doesn't have the specified flag.
 */
const checkPermission = (permissionPath) => (req, res, next) => {
  if (!req.user?.permissions) {
    res.status(403);
    throw new Error('Forbidden — no permissions loaded');
  }

  const [section, action] = permissionPath.split('.');
  const sectionPerms = req.user.permissions[section];

  if (!sectionPerms || !sectionPerms[action]) {
    res.status(403);
    throw new Error(`Forbidden — missing permission: ${permissionPath}`);
  }

  next();
};

/**
 * Check if any of the listed permissions are true (OR logic).
 * Usage: checkAnyPermission(['revenue.view', 'gstTracker.view'])
 */
const checkAnyPermission = (permissionPaths) => (req, res, next) => {
  if (!req.user?.permissions) {
    res.status(403);
    throw new Error('Forbidden — no permissions loaded');
  }

  const hasAny = permissionPaths.some((path) => {
    const [section, action] = path.split('.');
    return !!req.user.permissions[section]?.[action];
  });

  if (!hasAny) {
    res.status(403);
    throw new Error('Forbidden — insufficient permissions');
  }

  next();
};

module.exports = { checkPermission, checkAnyPermission };
