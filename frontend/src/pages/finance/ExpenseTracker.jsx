import { useState, useMemo } from 'react';
import { SectionHeader, Card, Table, Button, Modal, Input, Badge } from '../../components/ui';
import { Receipt, Plus, Trash2, Edit2, TrendingDown } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { financeApi } from '../../api';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = ['Salary', 'Software', 'Marketing', 'Office', 'Other'];

const ExpenseTracker = () => {
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const { data, loading, execute: fetchExpenses } = useApi(() => 
    financeApi.getExpenses({ month: filterMonth, year: filterYear })
  );
  
  const expenses = data?.expenses || [];
  const totalExpense = data?.total || 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidTo, setPaidTo] = useState('');

  const openModal = (exp = null) => {
    if (exp) {
      setEditingId(exp._id);
      setDate(new Date(exp.date).toISOString().split('T')[0]);
      setCategory(exp.category);
      setAmount(exp.amount);
      setDescription(exp.description || '');
      setPaidTo(exp.paidTo || '');
    } else {
      setEditingId(null);
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(CATEGORY_OPTIONS[0]);
      setAmount('');
      setDescription('');
      setPaidTo('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { date, category, amount: Number(amount), description, paidTo };
      if (editingId) {
        await financeApi.updateExpense(editingId, payload);
        toast.success('Expense updated');
      } else {
        await financeApi.createExpense(payload);
        toast.success('Expense logged successfully');
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await financeApi.deleteExpense(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'details', label: 'Details', render: (_, row) => (
      <div>
        <div className="font-medium text-[var(--color-text-primary)]">{row.description || 'No description'}</div>
        <div className="text-xs text-[var(--color-text-muted)]">Paid to: {row.paidTo || 'N/A'}</div>
      </div>
    ) },
    { key: 'category', label: 'Category', render: (val) => <Badge variant="secondary">{val}</Badge> },
    { key: 'amount', label: 'Amount', render: (val) => (
      <span className="font-semibold text-red-500">-₹{val.toLocaleString('en-IN')}</span>
    ) },
    { key: 'addedBy', label: 'Logged By', render: (_, row) => row.addedBy?.name || 'Unknown' },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openModal(row)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-white/5" title="Edit">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(row._id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors rounded-md hover:bg-white/5" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader 
          title="Expense Tracker" 
          subtitle="Log and monitor company operating costs."
        />
        <div className="flex items-center gap-3">
          <select 
            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input 
            type="number"
            className="w-24 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
          />
          <Button onClick={() => openModal()} className="shadow-sm">
            <Plus className="w-4 h-4" /> Log Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Total Expenses</p>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">₹{totalExpense.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">For selected month/year</p>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={expenses} loading={loading} emptyMessage="No expenses found for this period" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Expense" : "Log New Expense"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Category</label>
              <select className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors" value={category} onChange={e => setCategory(e.target.value)} required>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Input label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            <Input label="Paid To (Vendor/Person)" value={paidTo} onChange={e => setPaidTo(e.target.value)} placeholder="e.g. Amazon Web Services" />
            
            <div className="md:col-span-2">
              <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Monthly hosting fees" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingId ? 'Save Changes' : 'Log Expense'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseTracker;
