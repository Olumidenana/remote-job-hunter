'use client';

import React, { useState, useMemo } from 'react';
import { RemoteJob, ApplicationRecord } from '@/types/job';
import {
  X,
  Search,
  CheckCircle2,
  Briefcase,
  Building2,
  Mail,
  ExternalLink,
  ShieldCheck,
  Send,
  Download,
  Filter,
} from 'lucide-react';

interface MasterCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: RemoteJob[];
  applications: ApplicationRecord[];
  onOpenJob: (job: RemoteJob) => void;
}

export function MasterCatalogueModal({
  isOpen,
  onClose,
  jobs,
  applications,
  onOpenJob,
}: MasterCatalogueModalProps) {
  const [activeTab, setActiveTab] = useState<'applied' | 'all_catalogue'>('applied');
  const [search, setSearch] = useState('');

  const appliedMap = useMemo(() => {
    const map = new Map<string, ApplicationRecord>();
    applications.forEach(a => map.set(a.jobId, a));
    return map;
  }, [applications]);

  const filteredApplied = useMemo(() => {
    return applications.filter(a => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        a.company.toLowerCase().includes(s) ||
        a.jobTitle.toLowerCase().includes(s) ||
        a.recipientEmail.toLowerCase().includes(s) ||
        a.cvAttached.toLowerCase().includes(s)
      );
    });
  }, [applications, search]);

  const filteredCatalogue = useMemo(() => {
    return jobs.filter(j => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        j.tags.some(t => t.toLowerCase().includes(s)) ||
        j.synergyStack.some(t => t.toLowerCase().includes(s))
      );
    });
  }, [jobs, search]);

  if (!isOpen) return null;

  const exportCsv = () => {
    const rows = [
      ['Company', 'Title', 'Recipient Email', 'Status', 'Attached CV', 'Sent At'],
      ...applications.map(a => [
        `"${a.company}"`,
        `"${a.jobTitle}"`,
        `"${a.recipientEmail}"`,
        `"${a.status}"`,
        `"${a.cvAttached}"`,
        `"${new Date(a.sentAt).toLocaleString()}"`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Olumide_Applications_Catalogue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Master Jobs Catalogue &amp; Applied Summary
              </h2>
              <p className="text-xs text-slate-400">
                Audited archive of all indexed global listings and autonomous dispatched applications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Search Strip */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('applied')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'applied'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ✓ Applied Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('all_catalogue')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'all_catalogue'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🌐 Entire Global Catalogue ({jobs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, company, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeTab === 'applied' ? (
            filteredApplied.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <div className="text-sm font-semibold text-slate-400">No applications dispatched yet</div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  The autonomous background engine or on-demand sweep will auto-apply to qualified verified jobs.
                </p>
              </div>
            ) : (
              filteredApplied.map(app => (
                <div
                  key={app.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.company}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-cyan-300 font-semibold">{app.jobTitle}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span>To: <strong className="text-amber-300">{app.companyEmailPicked || app.recipientEmail}</strong></span>
                      <span>CV: <strong className="text-slate-300">{app.cvAttached}</strong></span>
                      <span className="text-slate-500">{new Date(app.sentAt).toLocaleString()}</span>
                    </div>

                    {app.complianceNotes && app.complianceNotes.length > 0 && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="line-clamp-1">{app.complianceNotes.join(' · ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {app.mailtoUrl && (
                      <a
                        href={app.mailtoUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold transition"
                      >
                        <Send className="w-3 h-3" />
                        Open Mail Draft
                      </a>
                    )}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      SENT
                    </span>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredCatalogue.map(job => {
              const applied = appliedMap.get(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{job.company}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-200 font-semibold">{job.title}</span>
                      {applied && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Applied
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{job.location}</span>
                      <span>·</span>
                      <span className="text-cyan-400 font-mono">{job.matchScore}% Match</span>
                      <span>·</span>
                      <span className="text-slate-500 font-mono">{job.source}</span>
                      {job.instructions?.recipientEmail && (
                        <span className="text-amber-300 font-mono">
                          ✉️ {job.instructions.recipientEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenJob(job);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      View Details &amp; Apply
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            {activeTab === 'applied'
              ? `Total Applications Dispatched: ${applications.length}`
              : `Total Catalogue Positions: ${jobs.length}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
