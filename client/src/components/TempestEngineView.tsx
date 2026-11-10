import React, { useState } from 'react';
import {
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileCheck,
  StopCircle,
  RefreshCw,
  Sparkles,
  Terminal,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
} from 'lucide-react';

interface TempestFinding {
  id: string;
  title: string;
  affectedAsset: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  cvss?: number;
  cwe?: string[];
  cve?: string[];
  scannerOutput: string;
  tool: string;
  toolVersion: string;
  timestamp: string;
  plainLanguageImpact: string;
  recommendedRemediation: string;
  retestStatus: 'untested' | 'verified_repaired' | 'still_vulnerable';
  evidence: {
    type: string;
    content: string;
    timestamp: string;
    tool: string;
    version: string;
  }[];
}

interface TempestMission {
  missionId: string;
  target: string;
  assetType: string;
  profile: string;
  status: 'pending_approval' | 'running' | 'completed' | 'aborted' | 'failed';
  approvalId: string;
  startedAt: string;
  completedAt?: string;
  findings: TempestFinding[];
  score: number;
  safetyAuditLog: string[];
}

export const TempestEngineView: React.FC = () => {
  // Assessment Form State
  const [assetType, setAssetType] = useState('streaming_platform');
  const [target, setTarget] = useState('https://staging.cineflix.io');
  const [profile, setProfile] = useState<'basic' | 'standard' | 'advanced'>('standard');
  const [environment, setEnvironment] = useState<'staging' | 'isolated_lab' | 'production'>('staging');
  const [authorizedBy, setAuthorizedBy] = useState('Security Operations Lead');
  const [rulesOfEngagement, setRulesOfEngagement] = useState('Authorized safe passive & non-destructive audit per scope.');
  const [confirmedOwnership, setConfirmedOwnership] = useState(false);
  const [humanApprovalConfirmed, setHumanApprovalConfirmed] = useState(false);
  const [sourceCodeText, setSourceCodeText] = useState('');

  // Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [currentMission, setCurrentMission] = useState<TempestMission | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retestingId, setRetestingId] = useState<string | null>(null);

  const assetTypes = [
    { id: 'website', label: 'Website / Web App', desc: 'Passive surface inspection, TLS, and HTTP response headers' },
    { id: 'streaming_platform', label: 'Streaming Platform', desc: 'HLS/DASH manifest leakage, Widevine/FairPlay DRM, and signed CDN tokens' },
    { id: 'publishing_platform', label: 'E-book Platform', desc: 'Manuscript vault exposure, ISBN validation, and author provenance' },
    { id: 'api', label: 'REST / GraphQL API', desc: 'BOLA, unauthenticated endpoints, and rate-limiting inspection' },
    { id: 'smart_contract', label: 'Smart Contract (Solidity)', desc: 'Reentrancy, access-control matrices, and EVM gas optimization' },
  ];

  const profiles = [
    {
      id: 'basic',
      name: 'Basic (Passive Reconnaissance)',
      badge: 'Zero-Touch',
      desc: 'Non-intrusive DNS, TLS cipher suites, and passive configuration checks. Safe for any target.',
    },
    {
      id: 'standard',
      name: 'Standard (Approved Vulnerability Scan)',
      badge: 'Recommended',
      popular: true,
      desc: 'Source-code analysis, static AST inspection, and DRM token duration audits. Non-destructive.',
    },
    {
      id: 'advanced',
      name: 'Advanced (Controlled Staging Assessment)',
      badge: 'Staging Only',
      desc: 'Controlled active endpoint verification against staging or isolated labs. Requires explicit human sign-off.',
    },
  ];

  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedOwnership || !humanApprovalConfirmed) {
      setErrorMsg('You must certify authorized ownership and check the human approval box before proceeding.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tempest/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetType,
          target,
          profile,
          authorization: {
            confirmedOwnership: true,
            authorizedBy,
            approvedScope: [target],
            rulesOfEngagement,
            targetEnvironment: environment,
          },
          sourceCodeOrContract: sourceCodeText || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'T3MP3ST assessment failed.');
      }
      setCurrentMission(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Assessment execution error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbort = async () => {
    if (!currentMission) return;
    try {
      await fetch(`/api/tempest/abort/${currentMission.missionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Operator Emergency Stop via UI' }),
      });
      setCurrentMission((prev) => (prev ? { ...prev, status: 'aborted' } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetest = async (findingId: string) => {
    if (!currentMission) return;
    setRetestingId(findingId);
    try {
      const res = await fetch('/api/tempest/retest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: currentMission.missionId,
          findingId,
        }),
      });
      const data = await res.json();
      if (data.retested && data.finding) {
        setCurrentMission((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            findings: prev.findings.map((f) => (f.id === findingId ? data.finding : f)),
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121829] via-[#161c33] to-[#1c1a29] border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>T3MP3ST SECURITY INTELLIGENCE INTEGRATION</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
              TEMPEST Security Engine & Intelligence Hub
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Powered by the open-source T3MP3ST offensive security framework. Controlled, authorized vulnerability research and verification for streaming platforms, e-books, websites, and smart contracts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              AGPL-3.0 ISOLATED ADAPTER
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Safety & Scope Notice */}
      <div className="p-4 bg-[#141d30] border border-[#232f45] rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300">Mandatory Rules of Engagement: </span>
          T3MP3ST operates strictly within authorized scopes. No wildcards, no credential theft, no stealth persistence, and no denial-of-service. Active tests require explicit human approval and staging environment confirmation. All secrets are redacted automatically.
        </div>
      </div>

      {/* Assessment Setup Form */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Start a TEMPEST Security Assessment
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Profile: {profile.toUpperCase()}</span>
        </div>

        <form onSubmit={handleStartAssessment} className="space-y-6">
          {/* STEP 1: Select Asset Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">1. Select Asset Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {assetTypes.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setAssetType(t.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    assetType === t.id
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                      : 'bg-[#141d30] border-[#24334f] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block text-white">{t.label}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: Target & Environment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                2. Authorized Target (URL, Hostname, or Repository) *
              </label>
              <input
                type="text"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. https://staging.stream.cineflix.io"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Single host or URL only. Wildcards (*) are strictly rejected by the T3MP3ST safety gate.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="staging">Staging / Pre-Production (Recommended)</option>
                <option value="isolated_lab">Isolated Test Lab / Sandbox</option>
                <option value="production">Production (Passive / Basic profile only)</option>
              </select>
            </div>
          </div>

          {/* Smart Contract Source Code (if applicable) */}
          {assetType === 'smart_contract' && (
            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-300">
                Solidity Smart Contract Source Code
              </label>
              <textarea
                value={sourceCodeText}
                onChange={(e) => setSourceCodeText(e.target.value)}
                rows={6}
                placeholder="// Paste Solidity code here for T3MP3ST AST reentrancy & access analysis"
                className="w-full bg-[#0a0e1a] border border-[#24334f] rounded-lg p-3 font-mono text-emerald-300 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* STEP 3: Choose Testing Profile */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">3. Select Testing Profile</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setProfile(p.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    profile === p.id
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10'
                      : 'bg-[#141d30] border-[#24334f] hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{p.desc}</p>
                  </div>
                  <span
                    className={`mt-3 block text-center py-1 text-[11px] font-bold rounded ${
                      profile === p.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {profile === p.id ? 'Selected' : 'Select'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 4: Human-in-the-Loop Authorization Verification */}
          <div className="p-4 bg-[#0e1424] border border-[#24334f] rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Lock className="w-4 h-4 text-amber-400" />
              4. Authorization Verification & Rules of Engagement
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Authorized By</label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="w-full bg-[#141d30] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Rules of Engagement Summary</label>
                <input
                  type="text"
                  value={rulesOfEngagement}
                  onChange={(e) => setRulesOfEngagement(e.target.value)}
                  className="w-full bg-[#141d30] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedOwnership}
                  onChange={(e) => setConfirmedOwnership(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">
                  I certify that I am the verified owner of <strong>{target}</strong> or have obtained written authorization from the system owner under our defined Rules of Engagement.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={humanApprovalConfirmed}
                  onChange={(e) => setHumanApprovalConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">
                  Human-in-the-loop Gate: I authorize T3MP3ST to execute this security testing mission within the defined scope with rate limits and automatic secret redaction enforced.
                </span>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Engine: T3MP3ST v3.2.0 &bull; Safe execution protocol locked
            </span>

            <button
              type="submit"
              disabled={isLoading || !confirmedOwnership || !humanApprovalConfirmed}
              className="py-3 px-8 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition-all disabled:opacity-40"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isLoading ? 'Executing T3MP3ST Mission...' : 'APPROVE & START ASSESSMENT'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}
        </form>
      </div>

      {/* Active / Completed Mission Results */}
      {currentMission && (
        <div className="bg-[#111726] border border-amber-500/50 rounded-xl p-6 shadow-2xl space-y-6">
          {/* Mission Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    currentMission.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : currentMission.status === 'aborted'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}
                >
                  {currentMission.status}
                </span>
                <span className="text-xs font-mono text-slate-400">{currentMission.missionId}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                T3MP3ST Target: <span className="font-mono text-amber-300">{currentMission.target}</span>
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">{currentMission.score} / 100</span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Security Health Score</p>
              </div>

              {currentMission.status !== 'aborted' && currentMission.status !== 'completed' && (
                <button
                  onClick={handleAbort}
                  className="py-2 px-3.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <StopCircle className="w-4 h-4 text-rose-400" />
                  <span>EMERGENCY ABORT</span>
                </button>
              )}
            </div>
          </div>

          {/* Safety Audit Log Viewer */}
          <div className="bg-[#0a0e18] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Safety & Scope Verification Audit Log
            </span>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              {currentMission.safetyAuditLog.map((log, i) => (
                <div key={i} className="leading-tight">{log}</div>
              ))}
            </div>
          </div>

          {/* Discovered Findings List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Evidence-Based Findings ({currentMission.findings.length})
            </h4>

            {currentMission.findings.map((f) => (
              <div
                key={f.id}
                className="p-5 bg-[#141d30] border border-[#232f45] rounded-xl space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        f.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : f.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <h5 className="font-bold text-white text-sm">{f.title}</h5>
                  </div>

                  <div className="flex items-center gap-2">
                    {f.retestStatus === 'verified_repaired' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED REPAIRED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRetest(f.id)}
                        disabled={retestingId === f.id}
                        className="py-1 px-3 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${retestingId === f.id ? 'animate-spin' : ''}`} />
                        <span>{retestingId === f.id ? 'Retesting...' : 'Retest Fix'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span>Asset: <strong className="text-slate-200">{f.affectedAsset}</strong></span>
                  <span>&bull;</span>
                  <span>Tool: {f.tool} ({f.toolVersion})</span>
                  <span>&bull;</span>
                  <span>CVSS: {f.cvss || 'N/A'}</span>
                  {f.cwe && <span>&bull; CWE: {f.cwe.join(', ')}</span>}
                </div>

                {/* Plain-Language Impact */}
                <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                  <p className="font-bold text-amber-400 text-[11px]">Plain-Language Business Impact:</p>
                  <p className="text-slate-200 leading-relaxed">{f.plainLanguageImpact}</p>
                </div>

                {/* Reproducible Evidence Box */}
                <div className="p-3 bg-[#070b14] rounded-lg border border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">
                    Reproducible Scanner Output & Evidence:
                  </span>
                  <p className="text-rose-300 break-all">{f.scannerOutput}</p>
                </div>

                {/* Recommended Remediation */}
                <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                  <p className="font-bold text-emerald-400 text-[11px]">Recommended Action:</p>
                  <p className="text-emerald-300 leading-relaxed">{f.recommendedRemediation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
