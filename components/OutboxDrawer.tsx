'use client';

import React, { useState, useMemo } from 'react';
import { ApplicationRecord } from '@/types/job';
import {
  X,
  CheckCircle2,
  Clock,
  Mail,
  Paperclip,
  Building2,
  ShieldCheck,
  Send,
  Globe2,
  Search,
  Download,
  Flame,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

interface OutboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: ApplicationRecord[];
}

export function OutboxDrawer({ isOpen, onClose, applications }: OutboxDrawerProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'JOB_APP' | 'OUTREACH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const jobAppCount = useMemo(
    () => applications.filter(a => a.type !== 'OUTREACH').length,
    [applications]
  );
  const outreachCount = useMemo(
    () => applications.filter(a => a.type === 'OUTREACH').length,
    [applications]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Tab filter
      if (activeTab === 'JOB_APP' && app.type === 'OUTREACH') return false;
      if (activeTab === 'OUTREACH' && app.type !== 'OUTREACH') return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCompany = app.company?.toLowerCase().includes(q);
        const matchesTitle = app.jobTitle?.toLowerCase().includes(q);
        const matchesEmail = app.recipientEmail?.toLowerCase().includes(q);
        const matchesSector = app.sector?.toLowerCase().includes(q);
        return matchesCompany || matchesTitle || matchesEmail || matchesSector;
      }
      return true;
    });
  }, [applications, activeTab, searchQuery]);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(applications, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `outbox_proof_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Dispatches Master Outbox</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
                  {applications.length} sent
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Permanent log of all job applications and diagnostic outreaches sent on your behalf
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Info Banner */}
        <div className="bg-slate-950/80 border-b border-slate-800 p-4 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-cyan-400 flex items-center justify-between">
            <span>🛡️ 3 Proof Layers of Delivery</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportJson}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Proof Log
              </button>
              <a
                href="https://resend.com/emails"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-300 hover:text-white underline font-semibold flex items-center gap-1"
              >
                Resend Logs ↗
              </a>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            1. <strong>Direct Delivery Audit:</strong> You receive an instant carbon copy of every application sent in your Gmail (<code className="text-cyan-300">olumideadeyeminana@gmail.com</code>).<br/>
            2. <strong>Resend Logs:</strong> Every email gets an immutable <code className="text-amber-300">Message ID</code> tracked live on Resend.<br/>
            3. <strong>Anti-Spam Shield:</strong> Every batch is 100% deduplicated. No company ever receives more than 1 email.
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All Records</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('JOB_APP')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'JOB_APP'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Apps</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">
                {jobAppCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('OUTREACH')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'OUTREACH'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Proactive Outreaches</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">
                {outreachCount}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by company, job title, recipient, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Mail className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">No matching dispatches found</div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {activeTab === 'OUTREACH'
                  ? 'Trigger an On-Demand Sweep or dispatch a diagnostic pitch from the Outreach tab to populate this list.'
                  : 'Open any high-match job card and click "Send Email with CV Attached" or trigger an on-demand sweep.'}
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => {
              const isOutreach = app.type === 'OUTREACH';

              return (
                <div
                  key={app.id}
                  className={`p-4 rounded-xl border shadow-sm space-y-3 transition ${
                    isOutreach
                      ? 'bg-slate-950 border-purple-500/30 hover:border-purple-500/60'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header & Type Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isOutreach ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            <Globe2 className="w-3 h-3 text-purple-400" />
                            PROACTIVE STRATEGIC OUTREACH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            <Briefcase className="w-3 h-3 text-cyan-400" />
                            INBOUND JOB APPLICATION
                          </span>
                        )}

                        {app.sector && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {app.sector}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {app.jobTitle}
                      </h4>

                      <div className="text-xs text-cyan-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="font-semibold">{app.company}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {app.status}
                    </span>
                  </div>

                  {/* Outreach Diagnostics (If Outreach Type) */}
                  {isOutreach && (app.urgencyHook || app.diagnosedProblem) && (
                    <div className="bg-purple-950/30 border border-purple-900/50 p-2.5 rounded-lg text-xs space-y-1.5">
                      {app.urgencyHook && (
                        <div className="text-purple-200 font-semibold flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Hook: {app.urgencyHook}</span>
                        </div>
                      )}
                      {app.flagshipUsed && (
                        <div className="text-[11px] text-purple-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-red-400 shrink-0" />
                          <span>Proof: <strong>{app.flagshipUsed}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dispatch Details Box */}
                  <div className="text-xs text-slate-400 flex flex-col gap-1.5 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        Company Hiring Email:
                      </span>
                      <span className="text-amber-300 font-bold text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                        {app.companyEmailPicked || app.recipientEmail}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{app.cvAttached}</span>
                      </span>
                      <span className="text-emerald-400 text-[10px] font-bold">
                        {app.deliveryMode === 'LIVE_COMPANY_INBOX' ? 'Direct to Company' : 'Delivered to Your Gmail'}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={app.mailtoUrl || `mailto:${app.companyEmailPicked || app.recipientEmail}?subject=${encodeURIComponent(app.subject)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-cyan-400" />
                      Open Draft in Mail App
                    </a>
                    
                    {app.messageId && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Resend ID: {app.messageId.substring(0, 14)}...
                      </span>
                    )}
                  </div>

                  {/* Compliance / Flagship Notes */}
                  {app.complianceNotes && app.complianceNotes.length > 0 && (
                    <div className="border-t border-slate-900 pt-2 text-[11px] text-slate-400 space-y-0.5">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verification Details:
                      </span>
                      {app.complianceNotes.slice(0, 3).map((note, idx) => (
                        <div key={idx} className="line-clamp-1 text-slate-400">• {note}</div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Proof ID */}
                  <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-1 pt-1 font-mono border-t border-slate-900/60">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(app.sentAt).toLocaleString()}</span>
                    </div>
                    {app.messageId && (
                      <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[9px]">
                        ID: {app.messageId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Showing: <strong className="text-white">{filteredApplications.length}</strong> of {applications.length}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono">100% Unique Companies</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
