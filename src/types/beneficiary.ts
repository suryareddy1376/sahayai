/**
 * Beneficiary Profile Schema & Models for Sahay AI Intake System
 * Grouped exactly as required with strict snake_case field naming.
 */

// 1. Identity Group
export type Gender = 'male' | 'female' | 'other';
export type CasteCategory = 'SC' | 'ST' | 'OBC' | 'General';

export interface IdentityGroup {
  full_name: string;
  age: number;
  gender: Gender;
  /** Sensitive attribute — stored separately with access control */
  caste_category: CasteCategory;
  /** Never stored in plaintext — persisted as hashed & masked */
  id_proof_number: string;
  /** Optional sensitive attribute — self-declared with consent checkbox */
  disability_status?: boolean;
  disability_consent?: boolean;
}

// 2. Location Group
export interface LocationGroup {
  state: string;
  district: string;
  village_or_town: string;
  /** 6-digit Indian Postal PIN code validated */
  pincode: string;
  is_rural: boolean;
}

// 3. Financial Group
export type LoanNpaStatus = 'none' | 'regular' | 'npa';

export interface FinancialGroup {
  annual_family_income: number;
  existing_loan_flag: boolean;
  /** Conditional on existing_loan_flag = true */
  existing_loan_npa_status?: LoanNpaStatus;
  bank_account_ifsc?: string;
}

// 4. Enterprise Group
export type LoanTypeNeeded = 'micro_finance' | 'term_loan' | 'education_loan';
export type BusinessSector = 'agriculture' | 'manufacturing' | 'services' | 'trading' | 'other';

export interface EnterpriseGroup {
  loan_type_needed: LoanTypeNeeded;
  business_sector: BusinessSector;
  is_new_venture: boolean;
  /** Conditional on is_new_venture = false */
  years_in_business?: number;
  requested_loan_amount: number;
}

// 5. Education Group (Conditional on loan_type_needed = 'education_loan')
export interface EducationGroup {
  highest_qualification: string;
  course_name: string;
  institution_name: string;
}

// 6. Documents Group (File uploads)
export interface UploadedDocumentMeta {
  document_id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  storage_url?: string;
  upload_timestamp: string;
  ocr_status: 'pending' | 'queued' | 'extracted' | 'mismatch_flagged' | 'verified';
  extracted_fields?: Record<string, string | number | boolean>;
}

export interface DocumentsGroup {
  caste_certificate?: UploadedDocumentMeta;
  income_certificate?: UploadedDocumentMeta;
  id_proof?: UploadedDocumentMeta;
  address_proof?: UploadedDocumentMeta;
  /** Optional, only allowed if loan_type_needed != 'education_loan' */
  business_proposal?: UploadedDocumentMeta;
}

/**
 * Complete Raw Intake Form Data before sensitive data separation
 */
export interface BeneficiaryIntakeFormData {
  identity: IdentityGroup;
  location: LocationGroup;
  financial: FinancialGroup;
  enterprise: EnterpriseGroup;
  education?: EducationGroup;
  documents: DocumentsGroup;
}

/**
 * Access-Controlled Sensitive Attributes Record
 * Stored in isolated table/collection with role-based access gates.
 */
export interface SensitiveBeneficiaryRecord {
  id: string;
  user_id: string;
  caste_category: CasteCategory;
  disability_status: boolean;
  disability_consent_timestamp?: string;
  id_proof_number_hash: string;
  id_proof_number_masked: string;
  access_classification: 'CONFIDENTIAL_SENSITIVE';
  created_at: string;
  updated_at: string;
}

/**
 * Public/Sanitized Beneficiary Profile
 * Safe for general table and downstream service consumption.
 */
export interface BeneficiaryProfile {
  id: string;
  identity: {
    full_name: string;
    age: number;
    gender: Gender;
    id_proof_number_masked: string;
    has_disability: boolean;
  };
  location: LocationGroup;
  financial: FinancialGroup;
  enterprise: EnterpriseGroup;
  education?: EducationGroup;
  documents: {
    caste_certificate?: UploadedDocumentMeta;
    income_certificate?: UploadedDocumentMeta;
    id_proof?: UploadedDocumentMeta;
    address_proof?: UploadedDocumentMeta;
    business_proposal?: UploadedDocumentMeta;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Emitted Neo4j Graph Memory Layer User Node representation
 */
export interface GraphUserNode {
  labels: ['User'];
  properties: {
    id: string;
    full_name: string;
    age: number;
    gender: Gender;
    state: string;
    district: string;
    village_or_town: string;
    pincode: string;
    is_rural: boolean;
    annual_family_income: number;
    existing_loan_flag: boolean;
    loan_type_needed: LoanTypeNeeded;
    business_sector: BusinessSector;
    is_new_venture: boolean;
    requested_loan_amount: number;
    registered_at: string;
  };
}

/**
 * Multimodal Document Agent Mismatch Flag
 */
export interface DocumentMismatchFlag {
  document_type: keyof DocumentsGroup;
  field_name: string;
  form_value: string | number;
  extracted_value: string | number;
  confidence_score: number;
  severity: 'warning' | 'critical';
  message: string;
}

/**
 * Multimodal Document Queue Item
 */
export interface DocumentQueueItem {
  queue_id: string;
  user_id: string;
  document_type: keyof DocumentsGroup;
  file_name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queued_at: string;
  completed_at?: string;
  extracted_data?: Record<string, any>;
  mismatches?: DocumentMismatchFlag[];
}

/**
 * Canonical Structured JSON Response returned by the Intake API
 * Directly consumed by downstream agents (RAG Scheme Matcher, EMI Calculator, Geo Locator).
 */
export interface BeneficiaryIntakeResponse {
  success: boolean;
  status_code: 200 | 201 | 400 | 422 | 500;
  message: string;
  timestamp: string;
  beneficiary: BeneficiaryProfile;
  sensitive_record_ref: {
    record_id: string;
    storage_table: 'user_sensitive_attributes';
    access_role_required: 'ROLE_SENSITIVE_DATA_OFFICER';
  };
  graph_node_emitted: {
    node_id: string;
    label: 'User';
    edges_created_at_intake: 0; // Strictly 0 edges at intake time
    note: 'Scheme edges deferred until downstream eligibility evaluation';
  };
  document_processing: {
    batch_id: string;
    total_queued: number;
    status: 'queued_for_multimodal_agent';
    mismatches: DocumentMismatchFlag[];
  };
}
