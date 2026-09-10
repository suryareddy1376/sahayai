import {
  BeneficiaryIntakeFormData,
  Gender,
  CasteCategory,
  LoanNpaStatus,
  LoanTypeNeeded,
  BusinessSector,
} from '../types/beneficiary';

export interface ValidationError {
  field: string;
  group: 'identity' | 'location' | 'financial' | 'enterprise' | 'education' | 'documents';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

/**
 * Server-side & Client-side Validation Engine for Beneficiary Intake
 * Enforces strict types, standard Indian government formats, and dynamic conditional logic.
 */
export function validateBeneficiaryProfile(
  data: Partial<BeneficiaryIntakeFormData>
): ValidationResult {
  const errors: ValidationError[] = [];

  // ==========================================
  // 1. Identity Group (Required)
  // ==========================================
  if (!data.identity) {
    errors.push({
      group: 'identity',
      field: 'identity',
      message: 'Identity group is required',
    });
  } else {
    const {
      full_name,
      age,
      gender,
      caste_category,
      id_proof_number,
      disability_status,
      disability_consent,
    } = data.identity;

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      errors.push({
        group: 'identity',
        field: 'full_name',
        message: 'Full name is required (minimum 2 characters)',
      });
    }

    if (
      age === undefined ||
      age === null ||
      typeof age !== 'number' ||
      !Number.isInteger(age) ||
      age < 18 ||
      age > 100
    ) {
      errors.push({
        group: 'identity',
        field: 'age',
        message: 'Age must be an integer between 18 and 100 years',
      });
    }

    const validGenders: Gender[] = ['male', 'female', 'other'];
    if (!gender || !validGenders.includes(gender)) {
      errors.push({
        group: 'identity',
        field: 'gender',
        message: 'Gender must be male, female, or other',
      });
    }

    const validCastes: CasteCategory[] = ['SC', 'ST', 'OBC', 'General'];
    if (!caste_category || !validCastes.includes(caste_category)) {
      errors.push({
        group: 'identity',
        field: 'caste_category',
        message: 'Caste category must be SC, ST, OBC, or General',
      });
    }

    if (
      !id_proof_number ||
      typeof id_proof_number !== 'string' ||
      id_proof_number.trim().length < 6
    ) {
      errors.push({
        group: 'identity',
        field: 'id_proof_number',
        message: 'Valid ID proof number is required (min 6 characters)',
      });
    }

    // Sensitive self-declared disability with mandatory consent
    if (disability_status === true && !disability_consent) {
      errors.push({
        group: 'identity',
        field: 'disability_consent',
        message: 'Explicit consent checkbox is required when declaring disability status',
      });
    }
  }

  // ==========================================
  // 2. Location Group (Required)
  // ==========================================
  if (!data.location) {
    errors.push({
      group: 'location',
      field: 'location',
      message: 'Location group is required',
    });
  } else {
    const { state, district, village_or_town, pincode, is_rural } = data.location;

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      errors.push({
        group: 'location',
        field: 'state',
        message: 'State is required',
      });
    }

    if (!district || typeof district !== 'string' || district.trim().length === 0) {
      errors.push({
        group: 'location',
        field: 'district',
        message: 'District is required',
      });
    }

    if (!village_or_town || typeof village_or_town !== 'string' || village_or_town.trim().length === 0) {
      errors.push({
        group: 'location',
        field: 'village_or_town',
        message: 'Village or Town name is required',
      });
    }

    if (!pincode || typeof pincode !== 'string' || !PINCODE_REGEX.test(pincode.trim())) {
      errors.push({
        group: 'location',
        field: 'pincode',
        message: 'PIN code must be a valid 6-digit Indian postal code (e.g. 110001)',
      });
    }

    if (typeof is_rural !== 'boolean') {
      errors.push({
        group: 'location',
        field: 'is_rural',
        message: 'Rural/Urban classification is required',
      });
    }
  }

  // ==========================================
  // 3. Financial Group (Required)
  // ==========================================
  if (!data.financial) {
    errors.push({
      group: 'financial',
      field: 'financial',
      message: 'Financial group is required',
    });
  } else {
    const { annual_family_income, existing_loan_flag, existing_loan_npa_status, bank_account_ifsc } =
      data.financial;

    if (
      annual_family_income === undefined ||
      annual_family_income === null ||
      typeof annual_family_income !== 'number' ||
      annual_family_income < 0
    ) {
      errors.push({
        group: 'financial',
        field: 'annual_family_income',
        message: 'Annual family income must be a positive number',
      });
    }

    if (typeof existing_loan_flag !== 'boolean') {
      errors.push({
        group: 'financial',
        field: 'existing_loan_flag',
        message: 'Existing loan flag must be specified (yes/no)',
      });
    }

    // Dynamic Conditional: existing_loan_npa_status is required IF existing_loan_flag = true
    if (existing_loan_flag === true) {
      const validNpaStatuses: LoanNpaStatus[] = ['none', 'regular', 'npa'];
      if (!existing_loan_npa_status || !validNpaStatuses.includes(existing_loan_npa_status)) {
        errors.push({
          group: 'financial',
          field: 'existing_loan_npa_status',
          message: 'When existing loan is present, loan status (regular or npa) is required',
        });
      }
    }

    // Optional IFSC validation
    if (bank_account_ifsc && bank_account_ifsc.trim().length > 0) {
      if (!IFSC_REGEX.test(bank_account_ifsc.trim())) {
        errors.push({
          group: 'financial',
          field: 'bank_account_ifsc',
          message: 'Bank IFSC must match standard 11-character format (e.g. SBIN0001234)',
        });
      }
    }
  }

  // ==========================================
  // 4. Enterprise Group (Required)
  // ==========================================
  let isEducationLoan = false;
  if (!data.enterprise) {
    errors.push({
      group: 'enterprise',
      field: 'enterprise',
      message: 'Enterprise group is required',
    });
  } else {
    const {
      loan_type_needed,
      business_sector,
      is_new_venture,
      years_in_business,
      requested_loan_amount,
    } = data.enterprise;

    const validLoanTypes: LoanTypeNeeded[] = ['micro_finance', 'term_loan', 'education_loan'];
    if (!loan_type_needed || !validLoanTypes.includes(loan_type_needed)) {
      errors.push({
        group: 'enterprise',
        field: 'loan_type_needed',
        message: 'Loan type must be micro_finance, term_loan, or education_loan',
      });
    } else if (loan_type_needed === 'education_loan') {
      isEducationLoan = true;
    }

    const validSectors: BusinessSector[] = [
      'agriculture',
      'manufacturing',
      'services',
      'trading',
      'other',
    ];
    if (!business_sector || !validSectors.includes(business_sector)) {
      errors.push({
        group: 'enterprise',
        field: 'business_sector',
        message: 'Business sector must be agriculture, manufacturing, services, trading, or other',
      });
    }

    if (typeof is_new_venture !== 'boolean') {
      errors.push({
        group: 'enterprise',
        field: 'is_new_venture',
        message: 'New venture flag must be specified (true/false)',
      });
    }

    // Dynamic Conditional: years_in_business is required IF is_new_venture = false
    if (is_new_venture === false) {
      if (
        years_in_business === undefined ||
        years_in_business === null ||
        typeof years_in_business !== 'number' ||
        !Number.isInteger(years_in_business) ||
        years_in_business < 0
      ) {
        errors.push({
          group: 'enterprise',
          field: 'years_in_business',
          message: 'For an existing enterprise, years in business is required (0 or greater)',
        });
      }
    }

    if (
      requested_loan_amount === undefined ||
      requested_loan_amount === null ||
      typeof requested_loan_amount !== 'number' ||
      requested_loan_amount <= 0
    ) {
      errors.push({
        group: 'enterprise',
        field: 'requested_loan_amount',
        message: 'Requested loan amount must be greater than 0',
      });
    }
  }

  // ==========================================
  // 5. Education Group (Conditional on loan_type_needed = 'education_loan')
  // ==========================================
  if (isEducationLoan) {
    if (!data.education) {
      errors.push({
        group: 'education',
        field: 'education',
        message: 'Education details are required when loan type is education_loan',
      });
    } else {
      const { highest_qualification, course_name, institution_name } = data.education;

      if (!highest_qualification || highest_qualification.trim().length === 0) {
        errors.push({
          group: 'education',
          field: 'highest_qualification',
          message: 'Highest qualification is required for education loan',
        });
      }

      if (!course_name || course_name.trim().length === 0) {
        errors.push({
          group: 'education',
          field: 'course_name',
          message: 'Course name is required for education loan',
        });
      }

      if (!institution_name || institution_name.trim().length === 0) {
        errors.push({
          group: 'education',
          field: 'institution_name',
          message: 'Institution name is required for education loan',
        });
      }
    }
  }

  // ==========================================
  // 6. Documents Group (Required)
  // ==========================================
  if (!data.documents) {
    errors.push({
      group: 'documents',
      field: 'documents',
      message: 'Document uploads are required',
    });
  } else {
    const { caste_certificate, income_certificate, id_proof, address_proof, business_proposal } =
      data.documents;

    if (!caste_certificate || !caste_certificate.file_name) {
      errors.push({
        group: 'documents',
        field: 'caste_certificate',
        message: 'Caste certificate document is required',
      });
    }

    if (!income_certificate || !income_certificate.file_name) {
      errors.push({
        group: 'documents',
        field: 'income_certificate',
        message: 'Income certificate document is required',
      });
    }

    if (!id_proof || !id_proof.file_name) {
      errors.push({
        group: 'documents',
        field: 'id_proof',
        message: 'Identity proof document is required',
      });
    }

    if (!address_proof || !address_proof.file_name) {
      errors.push({
        group: 'documents',
        field: 'address_proof',
        message: 'Address proof document is required',
      });
    }

    // business_proposal is optional, but only allowed if loan_type_needed != education_loan
    if (isEducationLoan && business_proposal) {
      errors.push({
        group: 'documents',
        field: 'business_proposal',
        message: 'Business proposal is not applicable for education loans',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
