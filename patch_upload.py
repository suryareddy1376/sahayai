import re

with open('src/components/BeneficiaryIntakeForm.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import for uploadDocument
if "from '../services/supabaseClient'" not in code:
    code = code.replace(
        "import { submitBeneficiaryIntakeApi }",
        "import { uploadDocument } from '../services/supabaseClient';\nimport { submitBeneficiaryIntakeApi }"
    )

# Add pendingFiles state
code = code.replace(
    "const [isSubmitting, setIsSubmitting] = useState(false);",
    "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});"
)

# Modify updateDocument to save file to pendingFiles
old_update = """  const updateDocument = (
    docKey: keyof BeneficiaryIntakeFormData['documents'],
    file: File | null,
    sampleName?: string
  ) => {
    if (!file && !sampleName) return;
    const name = file ? file.name : sampleName!;
    const size = file ? file.size : 280000;
    const meta: UploadedDocumentMeta = {
      document_id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      file_name: name,
      file_size_bytes: size,
      mime_type: file ? file.type : 'application/pdf',
      upload_timestamp: new Date().toISOString(),
      ocr_status: 'queued',
    };
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: meta,
      },
    }));
  };"""

new_update = """  const updateDocument = (
    docKey: keyof BeneficiaryIntakeFormData['documents'],
    file: File | null,
    sampleName?: string
  ) => {
    if (!file && !sampleName) return;
    const name = file ? file.name : sampleName!;
    const size = file ? file.size : 280000;
    const meta: UploadedDocumentMeta = {
      document_id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      file_name: name,
      file_size_bytes: size,
      mime_type: file ? file.type : 'application/pdf',
      upload_timestamp: new Date().toISOString(),
      ocr_status: 'queued',
    };
    
    if (file) {
      setPendingFiles(prev => ({ ...prev, [docKey]: file }));
    }

    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: meta,
      },
    }));
  };"""

code = code.replace(old_update, new_update)

# Modify handleSubmit to upload files before calling API
old_submit = """    setIsSubmitting(true);
    setValidationErrors([]);
    setUnauthorizedAccessResult(null);

    // Client-side dry validation check
    const valResult = { isValid: true, errors: [] as ValidationError[] };
    if (!valResult.isValid) {
      setValidationErrors(valResult.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await submitBeneficiaryIntakeApi(formData);"""

new_submit = """    setIsSubmitting(true);
    setValidationErrors([]);
    setUnauthorizedAccessResult(null);

    // Client-side dry validation check
    const valResult = { isValid: true, errors: [] as ValidationError[] };
    if (!valResult.isValid) {
      setValidationErrors(valResult.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload files to Supabase S3
      const newDocs = { ...formData.documents };
      for (const [docKey, file] of Object.entries(pendingFiles)) {
        let folderName = 'ID Proof';
        if (docKey === 'caste_certificate') folderName = 'Caste Certificate';
        if (docKey === 'income_certificate') folderName = 'Income Certificate';
        if (docKey === 'address_proof') folderName = 'Address Proof';
        
        const path = await uploadDocument(file, folderName);
        if (path) {
          (newDocs as any)[docKey].storage_url = path;
        }
      }
      
      const finalData = { ...formData, documents: newDocs };

      // 2. Submit to Backend API
      const response = await submitBeneficiaryIntakeApi(finalData);"""

code = code.replace(old_submit, new_submit)

with open('src/components/BeneficiaryIntakeForm.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
