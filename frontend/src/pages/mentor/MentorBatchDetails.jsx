import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { batchesApi, internshipProjectsApi, internsApi } from "../../api";
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

  // Progress State
  const [activeTab, setActiveTab] = useState("interns");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [bulking, setBulking] = useState(false);

  useEffect(() => {
    if (batchDetails?.batch) {
      setMentorDay(batchDetails.batch.mentorDay || "");
    }
  }, [batchDetails]);

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

      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab("interns")}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "interns"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Interns & Projects
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "progress"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Batch Progress
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "certificates"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Certificates
        </button>
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
                  <Badge variant="secondary">{interns?.length} Total</Badge>
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
                    {interns?.filter((i) => i.completionStatus === "completed").length} Eligible
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
                              onClick={() => window.open(intern.offerLetterUrl, "_blank")}
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
                            {intern.certificateGenerated ? "View PDF" : "Preview"}
                          </Button>

                          {intern.completionStatus === "completed" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleGenerateCertificate(intern._id)}
                              disabled={intern.certificateGenerated}
                              className={`shadow-sm border-[var(--color-border)] ${
                                intern.certificateGenerated
                                  ? "opacity-50"
                                  : "text-green-600 hover:bg-green-500/10"
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                              {intern.certificateGenerated ? "Generated" : "Generate"}
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
          ) : (
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
          )}
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

export default MentorBatchDetails;
