'use client';

import React from 'react';
import { CandidateProfile } from '@/types/job';
import { ExternalLink, Github, Mail, Phone, MapPin, Sparkles, Code2, Globe, ShieldAlert, Cpu } from 'lucide-react';

interface CandidateHeaderProps {
  candidate: CandidateProfile & {
    githubStats?: {
      publicRepos: number;
      recentProjects: string[];
      lastUpdated: string;
      latestPushedRepo?: string;
      latestPushedAt?: string;
    };
  };
  onRefreshProfile?: () => void;
}

export function CandidateHeader({ candidate, onRefreshProfile }: CandidateHeaderProps) {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/profile/sync?force=true');
      if (onRefreshProfile) {
        onRefreshProfile();
      }
    } finally {
      setIsSyncing(false);
    }
  };
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Available for Immediate Remote Hire This Week
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Flagship: GOD'S EYE Sovereign Engine
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <Github className="w-3.5 h-3.5 text-slate-300" />
              github.com/Olumidenana
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            {candidate.name}
          </h1>
          <p className="text-base sm:text-lg text-cyan-400 font-medium mb-4">
            {candidate.headline}
          </p>

          <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {candidate.location}
            </span>
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              {candidate.email}
            </a>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              {candidate.phone}
            </span>
            <a
              href={candidate.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold"
            >
              <Globe className="w-4 h-4" />
              Live Portfolio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Live GitHub & Verified Production Systems */}
        <div className="bg-slate-800/70 backdrop-blur border border-slate-700/60 rounded-xl p-4 sm:p-5 flex flex-col justify-between max-w-md w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Verified Sovereign Stack
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {candidate.githubStats?.publicRepos ?? 18} Repos
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700/80 mb-3">
            <span className="truncate max-w-[220px]">
              ⚡ Pushed: <span className="text-white font-bold">{candidate.githubStats?.latestPushedRepo || 'remote-job-hunter'}</span>
            </span>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="text-[10px] text-cyan-400 hover:text-white underline font-bold cursor-pointer whitespace-nowrap ml-2 disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Repos'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {candidate.coreStack.slice(0, 10).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded text-xs font-mono bg-slate-900/80 text-cyan-300 border border-slate-700"
              >
                {tech}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded text-xs text-slate-400">+6 more</span>
          </div>

          <div className="text-xs text-slate-300 border-t border-slate-700/50 pt-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-amber-300 font-medium">
              <span>⚡ GOD'S EYE: Satellite SAR + MT5/FIX</span>
              <span className="text-emerald-400 text-[11px]">100% Tested</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              ChopOS (PostgreSQL Locks) · ICT Flux (73+ WS) · ToonForge
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
