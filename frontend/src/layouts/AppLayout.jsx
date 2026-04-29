import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import { Spinner } from '../components/ui';

const AppLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">OZ</span>
          </div>
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ─── Intern Access Guard ───────────────────────────────────────────────────
  // If the user is an Intern, they are restricted to /intern/dashboard ONLY.
  if (user?.profileLabel === 'Intern' && location.pathname !== '/intern/dashboard') {
    return <Navigate to="/intern/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-screen-2xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
