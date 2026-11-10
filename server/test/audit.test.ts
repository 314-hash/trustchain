import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSmartContract } from '../src/services/smartContractAuditEngine.js';
import { auditStreamingPlatform, evaluateMovieRightsStatus } from '../src/services/streamingAuditEngine.js';
import { validateISBN, auditPublishingSubmission, calculateSha256 } from '../src/services/publishingAuditEngine.js';
import { registerAuditCertificate, verifyEvidenceIntegrity } from '../src/services/blockchainRegistryService.js';
import { generatePlainLanguageExplanation, askAiAssistantQuestion } from '../src/services/aiAssistantService.js';
import {
  requestTempestAssessment,
  redactSensitiveData,
  retestFinding,
  abortMission,
} from '../src/services/tempestAdapter.js';

test('Smart Contract Engine detects reentrancy and tx.origin vulnerabilities', () => {
  const vulnerableSolidity = `
    pragma solidity ^0.8.20;
    contract TestVault {
      mapping(address => uint256) balances;
      address owner;
      function withdraw(uint256 amount) public {
        (bool s, ) = msg.sender.call{value: amount}("");
        balances[msg.sender] -= amount;
      }
      function changeOwner(address n) public {
        require(tx.origin == owner);
        owner = n;
      }
    }
  `;

  const result = analyzeSmartContract(vulnerableSolidity, 'TestVault');
  assert.ok(result.findings.length >= 2, 'Should find at least reentrancy and tx.origin');
  
  const reentrancyFinding = result.findings.find(f => f.category.includes('Reentrancy'));
  assert.ok(reentrancyFinding, 'Reentrancy finding should be present');
  assert.equal(reentrancyFinding?.severity, 'critical');

  const txOriginFinding = result.findings.find(f => f.title.includes('tx.origin'));
  assert.ok(txOriginFinding, 'tx.origin finding should be present');
  assert.equal(txOriginFinding?.severity, 'high');
});

test('Smart Contract Engine approves safe checks-effects-interactions code', () => {
  const safeSolidity = `
    pragma solidity 0.8.24;
    import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
    contract SafeVault is ReentrancyGuard {
      mapping(address => uint256) balances;
      address owner;
      function withdraw(uint256 amount) external nonReentrant {
        require(msg.sender == owner, "Only owner");
        balances[msg.sender] -= amount;
        (bool s, ) = msg.sender.call{value: amount}("");
        require(s);
      }
    }
  `;

  const result = analyzeSmartContract(safeSolidity, 'SafeVault');
  assert.ok(result.score >= 80, 'Score should be high for safe contract');
});

test('Streaming Platform Engine flags unencrypted streams without DRM', () => {
  const result = auditStreamingPlatform({
    platformName: 'TestStream',
    streamingUrl: 'https://teststream.io/hls/live.m3u8',
    drmProvider: 'none',
  });

  const drmFinding = result.findings.find(f => f.category.includes('DRM'));
  assert.ok(drmFinding, 'Should flag missing DRM');
  assert.equal(drmFinding?.severity, 'high');
});

test('Movie Rights Evaluation correctly detects expired licenses', () => {
  const expiredStatus = evaluateMovieRightsStatus({
    licenseDocs: ['distro.pdf'],
    licenseExpirationDate: '2020-01-01',
    contentOwnerDeclaration: 'Declared',
    distributionAgreement: 'Agreed',
  });

  assert.equal(expiredStatus.status, 'expired_license');
});

test('Publishing Engine validates ISBN-10 and ISBN-13 checksums', () => {
  const valid13 = validateISBN('978-0-13-468599-1');
  assert.equal(valid13.isValid, true);
  assert.equal(valid13.type, 'ISBN-13');

  const invalid13 = validateISBN('978-0-13-468599-9');
  assert.equal(invalid13.isValid, false);

  const valid10 = validateISBN('0-306-40615-2');
  assert.equal(valid10.isValid, true);
  assert.equal(valid10.type, 'ISBN-10');
});

test('Blockchain Registry anchors certificates and validates SHA-256 integrity', () => {
  const sampleData = 'Confidential Digital Master Manuscript';
  const sha = calculateSha256(sampleData);

  const cert = registerAuditCertificate({
    title: 'Test Digital Master Publication',
    entityType: 'book',
    entityId: 'pub-test-01',
    sha256Hash: sha,
    chainId: 8453,
  });

  assert.ok(cert.certificateId.startsWith('TC-CERT-'));
  assert.equal(cert.sha256Hash, sha);

  // Exact match
  const matchResult = verifyEvidenceIntegrity(cert.certificateId, sha);
  assert.equal(matchResult.verified, true);
  assert.equal(matchResult.match, true);

  // Tampered mismatch
  const tamperedSha = calculateSha256(sampleData + ' (tampered by pirate)');
  const mismatchResult = verifyEvidenceIntegrity(cert.certificateId, tamperedSha);
  assert.equal(mismatchResult.verified, true);
  assert.equal(mismatchResult.match, false);
});

test('AI Assistant provides grounded plain-language explanations', () => {
  const explanation = generatePlainLanguageExplanation({
    id: 'FIND-1',
    title: 'Broken Access Control',
    severity: 'critical',
    affectedAsset: 'Vault.sol',
    plainLanguageExplanation: 'An ordinary user may access functions intended only for administrators.',
    technicalDetails: 'Function withdraw() lacks onlyOwner modifier.',
    recommendation: 'Add onlyOwner modifier.',
    category: 'Access Control',
    resolved: false,
  });

  assert.ok(explanation.nonTechnicalSummary.length > 10);
  assert.ok(explanation.stepByStepAction.length > 0);
  assert.equal(explanation.forAudience.developer.includes('onlyOwner'), true);

  const answer = askAiAssistantQuestion('What is a reentrancy attack?', []);
  assert.ok(answer.toLowerCase().includes('reentrancy'));
});

test('T3MP3ST Adapter enforces mandatory authorization and safety gates', async () => {
  // Test 1: Reject wildcard targets
  await assert.rejects(
    async () => {
      await requestTempestAssessment({
        assetType: 'website',
        target: '*',
        profile: 'basic',
        authorization: {
          confirmedOwnership: true,
          authorizedBy: 'Operator',
          approvedScope: ['*'],
          rulesOfEngagement: 'Testing',
          targetEnvironment: 'staging',
        },
      });
    },
    /Wildcard target authorization/
  );

  // Test 2: Reject unconfirmed ownership
  await assert.rejects(
    async () => {
      await requestTempestAssessment({
        assetType: 'website',
        target: 'https://unauthorized-target.com',
        profile: 'basic',
        authorization: {
          confirmedOwnership: false,
          authorizedBy: 'Operator',
          approvedScope: [],
          rulesOfEngagement: '',
          targetEnvironment: 'production',
        },
      });
    },
    /AUTHORIZATION REQUIRED/
  );

  // Test 3: Reject active advanced profile on production
  await assert.rejects(
    async () => {
      await requestTempestAssessment({
        assetType: 'website',
        target: 'https://production-target.com',
        profile: 'advanced',
        authorization: {
          confirmedOwnership: true,
          authorizedBy: 'Operator',
          approvedScope: ['https://production-target.com'],
          rulesOfEngagement: 'Active',
          targetEnvironment: 'production',
        },
      });
    },
    /prohibited against live production/
  );
});

test('T3MP3ST Adapter performs safe assessment, redacts secrets, and retests findings', async () => {
  // Secret redaction verification
  const dirtyLog = 'Auth header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supersecrettoken API_KEY: ak_live_981247192847192847';
  const scrubbed = redactSensitiveData(dirtyLog);
  assert.ok(!scrubbed.includes('supersecrettoken'));
  assert.ok(!scrubbed.includes('ak_live_981247192847192847'));
  assert.ok(scrubbed.includes('[REDACTED_BEARER_TOKEN]'));

  // Run authorized assessment on staging
  const mission = await requestTempestAssessment({
    assetType: 'streaming_platform',
    target: 'http://staging.stream.cineflix.io',
    profile: 'standard',
    authorization: {
      confirmedOwnership: true,
      authorizedBy: 'Chief Security Officer',
      approvedScope: ['http://staging.stream.cineflix.io'],
      rulesOfEngagement: 'Safe, non-destructive streaming audit',
      targetEnvironment: 'staging',
    },
  });

  assert.equal(mission.status, 'completed');
  assert.ok(mission.findings.length > 0);
  assert.ok(mission.safetyAuditLog.length >= 4);

  // Verify finding has reproducible evidence & tool version
  const finding = mission.findings[0];
  assert.ok(finding.tool.includes('T3MP3ST'));
  assert.ok(finding.evidence.length > 0);
  assert.equal(finding.retestStatus, 'untested');

  // Retest verification
  const retestResult = retestFinding(mission.missionId, finding.id);
  assert.equal(retestResult.retested, true);
  assert.equal(retestResult.status, 'verified_repaired');
});
