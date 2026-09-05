import { NextRequest, NextResponse } from 'next/server';
import {
  sendClientReferralWelcomeEmail,
  sendPartnerKycApprovedEmail,
  sendCaseCompletedEmail,
  sendTierMilestoneEmail,
  sendGiftVoucherDeliveryEmail,
  sendTeamMemberOnboardedEmail,
} from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json({ error: 'Email template type is required' }, { status: 400 });
    }

    if (!body.toEmail) {
      return NextResponse.json({ error: 'Recipient email address (toEmail) is required' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'client_referral_welcome':
        result = await sendClientReferralWelcomeEmail({
          toEmail: body.toEmail,
          clientName: body.clientName,
          partnerName: body.partnerName,
          serviceName: body.serviceName,
          clientPortalUrl: body.clientPortalUrl,
        });
        break;

      case 'partner_kyc_approved':
        result = await sendPartnerKycApprovedEmail({
          toEmail: body.toEmail,
          partnerName: body.partnerName,
          referralCode: body.referralCode,
          referralLink: body.referralLink,
          portalUrl: body.portalUrl,
        });
        break;

      case 'case_completed':
        result = await sendCaseCompletedEmail({
          toEmail: body.toEmail,
          partnerName: body.partnerName,
          customerName: body.customerName,
          pointsEarned: body.pointsEarned,
          totalPoints: body.totalPoints,
          portalUrl: body.portalUrl,
        });
        break;

      case 'tier_milestone':
        result = await sendTierMilestoneEmail({
          toEmail: body.toEmail,
          partnerName: body.partnerName,
          tierName: body.tierName,
          commissionRate: body.commissionRate,
          enrollmentPts: body.enrollmentPts,
          portalUrl: body.portalUrl,
        });
        break;

      case 'voucher_delivery':
        result = await sendGiftVoucherDeliveryEmail({
          toEmail: body.toEmail,
          partnerName: body.partnerName,
          brandName: body.brandName,
          denomination: body.denomination,
          voucherCode: body.voucherCode,
          voucherPin: body.voucherPin,
          portalUrl: body.portalUrl,
        });
        break;

      case 'team_member_onboarded':
        result = await sendTeamMemberOnboardedEmail({
          toEmail: body.toEmail,
          memberName: body.memberName,
          leaderName: body.leaderName,
          teamCode: body.teamCode,
          portalUrl: body.portalUrl,
        });
        break;

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error || 'Email dispatch failed' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Send Email API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
