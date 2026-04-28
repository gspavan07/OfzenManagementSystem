import { useState, useRef, useEffect } from "react";
import {
  SectionHeader,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Input,
} from "../../components/ui";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { internshipsApi, internshipProjectsApi } from "../../api";
import toast from "react-hot-toast";

const DOMAIN_OPTIONS = [
  "Full Stack",
  "Frontend",
  "UI/UX",
  "Generative AI",
  "Python",
  "Data Analytics",
  "Cloud Computing",
];

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

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
  const [activeTab, setActiveTab] = useState("general");

  // General Info State
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(DOMAIN_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [openings, setOpenings] = useState(0);
  const [fee, setFee] = useState(899);
  const [status, setStatus] = useState("active");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [projectStartWeek, setProjectStartWeek] = useState(5);
  const [certificate, setCertificate] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");
  const techInputRef = useRef(null);

  // Schedule State
  const [schedule, setSchedule] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  // Projects State (Templates)
  const [projects, setProjects] = useState([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    requirements: "",
    deliverables: "",
    techStack: [],
    difficulty: "Intermediate",
  });

  const openModal = (internship = null) => {
    setActiveTab("general");
    if (internship) {
      setEditingId(internship._id);
      setTitle(internship.title);
      setDomain(internship.domain);
      setDescription(internship.description || "");
      setOpenings(internship.openings);
      setFee(internship.fee);
      setStatus(internship.status);
      setDurationWeeks(internship.durationWeeks ?? "");
      setProjectStartWeek(internship.projectStartWeek ?? 5);
      setCertificate(internship.certificate || "");
      setTechStack(internship.techStack || []);
      setSchedule(internship.schedule || []);
      fetchProjects(internship._id);
    } else {
      setEditingId(null);
      setTitle("");
      setDomain(DOMAIN_OPTIONS[0]);
      setDescription("");
      setOpenings(0);
      setFee(899);
      setStatus("active");
      setDurationWeeks("");
      setProjectStartWeek(5);
      setCertificate("");
      setTechStack([]);
      setSchedule([]);
      setProjects([]);
    }
    setTechInput("");
    setModalOpen(true);
  };

  const fetchProjects = async (id) => {
    try {
      const res = await internshipProjectsApi.getByInternship(id);
      if (res.data.success) setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  // ─── Schedule Helpers ───────────────────────────────────────────────────────
  const addScheduleItem = () => {
    const nextWeek = schedule.length > 0 ? schedule[schedule.length - 1].week + 1 : 1;
    setSchedule([...schedule, { week: nextWeek, topic: "", description: "", days: [] }]);
  };

  const updateScheduleItem = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const removeScheduleItem = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const addDayToWeek = (weekIndex) => {
    const updated = [...schedule];
    const currentDays = updated[weekIndex].days || [];
    const nextDay = currentDays.length + 1;
    updated[weekIndex].days = [...currentDays, { day: nextDay, topic: "", description: "" }];
    setSchedule(updated);
    setExpandedWeeks({ ...expandedWeeks, [weekIndex]: true });
  };

  const updateDayInWeek = (weekIndex, dayIndex, field, value) => {
    const updated = [...schedule];
    updated[weekIndex].days[dayIndex][field] = value;
    setSchedule(updated);
  };

  const removeDayFromWeek = (weekIndex, dayIndex) => {
    const updated = [...schedule];
    updated[weekIndex].days = updated[weekIndex].days.filter((_, i) => i !== dayIndex);
    setSchedule(updated);
  };

  const toggleWeekExpand = (index) => {
    setExpandedWeeks({ ...expandedWeeks, [index]: !expandedWeeks[index] });
  };

  // ─── Project Helpers ────────────────────────────────────────────────────────
  const openProjectModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({ ...proj });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: "",
        description: "",
        requirements: "",
        deliverables: "",
        techStack: [],
        difficulty: "Intermediate",
      });
    }
    setProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) {
      toast.error("Please save the internship role first before adding projects.");
      return;
    }
    try {
      const payload = { ...projectForm, internshipId: editingId };
      if (editingProject) {
        await internshipProjectsApi.update(editingProject._id, payload);
        toast.success("Project updated");
      } else {
        await internshipProjectsApi.create(payload);
        toast.success("Project added");
      }
      setProjectModalOpen(false);
      fetchProjects(editingId);
    } catch (err) {
      toast.error("Failed to save project");
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project template?")) return;
    try {
      await internshipProjectsApi.delete(id);
      toast.success("Project removed");
      fetchProjects(editingId);
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  // ─── Tech Stack Tags ────────────────────────────────────────────────────────
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title, domain, description, openings, fee, status,
        durationWeeks: Number(durationWeeks),
        projectStartWeek: Number(projectStartWeek),
        certificate, techStack, schedule,
      };
      if (editingId) {
        await internshipsApi.update(editingId, payload);
        toast.success("Internship role updated");
      } else {
        const res = await internshipsApi.create(payload);
        setEditingId(res.data.internship._id);
        toast.success("Internship role created. You can now add projects.");
      }
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
      key: "fee",
      label: "Fee",
      render: (val) => <span className="font-semibold text-green-500">₹{val.toLocaleString()}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={val === "active" ? "success" : "danger"}>{val.toUpperCase()}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-white/5">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors rounded-md hover:bg-white/5">
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
        subtitle="Manage available internship positions, curriculum schedules, and professional projects."
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
        title={editingId ? "Manage Internship Role" : "Create New Internship Role"}
        size="3xl"
      >
        <div className="flex border-b border-[var(--color-border)] mb-6">
          {[
            { id: "general", label: "General Info", icon: Settings },
            { id: "schedule", label: "Curriculum Schedule", icon: Calendar },
            { id: "projects", label: "Project Templates", icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "general" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Role Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Domain</label>
                <select className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={domain} onChange={(e) => setDomain(e.target.value)} required>
                  {DOMAIN_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <Input label="Registration Fee (₹)" type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} required />
              <Input label="Duration (Weeks)" type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} required />
              <Input label="Project Start Week" type="number" value={projectStartWeek} onChange={(e) => setProjectStartWeek(e.target.value)} required />
              <Input label="Indicative Openings" type="number" value={openings} onChange={(e) => setOpenings(Number(e.target.value))} />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Status</label>
                <select className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Tech Stack</label>
                <div className="w-full min-h-[42px] flex flex-wrap gap-1.5 items-center bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 cursor-text" onClick={() => techInputRef.current?.focus()}>
                  {techStack.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                      {tag}
                      <button type="button" onClick={(e) => { e.stopPropagation(); setTechStack(techStack.filter(t => t !== tag)); }} className="hover:text-red-400">×</button>
                    </span>
                  ))}
                  <input ref={techInputRef} type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={handleTechKeyDown} placeholder="Type & press Enter…" className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--color-text-primary)] outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Input label="Certificate / What We Provide" value={certificate} onChange={(e) => setCertificate(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button type="submit" loading={submitting}>{editingId ? "Save Changes" : "Create & Continue"}</Button>
            </div>
          </form>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)]">Curriculum Schedule</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Outline weekly modules and daily deep dives.</p>
              </div>
              <Button onClick={addScheduleItem} variant="secondary" size="sm">
                <Plus className="w-4 h-4" /> Add Week
              </Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {schedule.map((item, index) => (
                <div key={index} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden group shadow-sm transition-all hover:shadow-md">
                  <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)] bg-white/5">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex flex-col items-center justify-center border border-[var(--color-primary)]/20">
                         <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-tighter">Week</span>
                         <span className="text-lg font-black text-[var(--color-primary)] -mt-1">{item.week}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full bg-transparent font-bold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
                          value={item.topic}
                          onChange={(e) => updateScheduleItem(index, "topic", e.target.value)}
                          placeholder="Week Module Title..."
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => addDayToWeek(index)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="Add Day">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleWeekExpand(index)} className="p-2 text-[var(--color-text-muted)] hover:bg-white/5 rounded-lg transition-colors">
                        {expandedWeeks[index] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeScheduleItem(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedWeeks[index] && (
                    <div className="p-4 space-y-4 animate-slide-down">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest px-1">Module Summary</label>
                        <textarea
                          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none min-h-[60px]"
                          placeholder="Brief summary of what interns will learn this week..."
                          value={item.description}
                          onChange={(e) => updateScheduleItem(index, "description", e.target.value)}
                        />
                      </div>

                      {/* Daily Topics */}
                      <div className="space-y-3 pl-4 border-l-2 border-[var(--color-border)]">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Daily Deep Dives</span>
                        </div>
                        {item.days?.map((day, dIndex) => (
                          <div key={dIndex} className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3 rounded-xl flex gap-3 relative group/day">
                            <div className="flex-none w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
                              D{day.day}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                className="w-full bg-transparent text-sm font-semibold text-[var(--color-text-primary)] outline-none placeholder:font-normal"
                                value={day.topic}
                                onChange={(e) => updateDayInWeek(index, dIndex, "topic", e.target.value)}
                                placeholder="Day Topic..."
                              />
                              <input
                                className="w-full bg-transparent text-xs text-[var(--color-text-muted)] outline-none"
                                value={day.description}
                                onChange={(e) => updateDayInWeek(index, dIndex, "description", e.target.value)}
                                placeholder="Short description..."
                              />
                            </div>
                            <button
                              onClick={() => removeDayFromWeek(index, dIndex)}
                              className="p-1 text-red-500/50 hover:text-red-500 opacity-0 group-hover/day:opacity-100 transition-all self-start"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(!item.days || item.days.length === 0) && (
                          <p className="text-xs text-[var(--color-text-muted)] italic px-2">No daily deep dives added for this week.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {schedule.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-white/[0.02]">
                  <Calendar className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)]">Your curriculum schedule is empty.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button onClick={handleSubmit} loading={submitting}>Save Full Curriculum</Button>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)]">Project Templates</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Professional projects available for this internship role.</p>
              </div>
              <Button onClick={() => openProjectModal()} disabled={!editingId} variant="secondary" size="sm">
                <Plus className="w-4 h-4" /> Create Project
              </Button>
            </div>

            {!editingId && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
                <Info className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-yellow-600">Please save the general information first to enable project management.</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {projects.map((proj) => (
                <div key={proj._id} className="p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl flex items-start justify-between group shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[var(--color-text-primary)]">{proj.title}</h4>
                      <Badge variant="secondary" className="text-[10px] uppercase">{proj.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {proj.techStack?.map(s => <span key={s} className="text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20 font-medium">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openProjectModal(proj)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteProject(proj._id)} className="p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {editingId && projects.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-white/[0.02]">
                  <Layers className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)]">No project templates created for this role.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Project Creation/Edit Modal */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={editingProject ? "Edit Project Template" : "New Project Template"}
        size="lg"
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <Input label="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Difficulty</label>
              <select className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)]" value={projectForm.difficulty} onChange={e => setProjectForm({...projectForm, difficulty: e.target.value})}>
                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Description</label>
            <textarea className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] min-h-[80px]" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Requirements</label>
            <textarea className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] min-h-[100px]" value={projectForm.requirements} onChange={e => setProjectForm({...projectForm, requirements: e.target.value})} placeholder="List technical requirements..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Deliverables</label>
            <textarea className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] min-h-[80px]" value={projectForm.deliverables} onChange={e => setProjectForm({...projectForm, deliverables: e.target.value})} placeholder="What should be submitted?" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button variant="ghost" type="button" onClick={() => setProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Internships;
