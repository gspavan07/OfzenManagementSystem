import { useState, useEffect } from "react";
import {
  SectionHeader,
  Card,
  Table,
  Button,
  Modal,
  Input,
  Badge,
  Toggle,
  Spinner,
} from "../../components/ui";
import {
  IndianRupee,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Edit2
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { financeApi } from "../../api";
import toast from "react-hot-toast";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const CATEGORY_OPTIONS = ['Internships', 'Projects', 'Services', 'Other'];

const RevenueGstTracker = () => {
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const {
    data: revData,
    loading: revLoading,
    execute: fetchRevenue,
  } = useApi(financeApi.getRevenue, { immediate: false });
  
  useEffect(() => {
    fetchRevenue({ year: filterYear, month: filterMonth, category: filterCategory }).catch(() => {});
  }, [filterYear, filterMonth, filterCategory, fetchRevenue]);
  
  const {
    data: gstData,
    loading: gstLoading,
    execute: fetchGst,
  } = useApi(financeApi.getGstStatus);

  const revenue = revData?.revenue || [];
  const gstStatus = gstData?.data;

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [title, setTitle] = useState("");
  const [totalCollected, setTotalCollected] = useState("");
  const [numberOfStudents, setNumberOfStudents] = useState("");
  const [gstApplicable, setGstApplicable] = useState(false);
  const [gstAmount, setGstAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const openModal = (rev = null) => {
    if (rev) {
      setEditingId(rev._id);
      setDate(new Date(rev.date).toISOString().split("T")[0]);
      setCategory(rev.category || CATEGORY_OPTIONS[0]);
      setTitle(rev.title || "");
      setTotalCollected(rev.totalCollected);
      setNumberOfStudents(rev.numberOfStudents || 0);
      setGstApplicable(rev.gstApplicable);
      setGstAmount(rev.gstAmount || 0);
      setNotes(rev.notes || "");
    } else {
      setEditingId(null);
      setDate(new Date().toISOString().split("T")[0]);
      setCategory(CATEGORY_OPTIONS[0]);
      setTitle("");
      setTotalCollected("");
      setNumberOfStudents("");
      setGstApplicable(false);
      setGstAmount(0);
      setNotes("");
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        date,
        category,
        title,
        totalCollected: Number(totalCollected),
        numberOfStudents: Number(numberOfStudents),
        gstApplicable,
        gstAmount: Number(gstAmount),
        notes,
      };
      
      if (editingId) {
        await financeApi.updateRevenue(editingId, payload);
        toast.success("Revenue record updated");
      } else {
        await financeApi.createRevenue(payload);
        toast.success("Revenue record logged");
      }
      
      setModalOpen(false);
      fetchRevenue({ year: filterYear, month: filterMonth, category: filterCategory });
      fetchGst();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this revenue record?")) return;
    try {
      await financeApi.deleteRevenue(id);
      toast.success("Revenue record deleted");
      fetchRevenue({ year: filterYear, month: filterMonth, category: filterCategory });
      fetchGst();
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: "details",
      label: "Details",
      render: (_, row) => (
        <div>
          <div className="font-semibold text-[var(--color-primary)]">
            {row.title || row.category}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.category}
          </div>
        </div>
      ),
    },
    { 
      key: "numberOfStudents", 
      label: "Students", 
      render: (val, row) => row.category === 'Internships' ? (val || 0) : '-' 
    },
    {
      key: "totalCollected",
      label: "Total Collected",
      render: (val) => (
        <span className="font-semibold text-green-500">
          ₹{(val || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "gstAmount",
      label: "GST",
      render: (val, row) => row.gstApplicable ? (
        <span className="text-orange-500 text-sm">₹{(val || 0).toLocaleString("en-IN")}</span>
      ) : (
        <Badge variant="secondary">No GST</Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (val) => (
        <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[150px] block">
          {val || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => row.isVirtual ? (
        <Badge variant="ghost" className="text-[10px] text-primary bg-primary/5 border-primary/20">Automated</Badge>
      ) : (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openModal(row)} 
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-white/5" 
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors rounded-md hover:bg-white/5" 
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader
          title="Revenue & GST Tracker"
          subtitle="Log transaction-based income and monitor your GST registration threshold."
        />
        <Button onClick={() => openModal()} className="shadow-sm">
          <Plus className="w-4 h-4" /> Log Revenue
        </Button>
      </div>

      {gstLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : gstStatus ? (
        <div
          className={`glass-card p-6 border-l-4 ${
            gstStatus.status === "safe"
              ? "border-l-green-500"
              : gstStatus.status === "warning"
                ? "border-l-yellow-500"
                : "border-l-red-500"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Financial Year {gstStatus.financialYear}
                </h3>
                {gstStatus.status === "safe" && (
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1 inline" /> Safe
                  </Badge>
                )}
                {gstStatus.status === "warning" && (
                  <Badge variant="warning">
                    <AlertTriangle className="w-3 h-3 mr-1 inline" /> Approaching Limit
                  </Badge>
                )}
                {gstStatus.status === "mandatory" && (
                  <Badge variant="danger">
                    <AlertTriangle className="w-3 h-3 mr-1 inline" /> GST Mandatory
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                You have collected{" "}
                <strong className="text-[var(--color-text-primary)]">
                  ₹{gstStatus.totalRevenue.toLocaleString("en-IN")}
                </strong>{" "}
                this FY. The mandatory GST registration threshold is ₹
                {gstStatus.gstLimit.toLocaleString("en-IN")}.
              </p>
            </div>

            <div className="w-full md:w-1/2">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[var(--color-text-secondary)]">
                  0
                </span>
                <span className="font-semibold text-red-500">20L Limit</span>
              </div>
              <div className="w-full bg-[var(--color-bg-base)] rounded-full h-3 overflow-hidden border border-[var(--color-border)]">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    gstStatus.status === "safe"
                      ? "bg-green-500"
                      : gstStatus.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${gstStatus.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[var(--color-text-muted)]">
                <span>{gstStatus.percentage}% reached</span>
                <span>Est. {gstStatus.studentCount} interns total</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Revenue Logs
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="All">All Months</option>
              {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <input
              type="number"
              className="w-20 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={revenue}
          loading={revLoading}
          emptyMessage={`No revenue logged for ${filterYear}`}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Revenue Log" : "Log New Revenue"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Category
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Title / Identifier"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Batch 2026, or Project Alpha"
              required
            />

            <Input
              label="Amount Collected (₹)"
              type="number"
              value={totalCollected}
              onChange={(e) => setTotalCollected(e.target.value)}
              required
            />
            
            {category === 'Internships' && (
              <Input
                label="Number of Students"
                type="number"
                value={numberOfStudents}
                onChange={(e) => setNumberOfStudents(e.target.value)}
              />
            )}

            <div className={`p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg space-y-4 ${category === 'Internships' ? '' : 'md:col-span-2'}`}>
              <Toggle
                label="GST Applied / Applicable?"
                checked={gstApplicable}
                onChange={setGstApplicable}
              />
              {gstApplicable && (
                <Input
                  label="GST Amount Included/Paid (₹)"
                  type="number"
                  value={gstAmount}
                  onChange={(e) => setGstAmount(e.target.value)}
                />
              )}
            </div>

            <div className="md:col-span-2">
              <Input
                label="Notes / Breakdown"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional details..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? "Save Changes" : "Log Record"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RevenueGstTracker;
