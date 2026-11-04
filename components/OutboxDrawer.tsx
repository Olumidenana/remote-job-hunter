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

        {/* Verification Info Banner */}
        <div className="bg-slate-950/80 border-b border-slate-800 p-4 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-cyan-400 flex items-center justify-between">
            <span>🛡️ 3 Proof Layers of Delivery</span>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-300 hover:text-white underline font-semibold flex items-center gap-1"
            >
              Resend Delivery Logs ↗
            </a>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            1. <strong>Gmail BCC Audit:</strong> You receive an instant carbon copy of every application sent in your Gmail (<code className="text-cyan-300">olumideadeyeminana@gmail.com</code>).<br/>
            2. <strong>Resend Logs:</strong> Every email gets an immutable <code className="text-amber-300">Message ID</code> tracked live on Resend.<br/>
            3. <strong>Company Inbox Delivery:</strong> To send directly to company addresses using your own email address instead of forwarding from sandbox, connect your custom domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">resend.com/domains</a>.
          </p>
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

                <div className="text-xs text-slate-400 flex flex-col gap-1.5 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      Company Email Picked:
                    </span>
                    <span className="text-amber-300 font-bold text-[12px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
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

                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={app.mailtoUrl || `mailto:${app.companyEmailPicked || app.recipientEmail}?subject=${encodeURIComponent(app.subject)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-cyan-400" />
                    Open Draft in Email App
                  </a>
                  
                  {app.messageId && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Resend ID: {app.messageId.substring(0, 14)}...
                    </span>
                  )}
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

                <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-1 pt-1 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(app.sentAt).toLocaleString()}</span>
                  </div>
                  {app.messageId && (
                    <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      ID: {app.messageId}
                    </span>
                  )}
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
