# PrimeScore — Official Notification & Email Templates

This document contains the approved notification, SMS, and HTML Email templates for the PrimeScore platform, covering both referred clients and registered partners.

---

## 📧 HTML Email Delivery Architecture

All transactional emails are styled with PrimeScore's clean, responsive email design system (`lib/email-service.ts`) and delivered via **Resend API** from `partner@update.primescore.in`.

### Email Template Types:
1. `client_referral_welcome`: Sent when a partner submits a client referral file.
2. `partner_kyc_approved`: Sent when admin verifies partner KYC & awards +100 PrimePoints.
3. `case_completed`: Sent when a client's dispute case is fulfilled & points credited.
4. `tier_milestone`: Sent when a partner reaches Silver, Gold, or Platinum tier thresholds.
5. `voucher_delivery`: Sent when an admin fulfills a digital gift card redemption.

---

## 1. Client Notifications (Referred Leads)

### 1.1 Client Referral Welcome
- **Trigger**: Sent automatically to the customer when a partner (DSA, CA, Loan Agent) submits their referral lead.
- **Purpose**: Fast, direct notification acknowledging the referral with a link to sign up and track live updates.

#### Standard Copy:
```text
Hi {{CLIENT_NAME}},

{{PARTNER_NAME}} has referred your case to PrimeScore for {{SERVICE_NAME}}.

Our team is reviewing your credit report and will contact you shortly. You can track your case progress anytime using the link below:

[Sign up to track your case →]({{CLIENT_PORTAL_URL}})
```

#### Approved HTML Template:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>{{CLIENT_NAME}}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 18px 0;">
          <strong>{{PARTNER_NAME}}</strong> has referred your case to PrimeScore for <strong>{{SERVICE_NAME}}</strong>.
        </p>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Our team is reviewing your credit report and will contact you shortly. You can track your case progress anytime using the link below:
        </p>

        <a href="{{CLIENT_PORTAL_URL}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
          Sign up to track your case &rarr;
        </a>

        <div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-top:4px;">
          <p style="font-size:12px;line-height:18px;color:#64748b;font-weight:600;margin:0 0 4px 0;">
            PRIMESCORE FINTECH PRIVATE LIMITED
          </p>
          <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:0;">
            &copy; 2026 Primescore. All rights reserved. &bull; <a href="https://primescore.in" style="color:#6b7280;text-decoration:none;">primescore.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Partner Notifications (DSAs, CAs & Agents)

### 2.1 Partner Account Verification & 100 Pts Bonus
- **Trigger**: Sent when admin approves partner KYC in `/admin/kyc`.
- **Subject**: `Congratulations {{PARTNER_NAME}}! Your Primescore Partner Account is VERIFIED (+100 PrimePoints)`

#### Approved HTML Template:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>{{PARTNER_NAME}}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          Your partner KYC has been verified and your account is now active on PrimeScore.
        </p>

        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Welcome Bonus:</strong> <span style="color:#16a34a;font-weight:600;">+100 PrimePoints</span> credited</div>
              <div style="margin-bottom:6px;"><strong>Referral Code:</strong> <span style="font-family:monospace;font-weight:700;color:#1f2a74;">{{REFERRAL_CODE}}</span></div>
              <div><strong>Client Link:</strong> <a href="{{REFERRAL_LINK}}" style="color:#1f2a74;text-decoration:underline;">{{REFERRAL_LINK}}</a></div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          You can now start submitting client files and track case progress live from your portal:
        </p>

        <a href="{{PORTAL_URL}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
          Open Partner Portal &rarr;
        </a>

        <div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-top:4px;">
          <p style="font-size:12px;line-height:18px;color:#64748b;font-weight:600;margin:0 0 4px 0;">
            PRIMESCORE FINTECH PRIVATE LIMITED
          </p>
          <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:0;">
            &copy; 2026 Primescore. All rights reserved. &bull; <a href="https://partner.primescore.in" style="color:#6b7280;text-decoration:none;">partner.primescore.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2.2 Case Completion & Points Credit
- **Trigger**: Sent when admin marks a lead as "Completed" in `/admin/referrals`.
- **Subject**: `Woohoo {{PARTNER_NAME}}! Case for {{CUSTOMER_NAME}} completed (+{{POINTS_EARNED}} PrimePoints)`

#### Approved HTML Template:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 12px 0;">Hi <strong>{{PARTNER_NAME}}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          Great news! The dispute case for <strong>{{CUSTOMER_NAME}}</strong> has been successfully completed.
        </p>

        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:6px;padding:16px 18px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:22px;color:#1e293b;">
              <div style="font-size:15px;margin-bottom:8px;">
                <span style="color:#166534;font-weight:600;">Points Credited:</span> 
                <span style="color:#15803d;font-weight:800;font-size:17px;">+{{POINTS_EARNED}} PrimePoints</span> 
                <span style="background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:4px;">VERIFIED</span>
              </div>
              <div style="margin-bottom:4px;"><strong>Client Case:</strong> {{CUSTOMER_NAME}}</div>
              <div><strong>Your Wallet Balance:</strong> <span style="color:#1f2a74;font-weight:700;font-size:14px;">{{TOTAL_POINTS}} Pts</span> <span style="color:#64748b;font-size:12px;">(≈ ₹{{RUPEES_VALUE}})</span></div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:21px;color:#475569;margin:0 0 22px 0;">
          🔥 <strong>Ready to redeem?</strong> You can instantly convert your balance into Amazon, Flipkart, or Myntra vouchers. Keep submitting client files to level up your commission tier and unlock higher bonuses!
        </p>

        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td>
              <a href="{{PORTAL_URL}}/redeem" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-right:8px;margin-bottom:8px;">
                Redeem Gift Cards &rarr;
              </a>
              <a href="{{PORTAL_URL}}/refer" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:8px;">
                Submit Next File &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-top:4px;">
          <p style="font-size:12px;line-height:18px;color:#64748b;font-weight:600;margin:0 0 4px 0;">
            PRIMESCORE FINTECH PRIVATE LIMITED
          </p>
          <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:0;">
            &copy; 2026 Primescore. All rights reserved. &bull; <a href="https://partner.primescore.in" style="color:#6b7280;text-decoration:none;">partner.primescore.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2.3 Tier Milestone Unlocked
- **Trigger**: Sent when partner reaches Silver, Gold, or Platinum points threshold.
- **Subject**: `Congrats {{PARTNER_NAME}}! You unlocked {{TIER_NAME}} Tier at Primescore!`

#### Approved HTML Template:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>{{PARTNER_NAME}}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          You have unlocked <strong>{{TIER_NAME}} Tier</strong> on the PrimeScore Partner Portal.
        </p>

        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Tier:</strong> <span style="color:#2563eb;font-weight:700;">{{TIER_NAME}}</span></div>
              <div style="margin-bottom:6px;"><strong>Commission Rate:</strong> <span style="color:#16a34a;font-weight:600;">{{COMMISSION_RATE}}</span></div>
              <div><strong>Enrollment Bonus:</strong> {{ENROLLMENT_PTS}} Pts / case</div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Your higher commission rates and bonus multipliers are now active for all upcoming client cases:
        </p>

        <a href="{{PORTAL_URL}}/rewards" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
          View Tier Benefits &rarr;
        </a>

        <div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-top:4px;">
          <p style="font-size:12px;line-height:18px;color:#64748b;font-weight:600;margin:0 0 4px 0;">
            PRIMESCORE FINTECH PRIVATE LIMITED
          </p>
          <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:0;">
            &copy; 2026 Primescore. All rights reserved. &bull; <a href="https://partner.primescore.in" style="color:#6b7280;text-decoration:none;">partner.primescore.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2.4 Gift Voucher Delivery
- **Trigger**: Sent when admin fulfills a gift card redemption in `/admin/gift-cards`.
- **Subject**: `Hi {{PARTNER_NAME}}, your {{BRAND_NAME}} ₹{{DENOMINATION}} voucher code is {{VOUCHER_CODE}}`

#### Approved HTML Template:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>{{PARTNER_NAME}}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          Your <strong>{{BRAND_NAME}} ₹{{DENOMINATION}}</strong> voucher is ready to use.
        </p>

        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Brand:</strong> {{BRAND_NAME}}</div>
              <div style="margin-bottom:6px;"><strong>Amount:</strong> ₹{{DENOMINATION}}</div>
              <div style="margin-bottom:6px;"><strong>Voucher Code:</strong> <span style="font-family:monospace;font-weight:700;color:#1f2a74;font-size:14px;">{{VOUCHER_CODE}}</span></div>
              <div><strong>PIN:</strong> <span style="font-family:monospace;font-weight:700;color:#1f2a74;">{{VOUCHER_PIN}}</span></div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Apply this code in the {{BRAND_NAME}} app or website during checkout or add it to your gift card balance.
        </p>

        <a href="https://partner.primescore.in" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
          Open Partner Dashboard &rarr;
        </a>

        <div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-top:4px;">
          <p style="font-size:12px;line-height:18px;color:#64748b;font-weight:600;margin:0 0 4px 0;">
            PRIMESCORE FINTECH PRIVATE LIMITED
          </p>
          <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:0;">
            &copy; 2026 Primescore. All rights reserved. &bull; <a href="https://partner.primescore.in" style="color:#6b7280;text-decoration:none;">partner.primescore.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2.5 Team Member Onboarded / Invite Welcome
- **Trigger**: Sent automatically when a Team Leader onboards a sub-agent / advisor in `/team`.
- **Subject**: `Join {{LEADER_NAME}}'s team on PrimeScore Partner Portal`

#### Approved HTML Template:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>{{MEMBER_NAME}}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          <strong>{{LEADER_NAME}}</strong> has invited you to join their partner network on the PrimeScore Partner Portal.
        </p>

        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Invited By:</strong> {{LEADER_NAME}}</div>
              <div><strong>Team Invite Link:</strong><br><a href="{{PORTAL_URL}}/register?ref={{TEAM_CODE}}" target="_blank" style="color:#1f2a74;text-decoration:underline;word-break:break-all;">{{PORTAL_URL}}/register?ref={{TEAM_CODE}}</a></div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Use the button below to complete your partner registration and start submitting client credit cases:
        </p>

        <a href="{{PORTAL_URL}}/register?ref={{TEAM_CODE}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
          Complete Registration &rarr;
        </a>

        <div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-top:4px;">
          <p style="font-size:12px;line-height:18px;color:#64748b;font-weight:600;margin:0 0 4px 0;">
            PRIMESCORE FINTECH PRIVATE LIMITED
          </p>
          <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:0;">
            &copy; 2026 Primescore. All rights reserved. &bull; <a href="https://partner.primescore.in" style="color:#6b7280;text-decoration:none;">partner.primescore.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Authentication & Verification Policy

- **Phone Verification (SMS)**: Managed via **Ishani SMS Gateway** (`/api/send-sms-otp`) with 6-digit cryptographic OTP (10-minute expiry) for registration, forgot password, and voucher redemptions.
- **Email Verification (OTP)**: **Removed** — Email OTP has been decommissioned in favor of instant SMS verification. Transactional emails are used solely for branded status updates, welcome letters, and voucher dispatches.

---

## 4. Template Variables Reference

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
