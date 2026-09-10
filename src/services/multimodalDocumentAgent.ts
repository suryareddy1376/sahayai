import {
  DocumentsGroup,
  DocumentQueueItem,
  DocumentMismatchFlag,
  BeneficiaryIntakeFormData,
} from '../types/beneficiary';

/**
 * Multimodal Document Agent (OCR / VLM Extraction & Cross-Check)
 *
 * Rather than treating document uploads as opaque blobs, this agent:
 * 1. Queues documents for VLM/OCR processing.
 * 2. Extracts structured fields (e.g. declared income, caste category, applicant name, PIN code).
 * 3. Cross-checks extracted data with self-reported form entries.
 * 4. Flags discrepancies for human nodal officer review.
 */
class MultimodalDocumentAgent {
  private queue: Map<string, DocumentQueueItem> = new Map();

  /**
   * Enqueues documents and simulates multimodal OCR/VLM extraction and cross-checking.
   */
  public async processDocumentIntake(
    userId: string,
    formData: BeneficiaryIntakeFormData
  ): Promise<{
    batchId: string;
    queuedItems: DocumentQueueItem[];
    mismatches: DocumentMismatchFlag[];
  }> {
    const batchId = `BATCH-${Date.now()}`;
    const queuedItems: DocumentQueueItem[] = [];
    const mismatches: DocumentMismatchFlag[] = [];

    const docs = formData.documents;
    const documentEntries: Array<{
      type: keyof DocumentsGroup;
      meta?: DocumentsGroup[keyof DocumentsGroup];
    }> = [
      { type: 'caste_certificate', meta: docs.caste_certificate },
      { type: 'income_certificate', meta: docs.income_certificate },
      { type: 'id_proof', meta: docs.id_proof },
      { type: 'address_proof', meta: docs.address_proof },
    ];

    if (docs.business_proposal) {
      documentEntries.push({ type: 'business_proposal', meta: docs.business_proposal });
    }

    for (const entry of documentEntries) {
      if (!entry.meta) continue;

      const queueId = `Q-${userId}-${entry.type}-${Date.now()}`;

      // Simulate multimodal OCR/VLM extraction based on document metadata or file name
      const extractedData = this.simulateVlmExtraction(entry.type, formData, entry.meta.file_name);

      // Perform cross-checks against self-reported form data
      const docMismatches = this.crossCheckExtractedData(entry.type, formData, extractedData);
      mismatches.push(...docMismatches);

      const queueItem: DocumentQueueItem = {
        queue_id: queueId,
        user_id: userId,
        document_type: entry.type,
        file_name: entry.meta.file_name,
        status: 'completed',
        queued_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        extracted_data: extractedData,
        mismatches: docMismatches,
      };

      this.queue.set(queueId, queueItem);
      queuedItems.push(queueItem);
    }

    return {
      batchId,
      queuedItems,
      mismatches,
    };
  }

  /**
   * Simulates VLM / OCR extraction for Indian government certificates.
   */
  private simulateVlmExtraction(
    docType: keyof DocumentsGroup,
    formData: BeneficiaryIntakeFormData,
    fileName: string
  ): Record<string, any> {
    const lowerName = fileName.toLowerCase();
    const isTestMismatch = lowerName.includes('mismatch') || lowerName.includes('diff');

    switch (docType) {
      case 'income_certificate':
        return {
          certificate_no: 'INC/2026/78291',
          issuing_authority: 'Tehsildar Office / Revenue Dept',
          extracted_annual_income: isTestMismatch
            ? formData.financial.annual_family_income * 1.5
            : formData.financial.annual_family_income,
          applicant_name: formData.identity.full_name,
          issue_date: '2025-11-14',
          ocr_confidence: 0.96,
        };

      case 'caste_certificate':
        return {
          certificate_no: 'CST/2024/99104',
          issuing_authority: 'Sub-Divisional Magistrate (SDM)',
          extracted_caste_category: isTestMismatch ? 'General' : formData.identity.caste_category,
          applicant_name: formData.identity.full_name,
          ocr_confidence: 0.94,
        };

      case 'id_proof':
        return {
          id_type: 'Aadhaar / National ID',
          extracted_name: isTestMismatch ? 'Different Person' : formData.identity.full_name,
          dob_or_age: formData.identity.age,
          gender: formData.identity.gender,
          ocr_confidence: 0.98,
        };

      case 'address_proof':
        return {
          proof_type: 'Voter ID / Domicile Certificate',
          extracted_pincode: isTestMismatch ? '999999' : formData.location.pincode,
          extracted_district: formData.location.district,
          extracted_state: formData.location.state,
          ocr_confidence: 0.92,
        };

      case 'business_proposal':
        return {
          proposal_title: `${formData.enterprise.business_sector} Enterprise Plan`,
          loan_requested_amount: formData.enterprise.requested_loan_amount,
          ocr_confidence: 0.88,
        };

      default:
        return { ocr_confidence: 0.85 };
    }
  }

  /**
   * Cross-checks extracted multimodal VLM data against self-declared form fields.
   */
  private crossCheckExtractedData(
    docType: keyof DocumentsGroup,
    formData: BeneficiaryIntakeFormData,
    extracted: Record<string, any>
  ): DocumentMismatchFlag[] {
    const flags: DocumentMismatchFlag[] = [];

    if (docType === 'income_certificate' && extracted.extracted_annual_income !== undefined) {
      const formIncome = formData.financial.annual_family_income;
      const docIncome = extracted.extracted_annual_income;
      const differenceRatio = Math.abs(formIncome - docIncome) / (formIncome || 1);

      if (differenceRatio > 0.15) {
        flags.push({
          document_type: 'income_certificate',
          field_name: 'annual_family_income',
          form_value: `₹${formIncome.toLocaleString('en-IN')}`,
          extracted_value: `₹${docIncome.toLocaleString('en-IN')}`,
          confidence_score: extracted.ocr_confidence,
          severity: differenceRatio > 0.35 ? 'critical' : 'warning',
          message: `Self-declared income differs from revenue certificate by ${Math.round(
            differenceRatio * 100
          )}%. Nodal verification will check original copy.`,
        });
      }
    }

    if (docType === 'caste_certificate' && extracted.extracted_caste_category !== undefined) {
      const formCaste = formData.identity.caste_category;
      const docCaste = extracted.extracted_caste_category;

      if (formCaste !== docCaste) {
        flags.push({
          document_type: 'caste_certificate',
          field_name: 'caste_category',
          form_value: formCaste,
          extracted_value: docCaste,
          confidence_score: extracted.ocr_confidence,
          severity: 'critical',
          message: `Declared category (${formCaste}) does not match category detected on certificate (${docCaste}).`,
        });
      }
    }

    if (docType === 'id_proof' && extracted.extracted_name !== undefined) {
      const formName = formData.identity.full_name.trim().toLowerCase();
      const docName = extracted.extracted_name.trim().toLowerCase();

      if (formName !== docName && !docName.includes(formName)) {
        flags.push({
          document_type: 'id_proof',
          field_name: 'full_name',
          form_value: formData.identity.full_name,
          extracted_value: extracted.extracted_name,
          confidence_score: extracted.ocr_confidence,
          severity: 'warning',
          message: `Name on government ID card ('${extracted.extracted_name}') has minor variation from entered name ('${formData.identity.full_name}').`,
        });
      }
    }

    if (docType === 'address_proof' && extracted.extracted_pincode !== undefined) {
      const formPincode = formData.location.pincode.trim();
      const docPincode = extracted.extracted_pincode.trim();

      if (formPincode !== docPincode) {
        flags.push({
          document_type: 'address_proof',
          field_name: 'pincode',
          form_value: formPincode,
          extracted_value: docPincode,
          confidence_score: extracted.ocr_confidence,
          severity: 'warning',
          message: `Location PIN code mismatch: Form shows ${formPincode} while document indicates ${docPincode}.`,
        });
      }
    }

    return flags;
  }

  public getQueueItem(queueId: string): DocumentQueueItem | undefined {
    return this.queue.get(queueId);
  }
}

export const multimodalDocumentAgent = new MultimodalDocumentAgent();
