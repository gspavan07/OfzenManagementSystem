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
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(null);

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

  // Onboarding Form State
  const [onboardStart, setOnboardStart] = useState("");
  const [onboardEnd, setOnboardEnd] = useState("");
  const [onboardMentor, setOnboardMentor] = useState("");
  const [onboardStipend, setOnboardStipend] = useState(0);

  // Group interns by batch for the main view
  const batchesWithPending = batches
    .map((batch) => {
      const pendingCount = interns.filter(
        (i) =>
          i.batchId?._id === batch._id && i.registrationStatus === "pending",
      ).length;
      return { ...batch, pendingCount };
    })
    .filter((b) => b.pendingCount > 0);

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

  const openBatchModal = (batch) => {
    setSelectedBatch(batch);
    setBatchModalOpen(true);
  };

  const openOnboardModal = (batch) => {
    setSelectedBatch(batch);
    setOnboardStart(
      batch.startDate
        ? new Date(batch.startDate).toISOString().split("T")[0]
        : "",
    );
    setOnboardEnd(
      batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "",
    );
    setOnboardMentor(batch.mentorId?._id || "");
    setOnboardStipend(batch.stipend || 0);
    setOnboardModalOpen(true);
  };

  const handleBulkOnboard = async (e) => {
    e.preventDefault();
    if (
      !confirm(
        `Are you sure you want to approve all ${selectedBatch.pendingCount} interns and send their offer letters?`,
      )
    )
      return;

    setSubmitting(true);
    try {
      const res = await batchesApi.onboard(selectedBatch._id, {
        startDate: onboardStart,
        endDate: onboardEnd,
        mentorId: onboardMentor,
        stipend: Number(onboardStipend),
      });

      toast.success(
        `Successfully onboarded ${res.data.results.success} interns!`,
      );
      setOnboardModalOpen(false);
      setBatchModalOpen(false);
      fetchInterns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Onboarding failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this intern?`)) return;
    try {
      if (action === "approve") await internsApi.approve(id);
      if (action === "reject") await internsApi.reject(id);
      toast.success(`Intern ${action}d successfully`);
      fetchInterns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
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
              onClick={() => handleAction(row._id, "approve")}
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
        ) : null,
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
        {/* Pending Batches Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Rocket className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Batches Awaiting Onboarding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchesWithPending.length > 0 ? (
              batchesWithPending.map((batch) => (
                <Card
                  key={batch._id}
                  className="group hover:border-[var(--color-primary)] transition-all cursor-pointer"
                  onClick={() => openBatchModal(batch)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg group-hover:bg-[var(--color-primary)]/20 transition-colors">
                      <Users className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <Badge variant="warning" className="animate-pulse">
                      {batch.pendingCount} Pending
                    </Badge>
                  </div>

                  <h3 className="font-bold text-[var(--color-text-primary)] mb-1">
                    {batch.batchName}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                    {batch.domain}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      Created {new Date(batch.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-primary)] font-bold text-xs">
                      Review <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="md:col-span-3 py-12 flex flex-col items-center justify-center bg-[var(--color-bg-elevated)] rounded-2xl border-2 border-dashed border-[var(--color-border)]">
                <ShieldCheck className="w-12 h-12 text-[var(--color-text-muted)] mb-3 opacity-20" />
                <p className="text-[var(--color-text-muted)] font-medium">
                  All clear! No pending batch approvals.
                </p>
              </div>
            )}
          </div>
        </section>

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

      {/* Batch Drill-down Modal */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title={
          selectedBatch ? `Reviewing Batch: ${selectedBatch.batchName}` : ""
        }
        size="4xl"
      >
        {selectedBatch && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/20">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)]">
                  Ready for Onboarding?
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Confirm details below to approve all{" "}
                  {selectedBatch.pendingCount} students and send offer letters.
                </p>
              </div>
              <Button
                onClick={() => openOnboardModal(selectedBatch)}
                className="shadow-lg shadow-primary/20"
              >
                <Rocket className="w-4 h-4 mr-2" /> Onboard & Approve Batch
              </Button>
            </div>

            <Table
              columns={columns}
              data={interns.filter(
                (i) =>
                  i.batchId?._id === selectedBatch._id &&
                  i.registrationStatus === "pending",
              )}
              emptyMessage="No pending students in this batch."
            />
          </div>
        )}
      </Modal>

      {/* Bulk Onboarding Config Modal */}
      <Modal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        title="Finalize Onboarding Details"
        size="lg"
      >
        <form onSubmit={handleBulkOnboard} className="space-y-6">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-xs text-yellow-700 leading-relaxed">
              <strong>Action Required:</strong> Please confirm the final dates
              and stipend for this batch. Once you click "Start Onboarding",
              offer letters will be generated and sent to all pending interns in
              this batch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={onboardStart}
              onChange={(e) => setOnboardStart(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={onboardEnd}
              onChange={(e) => setOnboardEnd(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
                Assign Mentor
              </label>
              <select
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                value={onboardMentor}
                onChange={(e) => setOnboardMentor(e.target.value)}
                required
              >
                <option value="">-- Select Mentor --</option>
                {users
                  .filter((u) => u.profileId?.label !== "Intern")
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              label="Stipend (Monthly ₹)"
              type="number"
              value={onboardStipend}
              onChange={(e) => setOnboardStipend(e.target.value)}
              placeholder="0 for unpaid"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setOnboardModalOpen(false)}
            >
              Back
            </Button>
            <Button type="submit" loading={submitting}>
              Start Onboarding & Send Mails
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
    </div>
  );
};

export default InternRegistrations;
