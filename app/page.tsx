'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RemoteJob, ScanResult, CandidateProfile, ApplicationRecord } from '@/types/job';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { CandidateHeader } from '@/components/CandidateHeader';
import { JobCard } from '@/components/JobCard';
import { ApplyModal } from '@/components/ApplyModal';
import { EmailDigestModal } from '@/components/EmailDigestModal';
import { OutboxDrawer } from '@/components/OutboxDrawer';
import { SprintWarRoom } from '@/components/SprintWarRoom';
import { OutreachSection } from '@/components/OutreachSection';
import { AutopilotSwitchboard } from '@/components/AutopilotSwitchboard';
import { MasterCatalogueModal } from '@/components/MasterCatalogueModal';
import {
  Search,
  RefreshCw,
  Mail,
  Briefcase,
  AlertCircle,
  Send,
  ShieldCheck,
  Flame,
  Globe2,
  Award,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [candidate, setCandidate] = useState<CandidateProfile>(DEFAULT_CANDIDATE);
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [stats, setStats] = useState<ScanResult['stats']>({
    urgentCount: 0,
    highMatchCount: 0,
    averageScore: 0,
    directEmailCount: 0,
    safeCount: 0,
    suspiciousFilteredCount: 0,
  });
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hn' | 'direct_email' | 'translated' | 'godseye' | 'urgent' | 'top' | 'nextjs' | 'python'>('all');
  const [activeApplyJob, setActiveApplyJob] = useState<RemoteJob | null>(null);
  const [activeMode, setActiveMode] = useState<'jobs' | 'outreach'>('jobs');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [autoApplyFeedback, setAutoApplyFeedback] = useState<{
    success: boolean;
    message: string;
    mode?: string;
    recipient?: string;
    cvAttached?: string;
    details?: string[];
  } | null>(null);

  const triggerAutoApply = async (isTest: boolean) => {
    setIsAutoApplying(true);
    setAutoApplyFeedback(null);
    try {
      const url = isTest
        ? `/api/auto-apply?test=true&recipient=${encodeURIComponent(candidate.email)}`
        : `/api/auto-apply?limit=25`;

      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setAutoApplyFeedback({
          success: true,
          message: data.message || 'Auto-application dispatched successfully!',
          mode: data.mode,
          recipient: data.recipient || `${data.dispatchedCount} employers`,
          cvAttached: data.cvAttached || (data.dispatched && data.dispatched[0]?.cvAttached) || 'CV Attached',
          details: data.notes || (data.record ? [data.record.subject] : []),
        });
        // Refresh outbox history
        const histRes = await fetch('/api/apply/history');
        const histData = await histRes.json();
        if (histData.success) {
          setApplications(histData.applications || []);
        }
      } else {
        setAutoApplyFeedback({
          success: false,
          message: data.error || 'Failed to execute auto-application cycle.',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during auto-apply';
      setAutoApplyFeedback({
        success: false,
        message: errorMsg,
      });
    } finally {
      setIsAutoApplying(false);
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, historyRes] = await Promise.all([
        fetch('/api/jobs/search'),
        fetch('/api/apply/history'),
      ]);

      const jobsData = await jobsRes.json();
      const historyData = await historyRes.json();

      if (jobsData.success) {
        setJobs(jobsData.matchedJobs || []);
        setStats(jobsData.stats || {
          urgentCount: 0,
          highMatchCount: 0,
          averageScore: 0,
          directEmailCount: 0,
          safeCount: 0,
          suspiciousFilteredCount: 0,
        });
        if (jobsData.candidate) {
          setCandidate(jobsData.candidate);
        }
      }

      if (historyData.success) {
        setApplications(historyData.applications || []);
      }
    } catch (err) {
      console.error('Failed to load jobs or application history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Background polling: automatically checks feeds every 30 minutes while dashboard is open
    const interval = setInterval(() => {
      fetchJobs();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const appliedJobIds = useMemo(() => {
    return new Set(applications.map(a => a.jobId));
  }, [applications]);

  const handleApplicationDispatched = (jobId: string) => {
    fetch('/api/apply/history')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApplications(data.applications || []);
        }
      });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search text query
      const matchSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.synergyStack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Filter category
      if (selectedFilter === 'hn') return job.source === 'HackerNews';
      if (selectedFilter === 'direct_email') return job.instructions?.hasDirectEmail;
      if (selectedFilter === 'translated') return job.translation?.isTranslated;
      if (selectedFilter === 'godseye') {
        const text = `${job.title} ${job.tags.join(' ')} ${job.synergyStack.join(' ')} ${job.description}`.toLowerCase();
        return text.includes('ai') || text.includes('machine learning') || text.includes('python') || text.includes('vision') || text.includes('quant') || text.includes('trading') || text.includes('stream') || text.includes('systems') || text.includes('fastapi');
      }
      if (selectedFilter === 'urgent') return job.urgent;
      if (selectedFilter === 'top') return job.matchScore >= 88;
      if (selectedFilter === 'nextjs') {
        const text = `${job.title} ${job.tags.join(' ')} ${job.synergyStack.join(' ')}`.toLowerCase();
        return text.includes('next') || text.includes('react') || text.includes('typescript');
      }
      if (selectedFilter === 'python') {
        const text = `${job.title} ${job.tags.join(' ')} ${job.synergyStack.join(' ')}`.toLowerCase();
        return text.includes('python') || text.includes('fastapi') || text.includes('django');
      }

      return true;
    });
  }, [jobs, searchQuery, selectedFilter]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Candidate Profile Dossier Header */}
        <CandidateHeader candidate={candidate} onRefreshProfile={fetchJobs} />

        {/* Autonomous Autopilot Switchboard */}
        <AutopilotSwitchboard
          totalJobsScanned={jobs.length}
          totalApplied={applications.length}
          isRunningCycle={isAutoApplying}
          onRunCycleNow={() => triggerAutoApply(false)}
          onOpenOutbox={() => setIsOutboxOpen(true)}
          onOpenWarRoom={() => setIsWarRoomOpen(true)}
        />

        {/* Live Feedback Toast/Banner */}
        {autoApplyFeedback && (
          <div className={`mt-0 mb-6 p-4 rounded-xl border text-xs sm:text-sm ${
            autoApplyFeedback.success
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {autoApplyFeedback.message}
                </div>
                {autoApplyFeedback.recipient && (
                  <div className="text-slate-300 text-xs">
                    Target: <span className="font-mono text-cyan-300">{autoApplyFeedback.recipient}</span> · Attached CV: <span className="font-mono text-amber-300">{autoApplyFeedback.cvAttached}</span>
                  </div>
                )}
                {autoApplyFeedback.details && autoApplyFeedback.details.length > 0 && (
                  <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                    {autoApplyFeedback.details.map((d, i) => (
                      <div key={i}>• {d}</div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOutboxOpen(true)}
                className="text-xs underline text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold whitespace-nowrap"
              >
                View in Outbox →
              </button>
            </div>
          </div>
        )}

        {/* Dual-Engine Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setActiveMode('jobs')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-md ${
              activeMode === 'jobs'
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Autonomous Inbound Job Hunter ({jobs.length} Positions)</span>
          </button>

          <button
            onClick={() => setActiveMode('outreach')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-md ${
              activeMode === 'outreach'
                ? 'bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 shadow-red-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Proactive Problem-Solver Outreach (5 Global Sectors)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800 font-mono">
              NEW
            </span>
          </button>
        </div>

        {/* Mode: Proactive Problem-Solver Outreach */}
        {activeMode === 'outreach' && (
          <OutreachSection onDispatched={fetchJobs} />
        )}

        {/* Mode: Inbound Job Hunter */}
        {activeMode === 'jobs' && (
          <>
        {/* Action & Stats Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Scam Shield Active ({stats.safeCount} Verified Safe · {stats.suspiciousFilteredCount} Filtered)
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                Worldwide Autonomous Job Engine &amp; Scam Shield
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Scans HN Founders, RemoteOK, Arbeitnow, Jobicy &amp; Remotive. Translates foreign listings, customizes ATS CVs, and auto-dispatches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsWarRoomOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-md shadow-amber-500/10"
              >
                <Flame className="w-4 h-4" />
                30-Day Sprint War Room
              </button>

              <button
                onClick={() => setIsCatalogueOpen(true)}
                className="inline-flex items-center gap-2 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Catalogue ({jobs.length})
              </button>

              <button
                onClick={() => setIsOutboxOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                Outbox ({applications.length})
              </button>

              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                Daily Alert
              </button>

              <button
                onClick={fetchJobs}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-md shadow-cyan-500/10"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scanning...' : 'Scan Now'}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Total Scanned</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{jobs.length}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Direct Recruiter Emails</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.directEmailCount ?? 0}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">High Match (&ge;85%)</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{stats.highMatchCount}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Scam Shield Verified</div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">{stats.safeCount} Safe</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400">Applications Sent</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{applications.length}</div>
            </div>
          </div>

          {/* Search & Filter Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, company, or stack (e.g. Next.js, Python, PostgreSQL, WebSockets)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Matches' },
                { id: 'hn', label: '🔥 HN Founder Posts' },
                { id: 'direct_email', label: '✉️ Direct Recruiter Email' },
                { id: 'godseye', label: "👁️ GOD'S EYE / Quant" },
                { id: 'translated', label: '🌐 Translated Non-English' },
                { id: 'urgent', label: 'Urgent ⚡' },
                { id: 'top', label: 'Top Fit (90%+)' },
                { id: 'nextjs', label: 'Next.js / React' },
                { id: 'python', label: 'Python / FastAPI' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFilter === f.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">
              Showing <span className="text-white font-bold">{filteredJobs.length}</span> positions
            </span>
            <span className="text-xs text-slate-500">
              Scam Shield &amp; ATS Compatibility Active
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse h-64"
                >
                  <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-slate-800 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
                  <div className="h-16 bg-slate-800/60 rounded mb-4" />
                  <div className="h-8 bg-slate-800 rounded w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center max-w-md mx-auto my-12">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Jobs Found</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-4">
                No roles match your current search query or filter. Try clearing filters or scanning again.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isApplied={appliedJobIds.has(job.id)}
                  onOpenApply={(selected) => setActiveApplyJob(selected)}
                />
              ))}
            </div>
          )}
        </div>
        </>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p className="mb-2">
            Engineered for <span className="text-slate-300 font-semibold">{candidate.name}</span> · Deployable on Vercel with automated daily cron.
          </p>
          <p>
            Portfolio: <a href={candidate.portfolioUrl} className="text-cyan-400 hover:underline">olumidenana.github.io/olumide-portfolio</a> · GitHub: <a href={candidate.githubUrl} className="text-cyan-400 hover:underline">github.com/Olumidenana</a>
          </p>
        </footer>

      </div>

      {/* Apply Assistant Modal */}
      <ApplyModal
        job={activeApplyJob}
        onClose={() => setActiveApplyJob(null)}
        onApplicationSent={handleApplicationDispatched}
      />

      {/* Email Digest & Cron Modal */}
      <EmailDigestModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        jobs={jobs}
        stats={stats}
        recipientEmail={candidate.email}
      />

      {/* Applications Outbox Drawer */}
      <OutboxDrawer
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        applications={applications}
      />

      {/* 30-Day Employment Sprint War Room */}
      <SprintWarRoom
        isOpen={isWarRoomOpen}
        onClose={() => setIsWarRoomOpen(false)}
        sentCount={applications.length}
      />

      {/* Master Catalogue & Applied Summary Modal */}
      <MasterCatalogueModal
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        jobs={jobs}
        applications={applications}
        onOpenJob={(selected) => setActiveApplyJob(selected)}
      />
    </main>
  );
}
