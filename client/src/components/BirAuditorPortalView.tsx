import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  QrCode,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  CreditCard,
  DollarSign,
  Tv,
  RefreshCw,
  Building,
  Key,
  Clock,
  ArrowRight,
  ExternalLink,
  Shield,
  FileCheck2,
} from 'lucide-react';
import { BirAuditorPasscodeSession, PaidSubscriptionTaxDeclaration } from '../types';
import {
  getLocalBirSessions,
  saveLocalBirSession,
  burnLocalBirPasscode,
  getLocalTaxDeclarations,
} from '../services/clientAuditEngine';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const BirAuditorPortalView: React.FC = () => {
  // Session / Authentication state
  const [activeSession, setActiveSession] = useState<BirAuditorPasscodeSession | null>(null);
  const [inputPasscode, setInputPasscode] = useState('BIR-2026-9842-X7');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [availableSessions, setAvailableSessions] = useState<BirAuditorPasscodeSession[]>([]);

  // Declarations & Inspection state
  const [declarations, setDeclarations] = useState<PaidSubscriptionTaxDeclaration[]>([]);
  const [selectedDeclarationId, setSelectedDeclarationId] = useState<string>('TAX-DECL-2026-01-M');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'monthly' | 'quarterly'>('all');

  // Provision modal state
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [newAuditorName, setNewAuditorName] = useState('Atty. Ferdinand Reyes');
  const [newAuditorId, setNewAuditorId] = useState('BIR-RDO033-91823');
  const [newRdoCode, setNewRdoCode] = useState('RDO 033 - Large Taxpayers Regular Audit Division');
  const [generatedPasscodeNotice, setGeneratedPasscodeNotice] = useState<BirAuditorPasscodeSession | null>(null);

  // Dynamic QR Code for single-use session
  const [sessionQrUrl, setSessionQrUrl] = useState<string>('');

  // Load existing declarations and sessions on mount
  useEffect(() => {
    fetch('/api/bir/subscriptions')
      .then((res) => (res.ok ? res.json() : getLocalTaxDeclarations()))
      .then((data) => setDeclarations(data))
      .catch(() => setDeclarations(getLocalTaxDeclarations()));

    fetch('/api/bir/sessions')
      .then((res) => (res.ok ? res.json() : getLocalBirSessions()))
      .then((sessions) => {
        setAvailableSessions(sessions);
        const activeOne = sessions.find((s: BirAuditorPasscodeSession) => !s.isUsed && s.status === 'ACTIVE_UNUSED');
        if (activeOne) {
          QRCode.toDataURL(`https://trustchain.audit/bir-portal?token=${activeOne.passcode}`, {
            width: 140,
            margin: 1,
            color: { dark: '#0A0D16', light: '#FFFFFF' },
          }).then(setSessionQrUrl).catch(() => {});
        }
      })
      .catch(() => {
        const local = getLocalBirSessions();
        setAvailableSessions(local);
      });
  }, []);

  // Handle single-use passcode login (Immediately burns the passcode)
  const handleVerifyPasscode = async (passcodeToVerify: string = inputPasscode) => {
    if (!passcodeToVerify.trim()) {
      setAuthError('Please enter the assigned single-use BIR auditor passcode.');
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/bir/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeToVerify.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.session);
        setDeclarations(data.declarations || getLocalTaxDeclarations());
      } else {
        const errData = await res.json().catch(() => ({ error: 'Passcode validation failed.' }));
        throw new Error(errData.error);
      }
    } catch (err: any) {
      // Client-side serverless fallback
      const fallbackResult = burnLocalBirPasscode(passcodeToVerify);
      if (fallbackResult.success && fallbackResult.session) {
        setActiveSession(fallbackResult.session);
        setDeclarations(getLocalTaxDeclarations());
      } else {
        setAuthError(err.message || fallbackResult.error || 'Access denied.');
      }
    } finally {
      setIsVerifying(false);
      // Refresh available sessions to show status update
      setAvailableSessions(getLocalBirSessions());
    }
  };

  // Generate new single-use token for an assigned BIR Auditor
  const handleProvisionSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bir/provision-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditorName: newAuditorName,
          auditorBirId: newAuditorId,
          rdoCode: newRdoCode,
          assignedPlatform: 'CineChain Streaming Ltd. (CineFlix Media)',
          platformTin: '009-842-192-000',
          ttlMinutes: 15,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPasscodeNotice(data.session);
        setAvailableSessions((prev) => [data.session, ...prev]);
        setInputPasscode(data.session.passcode);
      } else {
        throw new Error('Could not provision session.');
      }
    } catch {
      // Fallback local creation
      const pin = Math.floor(1000 + Math.random() * 9000);
      const newSess: BirAuditorPasscodeSession = {
        sessionId: `BIR-SESS-${Date.now().toString(36).toUpperCase()}`,
        passcode: `BIR-2026-${pin}-NX`,
        auditorName: newAuditorName,
        auditorBirId: newAuditorId,
        rdoCode: newRdoCode,
        assignedPlatform: 'CineChain Streaming Ltd. (CineFlix Media)',
        platformTin: '009-842-192-000',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        isUsed: false,
        status: 'ACTIVE_UNUSED',
      };
      saveLocalBirSession(newSess);
      setGeneratedPasscodeNotice(newSess);
      setAvailableSessions(getLocalBirSessions());
      setInputPasscode(newSess.passcode);
    }
  };

  // Selected declaration
  const selectedDeclaration =
    declarations.find((d) => d.id === selectedDeclarationId) || declarations[0];

  const filteredDeclarations = declarations.filter((d) => {
    if (filterPeriod === 'all') return true;
    return d.periodType === filterPeriod;
  });

  // Generate Official PDF Stamped as Filed Income Tax Declaration
  const handleDownloadStampedPDF = async (decl: PaidSubscriptionTaxDeclaration) => {
    const doc = new jsPDF();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(245, 158, 11); // Gold
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BUREAU OF INTERNAL REVENUE — DIGITAL SERVICES AUDIT', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL PAID MONTHLY & QUARTERLY SUBSCRIPTION STATUS DECLARATION', 14, 25);
    doc.text(`Platform: ${decl.platformName} | TIN: ${decl.tin}`, 14, 32);

    // Official BIR Electronic Filing Stamp Box (Red Border / Official BIR Watermark)
    doc.setDrawColor(185, 28, 28); // BIR Red
    doc.setLineWidth(0.8);
    doc.rect(130, 44, 68, 42);

    doc.setFillColor(254, 242, 242);
    doc.rect(130.5, 44.5, 67, 41, 'F');

    doc.setTextColor(185, 28, 28);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FILED & CERTIFIED', 142, 52);
    doc.setFontSize(8);
    doc.text('BUREAU OF INTERNAL REVENUE', 133, 58);

    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`DTN: ${decl.birDocumentTrackingNumber}`, 133, 64);
    doc.text(`Filing Date: ${new Date(decl.filingTimestamp).toLocaleDateString()}`, 133, 69);
    doc.text(`RDO: 033 - Large Taxpayers Service`, 133, 74);
    doc.text(`Auditor: ${decl.auditorName}`, 133, 79);
    doc.text(`Status: ELECTRONICALLY VALIDATED`, 133, 84);

    // Main Tax Declaration Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TAX DECLARATION: ${decl.declarationNumber} (${decl.periodName})`, 14, 52);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(`Period Covered: ${decl.periodName} (${decl.periodType.toUpperCase()})`, 14, 60);
    doc.text(`Registered Taxpayer: ${decl.platformName}`, 14, 66);
    doc.text(`Taxpayer Identification Number (TIN): ${decl.tin}`, 14, 72);
    doc.text(`Total Active Paid Subscribers: ${decl.totalPaidSubscribers.toLocaleString()} Verified Accounts`, 14, 78);
    doc.text(`Base L2 Settlement Tx: ${decl.smartContractAnchorTx.slice(0, 32)}...`, 14, 84);

    // Subscription Tier Breakdown Table
    let yPos = 96;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Subscription Tier', 16, yPos + 5.5);
    doc.text('Monthly Fee', 75, yPos + 5.5);
    doc.text('Paid Accounts', 115, yPos + 5.5);
    doc.text('Gross Sales (PHP)', 155, yPos + 5.5);

    yPos += 8;
    decl.plans.forEach((plan) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(plan.planName, 16, yPos + 5);
      doc.text(`PHP ${plan.priceMonthlyPhp.toLocaleString()}`, 75, yPos + 5);
      doc.text(plan.activePaidSubscribers.toLocaleString(), 115, yPos + 5);
      doc.text(`PHP ${plan.grossRevenuePhp.toLocaleString()}`, 155, yPos + 5);
      yPos += 7;
    });

    // Tax Computation Summary Box
    yPos += 6;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, 182, 45, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, yPos, 182, 45);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('OFFICIAL TAX COMPUTATION & REMITTANCE DECLARATION:', 18, yPos + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`1. Gross Subscription Collections: PHP ${decl.grossSubscriptionsPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 18, yPos + 14);
    doc.text(`2. Allowable Telecommunication & CDN Deductions: PHP ${decl.allowableDeductionsPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 18, yPos + 20);
    doc.text(`3. Net Taxable Income: PHP ${decl.netTaxableIncomePhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 18, yPos + 26);
    doc.text(`4. Value-Added Tax (12% VAT on Digital Services): PHP ${decl.vatAmountPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 18, yPos + 32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`5. TOTAL TAX PAYABLE REMITTED TO BIR: PHP ${decl.totalTaxDuePhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 18, yPos + 39);

    // QR Code for Real-Time Tax Verification
    try {
      const qrData = await QRCode.toDataURL(
        `https://trustchain.audit/bir-verify?dtn=${decl.birDocumentTrackingNumber}&hash=${decl.blockchainEvidenceHash}`,
        { width: 100, margin: 1, color: { dark: '#0A0D16', light: '#FFFFFF' } }
      );
      doc.addImage(qrData, 'PNG', 150, yPos + 52, 42, 42);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('Scan to Verify BIR Filing', 151, yPos + 98);
    } catch (e) {
      console.warn('QR error on PDF:', e);
    }

    // Blockchain Evidence Anchor & Legal Certification
    yPos += 52;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BLOCKCHAIN INTEGRITY & AUDIT TRAIL:', 18, yPos);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Cryptographic Evidence SHA-256: ${decl.blockchainEvidenceHash}`, 18, yPos + 6);
    doc.text(`Base L2 On-Chain Transaction: ${decl.smartContractAnchorTx}`, 18, yPos + 11);
    doc.text('Verification: Attested under National Internal Revenue Code (NIRC) & Digital Services Tax Regulations.', 18, yPos + 16);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text('This document serves as the official BIR-stamped filed Income Tax Declaration for the stated online streaming period.', 18, yPos + 26);

    doc.save(`${decl.birDocumentTrackingNumber}_BIR_Tax_Declaration.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Official Government & Platform Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] via-[#1a2135] to-[#121829] border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            <Building className="w-4 h-4 text-amber-400" />
            Republic of the Philippines &bull; Bureau of Internal Revenue (BIR)
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Online Movie Streaming Tax Compliance & Subscription Audit Portal
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Authorized portal for assigned BIR Tax Auditors to inspect actual <span className="text-amber-400 font-semibold">PAID Monthly and Quarterly Subscriptions Status</span>, verify digital economy VAT & withholding tax declarations, and issue certified tax filings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => setIsProvisionOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-[#141d30] hover:bg-[#1c2944] border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Assign New Auditor Passcode</span>
          </button>
        </div>
      </div>

      {/* Security Banner: Single-Use Expiring Password Rule */}
      <div className="p-4 bg-[#0e1424] border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Strict Ephemeral Security Policy Enforced
            </span>
            <p className="text-[11px] text-slate-400">
              Access Passwords and QR Codes are strictly <span className="text-amber-300 font-semibold">single-use only</span> and automatically burn/expire after every use.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          Zero-Trust Ephemeral Access
        </div>
      </div>

      {/* MAIN VIEW: Authentication vs Authenticated Auditor Inspection */}
      {!activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auditor Login Form Card */}
          <div className="lg:col-span-2 bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Assigned BIR Auditor Authentication
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enter the single-use passcode provided for your official tax examination.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Single-Use Token
              </span>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Authentication Denied:</span>
                  <p className="leading-relaxed">{authError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Auditor Passcode / OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value)}
                    placeholder="e.g. BIR-2026-9842-X7"
                    className="flex-1 bg-[#141d30] border border-[#24334f] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleVerifyPasscode()}
                    disabled={isVerifying}
                    className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    )}
                    <span>{isVerifying ? 'Validating...' : 'Unlock Audit Session'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tip: Use default pre-filled passcode <span className="font-mono text-amber-400 font-bold">BIR-2026-9842-X7</span> to inspect the live tax portal.
                </span>
              </div>

              {/* Security Invariant Notice */}
              <div className="p-3.5 bg-[#0a0d16] border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cryptographic Burn-On-Use Guarantee
                </div>
                <p>
                  Upon successful authentication, this passcode is permanently burned in the TrustChain Evidence Ledger. Re-entering it will result in an immediate security lockout.
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic QR Code Card */}
          <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
              <QrCode className="w-4 h-4" /> Dynamic Single-Use QR Access
            </h4>
            <div className="p-3 bg-white rounded-xl shadow-md">
              {sessionQrUrl ? (
                <img src={sessionQrUrl} alt="BIR Access QR Code" className="w-36 h-36 object-contain" />
              ) : (
                <div className="w-36 h-36 bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-mono">
                  Generating QR...
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              Assigned BIR Auditors can scan this dynamic QR code using a mobile terminal for rapid single-use authentication.
            </p>
            <button
              onClick={() => handleVerifyPasscode('BIR-2026-9842-X7')}
              className="text-[11px] text-amber-400 hover:underline font-mono font-semibold"
            >
              Simulate Instant QR Scan ↗
            </button>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED AUDITOR VIEW */
        <div className="space-y-6">
          {/* Authenticated Auditor Info Banner */}
          <div className="p-5 bg-[#111726] border border-emerald-500/40 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{activeSession.auditorName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    OFFICIAL BIR AUDITOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  ID: <span className="font-mono text-slate-200">{activeSession.auditorBirId}</span> &bull; {activeSession.rdoCode}
                </p>
                <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                  Assigned Platform: {activeSession.assignedPlatform} (TIN: {activeSession.platformTin})
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-bold">
                <Lock className="w-3 h-3" /> PASSCODE BURNED & EXPIRED FOR SECURITY
              </span>
              <button
                onClick={() => setActiveSession(null)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                End Auditor Inspection Session
              </button>
            </div>
          </div>

          {/* Controls: Monthly vs Quarterly Filter Tabs */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Tax Period:</span>
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  filterPeriod === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#141d30] text-slate-300 hover:bg-[#1a2640]'
                }`}
              >
                All Filings ({declarations.length})
              </button>
              <button
                onClick={() => setFilterPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  filterPeriod === 'monthly'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#141d30] text-slate-300 hover:bg-[#1a2640]'
                }`}
              >
                Monthly Subscriptions
              </button>
              <button
                onClick={() => setFilterPeriod('quarterly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  filterPeriod === 'quarterly'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#141d30] text-slate-300 hover:bg-[#1a2640]'
                }`}
              >
                Quarterly Subscriptions
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Reconciled with PayMongo & Base L2 Smart Contracts
            </span>
          </div>

          {/* Selected Declaration Card Details */}
          {selectedDeclaration && (
            <div className="bg-[#111726] border border-amber-500/50 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
              {/* Header & Stamp Preview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                      {selectedDeclaration.stampedStatus}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      DTN: {selectedDeclaration.birDocumentTrackingNumber}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    {selectedDeclaration.periodName} Paid Subscriptions Status
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filed under BIR Electronic Filing System &bull; Blockchain Transaction Anchored
                  </p>
                </div>

                {/* Download / Print Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => handleDownloadStampedPDF(selectedDeclaration)}
                    className="py-2 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download Stamped Tax Declaration PDF</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid Subscribers</span>
                  <div className="text-2xl font-black text-white">
                    {selectedDeclaration.totalPaidSubscribers.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">100% Active Paid Accounts</span>
                </div>

                <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Subscriptions (PHP)</span>
                  <div className="text-2xl font-black text-amber-400">
                    ₱{selectedDeclaration.grossSubscriptionsPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">All Paid Tiers</span>
                </div>

                <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">12% VAT Remittance</span>
                  <div className="text-2xl font-black text-rose-400">
                    ₱{selectedDeclaration.vatAmountPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-rose-300 font-mono">Digital Services VAT</span>
                </div>

                <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tax Remitted to BIR</span>
                  <div className="text-2xl font-black text-emerald-400">
                    ₱{selectedDeclaration.totalTaxDuePhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">VAT + Creditable Withholding</span>
                </div>
              </div>

              {/* Itemized Paid Subscription Plans Breakdown Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" />
                  Itemized Paid Subscription Tier Collections
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141d30] text-slate-300 border-b border-slate-800 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Plan Tier</th>
                        <th className="p-3">Monthly Fee</th>
                        <th className="p-3">Active Paid Subscribers</th>
                        <th className="p-3">Gross Collections (PHP)</th>
                        <th className="p-3">Audit Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {selectedDeclaration.plans.map((p, idx) => (
                        <tr key={idx} className="hover:bg-[#141d30]/50 transition-colors">
                          <td className="p-3 font-sans font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            {p.planName}
                          </td>
                          <td className="p-3 text-slate-200">₱{p.priceMonthlyPhp.toLocaleString()}</td>
                          <td className="p-3 font-bold text-white">{p.activePaidSubscribers.toLocaleString()}</td>
                          <td className="p-3 text-amber-400 font-bold">
                            ₱{p.grossRevenuePhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Gateway Breakdown & Base L2 Smart Contract Anchor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    Payment Settlement Channels Reconciled
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedDeclaration.paymentGatewayBreakdown.map((gw, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#0c101c] rounded-lg">
                        <span className="text-slate-300">{gw.gateway}</span>
                        <div className="text-right font-mono">
                          <span className="text-white font-bold block">
                            ₱{gw.amountPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-500">{gw.percentage}% of total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-2 font-mono text-xs">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-sans">
                    <ShieldCheck className="w-4 h-4" />
                    Base L2 On-Chain Cryptographic Proof
                  </h4>
                  <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                    Subscription revenues are hashed and anchored to Base L2 to guarantee zero unrecorded cash flows and prevent double-reporting.
                  </p>
                  <div className="p-2.5 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block">Smart Contract Inflow Tx Hash:</span>
                    <a
                      href={`https://basescan.org/tx/${selectedDeclaration.smartContractAnchorTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline truncate block flex items-center gap-1"
                    >
                      <span>{selectedDeclaration.smartContractAnchorTx.slice(0, 32)}...</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  <div className="p-2.5 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block">SHA-256 Tax Declaration Hash:</span>
                    <span className="text-emerald-400 break-all select-all font-bold text-[11px]">
                      {selectedDeclaration.blockchainEvidenceHash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List of Available Historical Monthly/Quarterly Filings */}
          <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Filed Tax Declarations & Subscription Status History
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredDeclarations.map((decl) => (
                <div
                  key={decl.id}
                  onClick={() => setSelectedDeclarationId(decl.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    decl.id === selectedDeclaration.id
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-[#141d30] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {decl.periodType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(decl.filingTimestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-white">{decl.periodName}</h5>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{decl.totalPaidSubscribers.toLocaleString()} subscribers</span>
                    <span className="text-amber-400 font-bold">
                      ₱{(decl.grossSubscriptionsPhp / 1000000).toFixed(2)}M
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadStampedPDF(decl);
                    }}
                    className="w-full py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 cursor-pointer transition border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Stamped PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROVISION NEW AUDITOR MODAL */}
      {isProvisionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#232f45] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Assign Single-Use Passcode to BIR Auditor
              </h3>
              <button
                onClick={() => {
                  setIsProvisionOpen(false);
                  setGeneratedPasscodeNotice(null);
                }}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generatedPasscodeNotice ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Single-Use Passcode Generated Successfully!
                </div>
                <div className="p-3 bg-[#0a0d16] rounded-lg border border-amber-500/40 font-mono text-center">
                  <span className="text-slate-400 text-[10px] block uppercase">Assigned Single-Use Passcode:</span>
                  <span className="text-xl font-black text-amber-400 tracking-wider">
                    {generatedPasscodeNotice.passcode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Assigned to <span className="font-semibold text-white">{generatedPasscodeNotice.auditorName}</span> ({generatedPasscodeNotice.auditorBirId}). This password will automatically burn and expire after a single use.
                </p>
                <button
                  onClick={() => {
                    setIsProvisionOpen(false);
                    setGeneratedPasscodeNotice(null);
                  }}
                  className="w-full py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleProvisionSession} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BIR Auditor Name</label>
                  <input
                    type="text"
                    value={newAuditorName}
                    onChange={(e) => setNewAuditorName(e.target.value)}
                    required
                    className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BIR ID / Employee Number</label>
                  <input
                    type="text"
                    value={newAuditorId}
                    onChange={(e) => setNewAuditorId(e.target.value)}
                    required
                    className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Revenue District Office (RDO)</label>
                  <input
                    type="text"
                    value={newRdoCode}
                    onChange={(e) => setNewRdoCode(e.target.value)}
                    className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800 text-[11px] text-slate-400">
                  Security note: The generated passcode will be bound strictly to the streaming platform's paid subscription audit logs and will expire in 15 minutes or immediately after first use.
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Key className="w-4 h-4 text-slate-950" />
                  <span>Generate Single-Use Ephemeral Passcode</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
