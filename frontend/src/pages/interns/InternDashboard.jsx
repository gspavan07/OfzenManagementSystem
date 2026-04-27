import { useState, useEffect } from 'react';
import { SectionHeader, Card, Badge, Spinner, Button } from '../../components/ui';
import { Calendar, Clock, BookOpen, Link, CheckCircle, Download, Megaphone, Pin } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { internsApi, authApi, announcementsApi } from '../../api';

const InternDashboard = () => {
  const { data: authData } = useApi(authApi.getMe);
  const currentUser = authData?.user;

  const { data: internData, loading: internLoading } = useApi(internsApi.getMe);
  const { data: annData, loading: annLoading } = useApi(
    announcementsApi.getAll
  );
  
  const intern = internData?.intern;
  const announcements = annData?.announcements || [];
  const pinned = announcements.filter((a) => a.isPinned);
  const recent = announcements.filter((a) => !a.isPinned).slice(0, 5);

  if (internLoading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  if (!internLoading && !intern) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">No Internship Record Found</h2>
        <p className="text-[var(--color-text-muted)]">We couldn't find an active internship registration linked to your account.</p>
      </div>
    );
  }

  const batch = intern?.batchId;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeader 
          title={`Welcome, ${currentUser?.name?.split(' ')[0] || 'Intern'}!`} 
          subtitle="Here is your personal internship dashboard and schedule."
        />
        {intern?.registrationStatus === 'approved' && (
          <Badge variant="success" className="text-sm px-3 py-1 mb-2 md:mb-0"><CheckCircle className="w-4 h-4 mr-1.5 inline" /> Approved & Active</Badge>
        )}
        {intern?.registrationStatus === 'pending' && (
          <Badge variant="warning" className="text-sm px-3 py-1 mb-2 md:mb-0">Registration Pending Review</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2">Batch Details</h3>
            
            {batch ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-[var(--color-primary)]">{batch.batchName}</h4>
                  <p className="text-sm text-[var(--color-text-muted)]">{batch.domain}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-bg-base)] p-3 rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      <BookOpen className="w-3.5 h-3.5" /> Tech Stack
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{batch.stack || 'N/A'}</p>
                  </div>
                  <div className="bg-[var(--color-bg-base)] p-3 rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      <Calendar className="w-3.5 h-3.5" /> Schedule
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{batch.schedule?.days?.join(', ') || 'Mon-Fri'}</p>
                  </div>
                  <div className="bg-[var(--color-bg-base)] p-3 rounded-lg border border-[var(--color-border)] col-span-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      <Clock className="w-3.5 h-3.5" /> Timings & Duration
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {batch.schedule?.startTime} to {batch.schedule?.endTime} ({batch.durationWeeks} Weeks)
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      From {new Date(batch.startDate).toLocaleDateString()} to {new Date(batch.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {batch.schedule?.meetLink && (
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-blue-500">Daily Meeting Link</span>
                    </div>
                    <a href={batch.schedule.meetLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline px-4 py-2 bg-blue-500/10 rounded-md">
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Your batch details will appear here once assigned.</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Announcements" icon={Megaphone}>
            {annLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200/10 rounded w-full"></div>
                <div className="h-10 bg-slate-200/10 rounded w-full"></div>
              </div>
            ) : pinned.length > 0 || recent.length > 0 ? (
              <div className="divide-y divide-[var(--color-border)]">
                {pinned.map((a) => (
                  <div key={a._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <Pin className="w-3.5 h-3.5 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                        <h4 className="font-semibold text-[var(--color-primary)] text-sm">
                          {a.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[var(--color-primary)] whitespace-nowrap opacity-70">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                      {a.content}
                    </p>
                  </div>
                ))}
                {recent.map((a) => (
                  <div key={a._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-[var(--color-text-primary)] text-sm">
                        {a.title}
                      </h4>
                      <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                No announcements yet.
              </p>
            )}
          </Card>

          <Card className="bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2">Your Documents</h3>
            
            <div className="space-y-3">
              {intern?.offerLetterUrl ? (
                <a href={intern.offerLetterUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Offer Letter</span>
                  <Download className="w-4 h-4 text-[var(--color-primary)]" />
                </a>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg opacity-50">
                  <span className="text-sm text-[var(--color-text-muted)]">Offer Letter (Pending)</span>
                </div>
              )}

              {intern?.completionStatus === 'completed' && intern?.certificateUrl ? (
                <a href={intern.certificateUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors">
                  <span className="text-sm font-medium text-green-500">Completion Certificate</span>
                  <Download className="w-4 h-4 text-green-500" />
                </a>
              ) : intern?.completionStatus === 'completed' ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg opacity-50">
                  <span className="text-sm text-[var(--color-text-muted)]">Certificate (Processing)</span>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
