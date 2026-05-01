// ─── Reusable UI Components ────────────────────────────────────────────────────

// Button
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  loading,
  type = "button",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    secondary:
      "bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    success:
      "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20",
    ghost: "hover:bg-white/5 text-[var(--color-text-secondary)]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

// Card
export const Card = ({
  children,
  className = "",
  title,
  subtitle,
  action,
  onClick,
  ...props
}) => (
  <div className={`glass-card p-5 ${className}`} onClick={onClick} {...props}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] font-display">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

// Input
export const Input = ({ label, error, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
        {label}
      </label>
    )}
    <input
      className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-indigo-500/20 transition-all"
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// Select
export const Select = ({
  label,
  error,
  children,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
        {label}
      </label>
    )}
    <select
      className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)] transition-all"
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// Textarea
export const Textarea = ({ label, error, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
        {label}
      </label>
    )}
    <textarea
      className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-border-focus)] resize-y min-h-[80px] transition-all"
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// Toggle
export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-indigo-500" : "bg-[var(--color-bg-elevated)]"} border border-[var(--color-border)]`}
      />
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
      />
    </div>
    {label && (
      <span className="text-sm text-[var(--color-text-secondary)]">
        {label}
      </span>
    )}
  </label>
);

// Badge
export const Badge = ({ children, variant = "muted" }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

// Loading Spinner
export const Spinner = ({ size = "md" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div
      className={`${sizes[size]} border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`}
    />
  );
};

// Loading Page
export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// Empty State
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
      </div>
    )}
    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
      {title}
    </h3>
    {description && (
      <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
        {description}
      </p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Section Header
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] font-display">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
    {action}
  </div>
);

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 max-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative glass-card w-full ${sizes[size]} animate-fade-in max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] font-display">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// Stat Card
export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  color = "indigo",
  onClick,
}) => {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    red: "text-red-400 bg-red-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  };
  return (
    <div
      className={`glass-card p-5 ${onClick ? "cursor-pointer hover:border-indigo-500/30 transition-all" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
          {label}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[var(--color-text-primary)] font-display">
        {value}
      </div>
      {trend && (
        <div className="text-xs text-[var(--color-text-muted)] mt-1">
          {trend}
        </div>
      )}
    </div>
  );
};

// Table
export const Table = ({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
  onRowClick,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          {columns.map((col) => (
            <th
              key={col.key}
              className="py-3 px-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="py-10 text-center">
              <div className="flex justify-center">
                <Spinner />
              </div>
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="py-10 text-center text-text-muted text-sm"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr
              key={row._id || i}
              className={`border-b border-[var(--color-border)]/50 transition-colors ${onRowClick ? "cursor-pointer hover:bg-white/3" : "hover:bg-white/2"}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="py-3 px-4 text-[var(--color-text-secondary)]"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
