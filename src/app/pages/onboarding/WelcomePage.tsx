import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useLang } from '../../i18n';

export default function WelcomePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;

  // inner step: 0 = intro (Keuanganku + Cerita), 1 = persetujuan
  const [innerStep, setInnerStep] = useState(0);
  const [termsChecked, setTermsChecked] = useState(true);

  const handleToTerms = () => setInnerStep(1);

  const handleStart = () => {
    localStorage.setItem('onboarding_terms_accepted', 'true');
    localStorage.setItem('onboarding_step', 'wallet');
    navigate('/onboarding/wallet');
  };

  const features = [
    { emoji: '📊', title: L('Pantau Keuangan', 'Track Finances'), desc: L('Saldo, arus uang, dan progres tabungan dari satu dashboard.', 'Balance, cash flow, and savings from one dashboard.') },
    { emoji: '✏️', title: L('Catat Transaksi', 'Log Transactions'), desc: L('Pemasukan & pengeluaran tersusun per kategori.', 'Income & expenses organized by category.') },
    { emoji: '🎯', title: L('Target Finansial', 'Financial Goals'), desc: L('Task, savings, dan insight untuk keputusan harian.', 'Tasks, savings, and insights for daily decisions.') },
  ];

  const terms = [
    { title: L('Data untuk personalisasi', 'Data for personalization'), desc: L('Informasi Anda dipakai untuk ringkasan dan insight yang relevan.', 'Your info is used for relevant summaries and insights.') },
    { title: L('Privasi tetap milik Anda', 'Your privacy stays yours'), desc: L('Data keuangan disimpan di perangkat dan tidak dijual.', 'Financial data stays on your device and is not sold.') },
    { title: L('Aplikasi membantu, bukan menggantikan', 'App supports, not replaces'), desc: L('Keputusan finansial tetap ada di tangan Anda.', 'Financial decisions remain yours.') },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: 'var(--app-bg)' }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-16 -top-8 h-56 w-56 rounded-full blur-3xl"
          style={{ background: 'rgba(78,222,163,0.18)' }}
          animate={{ x: [0, 10, 0], y: [0, 14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-60px] top-32 h-48 w-48 rounded-full blur-3xl"
          style={{ background: 'rgba(0,180,162,0.14)' }}
          animate={{ x: [0, -12, 0], y: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(78,222,163,0.1)' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-6 pt-10">

        {/* ── STEP 0: Intro ── */}
        <AnimatePresence mode="wait">
          {innerStep === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col flex-1"
            >
              {/* App header */}
              <div className="mb-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] shadow-[0_16px_48px_rgba(78,222,163,0.35)]"
                  style={{ background: 'linear-gradient(135deg, #4edea3, #00b4a2)' }}
                >
                  <span className="text-4xl">💰</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="font-['Plus_Jakarta_Sans'] font-black text-[32px] leading-tight mb-2"
                  style={{ color: 'var(--app-text)' }}
                >
                  Keuanganku
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-sm leading-relaxed max-w-[280px]"
                  style={{ color: 'var(--app-text2)' }}
                >
                  {L('Pendamping untuk mencatat, memahami, dan menjaga ritme keuangan pribadi Anda.', 'A companion for recording, understanding, and maintaining your personal finance rhythm.')}
                </motion.p>
              </div>

              {/* Cerita Keuangan card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-4 rounded-[24px] p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(78,222,163,0.1), rgba(0,180,162,0.06))',
                  border: '1px solid rgba(78,222,163,0.2)',
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: 'rgba(78,222,163,0.15)' }}>
                    📈
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-base" style={{ color: 'var(--app-text)' }}>
                      {L('Cerita Keuangan Anda', 'Your Financial Story')}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--app-text2)' }}>
                      {L('Mulai dari gambaran besar, bukan formulir.', 'Start from the big picture, not forms.')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-start gap-3 rounded-[16px] p-3"
                      style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                        style={{ backgroundColor: 'rgba(78,222,163,0.15)' }}>
                        {f.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#169b6d' }}>{f.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--app-text2)' }}>{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-[24px] border p-4"
                style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)' }}
              >
                <button
                  onClick={handleToTerms}
                  className="w-full rounded-[20px] py-4 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                    color: '#083626',
                    boxShadow: '0 12px 32px rgba(78,222,163,0.3)',
                  }}
                >
                  {L('Lanjut →', 'Next →')}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 1: Persetujuan ── */}
          {innerStep === 1 && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col flex-1"
            >
              {/* Back button */}
              <button
                onClick={() => setInnerStep(0)}
                className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border self-start"
                style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-[20px]"
                  style={{ background: 'linear-gradient(135deg, rgba(78,222,163,0.2), rgba(0,180,162,0.1))', border: '1px solid rgba(78,222,163,0.25)' }}>
                  <span className="text-3xl">🤝</span>
                </div>
                <h2 className="font-['Plus_Jakarta_Sans'] font-black text-[26px] mb-2" style={{ color: 'var(--app-text)' }}>
                  {L('Persetujuan', 'Agreement')}
                </h2>
                <p className="text-sm" style={{ color: 'var(--app-text2)' }}>
                  {L('Kami menghargai privasi dan transparansi Anda.', 'We value your privacy and transparency.')}
                </p>
              </div>

              {/* Terms cards */}
              <div className="space-y-3 mb-6">
                {terms.map((term, i) => (
                  <motion.div
                    key={term.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-[18px] p-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(78,222,163,0.07), rgba(0,180,162,0.03))',
                      border: '1px solid rgba(78,222,163,0.15)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: '#4edea3', color: '#083626' }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: '#169b6d' }}>{term.title}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>{term.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex-1" />

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-[24px] border p-4 space-y-3"
                style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)' }}
              >
                {/* Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setTermsChecked(v => !v)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all"
                    style={{
                      borderColor: termsChecked ? '#4edea3' : 'var(--app-border)',
                      backgroundColor: termsChecked ? '#4edea3' : 'transparent',
                    }}
                  >
                    {termsChecked && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#083626" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--app-text2)' }}>
                    {L('Saya menyetujui ketentuan layanan di atas', 'I agree to the terms of service above')}
                  </span>
                </label>

                <button
                  onClick={handleStart}
                  disabled={!termsChecked}
                  className="w-full rounded-[20px] py-4 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                    color: '#083626',
                    boxShadow: termsChecked ? '0 12px 32px rgba(78,222,163,0.3)' : 'none',
                  }}
                >
                  {L('Bangun Masa Depan Finansial 🚀', 'Build Your Financial Future 🚀')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
