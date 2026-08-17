/**
 * Resend Email Dispatcher Helper
 * Sender Domain: partner@update.primescore.in
 */

export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
export const SENDER_EMAIL = 'PrimeScore Partner Portal <partner@update.primescore.in>';

export interface SendOtpEmailParams {
  toEmail: string;
  partnerName?: string;
  otpCode: string;
}

export async function sendOtpEmail({ toEmail, partnerName, otpCode }: SendOtpEmailParams) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [toEmail],
        subject: `Verification Security Code: ${otpCode} - PrimeScore Partner Desk`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <strong style="font-size: 22px; color: #1B2A72; letter-spacing: -0.5px;">PRIMSCORE</strong>
                <span style="font-size: 11px; color: #E63329; font-weight: 800; letter-spacing: 1px; margin-left: 6px; text-transform: uppercase;">PARTNER DESK</span>
              </div>
            </div>
            
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Partner Authentication Code</h2>
            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
              Hello ${partnerName || 'Partner'}, please use the 6-digit security code below to complete your partner verification on <strong>partner.primescore.in</strong>.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Single-Use Security Code</div>
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1B2A72;">${otpCode}</span>
            </div>
            
            <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              &bull; This security code is valid for 10 minutes.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 24px;">
              &bull; If you did not request this code, please ignore this email or contact security.
            </p>
            
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            
            <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">
              PrimeScore Advisory &bull; Credit Bureau &amp; Loan Partner Network &bull; partner@update.primescore.in
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: any) {
    console.error('Failed to dispatch Resend email:', err);
    return { success: false, error: err.message };
  }
}
