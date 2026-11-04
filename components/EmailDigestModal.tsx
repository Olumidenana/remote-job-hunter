'use client';

import React, { useState } from 'react';
import { RemoteJob, ScanResult } from '@/types/job';
import { buildEmailHtml } from '@/lib/mailer';
import { X, Mail, Send, CheckCircle2, Clock, ShieldCheck, Terminal, Eye } from 'lucide-react';

interface EmailDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: RemoteJob[];
  stats: ScanResult['stats'];
  recipientEmail: string;
}

export function EmailDigestModal({ isOpen, onClose, jobs, stats, recipientEmail }: EmailDigestModalProps) {
  const [targetEmail, setTargetEmail] = useState(recipientEmail);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    provider: string;
    message: string;
  } | null>(null);
  const [viewPreview, setViewPreview] = useState(false);

  if (!isOpen) return null;

  const previewHtml = buildEmailHtml(jobs, stats);

  const handleSendDigestNow = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch(`/api/cron/daily-jobs?email=${encodeURIComponent(targetEmail)}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setSendResult({
          success: true,
          provider: data.dispatch.provider,
          message: data.dispatch.note || `Daily job alert prepared and sent to ${targetEmail}!`,
        });
      } else {
        setSendResult({
          success: false,
          provider: 'Error',
          message: data.error || 'Failed to dispatch alert',
        });
      }
    } catch (err: unknown) {
      setSendResult({
        success: false,
        provider: 'Error',
        message: err instanceof Error ? err.message : 'Network error triggering email dispatch',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Clock className="w-3.5 h-3.5" />
                Automated Daily Job Dispatcher
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Daily Email Notifications
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Runs automatically every morning at 7:00 AM UTC. Sends tailored high-match engineering roles straight to your inbox.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          
          {/* Target Email Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Notification Recipient Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  placeholder="your.email@example.com"
                />
              </div>
              <button
                onClick={handleSendDigestNow}
                disabled={isSending}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Digest Now'}
              </button>
            </div>
          </div>

          {/* Feedback Result */}
          {sendResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                sendResult.success
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold">
                  {sendResult.success ? `Digest Dispatched (${sendResult.provider})` : 'Dispatch Issue'}
                </div>
                <div className="mt-0.5 text-slate-300">
                  {sendResult.message}
                </div>
              </div>
            </div>
          )}

          {/* Cron Automation Info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Deployment & Cron Setup
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/60">
                Active in vercel.json
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When deployed to Vercel, the <code className="text-cyan-300 font-mono">vercel.json</code> file automatically triggers the <code className="text-cyan-300 font-mono">/api/cron/daily-jobs</code> route daily at 07:00 AM UTC.
            </p>

            <div className="border-t border-slate-800/80 pt-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">For live email delivery:</span> Add <code className="text-cyan-300 font-mono">RESEND_API_KEY</code> to your Vercel Project Environment Variables. Free tier gives 3,000 emails/month.
            </div>
          </div>

          {/* Preview Toggle */}
          <div>
            <button
              onClick={() => setViewPreview(!viewPreview)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              {viewPreview ? 'Hide Email Preview' : 'Preview Live HTML Email Template'}
            </button>

            {viewPreview && (
              <div className="mt-3 border border-slate-800 rounded-xl overflow-hidden bg-white max-h-72 overflow-y-auto">
                <iframe
                  srcDoc={previewHtml}
                  title="Daily Job Digest Preview"
                  className="w-full h-96 border-none"
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
