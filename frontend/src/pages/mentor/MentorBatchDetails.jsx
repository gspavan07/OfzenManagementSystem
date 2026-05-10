import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SectionHeader, Card, Badge, Button, Modal } from "../../components/ui";
import {
  ShieldCheck,
  Calendar,
  Settings,
  Target,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  Mail,
  FileText,
  BookOpen,
  Award,
  CalendarDays,
  Plus,
  Trash2,
  Link2,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import {
  batchesApi,
  internshipProjectsApi,
  internsApi,
  mailApi,
  internshipsApi,
} from "../../api";
import toast from "react-hot-toast";

const MentorBatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: batchDetails,
    loading: detailsLoading,
    execute: fetchDetails,
  } = useApi(() => (id ? batchesApi.getById(id) : null));

  // Settings State
  const [mentorDay, setMentorDay] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Project Assignment State
  const [assigningIntern, setAssigningIntern] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Mail Modal State
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [targetIntern, setTargetIntern] = useState(null); // null means batch email
  const [sendingMail, setSendingMail] = useState(false);

  // Progress State
  const [activeTab, setActiveTab] = useState("interns");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [bulking, setBulking] = useState(false);

  // Schedule Editor State
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleWeek, setScheduleWeek] = useState(1);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  const buildBlankWeek = useCallback(
    (weekNum) => ({
      week: weekNum,
      topic: "",
      description: "",
      references: [],
      days: Array.from({ length: 5 }, (_, i) => ({
        day: i + 1,
        topic: "",
        description: "",
        references: [],
      })),
    }),
    [],
  );

  useEffect(() => {
    if (batchDetails?.batch) {
      setMentorDay(batchDetails.batch.mentorDay || "");

      const durationWeeks = batchDetails.batch.internshipId?.durationWeeks || 8;
      const existing = batchDetails.batch.internshipId?.schedule || [];
      const merged = Array.from({ length: durationWeeks }, (_, i) => {
        const weekNum = i + 1;
        const found = existing.find((s) => s.week === weekNum);
        if (found) {
          const days = Array.from({ length: 5 }, (_, d) => {
            const dayNum = d + 1;
            const existingDay = found.days?.find((dd) => dd.day === dayNum);
            return existingDay
              ? { ...existingDay, references: existingDay.references || [] }
              : { day: dayNum, topic: "", description: "", references: [] };
          });
          return { ...found, references: found.references || [], days };
        }
        return buildBlankWeek(weekNum);
      });
      setScheduleData(merged);
    }
  }, [batchDetails, buildBlankWeek]);

  const updateBatchSettings = async () => {
    setUpdatingSettings(true);
    try {
      await batchesApi.update(id, { mentorDay });
      toast.success("Batch settings updated");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const openMailModal = (intern = null) => {
    setTargetIntern(intern);
    setMailSubject("");
    setMailBody("");
    setMailModalOpen(true);
  };

  const handleSendCustomMail = async () => {
    if (!mailSubject || !mailBody) {
      return toast.error("Subject and message are required");
    }

    setSendingMail(true);
    try {
      let result;
      if (targetIntern) {
        // Individual email
        const { data } = await mailApi.sendCustom({
          toEmail: targetIntern.userId.email,
          toName: targetIntern.userId.name,
          subject: mailSubject,
          body: mailBody,
        });
        result = data;
      } else {
        // Batch email
        const { data } = await mailApi.sendBatch({
          batchId: id,
          subject: mailSubject,
          body: mailBody,
        });
        result = data;
      }

      if (result.via === "manual") {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-orange-500">
                SMTP Not Configured!
              </span>
              <span className="text-xs">
                Your email was logged as "Manual" and not sent. Please set up
                your SMTP in settings.
              </span>
              <Button
                size="sm"
                variant="primary"
                className="w-fit h-7 text-[10px] py-0"
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/settings/mail");
                }}
              >
                Go to Mail Settings
              </Button>
            </div>
          ),
          { duration: 6000 },
        );
      } else {
        toast.success(
          targetIntern
            ? `Email sent to ${targetIntern.userId.name}`
            : "Batch emails sent successfully",
        );
      }
      setMailModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setSendingMail(false);
    }
  };

  const openAssignModal = async (intern) => {
    setAssigningIntern(intern);
    setProjectsLoading(true);
    try {
      const res = await internshipProjectsApi.getByInternship(
        intern.internshipId._id,
      );
      if (res.data.success) setAvailableProjects(res.data.projects);
    } catch (err) {
      toast.error("Failed to fetch project templates");
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleAssignProject = async (project) => {
    try {
      await internsApi.assignProject({
        internId: assigningIntern._id,
        batchId: id,
        projectTitle: project.title,
        brief: project.description,
        milestones: project.requirements
          ? [
              {
                week: 1,
                title: "Project Start",
                description: project.requirements,
              },
            ]
          : [],
      });
      toast.success(
        `Project "${project.title}" assigned to ${assigningIntern.userId.name}`,
      );
      setAssigningIntern(null);
      fetchDetails();
    } catch (err) {
      toast.error("Failed to assign project");
    }
  };

  const handleMarkWeek = async (internId, weekNumber, completed) => {
    try {
      await internsApi.markWeekCompleted(internId, { weekNumber, completed });
      toast.success(`Week ${weekNumber} updated`);
      fetchDetails();
    } catch (err) {
      toast.error("Failed to update week");
    }
  };

  const handleBulkMark = async (completed) => {
    setBulking(true);
    try {
      await batchesApi.bulkMarkWeek(id, {
        weekNumber: selectedWeek,
        completed,
      });
      toast.success(`Week ${selectedWeek} updated for everyone`);
      fetchDetails();
    } catch (err) {
      toast.error("Bulk update failed");
    } finally {
      setBulking(false);
    }
  };

  const handlePreviewCertificate = async (intern) => {
    if (intern.certificateGenerated && intern.certificateUrl) {
      window.open(intern.certificateUrl, "_blank");
      return;
    }

    try {
      const res = await internsApi.previewCertificate(intern._id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      toast.error("Failed to generate preview");
    }
  };

  const handleGenerateCertificate = async (internId) => {
    try {
      await internsApi.generateCertificate(internId);
      toast.success("Certificate generated successfully!");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to generate certificate");
    }
  };

  const handleSendCertificate = async (internId) => {
    try {
      await internsApi.sendCertificate(internId);
      toast.success("Certificate sent to intern's email!");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to send certificate");
    }
  };

  if (detailsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!batchDetails) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-500">Batch not found</h2>
        <Button onClick={() => navigate("/mentor/batches")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { batch, interns } = batchDetails;

  return (
    <div className="space-y-6 min-h-screen animate-fade-in pb-20">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate("/mentor/batches")}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--color-text-muted)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <SectionHeader
          title={batch.batchName}
          subtitle={`Manage interns and curriculum for the ${batch.internshipId?.title} program.`}
        />
      </div>

      <div className="flex border-b border-[var(--color-border)] mb-6 overflow-x-auto">
        {[
          { key: "interns", label: "Interns & Projects" },
          { key: "progress", label: "Batch Progress" },
          { key: "certificates", label: "Certificates" },
          { key: "schedule", label: "Weekly Schedule" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Content based on Tab */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "interns" ? (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
                      Enrolled Interns
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{interns?.length} Total</Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openMailModal(null)}
                      className="text-orange-500 hover:bg-orange-500/10 border-orange-500/20"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      Send Batch Email
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                        <th className="pb-4 font-semibold px-2">Intern</th>
                        <th className="pb-4 font-semibold px-2 text-center">
                          Project Status
                        </th>
                        <th className="pb-4 font-semibold px-2 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {interns?.map((intern) => (
                        <tr
                          key={intern._id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="py-4 px-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-[var(--color-text-primary)]">
                                {intern.userId?.name}
                              </span>
                              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />{" "}
                                  {intern.userId?.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Badge
                              variant={
                                intern.projectAssigned ? "success" : "warning"
                              }
                              className="px-3 py-1"
                            >
                              {intern.projectAssigned
                                ? "Project Assigned"
                                : "No Project"}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openMailModal(intern)}
                                className="shadow-sm border-[var(--color-border)] text-orange-500 hover:bg-orange-500/10"
                                title="Send individual mail"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openAssignModal(intern)}
                                className="shadow-sm border-[var(--color-border)]"
                              >
                                <Target className="w-3.5 h-3.5 mr-1.5" />
                                {intern.projectAssigned ? "Reassign" : "Assign"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ) : activeTab === "certificates" ? (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
                      Intern Certificates
                    </h3>
                  </div>
                  <Badge variant="secondary">
                    {
                      interns?.filter((i) => i.completionStatus === "completed")
                        .length
                    }{" "}
                    Eligible
                  </Badge>
                </div>

                <div className="space-y-4">
                  {interns?.map((intern) => (
                    <div
                      key={intern._id}
                      className="p-4 bg-white/5 border border-[var(--color-border)] rounded-xl group hover:border-[var(--color-primary)]/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold">
                            {intern.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-text-primary)]">
                              {intern.userId?.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Status:{" "}
                              <span
                                className={
                                  intern.completionStatus === "completed"
                                    ? "text-green-500"
                                    : "text-orange-500"
                                }
                              >
                                {intern.completionStatus || "Ongoing"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {intern.offerLetterUrl && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                window.open(intern.offerLetterUrl, "_blank")
                              }
                              className="shadow-sm border-[var(--color-border)] text-blue-500 hover:bg-blue-500/10"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" />
                              Offer Letter
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePreviewCertificate(intern)}
                            className="shadow-sm border-[var(--color-border)] text-[var(--color-primary)]"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            {intern.certificateGenerated
                              ? "View PDF"
                              : "Preview"}
                          </Button>

                          {intern.completionStatus === "completed" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleGenerateCertificate(intern._id)
                              }
                              disabled={intern.certificateGenerated}
                              className={`shadow-sm border-[var(--color-border)] ${
                                intern.certificateGenerated
                                  ? "opacity-50"
                                  : "text-green-600 hover:bg-green-500/10"
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                              {intern.certificateGenerated
                                ? "Generated"
                                : "Generate"}
                            </Button>
                          )}

                          {intern.certificateGenerated && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSendCertificate(intern._id)}
                              className="shadow-sm border-[var(--color-border)] text-orange-500 hover:bg-orange-500/10"
                            >
                              <Mail className="w-3.5 h-3.5 mr-1.5" />
                              Send Mail
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {interns?.length === 0 && (
                    <div className="text-center py-10 text-[var(--color-text-muted)]">
                      No interns in this batch yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : activeTab === "progress" ? (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
                      Curriculum Progress
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm outline-none"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    >
                      {Array.from({
                        length: batch.internshipId?.durationWeeks || 8,
                      }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Week {i + 1}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={bulking}
                      onClick={() => handleBulkMark(true)}
                    >
                      Mark All Completed
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {interns?.map((intern) => (
                    <div
                      key={intern._id}
                      className="flex items-center justify-between p-4 bg-white/5 border border-[var(--color-border)] rounded-xl group hover:border-[var(--color-primary)]/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold">
                          {intern.userId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-text-primary)]">
                            {intern.userId?.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {intern.completedWeeks?.length || 0} Weeks Completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {Array.from({
                          length: batch.internshipId?.durationWeeks || 8,
                        }).map((_, i) => {
                          const week = i + 1;
                          const isCompleted =
                            intern.completedWeeks?.includes(week);
                          return (
                            <button
                              key={week}
                              onClick={() =>
                                handleMarkWeek(intern._id, week, !isCompleted)
                              }
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
                                isCompleted
                                  ? "bg-green-500 text-white border-green-600"
                                  : "bg-white/5 text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                              }`}
                              title={`Week ${week}`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <span className="text-[10px]">{week}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : activeTab === "schedule" ? (
            <ScheduleEditorPanel
              scheduleData={scheduleData}
              setScheduleData={setScheduleData}
              scheduleWeek={scheduleWeek}
              setScheduleWeek={setScheduleWeek}
              savingSchedule={savingSchedule}
              expandedDays={expandedDays}
              setExpandedDays={setExpandedDays}
              durationWeeks={batch.internshipId?.durationWeeks || 8}
              onSave={async () => {
                const internshipId = batch.internshipId?._id;
                if (!internshipId)
                  return toast.error("No internship linked to this batch");
                setSavingSchedule(true);
                try {
                  const cleaned = scheduleData.map((w) => ({
                    ...w,
                    references: (w.references || []).filter(
                      (r) => r.label && r.url,
                    ),
                    days: (w.days || [])
                      .filter((d) => d.topic)
                      .map((d) => ({
                        ...d,
                        references: (d.references || []).filter(
                          (r) => r.label && r.url,
                        ),
                      })),
                  }));
                  await internshipsApi.updateSchedule(internshipId, {
                    schedule: cleaned,
                  });
                  toast.success("Schedule saved!");
                  fetchDetails();
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Failed to save schedule",
                  );
                } finally {
                  setSavingSchedule(false);
                }
              }}
            />
          ) : null}
        </div>

        {/* Right Column: Batch Info & Settings */}
        <div className="space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
                  Batch Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Scheduled Mentor Day
                  </label>
                  <select
                    className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    value={mentorDay}
                    onChange={(e) => setMentorDay(e.target.value)}
                  >
                    <option value="">Select Day</option>
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={updateBatchSettings}
                  loading={updatingSettings}
                  className="w-full py-3"
                >
                  Update Settings
                </Button>
              </div>

              <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {new Date(batch.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Internship Role
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {batch.internshipId?.title}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mail Modal */}
      <Modal
        isOpen={mailModalOpen}
        onClose={() => setMailModalOpen(false)}
        title={
          targetIntern
            ? `Send Email to ${targetIntern.userId?.name}`
            : "Send Batch Email"
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
              Subject
            </label>
            <input
              type="text"
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Enter email subject"
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
              Message Body
            </label>
            <textarea
              rows={6}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
              placeholder="Type your message here..."
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
            ></textarea>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Line breaks will be converted to &lt;br&gt; tags automatically.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setMailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSendCustomMail}
              loading={sendingMail}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send {targetIntern ? "Email" : "Batch Email"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Project Assignment Modal */}
      <Modal
        isOpen={!!assigningIntern}
        onClose={() => setAssigningIntern(null)}
        title={`Assign Project to ${assigningIntern?.userId?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Select a project template from the{" "}
            <b>{assigningIntern?.internshipId?.title}</b> role curriculum.
          </p>

          {projectsLoading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Loading templates...
              </p>
            </div>
          ) : availableProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {availableProjects.map((proj) => (
                <div
                  key={proj._id}
                  className="p-5 border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 cursor-pointer transition-all group relative overflow-hidden"
                  onClick={() => handleAssignProject(proj)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-[var(--color-text-primary)]">
                      {proj.title}
                    </h5>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase tracking-tighter px-2"
                    >
                      {proj.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>
                  <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1">
                      Assign Project{" "}
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-[var(--color-border)] rounded-3xl">
              <BookOpen className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">
                No project templates found for this role.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ─── Schedule Editor Panel ────────────────────────────────────────────────────

const ReferencesEditor = ({ references, onChange, label = "References" }) => {
  const addRef = () => onChange([...references, { label: "", url: "" }]);
  const removeRef = (idx) => onChange(references.filter((_, i) => i !== idx));
  const updateRef = (idx, field, value) => {
    const updated = references.map((r, i) =>
      i === idx ? { ...r, [field]: value } : r,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
          <Link2 className="w-3 h-3" /> {label}
        </span>
        <button
          type="button"
          onClick={addRef}
          className="text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Link
        </button>
      </div>
      {references.length === 0 && (
        <p className="text-[11px] text-[var(--color-text-muted)] italic">
          No reference links added yet.
        </p>
      )}
      {references.map((ref, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Label (e.g. MDN Docs)"
            value={ref.label}
            onChange={(e) => updateRef(idx, "label", e.target.value)}
            className="flex-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <input
            type="url"
            placeholder="https://..."
            value={ref.url}
            onChange={(e) => updateRef(idx, "url", e.target.value)}
            className="flex-[2] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <button
            type="button"
            onClick={() => removeRef(idx)}
            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const ScheduleEditorPanel = ({
  scheduleData,
  setScheduleData,
  scheduleWeek,
  setScheduleWeek,
  savingSchedule,
  expandedDays,
  setExpandedDays,
  durationWeeks,
  onSave,
}) => {
  const weekIndex = scheduleWeek - 1;
  const weekData = scheduleData[weekIndex];

  if (!weekData) return null;

  const updateWeekField = (field, value) => {
    setScheduleData((prev) =>
      prev.map((w, i) => (i === weekIndex ? { ...w, [field]: value } : w)),
    );
  };

  const updateDayField = (dayIdx, field, value) => {
    setScheduleData((prev) =>
      prev.map((w, i) => {
        if (i !== weekIndex) return w;
        const days = w.days.map((d, di) =>
          di === dayIdx ? { ...d, [field]: value } : d,
        );
        return { ...w, days };
      }),
    );
  };

  const toggleDay = (dayIdx) => {
    setExpandedDays((prev) => ({ ...prev, [dayIdx]: !prev[dayIdx] }));
  };

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
              Weekly Schedule Editor
            </h3>
          </div>
          <Button onClick={onSave} loading={savingSchedule} size="sm">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Schedule
          </Button>
        </div>

        {/* Week Selector */}
        <div className="flex gap-2 flex-wrap mb-6">
          {Array.from({ length: durationWeeks }, (_, i) => i + 1).map((wk) => {
            const hasContent = scheduleData[wk - 1]?.topic;
            return (
              <button
                key={wk}
                onClick={() => {
                  setScheduleWeek(wk);
                  setExpandedDays({});
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  scheduleWeek === wk
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                    : hasContent
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]"
                      : "bg-white/5 text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                }`}
              >
                Wk {wk}
              </button>
            );
          })}
        </div>

        {/* Week-level fields */}
        <div className="space-y-4 mb-6 p-5 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-black">
              {scheduleWeek}
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              Week {scheduleWeek} Overview
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Week Topic *
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to React Hooks"
              value={weekData.topic}
              onChange={(e) => updateWeekField("topic", e.target.value)}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Week Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview of what this week covers..."
              value={weekData.description}
              onChange={(e) => updateWeekField("description", e.target.value)}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
            />
          </div>

          <ReferencesEditor
            references={weekData.references || []}
            onChange={(refs) => updateWeekField("references", refs)}
            label="Week-level Reference Links"
          />
        </div>

        {/* Day-by-Day Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Day-by-Day Breakdown (Day 1–5)
          </p>
          {(weekData.days || []).map((day, dayIdx) => (
            <div
              key={day.day}
              className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-white/[0.02] hover:border-[var(--color-primary)]/30 transition-colors"
            >
              {/* Day header — always visible */}
              <button
                type="button"
                onClick={() => toggleDay(dayIdx)}
                className="w-full flex items-center justify-between p-4 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border transition-colors ${
                      day.topic
                        ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30"
                        : "bg-white/5 text-[var(--color-text-muted)] border-[var(--color-border)]"
                    }`}
                  >
                    D{day.day}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">
                      Day {day.day}
                      {day.topic && (
                        <span className="ml-2 font-normal text-[var(--color-text-muted)] text-xs">
                          — {day.topic}
                        </span>
                      )}
                    </p>
                    {!day.topic && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Click to add topic & resources
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {day.references?.length > 0 && (
                    <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
                      {day.references.length} link
                      {day.references.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {expandedDays[dayIdx] ? (
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                  )}
                </div>
              </button>

              {/* Day expanded content */}
              {expandedDays[dayIdx] && (
                <div className="px-4 pb-5 space-y-4 border-t border-[var(--color-border)] pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Day Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. useState & useEffect deep dive"
                      value={day.topic}
                      onChange={(e) =>
                        updateDayField(dayIdx, "topic", e.target.value)
                      }
                      className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Day Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="What interns should focus on today..."
                      value={day.description}
                      onChange={(e) =>
                        updateDayField(dayIdx, "description", e.target.value)
                      }
                      className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
                    />
                  </div>
                  <ReferencesEditor
                    references={day.references || []}
                    onChange={(refs) =>
                      updateDayField(dayIdx, "references", refs)
                    }
                    label="Day Reference Links"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom save */}
        <div className="pt-6 border-t border-[var(--color-border)] flex justify-end">
          <Button onClick={onSave} loading={savingSchedule}>
            <Save className="w-4 h-4 mr-2" />
            Save Week {scheduleWeek} Schedule
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MentorBatchDetails;
