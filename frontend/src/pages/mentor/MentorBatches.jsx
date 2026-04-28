import { useNavigate } from "react-router-dom";
import {
  SectionHeader,
  Card,
  Table,
  Badge,
  Button,
} from "../../components/ui";
import { Users, Calendar } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { batchesApi } from "../../api";

const MentorBatches = () => {
  const navigate = useNavigate();
  const { data: batchesData, loading: batchesLoading } = useApi(
    batchesApi.getAll,
  );
  const batches = batchesData?.batches || [];

  const handleViewBatch = (id) => {
    navigate(`/mentor/batches/${id}`);
  };

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
            {row.internshipId?.title || "Unknown Role"}
          </div>
        </div>
      ),
    },
    {
      key: "mentorDay",
      label: "Mentor Day",
      render: (val) => (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          {val || "Not Set"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={val === "active" ? "success" : val === "completed" ? "secondary" : "warning"}>
          {val}
        </Badge>
      ),
    },
    {
      key: "timeline",
      label: "Timeline",
      render: (_, row) => (
        <div className="text-sm flex flex-col">
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Duration</span>
          <span>{new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}</span>
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
        <Button variant="secondary" size="sm" onClick={() => handleViewBatch(row._id)}>
          View Batch Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader
        title="My Assigned Batches"
        subtitle="Manage your internship cohorts, track progress, and assign projects."
      />

      <Card>
        <Table
          columns={columns}
          data={batches}
          loading={batchesLoading}
          emptyMessage="You have no batches assigned currently."
        />
      </Card>
    </div>
  );
};

export default MentorBatches;
