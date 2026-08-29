import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Primescore Partner Portal',
  description: 'Privacy Policy and Data Protection Standards for the Primescore Partner Portal',
};

export default function PrivacyPolicyPage() {
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
              <span>Legal Document</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--ink)] tracking-tight">
              Privacy Policy & Data Security
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
                1. Overview & Scope
              </h2>
              <p>
                Primescore (&ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Our&rdquo;) operates the Primescore Partner Portal. We prioritize the security, confidentiality, and integrity of all personal, operational, and financial data processed through our partner application and management interfaces.
              </p>
              <p>
                This Privacy Policy describes our general practices regarding the collection, processing, storage, and handling of information when you register as a partner, refer potential clients, or access our portal features.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                2. Data We Collect
              </h2>
              <p>
                To provide partner account management, referral tracking, and reward calculations, we may process:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[var(--ink-muted)] pl-2">
                <li><strong className="text-[var(--ink)]">Partner Profile Data:</strong> Name, contact details, email address, profession, city, and state.</li>
                <li><strong className="text-[var(--ink)]">KYC & Identity Data:</strong> Permanent Account Number (PAN), verification records, and submitted identity documents.</li>
                <li><strong className="text-[var(--ink)]">Banking Details:</strong> Bank account numbers, IFSC codes, and settlement records for reward redemption.</li>
                <li><strong className="text-[var(--ink)]">Referral Submissions:</strong> Client contact details submitted by partners for credit counseling evaluation.</li>
                <li><strong className="text-[var(--ink)]">System Technical Logs:</strong> IP address, device telemetry, browser type, and portal interaction timestamps.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                3. Purpose & Use of Data
              </h2>
              <p>
                Information processed through the portal is used solely for legitimate business operations, including:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[var(--ink-muted)] pl-2">
                <li>Authenticating partner credentials and fulfilling KYC verification requirements.</li>
                <li>Attributing, recording, and tracking client referral submissions across workflow stages.</li>
                <li>Calculating PrimePoints rewards, tier progressions, and issuing gift card vouchers.</li>
                <li>Sending operational notifications, transactional email alerts, and administrative updates.</li>
                <li>Maintaining audit logs for security, dispute resolution, and system protection.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                4. Data Security & Storage Standards
              </h2>
              <p>
                We employ standard industry security protocols, including encrypted communications (HTTPS/TLS), access restriction controls, and secure database storage. We do not sell, rent, or trade partner or client data to unauthorized third-party commercial entities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                5. Third-Party Service Integrations
              </h2>
              <p>
                We may utilize secure third-party service providers (such as cloud hosting providers, transactional email services, and messaging gateways) to support portal operations. All service providers are expected to adhere to data confidentiality standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                6. General Disclaimer & Limitation
              </h2>
              <p>
                The Primescore Partner Portal is an administrative platform for referral tracking and partner collaboration. Registration as a partner does not guarantee any specific volume of referred cases, financial returns, or specific credit score outcomes for referred clients. All referral evaluations are subject to independent assessment.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]"></span>
                7. Privacy Queries & Contact Information
              </h2>
              <p>
                For privacy questions, data update requests, or general inquiries regarding this policy, please reach out to our team at:
              </p>
              <div className="p-4 bg-[var(--surface)] rounded-xs border border-[var(--border)] space-y-1 font-mono text-xs text-[var(--ink)]">
                <p><strong>Email:</strong> info@primescore.in / partner@primescore.in</p>
                <p><strong>Helpdesk:</strong> Primescore Credit Solutions</p>
                <p><strong>Portal:</strong> https://partner.primescore.in</p>
              </div>
            </section>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-[var(--ink-muted)] font-medium">
              <Link href="/terms" className="hover:text-[var(--navy)] underline transition">Terms & Conditions</Link>
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
