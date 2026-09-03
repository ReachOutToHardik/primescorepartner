'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyInr,
  Gift,
  WhatsappLogo,
  Crown,
  Link as LinkIcon,
  ArrowsClockwise,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Coins,
  Bank,
  CheckCircle,
} from '@phosphor-icons/react';

const GIFT_CARDS = [
  { name: 'Amazon', src: '/gift-cards/amazon.png' },
  { name: 'Flipkart', src: '/gift-cards/flipkart.png' },
  { name: 'Myntra', src: '/gift-cards/myntra.png' },
  { name: 'AJIO', src: '/gift-cards/ajio.png' },
];

interface SlideContent {
  id: number;
  category: string;
  line1: string;
  line2Regular?: string;
  line2Accent: string;
  subtitle: string;
  cards: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  showGiftCardMarquee?: boolean;
  ctaText: string;
  footerText: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [[currentSlide, direction], setSlide] = useState([0, 0]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 32 : -32,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -32 : 32,
      opacity: 0,
    }),
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setSlide([currentSlide + 1, 1]);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setSlide([currentSlide - 1, -1]);
    }
  };

  const handleDotClick = (targetIndex: number) => {
    if (targetIndex !== currentSlide) {
      setSlide([targetIndex, targetIndex > currentSlide ? 1 : -1]);
    }
  };

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('primescore_has_seen_onboarding', 'true');
      } catch (_) {}
    }
    router.push('/dashboard');
  };

  const slides: SlideContent[] = [
    // ── SLIDE 1: MONETIZE REJECTED CASES ─────────────────────────────────────
    {
      id: 1,
      category: 'Commission & Referral Payouts',
      line1: 'Turn declined loan files',
      line2Regular: 'into ',
      line2Accent: 'high-value commissions.',
      subtitle:
        'When a client’s loan application is rejected due to credit bureau discrepancies, submit their file to PrimeScore for rectification and earn on resolution.',
      cards: [
        {
          icon: <CurrencyInr size={32} weight="bold" className="text-emerald-400" />,
          title: 'Up to 15% Commission',
          description:
            'Earn between ₹1,500 and ₹7,500+ based on case resolution fee and partner tier.',
        },
        {
          icon: <CheckCircle size={32} weight="fill" className="text-blue-400" />,
          title: 'Client Enrollment Bonus',
          description:
            'Earn 100 to 150 PrimePoints immediately when your referred client signs up.',
        },
        {
          icon: <Bank size={32} weight="bold" className="text-amber-400" />,
          title: 'Re-apply and Close the Loan',
          description:
            'Once bureau errors are rectified, re-submit their loan to your lending partners and earn your standard bank payout.',
        },
      ],
      ctaText: 'Next →',
      footerText: 'Takes less than 60 seconds to submit a client file.',
    },

    // ── SLIDE 2: STRAIGHTFORWARD REDEMPTION ───────────────────────────────────
    {
      id: 2,
      category: 'Points & Payout Value',
      line1: 'Simple conversion.',
      line2Accent: '4 PrimePoints = ₹1.',
      subtitle:
        'Your PrimePoints hold transparent cash value. Accumulate points and redeem them for digital brand vouchers whenever you choose.',
      showGiftCardMarquee: true,
      cards: [
        {
          icon: <Gift size={32} weight="fill" className="text-amber-400" />,
          title: 'Direct Brand Vouchers',
          description:
            'Redeem for Amazon Pay, Flipkart, Myntra, or AJIO vouchers with zero deduction fees.',
        },
        {
          icon: <WhatsappLogo size={32} weight="fill" className="text-emerald-400" />,
          title: 'Delivered via SMS & WhatsApp',
          description:
            'Digital voucher codes and verification PINs are sent directly to your mobile number.',
        },
        {
          icon: <Crown size={32} weight="fill" className="text-indigo-300" />,
          title: 'Tier-Based Payout Rates',
          description:
            'Advance from Silver (10%) to Gold (12%) and Platinum (15%) as your case volume grows.',
        },
      ],
      ctaText: 'Next →',
      footerText: '100% face-value digital redemption with instant code delivery.',
    },

    // ── SLIDE 3: SUB-AGENT NETWORK ───────────────────────────────────────────
    {
      id: 3,
      category: 'Team & Sub-Agent Network',
      line1: 'Build your network.',
      line2Regular: 'Earn a ',
      line2Accent: '10% commission.',
      subtitle:
        'Invite other DSAs, accountants, and financial advisors to Primescore. When they close a case, you get a 10% cut. It’s that simple.',
      cards: [
        {
          icon: <LinkIcon size={32} weight="bold" className="text-blue-400" />,
          title: 'Your Unique Invite Link',
          description:
            'Share your partner code and track exactly who signs up under your umbrella.',
        },
        {
          icon: <ArrowsClockwise size={32} weight="bold" className="text-emerald-400" />,
          title: 'Automated Payouts',
          description:
            'They do the work, you get 10% bonus points credited directly to your dashboard.',
        },
        {
          icon: <Gift size={32} weight="fill" className="text-amber-400" />,
          title: '100 Points to Start',
          description:
            'Your welcome bonus is already active. Claim it inside your dashboard.',
        },
      ],
      ctaText: 'Next →',
      footerText: 'Takes less than 30 seconds to set up.',
    },

    // ── SLIDE 4: START REFERRING TODAY ────────────────────────────────────────
    {
      id: 4,
      category: 'Portal Activation',
      line1: 'Start submitting client files',
      line2Regular: 'to ',
      line2Accent: 'PrimeScore today.',
      subtitle:
        'Your partner portal is active and ready. Submit your first client in under a minute and track progress in real time.',
      cards: [
        {
          icon: <FileText size={32} weight="bold" className="text-blue-400" />,
          title: 'Simple Client Submission',
          description:
            'Enter client name, contact number, and service required. Our certified specialists take care of the rest.',
        },
        {
          icon: <ShieldCheck size={32} weight="fill" className="text-emerald-400" />,
          title: 'Live 5-Stage Tracking',
          description:
            'Monitor referrals from submission to resolution on your dashboard without manual phone follow-ups.',
        },
        {
          icon: <Coins size={32} weight="fill" className="text-amber-400" />,
          title: '100 Welcome Points Credited',
          description:
            'Your welcome balance is active in your ledger. Complete your first referral to unlock additional rewards.',
        },
      ],
      ctaText: 'Claim Your Bonus & Enter Dashboard →',
      footerText: 'Direct access to your referral pipeline and payout ledger.',
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#0F1A4E] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#F5C518] selection:text-black">
      {/* Background SVG Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="primescore-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#primescore-grid)" />
      </svg>

      {/* Background Static & Animated Precision Dial Arcs */}
      <motion.div
        className="absolute -top-28 -right-28 w-[420px] h-[420px] pointer-events-none opacity-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
          <circle cx="200" cy="200" r="185" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="145" stroke="rgba(245,197,24,0.18)" strokeWidth="1.5" strokeDasharray="14 10" />
          <circle cx="200" cy="200" r="105" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute -bottom-36 -left-36 w-[480px] h-[480px] pointer-events-none opacity-30"
        animate={{ rotate: -360 }}
        transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 450 450" className="w-full h-full fill-none">
          <circle cx="225" cy="225" r="215" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="225" cy="225" r="165" stroke="rgba(61,170,75,0.15)" strokeWidth="1.5" strokeDasharray="8 12" />
        </svg>
      </motion.div>

      {/* Ambient Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#1B2A72]/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header - Constrained to mobile width */}
      <header className="relative z-10 max-w-[420px] mx-auto w-full px-5 pt-7 sm:pt-9 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/logo-light.png"
            alt="PrimeScore"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </div>

        {/* Step dots & Skip */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleDotClick(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-6 bg-[#F5C518]'
                    : idx < currentSlide
                    ? 'w-2.5 bg-white/40'
                    : 'w-2 bg-white/15'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="text-xs text-slate-300 hover:text-white font-medium transition-colors py-1 px-2.5 rounded-md hover:bg-white/10 cursor-pointer"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Main Slide Content - Constrained to mobile width */}
      <main className="relative z-10 max-w-[420px] mx-auto w-full px-5 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="space-y-5 sm:space-y-6"
          >
            {/* Header Block */}
            <div className="text-left space-y-2.5">
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/15 rounded-md uppercase tracking-wider">
                {slide.category}
              </span>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                <span className="block">{slide.line1}</span>
                <span className="block">
                  {slide.line2Regular}
                  <span className="text-[#F5C518]">{slide.line2Accent}</span>
                </span>
              </h1>

              <p className="text-sm text-slate-300 font-normal leading-relaxed">
                {slide.subtitle}
              </p>
            </div>

            {/* Gift Card Infinite Marquee - Edgeless on Mobile, Constrained on Desktop */}
            {slide.showGiftCardMarquee && (
              <div className="relative -mx-5 sm:mx-0 w-[calc(100%+2.5rem)] sm:w-full overflow-hidden py-1.5 my-3">
                {/* Left Blur Fade */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-[#0F1A4E] via-[#0F1A4E]/90 to-transparent z-10 pointer-events-none" />
                {/* Right Blur Fade */}
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-[#0F1A4E] via-[#0F1A4E]/90 to-transparent z-10 pointer-events-none" />

                {/* Seamless Infinite Marquee with Framer Motion (0% to -50% loop) */}
                <motion.div
                  className="flex w-max"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: 16,
                      ease: 'linear',
                    },
                  }}
                >
                  {/* Track 1 */}
                  <div className="flex shrink-0 gap-3 pr-3">
                    {GIFT_CARDS.map((gc, idx) => (
                      <div
                        key={`t1-${idx}`}
                        className="w-[124px] h-[78px] rounded-xl overflow-hidden shrink-0 shadow-md border border-white/10 hover:border-white/30 transition-transform duration-200 hover:scale-[1.03] bg-black/20"
                      >
                        <img
                          src={gc.src}
                          alt={gc.name}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Track 2 (Identical Clone for Zero-Stutter Seamless Loop) */}
                  <div className="flex shrink-0 gap-3 pr-3" aria-hidden="true">
                    {GIFT_CARDS.map((gc, idx) => (
                      <div
                        key={`t2-${idx}`}
                        className="w-[124px] h-[78px] rounded-xl overflow-hidden shrink-0 shadow-md border border-white/10 hover:border-white/30 transition-transform duration-200 hover:scale-[1.03] bg-black/20"
                      >
                        <img
                          src={gc.src}
                          alt={gc.name}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* 3 Translucent Glass Cards (Matches Screenshot Aesthetic) */}
            <div className="space-y-3">
              {slide.cards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.2 }}
                  whileHover={{ scale: 1.012, transition: { duration: 0.15 } }}
                  className="p-4 sm:p-4.5 rounded-2xl bg-[#121E46]/90 hover:bg-[#152352] border border-white/10 hover:border-white/20 flex items-start gap-4 text-left shadow-lg shadow-black/20 backdrop-blur-md transition-all"
                >
                  <div className="shrink-0 pt-0.5">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {card.title}
                    </h2>
                    <p className="text-xs sm:text-[13px] text-slate-300 font-normal leading-relaxed mt-1">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Action Footer - Constrained to mobile width with generous bottom margin */}
      <footer className="relative z-10 max-w-[420px] mx-auto w-full px-5 pb-14 sm:pb-16 pt-3 mb-4 sm:mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-12 w-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Previous step"
              >
                <ArrowLeft size={17} weight="bold" />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-sm sm:text-base font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-blue-400/20"
            >
              <span>{slide.ctaText}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 font-normal text-center pb-2">
            {slide.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
}
