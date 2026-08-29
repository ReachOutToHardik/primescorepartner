import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Payout & Rewards Policy | Primescore Partner Portal',
  description: 'Reward Settlement, Voucher Delivery, and Payout Guidelines for Primescore Partners',
};

export default function RefundPolicyPage() {
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
              <span>Payout & Fulfillment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--ink)] tracking-tight">
              Reward Distribution & Payout Policy
            </h1>
            <p className="text-xs text-[var(--ink-muted)]">
              Effective Date: January 1, 2026 | Last Updated: August 29, 2026
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6 text-sm text-[var(--ink-2)] leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                1. PrimePoints Reward Crediting
              </h2>
              <p>
                PrimePoints are promotional rewards allocated to partner accounts upon verified portal milestones, such as partner KYC verification, client enrollment, and case completions. Points calculation is governed by established partner tier multipliers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                2. Gift Card & Voucher Fulfillment
              </h2>
              <p>
                Partners can redeem spendable PrimePoints for digital gift vouchers (such as Amazon Pay, Flipkart, Myntra, Swiggy, and brand vouchers) available on the Partner Rewards Store.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[var(--ink-muted)] pl-2">
                <li>Digital vouchers are issued electronically and delivered to the partner dashboard and registered email.</li>
                <li>Issued gift card codes and vouchers are final, non-exchangeable, and non-refundable.</li>
                <li>Partners are responsible for reviewing brand-specific terms and expiration periods upon receiving voucher codes.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                3. Non-Cash & Valuation Disclaimer
              </h2>
              <p>
                PrimePoints serve as internal promotional reward tracking and do not represent cash deposits or currency holdings. Points cannot be directly converted to cash or refunded outside official redemption features provided in the portal.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                4. Audit Rights & Point Adjustments
              </h2>
              <p>
                In cases involving non-authentic leads, canceled client engagements prior to service fulfillment, or system reconciliation, Primescore reserves the right to audit transactions and perform necessary point balance adjustments.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                5. Support & Settlement Assistance
              </h2>
              <p>
                For questions regarding voucher delivery, reward balances, or redemption status, please contact partner support at info@primescore.in or partner@primescore.in.
              </p>
            </section>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-[var(--ink-muted)] font-medium">
              <Link href="/privacy" className="hover:text-[var(--navy)] underline transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[var(--navy)] underline transition">Terms & Conditions</Link>
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
