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
          <Link href="/login" className="flex items-center gap-3">
            <img
              src="/logo-light.png"
              alt="Primescore Partner Network"
              className="h-10 object-contain"
            />
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
              Effective Date: January 1, 2026 | Last Updated: September 11, 2026
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
                <p><strong>Email:</strong> partner@primescore.in</p>
                <p><strong>Helpdesk:</strong> Primescore Credit Solutions</p>
                <p><strong>Portal:</strong> https://partner.primescore.in</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]" />
                8. Account Deletion &amp; Data Removal
              </h2>
              <p>
                You have the right to permanently delete your Primescore Partner account and all associated personal data at any time. We provide two ways to exercise this right:
              </p>

              <div className="space-y-3 pl-1">
                <div className="p-4 bg-[var(--surface)] rounded-xs border border-[var(--border)] space-y-1.5">
                  <p className="font-semibold text-[var(--ink)] text-xs uppercase tracking-wide">Option A — In-App Self-Service (Instant)</p>
                  <p className="text-[var(--ink-muted)] text-xs">
                    Sign in to the Partner Portal → go to <strong>Profile &amp; KYC</strong> → scroll to <em>Account Management</em> → tap <strong>Delete Account</strong>. You will be asked to select a reason and type <code className="font-mono bg-slate-100 px-1 rounded">DELETE</code> to confirm. Deletion is processed immediately upon confirmation.
                  </p>
                </div>

                <div className="p-4 bg-[var(--surface)] rounded-xs border border-[var(--border)] space-y-1.5">
                  <p className="font-semibold text-[var(--ink)] text-xs uppercase tracking-wide">Option B — Email Request</p>
                  <p className="text-[var(--ink-muted)] text-xs">
                    Email <strong className="text-[var(--navy)]">partner@primescore.in</strong> with subject <em>&ldquo;Account Deletion Request&rdquo;</em> from your registered email address. We will process the request within <strong>7 business days</strong>.
                  </p>
                </div>
              </div>

              <p className="font-semibold text-[var(--ink)] pt-1">What gets permanently deleted:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[var(--ink-muted)] pl-2">
                <li><strong className="text-[var(--ink)]">Partner Profile:</strong> Name, email, phone, city, state, profession, PAN, Aadhaar, avatar, and all KYC documents.</li>
                <li><strong className="text-[var(--ink)]">Points &amp; Transactions:</strong> Entire PrimePoints balance, lifetime earnings history, and all point transaction records. Any unredeemed points are forfeited and cannot be recovered.</li>
                <li><strong className="text-[var(--ink)]">Referral Submissions:</strong> All leads and referred client records submitted under your account.</li>
                <li><strong className="text-[var(--ink)]">Redemption History:</strong> All past gift card redemption and voucher records.</li>
                <li><strong className="text-[var(--ink)]">Notifications:</strong> All in-app notification and message records.</li>
                <li><strong className="text-[var(--ink)]">Authentication:</strong> Your login credentials are permanently removed from our authentication system. The email address is freed for re-registration.</li>
              </ul>

              <p>
                A minimal anonymised record (containing only deletion timestamp, reason, and a non-reversible hash of the account) is retained in our internal compliance log for fraud prevention and legal obligation purposes for up to <strong>2 years</strong>, after which it is also purged. This record cannot be used to re-identify you.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[var(--navy)] font-display flex items-center gap-2 border-b border-[var(--surface-3)] pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--navy)]" />
                9. Data Retention Periods
              </h2>
              <p>
                We retain personal data only for as long as necessary to fulfil the purposes described in this policy or as required by applicable law. The following retention periods apply:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[var(--border)] rounded-xs overflow-hidden">
                  <thead className="bg-[var(--surface-2)] text-[var(--navy)] font-bold">
                    <tr>
                      <th className="text-left px-3 py-2 border-b border-[var(--border)]">Data Type</th>
                      <th className="text-left px-3 py-2 border-b border-[var(--border)]">Retention Period</th>
                      <th className="text-left px-3 py-2 border-b border-[var(--border)]">Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-[var(--ink-muted)]">
                    <tr>
                      <td className="px-3 py-2">Partner profile &amp; KYC documents</td>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">Duration of active account</td>
                      <td className="px-3 py-2">Contract performance</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-3 py-2">Points &amp; transaction records</td>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">Duration of active account</td>
                      <td className="px-3 py-2">Contract performance</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Referral &amp; lead submissions</td>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">Duration of active account</td>
                      <td className="px-3 py-2">Legitimate interest</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-3 py-2">All of the above (on account deletion)</td>
                      <td className="px-3 py-2 font-semibold text-red-600">Deleted immediately</td>
                      <td className="px-3 py-2">User request / right to erasure</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Anonymised deletion compliance record</td>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">Up to 2 years post-deletion</td>
                      <td className="px-3 py-2">Legal obligation / fraud prevention</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-3 py-2">Security &amp; system audit logs</td>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">Up to 1 year</td>
                      <td className="px-3 py-2">Legal obligation / security</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Support &amp; email correspondence</td>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">Up to 3 years</td>
                      <td className="px-3 py-2">Dispute resolution</td>
                    </tr>
                  </tbody>
                </table>
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
