'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Briefcase,
  Globe2,
  ShieldCheck,
  Send,
  Clock,
  Sparkles,
  RefreshCw,
  Mail,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { QuotaStatus } from '@/lib/quota-tracker';

interface AutopilotSwitchboardProps {
  totalJobsScanned: number;
  totalApplied: number;
  onRunCycleNow: () => void;
  isRunningCycle: boolean;
  onOpenOutbox: () => void;
  onOpenWarRoom: () => void;
}

export function AutopilotSwitchboard({
  totalJobsScanned,
  totalApplied,
  onRunCycleNow,
  isRunningCycle,
  onOpenOutbox,
  onOpenWarRoom,
}: AutopilotSwitchboardProps) {
  const [inboundAutopilotEnabled, setInboundAutopilotEnabled] = useState(true);
  const [outreachAutopilotEnabled, setOutreachAutopilotEnabled] = useState(true);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota/status');
      if (res.ok) {
        const data = await res.json();
        if (data.quota) {
          setQuota(data.quota);
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(fetchQuota, 30000);
    return () => clearInterval(interval);
  }, [totalApplied]);

  const handleManualSweep = () => {
    onRunCycleNow();
    setTimeout(fetchQuota, 3000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border-2 border-cyan-500/30 rounded-2xl p-5 sm:p-6 mb-8 shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AUTONOMOUS CLOUD DAEMON ARMED
            </span>
            <span className="text-xs font-mono text-slate-400">
              • Vercel Cron: 07:00 UTC daily (Runs while offline &amp; asleep)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Autonomous Dual-Engine Autopilot Switchboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Structured within Resend&apos;s daily quota limits to prevent breakages. Evaluates feeds, filters scams, tailors ATS CVs, and paces email applications and outreach safely.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenWarRoom}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-md"
          >
            <Flame className="w-3.5 h-3.5" />
            Sprint Blueprint
          </button>

          <button
            onClick={onOpenOutbox}
            className="inline-flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            Master Outbox ({totalApplied})
          </button>

          <button
            onClick={handleManualSweep}
            disabled={isRunningCycle || (quota?.isHardCapped ?? false)}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
            {isRunningCycle ? 'Executing Cycle...' : (quota?.isHardCapped ? 'Daily Limit Reached' : '⚡ Trigger On-Demand Sweep')}
          </button>
        </div>
      </div>

      {/* Daily Quota Guard Meter */}
      <div className="my-4 p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${quota?.isHardCapped ? 'bg-amber-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <span className="text-slate-300 font-bold">DAILY RESEND QUOTA GUARD:</span>
          <span className="text-cyan-300 font-black">
            {quota?.totalSent ?? 0} / {quota?.dailyLimit ?? 90} EMAILS TODAY
          </span>
          <span className="text-slate-400 text-[11px]">
            ({quota?.remainingTotal ?? 90} remaining before auto-queue)
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-[11px]">
          <span className="text-slate-400">
            Job Apps: <strong className="text-emerald-400">{quota?.jobAppCount ?? 0}/{quota?.jobAppBudget ?? 60}</strong>
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400">
            Outreach: <strong className="text-amber-400">{quota?.outreachCount ?? 0}/{quota?.outreachBudget ?? 30}</strong>
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-500">
            Resets at 00:00 UTC
          </span>
        </div>
      </div>

      {/* Dual Runner Switchboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        
        {/* Runner 1: Inbound Job Hunter */}
        <div className={`p-4 rounded-xl border transition ${
          inboundAutopilotEnabled
            ? 'bg-slate-950/80 border-cyan-500/40'
            : 'bg-slate-950/40 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Runner 1: Inbound Remote Job Hunter
                </h3>
                <span className="text-[11px] font-mono text-cyan-300">
                  Scanning 330+ live listings across 4 global networks
                </span>
              </div>
            </div>

            <button
              onClick={() => setInboundAutopilotEnabled(!inboundAutopilotEnabled)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition cursor-pointer border ${
                inboundAutopilotEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {inboundAutopilotEnabled ? '● AUTOPILOT ACTIVE' : 'PAUSED'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Evaluates job descriptions against GOD&apos;S EYE, ChopOS, and ICT Flux. Detects recruiter direct emails, filters scams, and auto-dispatches tailored ATS CVs with secret codewords (capped at 60/day).
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Catalogue: <strong className="text-white">{totalJobsScanned} Jobs Indexed</strong></span>
            <span className="text-emerald-400 font-bold">Auto-Applies on Every Sweep</span>
          </div>
        </div>

        {/* Runner 2: Proactive Problem-Solver Outreach */}
        <div className={`p-4 rounded-xl border transition ${
          outreachAutopilotEnabled
            ? 'bg-slate-950/80 border-red-500/40'
            : 'bg-slate-950/40 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Runner 2: Proactive Problem-Solver Outreach
                </h3>
                <span className="text-[11px] font-mono text-red-300">
                  Targeting FinTech, Quant, Defense &amp; Cloud SaaS
                </span>
              </div>
            </div>

            <button
              onClick={() => setOutreachAutopilotEnabled(!outreachAutopilotEnabled)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition cursor-pointer border ${
                outreachAutopilotEnabled
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {outreachAutopilotEnabled ? '● OUTREACH ACTIVE' : 'PAUSED'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Diagnoses critical architectural vulnerabilities (double-spending, latency bleed, SAR blind spots), drafts high-urgency diagnostic pitches, and proves Olumide&apos;s production fixes (budgeted at 30/day).
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Sectors: <strong className="text-white">5 Global Verticals</strong></span>
            <span className="text-amber-400 font-bold">Safe Paced Dispatches</span>
          </div>
        </div>

      </div>
    </div>
  );
}
