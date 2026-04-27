import { useState } from "react";
import {
  FileText,
  Award,
  Briefcase,
  Eye,
  Download,
  X,
  Loader2,
  FileSearch,
  ExternalLink,
} from "lucide-react";
import { templatesApi } from "../../api";
import { toast } from "react-hot-toast";

const TEMPLATES = [
  {
    id: "payslip",
    name: "Employee Payslip",
    description:
      "Monthly salary slip template with earnings, deductions, and net pay breakdown.",
    icon: FileText,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "certificate",
    name: "Internship Certificate",
    description:
      "Completion certificate for interns featuring batch details and verification ID.",
    icon: Award,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "offer-letter",
    name: "Offer Letter",
    description:
      "Formal internship offer letter template with role, duration, and stipend info.",
    icon: Briefcase,
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

const DocumentTemplates = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handlePreview = async (type) => {
    try {
      setPreviewing(type);
      const response = await templatesApi.preview(type);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowModal(true);
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview");
    } finally {
      setPreviewing(null);
    }
  };

  const handleDownload = async (type) => {
    try {
      setDownloading(type);
      const response = await templatesApi.download(type);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_template_preview.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type.replace("-", " ")} downloaded successfully`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download template");
    } finally {
      setDownloading(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold font-display text-text-primary">
          Document Templates
        </h1>
        <p className="text-text-muted mt-1">
          Preview and download standard document templates used across the
          organization.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="glass-card p-6 flex flex-col h-full hover:shadow-lg transition-all duration-300 group"
          >
            <div
              className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <template.icon size={24} />
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-text-secondary mb-6 flex-grow">
              {template.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handlePreview(template.id)}
                disabled={
                  previewing === template.id || downloading === template.id
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dim transition-colors disabled:opacity-50"
              >
                {previewing === template.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Preview
              </button>

              <button
                onClick={() => handleDownload(template.id)}
                disabled={
                  previewing === template.id || downloading === template.id
                }
                className="flex items-center justify-center w-11 h-11 rounded-lg border border-border text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all disabled:opacity-50"
                title="Download PDF"
              >
                {downloading === template.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileSearch size={18} />
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  Template Preview
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary hover:bg-primary/5 rounded-md transition-all"
                >
                  <ExternalLink size={14} />
                  Open in New Tab
                </a>
                <button
                  onClick={closeModal}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/5 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-4 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg border border-border bg-white shadow-sm"
                title="PDF Preview"
              />
            </div>

            <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-lg bg-white border border-border text-sm font-semibold text-text-primary hover:bg-gray-100 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTemplates;
