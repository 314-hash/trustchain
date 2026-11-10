-- TRUSTCHAIN AUDIT DATABASE SCHEMA
-- PostgreSQL 14+ Production Migration

CREATE TABLE IF NOT EXISTS audits (
    id VARCHAR(64) PRIMARY KEY,
    audit_number VARCHAR(64) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    target_url_or_repo TEXT,
    scope JSONB NOT NULL DEFAULT '[]'::jsonb,
    package_tier VARCHAR(32) NOT NULL DEFAULT 'standard',
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    score_breakdown JSONB,
    tools_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    tests_performed JSONB NOT NULL DEFAULT '[]'::jsonb,
    findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'unverified',
    associated_certificate_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS movie_rights (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    production_company VARCHAR(255) NOT NULL,
    director VARCHAR(255),
    content_owner_declaration TEXT NOT NULL,
    license_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
    distribution_agreement TEXT NOT NULL,
    license_expiration_date DATE,
    territory_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
    streaming_rights VARCHAR(128) NOT NULL,
    revenue_sharing_terms TEXT NOT NULL,
    content_file_hash VARCHAR(64) NOT NULL,
    rights_status VARCHAR(64) NOT NULL DEFAULT 'pending',
    status_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publishing_records (
    id VARCHAR(64) PRIMARY KEY,
    publication_id VARCHAR(64) UNIQUE NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    isbn VARCHAR(32),
    publication_date DATE,
    manuscript_hash VARCHAR(64) NOT NULL,
    epub_pdf_hash VARCHAR(64) NOT NULL,
    copyright_declaration TEXT NOT NULL,
    licensing_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    royalty_agreement TEXT,
    royalty_rate_percent NUMERIC(5,2) DEFAULT 70.00,
    content_integrity_verified BOOLEAN DEFAULT TRUE,
    blockchain_tx_hash VARCHAR(66),
    certificate_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blockchain_certificates (
    certificate_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    on_chain_status VARCHAR(32) NOT NULL DEFAULT 'registered_onchain',
    tx_hash VARCHAR(66),
    chain_id INTEGER NOT NULL,
    chain_name VARCHAR(128) NOT NULL,
    block_number BIGINT,
    explorer_url TEXT,
    issuer VARCHAR(64) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    public_verification_url TEXT NOT NULL
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_audits_category ON audits(category);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_movie_rights_hash ON movie_rights(content_file_hash);
CREATE INDEX IF NOT EXISTS idx_movie_rights_status ON movie_rights(rights_status);
CREATE INDEX IF NOT EXISTS idx_publishing_isbn ON publishing_records(isbn);
CREATE INDEX IF NOT EXISTS idx_publishing_hash ON publishing_records(epub_pdf_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON blockchain_certificates(sha256_hash);

