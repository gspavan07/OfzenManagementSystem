import { useState, useEffect, useMemo } from 'react';
import { SectionHeader, Card, Button, Input, Spinner, Badge } from '../../components/ui';
import { User, Lock, Save, ShieldCheck, Banknote, Download, Building, Landmark } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { authApi, employeesApi, payrollApi } from '../../api';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'financials'

  // -- Profile Data --
  const { data: authData, loading: authLoading, execute: fetchMe } = useApi(authApi.getMe);
  const user = authData?.user;

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // -- Financials Data --
  const { data: empData, loading: empLoading } = useApi(employeesApi.getMe);
  const { data: payData, loading: payLoading } = useApi(payrollApi.getMyPayslips);
  
  const employee = empData?.employee;
  const payslips = payData?.payslips || [];

  // Derived state for dropdowns
  const availableYears = useMemo(() => {
    return [...new Set(payslips.map(p => p.year))].sort((a, b) => b - a);
  }, [payslips]);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // When years populate, select the most recent by default
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  // Available months for the selected year
  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    return payslips
      .filter(p => p.year.toString() === selectedYear)
      .map(p => p.month)
      .sort((a, b) => b - a);
  }, [payslips, selectedYear]);

  // Default select the most recent month for the year
  useEffect(() => {
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0].toString());
    } else {
      setSelectedMonth('');
    }
  }, [availableMonths, selectedYear]);

  const selectedPayslip = useMemo(() => {
    return payslips.find(p => p.year.toString() === selectedYear && p.month.toString() === selectedMonth);
  }, [payslips, selectedYear, selectedMonth]);


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authApi.updateMe({ name, phone });
      toast.success('Profile updated successfully');
      fetchMe(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSavingPassword(true);
    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated securely');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) return <div className="flex justify-center p-12"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <SectionHeader 
        title="My Account" 
        subtitle="Manage your personal details, account security, and financials."
      />

      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
        >
          <div className="flex items-center gap-2"><User className="w-4 h-4" /> Security & Profile</div>
        </button>
        <button 
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'financials' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
        >
          <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> Financials & Payslips</div>
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Profile Details */}
          <Card className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border)] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Personal Details</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Update your name and contact information.</p>
              </div>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Email Address" value={user?.email} disabled />
                <p className="text-[10px] text-[var(--color-text-muted)] -mt-3 ml-1">Email cannot be changed.</p>
                <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                <div className="bg-[var(--color-bg-base)] border border-[var(--color-border)] p-3 rounded-lg flex items-start gap-2 mt-4">
                  <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Assigned Profile Level</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{user?.profileLabel || 'Basic User'}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" loading={savingProfile}><Save className="w-4 h-4 mr-2" /> Save Profile</Button>
              </div>
            </form>
          </Card>

          {/* Security Settings */}
          <Card className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border)] pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Account Security</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Update your login password securely.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <Input label="Current Password" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                <div className="pt-2">
                  <Input label="New Password" type="password" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <Input label="Confirm New Password" type="password" placeholder="Must match new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" loading={savingPassword} variant="primary">Update Password</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {empLoading || payLoading ? (
            <div className="col-span-3 flex justify-center p-12"><Spinner /></div>
          ) : !employee ? (
            <div className="col-span-3 text-center py-12">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">No Employee Record Found</h2>
              <p className="text-[var(--color-text-muted)] mt-2">You do not have an active employee or payroll profile configured.</p>
            </div>
          ) : (
            <>
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-[var(--color-primary)]" /> Salary Structure
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-lg">
                      <p className="text-xs text-[var(--color-text-secondary)]">Basic Salary</p>
                      <p className="text-lg font-bold text-[var(--color-text-primary)]">₹{employee.salary?.basic || 0}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-lg">
                      <p className="text-xs text-[var(--color-text-secondary)]">HRA</p>
                      <p className="text-lg font-bold text-[var(--color-text-primary)]">₹{employee.salary?.hra || 0}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-lg">
                      <p className="text-xs text-[var(--color-text-secondary)]">Allowances</p>
                      <p className="text-lg font-bold text-[var(--color-text-primary)]">
                        ₹{(employee.salary?.travelAllowance || 0) + (employee.salary?.medicalAllowance || 0) + (employee.salary?.otherAllowance || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg">
                      <p className="text-xs font-semibold text-[var(--color-primary)]">Gross Monthly Salary</p>
                      <p className="text-xl font-black text-[var(--color-primary)]">₹{employee.salary?.grossSalary || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-green-500" /> Bank Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] uppercase">Bank Name</p>
                      <p className="font-medium text-[var(--color-text-primary)]">{employee.bankAccount?.bankName || 'Not Provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] uppercase">Account Holder</p>
                      <p className="font-medium text-[var(--color-text-primary)]">{employee.bankAccount?.accountHolderName || 'Not Provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] uppercase">Account Number</p>
                      <p className="font-mono text-sm mt-1 bg-[var(--color-bg-elevated)] px-2 py-1 rounded inline-block text-[var(--color-text-primary)]">
                        {employee.bankAccount?.accountNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] uppercase">IFSC Code</p>
                      <p className="font-mono text-sm mt-1 bg-[var(--color-bg-elevated)] px-2 py-1 rounded inline-block text-[var(--color-text-primary)]">
                        {employee.bankAccount?.ifscCode || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2">
                    Payslip Generator
                  </h3>
                  
                  {availableYears.length === 0 ? (
                    <div className="text-sm text-[var(--color-text-muted)] text-center py-4 bg-white/5 rounded-lg border border-white/10">
                      No payslips have been generated for your account yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Financial Year</label>
                        <select 
                          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors"
                          value={selectedYear}
                          onChange={e => setSelectedYear(e.target.value)}
                        >
                          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Month</label>
                        <select 
                          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors"
                          value={selectedMonth}
                          onChange={e => setSelectedMonth(e.target.value)}
                          disabled={!selectedYear}
                        >
                          {availableMonths.map(m => (
                            <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-4 border-t border-[var(--color-border)]">
                        {selectedPayslip ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--color-text-muted)]">Net Payable:</span>
                              <span className="font-bold text-[var(--color-primary)]">₹{selectedPayslip.netPay}</span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-[var(--color-text-muted)]">Status:</span>
                              <Badge variant={selectedPayslip.status === 'paid' ? 'success' : 'warning'}>{selectedPayslip.status}</Badge>
                            </div>
                            
                            {selectedPayslip.pdfUrl ? (
                              <a 
                                href={selectedPayslip.pdfUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                              >
                                <Download className="w-4 h-4" /> Download Payslip
                              </a>
                            ) : (
                              <Button className="w-full" disabled>PDF Not Available</Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-sm text-[var(--color-text-muted)] py-2">
                            Select a valid month to view.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
