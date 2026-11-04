'use client';

import React, { useState } from 'react';
import {
  OutreachTarget,
  OutreachSector,
  CURATED_OUTREACH_TARGETS,
  generateDiagnosticPitch,
  createCustomOutreachTarget,
} from '@/lib/outreach-engine';
import {
  Globe2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Mail,
  Paperclip,
  Zap,
  Building2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  PlusCircle,
  Copy,
  Check,
} from 'lucide-react';

interface OutreachSectionProps {
  onDispatched?: () => void;
}

export function OutreachSection({ onDispatched }: OutreachSectionProps) {
  const [selectedSector, setSelectedSector] = useState<'ALL' | OutreachSector>('ALL');
  const [targets, setTargets] = useState<OutreachTarget[]>(CURATED_OUTREACH_TARGETS);
  const [expandedTargetId, setExpandedTargetId] = useState<string | null>(null);
  const [isSendingId, setIsSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);

  // Custom Target Form State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCompany, setCustomCompany] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [customSector, setCustomSector] = useState<OutreachSector>('FINTECH_PAYMENTS');
  const [customProblem, setCustomProblem] = useState('');

  const filteredTargets = selectedSector === 'ALL'
    ? targets
    : targets.filter(t => t.sector === selectedSector);

  const handleDispatch = async (target: OutreachTarget) => {
    setIsSendingId(target.id);
    setFeedback(null);
    try {
      const res = await fetch('/api/outreach/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          id: target.id,
          message: data.message || `Diagnostic Pitch sent to ${target.contactEmail}!`,
          success: true,
        });
        if (onDispatched) onDispatched();
      } else {
        setFeedback({
          id: target.id,
          message: data.error || 'Failed to dispatch pitch',
          success: false,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during outreach';
      setFeedback({ id: target.id, message: errorMsg, success: false });
    } finally {
      setIsSendingId(null);
    }
  };

  const handleAddCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCompany || !customDomain) return;
    const newTarget = createCustomOutreachTarget(
      customCompany,
      customDomain,
      customSector,
      customProblem || undefined
    );
    setTargets([newTarget, ...targets]);
    setCustomCompany('');
    setCustomDomain('');
    setCustomProblem('');
    setShowCustomForm(false);
    setExpandedTargetId(newTarget.id);
  };

  const copyPitchText = (text: string, targetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchId(targetId);
    setTimeout(() => setCopiedPitchId(null), 2000);
  };

  const getSectorBadge = (sector: OutreachSector) => {
    switch (sector) {
      case 'FINTECH_PAYMENTS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">FinTech & Escrow</span>;
      case 'QUANT_TRADING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Quant & Prop Desks</span>;
      case 'SATELLITE_INTELLIGENCE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Satellite SAR & Earth Obs</span>;
      case 'HIGH_CONCURRENCY_SAAS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">High-Concurrency SaaS</span>;
      case 'GEOSPATIAL_LOGISTICS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">Geospatial Logistics</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-800/60 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              PROACTIVE HIGH-URGENCY OUTREACH
            </span>
            <span className="text-xs font-mono text-slate-400">
              • Global Sector Scans (FinTech, Quant, Defense, SaaS)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-red-400" />
            Global Problem-Solver &amp; Diagnostic Outreach Hunter
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
            Don't just wait for job boards. The engine actively hunts across industries, diagnoses catastrophic architectural bottlenecks (race conditions, latency bleed, AIS blind spots), and pitches Olumide Adeyemi-Nana's battle-tested production fixes.
          </p>
        </div>

        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-lg shadow-red-500/10 whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          {showCustomForm ? 'Close Custom Target' : 'Target Any Custom Company'}
        </button>
      </div>

      {/* Custom Target Builder Modal/Form */}
      {showCustomForm && (
        <form onSubmit={handleAddCustomTarget} className="bg-slate-950 p-5 rounded-xl border border-red-500/30 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Target a Specific Global Company for Architectural Audit
            </h3>
            <span className="text-xs text-slate-400">Autogenerates tailored diagnostic pitch &amp; CV match</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Monzo, Wintermute, Brex"
                value={customCompany}
                onChange={e => setCustomCompany(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Company Website Domain</label>
              <input
                type="text"
                placeholder="e.g. monzo.com, wintermute.com"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sector Vulnerability</label>
              <select
                value={customSector}
                onChange={e => setCustomSector(e.target.value as OutreachSector)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="FINTECH_PAYMENTS">FinTech (Double-Spending & Escrow)</option>
                <option value="QUANT_TRADING">Quant / Trading (Latency Bleed & Feeds)</option>
                <option value="SATELLITE_INTELLIGENCE">Satellite & Maritime (SAR OpenCV Blind Spots)</option>
                <option value="HIGH_CONCURRENCY_SAAS">Heavy SaaS (Transcoding Costs & WebGL)</option>
                <option value="GEOSPATIAL_LOGISTICS">Geospatial Transit (GPS Corridor Drift)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Specific Problem / Bottleneck Observed (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Database lock contention during checkout, or WebSocket dropped connections on news spikes"
              value={customProblem}
              onChange={e => setCustomProblem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
            >
              Generate Pitch &amp; Add Target
            </button>
          </div>
        </form>
      )}

      {/* Sector Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
        <button
          onClick={() => setSelectedSector('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSector === 'ALL'
              ? 'bg-red-500 text-slate-950 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Sectors ({targets.length})
        </button>
        <button
          onClick={() => setSelectedSector('FINTECH_PAYMENTS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSector === 'FINTECH_PAYMENTS'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          💳 FinTech &amp; Escrow
        </button>
        <button
          onClick={() => setSelectedSector('QUANT_TRADING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSector === 'QUANT_TRADING'
              ? 'bg-cyan-400 text-slate-950 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📈 Quant &amp; Trading
        </button>
        <button
          onClick={() => setSelectedSector('SATELLITE_INTELLIGENCE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSector === 'SATELLITE_INTELLIGENCE'
              ? 'bg-emerald-400 text-slate-950 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🛰️ Satellite &amp; Earth Observation
        </button>
        <button
          onClick={() => setSelectedSector('HIGH_CONCURRENCY_SAAS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSector === 'HIGH_CONCURRENCY_SAAS'
              ? 'bg-purple-400 text-slate-950 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🎬 Media &amp; Cloud SaaS
        </button>
        <button
          onClick={() => setSelectedSector('GEOSPATIAL_LOGISTICS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSector === 'GEOSPATIAL_LOGISTICS'
              ? 'bg-blue-400 text-slate-950 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📍 Geospatial Logistics
        </button>
      </div>

      {/* Target Problem-Solver Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredTargets.map(target => {
          const pitch = generateDiagnosticPitch(target);
          const isExpanded = expandedTargetId === target.id;
          const isSending = isSendingId === target.id;
          const targetFeedback = feedback?.id === target.id ? feedback : null;

          return (
            <div
              key={target.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-md flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getSectorBadge(target.sector)}
                      <span className="text-[11px] font-mono text-cyan-400">
                        Target Desk: {target.contactEmail}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {target.company}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-amber-300 border border-slate-700 whitespace-nowrap">
                    CV: {target.recommendedCV === 'Quant' ? 'Quant CV' : 'Systems Architect CV'}
                  </span>
                </div>

                {/* The Diagnosed Vulnerability */}
                <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3 my-3 text-xs space-y-1.5">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>Diagnosed Vulnerability: {target.urgencyHook}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {target.diagnosedProblem}
                  </p>
                  <p className="text-red-300/90 text-[11px] italic font-sans pt-1 border-t border-red-900/40">
                    ⚠️ <strong>Consequence of Delay:</strong> {target.consequenceOfDelay}
                  </p>
                </div>

                {/* Olumide's Shipped Fix */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 mb-3 text-xs space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Olumide's Production Solution: {target.candidateFlagshipUsed}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {target.solvedBySystem}
                  </p>
                </div>

                {/* Expanded Pitch Preview */}
                {isExpanded && (
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs space-y-2 mb-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-slate-400 font-bold text-[11px]">
                      <span>Full Authoritative Diagnostic Pitch:</span>
                      <button
                        onClick={() => copyPitchText(pitch.fullBody, target.id)}
                        className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPitchId === target.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-slate-300 text-[11.5px] max-h-60 overflow-y-auto leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
                      {pitch.fullBody}
                    </pre>
                  </div>
                )}
              </div>

              {/* Action Buttons & Feedback */}
              <div className="pt-2 border-t border-slate-800/80">
                {targetFeedback && (
                  <div className={`text-xs p-2.5 rounded-lg mb-2 font-semibold flex items-center gap-1.5 ${
                    targetFeedback.success
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{targetFeedback.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setExpandedTargetId(isExpanded ? null : target.id)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExpanded ? 'Collapse Pitch' : 'Inspect Full Pitch'}
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={pitch.mailtoUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      Open in Email App
                    </a>

                    <button
                      onClick={() => handleDispatch(target)}
                      disabled={isSending}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                      {isSending ? 'Dispatching...' : 'Dispatch Diagnostic Pitch (CV Attached)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
