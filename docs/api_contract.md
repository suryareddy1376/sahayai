# Sahay AI Backend API Contract

This document captures the API expectations based on the frontend's mock services and data types.

## 1. Beneficiary Intake
**Endpoint:** `POST /api/intake`
**Request Body:** `BeneficiaryIntakeFormData` (JSON)
**Response:** `BeneficiaryIntakeResponse` (JSON)
*Semantics:* Validates the user profile, creates a Supabase record, emits a graph node, and queues document verification.

## 2. Multimodal Perception & Voice
**Endpoint:** `POST /api/perception/voice`
**Request:** `multipart/form-data` (audio file + `lang`)
**Response:** `{ transcript: string, translation: string, entities: any, profile_updates: any }`
*Semantics:* Transcribes regional voice and extracts intent/entities.

**Endpoint:** `POST /api/perception/document`
**Request:** `multipart/form-data` (file + `doc_type`)
**Response:** `{ extracted_fields: any, ocr_text: string, mismatches: any[] }`
*Semantics:* Extracts information from uploaded ID/income proofs.

## 3. Assist / JEV Supervisor (The Core Loop)
**Endpoint:** `POST /api/assist`
**Request Body:** 
```json
{
  "session_id": "string",
  "need_input": "string or BeneficiaryProfile object",
  "lang": "LanguageCode"
}
```
**Response:**
```json
{
  "matched_schemes": ["Array of Scheme objects"],
  "guardrail_flags": []
}
```
*Semantics:* Runs the JEV routing stub, invokes Scheme Match (RAG + Neo4j) to return eligible schemes.

## 4. EMI Calculation (Deterministic)
**Endpoint:** `POST /api/emi`
**Request Body:**
```json
{
  "scheme_id": "string",
  "principal": 100000,
  "tenure_months": 36
}
```
**Response:** `EMICalculation` object
*Semantics:* Calculates standard amortization EMI based on scheme's beneficiary interest rate.

## 5. Partner Locator
**Endpoint:** `GET /api/partners`
**Query Params:** `lat`, `lon`, `radius`, `scheme_id`
**Response:** `{"ranked_partners": ["Array of PartnerBranch objects"]}`
*Semantics:* Uses OSM (Nominatim + Overpass + OSRM) to find and rank nearest channel partners.

## 6. Applications (Tracker)
**Endpoint:** `POST /api/applications`
**Request Body:** `{ scheme, emiData, partner, phone, whatsappAlert }`
**Response:** `ApplicationTrackerData` object
*Semantics:* Submits the formal application to the partner branch and returns a tracker ID.

**Endpoint:** `GET /api/applications/:id`
**Response:** `ApplicationTrackerData`
*Semantics:* Fetches current tracker status.

## 7. Speech Out
**Endpoint:** `POST /api/tts`
**Request Body:** `{ text: string, lang: string }`
**Response:** `{ audio_url: string }` or `{ audio_base64: string }`
*Semantics:* Uses Sarvam/Bhashini to synthesize response audio.
