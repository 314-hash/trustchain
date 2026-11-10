import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Search, Sparkles, FileText, Upload } from 'lucide-react';
import { BlockchainCertificate } from '../types';

interface BlockchainCertificatesViewProps {
  certificates: BlockchainCertificate[];
  onSelectCertificate?: (certId: string) => void;
}

export const BlockchainCertificatesView: React.FC<BlockchainCertificatesViewProps> = ({
  certificates,
  onSelectCertificate,
}) => {
  const [certIdInput, setCertIdInput] = useState('');
  const [fileHashInput, setFileHashInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    match: boolean;
    message: string;
    certificate?: BlockchainCertificate;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!certIdInput || !fileHashInput) return;
    setIsVerifying(true);
    try {
      const res = await fetch('/api/certificates/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: certIdInput.trim(),
          sha256Hash: fileHashInput.trim(),
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUploadForHash = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setFileHashInput(hashHex);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Module D: Blockchain Evidence Registry
          </div>
          <h2 className="text-xl font-extrabold text-white">Tamper-Evident Blockchain Certificates</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cryptographic proof of content integrity, publication timestamping, and smart contract audit attestations anchored on EVM-compatible networks.
          </p>
        </div>
      </div>

      {/* Public Verification Tool */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-400" />
          Public Integrity Verification Tool
        </h3>
        <p className="text-xs text-slate-400">
          Enter a TrustChain Certificate ID and compare your digital file's SHA-256 fingerprint against the immutable on-chain record.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">TrustChain Certificate ID</label>
            <input
              type="text"
              value={certIdInput}
              onChange={(e) => setCertIdInput(e.target.value)}
              placeholder="e.g. TC-CERT-PUB-9912 or TC-CERT-STR-8401"
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              File SHA-256 Fingerprint (or select file to calculate)
            </label>
            <input
              type="text"
              value={fileHashInput}
              onChange={(e) => setFileHashInput(e.target.value)}
              placeholder="Paste 64-character SHA-256 hex string"
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer border border-slate-700">
            <Upload className="w-3.5 h-3.5" />
            <span>Compute Hash from Local File</span>
            <input type="file" onChange={handleFileUploadForHash} className="hidden" />
          </label>

          <button
            onClick={handleVerify}
            disabled={isVerifying || !certIdInput || !fileHashInput}
            className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isVerifying ? 'Verifying Integrity...' : 'Verify Evidence Hash'}</span>
          </button>
        </div>

        {/* Verification Result Card */}
        {verifyResult && (
          <div
            className={`p-4 rounded-xl border mt-3 text-xs space-y-2 ${
              verifyResult.match
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {verifyResult.match ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>VERIFICATION PASSED — 100% CRYPTOGRAPHIC MATCH</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>VERIFICATION FAILED — FINGERPRINT MISMATCH</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{verifyResult.message}</p>
          </div>
        )}
      </div>

      {/* Certificate Gallery */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Active Blockchain Registry ({certificates.length} Issued Certificates)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId}
              className="bg-[#111726] border border-[#1e293b] hover:border-amber-500/50 rounded-xl p-5 shadow-lg space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                    {cert.entityType.replace('_', ' ')}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1.5">{cert.title}</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  {cert.onChainStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Certificate ID:</span>
                  <span className="text-amber-300 font-semibold">{cert.certificateId}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Chain:</span>
                  <span className="text-slate-200">{cert.chainName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Block:</span>
                  <span className="text-slate-300">#{cert.blockNumber}</span>
                </div>
                <div className="p-2 bg-[#0c101c] rounded border border-slate-800 text-[10px] text-slate-400 break-all">
                  <span className="text-slate-500 block mb-0.5">SHA-256 Content Fingerprint:</span>
                  <span className="text-emerald-400 font-bold">{cert.sha256Hash}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => onSelectCertificate?.(cert.certificateId)}
                  className="py-1 px-2.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Certificate</span>
                </button>
                <a
                  href={cert.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

