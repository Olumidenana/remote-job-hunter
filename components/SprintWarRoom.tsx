'use client';

import React, { useState } from 'react';
import { getSocialSearchVectors, SocialSearchVector } from '@/lib/social-feed-engine';
import {
  X,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface SprintWarRoomProps {
  isOpen: boolean;
  onClose: () => void;
  sentCount: number;
}

export function SprintWarRoom({ isOpen, onClose, sentCount }: SprintWarRoomProps) {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const socialVectors = getSocialSearchVectors();

  if (!isOpen) return null;

  const targetDaily = 10;
  const targetMonthly = 300;
  const progressPercent = Math.min(Math.round((sentCount / targetMonthly) * 100), 100);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(key);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const day3FollowUp = `Hi [Hiring Manager / Team],

Following up on my application for the [Job Title] role sent earlier this week.

Given your focus on [Core Stack, e.g. real-time systems and low-latency APIs], I wanted to share a quick update: I've just published live architecture benchmarks for my platform, GOD'S EYE (16/16 test suites passing, handling multi-source streaming under <100ms latency).

You can inspect the live repo and production metrics directly here: https://olumidenana.github.io/olumide-portfolio/

Looking forward to hearing from you.

Best,
Olumide Adeyemi-Nana
+234 814 964 0122`;

  const founderDirectDm = `Hey [Founder Name] - saw you're scaling engineering at [Company]. I'm a Full-Stack Systems Engineer who recently shipped GOD'S EYE (satellite earth observation & automated trade routing via MT5/FIX) and ChopOS (PostgreSQL row-level locking POS). 

I thrive in high-velocity autonomous execution. Check out my live portfolio: https://olumidenana.github.io/olumide-portfolio/ — would love to help you ship faster this quarter.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                30-Day Employment Sprint War Room
              </span>
              <span className="text-xs text-slate-400">
                Mathematical Velocity Strategy to Guarantee Employment
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              The 30-Day Offer Blueprint &amp; ATS Hacker Guide
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          
          {/* Progress Strip */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                Sprint Quota Velocity
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {sentCount} <span className="text-slate-500 text-sm">/ 300 Targeted Applications</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: 10 applications/day &rarr; ~20 technical interviews &rarr; 3-5 concurrent global offers.
              </p>
            </div>

            <div className="w-full sm:w-48 bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              />
            </div>
          </div>

          {/* Social & Founder Search Vectors */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Worldwide Social Radar (Beyond Job Boards)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialVectors.map((vec, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-amber-300">{vec.platform}</span>
                    </div>
                    <div className="font-bold text-white text-sm mb-1">{vec.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{vec.description}</p>
                  </div>

                  <a
                    href={vec.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold px-3 py-2 rounded-lg text-xs border border-slate-800 transition"
                  >
                    Open Live Stream Search
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ATS Insider Hacks */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              4 Rules That Guaranteed ATS Passes in 2026
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-1">1. Zero Two-Column Formatting</strong>
                ATS algorithms read tables horizontally left-to-right. Two-column resumes get parsed as gibberish. Our built-in Tailored CV uses clean single-column linear hierarchy.
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-1">2. Exact Keyword Density Matching</strong>
                If the post says "Python 3.12" or "FastAPI", never write just "Python". Mirror their exact technical phrasing in your summary and bullet points.
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-1">3. The 3-Sentence Hook Law</strong>
                Founders and CTOs read emails on mobile phones. They spend 6 seconds deciding. Lead immediately with GOD'S EYE &lt;100ms latency or ChopOS 100% double-spend elimination.
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-1">4. Anti-Bot Code Word Extraction</strong>
                Over 35% of listings test for automated bots with secret words like "supernova" or "favorite food". Our platform highlights them in yellow and injects them automatically.
              </div>
            </div>
          </div>

          {/* Outreach & Follow-Up Templates */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Direct Founder InMail &amp; Day-3 Follow-Up Scripts
            </h4>
            
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Day 3 Anti-Ghosting Follow-Up Email:</span>
                  <button
                    onClick={() => copyText('day3', day3FollowUp)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedTemplate === 'day3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Script
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {day3FollowUp}
                </pre>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Direct Founder X / LinkedIn DM:</span>
                  <button
                    onClick={() => copyText('founder', founderDirectDm)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedTemplate === 'founder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Script
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {founderDirectDm}
                </pre>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Close War Room
          </button>
        </div>

      </div>
    </div>
  );
}
