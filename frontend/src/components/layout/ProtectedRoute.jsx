import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

/**
 * Wraps routes that require specific permissions.
 * If permission is null/undefined, it allows access (just requires auth).
 */
const ProtectedRoute = ({ permission }) => {
  const { can } = usePermissions();

  if (permission && !can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-400 text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary font-display mb-2">
          Access Denied
        </h2>
        <p className="text-sm text-text-muted max-w-md">
          You don't have permission to view this page. If you believe this is an
          error, please contact your administrator.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
