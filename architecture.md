# 🏗️ Primescore Partner Portal — Full Architecture Reference

> Last updated: Aug 28, 2026

---

## 1. System Overview

The Primescore Partner Portal is a **Next.js 15 App Router** application backed by **Supabase** (PostgreSQL + Auth + Realtime). It serves three distinct user groups through separate route segments:

```mermaid
graph TD
    A["🌐 Browser Client"] -->|"Auth route"| B["(auth) — Login / Register"]
    A -->|"Partner portal"| C["(portal) — Partner Dashboard"]
    A -->|"Admin panel"| D["admin/ — Admin HQ"]

    B -->|"Supabase Auth signIn"| E[("Supabase\nPostgreSQL")]
    C -->|"RLS anon key"| E
    D -->|"Service Role key\n(API routes only)"| E

    E -->|"Realtime websocket"| F["useSupabaseSync.ts\n(hydrates Zustand)"]
    F --> G["usePartnerStore\n(Zustand)"]
    F --> H["useAdminStore\n(Zustand)"]

    G --> C
    H --> D
```

---

## 2. User Roles & Auth Flow

```mermaid
flowchart LR
    subgraph Roles
        P["👤 Individual Partner\nrole = individual"]
        TL["👥 Team Leader\nrole = team_leader"]
        TM["🔸 Team Member\nrole = team_member"]
        SA["🔐 Super Admin\nrole = super_admin"]
        OA["🛠️ Operations Admin\nrole = operations_admin"]
    end

    subgraph Auth
        SB["Supabase Auth"]
        PR["profiles table"]
    end

    P --> SB
    TL --> SB
    TM --> SB
    SA -->|"admin_staff table\nor ALLOWED_ADMIN_EMAILS"| SB
    OA -->|"admin_staff table"| SB

    SB --> PR
    PR -->|"status field"| KYC{"KYC Status"}
    KYC -->|"kyc_approved"| Portal["Partner Portal Access"]
    KYC -->|"kyc_submitted"| Pending["KYC Under Review Screen"]
    KYC -->|"kyc_rejected"| Rejected["Rejection Notice"]
```

### Admin Login Flow (Multi-Fallback)

```mermaid
sequenceDiagram
    participant Admin
    participant adminLogin
    participant AuditRoute as /api/admin/audit-log
    participant LocalStaff as Zustand staff[]
    participant DB as Supabase admin_staff
    participant Auth as Supabase Auth

    Admin->>adminLogin: email + password
    adminLogin->>AuditRoute: POST (x-admin-password header)
    AuditRoute-->>adminLogin: 200 OK → ✅ set _adminPass in store
    alt API route fails
        adminLogin->>LocalStaff: check staff[].password
        LocalStaff-->>adminLogin: match → ✅
        alt No local match
            adminLogin->>DB: SELECT from admin_staff WHERE email
            DB-->>adminLogin: match → ✅
            alt No DB match
                adminLogin->>Auth: signInWithPassword
                Auth-->>adminLogin: check role = admin/super_admin → ✅
            end
        end
    end
    adminLogin->>adminLogin: store._adminPass = typedPassword
```

> **Security Note:** `ADMIN_PASSWORD` is a server-only env var (no `NEXT_PUBLIC_` prefix). The typed password is stored in-memory in `_adminPass` (Zustand, session-scoped, not persisted) and sent as `x-admin-password` header to API routes for authorization.

---

## 3. Feature Access Map

| Feature | Individual Partner | Team Leader | Team Member | Admin |
|---|---|---|---|---|
| Dashboard (overview metrics) | ✅ | ✅ | ✅ | ✅ (admin overview) |
| Submit Lead / Referral | ✅ | ✅ | ✅ | ➕ manual via ManualAddLeadModal |
| View own referral pipeline | ✅ | ✅ | ✅ | — |
| View team members' referrals | — | ✅ (team page) | — | ✅ (all teams) |
| Override points (10% team override) | — | Received automatically | — | Configurable |
| Redeem PrimePoints (gift cards) | ✅ | ✅ | ✅ | — |
| View PrimePoints & transactions | ✅ | ✅ | ✅ | ✅ per partner |
| Tier status & progress | ✅ (rewards page) | ✅ | ✅ | — |
| Referral QR code / share link | ✅ | ✅ | ✅ | — |
| KYC submission | ✅ | ✅ | ✅ | — |
| KYC approval/rejection | — | — | — | ✅ (kyc/[id]) |
| Lead pipeline progression | — | — | — | ✅ (referrals/[id]) |
| Manual issue points | — | — | — | ✅ (issueAdminPoints) |
| Send in-app notifications | — | — | — | ✅ (notifications) |
| Broadcast announcements | — | — | — | ✅ (broadcast) |
| Manage gift cards catalog | — | — | — | ✅ |
| Approve redemptions + issue vouchers | — | — | — | ✅ (gift-cards) |
| Reward engine config | — | — | — | ✅ (rewards-config) |
| Analytics dashboard | — | — | — | ✅ |
| Staff management | — | — | — | ✅ (super_admin only) |

---

## 4. Database Schema — Key Tables

```mermaid
erDiagram
    profiles {
        uuid id PK
        text name
        text email
        text phone
        text profession
        text city
        text state
        text pan
        text aadhaar
        text status "kyc_submitted or kyc_approved or kyc_rejected"
        text role "individual or team_leader or team_member"
        text team_code
        text user_referral_code
        uuid referred_by_leader_id FK
        int prime_points "spendable balance"
        int lifetime_points_earned "tier calculation base"
        text avatar_url
        bool is_email_verified
        timestamptz kyc_submitted_at
        timestamptz joined_at
    }

    referrals {
        uuid id PK
        uuid partner_id FK
        text customer_name
        text customer_phone
        text customer_email
        text city
        text service_name
        text notes
        text current_stage "submitted or received or enrolled or in_progress or completed or rejected"
        jsonb status_history
        int partner_points_earned
        int points_earned
        numeric service_amount
        timestamptz created_at
        timestamptz updated_at
    }

    point_transactions {
        uuid id PK
        uuid partner_id FK
        uuid referral_id FK
        text transaction_type "signup_bonus or enrolled_earned or referral_earned or team_override or voucher_redeemed or admin_issued or referral_reversal"
        int points_change "+ve or -ve"
        int amount "absolute value"
        int balance_after
        text title "display text"
        text description
        text reference_id
        timestamptz created_at
    }

    notifications {
        uuid id PK
        uuid partner_id FK
        text title
        text message
        text type "info or success or warning or reward"
        text points_badge
        bool is_read
        timestamptz created_at
    }

    referral_status_history {
        uuid id PK
        uuid referral_id FK
        text stage
        text note_details
        timestamptz updated_at
    }

    bank_accounts {
        uuid id PK
        uuid partner_id FK
        text account_holder_name
        text bank_name
        text account_number
        text ifsc_code
        bool is_verified
    }

    system_config {
        text id PK "global_reward_config"
        int submission_points
        int enrollment_points
        int conversion_points
        int team_leader_override_percent
        int points_per_inr
        int min_redemption_points
        timestamptz updated_at
    }

    profiles ||--o{ referrals : "partner_id"
    profiles ||--o{ point_transactions : "partner_id"
    profiles ||--o{ notifications : "partner_id"
    profiles ||--o{ bank_accounts : "partner_id"
    profiles ||--o{ profiles : "referred_by_leader_id"
    referrals ||--o{ point_transactions : "referral_id"
    referrals ||--o{ referral_status_history : "referral_id"
```

---

## 5. Points Economy — Full Flow

### 5.1 Where Points Come From

```mermaid
flowchart TD
    subgraph Triggers["🎯 Point Trigger Events"]
        A["KYC Approved\n(first time)"]
        B["Client Enrolled\non Platform"]
        C["Case Completed\n(service delivered)"]
        D["Admin Manual Issue"]
        E["Redemption\n(voucher claimed)"]
    end

    subgraph Awarded["💰 Points Awarded"]
        A --> A1["+100 PrimePoints\nSignup Bonus (fixed)"]
        B --> B1["+100 Silver\n+125 Gold\n+150 Platinum\ntier-based enrollment pts"]
        C --> C1["10 or 12 or 15 percent of\nservice_amount\ntier-based commission"]
        D --> D1["Any +/- amount\nadmin discretion"]
        E --> E1["minus points_required\ndeducted from balance"]
    end

    subgraph Also["🔗 Also Triggers"]
        B1 -->|"If partner has Team Leader"| TL1["+10% override to\nTeam Leader"]
        C1 -->|"If partner has Team Leader"| TL2["+10% override to\nTeam Leader"]
    end
```

### 5.2 Points Calculation Logic

| Event | Formula | Who Triggers | File |
|---|---|---|---|
| KYC Approval | `+100` flat | Admin (approveKyc) | `lib/admin-store.ts` |
| Client Enrolled | `getReferredUserEnrollmentPoints(partnerTier)` → 100/125/150 | Admin (referrals/[id]) | `app/admin/referrals/[id]/page.tsx` |
| Case Completed | `round(serviceAmount × commissionRate / 100)` where rate = 10/12/15% | Admin (CompleteCaseModal) | `components/admin/CompleteCaseModal.tsx` |
| Team Override | `round(partnerPoints × 0.10)` | Auto on completion | `components/admin/CompleteCaseModal.tsx` |
| Admin Issued | Manual amount (+ or -) | Admin (issueAdminPoints) | `lib/admin-store.ts` |
| Voucher Redemption | `-(denomination × pointsPerInr)` | Partner (redeem page) | `app/(portal)/redeem/page.tsx` |

### 5.3 Tier Calculation

```mermaid
graph LR
    A["lifetime_points_earned\nDB column"] --> B{Tier Check}
    B -->|"less than 20000"| S["Silver\n10% commission\n+100 enrollment pts"]
    B -->|"20000 or more"| G["Gold\n12% commission\n+125 enrollment pts"]
    B -->|"50000 or more"| P["Platinum\n15% commission\n+150 enrollment pts"]
```

> **Key design:** `prime_points` is the spendable balance (goes down on redemption). `lifetime_points_earned` is the tier basis (never decreases). Both are columns in `profiles`. Tier uses lifetime so redemptions don't lower your tier.

---

## 6. Full Lead/Referral Pipeline

```mermaid
stateDiagram-v2
    [*] --> submitted : Partner submits lead
    submitted --> received : Admin marks received
    received --> enrolled : Admin marks enrolled
    enrolled --> in_progress : Admin marks disputes filed
    in_progress --> completed : Admin opens CompleteCaseModal

    submitted --> rejected : Admin cancels
    received --> rejected : Admin cancels
    enrolled --> rejected : Admin cancels
    in_progress --> rejected : Admin cancels
    completed --> [*]
```

### Stage Transition — Who Does What

```mermaid
sequenceDiagram
    participant Partner
    participant AdminUI as Admin referrals/id
    participant CompleteCaseModal
    participant Supabase
    participant PartnerDash as Partner Dashboard

    Partner->>AdminUI: Lead submitted (DB insert)
    AdminUI->>Supabase: current_stage = received
    AdminUI->>Supabase: current_stage = enrolled
    Supabase->>Supabase: profiles.prime_points += enrollPts\nprofiles.lifetime_points_earned += enrollPts\npoint_transactions INSERT enrolled_earned\nreferral_status_history INSERT
    AdminUI->>Supabase: current_stage = in_progress
    AdminUI->>CompleteCaseModal: Opens with service_amount input
    CompleteCaseModal->>Supabase: current_stage = completed\nservice_amount = input\npoints_earned = commission
    Supabase->>Supabase: profiles.prime_points += commPts\nprofiles.lifetime_points_earned += commPts\npoint_transactions INSERT referral_earned
    Supabase->>Supabase: If team leader:\nprofiles.prime_points += overridePts\npoint_transactions INSERT team_override
    Supabase-->>PartnerDash: Realtime push → store updates
```

---

## 7. State Management Architecture

```mermaid
flowchart TD
    subgraph Supabase["Supabase Source of Truth"]
        DB[("PostgreSQL")]
        RT["Realtime Channels"]
    end

    subgraph Sync["useSupabaseSync.ts"]
        syncAdmin["syncAdminData\nprofiles + referrals +\nrewards_config + staff +\nbroadcasts + audit_logs"]
        syncPartner["syncPartnerData partnerId\nprofile + referrals +\nredemptions + team members"]
    end

    subgraph Stores["Zustand Stores"]
        AS["useAdminStore\nsessionStorage persist"]
        PS["usePartnerStore\nlocalStorage persist"]
    end

    DB -->|"initial fetch"| syncAdmin
    DB -->|"initial fetch"| syncPartner
    RT -->|"INSERT/UPDATE on\nreferrals and profiles\nand notifications"| syncAdmin
    RT -->|"INSERT/UPDATE on\nreferrals and profiles"| syncPartner
    syncAdmin --> AS
    syncPartner --> PS
    AS --> AdminUI["Admin UI Components"]
    PS --> PartnerUI["Partner UI Components"]
```

### Zustand Store Persistence

| Store | Storage | Key | Notes |
|---|---|---|---|
| `usePartnerStore` | `localStorage` | `primescore-partner-store-v10` | Persists login state across tabs |
| `useAdminStore` | `sessionStorage` | `primescore-admin-store-v7` | Cleared on tab close |
| `_adminPass` | In-memory only | — | Never written to storage |

---

## 8. API Routes — Security Model

All admin API routes validate `x-admin-password` header against the server-side `ADMIN_PASSWORD` env var:

```mermaid
graph LR
    Client["Admin Store\nclient"] -->|"x-admin-password: _adminPass\ntyped at login"| Gateway["API Route\nserver-side"]
    Gateway -->|"process.env.ADMIN_PASSWORD"| Check{"Password\nMatches?"}
    Check -->|"Yes"| Action["Execute with\nSupabase Service Role"]
    Check -->|"No"| Reject["401 Unauthorized"]
    Action --> SB[("Supabase\nService Role Key")]
```

| Route | Method | Action |
|---|---|---|
| `/api/admin/audit-log` | POST | Insert audit log entry |
| `/api/admin/broadcast` | POST | Create broadcast announcement |
| `/api/admin/partners/create` | POST | Create partner in Supabase Auth + profiles |
| `/api/admin/partners/password` | POST | Reset partner Supabase Auth password |
| `/api/admin/partners/password` | DELETE | Delete partner from Supabase Auth |
| `/api/admin/send-notification` | POST | Insert notification for one or all partners |
| `/api/admin/staff` | POST/PUT/DELETE | Manage admin_staff table |
| `/api/email/send-otp` | POST | Send OTP email via Resend API |

---

## 9. KYC Approval Flow & Points

```mermaid
sequenceDiagram
    participant Partner
    participant Admin as Admin kyc/id
    participant AdminStore as admin-store.ts
    participant Supabase

    Partner->>Supabase: Register - profiles INSERT status=kyc_submitted prime_points=0
    Supabase-->>Partner: Notification Under Review
    Admin->>AdminStore: approveKyc(partnerId)
    AdminStore->>Supabase: SELECT prime_points check if already approved
    alt First-time approval (prime_points = 0)
        AdminStore->>Supabase: UPDATE profiles SET status=kyc_approved\nprime_points=100 lifetime_points_earned=100
        AdminStore->>Supabase: INSERT point_transactions signup_bonus +100
    else Re-approval (prime_points > 0)
        AdminStore->>Supabase: UPDATE profiles SET status=kyc_approved\n(preserves existing balance)
    end
    AdminStore->>Supabase: INSERT notifications approval + referral code
    Supabase-->>Partner: Realtime push - Dashboard unlocked
```

---

## 10. Gift Card Redemption Flow

```mermaid
sequenceDiagram
    participant Partner
    participant RedeemPage as /redeem
    participant Supabase
    participant AdminGiftCards as Admin /gift-cards

    Partner->>RedeemPage: Select brand + denomination
    RedeemPage->>Supabase: INSERT gift_card_redemptions status=pending
    RedeemPage->>Supabase: UPDATE profiles prime_points -= redemptionCost
    RedeemPage->>Supabase: INSERT point_transactions voucher_redeemed -points
    Supabase-->>AdminGiftCards: Realtime new pending redemption
    AdminGiftCards->>AdminGiftCards: Admin enters voucher code
    AdminGiftCards->>Supabase: UPDATE redemption voucher_code = adminCode status=fulfilled
    AdminGiftCards->>Supabase: INSERT notifications voucher code delivered to partner
    Supabase-->>Partner: Realtime push - voucher visible
```

---

## 11. Team Leader Override Economy

```mermaid
flowchart TD
    TM["Team Member\ncompletes a case\n+1000 pts example"] -->|"10% override"| TL
    TL["Team Leader\n+100 pts override\nauto-credited"]

    TM2["Individual Partner\nno team leader"] -->|"No override"| NoTL["Override: 0"]
```

### Team Structure

```mermaid
graph TD
    TL["Team Leader\nteam_code = PS-JOHN-X7A2\nrole = team_leader"]
    TM1["Member 1\nreferred_by_leader_id = TL.id"]
    TM2["Member 2\nreferred_by_leader_id = TL.id"]
    TM3["Member 3\nreferred_by_leader_id = TL.id"]
    TL --> TM1
    TL --> TM2
    TL --> TM3
```

---

## 12. Notification System

```mermaid
graph LR
    subgraph Automatic["Auto-Triggered Notifications"]
        K1["KYC Approved +100 pts info"]
        K2["KYC Rejected reason message"]
        K3["Admin issued points badge"]
        K4["Case enrolled points credited"]
    end

    subgraph Manual["Admin-Sent Notifications"]
        N1["Single partner"]
        N2["All partners broadcast"]
        N3["Entire team\nteam leader sub-agents"]
    end

    subgraph Delivery["Delivery"]
        DB[("notifications table")]
        Bell["Bell icon\npartner portal"]
        Marquee["Broadcast Marquee\ntop banner"]
    end

    Automatic --> DB
    Manual --> DB
    DB -->|"Realtime push"| Bell
    DB -->|"broadcasts table"| Marquee
```

---

## 13. Rewards Config — Admin Control Panel

Admin can change all point values live from `/admin/rewards-config`. Changes write to `system_config` table and are read by:
- `useSupabaseSync.ts` → `useAdminStore.rewardConfig`
- Individual components before awarding points

```mermaid
graph LR
    Admin["Admin\n/admin/rewards-config"] -->|"UPDATE system_config"| DB[("system_config\nglobal_reward_config")]
    DB -->|"fetched on sync"| RC["rewardConfig\nin useAdminStore"]
    RC -->|"submissionPoints"| SUB["Lead Submission\nstagePointsMap"]
    RC -->|"enrollmentPoints\nfallback only"| ENR["Enrollment\noverridden by tier calc"]
    RC -->|"pointsPerInr"| RED["Redemption rate\ndisplay in UI"]
    RC -->|"minRedemptionPoints"| RMIN["Min pts to redeem"]
    RC -->|"teamLeaderOverridePercent"| OVR["Override pct\nCompleteCaseModal"]
```

---

## 14. Complete File → Feature Map

| File/Route | Role | What it does |
|---|---|---|
| `app/(auth)/login` | All | Email+pass login → Supabase Auth |
| `app/(auth)/register` | All | Multi-step signup → Supabase Auth + profiles insert |
| `app/(portal)/dashboard` | Partner | Metrics, chart, tier progress, QR code, transactions |
| `app/(portal)/referrals` | Partner | View own leads, check status history |
| `app/(portal)/rewards` | Partner | PrimePoints balance, tier roadmap, transaction log |
| `app/(portal)/redeem` | Partner | Spend points on gift cards |
| `app/(portal)/refer` | Partner | Share referral link / QR code |
| `app/(portal)/team` | Team Leader | View sub-agents, their stats, override points received |
| `app/(portal)/kyc` | Partner | KYC status / ID card after approval |
| `app/admin` | Admin | Overview KPIs, quick actions |
| `app/admin/kyc/[id]` | Admin | Review partner KYC, approve/reject |
| `app/admin/referrals` | Admin | All leads list + filter |
| `app/admin/referrals/[id]` | Admin | Lead pipeline, stage transitions, enrollment points |
| `app/admin/teams` | Admin | Team structure view |
| `app/admin/analytics` | Admin | Point economy charts |
| `app/admin/gift-cards` | Admin | Approve redemptions, issue voucher codes |
| `app/admin/notifications` | Admin | Send notifications to partners |
| `app/admin/rewards-config` | Admin | Live point configuration |
| `app/admin/services` | Admin | Manage service catalog |
| `app/admin/settings` | Admin | Staff management, system settings |
| `lib/store.ts` | — | Partner Zustand store + tier/point calc functions |
| `lib/admin-store.ts` | — | Admin Zustand store + all admin actions |
| `lib/useSupabaseSync.ts` | — | Realtime sync + initial data hydration |
| `lib/supabase.ts` | — | Supabase client + type definitions |
| `components/admin/CompleteCaseModal.tsx` | Admin | Case completion → commission pts + team override |
| `components/admin/ManualAddLeadModal.tsx` | Admin | Manually add lead on behalf of partner |
| `components/ui/LeadSubmittedRewardModal.tsx` | Partner | Popup after lead submit showing potential rewards |

---

## 15. Points Ledger — Transaction Types Reference

| `transaction_type` | Who Creates It | Points Direction | Trigger |
|---|---|---|---|
| `signup_bonus` | `approveKyc` | `+100` | First KYC approval |
| `enrolled_earned` | `referrals/[id]` inline | `+100/125/150` | Admin marks enrolled |
| `referral_earned` | `CompleteCaseModal` | `+(service_amount × rate%)` | Admin marks completed |
| `team_override` | `CompleteCaseModal` | `+(10% of commission)` | Auto on completion if team exists |
| `admin_issued` | `issueAdminPoints` | `+/- any` | Admin manual adjustment |
| `voucher_redeemed` | `redeem/page.tsx` | `-points_required` | Partner redeems gift card |
| `referral_reversal` | `deleteReferral` | `-(original pts)` | Admin cancels lead with reversal |

---

## 16. Points Update — Complete DB Write Sequence

Every points credit follows this exact pattern:

```mermaid
sequenceDiagram
    participant Trigger as Trigger Event
    participant Code
    participant ProfilesDB as profiles table
    participant TxDB as point_transactions table
    participant NotifDB as notifications table

    Trigger->>Code: Event fires
    Code->>ProfilesDB: SELECT prime_points and lifetime_points_earned
    Code->>Code: newBalance = current + delta\nnewLifetime = currentLifetime + delta
    Code->>ProfilesDB: UPDATE SET\nprime_points = newBalance\nlifetime_points_earned = newLifetime
    Code->>TxDB: INSERT transaction_type + points_change + balance_after + title
    Code->>NotifDB: INSERT notification if significant event
```

> **Rule:** Every balance change = one `point_transactions` row. Never modify `prime_points` without also updating `lifetime_points_earned`. Tier is calculated from `lifetime_points_earned` only — it never drops on redemption.
