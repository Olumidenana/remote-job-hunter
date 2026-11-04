'use client';

import React from 'react';
import { ApplicationRecord } from '@/types/job';
import { X, CheckCircle2, Clock, Mail, Paperclip, Building2, ShieldCheck, Send } from 'lucide-react';

interface OutboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: ApplicationRecord[];
}

export function OutboxDrawer({ isOpen, onClose, applications }: OutboxDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Applications Outbox
              </h3>
              <p className="text-xs text-slate-400">
                Log of applications sent on your behalf with CV attachments
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

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Mail className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">No applications dispatched yet</div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Open any high-match job card and click "Send Email with CV Attached" to dispatch directly to recruiters.
              </p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{app.jobTitle}</h4>
                    <div className="text-xs text-cyan-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{app.company}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex flex-col gap-1 font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>To: {app.recipientEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Attached: {app.cvAttached}</span>
                  </div>
                </div>

                {app.complianceNotes && app.complianceNotes.length > 0 && (
                  <div className="border-t border-slate-900 pt-2 text-[11px] text-slate-400 space-y-0.5">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Instructions:
                    </span>
                    {app.complianceNotes.slice(0, 3).map((note, idx) => (
                      <div key={idx} className="line-clamp-1 text-slate-400">• {note}</div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(app.sentAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>Total Dispatched: <strong className="text-white">{applications.length}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
