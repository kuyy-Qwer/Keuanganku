import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface OnboardingShellProps {
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  footer: React.ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}

export default function OnboardingShell({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  footer,
  onBack,
  onSkip,
  skipLabel,
}: OnboardingShellProps) {
  const progress = Math.max((step / totalSteps) * 100, 0);

  // Scroll ke atas setiap kali step berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  return (
    <div className="relative min-h-screen overflow-hidden app-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-16 top-0 h-48 w-48 rounded-full blur-3xl"
          style={{ background: 'rgba(78, 222, 163, 0.25)' }} /* More visible green */
          animate={{ x: [0, 12, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-72px] top-28 h-56 w-56 rounded-full blur-3xl"
          style={{ background: 'rgba(0, 180, 162, 0.2)' }} /* More visible green */
          animate={{ x: [0, -18, 0], y: [0, 10, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-16 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(78, 222, 163, 0.15)' }} /* Green instead of white */
          animate={{ y: [0, -10, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-5 pt-4">
        <motion.div
          className="mb-5 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
        >
          <div className="w-10">
            {onBack ? (
              <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="text-center">
            <p className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--app-text2)' }}>
              {step}/{totalSteps}
            </p>
            <h1 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold" style={{ color: 'var(--app-text)' }}>
              {title}
            </h1>
          </div>

          <div className="w-10 text-right">
            {onSkip ? (
              <button onClick={onSkip} className="text-sm font-medium" style={{ color: 'var(--app-text2)' }}>
                {skipLabel}
              </button>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          className="mb-5 rounded-[32px] border px-4 py-5 shadow-[0_18px_50px_rgba(78,222,163,0.1)] backdrop-blur-sm green-shadow"
          style={{ background: 'var(--app-card)', borderColor: 'rgba(78, 222, 163, 0.2)' }}
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.34, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-['Plus_Jakarta_Sans'] text-[22px] font-bold leading-tight text-green-primary">
                {title}
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {subtitle}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-sm font-bold green-shadow" style={{ backgroundColor: 'rgba(78, 222, 163, 0.25)', color: '#ffffff' }}>
              {step}/{totalSteps}
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(78, 222, 163, 0.1)' }}>
            <motion.div
              className="h-full rounded-full progress-bar-green"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>

        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>

        <motion.div
          className="sticky bottom-0 z-20 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-[28px] border px-4 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.08)] backdrop-blur-xl" style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            {footer}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
