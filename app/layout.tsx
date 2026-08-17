import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Primescore Partner Portal | Credit Bureau & Loan Advisory Network',
  description: 'Official referral portal for DSAs, CAs, and Loan Consultants to submit client credit rectification cases, track bureau progress, and claim PrimePoints payouts.',
  keywords: 'Primescore, partner portal, credit bureau advisory, CIBIL rectification, DSA network, CA referral, loan consultant',
  icons: {
    icon: '/qr-logo.png',
    shortcut: '/qr-logo.png',
    apple: '/qr-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/qr-logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/qr-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
