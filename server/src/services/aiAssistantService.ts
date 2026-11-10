import { AuditFinding, AuditRecord } from '../types/audit.js';

export interface AIAssistantExplanation {
  findingId: string;
  findingTitle: string;
  nonTechnicalSummary: string;
  businessImpact: string;
  stepByStepAction: string[];
  estimatedFixEffort: 'Quick (1-2 hours)' | 'Medium (1-2 days)' | 'Significant (3-5 days)';
  forAudience: {
    ceoOrFounder: string;
    developer: string;
  };
}

export function generatePlainLanguageExplanation(finding: AuditFinding): AIAssistantExplanation {
  let nonTechnicalSummary = finding.plainLanguageExplanation;
  let businessImpact = 'If exploited, this weakness could impact platform reliability or trust.';
  let stepByStepAction: string[] = [finding.recommendation];
  let estimatedFixEffort: AIAssistantExplanation['estimatedFixEffort'] = 'Medium (1-2 days)';

  switch (finding.severity) {
    case 'critical':
      businessImpact = 'IMMEDIATE FINANCIAL & ASSET RISK: An external party could drain funds, bypass payment walls, or seize admin control without authorization.';
      estimatedFixEffort = 'Quick (1-2 hours)';
      stepByStepAction = [
        'Temporarily pause the affected smart contract or revoke public endpoint access.',
        'Implement the recommended access control / reentrancy guard pattern.',
        'Run the TrustChain automated re-test before re-enabling transactions.',
      ];
      break;
    case 'high':
      businessImpact = 'HIGH COMPLIANCE / SECURITY RISK: Exposes copyright material to unauthorized extraction or allows account takeover through phishing/credential weaknesses.';
      estimatedFixEffort = 'Medium (1-2 days)';
      stepByStepAction = [
        'Review current permissions and API endpoints.',
        'Apply the code or configuration patch shown in the technical recommendation.',
        'Regenerate token secrets and enforce expiry limits.',
      ];
      break;
    case 'medium':
      businessImpact = 'MODERATE OPERATIONAL RISK: Non-standard token processing or missing browser security headers could lead to failed user transactions or framing attacks.';
      estimatedFixEffort = 'Quick (1-2 hours)';
      stepByStepAction = [
        'Add the missing HTTP headers or use standard SafeERC20 library methods.',
        'Verify in your staging environment.',
      ];
      break;
    case 'low':
    case 'informational':
      businessImpact = 'BEST PRACTICE ADVISORY: Code quality, gas efficiency, or compiler hygiene optimization.';
      estimatedFixEffort = 'Quick (1-2 hours)';
      stepByStepAction = [
        'Update configuration to lock compiler versions or remove verbose server banners.',
      ];
      break;
  }

  return {
    findingId: finding.id,
    findingTitle: finding.title,
    nonTechnicalSummary,
    businessImpact,
    stepByStepAction,
    estimatedFixEffort,
    forAudience: {
      ceoOrFounder: `In simple terms: ${nonTechnicalSummary} We recommend having the tech team prioritize this to ensure peace of mind.`,
      developer: `Technical guidance: ${finding.technicalDetails} Solution: ${finding.recommendation}`,
    },
  };
}

export function generateExecutiveAuditBrief(audit: AuditRecord): {
  overviewText: string;
  readinessVerdict: 'Ready for Launch' | 'Needs Hardening' | 'Blocked (Critical Issues)';
  founderChecklist: string[];
} {
  const criticalCount = audit.summary.critical;
  const highCount = audit.summary.high;

  let readinessVerdict: 'Ready for Launch' | 'Needs Hardening' | 'Blocked (Critical Issues)' = 'Ready for Launch';
  if (criticalCount > 0) {
    readinessVerdict = 'Blocked (Critical Issues)';
  } else if (highCount > 0) {
    readinessVerdict = 'Needs Hardening';
  }

  const overviewText = `TrustChain Security Analysis for ${audit.projectName} (${audit.category.toUpperCase()}). Scanned with ${audit.toolsUsed.join(', ')}. Discovered ${criticalCount} critical, ${highCount} high, ${audit.summary.medium} medium, and ${audit.summary.low} low severity item(s).`;

  const founderChecklist = [
    criticalCount > 0 ? `🚨 Resolve ${criticalCount} critical finding(s) immediately before launch` : `✅ No critical blockers detected`,
    highCount > 0 ? `⚠️ Address ${highCount} high priority security item(s)` : `✅ High priority security requirements met`,
    audit.associatedCertificateId ? `🛡️ Blockchain certificate generated: ${audit.associatedCertificateId}` : `ℹ️ Register on-chain audit certificate upon remediation`,
    `📋 Keep offline backup of all digital licensing contracts & SHA-256 evidence records`
  ];

  return {
    overviewText,
    readinessVerdict,
    founderChecklist,
  };
}

export function askAiAssistantQuestion(question: string, contextAudits: AuditRecord[]): string {
  const q = question.toLowerCase();

  if (q.includes('reentrancy') || q.includes('drain') || q.includes('theft')) {
    return 'Reentrancy is a smart contract vulnerability where an external attacker program calls back into your contract repeatedly before your contract has finished deducting their balance. Think of it like a faulty ATM that dispenses cash before deducting your bank balance, and the cardholder quickly triggers it 10 times in a second. Solution: Always deduct the balance first (Checks-Effects-Interactions) or use OpenZeppelin ReentrancyGuard.';
  }

  if (q.includes('drm') || q.includes('widevine') || q.includes('piracy') || q.includes('stream')) {
    return 'Digital Rights Management (DRM) encrypts your video streams so that only authenticated browsers with valid decryption keys can play them. Without DRM or signed HLS URLs, anyone can copy the raw stream URL and download full HD movies with free browser extensions. We recommend enabling Widevine and FairPlay DRM or short-lived HMAC signed tokens on your CDN.';
  }

  if (q.includes('hash') || q.includes('copyright') || q.includes('ownership')) {
    return 'Important legal principle: A cryptographic file hash (SHA-256) proves that a specific file existed at a specific point in time and has not been altered. However, a file hash ALONE does not prove legal copyright ownership, because anyone could hash a file they do not own. That is why TrustChain combines content hashes with verified author declarations, distribution agreements, and publisher identities in our RightsLedger portal.';
  }

  if (q.includes('isbn') || q.includes('publishing') || q.includes('book')) {
    return 'ISBNs (International Standard Book Numbers) are 10 or 13-digit global identifiers for commercial books. TrustChain validates your ISBN mathematical checksums to prevent rejection when distributing to platforms like Amazon KDP, Apple Books, or Barnes & Noble, while registering your manuscript hash on-chain off-record.';
  }

  if (q.includes('score') || q.includes('methodology')) {
    return 'TrustChain Security Scores start at 100 points. Points are deducted based on risk severity: Critical (-30 pts), High (-15 to -18 pts), Medium (-8 to -10 pts), Low (-3 to -4 pts). Scores above 85 indicate strong posture; below 70 indicates required remediation before commercial release.';
  }

  return `Based on your TrustChain security records: Your workspace contains ${contextAudits.length} active audit projects. All scans use deterministic static analyzers and evidence registries. Remember to keep private manuscripts and customer PII stored off-chain while anchoring only the SHA-256 integrity hash on the blockchain.`;
}

