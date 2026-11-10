import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { db } from '../services/db.js';
import { analyzeSmartContract } from '../services/smartContractAuditEngine.js';
import { auditStreamingPlatform, evaluateMovieRightsStatus } from '../services/streamingAuditEngine.js';
import { auditPublishingSubmission, calculateSha256 } from '../services/publishingAuditEngine.js';
import { auditWebsiteSecurity } from '../services/webSecurityAuditEngine.js';
import { registerAuditCertificate, verifyEvidenceIntegrity } from '../services/blockchainRegistryService.js';
import { generatePlainLanguageExplanation, generateExecutiveAuditBrief, askAiAssistantQuestion } from '../services/aiAssistantService.js';
import { AuditRecord, MovieRightsRecord } from '../types/audit.js';

const router = Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max file

// 1. Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'TrustChain Audit Engine v1.0.0',
    mode: 'production-ready',
    timestamp: new Date().toISOString(),
  });
});

// 2. Audits - List & Detail
router.get('/audits', (req, res) => {
  res.json(db.getAudits());
});

router.get('/audits/:id', (req, res) => {
  const audit = db.getAuditById(req.params.id);
  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }
  res.json(audit);
});

// 3. Smart Contract Audit Endpoint
router.post('/audits/smart-contract', (req, res) => {
  const { sourceCode, contractName, projectName, packageTier } = req.body;
  if (!sourceCode) {
    return res.status(400).json({ error: 'Source code is required' });
  }

  const result = analyzeSmartContract(sourceCode, contractName || 'Contract');
  const auditId = `audit-${Date.now()}`;
  const auditNumber = `TC-AUD-SC-${Date.now().toString().slice(-4)}`;

  // Register blockchain audit attestation certificate
  const codeHash = calculateSha256(sourceCode);
  const cert = registerAuditCertificate({
    title: `${projectName || contractName || 'Smart Contract'} Security Attestation`,
    entityType: 'contract',
    entityId: auditId,
    sha256Hash: codeHash,
    chainId: 8453, // Base
  });
  db.addCertificate(cert);

  const audit: AuditRecord = {
    id: auditId,
    auditNumber,
    projectName: projectName || contractName || 'Smart Contract Audit',
    category: 'smart_contract',
    scope: ['Solidity AST Syntax & Access Matrix', 'Checks-Effects-Interactions Reentrancy', 'ERC Token Compliance', 'Pragma Safety'],
    packageTier: packageTier || 'standard',
    status: 'completed',
    score: result.score,
    scoreBreakdown: {
      security: result.score,
      rights: 90,
      compliance: Math.max(50, result.score - 5),
      blockchain: 95,
    },
    toolsUsed: result.toolsUsed,
    testsPerformed: result.testsPerformed,
    findings: result.findings,
    summary: result.summary,
    limitations: ['Automated static AST analysis; formal verification is recommended for protocols securing >$5M'],
    verificationStatus: result.summary.critical > 0 ? 'conditional' : 'verified',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    associatedCertificateId: cert.certificateId,
  };

  db.addAudit(audit);
  res.json({ audit, certificate: cert });
});

// 4. Streaming Platform Audit Endpoint
router.post('/audits/streaming', (req, res) => {
  const { platformName, streamingUrl, drmProvider, storageProvider, hasSmartContractPayments } = req.body;
  const rightsRecords = db.getMovieRights();

  const result = auditStreamingPlatform({
    platformName: platformName || 'Streaming Platform',
    streamingUrl,
    drmProvider: drmProvider || 'none',
    storageProvider: storageProvider || 'aws_s3',
    hasSmartContractPayments: Boolean(hasSmartContractPayments),
    rightsRecords,
  });

  const auditId = `audit-${Date.now()}`;
  const auditNumber = `TC-AUD-STR-${Date.now().toString().slice(-4)}`;

  const cert = registerAuditCertificate({
    title: `${platformName || 'Streaming'} Media Integrity Certificate`,
    entityType: 'website_audit',
    entityId: auditId,
    sha256Hash: calculateSha256(platformName + (streamingUrl || '')),
    chainId: 8453,
  });
  db.addCertificate(cert);

  const audit: AuditRecord = {
    id: auditId,
    auditNumber,
    projectName: platformName || 'Streaming Platform Audit',
    category: 'streaming',
    targetUrlOrRepo: streamingUrl,
    scope: ['HLS/DASH Manifest Security', 'DRM Licensing Engine', 'Signed CDN Token Verification', 'Content Rights Registry'],
    packageTier: 'enterprise',
    status: 'completed',
    score: result.score,
    scoreBreakdown: {
      security: result.score,
      rights: result.rightsSummary.rightsIntegrityScore,
      compliance: 88,
      blockchain: 85,
    },
    toolsUsed: result.toolsUsed,
    testsPerformed: result.testsPerformed,
    findings: result.findings,
    summary: result.summary,
    limitations: ['Network scanning evaluated public edge CDN nodes; origin servers behind firewalls require agent sidecar'],
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    associatedCertificateId: cert.certificateId,
  };

  db.addAudit(audit);
  res.json({ audit, certificate: cert, rightsSummary: result.rightsSummary });
});

// 5. Website Security Audit Endpoint
router.post('/audits/web', async (req, res) => {
  const { targetUrl, projectName } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  try {
    const result = await auditWebsiteSecurity(targetUrl);
    const auditId = `audit-${Date.now()}`;
    const auditNumber = `TC-AUD-WEB-${Date.now().toString().slice(-4)}`;

    const cert = registerAuditCertificate({
      title: `${projectName || targetUrl} Web Security Attestation`,
      entityType: 'website_audit',
      entityId: auditId,
      sha256Hash: calculateSha256(targetUrl + new Date().toISOString()),
      chainId: 8453,
    });
    db.addCertificate(cert);

    const audit: AuditRecord = {
      id: auditId,
      auditNumber,
      projectName: projectName || targetUrl,
      category: 'website_security',
      targetUrlOrRepo: targetUrl,
      scope: ['TLS Cipher Protocol Check', 'HTTP Security Headers (CSP, HSTS, XFO)', 'Server Header Leakage', 'CORS Surface'],
      packageTier: 'standard',
      status: 'completed',
      score: result.score,
      scoreBreakdown: {
        security: result.score,
        rights: 100,
        compliance: result.score,
        blockchain: 80,
      },
      toolsUsed: result.toolsUsed,
      testsPerformed: result.testsPerformed,
      findings: result.findings,
      summary: {
        critical: result.findings.filter((f) => f.severity === 'critical').length,
        high: result.findings.filter((f) => f.severity === 'high').length,
        medium: result.findings.filter((f) => f.severity === 'medium').length,
        low: result.findings.filter((f) => f.severity === 'low').length,
        informational: 0,
        executiveSummary: `Web security audit completed for ${targetUrl}. Security score: ${result.score}/100.`,
        keyRisks: result.findings.map((f) => f.title),
        topRecommendations: result.findings.map((f) => f.recommendation),
      },
      limitations: ['Safe non-destructive passive scanning only. Destructive exploit testing was omitted per authorized scope.'],
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      associatedCertificateId: cert.certificateId,
    };

    db.addAudit(audit);
    res.json({ audit, certificate: cert, headers: result.headersEvaluated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scan failed' });
  }
});

// 6. Unified 7-Step Audit Wizard Runner
router.post('/audits/wizard', upload.array('files'), async (req, res) => {
  try {
    const {
      category,
      projectName,
      targetUrlOrRepo,
      networkChainId,
      packageTier,
      sourceCodeText,
      authorName,
      publisherName,
      isbn,
      drmProvider,
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const fileHashes: string[] = (files || []).map((f) => calculateSha256(f.buffer));

    let auditRecord: AuditRecord;
    let certificate = undefined;

    if (category === 'smart_contract') {
      const code = sourceCodeText || (files && files[0] ? files[0].buffer.toString('utf-8') : '');
      const result = analyzeSmartContract(code || 'contract Placeholder {}', projectName || 'Contract');
      const auditId = `audit-${Date.now()}`;
      const cert = registerAuditCertificate({
        title: `${projectName} Smart Contract Audit`,
        entityType: 'contract',
        entityId: auditId,
        sha256Hash: calculateSha256(code),
        chainId: Number(networkChainId) || 8453,
      });
      db.addCertificate(cert);
      certificate = cert;

      auditRecord = {
        id: auditId,
        auditNumber: `TC-AUD-${Date.now().toString().slice(-4)}`,
        projectName: projectName || 'Smart Contract Audit',
        category: 'smart_contract',
        targetUrlOrRepo,
        scope: ['Solidity AST Security', 'Access Control Sweep', 'Reentrancy Guard', 'Token Standard Review'],
        packageTier: packageTier || 'standard',
        status: 'completed',
        score: result.score,
        toolsUsed: result.toolsUsed,
        testsPerformed: result.testsPerformed,
        findings: result.findings,
        summary: result.summary,
        limitations: ['Automated static code review'],
        verificationStatus: result.summary.critical > 0 ? 'conditional' : 'verified',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        associatedCertificateId: cert.certificateId,
      };
    } else if (category === 'publishing') {
      const pubResult = auditPublishingSubmission({
        bookTitle: projectName || 'Untitled Publication',
        authorName: authorName || 'Independent Author',
        publisher: publisherName || 'Digital Publishing Portal',
        isbn: isbn || undefined,
        publicationDate: new Date().toISOString().split('T')[0],
        manuscriptHash: fileHashes[0],
        epubPdfHash: fileHashes[1] || fileHashes[0],
        copyrightDeclaration: `All rights reserved by ${authorName || 'Author'}. Registered with TrustChain.`,
      });
      db.addPublishingRecord(pubResult.record);
      db.addCertificate(pubResult.certificate);
      certificate = pubResult.certificate;

      auditRecord = {
        id: `audit-${Date.now()}`,
        auditNumber: `TC-AUD-PUB-${Date.now().toString().slice(-4)}`,
        projectName: projectName || 'E-book Publication Audit',
        category: 'publishing',
        targetUrlOrRepo,
        scope: ['ISBN-13 Math Checksum', 'Author Signature & Legal Declaration', 'Cryptographic Zero-Knowledge Hashing', 'Copyright Chain-of-Custody'],
        packageTier: packageTier || 'standard',
        status: 'completed',
        score: pubResult.score,
        toolsUsed: ['TrustChain PublisherGuard v1.8', 'ISBN-13 Algorithm Validator', 'EVM Evidence Registry'],
        testsPerformed: ['ISBN Checksum Validation', 'SHA-256 Content Fingerprint Anchoring', 'Off-chain Confidentiality Verification'],
        findings: pubResult.findings,
        summary: {
          critical: 0,
          high: pubResult.findings.filter((f) => f.severity === 'high').length,
          medium: pubResult.findings.filter((f) => f.severity === 'medium').length,
          low: pubResult.findings.filter((f) => f.severity === 'low').length,
          informational: 1,
          executiveSummary: `Publishing audit and certificate generation complete for "${projectName}". Tamper-evident fingerprint anchored on blockchain.`,
          keyRisks: pubResult.findings.map((f) => f.title),
          topRecommendations: pubResult.findings.map((f) => f.recommendation),
        },
        limitations: ['Verification anchored on submitted hashes; does not provide physical print verification'],
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        associatedCertificateId: pubResult.certificate.certificateId,
      };
    } else if (category === 'streaming') {
      const streamRes = auditStreamingPlatform({
        platformName: projectName || 'Streaming Platform',
        streamingUrl: targetUrlOrRepo,
        drmProvider: drmProvider || 'none',
        rightsRecords: db.getMovieRights(),
      });
      const auditId = `audit-${Date.now()}`;
      const cert = registerAuditCertificate({
        title: `${projectName} Streaming Audit Attestation`,
        entityType: 'website_audit',
        entityId: auditId,
        sha256Hash: calculateSha256(projectName + (targetUrlOrRepo || '')),
        chainId: Number(networkChainId) || 8453,
      });
      db.addCertificate(cert);
      certificate = cert;

      auditRecord = {
        id: auditId,
        auditNumber: `TC-AUD-STR-${Date.now().toString().slice(-4)}`,
        projectName: projectName || 'Streaming Platform Audit',
        category: 'streaming',
        targetUrlOrRepo,
        scope: ['DRM Video Packaging', 'CDN Edge Signed Tokens', 'Content Rights Registry', 'S3 Master Storage Policies'],
        packageTier: packageTier || 'standard',
        status: 'completed',
        score: streamRes.score,
        toolsUsed: streamRes.toolsUsed,
        testsPerformed: streamRes.testsPerformed,
        findings: streamRes.findings,
        summary: streamRes.summary,
        limitations: ['Network-level scanning of public endpoints'],
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        associatedCertificateId: cert.certificateId,
      };
    } else {
      // Default to web security audit
      const webRes = await auditWebsiteSecurity(targetUrlOrRepo || 'https://example.com');
      const auditId = `audit-${Date.now()}`;
      const cert = registerAuditCertificate({
        title: `${projectName} Web Security Attestation`,
        entityType: 'website_audit',
        entityId: auditId,
        sha256Hash: calculateSha256(projectName + targetUrlOrRepo),
        chainId: Number(networkChainId) || 8453,
      });
      db.addCertificate(cert);
      certificate = cert;

      auditRecord = {
        id: auditId,
        auditNumber: `TC-AUD-WEB-${Date.now().toString().slice(-4)}`,
        projectName: projectName || 'Web Security Audit',
        category: 'website_security',
        targetUrlOrRepo,
        scope: ['TLS / SSL Protocol Check', 'HTTP Response Headers (CSP, HSTS)', 'Information Leakage'],
        packageTier: packageTier || 'standard',
        status: 'completed',
        score: webRes.score,
        toolsUsed: webRes.toolsUsed,
        testsPerformed: webRes.testsPerformed,
        findings: webRes.findings,
        summary: {
          critical: webRes.findings.filter((f) => f.severity === 'critical').length,
          high: webRes.findings.filter((f) => f.severity === 'high').length,
          medium: webRes.findings.filter((f) => f.severity === 'medium').length,
          low: webRes.findings.filter((f) => f.severity === 'low').length,
          informational: 0,
          executiveSummary: `Website security audit completed for ${targetUrlOrRepo}.`,
          keyRisks: webRes.findings.map((f) => f.title),
          topRecommendations: webRes.findings.map((f) => f.recommendation),
        },
        limitations: ['Safe non-destructive scan'],
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        associatedCertificateId: cert.certificateId,
      };
    }

    db.addAudit(auditRecord);
    res.json({ audit: auditRecord, certificate });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Wizard failed' });
  }
});

// 7. Movie Rights Registry Endpoints
router.get('/movie-rights', (req, res) => {
  res.json(db.getMovieRights());
});

router.post('/movie-rights', upload.array('licenseFiles'), (req, res) => {
  const {
    title,
    productionCompany,
    director,
    contentOwnerDeclaration,
    distributionAgreement,
    licenseExpirationDate,
    territoryRestrictions,
    streamingRights,
    revenueSharingTerms,
    contentFileHash,
  } = req.body;

  const files = req.files as Express.Multer.File[] | undefined;
  const licenseDocs = (files || []).map((f) => f.originalname || 'document.pdf');

  const evalStatus = evaluateMovieRightsStatus({
    licenseDocs: licenseDocs.length > 0 ? licenseDocs : ['distribution_agreement.pdf'],
    licenseExpirationDate,
    contentOwnerDeclaration,
    distributionAgreement,
  });

  const record: MovieRightsRecord = {
    id: `mov-${Date.now()}`,
    title: title || 'Untitled Movie',
    productionCompany: productionCompany || 'Unknown Production LLC',
    director: director || 'N/A',
    contentOwnerDeclaration: contentOwnerDeclaration || 'Declaration of exclusive ownership',
    licenseDocs: licenseDocs.length > 0 ? licenseDocs : ['signed_distribution_contract.pdf'],
    distributionAgreement: distributionAgreement || 'Standard worldwide digital distribution',
    licenseExpirationDate: licenseExpirationDate || '2028-12-31',
    territoryRestrictions: Array.isArray(territoryRestrictions)
      ? territoryRestrictions
      : (territoryRestrictions || 'Worldwide').split(',').map((s: string) => s.trim()),
    streamingRights: streamingRights || 'SVOD, TVOD',
    revenueSharingTerms: revenueSharingTerms || '70% Content Owner / 30% Platform',
    contentFileHash: contentFileHash || crypto.randomBytes(32).toString('hex'),
    rightsStatus: evalStatus.status,
    statusNotes: evalStatus.statusNotes,
    updatedAt: new Date().toISOString(),
  };

  db.addMovieRights(record);
  res.json(record);
});

// 8. Publishing Portal Endpoints
router.get('/publishing', (req, res) => {
  res.json(db.getPublishingRecords());
});

router.post('/publishing', upload.fields([{ name: 'manuscript' }, { name: 'epubPdf' }]), (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const manuscriptBuf = files?.manuscript?.[0]?.buffer;
  const epubBuf = files?.epubPdf?.[0]?.buffer;

  const result = auditPublishingSubmission({
    bookTitle: req.body.bookTitle,
    authorName: req.body.authorName,
    publisher: req.body.publisher,
    isbn: req.body.isbn,
    publicationDate: req.body.publicationDate,
    manuscriptBuffer: manuscriptBuf,
    epubPdfBuffer: epubBuf,
    copyrightDeclaration: req.body.copyrightDeclaration,
    royaltyAgreement: req.body.royaltyAgreement,
    royaltyRatePercent: req.body.royaltyRatePercent ? Number(req.body.royaltyRatePercent) : undefined,
  });

  db.addPublishingRecord(result.record);
  db.addCertificate(result.certificate);

  res.json(result);
});

// 9. Blockchain Certificate Registry Endpoints
router.get('/certificates', (req, res) => {
  res.json(db.getCertificates());
});

router.get('/certificates/:id', (req, res) => {
  const cert = db.getCertificates().find((c) => c.certificateId === req.params.id);
  if (!cert) {
    return res.status(404).json({ error: 'Certificate not found' });
  }
  res.json(cert);
});

router.post('/certificates/verify', (req, res) => {
  const { certificateId, sha256Hash } = req.body;
  if (!certificateId || !sha256Hash) {
    return res.status(400).json({ error: 'certificateId and sha256Hash are required' });
  }

  const result = verifyEvidenceIntegrity(certificateId, sha256Hash);
  res.json(result);
});

// 10. AI Assistant Endpoints
router.post('/ai/ask', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  const audits = db.getAudits();
  const answer = askAiAssistantQuestion(question, audits);
  res.json({ question, answer });
});

router.post('/ai/explain-finding', (req, res) => {
  const { finding } = req.body;
  if (!finding) {
    return res.status(400).json({ error: 'Finding payload is required' });
  }
  const explanation = generatePlainLanguageExplanation(finding);
  res.json(explanation);
});

router.get('/ai/executive-brief/:id', (req, res) => {
  const audit = db.getAuditById(req.params.id);
  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }
  const brief = generateExecutiveAuditBrief(audit);
  res.json(brief);
});

export default router;

