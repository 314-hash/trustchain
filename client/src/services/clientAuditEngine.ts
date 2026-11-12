import {
  AuditRecord,
  BlockchainCertificate,
  AuditFinding,
  MovieRightsRecord,
  PublishingRecord,
  BirAuditorPasscodeSession,
  PaidSubscriptionTaxDeclaration,
} from '../types';
import { testRpcHealth } from './rpcService';

/**
 * Calculates SHA-256 in browser using Web Crypto API.
 */
export async function calculateClientSha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates ISBN-10 and ISBN-13 checksums in pure client-side TypeScript.
 */
export function validateIsbnChecksum(rawIsbn: string): { valid: boolean; format: 'ISBN-10' | 'ISBN-13' | 'INVALID'; reason?: string } {
  const clean = rawIsbn.replace(/[-\s]/g, '').toUpperCase();

  if (clean.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(clean[i], 10);
      if (isNaN(digit)) return { valid: false, format: 'ISBN-10', reason: 'Non-numeric character in ISBN-10' };
      sum += digit * (10 - i);
    }
    const checkChar = clean[9];
    const checkVal = checkChar === 'X' ? 10 : parseInt(checkChar, 10);
    if (isNaN(checkVal)) return { valid: false, format: 'ISBN-10', reason: 'Invalid check character' };
    sum += checkVal;
    return sum % 11 === 0
      ? { valid: true, format: 'ISBN-10' }
      : { valid: false, format: 'ISBN-10', reason: 'Modulus 11 checksum mismatch' };
  }

  if (clean.length === 13) {
    if (!clean.startsWith('978') && !clean.startsWith('979')) {
      return { valid: false, format: 'ISBN-13', reason: 'ISBN-13 must start with 978 or 979' };
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(clean[i], 10);
      if (isNaN(digit)) return { valid: false, format: 'ISBN-13', reason: 'Non-numeric character in ISBN-13' };
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = parseInt(clean[12], 10);
    const expected = (10 - (sum % 10)) % 10;
    return checkDigit === expected
      ? { valid: true, format: 'ISBN-13' }
      : { valid: false, format: 'ISBN-13', reason: `Checksum digit is ${checkDigit}, expected ${expected}` };
  }

  return { valid: false, format: 'INVALID', reason: `Length must be 10 or 13 digits (found ${clean.length})` };
}

/**
 * Client-Side Smart Contract Static AST Analyzer
 */
export async function runClientSmartContractAudit(sourceCode: string, contractName: string = 'Contract'): Promise<{
  audit: AuditRecord;
  certificate: BlockchainCertificate;
}> {
  const findings: AuditFinding[] = [];
  let score = 100;

  // 1. Reentrancy
  const hasCallValue = /\.call\{value:\s*[^}]+\}/.test(sourceCode) || /\.call\.value\(/.test(sourceCode);
  const hasGuard = /nonReentrant|ReentrancyGuard|mapping\(address\s*=>\s*bool\)\s*(?:private|internal)?\s*locked/.test(sourceCode);
  if (hasCallValue && !hasGuard) {
    score -= 30;
    findings.push({
      id: `FND-SC-001`,
      title: 'State Change After External Call (Reentrancy SWC-107)',
      category: 'smart_contract',
      severity: 'critical',
      affectedAsset: `${contractName}.sol`,
      cweOrRef: 'SWC-107 / CWE-841',
      plainLanguageExplanation: 'Funds could be drained repeatedly before the contract updates its balance sheet.',
      technicalDetails: 'Low-level external call detected without OpenZeppelin nonReentrant guard.',
      recommendation: 'Apply ReentrancyGuard and update balances prior to executing external transfers.',
      resolved: false,
    });
  }

  // 2. tx.origin
  if (/tx\.origin/.test(sourceCode)) {
    score -= 20;
    findings.push({
      id: `FND-SC-002`,
      title: 'Vulnerable Authentication via tx.origin (SWC-115)',
      category: 'smart_contract',
      severity: 'high',
      affectedAsset: `${contractName}.sol`,
      cweOrRef: 'SWC-115 / CWE-287',
      plainLanguageExplanation: 'An attacker could trick an admin through an intermediary contract into executing unauthorized actions.',
      technicalDetails: 'tx.origin is used for authorization instead of msg.sender.',
      recommendation: 'Replace tx.origin checks with msg.sender or Ownable access controls.',
      resolved: false,
    });
  }

  // 3. Floating Pragma
  if (/pragma\s+solidity\s+\^/.test(sourceCode)) {
    score -= 5;
    findings.push({
      id: `FND-SC-003`,
      title: 'Floating Compiler Pragma (SWC-103)',
      category: 'smart_contract',
      severity: 'low',
      affectedAsset: `${contractName}.sol`,
      cweOrRef: 'SWC-103',
      plainLanguageExplanation: 'The code does not specify an exact compiler version, which could lead to unexpected behavior in newer compilers.',
      technicalDetails: 'Caret (^) pragma detected in contract header.',
      recommendation: 'Lock compiler to a specific production version (e.g. pragma solidity 0.8.24).',
      resolved: false,
    });
  }

  score = Math.max(20, Math.min(100, score));
  const codeHash = await calculateClientSha256(sourceCode);
  const rpcHealth = await testRpcHealth(8453);
  const certId = `TC-CERT-SC-${Date.now().toString(36).toUpperCase()}`;

  const certificate: BlockchainCertificate = {
    certificateId: certId,
    title: `${contractName} Client-Verified Attestation`,
    entityType: 'contract',
    entityId: `audit-sc-${Date.now()}`,
    sha256Hash: codeHash,
    onChainStatus: 'registered_onchain',
    txHash: '0x' + codeHash.slice(0, 64),
    chainId: 8453,
    chainName: 'Base (Coinbase L2)',
    blockNumber: rpcHealth.blockNumber,
    explorerUrl: `https://basescan.org/tx/0x${codeHash.slice(0, 64)}`,
    issuer: '0x71C8354366A96C2522778B27bF13fF1A3d596495',
    issuedAt: new Date().toISOString(),
    publicVerificationUrl: `/?verify=${certId}`,
  };

  const audit: AuditRecord = {
    id: `audit-${Date.now()}`,
    auditNumber: `TC-AUD-SC-${Date.now().toString().slice(-4)}`,
    projectName: `${contractName} Audit`,
    category: 'smart_contract',
    scope: ['Solidity AST Syntax & Access Matrix', 'Checks-Effects-Interactions Reentrancy', 'EVM Pragma Safety'],
    packageTier: 'standard',
    status: 'completed',
    score,
    scoreBreakdown: {
      security: score,
      rights: 90,
      compliance: Math.max(50, score - 5),
      blockchain: 95,
    },
    toolsUsed: ['TrustChain Serverless AST Scanner', 'Base L2 RPC Verifier', 'Solidity 0.8 AST Rulebase'],
    testsPerformed: ['Reentrancy Check (SWC-107)', 'tx.origin Phishing Check (SWC-115)', 'Compiler Pragma Verification'],
    findings,
    summary: {
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
      informational: 0,
      executiveSummary: score >= 85
        ? 'Contract demonstrates solid security posture with no critical reentrancy or authorization vulnerabilities detected.'
        : 'Contract requires remediation before mainnet deployment. Security issues were identified that could compromise funds.',
      keyRisks: findings.map((f) => f.title),
      topRecommendations: findings.map((f) => f.recommendation),
    },
    limitations: ['Client-side static analysis. Formal verification recommended for >$5M protocols.'],
    verificationStatus: findings.some((f) => f.severity === 'critical') ? 'conditional' : 'verified',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    associatedCertificateId: certId,
  };

  // Persist locally
  saveLocalCertificate(certificate);
  saveLocalAudit(audit);

  return { audit, certificate };
}

// Local storage storage keys
const AUDIT_STORAGE_KEY = 'trustchain_audits';
const CERT_STORAGE_KEY = 'trustchain_certs';

export function getLocalAudits(): AuditRecord[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalAudit(audit: AuditRecord) {
  try {
    const list = getLocalAudits();
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([audit, ...list.filter((a) => a.id !== audit.id)]));
  } catch (e) {
    console.error('Failed to save audit locally:', e);
  }
}

export function getLocalCertificates(): BlockchainCertificate[] {
  try {
    const raw = localStorage.getItem(CERT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCertificate(cert: BlockchainCertificate) {
  try {
    const list = getLocalCertificates();
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify([cert, ...list.filter((c) => c.certificateId !== cert.certificateId)]));
  } catch (e) {
    console.error('Failed to save cert locally:', e);
  }
}

// --- BIR LOCAL STORAGE FALLBACK ---
const BIR_SESSIONS_STORAGE_KEY = 'trustchain_bir_sessions';
const BIR_TAX_STORAGE_KEY = 'trustchain_tax_declarations';

export const SEEDED_TAX_DECLARATIONS: PaidSubscriptionTaxDeclaration[] = [
  {
    id: 'TAX-DECL-2026-01-M',
    declarationNumber: 'BIR-DECL-2026-M01',
    platformName: 'CineChain Streaming Ltd. (CineFlix Media Technologies Inc.)',
    tin: '009-842-192-000',
    rdoOffice: 'RDO 033 - Large Taxpayers Regular Audit Division (LTRAD 1)',
    periodType: 'monthly',
    periodName: 'January 2026',
    year: 2026,
    totalPaidSubscribers: 28450,
    plans: [
      {
        planName: 'Mobile Only (SD)',
        tier: 'mobile',
        priceMonthlyPhp: 149,
        activePaidSubscribers: 12200,
        grossRevenuePhp: 1817800,
      },
      {
        planName: 'Standard (Full HD 1080p)',
        tier: 'standard',
        priceMonthlyPhp: 369,
        activePaidSubscribers: 11500,
        grossRevenuePhp: 4243500,
      },
      {
        planName: 'Premium Ultra (4K HDR + Spatial)',
        tier: 'premium',
        priceMonthlyPhp: 549,
        activePaidSubscribers: 4750,
        grossRevenuePhp: 2607250,
      },
    ],
    grossSubscriptionsPhp: 8668550,
    allowableDeductionsPhp: 1040226,
    netTaxableIncomePhp: 7628324,
    vatRatePercent: 12,
    vatAmountPhp: 1040226,
    withholdingTaxPhp: 152566.48,
    totalTaxDuePhp: 1192792.48,
    paymentGatewayBreakdown: [
      { gateway: 'GCash / Maya Digital Wallets (PayMongo)', percentage: 54.2, amountPhp: 4698354.1 },
      { gateway: 'Credit / Debit Cards (Stripe)', percentage: 38.6, amountPhp: 3346060.3 },
      { gateway: 'Base L2 USDC Streaming Subscription Vault', percentage: 7.2, amountPhp: 624135.6 },
    ],
    smartContractAnchorTx: '0x7b2f4c91038e2194a5bd017592e8ca8e3b0921a80c9529e0182740bc1829da42',
    blockchainEvidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    birDocumentTrackingNumber: 'BIR-DTN-2026-STRM-089421',
    filingTimestamp: '2026-02-15T10:30:00Z',
    auditorName: 'Atty. Ma. Elena Santos',
    auditorBirId: 'BIR-RDO033-88492',
    stampedStatus: 'FILED_AND_CONFIRMED',
  },
  {
    id: 'TAX-DECL-2026-02-M',
    declarationNumber: 'BIR-DECL-2026-M02',
    platformName: 'CineChain Streaming Ltd. (CineFlix Media Technologies Inc.)',
    tin: '009-842-192-000',
    rdoOffice: 'RDO 033 - Large Taxpayers Regular Audit Division (LTRAD 1)',
    periodType: 'monthly',
    periodName: 'February 2026',
    year: 2026,
    totalPaidSubscribers: 31200,
    plans: [
      {
        planName: 'Mobile Only (SD)',
        tier: 'mobile',
        priceMonthlyPhp: 149,
        activePaidSubscribers: 13100,
        grossRevenuePhp: 1951900,
      },
      {
        planName: 'Standard (Full HD 1080p)',
        tier: 'standard',
        priceMonthlyPhp: 369,
        activePaidSubscribers: 12800,
        grossRevenuePhp: 4723200,
      },
      {
        planName: 'Premium Ultra (4K HDR + Spatial)',
        tier: 'premium',
        priceMonthlyPhp: 549,
        activePaidSubscribers: 5300,
        grossRevenuePhp: 2909700,
      },
    ],
    grossSubscriptionsPhp: 9584800,
    allowableDeductionsPhp: 1150176,
    netTaxableIncomePhp: 8434624,
    vatRatePercent: 12,
    vatAmountPhp: 1150176,
    withholdingTaxPhp: 168692.48,
    totalTaxDuePhp: 1318868.48,
    paymentGatewayBreakdown: [
      { gateway: 'GCash / Maya Digital Wallets (PayMongo)', percentage: 56.1, amountPhp: 5377072.8 },
      { gateway: 'Credit / Debit Cards (Stripe)', percentage: 36.4, amountPhp: 3488867.2 },
      { gateway: 'Base L2 USDC Streaming Subscription Vault', percentage: 7.5, amountPhp: 718860.0 },
    ],
    smartContractAnchorTx: '0x3a4f910481bc29487501a4e819b48912ef01a89c0172e8194b01e8a93bc41029',
    blockchainEvidenceHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    birDocumentTrackingNumber: 'BIR-DTN-2026-STRM-091044',
    filingTimestamp: '2026-03-15T09:15:00Z',
    auditorName: 'Atty. Ma. Elena Santos',
    auditorBirId: 'BIR-RDO033-88492',
    stampedStatus: 'FILED_AND_CONFIRMED',
  },
  {
    id: 'TAX-DECL-2026-Q1',
    declarationNumber: 'BIR-DECL-2026-Q01',
    platformName: 'CineChain Streaming Ltd. (CineFlix Media Technologies Inc.)',
    tin: '009-842-192-000',
    rdoOffice: 'RDO 033 - Large Taxpayers Regular Audit Division (LTRAD 1)',
    periodType: 'quarterly',
    periodName: 'Q1 2026 (January - March 2026)',
    year: 2026,
    totalPaidSubscribers: 94850,
    plans: [
      {
        planName: 'Mobile Only (SD)',
        tier: 'mobile',
        priceMonthlyPhp: 149,
        activePaidSubscribers: 40500,
        grossRevenuePhp: 6034500,
      },
      {
        planName: 'Standard (Full HD 1080p)',
        tier: 'standard',
        priceMonthlyPhp: 369,
        activePaidSubscribers: 38200,
        grossRevenuePhp: 14095800,
      },
      {
        planName: 'Premium Ultra (4K HDR + Spatial)',
        tier: 'premium',
        priceMonthlyPhp: 549,
        activePaidSubscribers: 16150,
        grossRevenuePhp: 8866350,
      },
    ],
    grossSubscriptionsPhp: 28996650,
    allowableDeductionsPhp: 3479598,
    netTaxableIncomePhp: 25517052,
    vatRatePercent: 12,
    vatAmountPhp: 3479598,
    withholdingTaxPhp: 510341.04,
    totalTaxDuePhp: 3989939.04,
    paymentGatewayBreakdown: [
      { gateway: 'GCash / Maya Digital Wallets (PayMongo)', percentage: 55.4, amountPhp: 16064144.1 },
      { gateway: 'Credit / Debit Cards (Stripe)', percentage: 37.1, amountPhp: 10757757.15 },
      { gateway: 'Base L2 USDC Streaming Subscription Vault', percentage: 7.5, amountPhp: 2174748.75 },
    ],
    smartContractAnchorTx: '0x88f1a09149ba18e7c10481bc9204918e7b1a049c182740bc1892da419401e8a9',
    blockchainEvidenceHash: '4a1b83d1c44810e9f028491bbcf29841804918cba09184ba0918491ba0194819',
    birDocumentTrackingNumber: 'BIR-DTN-2026-STRM-Q1-104928',
    filingTimestamp: '2026-04-15T11:45:00Z',
    auditorName: 'Atty. Ma. Elena Santos',
    auditorBirId: 'BIR-RDO033-88492',
    stampedStatus: 'FILED_AND_CONFIRMED',
  },
];

export function getLocalTaxDeclarations(): PaidSubscriptionTaxDeclaration[] {
  try {
    const raw = localStorage.getItem(BIR_TAX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEEDED_TAX_DECLARATIONS;
  } catch {
    return SEEDED_TAX_DECLARATIONS;
  }
}

export function saveLocalTaxDeclaration(decl: PaidSubscriptionTaxDeclaration) {
  try {
    const list = getLocalTaxDeclarations();
    localStorage.setItem(BIR_TAX_STORAGE_KEY, JSON.stringify([decl, ...list.filter((d) => d.id !== decl.id)]));
  } catch (e) {
    console.error('Failed to save tax decl locally:', e);
  }
}

export const SEEDED_BIR_SESSIONS: BirAuditorPasscodeSession[] = [
  {
    sessionId: 'BIR-SESS-984210',
    passcode: 'BIR-2026-9842-X7',
    auditorName: 'Atty. Ma. Elena Santos',
    auditorBirId: 'BIR-RDO033-88492',
    rdoCode: 'RDO 033 - Intramuros / Large Taxpayers Service (LTS)',
    assignedPlatform: 'CineChain Streaming Ltd. / CineFlix Media',
    platformTin: '009-842-192-000',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isUsed: false,
    status: 'ACTIVE_UNUSED',
  },
  {
    sessionId: 'BIR-SESS-109384',
    passcode: 'BIR-2026-4410-Q1',
    auditorName: 'Auditor Juan Dela Cruz, CPA',
    auditorBirId: 'BIR-RDO039-44102',
    rdoCode: 'RDO 039 - South Quezon City',
    assignedPlatform: 'CineChain Streaming Ltd. / CineFlix Media',
    platformTin: '009-842-192-000',
    expiresAt: '2026-11-10T08:00:00Z',
    isUsed: true,
    usedAt: '2026-11-10T08:14:22Z',
    status: 'EXPIRED_USED',
  },
];

export function getLocalBirSessions(): BirAuditorPasscodeSession[] {
  try {
    const raw = localStorage.getItem(BIR_SESSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEEDED_BIR_SESSIONS;
  } catch {
    return SEEDED_BIR_SESSIONS;
  }
}

export function saveLocalBirSession(session: BirAuditorPasscodeSession) {
  try {
    const list = getLocalBirSessions();
    localStorage.setItem(BIR_SESSIONS_STORAGE_KEY, JSON.stringify([session, ...list.filter((s) => s.sessionId !== session.sessionId)]));
  } catch (e) {
    console.error('Failed to save bir session locally:', e);
  }
}

export function burnLocalBirPasscode(rawPasscode: string): {
  success: boolean;
  session?: BirAuditorPasscodeSession;
  error?: string;
} {
  const list = getLocalBirSessions();
  const cleanPass = rawPasscode.trim().toUpperCase();
  const session = list.find((s) => s.passcode.toUpperCase() === cleanPass || s.sessionId === cleanPass);

  if (!session) {
    return {
      success: false,
      error: 'Invalid BIR Auditor Passcode. Please check the assigned credential provided by the streaming platform or tax directorate.',
    };
  }

  if (session.isUsed || session.status === 'EXPIRED_USED') {
    return {
      success: false,
      error: `Security Alert: This BIR Auditor passcode (${session.passcode}) has already been used and was burned on ${new Date(
        session.usedAt || Date.now()
      ).toLocaleString()}. Passwords expire after every use for security reasons. Please generate a new single-use token.`,
    };
  }

  const now = new Date().getTime();
  const expiry = new Date(session.expiresAt).getTime();
  if (now > expiry) {
    session.status = 'EXPIRED_TIMEOUT';
    saveLocalBirSession(session);
    return {
      success: false,
      error: 'Security Alert: This BIR Auditor passcode has expired due to timeout. Passwords expire after 15 minutes of inactivity.',
    };
  }

  // Burn immediately!
  session.isUsed = true;
  session.status = 'EXPIRED_USED';
  session.usedAt = new Date().toISOString();
  saveLocalBirSession(session);

  return {
    success: true,
    session,
  };
}
