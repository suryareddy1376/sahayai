import re

with open('src/components/BeneficiaryIntakeForm.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_state = """  const [formData, setFormData] = useState<BeneficiaryIntakeFormData>({
    identity: {
      full_name: 'Savita Devi',
      age: 34,
      gender: 'female',
      caste_category: 'OBC',
      id_proof_number: '5849 2018 9482',
      disability_status: false,
      disability_consent: false,
    },
    location: {
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      village_or_town: 'Shivpur Kalan',
      pincode: '221003',
      is_rural: true,
    },
    financial: {
      annual_family_income: 180000,
      existing_loan_flag: false,
      existing_loan_npa_status: 'none',
      bank_account_ifsc: 'SBIN0001234',
    },
    enterprise: {
      loan_type_needed: 'micro_finance',
      business_sector: 'manufacturing',
      is_new_venture: false,
      years_in_business: 4,
      requested_loan_amount: 100000,
    },
    education: {
      highest_qualification: 'Senior Secondary (12th Pass)',
      course_name: 'Diploma in Apparel & Textile Craft',
      institution_name: 'State Skill Training Institute',
    },
    documents: {
      caste_certificate: DEFAULT_DOC('caste_certificate_verified.pdf', 'caste'),
      income_certificate: DEFAULT_DOC('income_certificate_tehsildar.pdf', 'income'),
      id_proof: DEFAULT_DOC('aadhaar_card_masked.pdf', 'id'),
      address_proof: DEFAULT_DOC('voter_id_domicile.pdf', 'address'),
      business_proposal: DEFAULT_DOC('tailoring_unit_expansion_plan.pdf', 'proposal'),
    },
  });"""

new_state = """  const [formData, setFormData] = useState<BeneficiaryIntakeFormData>({
    identity: {
      full_name: '',
      age: 0,
      gender: 'female',
      caste_category: 'General',
      id_proof_number: '',
      disability_status: false,
      disability_consent: false,
    },
    location: {
      state: '',
      district: '',
      village_or_town: '',
      pincode: '',
      is_rural: false,
    },
    financial: {
      annual_family_income: 0,
      existing_loan_flag: false,
      existing_loan_npa_status: 'none',
      bank_account_ifsc: '',
    },
    enterprise: {
      loan_type_needed: 'micro_finance',
      business_sector: 'other',
      is_new_venture: true,
      years_in_business: 0,
      requested_loan_amount: 0,
    },
    education: {
      highest_qualification: '',
      course_name: '',
      institution_name: '',
    },
    documents: {
    },
  });"""

code = code.replace(old_state, new_state)

# Also remove the 'Demo Mode' tag in the UI just to be safe
code = code.replace(
    '<span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">\n                Demo Mode\n              </span>',
    ''
)

with open('src/components/BeneficiaryIntakeForm.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
