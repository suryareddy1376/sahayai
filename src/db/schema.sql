-- ====================================================================================
-- Sahay AI - Beneficiary Intake & Scheme Matching Database Schema
-- SIH Problem 26092 | Ministry of Social Justice & Empowerment, Govt. of India
-- Compliance: Digital Personal Data Protection (DPDP) Act & Access-Controlled Segregation
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------------------------------
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE caste_category_type AS ENUM ('SC', 'ST', 'OBC', 'General');
CREATE TYPE loan_npa_status_type AS ENUM ('none', 'regular', 'npa');
CREATE TYPE loan_type_needed_type AS ENUM ('micro_finance', 'term_loan', 'education_loan');
CREATE TYPE business_sector_type AS ENUM ('agriculture', 'manufacturing', 'services', 'trading', 'other');
CREATE TYPE document_type_enum AS ENUM (
    'caste_certificate',
    'income_certificate',
    'id_proof',
    'address_proof',
    'business_proposal'
);
CREATE TYPE ocr_verification_status AS ENUM (
    'pending',
    'queued',
    'extracted',
    'mismatch_flagged',
    'verified'
);

-- ------------------------------------------------------------------------------------
-- 1. MAIN BENEFICIARY PROFILE TABLE (General / Non-Sensitive)
-- Groups: Identity (Public), Location, Financial, Enterprise
-- ------------------------------------------------------------------------------------
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 1. Identity (General attributes only)
    full_name VARCHAR(150) NOT NULL,
    age INT NOT NULL CHECK (age >= 18 AND age <= 100),
    gender gender_type NOT NULL,
    has_declared_disability BOOLEAN NOT NULL DEFAULT FALSE,
    id_proof_number_masked VARCHAR(32) NOT NULL, -- e.g. "•••• •••• 9842" (Never plaintext)
    
    -- 2. Location (Required)
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village_or_town VARCHAR(150) NOT NULL,
    pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
    is_rural BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- 3. Financial (Required)
    annual_family_income NUMERIC(12, 2) NOT NULL CHECK (annual_family_income >= 0),
    existing_loan_flag BOOLEAN NOT NULL DEFAULT FALSE,
    -- Conditional: must be provided if existing_loan_flag is true
    existing_loan_npa_status loan_npa_status_type DEFAULT 'none',
    bank_account_ifsc VARCHAR(11) CHECK (bank_account_ifsc IS NULL OR bank_account_ifsc ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
    
    -- 4. Enterprise (Required)
    loan_type_needed loan_type_needed_type NOT NULL,
    business_sector business_sector_type NOT NULL,
    is_new_venture BOOLEAN NOT NULL DEFAULT TRUE,
    -- Conditional: required if is_new_venture = false
    years_in_business INT CHECK (
        (is_new_venture = TRUE) OR 
        (is_new_venture = FALSE AND years_in_business IS NOT NULL AND years_in_business >= 0)
    ),
    requested_loan_amount NUMERIC(12, 2) NOT NULL CHECK (requested_loan_amount > 0),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_conditional_npa_status CHECK (
        (existing_loan_flag = FALSE AND (existing_loan_npa_status IS NULL OR existing_loan_npa_status = 'none')) OR
        (existing_loan_flag = TRUE AND existing_loan_npa_status IN ('none', 'regular', 'npa'))
    )
);

CREATE INDEX idx_user_profiles_pincode ON user_profiles(pincode);
CREATE INDEX idx_user_profiles_district_state ON user_profiles(state, district);
CREATE INDEX idx_user_profiles_loan_type ON user_profiles(loan_type_needed);
CREATE INDEX idx_user_profiles_income ON user_profiles(annual_family_income);

-- ------------------------------------------------------------------------------------
-- 2. SEPARATE ACCESS-CONTROLLED TABLE (Sensitive Attributes)
-- Stores: caste_category, disability_status (with consent), and SHA-256 hashed ID proof
-- STRICT ISOLATION: Accessible ONLY to authorized welfare nodal officers
-- ------------------------------------------------------------------------------------
CREATE TABLE user_sensitive_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Sensitive caste category
    caste_category caste_category_type NOT NULL,
    
    -- Sensitive disability status with self-declaration consent
    disability_status BOOLEAN NOT NULL DEFAULT FALSE,
    disability_consent_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Cryptographic hash of ID proof (e.g. SHA-256) - NEVER PLAINTEXT
    id_proof_number_hash VARCHAR(64) NOT NULL,
    id_proof_number_masked VARCHAR(32) NOT NULL,
    
    -- Audit & Security
    access_classification VARCHAR(50) DEFAULT 'CONFIDENTIAL_SENSITIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_disability_consent CHECK (
        (disability_status = FALSE) OR 
        (disability_status = TRUE AND disability_consent_timestamp IS NOT NULL)
    )
);

CREATE INDEX idx_sensitive_user_id ON user_sensitive_attributes(user_id);
CREATE INDEX idx_sensitive_id_hash ON user_sensitive_attributes(id_proof_number_hash);

-- Row-Level Security (RLS) policies for sensitive table
ALTER TABLE user_sensitive_attributes ENABLE ROW LEVEL SECURITY;

-- Role definitions for access control
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'role_sensitive_data_officer') THEN
        CREATE ROLE role_sensitive_data_officer;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'role_general_app_service') THEN
        CREATE ROLE role_general_app_service;
    END IF;
END $$;

-- Policies
CREATE POLICY officer_sensitive_select ON user_sensitive_attributes
    FOR SELECT TO role_sensitive_data_officer
    USING (TRUE);

CREATE POLICY officer_sensitive_insert ON user_sensitive_attributes
    FOR INSERT TO role_sensitive_data_officer
    WITH CHECK (TRUE);

-- General app service cannot directly read caste_category or plaintext attributes
REVOKE SELECT ON user_sensitive_attributes FROM role_general_app_service;

-- ------------------------------------------------------------------------------------
-- 3. EDUCATION PROFILE (Conditional - only if loan_type_needed = 'education_loan')
-- ------------------------------------------------------------------------------------
CREATE TABLE user_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
    highest_qualification VARCHAR(150) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    institution_name VARCHAR(250) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_education_user ON user_education(user_id);

-- ------------------------------------------------------------------------------------
-- 4. DOCUMENTS REPOSITORY & MULTIMODAL EXTRACTION STATUS
-- Document uploads queued for Multimodal Document Agent (OCR / VLM)
-- ------------------------------------------------------------------------------------
CREATE TABLE user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    document_type document_type_enum NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_uri TEXT NOT NULL,
    
    -- Multimodal OCR / VLM Queue & Results
    ocr_status ocr_verification_status NOT NULL DEFAULT 'queued',
    extracted_data JSONB DEFAULT '{}'::jsonb,
    mismatch_flags JSONB DEFAULT '[]'::jsonb,
    has_mismatch BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_agent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_doc_type UNIQUE(user_id, document_type)
);

CREATE INDEX idx_user_docs_user ON user_documents(user_id);
CREATE INDEX idx_user_docs_ocr_status ON user_documents(ocr_status);

-- ------------------------------------------------------------------------------------
-- 5. ACCESS AUDIT LOG FOR SENSITIVE DATA
-- Tracks every access to caste_category, disability_status, and ID hashes
-- ------------------------------------------------------------------------------------
CREATE TABLE user_sensitive_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g. 'INTAKE_WRITE', 'SCHEME_ELIGIBILITY_EVAL', 'CASEWORKER_VIEW'
    accessed_fields TEXT[] NOT NULL,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON user_sensitive_audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON user_sensitive_audit_log(timestamp);

-- ====================================================================================
-- NEO4J GRAPH MEMORY LAYER SPECIFICATION
-- ====================================================================================
-- At profile save, emit ONLY the (:User) node with beneficiary properties.
-- STRICT REQUIREMENT: DO NOT CREATE EDGES TO (:Scheme) NODES AT INTAKE TIME.
--
-- 1. Constraints:
-- CREATE CONSTRAINT unique_user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
-- CREATE CONSTRAINT unique_scheme_id IF NOT EXISTS FOR (s:Scheme) REQUIRE s.id IS UNIQUE;
--
-- 2. Cypher emitted by Intake System on profile save:
-- MERGE (u:User {id: $user_id})
-- SET u.full_name = $full_name,
--     u.age = $age,
--     u.gender = $gender,
--     u.state = $state,
--     u.district = $district,
--     u.village_or_town = $village_or_town,
--     u.pincode = $pincode,
--     u.is_rural = $is_rural,
--     u.annual_family_income = $annual_family_income,
--     u.existing_loan_flag = $existing_loan_flag,
--     u.loan_type_needed = $loan_type_needed,
--     u.business_sector = $business_sector,
--     u.is_new_venture = $is_new_venture,
--     u.requested_loan_amount = $requested_loan_amount,
--     u.intake_completed_at = datetime()
--
-- 3. Downstream Scheme Matching Agent (ONLY after eligibility evaluation):
-- MATCH (u:User {id: $user_id}), (s:Scheme {id: $scheme_id})
-- MERGE (u)-[r:ELIGIBLE_FOR {
--     computed_at: datetime(),
--     confidence_score: $score,
--     evaluation_reason: $reason
-- }]->(s)
-- ====================================================================================


-- ------------------------------------------------------------------------------------
-- 8. APPLICATIONS TRACKER
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    scheme_name VARCHAR(255) NOT NULL,
    loan_amount INT NOT NULL,
    monthly_emi INT NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    partner_address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    status_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
