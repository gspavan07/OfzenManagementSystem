import { useState } from "react";
import {
  SectionHeader,
  Card,
  Table,
  Button,
  Modal,
  Input,
  Badge,
  Select,
} from "../../components/ui";
import { BookOpen, Plus, Edit2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { batchesApi, usersApi, internshipsApi } from "../../api";
import toast from "react-hot-toast";

const DOMAIN_OPTIONS = ["Full Stack", "Frontend", "UI/UX", "AI + Full Stack"];
const STATUS_OPTIONS = ["upcoming", "active", "completed"];

const InternBatches = () => {
  const {
    data: batchData,
    loading: batchesLoading,
    execute: fetchBatches,
  } = useApi(batchesApi.getAll);
  const { data: usersData, loading: usersLoading } = useApi(() =>
    usersApi.getAll({ isActive: true }),
  );
  const { data: internRolesData } = useApi(internshipsApi.getAll);

  const batches = batchData?.batches || [];
  const users = usersData?.users || [];
  const internRoles = internRolesData?.internships || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [internshipId, setInternshipId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [domain, setDomain] = useState(DOMAIN_OPTIONS[0]);
  const [stack, setStack] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [fee, setFee] = useState(899);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);

  const openModal = (batch = null) => {
    if (batch) {
      setEditingId(batch._id);
      setInternshipId(batch.internshipId?._id || batch.internshipId || "");
      setBatchName(batch.batchName);
      setDomain(batch.domain);
      setStack(batch.stack || "");
      setDurationWeeks(batch.durationWeeks);
      setStartDate(new Date(batch.startDate).toISOString().split("T")[0]);
      setEndDate(new Date(batch.endDate).toISOString().split("T")[0]);
      setMentorId(batch.mentorId?._id || "");
      setFee(batch.fee);
      setStatus(batch.status);
    } else {
      setEditingId(null);
      setInternshipId("");
      setBatchName("");
      setDomain(DOMAIN_OPTIONS[0]);
      setStack("");
      setDurationWeeks(8);
      setStartDate("");
      setEndDate("");
      setMentorId("");
      setFee(899);
      setStatus(STATUS_OPTIONS[0]);
    }
    setModalOpen(true);
  };

  const handleRoleChange = (roleId) => {
    setInternshipId(roleId);
    const role = internRoles.find(r => r._id === roleId);
    if (role) {
      setDomain(role.domain);
      setFee(role.fee);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        internshipId,
        batchName,
        domain,
        stack,
        durationWeeks,
        startDate,
        endDate,
        mentorId,
        fee,
        status,
      };
      if (editingId) {
        await batchesApi.update(editingId, payload);
        toast.success("Batch updated successfully");
      } else {
        await batchesApi.create(payload);
        toast.success("Batch created successfully");
      }
      setModalOpen(false);
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "upcoming":
        return <Badge variant="warning">Upcoming</Badge>;
      case "completed":
        return <Badge variant="info">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "batchName",
      label: "Batch Name",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-primary)]">
            {val}
          </span>
        </div>
      ),
    },
    {
      key: "domain",
      label: "Domain",
      render: (_, row) => (
        <div>
          <div className="font-medium text-[var(--color-text-primary)]">
            {row.domain}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.stack}
          </div>
        </div>
      ),
    },
    {
      key: "timeline",
      label: "Timeline",
      render: (_, row) => (
        <div>
          <div className="text-sm">
            {new Date(row.startDate).toLocaleDateString()} to{" "}
            {new Date(row.endDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.durationWeeks} weeks
          </div>
        </div>
      ),
    },
    {
      key: "mentor",
      label: "Mentor",
      render: (_, row) => row.mentorId?.name || "Unassigned",
    },
    { key: "internCount", label: "Interns", render: (val) => val || 0 },
    { key: "status", label: "Status", render: (val) => getStatusBadge(val) },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <button
          onClick={() => openModal(row)}
          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-white/5"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader
        title="Intern Batches"
        subtitle="Manage upcoming, active, and completed internship cohorts."
        action={
          <Button onClick={() => openModal()} className="shadow-sm">
            <Plus className="w-4 h-4" /> Create Batch
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={batches} loading={batchesLoading} />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Batch" : "Create Batch"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Internship Role (Parent)
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                value={internshipId}
                onChange={(e) => handleRoleChange(e.target.value)}
                required
              >
                <option value="">-- Select Internship Role --</option>
                {internRoles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.title} ({role.domain})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Batch Name (Internal)"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              required
              placeholder="e.g. FSD - April '26 Pool 1"
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Domain
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Stack / Technologies"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="e.g. MERN, React, Node"
            />
            <Input
              label="Duration (Weeks)"
              type="number"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Assign Mentor
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.profileId?.label})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Status
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Fee (₹)"
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
            />
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
              {editingId ? "Save Changes" : "Create Batch"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InternBatches;
