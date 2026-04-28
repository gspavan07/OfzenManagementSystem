import { useState, useRef } from "react";
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
  const [durationWeeks, setDurationWeeks] = useState("");
  const [certificate, setCertificate] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");
  const techInputRef = useRef(null);

  const openModal = (internship = null) => {
    if (internship) {
      setEditingId(internship._id);
      setTitle(internship.title);
      setDomain(internship.domain);
      setDescription(internship.description || "");
      setOpenings(internship.openings);
      setFee(internship.fee);
      setStatus(internship.status);
      setDurationWeeks(internship.durationWeeks ?? "");
      setCertificate(internship.certificate || "");
      setTechStack(internship.techStack || []);
    } else {
      setEditingId(null);
      setTitle("");
      setDomain(DOMAIN_OPTIONS[0]);
      setDescription("");
      setOpenings(0);
      setFee(899);
      setStatus("active");
      setDurationWeeks("");
      setCertificate("");
      setTechStack([]);
    }
    setTechInput("");
    setModalOpen(true);
  };

  const addTechTag = (raw) => {
    const tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
    setTechStack((prev) => {
      const merged = [...prev];
      tags.forEach((t) => { if (!merged.includes(t)) merged.push(t); });
      return merged;
    });
    setTechInput("");
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (techInput.trim()) addTechTag(techInput);
    } else if (e.key === "Backspace" && !techInput && techStack.length > 0) {
      setTechStack((prev) => prev.slice(0, -1));
    }
  };

  const removeTechTag = (tag) => setTechStack((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { title, domain, description, openings, fee, status, durationWeeks: Number(durationWeeks), certificate, techStack };
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
      key: "durationWeeks",
      label: "Duration",
      render: (val) => <span className="text-[var(--color-text-secondary)]">{val ? `${val} wks` : "—"}</span>,
    },
    {
      key: "techStack",
      label: "Tech Stack",
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val || []).map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: "certificate",
      label: "Certificate",
      render: (val) => <span className="text-xs text-[var(--color-text-muted)]">{val || "—"}</span>,
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
              label="Duration (Weeks)"
              type="number"
              min={1}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              placeholder="e.g. 8"
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

            {/* Tech Stack Tag Input */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Tech Stack <span className="text-[var(--color-primary)] ml-0.5">*</span>
              </label>
              <div
                className="w-full min-h-[42px] flex flex-wrap gap-1.5 items-center bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 cursor-text"
                onClick={() => techInputRef.current?.focus()}
              >
                {techStack.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeTechTag(tag); }}
                      className="hover:text-red-400 transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={techInputRef}
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  onBlur={() => { if (techInput.trim()) addTechTag(techInput); }}
                  placeholder={techStack.length === 0 ? "Type & press Enter or comma…" : ""}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Press Enter or comma to add each technology.</p>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Certificate / What We Provide at End"
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                placeholder="e.g. Completion Certificate, LOR, Offer Letter"
                required
              />
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
