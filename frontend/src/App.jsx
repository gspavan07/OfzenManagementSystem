import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProfileBuilder from "./pages/settings/ProfileBuilder";
import EmployeeDirectory from "./pages/employees/EmployeeDirectory";
import InternBatches from "./pages/interns/InternBatches";
import Internships from "./pages/interns/Internships";
import InternRegistrations from "./pages/interns/InternRegistrations";
import ExpenseTracker from "./pages/finance/ExpenseTracker";
import RevenueGstTracker from "./pages/finance/RevenueGstTracker";
import PayrollEngine from "./pages/payroll/PayrollEngine";

import Announcements from "./pages/dashboard/Announcements";
import MentorBatches from "./pages/mentor/MentorBatches";
import InternDashboard from "./pages/interns/InternDashboard";
import AccountSettings from "./pages/settings/AccountSettings";
import InternRevenue from "./pages/interns/InternRevenue";
import DocumentTemplates from "./pages/settings/DocumentTemplates";


// Placeholder Pages (will be implemented next)
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <h1 className="text-2xl font-bold text-text-secondary">
      {title} Page (Under Construction)
    </h1>
  </div>
);

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.permissions?.revenue?.view) return <Navigate to="/dashboard" replace />;
  if (user.permissions?.internSelf?.viewProfile) return <Navigate to="/intern/dashboard" replace />;
  if (user.permissions?.mentorTools?.viewAssignedBatches) return <Navigate to="/mentor/batches" replace />;
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-elevated)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes enclosed in AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Finance */}
            <Route element={<ProtectedRoute permission="revenue.view" />}>
              <Route
                path="/finance/revenue-gst"
                element={<RevenueGstTracker />}
              />
            </Route>
            <Route
              element={<ProtectedRoute permission="expenseTracker.view" />}
            >
              <Route path="/finance/expenses" element={<ExpenseTracker />} />
            </Route>

            {/* Employees */}
            <Route element={<ProtectedRoute permission="employees.view" />}>
              <Route path="/employees" element={<EmployeeDirectory />} />
            </Route>
            <Route element={<ProtectedRoute permission="payroll.view" />}>
              <Route path="/payroll" element={<PayrollEngine />} />
            </Route>

            {/* Interns */}
            <Route element={<ProtectedRoute permission="internBatches.view" />}>
              <Route path="/internships" element={<Internships />} />
              <Route path="/intern-batches" element={<InternBatches />} />
            </Route>
            <Route
              element={<ProtectedRoute permission="internRegistrations.view" />}
            >
              <Route
                path="/intern-registrations"
                element={<InternRegistrations />}
              />
            </Route>
            <Route
              element={<ProtectedRoute permission="internSelf.viewProfile" />}
            >
              <Route path="/intern/dashboard" element={<InternDashboard />} />
            </Route>

            <Route element={<ProtectedRoute permission="revenue.view" />}>
              <Route path="/interns/revenue" element={<InternRevenue />} />
            </Route>

            {/* Mentor */}
            <Route
              element={
                <ProtectedRoute permission="mentorTools.viewAssignedBatches" />
              }
            >
              <Route path="/mentor/batches" element={<MentorBatches />} />
            </Route>

            {/* Announcements */}
            <Route element={<ProtectedRoute permission="announcements.view" />}>
              <Route path="/announcements" element={<Announcements />} />
            </Route>



            {/* Settings */}
            <Route
              element={<ProtectedRoute permission="profileManagement.view" />}
            >
              <Route path="/settings/profiles" element={<ProfileBuilder />} />
              <Route path="/settings/templates" element={<DocumentTemplates />} />
            </Route>

            <Route path="/settings/account" element={<AccountSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
