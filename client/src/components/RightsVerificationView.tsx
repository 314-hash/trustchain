import React, { useState } from 'react';
import { FileCheck2, AlertCircle, CheckCircle2, AlertTriangle, Clock, XCircle, ShieldCheck, Plus, Sparkles, Upload } from 'lucide-react';
import { MovieRightsRecord, RightsStatus } from '../types';

interface RightsVerificationViewProps {
  movieRights: MovieRightsRecord[];
  onMovieAdded: (record: MovieRightsRecord) => void;
}

export const RightsVerificationView: React.FC<RightsVerificationViewProps> = ({
  movieRights,
  onMovieAdded,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [productionCompany, setProductionCompany] = useState('');
  const [director, setDirector] = useState('');
  const [contentOwnerDeclaration, setContentOwnerDeclaration] = useState('');
  const [distributionAgreement, setDistributionAgreement] = useState('');
  const [licenseExpirationDate, setLicenseExpirationDate] = useState('2028-12-31');
  const [territoryRestrictions, setTerritoryRestrictions] = useState('Worldwide');
  const [streamingRights, setStreamingRights] = useState('SVOD, TVOD, Web3');
  const [revenueSharingTerms, setRevenueSharingTerms] = useState('75% Content Owner / 25% Platform');
  const [contentFileHash, setContentFileHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !productionCompany) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/movie-rights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          productionCompany,
          director,
          contentOwnerDeclaration: contentOwnerDeclaration || `Exclusive rights owned by ${productionCompany}`,
          distributionAgreement: distributionAgreement || 'Standard digital streaming distribution agreement',
          licenseExpirationDate,
          territoryRestrictions: territoryRestrictions.split(',').map((s) => s.trim()),
          streamingRights,
          revenueSharingTerms,
          contentFileHash: contentFileHash || undefined,
        }),
      });

      const newRecord = await res.json();
      onMovieAdded(newRecord);
      setShowAddForm(false);
      setTitle('');
      setProductionCompany('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: RightsStatus) => {
    switch (status) {
      case 'independently_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <ShieldCheck className="w-3 h-3" /> Independently Verified
          </span>
        );
      case 'evidence_checked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <CheckCircle2 className="w-3 h-3" /> Evidence Checked
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" /> Pending Verification
          </span>
        );
      case 'expired_license':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertCircle className="w-3 h-3" /> Expired License
          </span>
        );
      case 'conflicting_evidence':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <AlertTriangle className="w-3 h-3" /> Conflicting Evidence
          </span>
        );
      case 'not_submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3" /> Documents Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4" />
            Module B: Movie Rights & Content Provenance
          </div>
          <h2 className="text-xl font-extrabold text-white">Movie Rights & Licensing Verification Ledger</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Record, audit, and track movie distribution contracts, territory exclusivity, and expiration dates.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Entry' : 'Register New Movie Title'}</span>
        </button>
      </div>

      {/* Legal Ownership Clarity Notice */}
      <div className="p-4 bg-[#141d30] border border-[#232f45] rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300">Legal Architecture Rule: </span>
          A cryptographic file hash (SHA-256) proves content integrity and timestamp priority, but NEVER legally proves copyright ownership on its own. TrustChain correlates cryptographic hashes with verified distributor agreements, chain-of-title contracts, and territory licensing covenants.
        </div>
      </div>

      {/* Add Movie Form */}
      {showAddForm && (
        <div className="bg-[#111726] border border-amber-500/50 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Submit Movie Title for Rights Verification
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Movie Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quantum Horizon (2025)"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Production Company *</label>
                <input
                  type="text"
                  required
                  value={productionCompany}
                  onChange={(e) => setProductionCompany(e.target.value)}
                  placeholder="e.g. Aetherion Studios LLC"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Director / Creator</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Content Owner Declaration
                </label>
                <input
                  type="text"
                  value={contentOwnerDeclaration}
                  onChange={(e) => setContentOwnerDeclaration(e.target.value)}
                  placeholder="Full legal declaration of exclusive global or regional copyright"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Distribution Agreement Summary
                </label>
                <input
                  type="text"
                  value={distributionAgreement}
                  onChange={(e) => setDistributionAgreement(e.target.value)}
                  placeholder="Licensed streaming terms and distributor identities"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  License Expiration Date
                </label>
                <input
                  type="date"
                  value={licenseExpirationDate}
                  onChange={(e) => setLicenseExpirationDate(e.target.value)}
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Territory Restrictions</label>
                <input
                  type="text"
                  value={territoryRestrictions}
                  onChange={(e) => setTerritoryRestrictions(e.target.value)}
                  placeholder="Worldwide, North America, EMEA, APAC"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Streaming Rights</label>
                <input
                  type="text"
                  value={streamingRights}
                  onChange={(e) => setStreamingRights(e.target.value)}
                  placeholder="SVOD, TVOD, AVOD, Web3 PPV"
                  className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Content File Hash (SHA-256)
              </label>
              <input
                type="text"
                value={contentFileHash}
                onChange={(e) => setContentFileHash(e.target.value)}
                placeholder="SHA-256 hash of video master file (auto-generated if left blank)"
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isLoading ? 'Verifying Documents...' : 'Submit Rights Record'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Rights Catalog List */}
      <div className="space-y-3">
        {movieRights.map((item) => (
          <div
            key={item.id}
            className="bg-[#111726] border border-[#1e293b] rounded-xl p-5 shadow-lg space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-slate-400">
                  Produced by <span className="text-slate-200 font-semibold">{item.productionCompany}</span> &bull; Director: {item.director}
                </p>
              </div>
              <div>{getStatusBadge(item.rightsStatus)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#141d30] rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Territory & Scope</span>
                <span className="text-slate-200 font-medium">
                  {item.territoryRestrictions.join(', ')} ({item.streamingRights})
                </span>
              </div>
              <div className="p-3 bg-[#141d30] rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-bold">License Expiration</span>
                <span
                  className={`font-semibold ${
                    new Date(item.licenseExpirationDate) < new Date()
                      ? 'text-rose-400 font-mono'
                      : 'text-amber-300 font-mono'
                  }`}
                >
                  {item.licenseExpirationDate}
                </span>
              </div>
              <div className="p-3 bg-[#141d30] rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Revenue Terms</span>
                <span className="text-slate-200 font-medium">{item.revenueSharingTerms}</span>
              </div>
            </div>

            {item.statusNotes && (
              <div className="p-2.5 bg-[#0e1424] rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{item.statusNotes}</span>
              </div>
            )}

            <div className="text-[10px] font-mono text-slate-500 truncate pt-1">
              Master File SHA-256: <span className="text-emerald-400">{item.contentFileHash}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

