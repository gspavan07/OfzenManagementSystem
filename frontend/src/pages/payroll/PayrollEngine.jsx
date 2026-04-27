import { useState } from 'react';
import { SectionHeader, Card, Table, Button, Modal, Input, Badge, Spinner } from '../../components/ui';
import { Banknote, Plus, Download, CheckCircle, Calculator } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { payrollApi, employeesApi } from '../../api';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollEngine = () => {
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const { data: payData, loading: payLoading, execute: fetchPayroll } = useApi(() => 
    payrollApi.getAll({ month: filterMonth, year: filterYear })
  );
  
  const { data: empData, loading: empLoading } = useApi(() => employeesApi.getAll({ isActive: true }));
  
  const payslips = payData?.payslips || [];
  const employees = empData?.employees || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Inputs
  const [workingDays, setWorkingDays] = useState(30);
  const [presentDays, setPresentDays] = useState(30);
  const [loanRecovery, setLoanRecovery] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const openModal = () => {
    setStep(1);
    setTargetMonth(new Date().getMonth() + 1);
    setTargetYear(new Date().getFullYear());
    setSelectedEmployee('');
    setWorkingDays(30);
    setPresentDays(30);
    setLoanRecovery(0);
    setOtherDeductions(0);
    setModalOpen(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return toast.error('Please select an employee');
    
    setSubmitting(true);
    try {
      await payrollApi.generate({
        employeeId: selectedEmployee,
        month: Number(targetMonth),
        year: Number(targetYear),
        workingDays: Number(workingDays),
        presentDays: Number(presentDays),
        loanRecovery: Number(loanRecovery),
        otherDeductions: Number(otherDeductions)
      });
      toast.success('Payslip generated successfully');
      setModalOpen(false);
      fetchPayroll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (id, empName) => {
    try {
      const response = await payrollApi.downloadPdf(id);
      // Create a blob from the PDF stream
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${empName}_${filterMonth}_${filterYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await payrollApi.markPaid(id);
      toast.success('Marked as paid');
      fetchPayroll();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const columns = [
    { key: 'emp', label: 'Employee', render: (_, row) => (
      <div>
        <div className="font-semibold text-[var(--color-primary)]">{row.employeeId?.userId?.name || 'Unknown'}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{row.employeeId?.userId?.email || ''}</div>
      </div>
    ) },
    { key: 'period', label: 'Period', render: (_, row) => `${MONTH_NAMES[row.month - 1]} ${row.year}` },
    { key: 'gross', label: 'Gross Pay', render: (_, row) => `₹${row.earnings?.grossEarnings?.toLocaleString('en-IN') || 0}` },
    { key: 'net', label: 'Net Payable', render: (_, row) => (
      <span className="font-bold text-green-500">₹{row.netPay?.toLocaleString('en-IN') || 0}</span>
    ) },
    { key: 'status', label: 'Status', render: (val) => (
      <Badge variant={val === 'paid' ? 'success' : 'warning'}>{val}</Badge>
    ) },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleDownload(row._id, row.employeeId?.userId?.name)} title="Download PDF">
          <Download className="w-4 h-4 text-[var(--color-primary)]" />
        </Button>
        {row.status !== 'paid' && (
          <Button variant="ghost" size="sm" onClick={() => handleMarkPaid(row._id)} title="Mark as Paid">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </Button>
        )}
      </div>
    ) }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader 
          title="Payroll Engine" 
          subtitle="Generate payslips and calculate statutory deductions dynamically."
        />
        <div className="flex items-center gap-3">
          <select 
            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(Number(e.target.value));
              setTimeout(fetchPayroll, 0);
            }}
          >
            {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <input 
            type="number"
            className="w-24 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
            value={filterYear}
            onChange={(e) => {
              setFilterYear(Number(e.target.value));
              setTimeout(fetchPayroll, 0);
            }}
          />
          <Button onClick={openModal} className="shadow-sm">
            <Calculator className="w-4 h-4" /> Run Payroll
          </Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={payslips} loading={payLoading} emptyMessage="No payslips generated for this period" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Payslip" size="lg">
        <form onSubmit={handleGenerate} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Step 1: Select Target Employee & Period</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Target Month</label>
                  <select className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={targetMonth} onChange={e => setTargetMonth(e.target.value)}>
                    {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <Input label="Target Year" type="number" value={targetYear} onChange={e => setTargetYear(e.target.value)} required />
              </div>

              <div className="space-y-1 mt-4">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Active Employee</label>
                <select className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} required>
                  <option value="" disabled>-- Choose an employee --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.userId?.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => {
                  if(!selectedEmployee) return toast.error('Select an employee first');
                  setStep(2);
                }}>Next Step →</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Step 2: Enter Variable Variables</h4>
              
              <div className="bg-[var(--color-bg-elevated)] p-4 rounded-lg border border-[var(--color-border)] mb-4">
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  The system will automatically calculate basic pay, allowances, PF, ESI, and PT based on the employee's master salary structure. Provide the variables below for this specific month.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Total Working Days" type="number" value={workingDays} onChange={e => setWorkingDays(e.target.value)} required />
                <Input label="Present Days" type="number" value={presentDays} onChange={e => setPresentDays(e.target.value)} required />
                <Input label="Loan Recovery (₹)" type="number" value={loanRecovery} onChange={e => setLoanRecovery(e.target.value)} />
                <Input label="Other Deductions (₹)" type="number" value={otherDeductions} onChange={e => setOtherDeductions(e.target.value)} />
              </div>

              <div className="flex justify-between pt-4 border-t border-[var(--color-border)] mt-6">
                <Button variant="ghost" type="button" onClick={() => setStep(1)}>← Back</Button>
                <Button type="submit" loading={submitting}>Generate PDF Payslip</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default PayrollEngine;
