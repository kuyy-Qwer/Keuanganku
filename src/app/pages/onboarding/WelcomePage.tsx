import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useLang } from '../../i18n';
import AppLogo from '../../components/AppLogo';

export default function WelcomePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;

  // 0 = Keuanganku + Cerita Keuangan, 1 = Persetujuan
  const [innerStep, setInnerStep] = useState(0);
  const [termsChecked, setTermsChecked] = useState(true);

  const handleStart = () => {
    localStorage.setItem('onboarding_terms_accepted', 'true');
    localStorage.setItem('onboarding_step', 'profile');
    navigate('/onboarding/profile');
  };

  const features = [
    {
      emoji: '📊',
      title: L('Pantau Keuangan', 'Track Finances'),
      desc: L('Saldo, arus uang, dan progres tabungan dari satu dashboard.', 'Balance, cash flow, and savings from one dashboard.'),
    },
    {
      emoji: '✏️',
      title: L('Catat Transaksi', 'Log Transactions'),
      desc: L('Pemasukan & pengeluaran tersusun per kategori.', 'Income & expenses organized by category.'),
    },
    {
      emoji: '🎯',
      title: L('Target Finansial', 'Financial Goals'),
      desc: L('Task, savings, dan insight untuk keputusan harian.', 'Tasks, savings, and insights for daily decisions.'),
    },
  ];

  const terms = [
    {
      title: L('Data untuk personalisasi', 'Data for personalization'),
      desc: L('Informasi Anda dipakai untuk ringkasan dan insight yang relevan.', 'Your info is used for relevant summaries and insights.'),
    },
    {
      title: L('Privasi tetap milik Anda', 'Your privacy stays yours'),
      desc: L('Data keuangan disimpan di perangkat dan tidak dijual.', 'Financial data stays on your device and is not sold.'),
    },
    {
      title: L('Aplikasi membantu, bukan menggantikan', 'App supports, not replaces'),
      desc: L('Keputusan finansial tetap ada di tangan Anda.', 'Financial decisions remain yours.'),
    },
  ];

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: 'var(--app-bg)' }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 280, height: 280, background: 'rgba(78,222,163,0.14)', top: '-60px', left: '-80px', filter: 'blur(70px)' }}
          animate={{ x: [0, 12, 0], y: [0, 16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 240, height: 240, background: 'rgba(0,180,162,0.1)', bottom: '10%', right: '-60px', filter: 'blur(60px)' }}
          animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[390px] mx-auto flex flex-col min-h-screen px-5 pb-8 pt-12">

        <AnimatePresence mode="wait">

          {/* ══ STEP 0: Keuanganku + Cerita Keuangan ══ */}
          {innerStep === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col flex-1"
            >
              {/* ── App header ── */}
              <div className="flex flex-col items-center text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-5 mx-auto"
                >
                  <AppLogo size={80} variant="dark" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-['Plus_Jakarta_Sans'] font-black text-[30px] leading-tight mb-2"
                  style={{ color: 'var(--app-text)' }}
                >
                  Keuanganku
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm leading-relaxed max-w-[270px]"
                  style={{ color: 'var(--app-text2)' }}
                >
                  {L(
                    'Pendamping untuk mencatat, memahami, dan menjaga ritme keuangan pribadi Anda.',
                    'A companion for recording, understanding, and maintaining your personal finance rhythm.',
                  )}
                </motion.p>
              </div>

              {/* ── Cerita Keuangan card — warna hijau, teks terbaca ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5 rounded-[22px] overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #0d2e1e 0%, #0f3524 100%)',
                  border: '1px solid rgba(78,222,163,0.28)',
                  boxShadow: '0 8px 32px rgba(78,222,163,0.12)',
                }}
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-3"
                  style={{ borderBottom: '1px solid rgba(78,222,163,0.15)' }}>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: 'rgba(78,222,163,0.2)' }}
                  >
                    📈
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: '#4edea3' }}>
                      {L('Cerita Keuangan Anda', 'Your Financial Story')}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(78,222,163,0.65)' }}>
                      {L('Mulai dari gambaran besar, bukan formulir.', 'Start from the big picture, not forms.')}
                    </p>
                  </div>
                </div>

                {/* Feature rows */}
                <div className="px-4 py-3 space-y-2">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="flex items-center gap-3 rounded-[14px] px-3 py-3"
                      style={{ background: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.12)' }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[18px]"
                        style={{ background: 'rgba(78,222,163,0.15)' }}
                      >
                        {f.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#a7f3d0' }}>{f.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(167,243,208,0.65)' }}>{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="flex-1" />

              {/* ── CTA ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-[22px] p-4"
                style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)' }}
              >
                <button
                  onClick={() => setInnerStep(1)}
                  className="w-full rounded-[18px] py-4 font-bold text-[15px] transition-all active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                    color: '#083626',
                    boxShadow: '0 12px 32px rgba(78,222,163,0.32)',
                  }}
                >
                  {L('Lanjut →', 'Next →')}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ══ STEP 1: Persetujuan ══ */}
          {innerStep === 1 && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col flex-1"
            >
              {/* Back */}
              <button
                onClick={() => setInnerStep(0)}
                className="mb-7 flex h-10 w-10 items-center justify-center rounded-full border self-start"
                style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-7 text-center">
                <div
                  className="mb-4 flex h-[60px] w-[60px] mx-auto items-center justify-center rounded-[18px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(78,222,163,0.18), rgba(0,180,162,0.1))',
                    border: '1px solid rgba(78,222,163,0.28)',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>🤝</span>
                </div>
                <h2
                  className="font-['Plus_Jakarta_Sans'] font-black text-[26px] mb-2"
                  style={{ color: 'var(--app-text)' }}
                >
                  {L('Persetujuan', 'Agreement')}
                </h2>
                <p className="text-sm" style={{ color: 'var(--app-text2)' }}>
                  {L('Kami menghargai privasi dan transparansi Anda.', 'We value your privacy and transparency.')}
                </p>
              </div>

              {/* Terms */}
              <div className="space-y-3 mb-6">
                {terms.map((term, i) => (
                  <motion.div
                    key={term.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-[16px] p-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(78,222,163,0.08), rgba(0,180,162,0.04))',
                      border: '1px solid rgba(78,222,163,0.18)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: '#4edea3', color: '#083626' }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--app-text)' }}>
                          {term.title}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                          {term.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex-1" />

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-[22px] p-4 space-y-3"
                style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)' }}
              >
                {/* Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
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
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                    {L('Saya menyetujui ketentuan layanan di atas', 'I agree to the terms of service above')}
                  </span>
                </label>

                <button
                  onClick={handleStart}
                  disabled={!termsChecked}
                  className="w-full rounded-[18px] py-4 font-bold text-[15px] transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                    color: '#083626',
                    boxShadow: termsChecked ? '0 12px 32px rgba(78,222,163,0.32)' : 'none',
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
