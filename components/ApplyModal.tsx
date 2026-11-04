'use client';

import React, { useState } from 'react';
import { RemoteJob, ApplicationPackage } from '@/types/job';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Sparkles,
  FileText,
  Send,
  Building2,
  ShieldCheck,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';

interface ApplyModalProps {
  job: RemoteJob | null;
  onClose: () => void;
  onApplicationSent?: (jobId: string) => void;
}

export function ApplyModal({ job, onClose, onApplicationSent }: ApplyModalProps) {
  const [activeTab, setActiveTab] = useState<'letter' | 'pitch' | 'instructions'>('letter');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  if (!job) return null;

  const pkg: ApplicationPackage = generateApplicationPackage(job);
  const instructions = pkg.instructions;
  const currentRecipient = recipientEmail || pkg.recipientEmail;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pkg.hookPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(pkg.fullCoverLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleSendEmailOnBehalf = async () => {
    setIsSending(true);
    setSendSuccess(null);

    try {
      const res = await fetch('/api/apply/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          overrideRecipient: currentRecipient,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSendSuccess(
          data.dispatch.note || `Application sent successfully to ${currentRecipient} with CV attached!`
        );
        if (onApplicationSent) {
          onApplicationSent(job.id);
        }
      } else {
        alert(data.error || 'Failed to dispatch email application');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error sending application email');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyAndOpenJob = () => {
    navigator.clipboard.writeText(activeTab === 'pitch' ? pkg.hookPitch : pkg.fullCoverLetter);
    window.open(job.applyUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Tailored Application Assistant
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Instructions Verified ({instructions.complianceConfidence}%)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {job.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">{job.company}</span>
              <span>·</span>
              <span>{job.location}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instruction Compliance Alert Banner */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Paperclip className="w-4 h-4 text-cyan-400" />
            <span>Attached CV: <strong className="text-white">{pkg.recommendedCVName}</strong></span>
            <a
              href={`/cv/${pkg.recommendedCVFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              [View PDF]
            </a>
          </div>

          {instructions.secretCodeWords.length > 0 && (
            <span className="text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Anti-bot rule applied: "{instructions.secretCodeWords.join(', ')}"
            </span>
          )}
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'letter'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Compliant Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'pitch'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            3-Sentence Hook Pitch
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Instructions Checklist ({instructions.detectedInstructions.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-sans text-sm text-slate-300 space-y-4">
          
          {sendSuccess && (
            <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Application Sent!</div>
                <div className="text-xs text-slate-300 mt-0.5">{sendSuccess}</div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  Instructions Detected in Job Listing:
                </div>
                <ul className="space-y-2">
                  {instructions.detectedInstructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {instructions.requiredAnswers.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                    Explicit Answers Injected into Cover Letter:
                  </div>
                  <div className="space-y-2">
                    {instructions.requiredAnswers.map((item, idx) => (
                      <div key={idx} className="text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <div className="font-semibold text-slate-200">{item.question}:</div>
                        <div className="text-slate-400 mt-0.5">{item.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'pitch' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">
                  Ideal for LinkedIn InMail, Twitter direct message, or quick application boxes:
                </span>
                <button
                  onClick={handleCopyPitch}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy Pitch
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                {pkg.hookPitch}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">
                  Includes GOD'S EYE, ChopOS, answers to questions, and CV attachment link:
                </span>
                <button
                  onClick={handleCopyLetter}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  {copiedLetter ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy Letter
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {pkg.fullCoverLetter}
              </div>
            </div>
          )}

          {/* Outbound Email Settings Bar */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 flex-shrink-0">Hiring Email:</span>
              <input
                type="email"
                value={currentRecipient}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="careers@company.com"
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              onClick={handleSendEmailOnBehalf}
              disabled={isSending || !currentRecipient}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-md shadow-emerald-500/10 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Sending On Your Behalf...' : 'Send Email with CV Attached'}
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <a
            href={pkg.mailtoUrl}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 transition"
            title="Open in default desktop email app"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            Open in Gmail / Desktop Email
          </a>

          <button
            onClick={handleCopyAndOpenJob}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            <ExternalLink className="w-4 h-4" />
            Copy Letter &amp; Open Portal Form
          </button>
        </div>

      </div>
    </div>
  );
}
