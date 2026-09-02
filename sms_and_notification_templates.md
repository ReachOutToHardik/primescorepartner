# PrimeScore — Official SMS & Notification Templates

This document contains the approved notification and SMS templates for the PrimeScore platform, covering both referred clients and registered partners.

---

## 1. Client Notifications (Referred Leads)

### 1.1 Client Referral Welcome (No Case ID)
- **Trigger**: Sent automatically to the customer when a partner (DSA, CA, Loan Agent) submits their referral lead.
- **Purpose**: Acknowledges the referral, establishes trust by mentioning their advisor's name, sets expectations for a specialist call, and prompts them to sign up to track updates.

#### Standard Template:
```text
Hi {{CLIENT_NAME}}, your loan advisor {{PARTNER_NAME}} has referred you to Primescore for {{SERVICE_NAME}}. Our credit specialist will contact you shortly. Sign up at {{CLIENT_PORTAL_URL}} to track your case live.
```

#### DLT Operator Format (`{#var#}` syntax for Ishani / TRAI approval):
```text
Hi {#var#}, your loan advisor {#var#} has referred you to Primescore for {#var#}. Our credit specialist will contact you shortly. Sign up at {#var#} to track your case live.
```

#### Sample Data Preview:
> Hi Ramesh, your loan advisor Vikram Malhotra has referred you to Primescore for Credit Rectification. Our credit specialist will contact you shortly. Sign up at dashboard.primescore.in to track your case live.

---

## 2. Partner Notifications (DSAs, CAs & Agents)

### 2.1 Partner Account Verification
- **Trigger**: Sent when admin approves the partner's KYC in `/admin/kyc`.
- **Purpose**: Confirms identity verification, notifies them of the 100 PrimePoints welcome bonus, and links to the partner portal.

#### Standard Template:
```text
Congratulations {{PARTNER_NAME}}! Your Primescore Partner account is VERIFIED and your 100 Prime Points welcome bonus has officially landed in your account. Start referring at {{PORTAL_URL}}
```

#### DLT Operator Format:
```text
Congratulations {#var#}! Your Primescore Partner account is VERIFIED and your 100 Prime Points welcome bonus has officially landed in your account. Start referring at {#var#}
```

#### Sample Data Preview:
> Congratulations Vikram! Your Primescore Partner account is VERIFIED and your 100 Prime Points welcome bonus has officially landed in your account. Start referring at partner.primescore.in

---

### 2.2 Case Completion & Points Credit
- **Trigger**: Sent when admin changes a referral lead status to "Completed" in `/admin/referrals`.
- **Purpose**: Informs the partner of case fulfillment, points credited, updated balance, and gives a direct link to redeem vouchers.

#### Standard Template:
```text
Woohoo {{PARTNER_NAME}}! Case for {{CUSTOMER_NAME}} is completed. +{{POINTS_EARNED}} PrimePoints credited! New balance: {{TOTAL_POINTS}} Pts. Redeem at {{PORTAL_URL}}/redeem
```

#### DLT Operator Format:
```text
Woohoo {#var#}! Case for {#var#} is completed. +{#var#} PrimePoints credited! New balance: {#var#} Pts. Redeem at {#var#}/redeem
```

#### Sample Data Preview:
> Woohoo Vikram! Case for Ramesh Verma is completed. +500 PrimePoints credited! New balance: 620 Pts. Redeem at partner.primescore.in/redeem

---

### 2.3 Tier Milestone Unlocked
- **Trigger**: Sent when a partner's accumulated points cross a tier threshold (Gold at 20,000 pts, Platinum at 50,000 pts).
- **Purpose**: Celebrates career progression, announces higher commission rates and increased enrollment bonuses.

#### Standard Template:
```text
Congrats {{PARTNER_NAME}}! You unlocked {{TIER_NAME}} Tier at Primescore! Enjoy {{COMMISSION_RATE}} commission & {{ENROLLMENT_PTS}} Pts/enrollment. Details: {{PORTAL_URL}}/rewards
```

#### DLT Operator Format:
```text
Congrats {#var#}! You unlocked {#var#} Tier at Primescore! Enjoy {#var#} commission & {#var#} Pts/enrollment. Details: {#var#}/rewards
```

#### Sample Data Preview:
> Congrats Vikram! You unlocked Gold Tier at Primescore! Enjoy 12% commission & 150 Pts/enrollment. Details: partner.primescore.in/rewards

---

### 2.4 Gift Voucher Delivery
- **Trigger**: Sent when admin fulfills a gift voucher request in `/admin/gift-cards`.
- **Purpose**: Delivers digital coupon code and security PIN directly to the partner's phone.

#### Standard Template:
```text
Hi {{PARTNER_NAME}}, your {{BRAND_NAME}} ₹{{DENOMINATION}} voucher code is {{VOUCHER_CODE}} (PIN: {{VOUCHER_PIN}}). Thanks for partnering with Primescore!
```

#### DLT Operator Format:
```text
Hi {#var#}, your {#var#} ₹{#var#} voucher code is {#var#} (PIN: {#var#}). Thanks for partnering with Primescore!
```

#### Sample Data Preview:
> Hi Vikram, your Amazon ₹500 voucher code is AMZ-9821-4310-9901 (PIN: 4819). Thanks for partnering with Primescore!

---

## 3. Template Variables Reference

- `{{CLIENT_NAME}}`: First name of referred customer (e.g. `Ramesh`)
- `{{PARTNER_NAME}}`: Name of referring partner / DSA (e.g. `Vikram`)
- `{{SERVICE_NAME}}`: Service referred (e.g. `Credit Rectification`)
- `{{CLIENT_PORTAL_URL}}`: Web app where clients track their case (e.g. `dashboard.primescore.in`)
- `{{PORTAL_URL}}`: Base web address of the Partner Portal (e.g. `partner.primescore.in`)
- `{{CUSTOMER_NAME}}`: Customer full name (e.g. `Ramesh Verma`)
- `{{POINTS_EARNED}}`: PrimePoints credited for the action (e.g. `500`)
- `{{TOTAL_POINTS}}`: Partner's new total points balance (e.g. `620`)
- `{{TIER_NAME}}`: Newly unlocked tier level (e.g. `Gold`)
- `{{COMMISSION_RATE}}`: Tier commission percentage (e.g. `12%`)
- `{{ENROLLMENT_PTS}}`: Points earned per customer enrollment (e.g. `150`)
- `{{BRAND_NAME}}`: Brand name of gift voucher (e.g. `Amazon` or `Flipkart`)
- `{{DENOMINATION}}`: Monetary value of voucher in INR (e.g. `500`)
- `{{VOUCHER_CODE}}`: Digital gift card alphanumeric code (e.g. `AMZ-9821-4310-9901`)
- `{{VOUCHER_PIN}}`: Digital voucher security PIN (e.g. `4819`)
