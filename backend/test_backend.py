import httpx
import asyncio

async def run_tests():
    print("Testing backend API endpoints...")
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # 1. Health
        print("\n--- 1. Testing /api/health ---")
        r = await client.get("/api/health")
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")

        # 2. Intake
        print("\n--- 2. Testing /api/intake ---")
        form_data = {
            "identity": {
                "full_name": "Rani Devi", "age": 35, "gender": "female",
                "caste_category": "OBC", "id_proof_number": "123456789012"
            },
            "location": {
                "state": "UP", "district": "Lucknow", "village_or_town": "Aliganj",
                "pincode": "226024", "is_rural": False
            },
            "financial": {
                "annual_family_income": 200000, "existing_loan_flag": False
            },
            "enterprise": {
                "loan_type_needed": "micro_finance", "business_sector": "manufacturing",
                "is_new_venture": True, "requested_loan_amount": 50000
            },
            "documents": {
                "caste_certificate": {"document_id": "d1", "file_name": "c.pdf", "file_size_bytes": 100, "mime_type": "application/pdf", "upload_timestamp": "2026-01-01"},
                "income_certificate": {"document_id": "d2", "file_name": "i.pdf", "file_size_bytes": 100, "mime_type": "application/pdf", "upload_timestamp": "2026-01-01"},
                "id_proof": {"document_id": "d3", "file_name": "id.pdf", "file_size_bytes": 100, "mime_type": "application/pdf", "upload_timestamp": "2026-01-01"},
                "address_proof": {"document_id": "d4", "file_name": "a.pdf", "file_size_bytes": 100, "mime_type": "application/pdf", "upload_timestamp": "2026-01-01"}
            }
        }
        r = await client.post("/api/intake", json=form_data)
        print(f"Status: {r.status_code}")
        if r.status_code == 200 or r.status_code == 201:
            print(f"Success: {r.json().get('success')}")
            print(f"Beneficiary ID: {r.json().get('beneficiary', {}).get('id')}")
        else:
            print(f"Error: {r.text}")

        # 3. Assist
        print("\n--- 3. Testing /api/assist ---")
        assist_req = {
            "session_id": "test-session-1",
            "need_input": "I am a woman looking for a sewing machine loan of 50000 rupees",
            "lang": "en"
        }
        r = await client.post("/api/assist", json=assist_req)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print("Matched schemes:", [s.get('name') for s in data.get('matched_schemes', [])])
            print(f"EMI plans computed: {len(data.get('emi_plans', []))}")
            if data.get('emi_plans'):
                print("First EMI Plan:", data['emi_plans'][0]['monthlyEMI'], "rupees/month")
            print(f"Ranked partners found: {len(data.get('ranked_partners', []))}")
        else:
            print(f"Error: {r.text}")

asyncio.run(run_tests())
