import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AuditRecord,
  MovieRightsRecord,
  PublishingRecord,
  BlockchainCertificate,
  BirAuditorPasscodeSession,
  PaidSubscriptionTaxDeclaration,
} from '../types/audit.js';
import { registerAuditCertificate } from './blockchainRegistryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'trustchain_db.json');

export interface DatabaseSchema {
  audits: AuditRecord[];
  movieRights: MovieRightsRecord[];
  publishingRecords: PublishingRecord[];
  certificates: BlockchainCertificate[];
  birSessions: BirAuditorPasscodeSession[];
  taxDeclarations: PaidSubscriptionTaxDeclaration[];
}

// Initial realistic seed data
const initialData: DatabaseSchema = {
  audits: [
    {
      id: 'audit-001',
      auditNumber: 'TC-AUD-2026-001',
      projectName: 'CineChain Decentralized Streaming',
      category: 'streaming',
      targetUrlOrRepo: 'https://cinechain-stream.app',
      scope: ['HLS/DASH Streaming Manifests', 'CDN Token Security', 'DRM Pipeline', 'Subscription Smart Contracts'],
      packageTier: 'enterprise',
      status: 'completed',
      score: 72,
      scoreBreakdown: {
        security: 70,
        rights: 85,
        compliance: 75,
        blockchain: 80,
      },
      toolsUsed: ['TrustChain MediaGuard v2.4', 'HLS Stream Probe', 'OWASP Streaming Security Checklist', 'Slither v0.10.2'],
      testsPerformed: [
        'DRM Encryption Key Verification',
        'Signed CDN URL Expiry Enforcement',
        'Streaming Master S3 Access Policy Audit',
        'Subscription Payment Webhook Validation',
        'Movie Rights License Expiration Sweep'
      ],
      findings: [
        {
          id: 'FIND-STR-01',
          title: 'Missing Digital Rights Management (DRM) on 4K Stream Chunks',
          severity: 'high',
          affectedAsset: 'Video Delivery Pipeline (HLS/DASH)',
          category: 'Streaming Security / DRM',
          cweOrRef: 'CWE-311 / Piracy Surface',
          plainLanguageExplanation:
            'Your 4K video streams are delivered without hardware DRM encryption. Anyone with a browser extension can download full uncompressed movies without authorization.',
          technicalDetails:
            'High-resolution playlists are served as unencrypted MPEG-TS/fMP4 chunks. Widevine Modular and FairPlay Streaming keys are not enforced on premium tiers.',
          recommendation:
            'Implement Google Widevine and Apple FairPlay DRM licensing keys via Cloudflare Stream or AWS Elemental MediaConvert.',
          resolved: false,
        },
        {
          id: 'FIND-STR-02',
          title: 'Streaming URL Token Expiry Exceeds 24 Hours',
          severity: 'medium',
          affectedAsset: '/api/v1/stream/manifest.m3u8',
          category: 'Streaming API / Access Control',
          cweOrRef: 'CWE-285',
          plainLanguageExplanation:
            'When a paid user starts a movie, their playback link stays valid for 24 hours. They can share this link with friends or on social media.',
          technicalDetails:
            'HMAC signed token TTL in stream manifests is set to 86,400 seconds. Recommended duration is 3,600 to 7,200 seconds with IP binding.',
          recommendation:
            'Reduce token expiration to 60-120 minutes and regenerate tokens dynamically during player heartbeat requests.',
          resolved: false,
        },
        {
          id: 'FIND-STR-03',
          title: 'Content Storage Bucket Allows Anonymous Read on Preview Trailers',
          severity: 'low',
          affectedAsset: 's3://cinechain-media-storage/trailers/',
          category: 'Cloud Storage Configuration',
          cweOrRef: 'CWE-732',
          plainLanguageExplanation:
            'The cloud storage bucket holding promotional trailers is completely public. While intended for marketing, public read permissions should be restricted to CDN edge IPs.',
          technicalDetails:
            'Bucket policy allows s3:GetObject to Principal: *. Recommended pattern is AWS CloudFront Origin Access Control (OAC).',
          recommendation: 'Configure CloudFront Origin Access Control (OAC) and remove public S3 bucket policies.',
          resolved: true,
        },
      ],
      summary: {
        critical: 0,
        high: 1,
        medium: 1,
        low: 1,
        informational: 0,
        executiveSummary:
          'CineChain streaming architecture demonstrates solid web fundamentals but requires DRM encryption hardening for 4K assets and shorter CDN token lifespans.',
        keyRisks: [
          'High Risk of 4K Video Stream Piracy and Stream Ripping',
          'Prolonged 24-hour token replay window on CDN playback manifests'
        ],
        topRecommendations: [
          'Enable Widevine/FairPlay DRM encryption on 4K video packaging',
          'Reduce CDN playback URL token validity to 2 hours maximum',
          'Apply CloudFront Origin Access Control (OAC) on media storage'
        ],
      },
      limitations: [
        'Automated testing does not simulate hardware-level HDMI HDCP strippers',
        'Testing performed on staging environment endpoints'
      ],
      verificationStatus: 'verified',
      createdAt: '2026-11-08T09:30:00Z',
      completedAt: '2026-11-08T09:34:22Z',
      associatedCertificateId: 'TC-CERT-STR-8401',
    },
    {
      id: 'audit-002',
      auditNumber: 'TC-AUD-2026-002',
      projectName: 'Veritas Publishing & Manuscript Ledger',
      category: 'publishing',
      targetUrlOrRepo: 'https://veritas-books.io',
      scope: ['Author Verification Portal', 'ISBN-13 Registry', 'Content SHA-256 Proof', 'Royalty Smart Contract'],
      packageTier: 'standard',
      status: 'completed',
      score: 94,
      scoreBreakdown: {
        security: 95,
        rights: 96,
        compliance: 92,
        blockchain: 94,
      },
      toolsUsed: ['TrustChain PublisherGuard v1.8', 'ISBN-13 Algorithm Validator', 'EVM Evidence Registry Adapter'],
      testsPerformed: [
        'ISBN-13 Mathematical Checksum Verification',
        'Author Cryptographic Signature Validation',
        'Manuscript & EPUB Zero-Knowledge Fingerprint Computation',
        'Copyright Notice Chain-of-Custody Audit',
        'Off-chain Private Storage Leakage Inspection'
      ],
      findings: [
        {
          id: 'FIND-PUB-01',
          title: 'Missing Copyright Registration Date in E-book Spine Metadata',
          severity: 'low',
          affectedAsset: 'EPUB package OPF metadata',
          category: 'Publishing / Metadata Integrity',
          cweOrRef: 'Dublin Core Metadata Standard',
          plainLanguageExplanation:
            'The inside packaging of the digital EPUB file lists the author but omits the explicit publication date metadata tag.',
          technicalDetails:
            'dc:date tag is missing in META-INF/container.opf. While harmless, major e-readers and public libraries use this tag to catalog release years.',
          recommendation: 'Add <dc:date>2026-11-01</dc:date> to the OPF metadata template.',
          resolved: true,
        },
      ],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 1,
        informational: 0,
        executiveSummary:
          'Veritas Publishing exhibits excellent digital provenance standards. All manuscripts are correctly hashed off-chain with SHA-256 fingerprints anchored on Base blockchain.',
        keyRisks: ['Minor metadata tagging omissions in legacy e-book files'],
        topRecommendations: ['Incorporate Dublin Core metadata automated validator in publishing pipeline'],
      },
      limitations: ['Verification relies on authenticated publisher identity submissions'],
      verificationStatus: 'verified',
      createdAt: '2026-11-09T14:15:00Z',
      completedAt: '2026-11-09T14:18:45Z',
      associatedCertificateId: 'TC-CERT-PUB-9912',
    },
    {
      id: 'audit-003',
      auditNumber: 'TC-AUD-2026-003',
      projectName: 'VaultStakingRewards.sol',
      category: 'smart_contract',
      targetUrlOrRepo: 'github.com/veritas-dao/staking-vault',
      scope: ['Solidity 0.8.20 Source Code', 'ERC-4626 Vault Compliance', 'Reward Distribution Math', 'Access Control'],
      packageTier: 'enterprise',
      status: 'completed',
      score: 64,
      scoreBreakdown: {
        security: 60,
        rights: 80,
        compliance: 65,
        blockchain: 70,
      },
      toolsUsed: ['TrustChain Solidity AST Engine', 'Slither v0.10.2 Adapter', 'Foundry Test Suite Adapter', 'Aderyn v0.1'],
      testsPerformed: [
        'Reentrancy Vulnerability Sweep',
        'Access Control & Owner Privilege Matrix',
        'Unchecked Token Return Value Check',
        'Precision Loss & Rounding Error Analysis',
        'Compiler Pragma Stability Inspection'
      ],
      findings: [
        {
          id: 'FIND-SC-REENT',
          title: 'Reentrancy Vulnerability in emergencyWithdraw()',
          severity: 'critical',
          affectedAsset: 'VaultStakingRewards.emergencyWithdraw()',
          category: 'Smart Contract / Reentrancy',
          cweOrRef: 'SWC-107 / CWE-841',
          plainLanguageExplanation:
            'The contract sends tokens to a user before subtracting their deposited balance. A malicious contract can re-enter this function repeatedly and drain the entire vault balance.',
          technicalDetails:
            'Checks-Effects-Interactions pattern is violated at line 142. External call `IERC20(asset).transfer(msg.sender, amount)` executes before `userBalances[msg.sender] = 0`.',
          recommendation:
            'Zero out the user balance BEFORE making the external transfer, or add OpenZeppelin nonReentrant modifier.',
          resolved: false,
        },
        {
          id: 'FIND-SC-TXORIGIN',
          title: 'Authentication Using Vulnerable tx.origin',
          severity: 'high',
          affectedAsset: 'VaultStakingRewards.setRewardRate()',
          category: 'Smart Contract / Access Control',
          cweOrRef: 'SWC-115 / CWE-287',
          plainLanguageExplanation:
            'The function checks `tx.origin == admin`. If the admin accidentally approves a malicious transaction on a compromised website, the attacker can hijack the admin role.',
          technicalDetails:
            'Use of tx.origin allows intermediate contract calls to pass authorization checks. Phishing attack vector SWC-115.',
          recommendation: 'Replace `require(tx.origin == admin)` with `require(msg.sender == admin)` or use Ownable.',
          resolved: false,
        },
      ],
      summary: {
        critical: 1,
        high: 1,
        medium: 0,
        low: 0,
        informational: 0,
        executiveSummary:
          'CRITICAL ALERT: Smart contract audit revealed 1 critical reentrancy vector and 1 high-risk tx.origin access control flaw. The contract MUST NOT be deployed to mainnet in its current state.',
        keyRisks: [
          'Complete Vault Fund Drain via Reentrant emergencyWithdraw()',
          'Phishing Hijack of Admin Rate Controls via tx.origin'
        ],
        topRecommendations: [
          'Add OpenZeppelin nonReentrant modifier to emergencyWithdraw() and all state-altering functions',
          'Change tx.origin to msg.sender across all administrative functions',
          'Conduct comprehensive Foundry fuzz testing prior to re-submitting for audit'
        ],
      },
      limitations: ['Analysis performed on single file repository without external oracle contracts'],
      verificationStatus: 'conditional',
      createdAt: '2026-11-10T08:00:00Z',
      completedAt: '2026-11-10T08:04:12Z',
      associatedCertificateId: 'TC-CERT-SC-5520',
    },
  ],
  movieRights: [
    {
      id: 'mov-1',
      title: 'Quantum Horizon (2025)',
      productionCompany: 'Aetherion Cinematic Studios LLC',
      director: 'Marcus Vance',
      contentOwnerDeclaration: 'Aetherion Studios holds 100% exclusive worldwide copyright and theatrical/VOD rights.',
      licenseDocs: ['aetherion_distribution_agreement_signed.pdf', 'copyright_us_reg_va002931.pdf'],
      distributionAgreement: 'Exclusive global streaming license granted to TrustChain platform network through 2029.',
      licenseExpirationDate: '2029-12-31',
      territoryRestrictions: ['Worldwide (Excluding Sanctioned Regions)'],
      streamingRights: 'SVOD, TVOD, Web3 Pay-Per-View',
      revenueSharingTerms: '80% content creator, 20% platform infrastructure fee via automated smart contract splits.',
      contentFileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rightsStatus: 'independently_verified',
      statusNotes: 'Independently verified by TrustChain Legal & Rights Clearance Board. Cryptographic proof anchored on Base.',
      updatedAt: '2026-11-07T12:00:00Z',
    },
    {
      id: 'mov-2',
      title: 'The Cyberpunk Chronicles: Neon Alley',
      productionCompany: 'Synapse Media Tokyo',
      director: 'Kenji Takahashi',
      contentOwnerDeclaration: 'Synapse Media holds original distribution master rights.',
      licenseDocs: ['synapse_apac_distro_2024.pdf'],
      distributionAgreement: 'APAC regional VOD streaming license valid through 2026.',
      licenseExpirationDate: '2026-06-30',
      territoryRestrictions: ['APAC (Japan, South Korea, Singapore, Australia)'],
      streamingRights: 'AVOD, SVOD',
      revenueSharingTerms: '75% creator / 25% platform',
      contentFileHash: 'c7be1a80d46777a83d73ee5d9472ce5e82b3d8d6411ab7c2efef116a445942f6',
      rightsStatus: 'evidence_checked',
      statusNotes: 'Licensing documentation and territorial restrictions validated against distribution contracts.',
      updatedAt: '2026-11-09T16:20:00Z',
    },
    {
      id: 'mov-3',
      title: 'Sunset Over Venice (2022)',
      productionCompany: 'Lumiere European Cinema',
      director: 'Giulia Romano',
      contentOwnerDeclaration: 'Original 2-year European distribution release.',
      licenseDocs: ['lumiere_distro_2022.pdf'],
      distributionAgreement: 'Limited European regional streaming license expired on 2024-10-31.',
      licenseExpirationDate: '2024-10-31',
      territoryRestrictions: ['European Union'],
      streamingRights: 'TVOD',
      revenueSharingTerms: '70% / 30%',
      contentFileHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      rightsStatus: 'expired_license',
      statusNotes: 'EXPIRED LICENSE: Stream delisted automatically on 2024-10-31. Renewal required before reactivating playback.',
      updatedAt: '2026-11-08T09:00:00Z',
    },
  ],
  publishingRecords: [
    {
      id: 'pub-1',
      publicationId: 'PUB-VERITAS-2026-01',
      bookTitle: 'The Sovereign Cryptographer: Zero-Knowledge Protocols & Trust',
      authorName: 'Dr. Elena Rostova',
      publisher: 'Veritas Academic Press',
      isbn: '978-0-13-468599-1',
      publicationDate: '2026-09-15',
      manuscriptHash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      epubPdfHash: '7d793037a0760186574b0282f2f435e7b1e50774690f69799f9024f07f4ec9f1',
      copyrightDeclaration: 'Copyright © 2026 Dr. Elena Rostova & Veritas Academic Press. All rights reserved under Berne Convention.',
      licensingDocuments: ['publishing_agreement_signed_rostova.pdf'],
      royaltyAgreement: '70% direct author royalty paid via USDC smart escrow monthly.',
      royaltyRatePercent: 70,
      contentIntegrityVerified: true,
      blockchainTxHash: '0x9b3f468dc26871a25785f0ef3524b07e7811bfceef0eef379d2df26c71a33719',
      certificateId: 'TC-CERT-PUB-9912',
      createdAt: '2026-11-09T14:15:00Z',
      updatedAt: '2026-11-09T14:18:45Z',
    },
    {
      id: 'pub-2',
      publicationId: 'PUB-VERITAS-2026-02',
      bookTitle: 'Decentralized Streaming Architectures: From P2P to Modern Edge CDNs',
      authorName: 'Marcus Vance & Alex Chen',
      publisher: 'TrustChain Technical Publications',
      isbn: '978-1-56619-909-4',
      publicationDate: '2026-10-01',
      manuscriptHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      epubPdfHash: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
      copyrightDeclaration: 'Copyright © 2026 TrustChain Technical Publications. Registered with US Copyright Office.',
      licensingDocuments: ['co_author_royalty_split_vance_chen.pdf'],
      royaltyAgreement: '50/50 author split on net digital sales after platform gas fees.',
      royaltyRatePercent: 80,
      contentIntegrityVerified: true,
      blockchainTxHash: '0x3a48e7e174b8686d1bf762283a0494488bbd6b1d033a76a88b13d2a71fef3957',
      certificateId: 'TC-CERT-PUB-7734',
      createdAt: '2026-11-08T11:00:00Z',
      updatedAt: '2026-11-08T11:05:00Z',
    },
  ],
  certificates: [
    {
      certificateId: 'TC-CERT-STR-8401',
      title: 'CineChain Streaming Security & CDN Audit Certificate',
      entityType: 'website_audit',
      entityId: 'audit-001',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      onChainStatus: 'registered_onchain',
      txHash: '0x7b23c914e138a0f82df97e937d4013149dfb32b85a3c9b78e352ef238910b8cf',
      chainId: 8453,
      chainName: 'Base (Coinbase L2)',
      blockNumber: 19842012,
      explorerUrl: 'https://basescan.org/tx/0x7b23c914e138a0f82df97e937d4013149dfb32b85a3c9b78e352ef238910b8cf',
      issuer: '0x71C8354366A96C2522778B27bF13fF1A3d596495',
      issuedAt: '2026-11-08T09:34:22Z',
      publicVerificationUrl: 'https://trustchain.audit/verify/TC-CERT-STR-8401',
    },
    {
      certificateId: 'TC-CERT-PUB-9912',
      title: 'The Sovereign Cryptographer Publication & Integrity Certificate',
      entityType: 'book',
      entityId: 'PUB-VERITAS-2026-01',
      sha256Hash: '7d793037a0760186574b0282f2f435e7b1e50774690f69799f9024f07f4ec9f1',
      onChainStatus: 'registered_onchain',
      txHash: '0x9b3f468dc26871a25785f0ef3524b07e7811bfceef0eef379d2df26c71a33719',
      chainId: 8453,
      chainName: 'Base (Coinbase L2)',
      blockNumber: 19843340,
      explorerUrl: 'https://basescan.org/tx/0x9b3f468dc26871a25785f0ef3524b07e7811bfceef0eef379d2df26c71a33719',
      issuer: '0x71C8354366A96C2522778B27bF13fF1A3d596495',
      issuedAt: '2026-11-09T14:18:45Z',
      publicVerificationUrl: 'https://trustchain.audit/verify/TC-CERT-PUB-9912',
    },
    {
      certificateId: 'TC-CERT-SC-5520',
      title: 'VaultStakingRewards.sol Smart Contract Audit Attestation',
      entityType: 'contract',
      entityId: 'audit-003',
      sha256Hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      onChainStatus: 'registered_onchain',
      txHash: '0x12a95c47814b2d35e802a4bf7e997f81ef6b2f6b3cf1714fa4189304918e77a1',
      chainId: 8453,
      chainName: 'Base (Coinbase L2)',
      blockNumber: 19846200,
      explorerUrl: 'https://basescan.org/tx/0x12a95c47814b2d35e802a4bf7e997f81ef6b2f6b3cf1714fa4189304918e77a1',
      issuer: '0x71C8354366A96C2522778B27bF13fF1A3d596495',
      issuedAt: '2026-11-10T08:04:12Z',
      publicVerificationUrl: 'https://trustchain.audit/verify/TC-CERT-SC-5520',
    },
  ],
  birSessions: [
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
  ],
  taxDeclarations: [
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
  ],
};

class DBManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    // Register seeded certificates into memory registry
    this.data.certificates.forEach((c) => {
      registerAuditCertificate({
        title: c.title,
        entityType: c.entityType,
        entityId: c.entityId,
        sha256Hash: c.sha256Hash,
        chainId: c.chainId,
        issuerAddress: c.issuer,
      });
    });
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.birSessions || parsed.birSessions.length === 0) {
          parsed.birSessions = initialData.birSessions;
        }
        if (!parsed.taxDeclarations || parsed.taxDeclarations.length === 0) {
          parsed.taxDeclarations = initialData.taxDeclarations;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing db file, initializing with defaults');
    }
    this.saveData(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist DB data:', e);
    }
  }

  public getAudits(): AuditRecord[] {
    return this.data.audits;
  }

  public getAuditById(id: string): AuditRecord | undefined {
    return this.data.audits.find((a) => a.id === id || a.auditNumber === id);
  }

  public addAudit(audit: AuditRecord): AuditRecord {
    this.data.audits.unshift(audit);
    this.saveData(this.data);
    return audit;
  }

  public getMovieRights(): MovieRightsRecord[] {
    return this.data.movieRights;
  }

  public addMovieRights(record: MovieRightsRecord): MovieRightsRecord {
    this.data.movieRights.unshift(record);
    this.saveData(this.data);
    return record;
  }

  public getPublishingRecords(): PublishingRecord[] {
    return this.data.publishingRecords;
  }

  public addPublishingRecord(record: PublishingRecord): PublishingRecord {
    this.data.publishingRecords.unshift(record);
    this.saveData(this.data);
    return record;
  }

  public getCertificates(): BlockchainCertificate[] {
    return this.data.certificates;
  }

  public addCertificate(cert: BlockchainCertificate): BlockchainCertificate {
    this.data.certificates.unshift(cert);
    this.saveData(this.data);
    return cert;
  }

  // --- BIR TAX AUDITOR SESSIONS ---
  public getBirSessions(): BirAuditorPasscodeSession[] {
    if (!this.data.birSessions) this.data.birSessions = [];
    return this.data.birSessions;
  }

  public createBirSession(session: BirAuditorPasscodeSession): BirAuditorPasscodeSession {
    if (!this.data.birSessions) this.data.birSessions = [];
    this.data.birSessions.unshift(session);
    this.saveData(this.data);
    return session;
  }

  /**
   * Validates the assigned BIR Auditor's passcode/OTP.
   * If valid: immediately burns/expires the passcode after this use for security reasons!
   */
  public validateAndBurnBirPasscode(rawPasscode: string): {
    success: boolean;
    session?: BirAuditorPasscodeSession;
    error?: string;
  } {
    if (!this.data.birSessions) this.data.birSessions = [];
    const cleanPass = rawPasscode.trim().toUpperCase();

    const session = this.data.birSessions.find(
      (s) => s.passcode.toUpperCase() === cleanPass || s.sessionId === cleanPass
    );

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
      this.saveData(this.data);
      return {
        success: false,
        error: 'Security Alert: This BIR Auditor passcode has expired due to timeout. Passwords expire after 15 minutes of inactivity.',
      };
    }

    // Immediately BURN the single-use passcode!
    session.isUsed = true;
    session.status = 'EXPIRED_USED';
    session.usedAt = new Date().toISOString();
    this.saveData(this.data);

    return {
      success: true,
      session,
    };
  }

  // --- PAID SUBSCRIPTION TAX DECLARATIONS ---
  public getTaxDeclarations(): PaidSubscriptionTaxDeclaration[] {
    if (!this.data.taxDeclarations) this.data.taxDeclarations = [];
    return this.data.taxDeclarations;
  }

  public getTaxDeclarationById(id: string): PaidSubscriptionTaxDeclaration | undefined {
    if (!this.data.taxDeclarations) this.data.taxDeclarations = [];
    return this.data.taxDeclarations.find(
      (d) => d.id === id || d.declarationNumber === id || d.birDocumentTrackingNumber === id
    );
  }

  public addTaxDeclaration(declaration: PaidSubscriptionTaxDeclaration): PaidSubscriptionTaxDeclaration {
    if (!this.data.taxDeclarations) this.data.taxDeclarations = [];
    this.data.taxDeclarations.unshift(declaration);
    this.saveData(this.data);
    return declaration;
  }
}

export const db = new DBManager();

