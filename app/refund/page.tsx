import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Payout & Rewards Policy | Primescore Partner Portal',
  description: 'Reward Fulfillment, Voucher Delivery, and Payout Guidelines for Primescore Partners',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-400/20 font-display">
              P
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-white block leading-none group-hover:text-amber-400 transition">
                Primescore
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Partner Network
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl backdrop-blur-xl">
          {/* Title Header */}
          <div className="border-b border-slate-800 pb-6 space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Payout & Fulfillment
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
              Reward Distribution & Payout Policy
            </h1>
            <p className="text-xs text-slate-400">
              Effective Date: January 1, 2026 | Last Updated: August 29, 2026
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                1. PrimePoints Accumulation
              </h2>
              <p>
                PrimePoints are credited to partner accounts upon verification of specific milestone events, including account onboarding, client enrollment, and case completions. All point calculations are automated according to established partner tier multipliers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                2. Gift Card & Voucher Fulfillment
              </h2>
              <p>
                Partners can redeem accumulated PrimePoints for digital gift vouchers (such as Amazon Pay, Flipkart, Myntra, Swiggy, and brand vouchers) available on the Partner Rewards Store.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Vouchers are processed electronically and delivered to the partner dashboard and registered email address.</li>
                <li>Digital gift card vouchers once issued are final, non-refundable, and non-exchangeable.</li>
                <li>Partners are responsible for reviewing brand-specific validity dates and terms upon voucher receipt.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                3. Non-Cash Refund Disclaimer
              </h2>
              <p>
                PrimePoints represent promotional rewards and do not constitute bank deposits or fiat currency balances. Points cannot be directly refunded as cash outside official redemption mechanisms provided on the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                4. Audit & Reversal Terms
              </h2>
              <p>
                In the event of fraudulent lead submissions, canceled client agreements prior to service engagement, or system errors, Primescore reserves the right to audit transactions and adjust point balances accordingly.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                5. Assistance & Settlement Support
              </h2>
              <p>
                For questions regarding pending redemptions, voucher processing, or reward balance discrepancies, please contact our partner support team at partner@primescore.in.
              </p>
            </section>
          </div>

          {/* Bottom Footer Action */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <Link href="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-amber-400 transition">Terms & Conditions</Link>
            </div>
            <Link
              href="/login"
              className="text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              Return to Login &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Primescore Credit Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
