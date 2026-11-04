'use client';

import React, { useState } from 'react';
import { RemoteJob, ApplicationPackage } from '@/types/job';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { X, Copy, Check, ExternalLink, Mail, Sparkles, FileText, Send, Building2 } from 'lucide-react';

interface ApplyModalProps {
  job: RemoteJob | null;
  onClose: () => void;
}

export function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [activeTab, setActiveTab] = useState<'pitch' | 'letter'>('pitch');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  if (!job) return null;

  const pkg: ApplicationPackage = generateApplicationPackage(job);

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

  const handleCopyAndOpenJob = () => {
    navigator.clipboard.writeText(activeTab === 'pitch' ? pkg.hookPitch : pkg.fullCoverLetter);
    window.open(job.applyUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Tailored Application Assistant
              </span>
              <span className="text-xs text-slate-400">
                Matches {job.matchScore}% with your portfolio
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {job.title}
            </h3>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
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

        {/* Tab Selector */}
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'pitch'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            3-Sentence Punchy Pitch
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'letter'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Complete Tailored Cover Letter
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-sm text-slate-300 space-y-4">
          {activeTab === 'pitch' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">
                  Use this for LinkedIn InMail, quick application forms, or direct messages:
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
                  ATS-optimized letter customized with your real metrics and projects:
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
                      Copy Cover Letter
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {pkg.fullCoverLetter}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={pkg.mailtoUrl}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 transition"
              title="Open prefilled draft in your default email client"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Prefilled Email Draft
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAndOpenJob}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              <Send className="w-4 h-4" />
              Copy {activeTab === 'pitch' ? 'Pitch' : 'Letter'} & Open Job
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
