import React, { useState } from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, Upload, FileText, Award, Sparkles, ExternalLink } from 'lucide-react';
import { PublishingRecord, BlockchainCertificate } from '../types';

interface PublishingAuditViewProps {
  publishingRecords: PublishingRecord[];
  onPublicationAdded: (record: PublishingRecord, cert: BlockchainCertificate) => void;
}

export const PublishingAuditView: React.FC<PublishingAuditViewProps> = ({
  publishingRecords,
  onPublicationAdded,
}) => {
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [copyrightDeclaration, setCopyrightDeclaration] = useState('');
  const [royaltyRatePercent, setRoyaltyRatePercent] = useState('70');
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [lastCert, setLastCert] = useState<BlockchainCertificate | null>(null);

  const handleSubmitPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !authorName) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookTitle', bookTitle);
      formData.append('authorName', authorName);
      formData.append('publisher', publisher || 'Independent Publisher');
      formData.append('isbn', isbn);
      formData.append('publicationDate', new Date().toISOString().split('T')[0]);
      formData.append(
        'copyrightDeclaration',
        copyrightDeclaration || `Copyright © ${new Date().getFullYear()} ${authorName}. All rights reserved.`
      );
      formData.append('royaltyRatePercent', royaltyRatePercent);

      if (manuscriptFile) formData.append('manuscript', manuscriptFile);
      if (epubFile) formData.append('epubPdf', epubFile);

      const res = await fetch('/api/publishing', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setLastCert(data.certificate);
      onPublicationAdded(data.record, data.certificate);

      // Reset form
      setBookTitle('');
      setAuthorName('');
      setIsbn('');
    } catch (err) {
      console.error(err);
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
            <BookOpen className="w-4 h-4" />
            Module C: E-book & Digital Publishing Audit
          </div>
          <h2 className="text-xl font-extrabold text-white">Author & Publisher Verification Portal</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Verify ISBN metadata, author identity declarations, and generate tamper-evident publication certificates with zero-knowledge SHA-256 integrity proofs.
          </p>
        </div>
      </div>

      {/* Off-Chain Privacy Assurance Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <p className="font-bold text-white mb-0.5">Off-Chain Manuscript Confidentiality Guarantee:</p>
          Your actual manuscript documents (.docx, .pdf, .epub) are stored securely off-chain in your encrypted vault. Only the mathematical SHA-256 fingerprint is anchored on the blockchain to legally prove priority of authorship without exposing your manuscript text.
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Register New E-Book & Generate Tamper-Proof Certificate</h3>

        <form onSubmit={handleSubmitPublication} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. The Sovereign Cryptographer"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Dr. Elena Rostova"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Publisher Name</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="e.g. Veritas Academic Press LLC"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ISBN-10 or ISBN-13 (Optional)
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 978-0-13-468599-1"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Copyright Notice & Declaration
              </label>
              <textarea
                value={copyrightDeclaration}
                onChange={(e) => setCopyrightDeclaration(e.target.value)}
                placeholder="Copyright © 2026 Author Name. All rights reserved under Berne Convention."
                rows={2}
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Royalty Rate Split (%)
              </label>
              <input
                type="number"
                value={royaltyRatePercent}
                onChange={(e) => setRoyaltyRatePercent(e.target.value)}
                min="0"
                max="100"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500">Standard author digital royalty is 70%</span>
            </div>
          </div>

          {/* File Uploads for Off-chain Fingerprinting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl text-center space-y-2">
              <Upload className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-200">Raw Manuscript File (.docx / .txt)</p>
              <input
                type="file"
                onChange={(e) => setManuscriptFile(e.target.files?.[0] || null)}
                className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl text-center space-y-2">
              <Upload className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-200">Final EPUB or PDF Publication</p>
              <input
                type="file"
                onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
                className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isLoading ? 'Hashing & Anchoring Certificate...' : 'Verify & Anchor Publication Certificate'}</span>
          </button>
        </form>
      </div>

      {/* Generated Certificate Card */}
      {lastCert && (
        <div className="bg-[#111726] border border-amber-500/50 rounded-xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Publication Certificate Issued</h4>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
              BASE L2 ANCHORED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#141d30] rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Certificate ID</span>
              <span className="text-amber-300 font-semibold">{lastCert.certificateId}</span>
            </div>
            <div className="p-3 bg-[#141d30] rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Transaction Hash</span>
              <span className="text-slate-300 truncate block">{lastCert.txHash}</span>
            </div>
            <div className="p-3 bg-[#141d30] rounded-lg border border-slate-800 md:col-span-2">
              <span className="text-slate-500 text-[10px] block">Content SHA-256 Fingerprint</span>
              <span className="text-emerald-400 break-all">{lastCert.sha256Hash}</span>
            </div>
          </div>
        </div>
      )}

      {/* Publications Registry Table */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          Verified Digital Publications ({publishingRecords.length})
        </h3>

        <div className="space-y-3">
          {publishingRecords.map((pub) => (
            <div
              key={pub.id}
              className="p-4 bg-[#141d30] border border-[#1e293b] rounded-xl space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">{pub.bookTitle}</h4>
                  <p className="text-slate-400 text-[11px]">
                    By <span className="text-slate-200 font-semibold">{pub.authorName}</span> &bull; Publisher: {pub.publisher}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                    ISBN: {pub.isbn}
                  </span>
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                    {pub.certificateId}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-[#0e1424] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>
                  <span className="text-slate-500">SHA-256 Fingerprint: </span>
                  <span className="text-emerald-400 break-all">{pub.epubPdfHash}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Royalty: {pub.royaltyRatePercent}% author split</span>
                  <span>Registered: {new Date(pub.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

