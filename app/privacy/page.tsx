import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Primescore Partner Portal',
  description: 'Privacy Policy and Data Handling Guidelines for Primescore Partner Portal',
};

export default function PrivacyPolicyPage() {
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
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
              Privacy Policy & Data Security
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
                1. Overview & Commitment
              </h2>
              <p>
                Primescore (&ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Our&rdquo;) operates the Primescore Partner Portal. We are committed to upholding strict data privacy standards and protecting all personal, financial, and referral information collected through our digital platforms.
              </p>
              <p>
                This Privacy Policy outlines how we collect, process, store, and safeguard the information you provide when registering as a partner, referring potential clients, or engaging with our partner portal services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                2. Information We Collect
              </h2>
              <p>
                To facilitate partner account verification, referral tracking, and reward settlement, we collect the following categories of information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li><strong className="text-slate-200">Partner Identification Data:</strong> Full name, email address, mobile number, professional designation, city, and state.</li>
                <li><strong className="text-slate-200">KYC Verification Data:</strong> PAN card details, Aadhaar verification parameters, and government-issued identity documents.</li>
                <li><strong className="text-slate-200">Banking & Settlement Information:</strong> Bank account numbers, IFSC codes, account holder names, and reward transaction history.</li>
                <li><strong className="text-slate-200">Referral Lead Information:</strong> Customer contact details submitted by partners for credit evaluation and counseling services.</li>
                <li><strong className="text-slate-200">Technical Data:</strong> Device IP address, browser metadata, session duration, and portal activity logs.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                3. How Information Is Used
              </h2>
              <p>
                Information collected is strictly utilized for legitimate business operations, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Verifying partner eligibility and performing mandatory Know-Your-Customer (KYC) checks.</li>
                <li>Attributing, tracking, and processing referral leads across the lifecycle stages.</li>
                <li>Calculating, crediting, and fulfilling PrimePoints reward distributions and gift card vouchers.</li>
                <li>Sending transactional updates, system alerts, security notifications, and program updates.</li>
                <li>Maintaining audit logs for compliance, fraud prevention, and system security.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                4. Data Protection & Security Controls
              </h2>
              <p>
                We implement enterprise-grade security architecture, including end-to-end transport layer security (TLS 1.3), AES-256 encryption at rest, role-based access control (RBAC), and continuous threat monitoring. Partner authentication credentials and database transactions are protected by cryptographic key management standards.
              </p>
              <p>
                We do not sell, rent, lease, or trade partner or customer data to third-party marketing entities under any circumstances.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                5. Third-Party Service Providers
              </h2>
              <p>
                We engage trusted third-party technology infrastructure providers (including cloud database hosting, transactional email delivery services, and OTP verification gateways) under strict data processing agreements. These vendors process data exclusively on our instructions and in compliance with security guidelines.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                6. General Disclaimer & Liability Limitation
              </h2>
              <p>
                The Primescore Partner Portal functions as a digital management tool for partner activity and credit counseling advisory tracking. Registration or participation in the partner network does not guarantee any specific volume of referred cases, conversion rates, or financial earnings. All partner referral compensation is contingent upon verified activity in accordance with system guidelines.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                7. Contact & Data Grievances
              </h2>
              <p>
                If you have questions regarding this Privacy Policy, wish to request profile updates, or have privacy concerns, please contact our Compliance Officer at:
              </p>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1 font-mono text-xs text-amber-300">
                <p><strong>Email:</strong> privacy@primescore.in / partner@primescore.in</p>
                <p><strong>Support Desk:</strong> Primescore Credit Solutions Pvt Ltd</p>
                <p><strong>Portal Helpdesk:</strong> https://partner.primescore.in</p>
              </div>
            </section>
          </div>

          {/* Bottom Footer Action */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <Link href="/terms" className="hover:text-amber-400 transition">Terms & Conditions</Link>
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
