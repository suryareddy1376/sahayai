import {
  BeneficiaryIntakeFormData,
  BeneficiaryIntakeResponse,
  BeneficiaryProfile,
} from '../types/beneficiary';
import { validateBeneficiaryProfile } from './validationService';
import { sensitiveStorageService } from './sensitiveStorageService';
import { neo4jGraphService } from './neo4jGraphService';
import { multimodalDocumentAgent } from './multimodalDocumentAgent';

/**
 * Beneficiary Intake API Endpoint Handler
 *
 * Implements full server-side intake lifecycle:
 * 1. Server-side validation (types, formats, dynamic conditionals)
 * 2. Sensitive data segregation (caste, disability, hashed ID proof)
 * 3. Neo4j graph memory node emission (NO hardcoded Scheme edges)
 * 4. Multimodal document agent queueing & OCR cross-checking
 * 5. Structured JSON payload generation for downstream agents (RAG, EMI, Geo)
 */
export async function submitBeneficiaryIntakeApi(
  formData: BeneficiaryIntakeFormData
): Promise<BeneficiaryIntakeResponse> {
  // 1. Server-Side Validation
  const validation = validateBeneficiaryProfile(formData);
  if (!validation.isValid) {
    return {
      success: false,
      status_code: 422,
      message: `Intake validation failed: ${validation.errors
        .map((e) => `${e.field}: ${e.message}`)
        .join('; ')}`,
      timestamp: new Date().toISOString(),
      beneficiary: null as any,
      sensitive_record_ref: null as any,
      graph_node_emitted: null as any,
      document_processing: {
        batch_id: '',
        total_queued: 0,
        status: 'queued_for_multimodal_agent',
        mismatches: [],
      },
    };
  }

  // Generate unique citizen beneficiary ID
  const userId = `BENEFICIARY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 2. Sensitive Attributes Isolation & Access-Controlled Storage
  const { recordId, maskedId } = await sensitiveStorageService.storeSensitiveAttributes({
    userId,
    casteCategory: formData.identity.caste_category,
    disabilityStatus: formData.identity.disability_status,
    disabilityConsent: formData.identity.disability_consent,
    rawIdProofNumber: formData.identity.id_proof_number,
    actorRole: 'ROLE_SENSITIVE_DATA_OFFICER',
  });

  // 3. Assemble Sanitized General Beneficiary Profile
  const nowIso = new Date().toISOString();
  const sanitizedProfile: BeneficiaryProfile = {
    id: userId,
    identity: {
      full_name: formData.identity.full_name,
      age: formData.identity.age,
      gender: formData.identity.gender,
      id_proof_number_masked: maskedId,
      has_disability: Boolean(formData.identity.disability_status),
    },
    location: {
      state: formData.location.state,
      district: formData.location.district,
      village_or_town: formData.location.village_or_town,
      pincode: formData.location.pincode,
      is_rural: formData.location.is_rural,
    },
    financial: {
      annual_family_income: formData.financial.annual_family_income,
      existing_loan_flag: formData.financial.existing_loan_flag,
      existing_loan_npa_status: formData.financial.existing_loan_flag
        ? formData.financial.existing_loan_npa_status
        : 'none',
      bank_account_ifsc: formData.financial.bank_account_ifsc || undefined,
    },
    enterprise: {
      loan_type_needed: formData.enterprise.loan_type_needed,
      business_sector: formData.enterprise.business_sector,
      is_new_venture: formData.enterprise.is_new_venture,
      years_in_business: formData.enterprise.is_new_venture
        ? undefined
        : formData.enterprise.years_in_business,
      requested_loan_amount: formData.enterprise.requested_loan_amount,
    },
    education:
      formData.enterprise.loan_type_needed === 'education_loan' && formData.education
        ? {
            highest_qualification: formData.education.highest_qualification,
            course_name: formData.education.course_name,
            institution_name: formData.education.institution_name,
          }
        : undefined,
    documents: {
      caste_certificate: formData.documents.caste_certificate,
      income_certificate: formData.documents.income_certificate,
      id_proof: formData.documents.id_proof,
      address_proof: formData.documents.address_proof,
      business_proposal:
        formData.enterprise.loan_type_needed !== 'education_loan'
          ? formData.documents.business_proposal
          : undefined,
    },
    created_at: nowIso,
    updated_at: nowIso,
  };

  // 4. Emit (:User) Node to Graph Memory Layer (Neo4j)
  // Strict rule: 0 edges to (:Scheme) nodes at intake time!
  const graphEvent = await neo4jGraphService.emitUserNode(sanitizedProfile);

  // 5. Queue Document Uploads for Multimodal Document Agent (OCR / VLM)
  const docResult = await multimodalDocumentAgent.processDocumentIntake(userId, formData);

  // 6. Return Structured Canonical JSON Response
  const response: BeneficiaryIntakeResponse = {
    success: true,
    status_code: 201,
    message: 'Beneficiary intake profile created and registered successfully.',
    timestamp: nowIso,
    beneficiary: sanitizedProfile,
    sensitive_record_ref: {
      record_id: recordId,
      storage_table: 'user_sensitive_attributes',
      access_role_required: 'ROLE_SENSITIVE_DATA_OFFICER',
    },
    graph_node_emitted: {
      node_id: graphEvent.node.properties.id,
      label: 'User',
      edges_created_at_intake: 0,
      note: 'Scheme edges deferred until downstream eligibility evaluation',
    },
    document_processing: {
      batch_id: docResult.batchId,
      total_queued: docResult.queuedItems.length,
      status: 'queued_for_multimodal_agent',
      mismatches: docResult.mismatches,
    },
  };

  return response;
}
