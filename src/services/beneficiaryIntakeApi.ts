import {
  BeneficiaryIntakeFormData,
  BeneficiaryIntakeResponse,
} from '../types/beneficiary';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'https://sahayai-4dzp.onrender.com';

export async function submitBeneficiaryIntakeApi(
  formData: BeneficiaryIntakeFormData
): Promise<BeneficiaryIntakeResponse> {
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        status_code: response.status as any,
        message: errorData.detail || `Server error: ${response.statusText}`,
        timestamp: new Date().toISOString(),
        beneficiary: null as any,
        sensitive_record_ref: null as any,
        graph_node_emitted: null as any,
        document_processing: {
          batch_id: '',
          total_queued: 0,
          status: 'failed' as any,
          mismatches: [],
        },
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Network error submitting intake:", error);
    return {
      success: false,
      status_code: 500 as any,
      message: error.message || "Network error. Please check if the backend is running.",
      timestamp: new Date().toISOString(),
      beneficiary: null as any,
      sensitive_record_ref: null as any,
      graph_node_emitted: null as any,
      document_processing: {
        batch_id: '',
        total_queued: 0,
        status: 'failed' as any,
        mismatches: [],
      },
    };
  }
}
