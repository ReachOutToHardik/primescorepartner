import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Primescore Partner Portal',
  description: 'Partner Terms of Service and Operational Agreement for Primescore Partner Portal',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--amber)] selection:text-[var(--navy-deep)] font-sans">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[var(--navy-deep)] to-[var(--navy)] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--amber)] text-[var(--navy-deep)] flex items-center justify-center font-extrabold text-xl shadow-sm font-display">
              P
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white block leading-none group-hover:text-[var(--amber)] transition">
                Primescore
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/90">
                Partner Network
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-white/90 hover:text-white px-3.5 py-2 rounded-xs bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5"
            >
              <span>← Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        <div className="bg-white border border-[var(--border)] rounded-xs p-6 sm:p-10 space-y-8 shadow-xs animate-fade-up">
          {/* Title Header */}
          <div className="border-b border-[var(--border)] pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[var(--amber-light)] border border-[var(--amber)]/30 text-[var(--navy-deep)] text-[11px] font-bold uppercase tracking-wider">
              <span>Operational Agreement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--ink)] tracking-tight">
              Partner Terms & Conditions
            </h1>
            <p className="text-xs text-[var(--ink-muted)]">
              Effective Date: January 1, 2026 | Last Updated: August 29, 2026
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-6 text-sm text-[var(--ink-2)] leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                1. Acceptance & Partner Registration
              </h2>
              <p>
                By registering for a partner account or utilizing the Primescore Partner Portal, you agree to comply with these Terms and Conditions. The partner program is accessible to qualified professionals, independent consultants, DSAs, financial counselors, and institutional partners.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                2. Independent Partner Status
              </h2>
              <p>
                Partners operate as independent entities. Nothing in these terms creates an employment, agency, franchise, joint venture, or legal partnership between Primescore and the Partner. Partners are not authorized to make binding representations or commitments on behalf of Primescore.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                3. Lead Submission & Attribution Rules
              </h2>
              <p>
                Partners may refer potential clients for credit score analysis and counseling services using assigned referral codes or links.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[var(--ink-muted)] pl-2">
                <li>Referrals must contain genuine contact details provided with client consent.</li>
                <li>Primescore reserves the right to review lead validity and decline duplicate or uncontactable submissions.</li>
                <li>Referral submissions are evaluated independently without guarantee of client enrollment or specific case outcomes.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                4. PrimePoints & Reward Program Rules
              </h2>
              <p>
                PrimePoints are promotional credits granted for verified portal activity and milestones. PrimePoints carry no direct monetary cash value outside of official portal redemption channels and cannot be transferred between accounts.
              </p>
              <p>
                Partner tier levels (Silver, Gold, Platinum) are determined by cumulative lifetime points earned. Primescore reserves the right to adjust reward schedules, point parameters, or gift card redemption catalogs during standard system updates.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                5. Partner Conduct & Anti-Fraud Guidelines
              </h2>
              <p>
                Partners must maintain ethical practices. Misrepresentation of services, creation of non-authentic client leads, unauthorized collection of upfront fees, or spam promotion is prohibited and will result in account suspension and point forfeiture.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                6. General Disclaimer & Limitation of Liability
              </h2>
              <p>
                The Primescore Partner Portal is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Primescore does not warrant uninterrupted portal availability or specific referral conversion rates. In no event shall Primescore be liable for indirect, incidental, or consequential losses related to portal participation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                7. Program Amendments & Inquiries
              </h2>
              <p>
                Primescore reserves the right to update these terms as needed. Continued portal usage after updates implies acceptance. For inquiries regarding these terms, contact info@primescore.in or partner@primescore.in.
              </p>
            </section>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-[var(--ink-muted)] font-medium">
              <Link href="/privacy" className="hover:text-[var(--navy)] underline transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/refund" className="hover:text-[var(--navy)] underline transition">Payout & Rewards Policy</Link>
            </div>
            <Link
              href="/login"
              className="text-[var(--navy)] font-bold hover:underline flex items-center gap-1"
            >
              Return to Login &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--ink-muted)] bg-white">
        <p>© {new Date().getFullYear()} Primescore. All rights reserved.</p>
      </footer>
    </div>
  );
}
