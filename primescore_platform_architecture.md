# PrimeScore Partner Network — Comprehensive Enterprise System Architecture & Workflows

This document outlines the end-to-end operational architecture, state transition engines, verification audit flows, commission calculations, and the complete multi-schema PostgreSQL database model powering the **PrimeScore Partner Portal**.

---

## 1. Individual Partner Registration, Document Verification & Lead Reward Lifecycle

```mermaid
flowchart TD
    subgraph PartnerOnboarding ["1. Partner Registration & Profile Creation"]
        A["Visitor opens Registration Form (/register)"] --> B["Select 'Individual Partner' Account Type"]
        B --> C["Enter Personal Details: Full Name, Email, Phone, Profession, City, State"]
        C --> D["Upload Profile Picture (Passport Headshot JPG/PNG)"]
        D --> E["Upload Verification Documents: PAN Card PDF/Image, Aadhaar Number/PDF"]
        E --> F["Enter Bank Details: Bank Name, Account Number, IFSC Code, Account Holder Name"]
        F --> G["Accept Digital Partner Network T&C Agreement"]
        G --> H["Submit Application -> DB Record Created (Status: PENDING_KYC_SUBMITTED)"]
    end

    subgraph AdminVerificationWorkflow ["2. Super Admin Verification & KYC Audit (/admin/kyc)"]
        H --> I["Super Admin views pending queue in Admin Console"]
        I --> J{"Admin Audits PAN, Aadhaar & Bank Details"}
        J -- "Mismatch / Corrupt Document" --> K["Admin enters Rejection Reason"]
        K --> L["DB Update: Status -> KYC_REJECTED"]
        L --> M["Trigger Automated SMS / Email Notification to Partner"]
        
        J -- "Documents Verified & Valid" --> N["Admin clicks 'Approve KYC'"]
        N --> O["DB Update: Status -> KYC_APPROVED & ACTIVE"]
        O --> P["System allocates Partner Unique Referrer Code (e.g. IND-SR-102)"]
        P --> Q["Partner receives Activated Portal Access + Digital ID Card Badge"]
    end

    subgraph LeadSubmissionPipeline ["3. 5-Stage Client Referral Lifecycle & Reward Accrual"]
        Q --> R["Partner Submits Client Lead (/refer)"]
        R --> S["DB Record Created (Stage: 1. SUBMITTED)"]
        S --> T["Admin assigns Lead to Credit Advisor -> DB Update (Stage: 2. RECEIVED)"]
        T --> U["Advisor contacts client & onboards -> DB Update (Stage: 3. ENROLLED)"]
        U -- "Onboarding Bonus" --> V["Automated Credit: +20 PrimePoints to Partner Balance"]
        U --> W["Advisor files Bureau Disputes -> DB Update (Stage: 4. IN_PROGRESS)"]
        W --> X["Credit Rectification Resolved & Closed -> DB Update (Stage: 5. COMPLETED)"]
        X -- "Completion Payout" --> Y["Automated Credit: +500 PrimePoints to Partner Balance"]
    end

    subgraph VoucherRedemptionEngine ["4. OTP Verification & Manual SMS Voucher Dispatch Workflow (/redeem)"]
        Y --> Z["Partner selects Gift Card Brand & Denomination (e.g., ₹500 Amazon Pay = 5,000 Pts)"]
        Z --> AA{"Check Partner PrimePoints Balance >= Points Required"}
        AA -- "Insufficient Points" --> AB["Display Error: Insufficient Points"]
        AA -- "Sufficient Balance" --> AC["Partner clicks 'Send OTP & Confirm Claim'"]
        AC --> AD["System dispatches 4-Digit Security OTP to Partner Phone"]
        AD --> AE{"Partner Enters & Verifies Security OTP"}
        AE -- "Invalid OTP" --> AF["Display OTP Mismatch Error"]
        AE -- "OTP Verified" --> AG["DB Transaction: Deduct 5,000 Points & Queue Redemption Request"]
        AG --> AH["Admin Verification Desk receives Manual Voucher Dispatch Task"]
        AH --> AI["Admin allocates Voucher Code & dispatches SMS to Partner Mobile Number"]
    end
```

---

## 2. Team Leader Signup, QR Code Generation & Sub-Agent 2-Tier Hierarchy Workflow

```mermaid
flowchart TD
    subgraph TeamLeaderSetup ["1. Team Leader Account Provisioning"]
        TL1["Applicant Registers as 'Team Leader / Agency Lead'"] --> TL2["Submits Professional Credentials & PAN/Aadhaar/Bank Details"]
        TL2 --> TL3["Super Admin Audits & Approves KYC Application"]
        TL3 --> TL4["System generates Unique Leader Code (e.g., TL-ARJUN-884)"]
        TL4 --> TL5["System provisions Unique Invite Link: partner.primescore.in/register?ref=TL-ARJUN-884"]
        TL5 --> TL6["System builds Vector QR Code for HD PNG Download & Offline Poster Printing"]
    end

    subgraph SubAgentOnboarding ["2. Sub-Agent Registration under Team Leader"]
        SA1["Sub-Agent scans QR Code or clicks Unique Referral Link"] --> SA2["Signup Form auto-loads with Leader Code pre-filled & locked"]
        SA2 --> SA3["Sub-Agent fills Personal, Professional & KYC Verification Documents"]
        SA3 --> SA4["Account Role assigned: TEAM_MEMBER | Leader ID bound to Leader Account"]
        SA4 --> SA5["DB Record Created (Status: PENDING_TEAM_LEADER_REVIEW)"]
    end

    subgraph Tier1TeamLeaderApproval ["3. Tier 1 Verification: Team Leader Hub (/team/verifications)"]
        SA5 --> TL_REV{"Team Leader inspects Applicant Roster"}
        TL_REV -- "Reject Applicant" --> TL_REJ["Status -> REJECTED_BY_LEADER (Notification Sent)"]
        TL_REV -- "Approve & Forward" --> TL_APP["Status -> FORWARDED_TO_ADMIN (Pushed to Super Admin Queue)"]
    end

    subgraph Tier2AdminApproval ["4. Tier 2 Verification: Primescore Super Admin Final Audit"]
        TL_APP --> ADM_REV{"Super Admin Audits Sub-Agent PAN, Aadhaar & Bank Details"}
        ADM_REV -- "Admin Rejects" --> ADM_REJ["Status -> KYC_REJECTED"]
        ADM_REV -- "Admin Approves" --> ADM_APP["Status -> KYC_APPROVED & ACTIVE TEAM ADVISOR"]
    end

    subgraph DualCommissionDistribution ["5. Automated Dual-Tier Commission Engine"]
        ADM_APP --> LEAD1["Sub-Agent Submits Client Referral Lead"]
        LEAD1 --> CASE_SUCCESS["Primescore resolves & completes Client Credit Rectification"]
        CASE_SUCCESS --> PAYOUT1["Direct Payout: +500 PrimePoints credited to Sub-Agent Balance"]
        CASE_SUCCESS --> PAYOUT2["Automated 10% Override Calculation: 500 Pts * 10% = +50 PrimePoints"]
        PAYOUT2 --> PAYOUT3["Passive Credit: +50 PrimePoints credited to Team Leader Balance"]
        PAYOUT3 --> LOG_AUDIT["Audit Log Record created in OVERRIDE_PAYOUT_LOGS table"]
    end
```

---

## 3. Exhaustive Enterprise Database Schema (PostgreSQL / Supabase ERD)

```mermaid
erDiagram
    USERS ||--o| PARTNERS : "has profile"
    USERS ||--o| ADMIN_USERS : "has staff role"
    PARTNERS ||--o{ TEAM_MEMBERS : "manages sub-agents"
    PARTNERS ||--o{ REFERRALS : "submits direct referrals"
    TEAM_MEMBERS ||--o{ REFERRALS : "submits member referrals"
    PARTNERS ||--o{ REDEMPTIONS : "initiates gift card redemptions"
    PARTNERS ||--o{ OVERRIDE_PAYOUT_LOGS : "receives 10% override"
    PARTNERS ||--o{ KYC_DOCUMENTS : "owns verification docs"
    PARTNERS ||--o{ BANK_ACCOUNTS : "receives payouts"
    REFERRALS ||--o{ REFERRAL_STATUS_HISTORY : "tracks 5-stage progress"
    GIFT_CARD_BRANDS ||--o{ VOUCHER_VAULT : "maintains code inventory"
    REDEMPTIONS ||--|| VOUCHER_VAULT : "claims code"

    USERS {
        uuid id PK
        string email UK
        string phone_number UK
        string encrypted_password
        boolean is_active
        timestamp last_login_at
        timestamp created_at
    }

    ADMIN_USERS {
        uuid id PK
        uuid user_id FK
        string full_name
        string designation "CEO | Tech Lead | KYC Auditor | Support Officer"
        enum admin_role "super_admin | kyc_auditor | referral_manager"
        timestamp created_at
    }

    PARTNERS {
        uuid id PK
        uuid user_id FK
        string full_name
        string phone
        string email
        string profession "CA | CS | DSA | Financial Advisor | Loan Consultant"
        string profile_photo_url
        string city
        string state
        string pan_number UK
        enum role "individual | team_leader | team_member"
        enum kyc_status "pending_kyc | kyc_submitted | kyc_approved | kyc_rejected"
        string team_code UK
        uuid referred_by_leader_id FK
        integer primepoints_balance
        integer lifetime_points_earned
        timestamp created_at
        timestamp updated_at
    }

    KYC_DOCUMENTS {
        uuid id PK
        uuid partner_id FK
        enum document_type "pan_card | aadhaar_front | aadhaar_back | cancelled_cheque"
        string document_file_url
        string document_number_hash
        enum verification_status "submitted | verified | rejected"
        string rejection_reason
        uuid verified_by_admin_id FK
        timestamp verified_at
        timestamp uploaded_at
    }

    BANK_ACCOUNTS {
        uuid id PK
        uuid partner_id FK
        string account_holder_name
        string bank_name
        string account_number_encrypted
        string ifsc_code
        string branch_name
        boolean is_verified
        timestamp verified_at
    }

    TEAM_MEMBERS {
        uuid id PK
        uuid team_leader_partner_id FK
        uuid sub_agent_partner_id FK
        string full_name
        string email
        string phone
        string profession
        string city
        enum leader_approval_status "pending_tl_review | approved_by_tl | rejected_by_tl"
        enum admin_approval_status "pending_admin_audit | kyc_approved | kyc_rejected"
        integer total_cases_completed
        integer total_member_points_earned
        integer total_leader_override_generated
        timestamp joined_at
    }

    REFERRALS {
        uuid id PK
        uuid partner_id FK
        uuid team_member_id FK
        string customer_name
        string customer_phone
        string customer_email
        string city
        string service_type "Bureau Report | Credit Rectification | Loan Advisory"
        string customer_notes
        enum current_stage "submitted | received | enrolled | in_progress | completed | rejected"
        integer partner_points_earned
        integer leader_override_points_earned
        uuid assigned_advisor_id FK
        timestamp created_at
        timestamp updated_at
    }

    REFERRAL_STATUS_HISTORY {
        uuid id PK
        uuid referral_id FK
        enum stage "submitted | received | enrolled | in_progress | completed | rejected"
        string note_details
        uuid updated_by_user_id FK
        timestamp timestamp
    }

    OVERRIDE_PAYOUT_LOGS {
        uuid id PK
        uuid team_leader_id FK
        uuid sub_agent_id FK
        uuid referral_id FK
        integer base_case_points "500"
        decimal override_percentage "10.0"
        integer override_points_credited "50"
        timestamp processed_at
    }

    GIFT_CARD_BRANDS {
        uuid id PK
        string brand_name UK "Amazon Pay | Flipkart | Swiggy | PhonePe | Myntra | IRCTC"
        string logo_url
        string brand_theme_color
        integer_array allowed_denominations "[100, 250, 500, 1000]"
        integer total_vouchers_in_stock
        integer total_points_burned
        integer total_inr_expense
        boolean is_active
    }

    VOUCHER_VAULT {
        uuid id PK
        uuid brand_id FK
        integer denomination_inr
        string voucher_code_encrypted
        string pin_code_encrypted
        string batch_number
        boolean is_claimed
        uuid claimed_by_partner_id FK
        timestamp claimed_at
        timestamp created_at
    }

    REDEMPTIONS {
        uuid id PK
        uuid partner_id FK
        uuid voucher_id FK
        string brand_name
        integer denomination_inr
        integer points_burned
        timestamp redeemed_at
    }
```
