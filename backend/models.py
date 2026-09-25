from pydantic import BaseModel, ConfigDict, Field
from typing import List, Literal, Optional, Any

LanguageCode = Literal['hi', 'en', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'od', 'ml']

class EligibilityReason(BaseModel):
    id: str
    icon: Literal['income', 'project', 'location', 'caste', 'age']
    phrase: str
    detail: str
    status: Literal['eligible', 'close']

class NearlyEligibleAlternative(BaseModel):
    schemeName: str = Field(alias='schemeName')
    requirement: str
    gain: str
    model_config = ConfigDict(populate_by_name=True)

class Scheme(BaseModel):
    id: str
    name: str
    codeName: str = Field(alias='codeName')
    corporation: str
    headline: str
    maxAmount: int = Field(alias='maxAmount')
    minAmount: int = Field(alias='minAmount')
    interestRate: float = Field(alias='interestRate')
    interestRateMax: Optional[float] = Field(default=None, alias='interestRateMax')
    moratoriumMonths: int = Field(alias='moratoriumMonths')
    standardTenureMonths: int = Field(alias='standardTenureMonths')
    category: Literal['micro', 'term', 'equipment']
    whyEligible: List[EligibilityReason] = Field(alias='whyEligible')
    nearlyEligibleAlternative: Optional[NearlyEligibleAlternative] = Field(default=None, alias='nearlyEligibleAlternative')
    recommendedFor: str = Field(alias='recommendedFor')
    governmentBacked: bool = Field(alias='governmentBacked')
    model_config = ConfigDict(populate_by_name=True)

class EMICalculation(BaseModel):
    schemeId: str = Field(alias='schemeId')
    schemeName: str = Field(alias='schemeName')
    loanAmount: int = Field(alias='loanAmount')
    tenureMonths: int = Field(alias='tenureMonths')
    interestRate: float = Field(alias='interestRate')
    monthlyEMI: int = Field(alias='monthlyEMI')
    moratoriumMonths: int = Field(alias='moratoriumMonths')
    totalRepayment: int = Field(alias='totalRepayment')
    totalInterest: int = Field(alias='totalInterest')
    model_config = ConfigDict(populate_by_name=True)

class PartnerBranch(BaseModel):
    id: str
    name: str
    branchName: str = Field(alias='branchName')
    partnerType: Literal['Government Bank', 'State Channel Partner', 'Rural Development Bank'] = Field(alias='partnerType')
    distanceKm: float = Field(alias='distanceKm')
    address: str
    phone: str
    isActivelyProcessing: bool = Field(alias='isActivelyProcessing')
    hours: str
    documentsToCarry: List[str] = Field(alias='documentsToCarry')
    coordinates: List[float]
    isNextNearestFallback: Optional[bool] = Field(default=None, alias='isNextNearestFallback')
    model_config = ConfigDict(populate_by_name=True)

class ApplicationTrackerData(BaseModel):
    applicationId: str = Field(alias='applicationId')
    schemeName: str = Field(alias='schemeName')
    loanAmount: int = Field(alias='loanAmount')
    monthlyEMI: int = Field(alias='monthlyEMI')
    partnerName: str = Field(alias='partnerName')
    partnerAddress: str = Field(alias='partnerAddress')
    submittedDate: str = Field(alias='submittedDate')
    currentStatus: Literal['submitted', 'under_review', 'approved'] = Field(alias='currentStatus')
    statusReasonText: str = Field(alias='statusReasonText')
    notifyPhone: str = Field(alias='notifyPhone')
    notifyWhatsApp: bool = Field(alias='notifyWhatsApp')
    model_config = ConfigDict(populate_by_name=True)

class QueryAttachment(BaseModel):
    id: str
    name: str
    sizeBytes: int = Field(alias='sizeBytes')
    type: Literal['image', 'document']
    mimeType: str = Field(alias='mimeType')
    model_config = ConfigDict(populate_by_name=True)

class MultimodalQuery(BaseModel):
    text: str
    source: Literal['voice', 'text', 'mixed']
    attachments: List[QueryAttachment]
    timestamp: str

Gender = Literal['male', 'female', 'other']
CasteCategory = Literal['SC', 'ST', 'OBC', 'General']
LoanNpaStatus = Literal['none', 'regular', 'npa']
LoanTypeNeeded = Literal['micro_finance', 'term_loan', 'education_loan']
BusinessSector = Literal['agriculture', 'manufacturing', 'services', 'trading', 'other']

class IdentityGroup(BaseModel):
    full_name: str
    age: int
    gender: Gender
    caste_category: CasteCategory
    id_proof_number: str
    disability_status: Optional[bool] = None
    disability_consent: Optional[bool] = None

class LocationGroup(BaseModel):
    state: str
    district: str
    village_or_town: str
    pincode: str
    is_rural: bool

class FinancialGroup(BaseModel):
    annual_family_income: float
    existing_loan_flag: bool
    existing_loan_npa_status: Optional[LoanNpaStatus] = None
    bank_account_ifsc: Optional[str] = None

class EnterpriseGroup(BaseModel):
    loan_type_needed: LoanTypeNeeded
    business_sector: BusinessSector
    is_new_venture: bool
    years_in_business: Optional[int] = None
    requested_loan_amount: float

class EducationGroup(BaseModel):
    highest_qualification: str
    course_name: str
    institution_name: str

class UploadedDocumentMeta(BaseModel):
    document_id: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    storage_url: Optional[str] = None
    upload_timestamp: str
    ocr_status: Literal['pending', 'queued', 'extracted', 'mismatch_flagged', 'verified'] = 'pending'
    extracted_fields: Optional[dict] = None

class DocumentsGroup(BaseModel):
    caste_certificate: UploadedDocumentMeta
    income_certificate: UploadedDocumentMeta
    id_proof: UploadedDocumentMeta
    address_proof: UploadedDocumentMeta
    business_proposal: Optional[UploadedDocumentMeta] = None

class BeneficiaryIntakeFormData(BaseModel):
    identity: IdentityGroup
    location: LocationGroup
    financial: FinancialGroup
    enterprise: EnterpriseGroup
    education: Optional[EducationGroup] = None
    documents: DocumentsGroup

class BeneficiaryProfileIdentity(BaseModel):
    full_name: str
    age: int
    gender: Gender
    id_proof_number_masked: str
    has_disability: bool

class BeneficiaryProfileDocuments(BaseModel):
    caste_certificate: UploadedDocumentMeta
    income_certificate: UploadedDocumentMeta
    id_proof: UploadedDocumentMeta
    address_proof: UploadedDocumentMeta
    business_proposal: Optional[UploadedDocumentMeta] = None

class BeneficiaryProfile(BaseModel):
    id: str
    identity: BeneficiaryProfileIdentity
    location: LocationGroup
    financial: FinancialGroup
    enterprise: EnterpriseGroup
    education: Optional[EducationGroup] = None
    documents: BeneficiaryProfileDocuments
    created_at: str
    updated_at: str

class SensitiveRecordRef(BaseModel):
    record_id: str
    storage_table: str = 'user_sensitive_attributes'
    access_role_required: str = 'ROLE_SENSITIVE_DATA_OFFICER'

class GraphNodeEmitted(BaseModel):
    node_id: str
    label: str = 'User'
    edges_created_at_intake: int = 0
    note: str = 'Scheme edges deferred until downstream eligibility evaluation'

class DocumentMismatchFlag(BaseModel):
    document_type: str
    field_name: str
    form_value: Any
    extracted_value: Any
    confidence_score: float
    severity: Literal['warning', 'critical']
    message: str

class DocumentProcessingResult(BaseModel):
    batch_id: str
    total_queued: int
    status: str = 'queued_for_multimodal_agent'
    mismatches: List[DocumentMismatchFlag] = []

class BeneficiaryIntakeResponse(BaseModel):
    success: bool
    status_code: int
    message: str
    timestamp: str
    beneficiary: BeneficiaryProfile
    sensitive_record_ref: SensitiveRecordRef
    graph_node_emitted: GraphNodeEmitted
    document_processing: DocumentProcessingResult

class AssistRequest(BaseModel):
    session_id: str = Field(alias='session_id')
    need_input: Any
    lang: LanguageCode = 'en'
    model_config = ConfigDict(populate_by_name=True)

class EMIRequest(BaseModel):
    scheme_id: str
    principal: float
    tenure_months: int

class SubmitApplicationRequest(BaseModel):
    scheme: Scheme
    emiData: EMICalculation = Field(alias='emiData')
    partner: PartnerBranch
    phone: str = '+91 98765 43210'
    whatsappAlert: bool = Field(default=True, alias='whatsappAlert')
    model_config = ConfigDict(populate_by_name=True)

class SessionResponse(BaseModel):
    session_id: str
    profile: Optional[dict] = None

class PerceptionVoiceResponse(BaseModel):
    transcript: str
    translation: str
    entities: dict
    profile_updates: Optional[dict] = None

class PerceptionDocumentResponse(BaseModel):
    extracted_fields: dict
    ocr_text: str
    mismatches: list

class AssistResponse(BaseModel):
    matched_schemes: List[Scheme]
    emi_plans: Optional[List[EMICalculation]] = None
    comparison_table: Optional[dict] = None
    ranked_partners: Optional[List[PartnerBranch]] = None
    citations: Optional[list] = None
    tts_audio_url: Optional[str] = None
    guardrail_flags: List[str] = []

class EMIResponse(BaseModel):
    emi_plans: List[EMICalculation]
    comparison_table: Optional[dict] = None

class PartnersResponse(BaseModel):
    ranked_partners: List[PartnerBranch]

class FeedbackRequest(BaseModel):
    session_id: str
    rating: Optional[int] = None
    comment: Optional[str] = None
    response_id: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: str
    retryable: bool = False

class TaskContract(BaseModel):
    task_id: str
    intent_query: str
    slice: Literal['scheme_match', 'emi_calculation', 'partner_locator']
    extracted_params: dict
