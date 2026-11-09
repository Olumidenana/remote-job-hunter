'use client';

import React from 'react';
import { RemoteJob, ApplicationRecord } from '@/types/job';
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
  AlertTriangle,
  Award,
  Moon,
  FileText,
} from 'lucide-react';

interface JobCardProps {
  job: RemoteJob;
  isApplied?: boolean;
  applicationRecord?: ApplicationRecord;
  onOpenApply: (job: RemoteJob) => void;
}

export function JobCard({ job, isApplied, applicationRecord, onOpenApply }: JobCardProps) {
  const isTopMatch = job.matchScore >= 90;
  const isHighMatch = job.matchScore >= 80;
  const instructions = job.instructions;
  const safety = job.safety;
  const translation = job.translation;
  const ats = job.atsAnalysis;

  const isGermanMarket =
    job.translation?.detectedLanguage === 'German (Deutsch)' ||
    /germany|deutschland|berlin|munich|münchen|frankfurt|hamburg|cologne|köln|dach|austria|switzerland/i.test(job.location);

  const isGulfMarket =
    /kuwait|uae|united arab emirates|dubai|abu dhabi|saudi|riyadh|jeddah|qatar|doha|bahrain|manama|oman|muscat|gulf/i.test(job.location) ||
    /kuwait|dubai/i.test(job.title.toLowerCase());

  const scoreBadgeBg = isTopMatch
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : isHighMatch
    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

  return (
    <div className={`border transition rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group ${
      isApplied 
        ? 'border-emerald-600/70 bg-gradient-to-b from-slate-900 to-emerald-950/20 ring-1 ring-emerald-500/30' 
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
    }`}>
      <div>
        {/* Prominent Applied Banner */}
        {isApplied && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex flex-wrap items-center justify-between text-xs text-emerald-200 font-bold gap-2 shadow-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>APPLICATION SENT &amp; DISPATCHED (PDF CV Attached)</span>
            </span>
            <div className="text-[11px] font-mono text-emerald-300 font-normal">
              {applicationRecord?.sentAt ? (
                <span>Sent {new Date(applicationRecord.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              ) : (
                <span>Logged in Outbox</span>
              )}
              {applicationRecord?.recipientEmail && (
                <span className="ml-1 text-slate-300">→ {applicationRecord.recipientEmail}</span>
              )}
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${scoreBadgeBg}`}
            >
              <Sparkles className="w-3 h-3" />
              {job.matchScore}% Match
            </span>

            {/* ATS Match Score */}
            {ats && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                <Award className="w-3 h-3 text-blue-400" />
                {ats.atsScore}% ATS
              </span>
            )}

            {isApplied && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3" />
                Applied
              </span>
            )}

            {/* German Market Pill */}
            {isGermanMarket && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                🇩🇪 DE / MEZ
              </span>
            )}

            {/* Kuwait / Gulf Pill */}
            {isGulfMarket && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/60 text-teal-300 border border-teal-800/60">
                🇰🇼 Kuwait / Gulf (GMT+3)
              </span>
            )}

            {/* PDF CV Verified Pill */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80" title="CV is strictly attached in official PDF format">
              <FileText className="w-3 h-3 text-amber-400" />
              PDF CV
            </span>

            {/* Safety & Scam Shield Pill */}
            {safety && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${
                  safety.riskLevel === 'VERIFIED_SAFE'
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                    : 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                }`}
                title={safety.flags.length > 0 ? safety.flags.join(', ') : 'Verified safe listing'}
              >
                <ShieldCheck className="w-3 h-3" />
                {safety.riskLevel === 'VERIFIED_SAFE' ? 'Safe' : 'Caution'}
              </span>
            )}

            {/* Translation Pill */}
            {translation?.isTranslated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-blue-300 bg-blue-950/50 border border-blue-800/50 font-mono">
                <Globe2 className="w-3 h-3 text-blue-400" />
                Translated
              </span>
            )}

            {/* Night Shift / US Evening Pill */}
            {job.isNightShift && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/60"
                title={job.shiftReason || 'Night / US-Evening compatible'}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                {job.shiftType === 'NIGHT_SHIFT' ? 'Night Shift' : job.shiftType === 'US_EVENING' ? 'US-Evening (WAT Night)' : 'Async Night'}
              </span>
            )}

            {job.urgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Flame className="w-3 h-3" />
                Urgent
              </span>
            )}

            {instructions?.hasDirectEmail && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60">
                <Mail className="w-3 h-3 text-cyan-400" />
                Direct Email
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
            {translation?.isTranslated ? translation.translatedTitle : job.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-300">{job.company}</span>
            <span>·</span>
            <span className="text-slate-400 text-xs">{job.location}</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-500 text-xs font-mono">{job.source}</span>
          </div>

          {instructions?.recipientEmail && (
            <div className="mt-2 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Mail className="w-3 h-3" />
                <span>{instructions.isEmailInferred ? 'Company Desk Email:' : 'Direct Recruiter Email:'}</span>
              </span>
              <span className="text-amber-300 font-bold">{instructions.recipientEmail}</span>
            </div>
          )}
        </div>

        {/* Salary if present */}
        {job.salary && (
          <div className="text-xs font-mono font-semibold text-emerald-400 mb-3 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-900/50 inline-block">
            {job.salary}
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {translation?.isTranslated && translation.translatedDescription ? translation.translatedDescription : job.description}
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
          {isApplied ? 'Review / Re-apply' : 'Apply Assistant (Tailored CV & Email)'}
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
