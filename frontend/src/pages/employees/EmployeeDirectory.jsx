import { useState, useEffect } from "react";
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
import { Users, Plus, Edit2, Trash2, KeyRound } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { usePermissions } from "../../hooks/usePermissions";
import { employeesApi, usersApi, profilesApi } from "../../api";
import toast from "react-hot-toast";

const generateTempPassword = () => Math.random().toString(36).slice(-8) + "A1!";

const EmployeeDirectory = () => {
  const { can } = usePermissions();
  const {
    data: empData,
    loading: empLoading,
    execute: fetchEmployees,
  } = useApi(employeesApi.getAll);
  const { data: profData, loading: profLoading } = useApi(profilesApi.getAll);

  const employees = empData?.employees || [];
  const profiles = profData?.profiles || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  // Basic & User Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileId, setProfileId] = useState("");
  const [password, setPassword] = useState("");

  // HR Details
  const [employeeCode, setEmployeeCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [joinDate, setJoinDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Salary & Deductions
  const [salary, setSalary] = useState({
    basic: 0,
    hra: 0,
    travelAllowance: 0,
    medicalAllowance: 0,
    otherAllowance: 0,
  });
  const [deductions, setDeductions] = useState({
    tdsApplicable: false,
    tdsPercent: 0,
    pfApplicable: false,
    esiApplicable: false,
    ptApplicable: false,
    lwfApplicable: false,
  });

  // Bank & Identity
  const [bankAccount, setBankAccount] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: "",
  });
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");

  const openModal = (emp = null) => {
    if (emp) {
      setEditingId(emp._id);
      setEditingUserId(emp.userId?._id);
      setName(emp.userId?.name || "");
      setEmail(emp.userId?.email || "");
      setPhone(emp.userId?.phone || "");
      setProfileId(emp.userId?.profileId || profiles[0]?._id || "");
      setPassword(""); // Blank password means no change
      setEmployeeCode(emp.employeeCode);
      setDesignation(emp.designation);
      setDepartment(emp.department);
      setJoinDate(
        emp.joinDate
          ? new Date(emp.joinDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      );
      setSalary(
        emp.salary || {
          basic: 0,
          hra: 0,
          travelAllowance: 0,
          medicalAllowance: 0,
          otherAllowance: 0,
        },
      );
      setDeductions(
        emp.deductions || {
          tdsApplicable: false,
          tdsPercent: 0,
          pfApplicable: false,
          esiApplicable: false,
          ptApplicable: false,
          lwfApplicable: false,
        },
      );
      setBankAccount(
        emp.bankAccount || {
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          accountHolderName: "",
        },
      );
      setPanNumber(emp.panNumber || "");
      setAadharNumber(emp.aadharNumber || "");
    } else {
      setEditingId(null);
      setEditingUserId(null);
      setName("");
      setEmail("");
      setPhone("");
      setProfileId(profiles[0]?._id || "");
      setPassword(generateTempPassword());
      setEmployeeCode(`OZ-${Math.floor(1000 + Math.random() * 9000)}`);
      setDesignation("");
      setDepartment("");
      setJoinDate(new Date().toISOString().split("T")[0]);
      setSalary({
        basic: 0,
        hra: 0,
        travelAllowance: 0,
        medicalAllowance: 0,
        otherAllowance: 0,
      });
      setDeductions({
        tdsApplicable: false,
        tdsPercent: 0,
        pfApplicable: false,
        esiApplicable: false,
        ptApplicable: false,
        lwfApplicable: false,
      });
      setBankAccount({
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        accountHolderName: "",
      });
      setPanNumber("");
      setAadharNumber("");
    }
    setModalOpen(true);
  };

  const handleSalaryChange = (field, val) =>
    setSalary((prev) => ({ ...prev, [field]: Number(val) }));
  const handleBankChange = (field, val) =>
    setBankAccount((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileId) return toast.error("Please select a profile");

    setSubmitting(true);
    try {
      if (editingId) {
        // Update User
        const userPayload = { name, email, phone, profileId };
        if (password) userPayload.password = password;
        if (editingUserId) await usersApi.update(editingUserId, userPayload);

        // Update Employee
        await employeesApi.update(editingId, {
          designation,
          department,
          employeeCode,
          joinDate,
          salary,
          deductions,
          bankAccount,
          panNumber,
          aadharNumber,
        });

        toast.success("Employee updated successfully!");
      } else {
        // Create User
        const userRes = await usersApi.create({
          name,
          email,
          password,
          phone,
          profileId,
          joinDate,
        });
        const userId = userRes.data.user._id;

        // Create Employee
        await employeesApi.create({
          userId,
          designation,
          department,
          employeeCode,
          joinDate,
          salary,
          deductions,
          bankAccount,
          panNumber,
          aadharNumber,
        });

        toast.success("Employee created successfully!");
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (emp) => {
    if (
      !confirm(
        `Are you sure you want to deactivate ${emp.userId?.name}? They will not be able to log in.`,
      )
    )
      return;
    try {
      // Deactivate User and Employee records
      if (emp.userId?._id) await usersApi.deactivate(emp.userId._id);
      await employeesApi.update(emp._id, { isActive: false });

      toast.success("Employee deactivated successfully");
      fetchEmployees();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to deactivate employee",
      );
    }
  };

  const columns = [
    {
      key: "code",
      label: "Emp Code",
      render: (_, row) => (
        <span className="font-mono text-xs">{row.employeeCode}</span>
      ),
    },
    {
      key: "name",
      label: "Employee",
      render: (_, row) => (
        <div>
          <div className="font-medium text-[var(--color-text-primary)]">
            {row.userId?.name || "N/A"}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.userId?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role / Dept",
      render: (_, row) => (
        <div>
          <div className="text-sm">{row.designation}</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.department}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <Badge variant={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {can("employees.edit") && (
            <button
              onClick={() => openModal(row)}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-white/5"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can("employees.delete") && row.isActive && (
            <button
              onClick={() => handleDeactivate(row)}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors rounded-md hover:bg-white/5"
              title="Deactivate"
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
        title="Employee Directory"
        subtitle="Manage all company employees, HR data, and payroll details."
        action={
          can("employees.create") && (
            <Button onClick={() => openModal()} className="shadow-sm">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          )
        }
      />

      <Card>
        <Table columns={columns} data={employees} loading={empLoading} />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Employee" : "Onboard New Employee"}
        size="2xl"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-8 h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          {/* Section: Basic Details */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              Basic User Details
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
                disabled={!!editingId}
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
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a profile...
                  </option>
                  {profiles.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Input
                  label={
                    editingId
                      ? "Change Password (Leave blank to keep current)"
                      : "Temporary Password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingId}
                />
                {!editingId && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    This password will be required for their first login.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: HR Details */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              HR & Job Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Employee Code"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
                disabled={!!editingId}
              />
              <Input
                label="Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
              <Input
                label="Join Date"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section: Salary & Deductions */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              Salary Structure (Monthly ₹)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Input
                label="Basic Salary"
                type="number"
                value={salary.basic}
                onChange={(e) => handleSalaryChange("basic", e.target.value)}
              />
              <Input
                label="HRA"
                type="number"
                value={salary.hra}
                onChange={(e) => handleSalaryChange("hra", e.target.value)}
              />
              <Input
                label="Travel Allow."
                type="number"
                value={salary.travelAllowance}
                onChange={(e) =>
                  handleSalaryChange("travelAllowance", e.target.value)
                }
              />
              <Input
                label="Medical Allow."
                type="number"
                value={salary.medicalAllowance}
                onChange={(e) =>
                  handleSalaryChange("medicalAllowance", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg">
              <Toggle
                label="Provident Fund (PF)"
                checked={deductions.pfApplicable}
                onChange={(v) =>
                  setDeductions((d) => ({ ...d, pfApplicable: v }))
                }
              />
              <Toggle
                label="ESI Applicable"
                checked={deductions.esiApplicable}
                onChange={(v) =>
                  setDeductions((d) => ({ ...d, esiApplicable: v }))
                }
              />
              <Toggle
                label="Prof. Tax (PT)"
                checked={deductions.ptApplicable}
                onChange={(v) =>
                  setDeductions((d) => ({ ...d, ptApplicable: v }))
                }
              />
              <Toggle
                label="LWF Applicable"
                checked={deductions.lwfApplicable}
                onChange={(v) =>
                  setDeductions((d) => ({ ...d, lwfApplicable: v }))
                }
              />
            </div>
          </div>

          {/* Section: Bank & Identity */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mb-4">
              Bank & Identity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Account Number"
                value={bankAccount.accountNumber}
                onChange={(e) =>
                  handleBankChange("accountNumber", e.target.value)
                }
              />
              <Input
                label="IFSC Code"
                value={bankAccount.ifscCode}
                onChange={(e) => handleBankChange("ifscCode", e.target.value)}
              />
              <Input
                label="Bank Name"
                value={bankAccount.bankName}
                onChange={(e) => handleBankChange("bankName", e.target.value)}
              />
              <Input
                label="PAN Number"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
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
            <Button type="submit" loading={submitting || profLoading}>
              {editingId ? "Save Changes" : "Onboard Employee"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
