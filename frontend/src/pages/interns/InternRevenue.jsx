import { SectionHeader, Card, Table, Spinner } from '../../components/ui';
import { IndianRupee, TrendingUp, Users, Calendar, CheckCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { financeApi } from '../../api';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const InternRevenue = () => {
  const {
    data: internRevData,
    loading: internRevLoading,
  } = useApi(financeApi.getInternRevenue);

  const internRevenue = internRevData?.data;

  const internBatchColumns = [
    { key: 'name', label: 'Batch Name', render: (val, row) => (
      <div>
        <div className="font-bold text-[var(--color-text-primary)]">{val}</div>
        <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{row.domain}</div>
      </div>
    )},
    { key: 'count', label: 'Paid Interns', render: (val) => (
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-text-muted" />
        <span className="font-medium">{val}</span>
      </div>
    )},
    { key: 'amount', label: 'Revenue Generated', render: (val) => (
      <span className="font-bold text-[var(--color-primary)]">₹{val.toLocaleString()}</span>
    )}
  ];

  const internMonthlyColumns = [
    { key: 'month', label: 'Month', render: (val, row) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-text-muted" />
        <span className="font-medium">{MONTH_NAMES[val-1]} {row.year}</span>
      </div>
    )},
    { key: 'count', label: 'Registrations' },
    { key: 'amount', label: 'Revenue', render: (val) => (
      <span className="font-bold text-green-500">₹{val.toLocaleString()}</span>
    )}
  ];

  if (internRevLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-text-muted animate-pulse">Calculating registration revenue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen animate-fade-in">
      <SectionHeader 
        title="Internship Revenue" 
        subtitle="Automatic financial tracking based on student registrations and batch fees."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Total Life-time Revenue</p>
              <h2 className="text-2xl font-black text-text-primary">₹{internRevenue?.totalRevenue?.toLocaleString() || 0}</h2>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Avg. Revenue / Batch</p>
              <h2 className="text-2xl font-black text-text-primary">
                ₹{internRevenue?.batchWise?.length > 0 
                  ? Math.round(internRevenue.totalRevenue / internRevenue.batchWise.length).toLocaleString() 
                  : 0}
              </h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Total Paid Students</p>
              <h2 className="text-2xl font-black text-text-primary">
                {internRevenue?.batchWise?.reduce((s, b) => s + b.count, 0) || 0}
              </h2>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Batch-wise Performance" icon={TrendingUp}>
          <p className="text-xs text-text-muted mb-4">Revenue breakdown for every internship program you've launched.</p>
          <Table 
            columns={internBatchColumns} 
            data={internRevenue?.batchWise || []} 
            emptyMessage="No batch data available."
          />
        </Card>

        <Card title="Monthly Growth" icon={CheckCircle}>
          <p className="text-xs text-text-muted mb-4">Income stream trend over the last few months.</p>
          <Table 
            columns={internMonthlyColumns} 
            data={internRevenue?.monthly || []} 
            emptyMessage="No monthly intake data."
          />
        </Card>
      </div>
    </div>
  );
};

export default InternRevenue;
