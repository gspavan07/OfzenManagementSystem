import { useState } from "react";
import {
  SectionHeader,
  Card,
  Table,
  Button,
  Modal,
  Input,
  Badge,
} from "../../components/ui";
import { BriefcaseBusiness, Plus, Edit2, Trash2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { internshipsApi } from "../../api";
import toast from "react-hot-toast";

const DOMAIN_OPTIONS = ['Full Stack', 'Frontend', 'UI/UX', 'AI + Full Stack'];

const Internships = () => {
  const {
    data: internData,
    loading,
    execute: fetchInternships,
  } = useApi(internshipsApi.getAll);

  const internships = internData?.internships || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(DOMAIN_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [openings, setOpenings] = useState(0);
  const [fee, setFee] = useState(899);
  const [status, setStatus] = useState("active");

  const openModal = (internship = null) => {
    if (internship) {
      setEditingId(internship._id);
      setTitle(internship.title);
      setDomain(internship.domain);
      setDescription(internship.description || "");
      setOpenings(internship.openings);
      setFee(internship.fee);
      setStatus(internship.status);
    } else {
      setEditingId(null);
      setTitle("");
      setDomain(DOMAIN_OPTIONS[0]);
      setDescription("");
      setOpenings(0);
      setFee(899);
      setStatus("active");
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { title, domain, description, openings, fee, status };
      if (editingId) {
        await internshipsApi.update(editingId, payload);
        toast.success("Internship role updated");
      } else {
        await internshipsApi.create(payload);
        toast.success("Internship role created");
      }
      setModalOpen(false);
      fetchInternships();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will not delete batches or interns associated with this role.")) return;
    try {
      await internshipsApi.delete(id);
      toast.success("Internship role deleted");
      fetchInternships();
    } catch (err) {
      toast.error("Failed to delete internship role");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Internship Role",
      render: (val, row) => (
        <div>
          <div className="font-bold text-[var(--color-text-primary)]">{val}</div>
          <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{row.domain}</div>
        </div>
      ),
    },
    {
      key: "fee",
      label: "Fee",
      render: (val) => <span className="font-semibold text-green-500">₹{val.toLocaleString()}</span>,
    },
    {
      key: "openings",
      label: "Openings",
      render: (val) => <Badge variant="secondary">{val || 'No Limit'}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={val === "active" ? "success" : "danger"}>
          {val.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal(row)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-white/5"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors rounded-md hover:bg-white/5"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader
        title="Internship Roles"
        subtitle="Manage available internship positions (e.g. FSD - Intern)."
        action={
          <Button onClick={() => openModal()} className="shadow-sm">
            <Plus className="w-4 h-4" /> Create Role
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          data={internships}
          loading={loading}
          emptyMessage="No internship roles created yet."
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Internship Role" : "Create New Internship Role"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Role Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Development - Intern"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Domain
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
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
              label="Registration Fee (₹)"
              type="number"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              required
            />

            <Input
              label="Indicative Openings"
              type="number"
              value={openings}
              onChange={(e) => setOpenings(Number(e.target.value))}
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Status
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="active">Active (Visible for registration)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the role..."
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
              {editingId ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Internships;
