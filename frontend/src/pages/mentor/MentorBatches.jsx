import { useState, useEffect } from "react";
import {
  SectionHeader,
  Card,
  Table,
  Badge,
  Button,
  Modal,
} from "../../components/ui";
import { Users, Calendar, Clock, BookOpen, Link } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { batchesApi } from "../../api";

const MentorBatches = () => {
  const { data: batchesData, loading: batchesLoading } = useApi(
    batchesApi.getAll,
  );
  const batches = batchesData?.batches || [];

  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const {
    data: batchDetails,
    loading: detailsLoading,
    execute: fetchDetails,
  } = useApi(
    () => (selectedBatchId ? batchesApi.getById(selectedBatchId) : null),
    { manual: true },
  );

  const handleViewBatch = async (id) => {
    setSelectedBatchId(id);
    // The useApi hook might not auto-trigger if we just change state and call execute in same tick if dependencies aren't set right,
    // so we'll wait for state to update or directly pass it (but useApi wrapper doesn't take args for the manual execute).
    // Let's just use the selectedBatchId effect-like pattern or fetch directly.
  };

  // Trigger fetch when selectedBatchId changes
  useEffect(() => {
    if (selectedBatchId) fetchDetails();
  }, [selectedBatchId]);

  const columns = [
    {
      key: "batch",
      label: "Batch Name",
      render: (_, row) => (
        <div>
          <div className="font-bold text-[var(--color-primary)]">
            {row.batchName}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.domain}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge
          variant={
            val === "active"
              ? "success"
              : val === "completed"
                ? "secondary"
                : "warning"
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: "timeline",
      label: "Timeline",
      render: (_, row) => (
        <div className="text-sm">
          {new Date(row.startDate).toLocaleDateString()} -{" "}
          {new Date(row.endDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "interns",
      label: "Interns",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Users className="w-4 h-4 text-[var(--color-text-muted)]" />{" "}
          {row.internCount}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewBatch(row._id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader
        title="My Assigned Batches"
        subtitle="Manage your internship cohorts, track progress, and review submissions."
      />

      <Card>
        <Table
          columns={columns}
          data={batches}
          loading={batchesLoading}
          emptyMessage="You have no batches assigned currently."
        />
      </Card>

      {selectedBatchId && (
        <Modal
          isOpen={!!selectedBatchId}
          onClose={() => setSelectedBatchId(null)}
          title="Batch Details"
          size="3xl"
        >
          {detailsLoading ? (
            <div className="p-12 text-center text-[var(--color-text-muted)]">
              Loading batch details...
            </div>
          ) : batchDetails ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-lg border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
                    <BookOpen className="w-4 h-4" /> Tech Stack
                  </div>
                  <p className="text-[var(--color-text-primary)]">
                    {batchDetails.batch.stack || "Not specified"}
                  </p>
                </div>
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-lg border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
                    <Calendar className="w-4 h-4" /> Schedule (Days)
                  </div>
                  <p className="text-[var(--color-text-primary)]">
                    {batchDetails.batch.schedule?.days?.join(", ") || "Mon-Fri"}
                  </p>
                </div>
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-lg border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
                    <Clock className="w-4 h-4" /> Timings
                  </div>
                  <p className="text-[var(--color-text-primary)]">
                    {batchDetails.batch.schedule?.startTime} to{" "}
                    {batchDetails.batch.schedule?.endTime}
                  </p>
                </div>
              </div>

              {batchDetails.batch.schedule?.meetLink && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-500">
                      Daily Meeting Link
                    </span>
                  </div>
                  <a
                    href={batchDetails.batch.schedule.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Join Meeting →
                  </a>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 border-b border-[var(--color-border)] pb-2">
                  Enrolled Interns
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Email</th>
                        <th className="pb-2 font-medium">Phone</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {batchDetails.interns?.map((intern) => (
                        <tr
                          key={intern._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 font-medium text-[var(--color-text-primary)]">
                            {intern.userId?.name}
                          </td>
                          <td className="py-3 text-[var(--color-text-muted)]">
                            {intern.userId?.email}
                          </td>
                          <td className="py-3 text-[var(--color-text-muted)]">
                            {intern.userId?.phone}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                intern.registrationStatus === "approved"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {intern.registrationStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {batchDetails.interns?.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-[var(--color-text-muted)]"
                          >
                            No interns found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-red-500">
              Failed to load details.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MentorBatches;
