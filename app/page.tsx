'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RemoteJob, ScanResult, CandidateProfile } from '@/types/job';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { CandidateHeader } from '@/components/CandidateHeader';
import { JobCard } from '@/components/JobCard';
import { ApplyModal } from '@/components/ApplyModal';
import { EmailDigestModal } from '@/components/EmailDigestModal';
import {
  Search,
  RefreshCw,
  Mail,
  Briefcase,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function Home() {
  const [candidate, setCandidate] = useState<CandidateProfile>(DEFAULT_CANDIDATE);
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [stats, setStats] = useState<ScanResult['stats']>({
    urgentCount: 0,
    highMatchCount: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'godseye' | 'urgent' | 'top' | 'nextjs' | 'python' | 'fullstack' | 'fintech'>('all');
  const [activeApplyJob, setActiveApplyJob] = useState<RemoteJob | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs/search');
      const data = await res.json();
      if (data.success) {
        setJobs(data.matchedJobs || []);
        setStats(data.stats || { urgentCount: 0, highMatchCount: 0, averageScore: 0 });
        if (data.candidate) {
          setCandidate(data.candidate);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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
      if (selectedFilter === 'fullstack') {
        const text = `${job.title} ${job.tags.join(' ')}`.toLowerCase();
        return text.includes('full stack') || text.includes('full-stack') || text.includes('fullstack');
      }
      if (selectedFilter === 'fintech') {
        const text = `${job.title} ${job.tags.join(' ')} ${job.description}`.toLowerCase();
        return text.includes('fintech') || text.includes('payment') || text.includes('trading') || text.includes('quant');
      }

      return true;
    });
  }, [jobs, searchQuery, selectedFilter]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Candidate Profile Dossier Header */}
        <CandidateHeader candidate={candidate} />

        {/* Action & Stats Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                Autonomous Remote Job Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Scans global remote feeds matched against your GitHub portfolio &amp; GOD'S EYE sovereign architecture.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                Daily Email Digest
              </button>

              <button
                onClick={fetchJobs}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-md shadow-cyan-500/10"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scanning Feeds...' : 'Scan Jobs Now'}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Total Scanned Today</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{jobs.length}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">High Match (&ge;85%)</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{stats.highMatchCount}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Urgent Roles (48h)</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{stats.urgentCount}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Avg Compatibility</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.averageScore}%</div>
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
                { id: 'godseye', label: "👁️ GOD'S EYE / Quant" },
                { id: 'urgent', label: 'Urgent ⚡' },
                { id: 'top', label: 'Top Fit (90%+)' },
                { id: 'nextjs', label: 'Next.js / React' },
                { id: 'python', label: 'Python / FastAPI' },
                { id: 'fullstack', label: 'Full-Stack' },
                { id: 'fintech', label: 'FinTech' },
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
              Sorted by Match Score & Freshness
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
                  onOpenApply={(selected) => setActiveApplyJob(selected)}
                />
              ))}
            </div>
          )}
        </div>

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
      />

      {/* Email Digest & Cron Modal */}
      <EmailDigestModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        jobs={jobs}
        stats={stats}
        recipientEmail={candidate.email}
      />
    </main>
  );
}
