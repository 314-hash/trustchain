// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title TrustChainEvidenceRegistry
 * @dev Immutable on-chain evidence & audit attestation registry for
 *      streaming platforms, e-book publishers, and smart contracts.
 *      Anchored on Base (Coinbase L2) / EVM networks.
 */
contract TrustChainEvidenceRegistry {
    address public immutable owner;

    // Authorized auditor accounts permitted to record attestations
    mapping(address => bool) public isAuthorizedAuditor;

    struct AuditAttestation {
        bytes32 evidenceHash; // SHA-256 hash of the audit findings & scope
        string auditNumber;   // Human-readable identifier e.g. "TC-AUD-2026-001"
        string projectName;   // Name of audited platform or contract
        uint8 score;          // Security score (0 - 100)
        string category;      // "streaming", "publishing", "smart_contract", "web3_app"
        uint256 timestamp;    // Block timestamp of audit completion
        address auditor;      // Public address of the auditor
        bool verified;
    }

    struct ContentCertificate {
        bytes32 contentFileHash; // SHA-256 hash of manuscript, film master, or license
        string certificateId;    // e.g. "TC-CERT-PUB-9912"
        string entityType;       // "movie", "book", "contract"
        string title;            // Title of movie or book
        uint256 timestamp;       // Block timestamp
        address publisher;       // Address that published/submitted
        bool active;
    }

    // Mapping from evidenceHash to AuditAttestation
    mapping(bytes32 => AuditAttestation) private _audits;
    // Mapping from auditNumber to evidenceHash
    mapping(string => bytes32) private _auditNumberToHash;

    // Mapping from contentFileHash to ContentCertificate
    mapping(bytes32 => ContentCertificate) private _certificates;
    // Mapping from certificateId to contentFileHash
    mapping(string => bytes32) private _certIdToHash;

    // Total counts
    uint256 public totalAuditsRegistered;
    uint256 public totalCertificatesIssued;

    // Events for block explorers and public indexing
    event AuditRegistered(
        bytes32 indexed evidenceHash,
        string indexed auditNumber,
        string projectName,
        uint8 score,
        address indexed auditor,
        uint256 timestamp
    );

    event CertificateIssued(
        bytes32 indexed contentFileHash,
        string indexed certificateId,
        string entityType,
        string title,
        address indexed publisher,
        uint256 timestamp
    );

    event AuditorPermissionUpdated(address indexed auditor, bool authorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry owner can call this");
        _;
    }

    modifier onlyAuditor() {
        require(
            msg.sender == owner || isAuthorizedAuditor[msg.sender],
            "Unauthorized auditor address"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        isAuthorizedAuditor[msg.sender] = true;
    }

    /**
     * @notice Register an immutable audit attestation
     */
    function registerAudit(
        bytes32 evidenceHash,
        string calldata auditNumber,
        string calldata projectName,
        uint8 score,
        string calldata category
    ) external onlyAuditor {
        require(evidenceHash != bytes32(0), "Invalid evidence hash");
        require(bytes(auditNumber).length > 0, "Audit number required");
        require(_audits[evidenceHash].timestamp == 0, "Audit already registered with this hash");

        _audits[evidenceHash] = AuditAttestation({
            evidenceHash: evidenceHash,
            auditNumber: auditNumber,
            projectName: projectName,
            score: score,
            category: category,
            timestamp: block.timestamp,
            auditor: msg.sender,
            verified: true
        });

        _auditNumberToHash[auditNumber] = evidenceHash;
        totalAuditsRegistered++;

        emit AuditRegistered(
            evidenceHash,
            auditNumber,
            projectName,
            score,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Register a tamper-evident content publication or movie rights certificate
     * @dev Zero-knowledge principle: Only SHA-256 file hash is stored on-chain.
     */
    function registerCertificate(
        bytes32 contentFileHash,
        string calldata certificateId,
        string calldata entityType,
        string calldata title
    ) external onlyAuditor {
        require(contentFileHash != bytes32(0), "Invalid content hash");
        require(bytes(certificateId).length > 0, "Certificate ID required");
        require(_certificates[contentFileHash].timestamp == 0, "Certificate already exists for this hash");

        _certificates[contentFileHash] = ContentCertificate({
            contentFileHash: contentFileHash,
            certificateId: certificateId,
            entityType: entityType,
            title: title,
            timestamp: block.timestamp,
            publisher: msg.sender,
            active: true
        });

        _certIdToHash[certificateId] = contentFileHash;
        totalCertificatesIssued++;

        emit CertificateIssued(
            contentFileHash,
            certificateId,
            entityType,
            title,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Public verification: check if a file hash matches an issued certificate
     */
    function verifyContentHash(bytes32 contentFileHash)
        external
        view
        returns (
            bool exists,
            string memory certificateId,
            string memory entityType,
            string memory title,
            uint256 timestamp,
            address publisher
        )
    {
        ContentCertificate memory cert = _certificates[contentFileHash];
        if (cert.timestamp == 0) {
            return (false, "", "", "", 0, address(0));
        }
        return (
            true,
            cert.certificateId,
            cert.entityType,
            cert.title,
            cert.timestamp,
            cert.publisher
        );
    }

    /**
     * @notice Public verification: query audit record by audit ID
     */
    function getAuditByNumber(string calldata auditNumber)
        external
        view
        returns (
            bool exists,
            bytes32 evidenceHash,
            string memory projectName,
            uint8 score,
            string memory category,
            uint256 timestamp,
            address auditor
        )
    {
        bytes32 hash = _auditNumberToHash[auditNumber];
        if (hash == bytes32(0)) {
            return (false, bytes32(0), "", 0, "", 0, address(0));
        }
        AuditAttestation memory audit = _audits[hash];
        return (
            true,
            audit.evidenceHash,
            audit.projectName,
            audit.score,
            audit.category,
            audit.timestamp,
            audit.auditor
        );
    }

    /**
     * @notice Manage auditor permissions
     */
    function setAuditorAuthorization(address auditor, bool authorized) external onlyOwner {
        isAuthorizedAuditor[auditor] = authorized;
        emit AuditorPermissionUpdated(auditor, authorized);
    }
}

