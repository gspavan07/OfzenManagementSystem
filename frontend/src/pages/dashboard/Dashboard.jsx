import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { SectionHeader, StatCard, Card, Spinner } from "../../components/ui";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Megaphone,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  IndianRupee,
  Pin,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { announcementsApi, financeApi } from "../../api";

const MONTH_NAMES = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const Dashboard = () => {
  const { user } = useAuth();
  const [fyYear, setFyYear] = useState(
    new Date().getMonth() < 3
      ? new Date().getFullYear() - 1
      : new Date().getFullYear(),
  );

  const {
    data: statsData,
    loading: statsLoading,
    execute: fetchStats,
  } = useApi(financeApi.getDashboardStats, { immediate: false });

  useEffect(() => {
    fetchStats({ year: fyYear }).catch(() => {});
  }, [fyYear, fetchStats]);

  const { data: annData, loading: annLoading } = useApi(
    announcementsApi.getAll,
  );

  const stats = statsData?.stats || {
    totalTurnover: 0,
    totalInternRevenue: 0,
    totalDirectRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    totalGst: 0,
    totalEmployees: 0,
    activeInterns: 0,
    monthlyBreakdown: [],
  };
  const announcements = annData?.announcements || [];

  const pinned = announcements.filter((a) => a.isPinned);
  const recent = announcements.filter((a) => !a.isPinned).slice(0, 5);

  const isAdmin =
    user?.profileLabel === "Admin" || user?.profileLabel === "CEO";

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader
          title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}`}
          subtitle={`Profile: ${user?.profileLabel} | Here's your business overview.`}
        />

        {isAdmin && (
          <div className="flex items-center gap-2 bg-(--color-bg-elevated) border border-border rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-text-muted" />
            <select
              className="bg-transparent text-sm font-medium text-text-primary outline-none"
              value={fyYear}
              onChange={(e) => setFyYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  FY {y}-{String(y + 1).slice(2)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total Turnover"
            value={`₹${Math.round(stats.totalTurnover).toLocaleString()}`}
            icon={TrendingUp}
            color="indigo"
            loading={statsLoading}
            subtitle={`Target: FY ${fyYear}-${String(fyYear + 1).slice(2)}`}
          />
          <StatCard
            label="Intern Revenue"
            value={`₹${Math.round(stats.totalInternRevenue).toLocaleString()}`}
            icon={BookOpen}
            color="green"
            loading={statsLoading}
            subtitle={`Direct: ₹${Math.round(stats.totalDirectRevenue).toLocaleString()}`}
          />
          <StatCard
            label="Total Expenses"
            value={`₹${Math.round(stats.totalExpenses).toLocaleString()}`}
            icon={ArrowDownCircle}
            color="red"
            loading={statsLoading}
          />
          <StatCard
            label="Net Profit"
            value={`₹${Math.round(stats.totalProfit).toLocaleString()}`}
            icon={ArrowUpCircle}
            color="green"
            loading={statsLoading}
          />
        </div>
      )}

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees.toString()}
          icon={Users}
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          label="Active Interns"
          value={stats.activeInterns.toString()}
          icon={BookOpen}
          color="green"
          loading={statsLoading}
        />
        <StatCard
          label="Announcements"
          value={announcements.length.toString()}
          icon={Megaphone}
          color="orange"
          loading={annLoading}
        />
        {isAdmin ? (
          <StatCard
            label="GST Paid"
            value={
              stats.totalTurnover >= 2000000
                ? `₹${Math.round(stats.totalGst).toLocaleString()}`
                : "Not Applicable"
            }
            icon={IndianRupee}
            color={stats.totalTurnover >= 2000000 ? "orange" : "gray"}
            loading={statsLoading}
            subtitle={
              stats.totalTurnover < 2000000
                ? "Turnover < ₹20L"
                : `Actual: ₹${stats.totalGst.toLocaleString()}`
            }
          />
        ) : (
          <StatCard
            label="Available Funds"
            value={`₹${Math.round(stats.totalProfit || 0).toLocaleString()}`}
            icon={Wallet}
            color="indigo"
            loading={statsLoading}
          />
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAdmin && (
            <Card title="Financial Performance (Monthly Breakdown)">
              {statsLoading ? (
                <div className="flex justify-center p-12">
                  <Spinner />
                </div>
              ) : stats.monthlyBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-[var(--color-text-muted)]">
                  <TrendingUp className="w-12 h-12 mb-2 opacity-10" />
                  <p>No financial data recorded for this year.</p>
                </div>
              ) : (
                <div className="h-64 lg:h-96 flex items-end justify-between gap-2 pt-10 px-2">
                  {stats.monthlyBreakdown.map((m, i) => {
                    const maxVal =
                      Math.max(
                        ...stats.monthlyBreakdown.map((x) =>
                          Math.max(x.revenue, x.expenses),
                        ),
                      ) || 1;
                    const revHeight = (m.revenue / maxVal) * 100;
                    const expHeight = (m.expenses / maxVal) * 100;

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1 group relative h-full"
                      >
                        <div className="w-full flex justify-center items-end gap-0.5 h-full">
                          <div
                            style={{ height: `${Math.max(revHeight, 2)}%` }}
                            className={`w-full max-w-[12px] bg-primary rounded-t-sm transition-all duration-500 ${m.revenue > 0 ? "opacity-80 group-hover:opacity-100" : "opacity-10"}`}
                          ></div>
                          <div
                            style={{ height: `${Math.max(expHeight, 2)}%` }}
                            className={`w-full max-w-[12px] bg-red-500 rounded-t-sm transition-all duration-500 ${m.expenses > 0 ? "opacity-80 group-hover:opacity-100" : "opacity-10"}`}
                          ></div>
                        </div>
                        <span className="text-[10px] text-text-muted mt-2 font-medium">
                          {MONTH_NAMES[i]}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-bg-card border border-border p-3 rounded-lg shadow-2xl z-20 text-[11px] min-w-[120px]">
                          <p className="font-bold border-b border-border mb-2 pb-1 text-text-primary">
                            {MONTH_NAMES[i]} {m.year}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                              <span className="text-text-secondary">
                                Total Revenue:
                              </span>
                              <span className="font-semibold text-primary">
                                ₹{m.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 pl-2 text-[9px] text-text-muted">
                              <span>• Direct Rev:</span>
                              <span>₹{m.directRevenue?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between gap-4 pl-2 text-[9px] text-text-muted">
                              <span>• Intern Rev:</span>
                              <span>₹{m.internRevenue?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[var(--color-text-secondary)]">
                                Expenses:
                              </span>
                              <span className="font-semibold text-red-500">
                                ₹{m.expenses.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--color-border)] mt-1">
                              <span className="text-[var(--color-text-secondary)]">
                                Profit:
                              </span>
                              <span
                                className={`font-bold ${m.profit >= 0 ? "text-green-500" : "text-red-600"}`}
                              >
                                ₹{m.profit.toLocaleString()}
                              </span>
                            </div>

                            {m.gst > 0 && (
                              <div className="flex justify-between gap-4 text-[9px] text-orange-500 italic">
                                <span>GST:</span>
                                <span>₹{m.gst.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Link
                to="/announcements"
                className="text-left px-4 py-3 rounded-lg bg-(--color-bg-elevated) hover:bg-bg-card border border-border text-sm transition-colors text-text-secondary hover:text-primary block"
              >
                Manage Announcements
              </Link>
              <Link
                to="/payroll"
                className="text-left px-4 py-3 rounded-lg bg-(--color-bg-elevated) hover:bg-bg-card border border-border text-sm transition-colors text-text-secondary hover:text-primary block"
              >
                View Payroll
              </Link>
              <Link
                to="/employees"
                className="text-left px-4 py-3 rounded-lg bg-(--color-bg-elevated) hover:bg-bg-card border border-border text-sm transition-colors text-text-secondary hover:text-primary block"
              >
                Employee Directory
              </Link>
            </div>
          </Card>

          <Card title="Announcements">
            {annLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 rounded w-full"></div>
                <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>
            ) : pinned.length > 0 || recent.length > 0 ? (
              <div className="divide-y divide-border">
                {pinned.map((a) => (
                  <div key={a._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <Pin className="w-3.5 h-3.5 text-primary fill-primary" />
                        <h4 className="font-semibold text-primary">
                          {a.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-primary-light whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-3">
                      {a.content}
                    </p>
                  </div>
                ))}
                {recent.map((a) => (
                  <div key={a._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-text-primary">
                        {a.title}
                      </h4>
                      <span className="text-[10px] text-text-muted whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">
                No announcements.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
