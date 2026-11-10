import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Printer,
} from 'lucide-react';
import { AuditRecord, AuditFinding } from '../types';
import jsPDF from 'jspdf';

interface MyAuditsProps {
  audits: AuditRecord[];
  selectedAuditId?: string | null;
  onClearSelectedAudit?: () => void;
  onSelectAudit?: (id: string) => void;
  onStartAuditClick: () => void;
}

export const MyAudits: React.FC<MyAuditsProps> = ({
  audits,
  selectedAuditId,
  onClearSelectedAudit,
  onSelectAudit,
  onStartAuditClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeModalAudit, setActiveModalAudit] = useState<AuditRecord | null>(
    selectedAuditId ? audits.find((a) => a.id === selectedAuditId) || null : null
  );

  const filteredAudits = audits.filter((a) => {
    const matchesSearch =
      a.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.auditNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const generatePDFReport = (audit: AuditRecord) => {
    const doc = new jsPDF();
    const gold = [245, 158, 11];
    const dark = [17, 23, 38];

    // Header Banner
    doc.setFillColor(17, 23, 38);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TRUSTCHAIN AUDIT REPORT', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Verify the Platform. Protect the Content. Prove the Records.', 14, 28);
    doc.text(`Audit ID: ${audit.auditNumber} | Date: ${new Date(audit.createdAt).toLocaleDateString()}`, 14, 34);

    // Project Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Project: ${audit.projectName}`, 14, 52);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Category: ${audit.category.toUpperCase()} | Tier: ${audit.packageTier.toUpperCase()}`, 14, 60);
    doc.text(`Security Score: ${audit.score || 0} / 100 (${audit.verificationStatus.toUpperCase()})`, 14, 66);
    doc.text(`Blockchain Certificate: ${audit.associatedCertificateId || 'Off-chain Attestation'}`, 14, 72);

    // Executive Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('Executive Summary (Plain Language)', 14, 84);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitSummary = doc.splitTextToSize(audit.summary.executiveSummary, 180);
    doc.text(splitSummary, 14, 92);

    // Tools & Tests
    let yPos = 115;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 23, 38);
    doc.text('Tools & Tests Performed:', 14, yPos);
    yPos += 7;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    audit.toolsUsed.forEach((tool) => {
      doc.text(`• Tool: ${tool}`, 14, yPos);
      yPos += 5;
    });

    // Findings
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(`Findings Breakdown (${audit.findings.length} Discovered)`, 14, yPos);
    yPos += 8;

    audit.findings.forEach((f, idx) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 23, 38);
      doc.text(`${idx + 1}. [${f.severity.toUpperCase()}] ${f.title}`, 14, yPos);
      yPos += 6;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(70, 70, 70);
      const splitPlain = doc.splitTextToSize(`Plain English: ${f.plainLanguageExplanation}`, 180);
      doc.text(splitPlain, 14, yPos);
      yPos += splitPlain.length * 4 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(16, 120, 60);
      const splitRec = doc.splitTextToSize(`Action: ${f.recommendation}`, 180);
      doc.text(splitRec, 14, yPos);
      yPos += splitRec.length * 4 + 4;
    });

    // Limitations Notice
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('AUDIT LIMITATIONS & DISCLAIMER:', 14, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('This automated audit report is backed by deterministic static analysis and cryptographic hashing.', 14, yPos);
    yPos += 4;
    doc.text('Never represents an independent manual smart contract certification beyond the tested scope.', 14, yPos);

    doc.save(`${audit.auditNumber}_TrustChain_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name or audit ID..."
            className="w-full bg-[#141d30] border border-[#24334f] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'streaming', 'publishing', 'smart_contract', 'website_security'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#141d30] text-slate-300 hover:bg-[#18233b]'
              }`}
            >
              {cat === 'all'
                ? 'All Audits'
                : cat === 'streaming'
                ? 'Streaming'
                : cat === 'publishing'
                ? 'Publishing'
                : cat === 'smart_contract'
                ? 'Smart Contract'
                : 'Web Security'}
            </button>
          ))}
        </div>
      </div>

      {/* Audits List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredAudits.length === 0 ? (
          <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="font-bold text-white text-base">No audits found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search or start a new audit.</p>
            <button
              onClick={onStartAuditClick}
              className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Audit</span>
            </button>
          </div>
        ) : (
          filteredAudits.map((a) => (
            <div
              key={a.id}
              className="bg-[#111726] border border-[#1e293b] hover:border-amber-500/40 rounded-xl p-5 shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{a.projectName}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {a.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{a.auditNumber}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {a.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{a.summary.executiveSummary}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                  <span>Scanned: {new Date(a.createdAt).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span>Tools: {a.toolsUsed.length}</span>
                  <span>&bull;</span>
                  <span>Cert: {a.associatedCertificateId || 'Off-chain'}</span>
                </div>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <div
                    className={`text-xl font-black ${
                      (a.score || 0) >= 85
                        ? 'text-emerald-400'
                        : (a.score || 0) >= 70
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {a.score} / 100
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    {a.summary.critical > 0 && (
                      <span className="text-rose-400">{a.summary.critical} Crit</span>
                    )}
                    {a.summary.high > 0 && <span className="text-orange-400">{a.summary.high} High</span>}
                    {a.summary.medium > 0 && (
                      <span className="text-amber-400">{a.summary.medium} Med</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalAudit(a)}
                    className="py-2 px-3 rounded-lg bg-[#141d30] hover:bg-[#1a2640] border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Audit</span>
                  </button>

                  <button
                    onClick={() => generatePDFReport(a)}
                    className="py-2 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer"
                    title="Download Official PDF Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Audit Detail Modal */}
      {activeModalAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111726] border border-[#232f45] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {activeModalAudit.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{activeModalAudit.auditNumber}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{activeModalAudit.projectName}</h2>
              </div>
              <button
                onClick={() => setActiveModalAudit(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Health Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[#141d30] border border-[#24334f] rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Security Score</span>
                <div className="text-2xl font-black text-amber-400 mt-0.5">{activeModalAudit.score} / 100</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tier & Status</span>
                <div className="text-xs font-bold text-white mt-1 uppercase">
                  {activeModalAudit.packageTier} &bull; {activeModalAudit.verificationStatus}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Certificate ID</span>
                <div className="text-xs font-mono text-amber-300 mt-1 truncate">
                  {activeModalAudit.associatedCertificateId || 'Off-chain'}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={() => generatePDFReport(activeModalAudit)}
                  className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Plain English Summary */}
            <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Plain-Language Executive Summary
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeModalAudit.summary.executiveSummary}
              </p>
            </div>

            {/* Findings List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">
                Detailed Technical Findings & Plain-Language Remediation
              </h4>
              {activeModalAudit.findings.map((f, idx) => (
                <div
                  key={f.id}
                  className="p-4 bg-[#141d30] border border-[#232f45] rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          f.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : f.severity === 'high'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : f.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        }`}
                      >
                        {f.severity}
                      </span>
                      <h5 className="font-semibold text-white">{f.title}</h5>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{f.cweOrRef}</span>
                  </div>

                  {/* Plain Language Box */}
                  <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[11px] font-bold text-amber-400">What this means in plain English:</p>
                    <p className="text-slate-300 leading-relaxed">{f.plainLanguageExplanation}</p>
                  </div>

                  {/* Technical Guidance */}
                  <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[11px] font-bold text-sky-400">Technical Details:</p>
                    <p className="text-slate-400 font-mono text-[11px]">{f.technicalDetails}</p>
                  </div>

                  {/* Action */}
                  <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[11px] font-bold text-emerald-400">Exact Recommended Action:</p>
                    <p className="text-emerald-300 leading-relaxed">{f.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification and Limitations */}
            <div className="p-4 bg-[#0d121f] rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
              <h5 className="font-bold text-slate-300">Auditor Scope & Limitations:</h5>
              <ul className="list-disc list-inside space-y-1">
                {activeModalAudit.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
                <li>Evidence anchored to cryptographic SHA-256 state tree.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

