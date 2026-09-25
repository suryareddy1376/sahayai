
CREATE CONSTRAINT unique_scheme_id IF NOT EXISTS FOR (s:Scheme) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT unique_user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT unique_criterion_id IF NOT EXISTS FOR (c:EligibilityCriterion) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT unique_loan_term_id IF NOT EXISTS FOR (t:LoanTerm) REQUIRE t.id IS UNIQUE;

MERGE (s1:Scheme {id: 'nbcfdc-general-loan'})
SET s1.name = 'General Term Loan Scheme',
    s1.corporation = 'NBCFDC',
    s1.category = 'term',
    s1.source = 'official-verified',
    s1.official_url = 'https://nbcfdc.gov.in/loan-schemes',
    s1.last_verified = '2026-09-25';

MERGE (c1a:EligibilityCriterion {id: 'nbcfdc-general-caste'})
SET c1a.type = 'caste', c1a.value = 'OBC';
MERGE (c1b:EligibilityCriterion {id: 'nbcfdc-general-income'})
SET c1b.type = 'income', c1b.value = 300000;

MERGE (s1)-[:REQUIRES]->(c1a);
MERGE (s1)-[:REQUIRES]->(c1b);

MERGE (t1a:LoanTerm {id: 'nbcfdc-general-tierA'})
SET t1a.label = 'Tier A', t1a.max_amount = 500000, t1a.interest_beneficiary_pct = 6.0, t1a.interest_agency_pct = 3.0, t1a.repayment_years = 8;
MERGE (t1b:LoanTerm {id: 'nbcfdc-general-tierB'})
SET t1b.label = 'Tier B', t1b.max_amount = 1000000, t1b.interest_beneficiary_pct = 7.0, t1b.interest_agency_pct = 4.0, t1b.repayment_years = 8;
MERGE (t1c:LoanTerm {id: 'nbcfdc-general-tierC'})
SET t1c.label = 'Tier C', t1c.max_amount = 1500000, t1c.interest_beneficiary_pct = 8.0, t1c.interest_agency_pct = 5.0, t1c.repayment_years = 8;

MERGE (s1)-[:HAS_TIER]->(t1a);
MERGE (s1)-[:HAS_TIER]->(t1b);
MERGE (s1)-[:HAS_TIER]->(t1c);

MERGE (s2:Scheme {id: 'nbcfdc-micro-finance'})
SET s2.name = 'Micro Finance Scheme',
    s2.corporation = 'NBCFDC',
    s2.category = 'micro',
    s2.source = 'official-verified',
    s2.official_url = 'https://nbcfdc.gov.in/loan-schemes';

MERGE (s2)-[:REQUIRES]->(c1a);
MERGE (s2)-[:REQUIRES]->(c1b);

MERGE (t2a:LoanTerm {id: 'nbcfdc-micro-individual'})
SET t2a.label = 'Individual', t2a.max_amount = 140000, t2a.interest_beneficiary_pct = 6.5, t2a.repayment_years = 3;
MERGE (t2b:LoanTerm {id: 'nbcfdc-micro-shg'})
SET t2b.label = 'SHG Group', t2b.max_amount = 250000, t2b.interest_beneficiary_pct = 5.0, t2b.repayment_years = 3;

MERGE (s2)-[:HAS_TIER]->(t2a);
MERGE (s2)-[:HAS_TIER]->(t2b);

MERGE (s3:Scheme {id: 'nbcfdc-new-swarnima-women'})
SET s3.name = 'New Swarnima Scheme for Women',
    s3.corporation = 'NBCFDC',
    s3.category = 'micro',
    s3.source = 'official-verified';

MERGE (c3g:EligibilityCriterion {id: 'nbcfdc-swarnima-gender'})
SET c3g.type = 'gender', c3g.value = 'female';

MERGE (s3)-[:REQUIRES]->(c1a);
MERGE (s3)-[:REQUIRES]->(c1b);
MERGE (s3)-[:REQUIRES]->(c3g);

MERGE (t3:LoanTerm {id: 'nbcfdc-swarnima-tier'})
SET t3.label = 'Women Micro', t3.max_amount = 200000, t3.interest_beneficiary_pct = 5.0, t3.repayment_years = 5;
MERGE (s3)-[:HAS_TIER]->(t3);

MERGE (s7:Scheme {id: 'nsfdc-micro-finance'})
SET s7.name = 'Micro Credit Finance (MCF) Scheme',
    s7.corporation = 'NSFDC',
    s7.category = 'micro',
    s7.source = 'official-verified',
    s7.official_url = 'https://nsfdc.nic.in/en/micro-credit-finance',
    s7.income_revision_note = 'Income limit revised from Rs.3L to Rs.5L effective 2026-01-07';

MERGE (c7a:EligibilityCriterion {id: 'nsfdc-caste'})
SET c7a.type = 'caste', c7a.value = 'SC';
MERGE (c7b:EligibilityCriterion {id: 'nsfdc-income'})
SET c7b.type = 'income', c7b.value = 500000;

MERGE (s7)-[:REQUIRES]->(c7a);
MERGE (s7)-[:REQUIRES]->(c7b);

MERGE (t7:LoanTerm {id: 'nsfdc-mcf-standard'})
SET t7.label = 'Standard', t7.max_amount = 125000, t7.interest_beneficiary_pct = 6.5, t7.repayment_years = 3;
MERGE (s7)-[:HAS_TIER]->(t7);

MERGE (s8:Scheme {id: 'nsfdc-term-loan'})
SET s8.name = 'Term Loan Scheme',
    s8.corporation = 'NSFDC',
    s8.category = 'term',
    s8.source = 'official-verified',
    s8.official_url = 'https://nsfdc.nic.in/en/term-loan';

MERGE (s8)-[:REQUIRES]->(c7a);
MERGE (s8)-[:REQUIRES]->(c7b);

MERGE (t8a:LoanTerm {id: 'nsfdc-term-tierA'})
SET t8a.label = 'Up to 5L', t8a.max_amount = 500000, t8a.interest_beneficiary_pct = 6.0, t8a.repayment_years = 7;
MERGE (t8b:LoanTerm {id: 'nsfdc-term-tierB'})
SET t8b.label = '5L to 15L', t8b.max_amount = 1500000, t8b.interest_beneficiary_pct = 7.0, t8b.repayment_years = 7;
MERGE (t8c:LoanTerm {id: 'nsfdc-term-tierC'})
SET t8c.label = '15L to 45L', t8c.max_amount = 4500000, t8c.interest_beneficiary_pct = 8.0, t8c.repayment_years = 7;

MERGE (s8)-[:HAS_TIER]->(t8a);
MERGE (s8)-[:HAS_TIER]->(t8b);
MERGE (s8)-[:HAS_TIER]->(t8c);

MERGE (s9:Scheme {id: 'nsfdc-mahila-samriddhi'})
SET s9.name = 'Mahila Samriddhi Yojana',
    s9.corporation = 'NSFDC',
    s9.category = 'micro',
    s9.source = 'official-verified',
    s9.official_url = 'https://nsfdc.nic.in/en/mahila-samriddhi-yojana';

MERGE (c9g:EligibilityCriterion {id: 'nsfdc-mahila-gender'})
SET c9g.type = 'gender', c9g.value = 'female';

MERGE (s9)-[:REQUIRES]->(c7a);
MERGE (s9)-[:REQUIRES]->(c7b);
MERGE (s9)-[:REQUIRES]->(c9g);

MERGE (t9:LoanTerm {id: 'nsfdc-mahila-tier'})
SET t9.label = 'Women Micro', t9.max_amount = 125000, t9.interest_beneficiary_pct = 4.0, t9.repayment_years = 3;
MERGE (s9)-[:HAS_TIER]->(t9);

MERGE (demo:User {id: 'demo-beneficiary-001'})
SET demo.full_name = 'Ramesh Kumar',
    demo.age = 35,
    demo.gender = 'male',
    demo.state = 'Uttar Pradesh',
    demo.district = 'Lucknow',
    demo.village_or_town = 'Aliganj',
    demo.pincode = '226024',
    demo.is_rural = false,
    demo.annual_family_income = 240000,
    demo.existing_loan_flag = false,
    demo.loan_type_needed = 'micro_finance',
    demo.business_sector = 'services',
    demo.is_new_venture = false,
    demo.requested_loan_amount = 80000,
    demo.registered_at = datetime();

