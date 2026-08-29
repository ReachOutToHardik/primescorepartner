import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Primescore Partner Portal',
  description: 'Partner Terms of Service and Operational Agreement for Primescore Partner Portal',
};

export default function TermsPage() {
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
              Operational Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
              Partner Program Terms & Conditions
            </h1>
            <p className="text-xs text-slate-400">
              Effective Date: January 1, 2026 | Last Updated: August 29, 2026
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                1. Acceptance of Terms & Partner Enrollment
              </h2>
              <p>
                By creating a partner account or accessing the Primescore Partner Portal, you agree to be bound by these Terms and Conditions. The partner program is open to eligible professionals, independent agents, DSAs, financial consultants, and institutional representatives.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                2. Independent Partner Relationship
              </h2>
              <p>
                The relationship between Primescore and the Partner is that of independent contractor entities. Nothing contained in these terms shall be construed to create a joint venture, franchise, employment, agency, or partnership relationship between the parties. Partners have no authority to bind Primescore to any contract or obligation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                3. Lead Submission & Attribution Rules
              </h2>
              <p>
                Partners may refer potential clients for credit score analysis and counseling services. Lead attribution is tracked automatically via unique referral links or referral codes assigned upon account creation.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Leads must contain authentic client details submitted with appropriate consent.</li>
                <li>Primescore reserves the right to verify client interest and decline duplicate or uncontactable leads.</li>
                <li>Referral activity is evaluated independently per client application without guarantee of approval or conversion.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                4. Rewards, Tiers & PrimePoints System
              </h2>
              <p>
                PrimePoints are promotional reward credits awarded to partners for verified portal activity and case milestones. Points are non-transferable, carry no direct cash value except when redeemed through official portal gift voucher channels, and are subject to program parameters.
              </p>
              <p>
                Partner tier levels (Silver, Gold, Platinum) are calculated based on cumulative lifetime points earned. Primescore reserves the right to modify reward schedules, tier parameters, or redemption offerings upon system updates.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                5. Compliance, Conduct & Anti-Fraud Policy
              </h2>
              <p>
                Partners agree not to engage in deceptive, fraudulent, or spam marketing practices. Misrepresentation of Primescore services, creation of fake client profiles, or unauthorized collection of upfront client fees will result in immediate account termination and forfeiture of accrued points.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                6. Limitation of Liability & General Disclaimer
              </h2>
              <p>
                Primescore provides the Partner Portal on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee uninterrupted system access or specific client conversion rates. In no event shall Primescore be liable for indirect, incidental, consequential, or punitive damages arising out of portal usage.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                7. Modifications & Inquiries
              </h2>
              <p>
                Primescore reserves the right to update these Terms at any time. Continued portal usage following updates constitutes acceptance of revised terms. For operational or legal inquiries, reach out to partner@primescore.in.
              </p>
            </section>
          </div>

          {/* Bottom Footer Action */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <Link href="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/refund" className="hover:text-amber-400 transition">Payout & Rewards Policy</Link>
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
