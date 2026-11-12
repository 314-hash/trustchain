export type AuditCategory =
  | 'streaming'
  | 'publishing'
  | 'smart_contract'
  | 'web3_app'
  | 'content_ownership'
  | 'website_security';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export interface AuditFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  affectedAsset: string;
  plainLanguageExplanation: string;
  technicalDetails: string;
  recommendation: string;
  category: string;
  cweOrRef?: string;
  resolved: boolean;
  evidenceSnippet?: string;
}

export type RightsStatus =
  | 'not_submitted'
  | 'pending'
  | 'evidence_checked'
  | 'conflicting_evidence'
  | 'expired_license'
  | 'independently_verified';

export interface MovieRightsRecord {
  id: string;
  title: string;
  productionCompany: string;
  director: string;
  contentOwnerDeclaration: string;
  licenseDocs: string[];
  distributionAgreement: string;
  licenseExpirationDate: string;
  territoryRestrictions: string[];
  streamingRights: string;
  revenueSharingTerms: string;
  contentFileHash: string;
  rightsStatus: RightsStatus;
  statusNotes?: string;
  updatedAt: string;
}

export interface PublishingRecord {
  id: string;
  publicationId: string;
  bookTitle: string;
  authorName: string;
  publisher: string;
  isbn: string;
  publicationDate: string;
  manuscriptHash: string;
  epubPdfHash: string;
  copyrightDeclaration: string;
  licensingDocuments: string[];
  royaltyAgreement: string;
  royaltyRatePercent: number;
  contentIntegrityVerified: boolean;
  blockchainTxHash?: string;
  certificateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainCertificate {
  certificateId: string;
  title: string;
  entityType: 'movie' | 'book' | 'contract' | 'website_audit';
  entityId: string;
  sha256Hash: string;
  onChainStatus: 'registered_onchain' | 'offchain_signed' | 'pending';
  txHash?: string;
  chainId: number;
  chainName: string;
  blockNumber?: number;
  explorerUrl?: string;
  issuer: string;
  issuedAt: string;
  publicVerificationUrl: string;
}

export interface AuditRecord {
  id: string;
  auditNumber: string;
  projectName: string;
  category: AuditCategory;
  targetUrlOrRepo?: string;
  scope: string[];
  packageTier: 'basic' | 'standard' | 'enterprise';
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  score?: number;
  scoreBreakdown?: {
    security: number;
    rights: number;
    compliance: number;
    blockchain: number;
  };
  toolsUsed: string[];
  testsPerformed: string[];
  findings: AuditFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    executiveSummary: string;
    keyRisks: string[];
    topRecommendations: string[];
  };
  limitations: string[];
  verificationStatus: 'verified' | 'unverified' | 'conditional';
  createdAt: string;
  completedAt?: string;
  associatedCertificateId?: string;
}

export interface BirAuditorPasscodeSession {
  sessionId: string;
  passcode: string;
  auditorName: string;
  auditorBirId: string;
  rdoCode: string;
  assignedPlatform: string;
  platformTin: string;
  qrCodeUrl?: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
  status: 'ACTIVE_UNUSED' | 'EXPIRED_USED' | 'EXPIRED_TIMEOUT';
}

export interface SubscriptionPlanSummary {
  planName: string;
  tier: 'mobile' | 'standard' | 'premium';
  priceMonthlyPhp: number;
  activePaidSubscribers: number;
  grossRevenuePhp: number;
}

export interface PaidSubscriptionTaxDeclaration {
  id: string;
  declarationNumber: string;
  platformName: string;
  tin: string;
  rdoOffice: string;
  periodType: 'monthly' | 'quarterly';
  periodName: string; // e.g. "January 2026" or "Q1 2026"
  year: number;
  totalPaidSubscribers: number;
  plans: SubscriptionPlanSummary[];
  grossSubscriptionsPhp: number;
  allowableDeductionsPhp: number;
  netTaxableIncomePhp: number;
  vatRatePercent: number; // 12%
  vatAmountPhp: number;
  withholdingTaxPhp: number;
  totalTaxDuePhp: number;
  paymentGatewayBreakdown: {
    gateway: string;
    percentage: number;
    amountPhp: number;
  }[];
  smartContractAnchorTx: string;
  blockchainEvidenceHash: string;
  birDocumentTrackingNumber: string;
  filingTimestamp: string;
  auditorName: string;
  auditorBirId: string;
  stampedStatus: 'FILED_AND_CONFIRMED' | 'DRAFT';
}

