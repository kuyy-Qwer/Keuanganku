import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useLang } from '../../i18n';

const TASKS = [
  {
    id: 'record',
    emoji: '✏️',
    title: (L: (id: string, en: string) => string) =>
      L('Catat transaksi pertama', 'Record your first transaction'),
    desc: (L: (id: string, en: string) => string) =>
      L(
        'Tap tombol (+) di dashboard, pilih kategori, isi nominal, lalu simpan.',
        'Tap the (+) button on the dashboard, choose a category, enter the amount, then save.',
      ),
    exp: 20,
  },
  {
    id: 'balance',
    emoji: '💰',
    title: (L: (id: string, en: string) => string) =>
      L('Cek saldo aktif', 'Check your active balance'),
    desc: (L: (id: string, en: string) => string) =>
      L(
        'Lihat kartu saldo di halaman utama — ini adalah total uang yang bisa kamu gunakan.',
        'See the balance card on the home page — this is the total money you can use.',
      ),
    exp: 15,
  },
  {
    id: 'wallet',
    emoji: '🏦',
    title: (L: (id: string, en: string) => string) =>
      L('Buka halaman Wallet', 'Open the Wallet page'),
    desc: (L: (id: string, en: string) => string) =>
      L(
        'Tap menu Wallet untuk melihat rincian cash dan rekening bank kamu.',
        'Tap the Wallet menu to see your cash and bank account details.',
      ),
    exp: 15,
  },
];

export default function TutorialPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;

  // Tombol muncul setelah 5 detik
  const [buttonsReady, setButtonsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setButtonsReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const finishOnboarding = (startTour: boolean) => {
    const currentExp = parseInt(localStorage.getItem('user_exp') || '0');
    if (startTour) {
      localStorage.setItem('user_exp', (currentExp + 50).toString());
      localStorage.setItem('onboarding_tour_pending', 'true');
      localStorage.setItem('mission_completed', 'true');
    } else {
      localStorage.setItem('user_exp', (currentExp + 10).toString());
    }
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    navigate('/app');
  };

  const totalExp = TASKS.reduce((s, t) => s + t.exp, 0) + 50;

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: 'var(--app-bg)' }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 260, height: 260, background: 'rgba(78,222,163,0.13)', top: '-50px', left: '-70px', filter: 'blur(65px)' }}
          animate={{ x: [0, 10, 0], y: [0, 14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 220, height: 220, background: 'rgba(0,180,162,0.1)', bottom: '15%', right: '-50px', filter: 'blur(55px)' }}
          animate={{ x: [0, -8, 0], y: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[390px] mx-auto flex flex-col min-h-screen px-5 pb-8 pt-10">

        {/* Back */}
        <button
          onClick={() => navigate('/onboarding/wallet')}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border self-start"
          style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress 4/4 */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="h-1.5 flex-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(78,222,163,0.12)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4edea3, #00b4a2)' }}
                initial={{ width: 0 }} animate={{ width: '100%' }}
                transition={{ duration: 0.4, delay: s * 0.08 }} />
            </div>
          ))}
          <span className="text-xs font-semibold ml-1" style={{ color: 'var(--app-text2)' }}>4/4</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <div
            className="mb-4 flex h-[64px] w-[64px] mx-auto items-center justify-center rounded-[20px]"
            style={{
              background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
              boxShadow: '0 12px 32px rgba(78,222,163,0.32)',
            }}
          >
            <span style={{ fontSize: '30px' }}>🎮</span>
          </div>
          <h2
            className="font-['Plus_Jakarta_Sans'] font-black text-[26px] mb-2"
            style={{ color: 'var(--app-text)' }}
          >
            {L('Interactive Mission', 'Interactive Mission')}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
            {L(
              'Selesaikan 3 tugas singkat di dalam aplikasi dan dapatkan EXP pertama kamu!',
              'Complete 3 quick tasks inside the app and earn your first EXP!',
            )}
          </p>
        </motion.div>

        {/* EXP total badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-5 flex items-center justify-center"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(78,222,163,0.12))',
              border: '1px solid rgba(251,191,36,0.25)',
            }}
          >
            <span style={{ fontSize: '18px' }}>⭐</span>
            <span className="font-bold text-sm" style={{ color: '#d97706' }}>
              +{totalExp} EXP
            </span>
            <span className="text-xs" style={{ color: 'var(--app-text2)' }}>
              {L('total reward', 'total reward')}
            </span>
          </div>
        </motion.div>

        {/* Task cards */}
        <div className="space-y-3 mb-6">
          {TASKS.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.1 }}
              className="rounded-[18px] p-4"
              style={{
                background: 'var(--app-card)',
                border: '1px solid var(--app-border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-xl"
                  style={{ background: 'rgba(78,222,163,0.12)', border: '1px solid rgba(78,222,163,0.2)' }}
                >
                  {task.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                      {task.title(L)}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: 'rgba(78,222,163,0.12)', color: '#169b6d' }}
                    >
                      +{task.exp} EXP
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                    {task.desc(L)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex-1" />

        {/* CTA — muncul setelah 5 detik */}
        <AnimatePresence mode="wait">
          {!buttonsReady ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[22px] p-5 text-center"
              style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--app-text2)' }}>
                {L('Mempersiapkan mission...', 'Preparing mission...')}
              </p>
              <div className="flex justify-center gap-2.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: '#4edea3' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[22px] p-4 space-y-3"
              style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)' }}
            >
              <button
                onClick={() => finishOnboarding(true)}
                className="w-full rounded-[18px] py-4 font-bold text-[15px] transition-all active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                  color: '#083626',
                  boxShadow: '0 12px 32px rgba(78,222,163,0.32)',
                }}
              >
                🎮 {L('Mulai Mission (+50 EXP)', 'Start Mission (+50 EXP)')}
              </button>
              <button
                onClick={() => finishOnboarding(false)}
                className="w-full rounded-[18px] py-3.5 text-sm font-semibold transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--app-card2)',
                  color: 'var(--app-text2)',
                  border: '1px solid var(--app-border)',
                }}
              >
                {L('Masuk tanpa mission', 'Enter without mission')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
