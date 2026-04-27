import { useState } from "react";
import {
  SectionHeader,
  Card,
  Table,
  Button,
  Modal,
  Input,
  Badge,
  Toggle,
} from "../../components/ui";
import { Megaphone, Plus, Edit2, Trash2, Pin } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { announcementsApi, batchesApi } from "../../api";
import toast from "react-hot-toast";

const Announcements = () => {
  const {
    data,
    loading,
    execute: fetchAnnouncements,
  } = useApi(announcementsApi.getAll);
  const announcements = data?.announcements || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { data: batchesData } = useApi(batchesApi.getAll);
  const batches = batchesData?.batches || [];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [audience, setAudience] = useState("all");
  const [targetBatchId, setTargetBatchId] = useState("");

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setTitle(item.title);
      setContent(item.content);
      setIsPinned(item.isPinned);
      setAudience(item.audience || "all");
      setTargetBatchId(item.targetBatchId || "");
    } else {
      setEditingId(null);
      setTitle("");
      setContent("");
      setIsPinned(false);
      setAudience("all");
      setTargetBatchId("");
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { title, content, isPinned, audience, targetBatchId };
      if (editingId) {
        await announcementsApi.update(editingId, payload);
        toast.success("Announcement updated");
      } else {
        await announcementsApi.create(payload);
        toast.success("Announcement published");
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementsApi.delete(id);
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Announcement",
      render: (_, row) => (
        <div className="flex items-start gap-2">
          <Megaphone
            className={`w-4 h-4 mt-0.5 ${row.isPinned ? "text-yellow-500" : "text-[var(--color-primary)]"}`}
          />
          <div>
            <div className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              {row.title}
              {row.isPinned && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  Pinned
                </Badge>
              )}
            </div>
            <div className="text-sm text-[var(--color-text-muted)] line-clamp-1">
              {row.content}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant="ghost" className="text-[9px] uppercase">
                {row.audience?.replace("_", " ")}
              </Badge>
              {row.audience === "specific_batch" && (
                <Badge
                  variant="ghost"
                  className="text-[9px] uppercase border-primary/30 text-primary"
                >
                  Targeted Batch
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (_, row) => row.createdBy?.name || "Admin",
    },
    {
      key: "date",
      label: "Date",
      render: (val, row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
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
      <SectionHeader
        title="Global Noticeboard"
        subtitle="Publish announcements visible to all employees and interns."
        action={
          <Button onClick={() => openModal()} className="shadow-sm">
            <Plus className="w-4 h-4" /> New Announcement
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          data={announcements}
          loading={loading}
          emptyMessage="No announcements published yet."
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Announcement" : "New Announcement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office Holiday on Friday"
              required
              autoFocus
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Message Content
              </label>
              <textarea
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-focus)] transition-all min-h-[120px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full announcement here..."
                required
              />
            </div>

            <div className="p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Pin className="w-4 h-4" /> Pin to Top
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  This will make the announcement stick to the top of the
                  dashboard.
                </p>
              </div>
              <Toggle checked={isPinned} onChange={setIsPinned} />
            </div>

            <div className="space-y-4 p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["all", "employees", "interns", "specific_batch"].map(
                  (opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAudience(opt)}
                      className={`px-3 py-2 text-xs rounded-md border transition-all ${
                        audience === opt
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : "bg-white/5 border-border text-text-muted hover:border-border-focus"
                      }`}
                    >
                      {opt.replace("_", " ").toUpperCase()}
                    </button>
                  ),
                )}
              </div>

              {audience === "specific_batch" && (
                <div className="pt-2 animate-fade-in">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 block">
                    Select Target Batch
                  </label>
                  <select
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-primary"
                    value={targetBatchId}
                    onChange={(e) => setTargetBatchId(e.target.value)}
                    required
                  >
                    <option value="">Choose a batch...</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchName} ({b.domain})
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              {editingId ? "Save Changes" : "Publish"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;
