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
import {
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  Rocket,
  ChevronRight,
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import {
  internsApi,
  usersApi,
  batchesApi,
  profilesApi,
  internshipsApi,
} from "../../api";
import toast from "react-hot-toast";

const generateTempPassword = () => Math.random().toString(36).slice(-8) + "A1!";

const InternRegistrations = () => {
  const {
    data: internData,
    loading: internLoading,
    execute: fetchInterns,
  } = useApi(internsApi.getAll);
  const { data: batchData, loading: batchLoading } = useApi(() =>
    batchesApi.getAll({ status: "upcoming" }),
  );
  const { data: profData } = useApi(profilesApi.getAll);
  const { data: internRolesData } = useApi(internshipsApi.getAll);
  const { data: usersData } = useApi(() => usersApi.getAll({ isActive: true }));

  const interns = internData?.interns || [];
  const batches = batchData?.batches || [];
  const profiles = profData?.profiles || [];
  const internRoles = internRolesData?.internships || [];
  const users = usersData?.users || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Single Approval State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvalBatchId, setApprovalBatchId] = useState("");
  const [approvalWorkMode, setApprovalWorkMode] = useState("Remote");

  // Basic & User Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [profileId, setProfileId] = useState("");

  // Intern Registration Details
  const [internshipId, setInternshipId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [receiptNumber, setReceiptNumber] = useState("");

  const pendingInterns = interns.filter(
    (i) => i.registrationStatus === "pending",
  );

  const activeInterns = interns.filter(
    (i) => i.registrationStatus === "approved",
  );

  const openModal = () => {
    setName("");
    setEmail("");
    setPhone("");
    setProfileId(
      profiles.find((p) => p.label.toLowerCase() === "intern")?._id ||
        profiles[0]?._id ||
        "",
    );
    setPassword(generateTempPassword());
    setInternshipId("");
    setBatchId("");
    setCollege("");
    setCourse("");
    setPaymentStatus("pending");
    setReceiptNumber("");
    setModalOpen(true);
  };

  const openDetailsModal = (intern) => {
    setSelectedIntern(intern);
    setDetailsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileId || !internshipId)
      return toast.error("Please select a profile and an internship role");

    setSubmitting(true);
    try {
      // 1. Create User
      const userRes = await usersApi.create({
        name,
        email,
        password,
        phone,
        profileId,
      });
      const userId = userRes.data.user._id;

      // 2. Create Intern
      await internsApi.create({
        userId,
        internshipId,
        batchId: batchId || undefined,
        college,
        course,
        paymentStatus,
        receiptNumber,
      });

      toast.success("Intern registered successfully!");
      setModalOpen(false);
      fetchInterns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register intern");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action, row) => {
    if (action === "approve") {
      setSelectedIntern(row);
      setApprovalBatchId("");
      setApprovalWorkMode("Remote");
      setApproveModalOpen(true);
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this intern?`)) return;
    try {
      if (action === "reject") await internsApi.reject(id);
      toast.success(`Intern ${action}d successfully`);
      fetchInterns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleApproveConfirm = async (e) => {
    e.preventDefault();
    if (!approvalBatchId) return toast.error("Please select a batch");

    setSubmitting(true);
    try {
      await internsApi.approve(selectedIntern._id, {
        batchId: approvalBatchId,
        workMode: approvalWorkMode,
      });
      toast.success("Intern approved and onboarded successfully!");
      setApproveModalOpen(false);
      fetchInterns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewCertificate = async (internId) => {
    try {
      const res = await internsApi.previewCertificate(internId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      toast.error("Failed to generate preview");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Intern",
      render: (_, row) => (
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => openDetailsModal(row)}
        >
          <GraduationCap className="w-4 h-4 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
          <div>
            <div className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
              {row.userId?.name || "N/A"}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {row.userId?.email || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "batch",
      label: "Enrollment",
      render: (_, row) => (
        <div>
          <div className="text-sm font-bold text-[var(--color-primary)]">
            {row.internshipId?.title ||
              row.batchId?.batchName ||
              "Role Not Assigned"}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.batchId
              ? `Batch: ${row.batchId.batchName}`
              : "Unassigned to Batch"}
          </div>
        </div>
      ),
    },
    {
      key: "education",
      label: "Education",
      render: (_, row) => (
        <div>
          <div className="text-sm">{row.college}</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.course}
          </div>
        </div>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      render: (_, row) => (
        <Badge
          variant={row.paymentStatus === "completed" ? "success" : "warning"}
        >
          {row.paymentStatus}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        if (row.registrationStatus === "approved")
          return <Badge variant="success">Approved</Badge>;
        if (row.registrationStatus === "rejected")
          return <Badge variant="danger">Rejected</Badge>;
        return <Badge variant="warning">Pending</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) =>
        row.registrationStatus === "pending" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction(row._id, "approve", row)}
              className="p-1.5 text-green-500 hover:text-green-600 transition-colors rounded-md hover:bg-green-500/10"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction(row._id, "reject")}
              className="p-1.5 text-red-500 hover:text-red-600 transition-colors rounded-md hover:bg-red-500/10"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePreviewCertificate(row._id)}
              className="p-1.5 text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors rounded-md hover:bg-[var(--color-primary)]/10"
              title="Preview Certificate"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader
        title="Registration & Onboarding"
        subtitle="Approve intern batches, send offer letters, and manage new intake."
        action={
          <Button
            onClick={openModal}
            variant="ghost"
            className="border-dashed border-[var(--color-border)]"
          >
            <UserPlus className="w-4 h-4" /> Manual Register
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {/* Pending Registrations List */}
        <Card title={`Pending Registrations (${pendingInterns.length})`}>
          <Table
            columns={columns}
            data={pendingInterns}
            loading={internLoading}
            emptyMessage="No pending registrations"
          />
        </Card>

        {/* Active Interns List */}
        <Card title={`Active / Approved Interns (${activeInterns.length})`}>
          <Table
            columns={columns}
            data={activeInterns}
            loading={internLoading}
            emptyMessage="No active interns"
          />
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Intern"
        size="2xl"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-8 h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          {/* Section: Basic Details */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              Basic Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                  Access Profile
                </label>
                <select
                  className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  required
                >
                  {profiles.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Temporary Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  This password will be required for their first login to the
                  Intern Portal.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Internship & Batch Placement */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              Internship & Batch Placement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="College Name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
              />
              <Input
                label="Course/Degree"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                  Internship Role
                </label>
                <select
                  className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                  value={internshipId}
                  onChange={(e) => {
                    setInternshipId(e.target.value);
                    setBatchId(""); // Reset batch when role changes
                  }}
                  required
                >
                  <option value="" disabled>
                    Select an internship role...
                  </option>
                  {internRoles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.title} ({role.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                  Assign to Batch (Internal)
                </label>
                <select
                  className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  disabled={!internshipId}
                >
                  <option value="">-- Unassigned / Pool --</option>
                  {batches
                    .filter(
                      (b) =>
                        b.internshipId?._id === internshipId ||
                        b.internshipId === internshipId,
                    )
                    .map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchName}
                      </option>
                    ))}
                </select>
                {!internshipId && (
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Select a role first to see available batches.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Payment Details */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              Payment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                  Payment Status
                </label>
                <select
                  className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <Input
                label="Receipt Number (Optional)"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-[var(--color-bg-base)] pt-4 pb-2 border-t border-[var(--color-border)] flex justify-end gap-3 z-10">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Register Intern
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Intern Profile Details"
        size="lg"
      >
        {selectedIntern && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {selectedIntern.userId?.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {selectedIntern.userId?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Personal & Academic
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Phone
                    </span>
                    <span className="font-medium">
                      {selectedIntern.userId?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      College
                    </span>
                    <span className="font-medium">
                      {selectedIntern.college}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Course
                    </span>
                    <span className="font-medium">{selectedIntern.course}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Internship Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Program
                    </span>
                    <span className="font-medium text-[var(--color-primary)]">
                      {selectedIntern.internshipId?.title || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Batch
                    </span>
                    <span className="font-medium">
                      {selectedIntern.batchId?.batchName || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Domain
                    </span>
                    <span className="font-medium">
                      {selectedIntern.internshipId?.domain ||
                        selectedIntern.batchId?.domain}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Status
                    </span>
                    <Badge
                      variant={
                        selectedIntern.registrationStatus === "approved"
                          ? "success"
                          : "warning"
                      }
                    >
                      {selectedIntern.registrationStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-4 bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)]">
                <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Payment Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Payment Status
                    </span>
                    <Badge
                      variant={
                        selectedIntern.paymentStatus === "completed"
                          ? "success"
                          : "warning"
                      }
                      className="w-fit mt-1"
                    >
                      {selectedIntern.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Receipt / Payment ID
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--color-text-primary)] mt-1">
                      {selectedIntern.receiptNumber || "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
              <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Intern Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve & Onboard Intern"
        size="md"
      >
        <form onSubmit={handleApproveConfirm} className="space-y-6">
          <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--color-text-primary)]">
                  {selectedIntern?.userId?.name}
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {selectedIntern?.internshipId?.title || "No Role Assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Assign to Batch
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                value={approvalBatchId}
                onChange={(e) => setApprovalBatchId(e.target.value)}
                required
              >
                <option value="">-- Select Batch --</option>
                {batches
                  .filter(
                    (b) =>
                      b.internshipId?._id ===
                        selectedIntern?.internshipId?._id ||
                      b.internshipId === selectedIntern?.internshipId?._id,
                  )
                  .map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchName} (
                      {new Date(b.startDate).toLocaleDateString()})
                    </option>
                  ))}
              </select>
              {batches.filter(
                (b) =>
                  b.internshipId?._id === selectedIntern?.internshipId?._id ||
                  b.internshipId === selectedIntern?.internshipId?._id,
              ).length === 0 && (
                <p className="text-[10px] text-red-500 mt-1">
                  No upcoming batches found for this internship role.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Work Mode
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                value={approvalWorkMode}
                onChange={(e) => setApprovalWorkMode(e.target.value)}
                required
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex gap-3">
            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-yellow-700 leading-relaxed">
              Upon approval, an offer letter will be automatically generated and
              sent to the intern's email address.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Approve & Send Offer Letter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InternRegistrations;
