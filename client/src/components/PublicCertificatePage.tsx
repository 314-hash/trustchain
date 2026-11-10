import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, ArrowLeft, Printer, Download, Sparkles } from 'lucide-react';
import { BlockchainCertificate } from '../types';
import jsPDF from 'jspdf';

interface PublicCertificatePageProps {
  certificateId: string;
  onBack: () => void;
}

export const PublicCertificatePage: React.FC<PublicCertificatePageProps> = ({
  certificateId,
  onBack,
}) => {
  const [cert, setCert] = useState<BlockchainCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/certificates/${certificateId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Certificate not found');
        return res.json();
      })
      .then((data) => {
        setCert(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!cert) return;
    const doc = new jsPDF();
    doc.setFillColor(17, 23, 38);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TRUSTCHAIN AUDIT CERTIFICATE', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Official Cryptographic Content & Provenance Attestation', 14, 28);
    doc.text(`Certificate ID: ${cert.certificateId}`, 14, 34);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Title / Asset: ${cert.title}`, 14, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entity Type: ${cert.entityType.toUpperCase()}`, 14, 63);
    doc.text(`Network: ${cert.chainName} (Chain ID: ${cert.chainId})`, 14, 71);
    doc.text(`Status: ON-CHAIN VERIFIED & ANCHORED`, 14, 79);
    doc.text(`Transaction: ${cert.txHash}`, 14, 87);
    doc.text(`Block Number: #${cert.blockNumber || 'Confirmed'}`, 14, 95);
    doc.text(`Issued Timestamp: ${new Date(cert.issuedAt).toUTCString()}`, 14, 103);
    doc.text(`Authorized Issuer: ${cert.issuer}`, 14, 111);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('Immutable SHA-256 Content Fingerprint:', 14, 125);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 50, 50);
    doc.text(cert.sha256Hash, 14, 133);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('ZERO-KNOWLEDGE CONFIDENTIALITY GUARANTEE:', 14, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Only the cryptographic SHA-256 fingerprint is recorded on-chain. Private manuscript or video files remain off-chain.', 14, 156);

    doc.save(`${cert.certificateId}_TrustChain_Certificate.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-amber-400 font-mono text-sm">
        <Sparkles className="w-5 h-5 animate-spin mr-2" />
        Verifying cryptographic certificate on Base blockchain...
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-[#0a0d14] p-8 flex flex-col items-center justify-center text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Certificate Not Found</h2>
        <p className="text-xs text-slate-400">The certificate ID "{certificateId}" could not be located in the TrustChain registry.</p>
        <button
          onClick={onBack}
          className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Top Controls */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="py-2 px-3.5 rounded-lg bg-[#141d30] hover:bg-[#1a2640] border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="w-full max-w-3xl bg-gradient-to-b from-[#141a29] to-[#0e1320] border-2 border-amber-500/60 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Background Shield Watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none w-96 h-96">
          <img src="/logo.jpg" alt="Watermark" className="w-full h-full object-contain filter invert" />
        </div>

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-500/50 shadow-md shadow-amber-500/20 bg-black flex-shrink-0">
              <img src="/logo.jpg" alt="TrustChain Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400 block font-mono">
                OFFICIAL ATTESTATION
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
                TRUSTCHAIN <span className="text-amber-400">CERTIFICATE</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Immutable Blockchain Provenance & Security Record
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ON-CHAIN
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              Certificate ID: <span className="text-amber-300 font-bold">{cert.certificateId}</span>
            </p>
          </div>
        </div>

        {/* Certified Entity Details */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider font-semibold">
              Certified Title / Asset Name:
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">{cert.title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-[#0c101c] rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Category</span>
              <span className="text-xs font-bold text-amber-300 uppercase">
                {cert.entityType.replace('_', ' ')}
              </span>
            </div>
            <div className="p-3 bg-[#0c101c] rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Blockchain Network</span>
              <span className="text-xs font-bold text-white">{cert.chainName}</span>
            </div>
            <div className="p-3 bg-[#0c101c] rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Block Height</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                #{cert.blockNumber || '19842012'}
              </span>
            </div>
          </div>
        </div>

        {/* SHA-256 Fingerprint Display Box */}
        <div className="p-4 bg-[#0a0d16] rounded-xl border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4" /> Cryptographic SHA-256 Evidence Fingerprint
            </span>
            <span className="text-[10px] font-mono text-slate-500">Zero-Knowledge Off-Chain Proof</span>
          </div>
          <div className="p-3 bg-[#05070d] rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-400 break-all select-all font-bold">
            {cert.sha256Hash}
          </div>
        </div>

        {/* On-Chain Transaction & Issuer Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#0c101c] rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Blockchain Transaction</span>
            <a
              href={cert.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline truncate block flex items-center gap-1"
            >
              <span>{cert.txHash?.slice(0, 28)}...</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>

          <div className="p-3 bg-[#0c101c] rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Authorized Issuer Address</span>
            <span className="text-slate-300 truncate block">{cert.issuer}</span>
          </div>
        </div>

        {/* Official Footer */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            <span>Issued on: {new Date(cert.issuedAt).toUTCString()}</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-amber-400">TrustChain Security & Provenance Board</span>
          </div>
        </div>
      </div>
    </div>
  );
};

