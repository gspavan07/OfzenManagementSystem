import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  GraduationCap,
  UserCheck,
  BookOpen,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Receipt,
  UserCog,
  BriefcaseBusiness,
  IndianRupee,
  FileText,
} from "lucide-react";

// ─── Nav item definition — permission-gated ───────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
    permission: "revenue.view",
  },
  {
    label: "Finance",
    icon: TrendingUp,
    items: [
      {
        label: "Revenue & GST",
        icon: BarChart3,
        to: "/finance/revenue-gst",
        permission: "revenue.view",
      },
      {
        label: "Expenses",
        icon: Receipt,
        to: "/finance/expenses",
        permission: "expenseTracker.view",
      },
    ],
  },
  {
    label: "Employees",
    icon: Users,
    items: [
      {
        label: "All Employees",
        icon: Users,
        to: "/employees",
        permission: "employees.view",
      },
      {
        label: "Payroll",
        icon: DollarSign,
        to: "/payroll",
        permission: "payroll.view",
      },
    ],
  },
  {
    label: "Interns",
    icon: GraduationCap,
    items: [
      {
        label: "Internships",
        icon: BriefcaseBusiness,
        to: "/internships",
        permission: "internBatches.view",
      },
      {
        label: "Batches",
        icon: BookOpen,
        to: "/intern-batches",
        permission: "internBatches.view",
      },
      {
        label: "Registrations",
        icon: UserCheck,
        to: "/intern-registrations",
        permission: "internRegistrations.view",
      },
      {
        label: "Intern Revenue",
        icon: IndianRupee,
        to: "/interns/revenue",
        permission: "revenue.view",
      },
      {
        label: "My Dashboard",
        icon: GraduationCap,
        to: "/intern/dashboard",
        permission: "internSelf.viewProfile",
      },
    ],
  },
  {
    label: "Mentor",
    icon: BriefcaseBusiness,
    items: [
      {
        label: "My Batches",
        icon: BookOpen,
        to: "/mentor/batches",
        permission: "mentorTools.viewAssignedBatches",
      },
    ],
  },
  {
    label: "Announcements",
    icon: Megaphone,
    to: "/announcements",
    permission: "announcements.edit",
  },

  {
    label: "Settings",
    icon: Settings,
    items: [
      {
        label: "Profiles",
        icon: Shield,
        to: "/settings/profiles",
        permission: "profileManagement.view",
      },

      {
        label: "Document Templates",
        icon: FileText,
        to: "/settings/templates",
        permission: "mailSystem.sendCertificate", // Using certificate permission as proxy
      },
      {
        label: "My Account",
        icon: UserCog,
        to: "/settings/account",
        permission: null,
      },
    ],
  },
];

// ─── Single nav link ──────────────────────────────────────────────────────────
const NavItem = ({ to, label, icon: Icon, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-text-muted hover:text-text-secondary hover:bg-black/5"
      }`
    }
  >
    <Icon className="w-4 h-4 shrink-0" />
    {!collapsed && <span className="sidebar-label truncate">{label}</span>}
  </NavLink>
);

// ─── Group with collapsible section ──────────────────────────────────────────
const NavGroup = ({ label, icon: Icon, items, collapsed, can }) => {
  const visibleItems = items.filter(
    (item) => !item.permission || can(item.permission),
  );
  if (visibleItems.length === 0) return null;

  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-secondary transition-colors"
        >
          <span>{label}</span>
          <ChevronRight
            className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>
      )}
      {(open || collapsed) && (
        <div className={`space-y-0.5 ${collapsed ? "" : "ml-1"}`}>
          {visibleItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-(--color-bg-surface) border-r border-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">OZ</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-text-primary font-display leading-none">
              Ofzen
            </div>
            <div className="text-[10px] text-text-muted">Management</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {/* Dashboard — visible only with permission */}
        {can("revenue.view") && (
          <NavItem
            to="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            collapsed={collapsed}
          />
        )}

        {NAV_ITEMS.slice(1).map((item) =>
          item.items ? (
            <NavGroup
              key={item.label}
              {...item}
              collapsed={collapsed}
              can={can}
            />
          ) : !item.permission || can(item.permission) ? (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ) : null,
        )}
      </nav>

      {/* User + Collapse toggle */}
      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-text-primary truncate">
                  {user?.name}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {user?.profileLabel}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-fit px-2 py-1.5 text-xs text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed((p) => !p)}
          className="flex items-center justify-center w-full py-1.5 text-text-muted hover:text-text-secondary transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
