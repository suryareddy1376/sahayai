import {
  BeneficiaryIntakeFormData,
  BeneficiaryIntakeResponse,
} from '../types/beneficiary';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

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
        status_code: response.status,
        message: errorData.detail || `Server error: ${response.statusText}`,
        timestamp: new Date().toISOString(),
        beneficiary: null as any,
        sensitive_record_ref: null as any,
        graph_node_emitted: null as any,
        document_processing: {
          batch_id: '',
          total_queued: 0,
          status: 'failed',
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
      status_code: 0,
      message: error.message || "Network error. Please check if the backend is running.",
      timestamp: new Date().toISOString(),
      beneficiary: null as any,
      sensitive_record_ref: null as any,
      graph_node_emitted: null as any,
      document_processing: {
        batch_id: '',
        total_queued: 0,
        status: 'network_error',
        mismatches: [],
      },
    };
  }
}
