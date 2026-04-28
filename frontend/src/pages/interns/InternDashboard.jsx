import { useState, useEffect } from "react";
import {
  SectionHeader,
  Card,
  Badge,
  Spinner,
  Button,
} from "../../components/ui";
import {
  Calendar,
  Clock,
  BookOpen,
  Link,
  CheckCircle,
  Download,
  Megaphone,
  Pin,
  Target,
  User,
  ShieldCheck,
  Lock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { internsApi, authApi, announcementsApi, FILE_BASE_URL } from "../../api";

const InternDashboard = () => {
  const { data: authData } = useApi(authApi.getMe);
  const currentUser = authData?.user;

  const { data: internData, loading: internLoading } = useApi(internsApi.getMe);
  const { data: annData, loading: annLoading } = useApi(
    announcementsApi.getAll,
  );

  const intern = internData?.intern;
  const batch = intern?.batchId;
  const internship = intern?.internshipId;
  const announcements = annData?.announcements || [];
  const pinned = announcements.filter((a) => a.isPinned);
  const recent = announcements.filter((a) => !a.isPinned).slice(0, 3);

  if (internLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!internLoading && !intern) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-center py-20">
        <div className="bg-[var(--color-bg-elevated)] p-12 rounded-3xl border border-[var(--color-border)] shadow-xl">
          <ShieldCheck className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            No Active Internship
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
            We couldn't find an active internship registration linked to your
            account. If you just registered, please wait for admin approval.
          </p>
        </div>
      </div>
    );
  }

  const completedCount = intern.completedWeeks?.length || 0;
  const totalWeeks = internship?.durationWeeks || 8;
  const progressPercent = (completedCount / totalWeeks) * 100;
  const projectStartWeek = internship?.projectStartWeek || 5;
  const isProjectUnlocked = completedCount >= projectStartWeek - 1; // Unlocks when learning phase weeks are done

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--color-bg-elevated)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="space-y-2">
          <Badge
            variant="secondary"
            className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20 px-3 py-1 uppercase tracking-widest text-[10px]"
          >
            {internship?.domain} Specialist
          </Badge>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)]">
            Hello, {currentUser?.name?.split(" ")[0]}!
          </h1>
          <p className="text-[var(--color-text-muted)] flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {internship?.title} • Batch{" "}
            {batch?.batchName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Status
            </span>
            <Badge
              variant={
                intern.registrationStatus === "approved" ? "success" : "warning"
              }
              className="px-4 py-1 rounded-full"
            >
              {intern.registrationStatus === "approved"
                ? "Active & Enrolled"
                : "Pending Review"}
            </Badge>
          </div>
          <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 mt-2">
            <div
              className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-out shadow-[0_0_10px_var(--color-primary)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
            {completedCount} / {totalWeeks} Weeks Completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Learning & Project */}
        <div className="lg:col-span-2 space-y-8">
          {/* Phase Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent border-[var(--color-primary)]/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-12 h-12" />
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-3">
                Current Focus
              </h4>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">
                {completedCount < projectStartWeek - 1
                  ? "Phase 1: Learning & Upskilling"
                  : "Phase 2: Project Implementation"}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {completedCount < projectStartWeek - 1
                  ? `Deep diving into ${internship?.techStack?.slice(0, 2).join(", ")} core concepts.`
                  : "Building your professional project based on the assigned template."}
              </p>
            </Card>

            <Card className="border-[var(--color-border)] bg-white/[0.02]">
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-3">
                Next Milestone
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">
                    Week {completedCount + 1}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {internship?.schedule?.find(
                      (s) => s.week === completedCount + 1,
                    )?.topic || "TBD"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Curriculum Section */}
          <Card className="p-0 overflow-hidden border-[var(--color-border)] shadow-sm">
            <div className="p-6 border-b border-[var(--color-border)] bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="font-bold text-[var(--color-text-primary)]">
                  Learning Curriculum
                </h3>
              </div>
              <Badge variant="secondary" className="font-bold">
                Weeks 1-{totalWeeks}
              </Badge>
            </div>
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {internship?.schedule?.map((item) => {
                const isCompleted = intern.completedWeeks?.includes(item.week);
                const isCurrent = item.week === completedCount + 1;

                return (
                  <div
                    key={item.week}
                    className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)] shadow-sm"
                        : isCompleted
                          ? "bg-green-500/5 border-green-500/20 opacity-80"
                          : "bg-white/[0.02] border-[var(--color-border)]"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                        isCurrent
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : isCompleted
                            ? "bg-green-500/20 text-green-500 border-green-500/30"
                            : "bg-white/5 text-[var(--color-text-muted)] border-[var(--color-border)]"
                      }`}
                    >
                      <span className="text-[8px] font-bold uppercase">Wk</span>
                      <span className="text-sm font-black -mt-1">
                        {item.week}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-[var(--color-text-primary)]">
                          {item.topic}
                        </h5>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {item.days?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.days.map((d) => (
                            <span
                              key={d.day}
                              className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[var(--color-text-secondary)]"
                            >
                              Day {d.day}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!internship?.schedule || internship.schedule.length === 0) && (
                <p className="text-center py-10 text-sm text-[var(--color-text-muted)] italic">
                  Schedule will be updated soon by your mentor.
                </p>
              )}
            </div>
          </Card>

          {/* Project Section */}
          <Card
            className={`relative overflow-hidden border-[var(--color-border)] shadow-sm ${!isProjectUnlocked ? "min-h-[300px]" : ""}`}
          >
            {!isProjectUnlocked && (
              <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Project Phase Locked
                </h4>
                <p className="text-sm text-white/70 max-w-sm">
                  Complete the learning phase (Weeks 1 to {projectStartWeek - 1}
                  ) to unlock your professional project. Keep learning!
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-primary)]/10 px-4 py-2 rounded-full border border-[var(--color-primary)]/20">
                  <Clock className="w-4 h-4" /> Unlocks in Week{" "}
                  {projectStartWeek}
                </div>
              </div>
            )}

            <div className="p-6 border-b border-[var(--color-border)] bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-[var(--color-text-primary)]">
                  Assigned Project
                </h3>
              </div>
              {isProjectUnlocked && (
                <Badge variant="success" className="font-bold">
                  Unlocked
                </Badge>
              )}
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                  {intern.project?.projectTitle ||
                    "Real-world Project Implementation"}
                </h4>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {intern.project?.brief ||
                    "Your mentor will assign your specific project template here once you enter the project phase. You'll be working on building a production-grade application that demonstrates your skills."}
                </p>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-border)]">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Evaluation Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <User className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {intern.project
                        ? "Assigned & Active"
                        : "Awaiting Assignment"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Project Submission
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`w-full ${!intern.project ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Link className="w-4 h-4 mr-2" />{" "}
                    {intern.project ? "Upload Work" : "Locked"}
                  </Button>
                </div>
              </div> */}
            </div>
          </Card>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Mentor Profile */}
          <Card className="bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/20 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20">
                {batch?.mentorId?.name?.charAt(0) || "M"}
              </div>
              <div>
                <h4 className="font-black text-[var(--color-text-primary)]">
                  {batch?.mentorId?.name || "Assigning..."}
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Senior Mentor
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Mentor Day
                </span>
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-500 border-blue-500/20 font-bold"
                >
                  {batch?.mentorDay || "TBD"}
                </Badge>
              </div>

              <div className="pt-2">
                <a
                  href={`mailto:${batch?.mentorId?.email}`}
                  className="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-widest block text-center py-2 border-t border-white/5 mt-2 transition-all"
                >
                  Contact via Email →
                </a>
              </div>
            </div>

            {batch?.schedule?.meetLink && (
              <Button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 shadow-lg shadow-blue-600/20"
                onClick={() => window.open(batch.schedule.meetLink, "_blank")}
              >
                Join Live Session
              </Button>
            )}
          </Card>

          {/* Quick Documents */}
          <Card className="border-[var(--color-border)] shadow-sm">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
              Official Downloads
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-2xl group hover:border-[var(--color-primary)]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">
                    Offer Letter
                  </span>
                </div>
                {intern?.offerLetterUrl ? (
                  <a
                    href={intern.offerLetterUrl.startsWith('http') ? intern.offerLetterUrl : `${FILE_BASE_URL}${intern.offerLetterUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-[var(--color-primary)] transition-transform hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Lock className="w-3 h-3 text-[var(--color-text-muted)]" />
                )}
              </div>

              <div
                className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                  intern?.completionStatus === "completed"
                    ? "bg-green-500/10 border-green-500/20 group hover:border-green-500/40"
                    : "bg-white/[0.02] border-[var(--color-border)] opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      intern?.completionStatus === "completed"
                        ? "bg-green-500/20 text-green-500 border-green-500/30"
                        : "bg-white/10 text-[var(--color-text-muted)] border-white/5"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">
                    Certificate
                  </span>
                </div>
                {intern?.certificateUrl ? (
                  <a
                    href={intern.certificateUrl.startsWith('http') ? intern.certificateUrl : `${FILE_BASE_URL}${intern.certificateUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-green-500 transition-transform hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Lock className="w-3 h-3 text-[var(--color-text-muted)]" />
                )}
              </div>
            </div>
          </Card>

          {/* Announcements Sidebar */}
          <Card className="bg-[var(--color-bg-base)] border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
                Global Updates
              </h3>
              <Megaphone className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-4">
              {pinned.slice(0, 1).map((ann) => (
                <div
                  key={ann._id}
                  className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl relative overflow-hidden group"
                >
                  <Pin className="w-3 h-3 absolute top-3 right-3 text-orange-500 rotate-45 group-hover:scale-110 transition-transform" />
                  <h5 className="text-xs font-bold text-orange-600 line-clamp-1 pr-4 mb-1">
                    {ann.title}
                  </h5>
                  <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
              {recent.map((ann) => (
                <div
                  key={ann._id}
                  className="p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl relative overflow-hidden"
                >
                  <h5 className="text-[11px] font-bold text-[var(--color-text-primary)] line-clamp-1">
                    {ann.title}
                  </h5>
                  <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center py-6 text-xs text-[var(--color-text-muted)] italic">
                  No recent updates.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
