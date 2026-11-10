import React, { useState } from 'react';
import { Globe, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, ExternalLink, Shield } from 'lucide-react';
import { AuditRecord } from '../types';

interface WebSecurityAuditViewProps {
  onAuditCompleted: (audit: AuditRecord) => void;
}

export const WebSecurityAuditView: React.FC<WebSecurityAuditViewProps> = ({ onAuditCompleted }) => {
  const [targetUrl, setTargetUrl] = useState('https://netflix.com');
  const [projectName, setProjectName] = useState('Web Streaming Portal');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditRecord | null>(null);
  const [evaluatedHeaders, setEvaluatedHeaders] = useState<Record<string, { status: string; value?: string }>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/audits/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          projectName: projectName || targetUrl,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to run web security scan. Please check URL.');
      }

      const data = await res.json();
      setAuditResult(data.audit);
      if (data.headers) {
        setEvaluatedHeaders(data.headers);
      }
      onAuditCompleted(data.audit);
    } catch (err: any) {
      setErrorMsg(err.message || 'Scan failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            Module E: Website & API Security Audit
          </div>
          <h2 className="text-xl font-extrabold text-white">Safe & Non-Destructive Web Scanner</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Verify TLS cipher strength, HTTP security response headers (CSP, HSTS, X-Frame-Options), CORS configurations, and server banner leaks.
          </p>
        </div>
      </div>

      {/* Authorized Scope Notice */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-xs text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p>
          <strong>Safe Testing Policy:</strong> Scans perform passive header analysis and non-destructive surface inspections. Only test domains and web applications for which you have authorization.
        </p>
      </div>

      {/* Target URL Form */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Enter Target Domain or Web API</h3>

        <form onSubmit={handleRunScan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Project / Platform Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. CineFlix Web Portal"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Website URL *</label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isLoading ? 'Inspecting Security Headers & TLS...' : 'Run Safe Web Audit'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}
        </form>
      </div>

      {/* Scan Results Display */}
      {auditResult && (
        <div className="bg-[#111726] border border-amber-500/40 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                SAFE SCAN COMPLETED
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {auditResult.projectName} — Score: {auditResult.score}/100
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">{auditResult.auditNumber}</span>
              <span className="text-xs font-bold text-amber-400">
                {auditResult.findings.length} Item(s) Flagged
              </span>
            </div>
          </div>

          {/* Header Evaluation Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              HTTP Security Headers Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options'].map((h) => {
                const isPresent = evaluatedHeaders[h]?.status === 'present';
                return (
                  <div
                    key={h}
                    className={`p-3 rounded-lg border flex flex-col justify-between ${
                      isPresent
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-400 block truncate">{h}</span>
                    <span className="font-bold text-xs mt-1">
                      {isPresent ? '✅ Enforced' : '❌ Missing'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Discovered Findings & Actionable Fixes</h4>
            {auditResult.findings.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
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
                    <h5 className="font-semibold text-white">{f.title}</h5>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{f.cweOrRef}</span>
                </div>

                <div className="p-2.5 bg-[#0c101c] rounded-lg border border-slate-800 text-slate-300">
                  <p className="font-bold text-amber-400 text-[11px] mb-0.5">Plain-Language Summary:</p>
                  <p className="leading-relaxed">{f.plainLanguageExplanation}</p>
                </div>

                <div className="p-2.5 bg-[#0c101c] rounded-lg border border-slate-800 text-emerald-300">
                  <p className="font-bold text-emerald-400 text-[11px] mb-0.5">Recommended Remediation:</p>
                  <p className="leading-relaxed">{f.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

