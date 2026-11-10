import React from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2, Award, Printer, ArrowRight } from 'lucide-react';
import { AuditRecord } from '../types';
import jsPDF from 'jspdf';

interface ReportsViewProps {
  audits: AuditRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ audits }) => {
  const downloadReport = (audit: AuditRecord) => {
    const doc = new jsPDF();
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

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Project: ${audit.projectName}`, 14, 52);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Category: ${audit.category.toUpperCase()} | Tier: ${audit.packageTier.toUpperCase()}`, 14, 60);
    doc.text(`Security Score: ${audit.score || 0} / 100 (${audit.verificationStatus.toUpperCase()})`, 14, 66);
    doc.text(`Blockchain Certificate: ${audit.associatedCertificateId || 'Off-chain Attestation'}`, 14, 72);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('Executive Summary', 14, 84);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitSummary = doc.splitTextToSize(audit.summary.executiveSummary, 180);
    doc.text(splitSummary, 14, 92);

    let yPos = 120;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(`Audit Findings (${audit.findings.length})`, 14, yPos);
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

    doc.save(`${audit.auditNumber}_Audit_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Audit Reporting & Attestation Center
          </div>
          <h2 className="text-xl font-extrabold text-white">Downloadable Audit Reports & PDF Exports</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generate stakeholder-ready executive summaries, technical finding breakdowns, and cryptographic verification stamps.
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          Ready Reports ({audits.length})
        </h3>

        <div className="space-y-3">
          {audits.map((a) => (
            <div
              key={a.id}
              className="p-4 bg-[#141d30] border border-[#1e293b] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{a.projectName}</h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {a.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{a.auditNumber}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{a.summary.executiveSummary}</p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Score: <span className="text-amber-400 font-bold">{a.score}/100</span> &bull; Certificate: {a.associatedCertificateId || 'Off-chain'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadReport(a)}
                  className="py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

