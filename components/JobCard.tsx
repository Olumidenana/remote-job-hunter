'use client';

import React from 'react';
import { RemoteJob } from '@/types/job';
import {
  Sparkles,
  Clock,
  Globe2,
  Building2,
  Flame,
  ArrowUpRight,
  Mail,
  ShieldCheck,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

interface JobCardProps {
  job: RemoteJob;
  isApplied?: boolean;
  onOpenApply: (job: RemoteJob) => void;
}

export function JobCard({ job, isApplied, onOpenApply }: JobCardProps) {
  const isTopMatch = job.matchScore >= 90;
  const isHighMatch = job.matchScore >= 80;
  const instructions = job.instructions;

  const scoreBadgeBg = isTopMatch
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : isHighMatch
    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

  return (
    <div className={`bg-slate-900/90 border transition rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group ${
      isApplied ? 'border-emerald-800/80 bg-slate-900/60' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${scoreBadgeBg}`}
            >
              <Sparkles className="w-3 h-3" />
              {job.matchScore}% Match
            </span>

            {isApplied && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3" />
                Applied
              </span>
            )}

            {job.urgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Flame className="w-3 h-3" />
                Urgent Hire
              </span>
            )}

            {instructions?.hasDirectEmail && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60">
                <Mail className="w-3 h-3 text-cyan-400" />
                Direct Email
              </span>
            )}

            {instructions?.secretCodeWords && instructions.secretCodeWords.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Rules Verified
              </span>
            )}
          </div>

          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(job.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Job Title & Company */}
        <div className="mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition line-clamp-1">
            {job.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-300">{job.company}</span>
            <span>·</span>
            <span className="text-slate-400 text-xs">{job.location}</span>
          </div>
        </div>

        {/* Salary if present */}
        {job.salary && (
          <div className="text-xs font-mono font-semibold text-emerald-400 mb-3 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-900/50 inline-block">
            {job.salary}
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Match Breakdown & Targeted CV */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 mb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            <span>Why It Fits Your Background:</span>
            {instructions?.recommendedCV && (
              <span className="text-[10px] font-mono text-slate-400 font-normal flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-cyan-400" />
                Target: {instructions.recommendedCV === 'Quant' ? 'Quant CV' : 'Systems Architect CV'}
              </span>
            )}
          </div>

          <ul className="space-y-1">
            {job.matchReasons.map((reason, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-cyan-400 text-xs leading-none mt-1">&#8226;</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Synergy Stack Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.synergyStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40"
            >
              {tech}
            </span>
          ))}
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <button
          onClick={() => onOpenApply(job)}
          className={`flex-1 inline-flex items-center justify-center gap-2 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm transition cursor-pointer shadow-sm ${
            isApplied
              ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isApplied ? 'Review / Re-apply' : 'Apply Assistant (Email & CV)'}
        </button>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2.5 rounded-lg text-xs transition border border-slate-700"
          title="Open External Job Listing"
        >
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
