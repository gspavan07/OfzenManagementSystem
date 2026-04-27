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
  Spinner,
} from "../../components/ui";
import { Shield, Plus, Edit2, Trash2, Copy } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { profilesApi } from "../../api";
import toast from "react-hot-toast";

// Define the shape and grouping of permissions for the UI
const PERMISSION_GROUPS = [
  {
    key: "employees",
    label: "Employee Management",
    actions: [
      { key: "view", label: "View All" },
      { key: "viewDetails", label: "View Details" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "payroll",
    label: "Payroll & Salary",
    actions: [
      { key: "view", label: "View Payrolls" },
      { key: "generate", label: "Generate Monthly" },
      { key: "viewDeductions", label: "View Deductions" },
      { key: "markPaid", label: "Mark as Paid" },
      { key: "downloadOwn", label: "Download Own Payslip" },
    ],
  },
  {
    key: "revenue",
    label: "Revenue Tracker",
    actions: [
      { key: "view", label: "View Revenue" },
      { key: "export", label: "Export Data" },
    ],
  },
  {
    key: "gstTracker",
    label: "GST Tracker",
    actions: [{ key: "view", label: "View GST Liability" }],
  },
  {
    key: "expenseTracker",
    label: "Expense Tracker",
    actions: [
      { key: "view", label: "View Expenses" },
      { key: "create", label: "Log Expense" },
      { key: "edit", label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "internBatches",
    label: "Intern Batches",
    actions: [
      { key: "view", label: "View Batches" },
      { key: "create", label: "Create Batch" },
      { key: "edit", label: "Edit Batch" },
      { key: "delete", label: "Delete Batch" },
      { key: "assignMentor", label: "Assign Mentor" },
    ],
  },
  {
    key: "internRegistrations",
    label: "Intern Registrations",
    actions: [
      { key: "view", label: "View Applications" },
      { key: "approve", label: "Approve" },
      { key: "reject", label: "Reject" },
    ],
  },
  {
    key: "internSelf",
    label: "Intern Self-Service",
    actions: [
      { key: "viewProfile", label: "View Own Profile" },
      { key: "viewSchedule", label: "View Schedule" },
      { key: "viewMilestones", label: "View Milestones" },
      { key: "submitWork", label: "Submit Tasks" },
      { key: "viewFeedback", label: "View Feedback" },
      { key: "downloadCertificate", label: "Download Certificate" },
      { key: "viewOfferLetter", label: "View Offer Letter" },
    ],
  },
  {
    key: "mentorTools",
    label: "Mentor Tools",
    actions: [
      { key: "viewAssignedBatches", label: "View Own Batches" },
      { key: "viewInternProfiles", label: "View Intern Profiles" },
      { key: "markAttendance", label: "Mark Attendance" },
      { key: "giveFeedback", label: "Give Feedback" },
      { key: "flagAtRisk", label: "Flag Intern At Risk" },
      { key: "completeMilestone", label: "Mark Milestone Complete" },
    ],
  },
  {
    key: "announcements",
    label: "Noticeboard",
    actions: [
      { key: "view", label: "View Announcements" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "mailSystem",
    label: "Mail & Documents",
    actions: [
      { key: "sendOfferLetter", label: "Send Offer Letter" },
      { key: "sendCertificate", label: "Send Certificate" },
      { key: "sendPayslip", label: "Send Payslip" },
      { key: "sendCustomMail", label: "Compose Custom Mail" },
      { key: "configureSmtp", label: "Configure SMTP" },
    ],
  },
  {
    key: "profileManagement",
    label: "Profiles & Permissions",
    actions: [
      { key: "view", label: "View Profiles" },
      { key: "create", label: "Create Profile" },
      { key: "edit", label: "Edit Profile" },
      { key: "delete", label: "Delete Profile" },
      { key: "assignToUser", label: "Assign to Employee" },
    ],
  },
];

const getDefaultPermissions = () => {
  const perms = {};
  PERMISSION_GROUPS.forEach((g) => {
    perms[g.key] = {};
    g.actions.forEach((a) => {
      perms[g.key][a.key] = false;
    });
  });
  return perms;
};

const ProfileBuilder = () => {
  const { data, loading, execute: fetchProfiles } = useApi(profilesApi.getAll);
  const profiles = data?.profiles || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  // Form state
  const [label, setLabel] = useState("");
  const [permissions, setPermissions] = useState(getDefaultPermissions());
  const [submitting, setSubmitting] = useState(false);

  const openModal = (profile = null, clone = false) => {
    if (profile) {
      setLabel(clone ? `${profile.label} (Copy)` : profile.label);

      // Deep merge permissions to ensure any new keys not in the DB are present as false
      const mergedPerms = getDefaultPermissions();
      Object.keys(profile.permissions || {}).forEach((groupKey) => {
        if (mergedPerms[groupKey]) {
          Object.keys(profile.permissions[groupKey]).forEach((actionKey) => {
            if (mergedPerms[groupKey][actionKey] !== undefined) {
              mergedPerms[groupKey][actionKey] =
                profile.permissions[groupKey][actionKey];
            }
          });
        }
      });
      setPermissions(mergedPerms);
      setEditingProfile(clone ? null : profile);
    } else {
      setLabel("");
      setPermissions(getDefaultPermissions());
      setEditingProfile(null);
    }
    setModalOpen(true);
  };

  const handleToggle = (groupKey, actionKey, value) => {
    setPermissions((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        [actionKey]: value,
      },
    }));
  };

  const handleSelectGroup = (groupKey, state) => {
    setPermissions((prev) => {
      const newGroup = { ...prev[groupKey] };
      Object.keys(newGroup).forEach((k) => (newGroup[k] = state));
      return { ...prev, [groupKey]: newGroup };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) return toast.error("Profile name is required");

    setSubmitting(true);
    try {
      const payload = { label, permissions };
      if (editingProfile) {
        await profilesApi.update(editingProfile._id, payload);
        toast.success("Profile updated");
      } else {
        await profilesApi.create(payload);
        toast.success("Profile created");
      }
      setModalOpen(false);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      await profilesApi.delete(id);
      toast.success("Profile deleted");
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const columns = [
    {
      key: "label",
      label: "Profile Name",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="font-medium text-[var(--color-text-primary)]">
            {val}
          </span>
          {row.isDefault && <Badge variant="primary">System Default</Badge>}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (val) => new Date(val).toLocaleDateString(),
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
            onClick={() => openModal(row, true)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-green-500 transition-colors rounded-md hover:bg-white/5"
            title="Clone"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!row.isDefault && (
            <button
              onClick={() => handleDelete(row._id)}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors rounded-md hover:bg-white/5"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader
        title="Access Profiles"
        subtitle="Create and manage permission groups for employees."
        action={
          <Button onClick={() => openModal()} className="shadow-sm">
            <Plus className="w-4 h-4" /> New Profile
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={profiles} loading={loading} />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProfile ? "Edit Profile" : "Create Profile"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Profile Name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={editingProfile?.isDefault}
            placeholder="e.g., HR Assistant"
            required
            autoFocus
          />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2">
              Permissions Map
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {PERMISSION_GROUPS.map((group) => (
                <div
                  key={group.key}
                  className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-border)]/50">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {group.label}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectGroup(group.key, true)}
                        className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectGroup(group.key, false)}
                        className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] hover:text-red-400"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {group.actions.map((action) => (
                      <Toggle
                        key={action.key}
                        label={action.label}
                        checked={permissions[group.key]?.[action.key] || false}
                        onChange={(val) =>
                          handleToggle(group.key, action.key, val)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingProfile ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileBuilder;
