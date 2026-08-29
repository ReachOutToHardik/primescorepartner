/**
 * Utility functions for user referral code generation and formatting.
 */

/**
 * Generates an 8-character uppercase User Referral Code (e.g. PSMKMVLN).
 */
export function generateUserReferralCode(prefix: string = 'PS'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix.toUpperCase();
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Formats a user referral code into the full external client dashboard URL.
 * e.g., 'PSMKMVLN' -> 'https://dashboard.primescore.in/ref/PSMKMVLN'
 */
export function getClientReferralUrl(userReferralCode?: string | null, fallbackCode: string = 'PSMKMVLN'): string {
  const code = (userReferralCode || fallbackCode).trim().toUpperCase();
  return `https://dashboard.primescore.in/ref/${code}`;
}
