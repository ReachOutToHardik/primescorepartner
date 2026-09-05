/**
 * PrimeScore Official Email Service
 * 
 * Provides unified, beautifully branded HTML email templates and delivery
 * via Resend API for all official transactional notifications.
 */

export interface EmailDeliveryResponse {
  success: boolean;
  id?: string;
  simulated?: boolean;
  error?: string;
  warning?: string;
}

/**
 * Universal Resend API dispatcher
 */
export async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<EmailDeliveryResponse> {
  const apiKey = process.env.RESEND_API_KEY || '';

  if (!toEmail || !toEmail.includes('@')) {
    return { success: false, error: 'Valid recipient email address is required' };
  }

  if (!apiKey) {
    console.log('[EmailService Simulated] No RESEND_API_KEY set. Recipient:', toEmail, 'Subject:', subject);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Primescore Operations <partner@update.primescore.in>',
        to: [toEmail.trim()],
        subject,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true, id: data.id };
    } else {
      console.warn('Resend API Warning:', data);
      return { success: false, error: data.message || 'Failed to deliver email via Resend' };
    }
  } catch (err: any) {
    console.error('Resend Network Error:', err);
    return { success: false, error: err.message || 'Internal Email Error' };
  }
}

/**
 * 1. Client Referral Welcome Email
 */
export async function sendClientReferralWelcomeEmail(params: {
  toEmail: string;
  clientName: string;
  partnerName: string;
  serviceName: string;
  clientPortalUrl?: string;
}): Promise<EmailDeliveryResponse> {
  const portalUrl = params.clientPortalUrl || 'https://dashboard.primescore.in';
  const clientName = params.clientName || 'Valued Customer';
  const partnerName = params.partnerName || 'Financial Advisor';
  const serviceName = params.serviceName || 'Credit Rectification';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>${clientName}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 18px 0;">
          <strong>${partnerName}</strong> has referred your case to PrimeScore for <strong>${serviceName}</strong>.
        </p>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Our team is reviewing your credit report and will contact you shortly. You can track your case progress anytime using the link below:
        </p>

        <a href="${portalUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
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
</html>`;

  return sendEmailViaResend(
    params.toEmail,
    `${partnerName} referred your case to PrimeScore`,
    html
  );
}

/**
 * 2. Partner KYC Approved & Welcome Bonus Email
 */
export async function sendPartnerKycApprovedEmail(params: {
  toEmail: string;
  partnerName: string;
  referralCode: string;
  referralLink?: string;
  portalUrl?: string;
}): Promise<EmailDeliveryResponse> {
  const pUrl = params.portalUrl || 'https://partner.primescore.in';
  const partnerName = params.partnerName || 'Partner';
  const code = params.referralCode || 'PSMKMVLN';
  const refLink = params.referralLink || `https://dashboard.primescore.in/ref/${code}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>${partnerName}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          Your partner KYC has been verified and your account is now active on PrimeScore.
        </p>

        <!-- Details Card -->
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Welcome Bonus:</strong> <span style="color:#16a34a;font-weight:600;">+100 PrimePoints</span> credited</div>
              <div style="margin-bottom:6px;"><strong>Referral Code:</strong> <span style="font-family:monospace;font-weight:700;color:#1f2a74;">${code}</span></div>
              <div><strong>Client Link:</strong> <a href="${refLink}" target="_blank" style="color:#1f2a74;text-decoration:underline;">${refLink}</a></div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          You can now start submitting client files and track case progress live from your portal:
        </p>

        <a href="${pUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
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
</html>`;

  return sendEmailViaResend(
    params.toEmail,
    `Congratulations ${partnerName}! Your Primescore Partner Account is VERIFIED (+100 PrimePoints)`,
    html
  );
}

/**
 * 3. Case Completed & Points Credit Email
 */
export async function sendCaseCompletedEmail(params: {
  toEmail: string;
  partnerName: string;
  customerName: string;
  pointsEarned: number | string;
  totalPoints: number | string;
  portalUrl?: string;
}): Promise<EmailDeliveryResponse> {
  const pUrl = params.portalUrl || 'https://partner.primescore.in';
  const partnerName = params.partnerName || 'Partner';
  const customerName = params.customerName || 'Valued Client';
  const pointsEarned = params.pointsEarned || 500;
  const totalPoints = params.totalPoints || 500;
  const numPts = Number(totalPoints) || 0;
  const inrVal = Math.floor(numPts / 4).toLocaleString('en-IN');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 12px 0;">Hi <strong>${partnerName}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          Great news! The dispute case for <strong>${customerName}</strong> has been successfully completed.
        </p>

        <!-- Points Credit Card in Vibrant Green -->
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:6px;padding:16px 18px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:22px;color:#1e293b;">
              <div style="font-size:15px;margin-bottom:8px;">
                <span style="color:#166534;font-weight:600;">Points Credited:</span> 
                <span style="color:#15803d;font-weight:800;font-size:17px;">+${pointsEarned} PrimePoints</span> 
                <span style="background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:4px;">VERIFIED</span>
              </div>
              <div style="margin-bottom:4px;"><strong>Client Case:</strong> ${customerName}</div>
              <div><strong>Your Wallet Balance:</strong> <span style="color:#1f2a74;font-weight:700;font-size:14px;">${totalPoints} Pts</span> <span style="color:#64748b;font-size:12px;">(≈ ₹${inrVal})</span></div>
            </td>
          </tr>
        </table>
        
        <!-- Motivational Engagement Hook -->
        <p style="font-size:14px;line-height:21px;color:#475569;margin:0 0 22px 0;">
          🔥 <strong>Ready to redeem?</strong> You can instantly convert your balance into Amazon, Flipkart, or Myntra vouchers. Keep submitting client files to level up your commission tier and unlock higher bonuses!
        </p>

        <!-- CTA Buttons -->
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td>
              <a href="${pUrl}/redeem" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-right:8px;margin-bottom:8px;">
                Redeem Gift Cards &rarr;
              </a>
              <a href="${pUrl}/refer" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:8px;">
                Submit Next File &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Official Footer -->
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
</html>`;

  return sendEmailViaResend(
    params.toEmail,
    `Woohoo ${partnerName}! Case for ${customerName} completed (+${pointsEarned} PrimePoints)`,
    html
  );
}

/**
 * 4. Tier Milestone Unlocked Email
 */
export async function sendTierMilestoneEmail(params: {
  toEmail: string;
  partnerName: string;
  tierName: string;
  commissionRate: string;
  enrollmentPts: number | string;
  portalUrl?: string;
}): Promise<EmailDeliveryResponse> {
  const pUrl = params.portalUrl || 'https://partner.primescore.in';
  const partnerName = params.partnerName || 'Partner';
  const tierName = params.tierName || 'Gold';
  const commRate = params.commissionRate || '12%';
  const enrollPts = params.enrollmentPts || '150';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>${partnerName}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          You have unlocked <strong>${tierName} Tier</strong> on the PrimeScore Partner Portal.
        </p>

        <!-- Details Card -->
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Tier:</strong> <span style="color:#2563eb;font-weight:700;">${tierName}</span></div>
              <div style="margin-bottom:6px;"><strong>Commission Rate:</strong> <span style="color:#16a34a;font-weight:600;">${commRate}</span></div>
              <div><strong>Enrollment Bonus:</strong> ${enrollPts} Pts / case</div>
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Your higher commission rates and bonus multipliers are now active for all upcoming client cases:
        </p>

        <a href="${pUrl}/rewards" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1f2a74;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:6px;margin-bottom:28px;">
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
</html>`;

  return sendEmailViaResend(
    params.toEmail,
    `Congrats ${partnerName}! You unlocked ${tierName} Tier at Primescore!`,
    html
  );
}

/**
 * 5. Gift Voucher Delivery Email
 */
export async function sendGiftVoucherDeliveryEmail(params: {
  toEmail: string;
  partnerName: string;
  brandName: string;
  denomination: number | string;
  voucherCode: string;
  voucherPin?: string;
  portalUrl?: string;
}): Promise<EmailDeliveryResponse> {
  const partnerName = params.partnerName || 'Partner';
  const brandName = params.brandName || 'Gift Card';
  const denom = params.denomination || '500';
  const vCode = params.voucherCode || '';
  const vPin = params.voucherPin || '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <img src="https://www.primescore.in/lightmode_Logo.png" alt="PrimeScore" height="26" style="display:block;margin-bottom:24px;" />
        
        <p style="font-size:15px;line-height:22px;margin:0 0 14px 0;">Hi <strong>${partnerName}</strong>,</p>
        
        <p style="font-size:15px;line-height:22px;color:#374151;margin:0 0 16px 0;">
          Your <strong>${brandName} ₹${denom}</strong> voucher is ready to use.
        </p>

        <!-- Details Card -->
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <tr>
            <td style="font-size:13px;line-height:20px;color:#334155;">
              <div style="margin-bottom:6px;"><strong>Brand:</strong> ${brandName}</div>
              <div style="margin-bottom:6px;"><strong>Amount:</strong> ₹${denom}</div>
              <div style="margin-bottom:6px;"><strong>Voucher Code:</strong> <span style="font-family:monospace;font-weight:700;color:#1f2a74;font-size:14px;">${vCode}</span></div>
              ${vPin ? `<div><strong>PIN:</strong> <span style="font-family:monospace;font-weight:700;color:#1f2a74;">${vPin}</span></div>` : ''}
            </td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px 0;">
          Apply this code in the ${brandName} app or website during checkout or add it to your gift card balance.
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
</html>`;

  return sendEmailViaResend(
    params.toEmail,
    `Hi ${partnerName}, your ${brandName} ₹${denom} voucher code is ${vCode}`,
    html
  );
}
