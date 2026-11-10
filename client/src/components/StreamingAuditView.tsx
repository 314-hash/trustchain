import React, { useState } from 'react';
import { Tv, ShieldCheck, AlertTriangle, CheckCircle2, Play, Lock, Globe, Database, DollarSign, Sparkles } from 'lucide-react';
import { AuditRecord } from '../types';

interface StreamingAuditViewProps {
  onAuditCompleted: (audit: AuditRecord) => void;
}

export const StreamingAuditView: React.FC<StreamingAuditViewProps> = ({ onAuditCompleted }) => {
  const [platformName, setPlatformName] = useState('CineFlix Decentralized Streaming');
  const [streamingUrl, setStreamingUrl] = useState('https://stream.cineflix.io/hls/manifest.m3u8');
  const [drmProvider, setDrmProvider] = useState<'widevine' | 'fairplay' | 'aes-128' | 'none'>('widevine');
  const [storageProvider, setStorageProvider] = useState<'aws_s3' | 'cloudflare_r2' | 'ipfs' | 'custom'>('aws_s3');
  const [hasSmartContractPayments, setHasSmartContractPayments] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [lastAudit, setLastAudit] = useState<AuditRecord | null>(null);

  const handleRunStreamingAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audits/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          streamingUrl,
          drmProvider,
          storageProvider,
          hasSmartContractPayments,
        }),
      });
      const data = await res.json();
      setLastAudit(data.audit);
      onAuditCompleted(data.audit);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#1a1c2b] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Tv className="w-4 h-4" />
            Module B: Movie Streaming Security & Rights
          </div>
          <h2 className="text-xl font-extrabold text-white">Streaming Platform Security Audit</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Verify HLS/DASH manifest security, Widevine/FairPlay DRM encryption, CDN signed URL expiration, S3 storage policies, and content licensing agreements.
          </p>
        </div>
      </div>

      {/* Audit Configuration Card */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Streaming Platform Audit Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Playback Manifest or Website URL
            </label>
            <input
              type="text"
              value={streamingUrl}
              onChange={(e) => setStreamingUrl(e.target.value)}
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">DRM Technology</label>
            <select
              value={drmProvider}
              onChange={(e) => setDrmProvider(e.target.value as any)}
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="widevine">Google Widevine Modular (Hardware & L3)</option>
              <option value="fairplay">Apple FairPlay Streaming</option>
              <option value="aes-128">AES-128 Token-Encrypted HLS Chunks</option>
              <option value="none">No DRM (High Piracy Risk)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Master Video Storage Backend
            </label>
            <select
              value={storageProvider}
              onChange={(e) => setStorageProvider(e.target.value as any)}
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="aws_s3">AWS S3 (Private Bucket + CloudFront OAC)</option>
              <option value="cloudflare_r2">Cloudflare R2 Object Storage</option>
              <option value="ipfs">IPFS Decentralized Gateway</option>
              <option value="custom">Custom On-Premises SAN/NAS</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="scPayments"
            checked={hasSmartContractPayments}
            onChange={(e) => setHasSmartContractPayments(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
          />
          <label htmlFor="scPayments" className="text-xs text-slate-300">
            Platform utilizes Web3 / Smart Contract micro-royalty payments for content creators
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={handleRunStreamingAudit}
            disabled={isLoading}
            className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isLoading ? 'Scanning Streaming Security...' : 'Run Streaming Security Audit'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Checklist of Checked Streaming Vectors */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          12-Point Streaming Security & Rights Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { title: '1. Website Security & TLS', desc: 'HSTS, CSP headers & TLS 1.3 protocol' },
            { title: '2. User Authentication', desc: 'JWT expiration & session hijacking prevention' },
            { title: '3. Subscription Payment Logic', desc: 'Server-side payment verification & webhooks' },
            { title: '4. Streaming Access Permissions', desc: 'Short-lived HMAC signed CDN tokens' },
            { title: '5. Video API Exposure', desc: 'Protection against unauthenticated scrapers' },
            { title: '6. DRM & Key Exchange', desc: 'Widevine / FairPlay license server configuration' },
            { title: '7. Admin Privileges', desc: 'Role-Based Access Control on video catalogs' },
            { title: '8. S3 Upload & Storage Security', desc: 'CloudFront Origin Access Control enforcement' },
            { title: '9. Database Exposure', desc: 'No open Redis/Mongo ports on streaming nodes' },
            { title: '10. Smart Contract Payments', desc: 'Automated on-chain splits & escrow' },
            { title: '11. Revenue Accounting Records', desc: 'Immutable ledger of viewer streams & royalties' },
            { title: '12. Content Licensing Clearance', desc: 'Distribution rights validation & territory check' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-[#141d30] border border-[#1e293b] rounded-lg space-y-1">
              <span className="font-semibold text-slate-200 block">{item.title}</span>
              <span className="text-[11px] text-slate-400 leading-tight block">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Result Display */}
      {lastAudit && (
        <div className="bg-[#111726] border border-amber-500/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                AUDIT COMPLETED
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {lastAudit.projectName} — Security Score: {lastAudit.score}/100
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400">{lastAudit.auditNumber}</span>
          </div>

          <div className="p-3 bg-[#141d30] rounded-lg border border-[#232f45] text-xs text-slate-300">
            <p className="font-bold text-amber-300 mb-1">Executive Summary:</p>
            <p>{lastAudit.summary.executiveSummary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Audit Findings ({lastAudit.findings.length})
            </h4>
            {lastAudit.findings.map((f) => (
              <div key={f.id} className="p-3 bg-[#141d30] border border-[#24334f] rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{f.title}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-400">{f.severity}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{f.plainLanguageExplanation}</p>
                <p className="text-emerald-400 text-[11px]">Action: {f.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

