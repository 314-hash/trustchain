import React from 'react';
import {
  ShieldCheck,
  Tv,
  BookOpen,
  Code2,
  Award,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Activity,
  Layers,
} from 'lucide-react';
import { AuditRecord, BlockchainCertificate, MovieRightsRecord, PublishingRecord } from '../types';

interface OverviewProps {
  audits: AuditRecord[];
  certificates: BlockchainCertificate[];
  movieRights: MovieRightsRecord[];
  publishingRecords: PublishingRecord[];
  onStartAuditClick: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectAudit: (auditId: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  audits,
  certificates,
  movieRights,
  publishingRecords,
  onStartAuditClick,
  onNavigateTab,
  onSelectAudit,
}) => {
  const avgScore =
    audits.length > 0
      ? Math.round(audits.reduce((acc, curr) => acc + (curr.score || 0), 0) / audits.length)
      : 88;

  const verifiedRightsCount = movieRights.filter(
    (r) => r.rightsStatus === 'independently_verified' || r.rightsStatus === 'evidence_checked'
  ).length;

  const rightsIntegrityPct =
    movieRights.length > 0 ? Math.round((verifiedRightsCount / movieRights.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111726] via-[#162138] to-[#1a1c29] border border-amber-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free Public Verification Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Verify the Platform. <span className="text-[#f59e0b]">Protect the Content.</span> Prove the Records.
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open public blockchain audit and provenance engine for movie streaming networks, digital e-book publishers, and Web3 smart contracts. Completely free for community and creator use.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartAuditClick}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>START GUIDED AUDIT</span>
            </button>
            <button
              onClick={() => onNavigateTab('rights')}
              className="py-3 px-5 rounded-xl bg-[#141d30] hover:bg-[#1a2640] text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Rights Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Audits</p>
            <h3 className="text-2xl font-black text-white mt-1">{audits.length}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Active verification
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Security Score</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{avgScore} / 100</h3>
            <p className="text-[11px] text-slate-400 mt-1">Multi-vector rating</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rights Clearance</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{rightsIntegrityPct}%</h3>
            <p className="text-[11px] text-slate-400 mt-1">{verifiedRightsCount} of {movieRights.length} titles checked</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blockchain Certs</p>
            <h3 className="text-2xl font-black text-white mt-1">{certificates.length}</h3>
            <p className="text-[11px] text-amber-400 mt-1 font-mono">Base L2 & EVM</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Module Hub Quick Nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streaming Platform Audit Box */}
        <div
          onClick={() => onNavigateTab('streaming')}
          className="bg-[#111726] border border-[#1e293b] hover:border-amber-500/50 p-5 rounded-xl transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <Tv className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1 group-hover:text-amber-400 transition-colors">
            Movie Streaming Audit
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Audit HLS/DASH manifest security, Widevine/FairPlay DRM configurations, CDN token leakage, and distributor licensing terms.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Monitor Ready
            </span>
          </div>
        </div>

        {/* E-book Publishing Audit Box */}
        <div
          onClick={() => onNavigateTab('publishing')}
          className="bg-[#111726] border border-[#1e293b] hover:border-amber-500/50 p-5 rounded-xl transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1 group-hover:text-amber-400 transition-colors">
            E-book & Publishing Audit
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Validate author signatures, ISBN-13 checksums, off-chain manuscript integrity (SHA-256), and royalty smart contracts.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Registered</span>
            <span className="text-amber-400 font-mono font-semibold">{publishingRecords.length} Publications</span>
          </div>
        </div>

        {/* Smart Contract Audit Box */}
        <div
          onClick={() => onNavigateTab('smart-contract')}
          className="bg-[#111726] border border-[#1e293b] hover:border-amber-500/50 p-5 rounded-xl transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Code2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1 group-hover:text-amber-400 transition-colors">
            Smart Contract Audit
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scan Solidity contracts for reentrancy, tx.origin bugs, access control vulnerabilities, and token compliance.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Engines</span>
            <span className="text-slate-300 font-mono">Slither &bull; AST Engine</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Audits & Recent Blockchain Certs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits Table */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Recent Audits
            </h3>
            <button
              onClick={() => onNavigateTab('my-audits')}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              View All ({audits.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {audits.slice(0, 3).map((a) => (
              <div
                key={a.id}
                onClick={() => onSelectAudit(a.id)}
                className="p-3 bg-[#141d30] hover:bg-[#18233b] border border-[#1e293b] rounded-lg transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{a.projectName}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {a.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{a.summary.executiveSummary}</p>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <span
                    className={`font-black text-sm ${
                      (a.score || 0) >= 85
                        ? 'text-emerald-400'
                        : (a.score || 0) >= 70
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {a.score} / 100
                  </span>
                  <p className="text-[9px] text-slate-500 font-mono">{a.auditNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Evidence Certs */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Blockchain Evidence Certificates
            </h3>
            <button
              onClick={() => onNavigateTab('certificates')}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              All Certs ({certificates.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {certificates.slice(0, 3).map((c) => (
              <div
                key={c.certificateId}
                className="p-3 bg-[#141d30] border border-[#1e293b] rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 truncate max-w-[200px]">{c.title}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {c.chainName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="truncate">Cert: {c.certificateId}</span>
                  <a
                    href={c.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Tx</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

