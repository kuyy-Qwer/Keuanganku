import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useLang } from '../../i18n';
import OnboardingShell from './OnboardingShell';

interface TutorialFeature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  outcome: string;
}

export default function TutorialPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;
  const [currentStep, setCurrentStep] = useState(0);

  // Scroll ke atas saat step berubah agar user melihat dari awal
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const tutorialSteps = useMemo<TutorialFeature[]>(() => [
    {
      id: 'dashboard',
      eyebrow: L('Mulai dari ringkasan', 'Start from the summary'),
      title: L('Dashboard', 'Dashboard'),
      description: L('Halaman utama merangkum saldo aktif, arus masuk, arus keluar, dan akses cepat ke fitur inti tanpa harus lompat-lompat menu.', 'The home screen summarizes active balance, inflow, outflow, and quick access to core features without menu hopping.'),
      bullets: [
        L('Cocok untuk cek kondisi harian dalam beberapa detik.', 'Great for checking your daily financial state in a few seconds.'),
        L('Ringkasan ini jadi titik awal sebelum Anda catat transaksi atau buka insight.', 'This summary becomes the starting point before you log transactions or open insights.'),
      ],
      outcome: L('Manfaat utamanya: Anda tahu posisi keuangan hari ini lebih cepat.', "Main benefit: you know today's financial position faster."),
    },
    {
      id: 'transaction',
      eyebrow: L('Pusat aktivitas', 'Action center'),
      title: L('Transaksi', 'Transaction'),
      description: L('Tombol transaksi cepat dirancang supaya pemasukan dan pengeluaran bisa dicatat saat itu juga. Prosesnya 3 langkah: pilih kategori → isi nominal → simpan.', 'The quick transaction button is designed so income and expenses can be recorded immediately. The process is 3 steps: choose category → enter amount → save.'),
      bullets: [
        L('① Pilih kategori yang sesuai (Makanan, Transport, Gaji, dll) agar laporan lebih akurat.', '① Choose the right category (Food, Transport, Salary, etc.) for more accurate reports.'),
        L('② Isi nominal transaksi — bisa pakai kalkulator bawaan untuk hitung dulu.', '② Enter the transaction amount — use the built-in calculator to calculate first if needed.'),
        L('③ Tap Simpan. Data langsung masuk ke dashboard, history, dan insight.', '③ Tap Save. Data goes straight to your dashboard, history, and insights.'),
      ],
      outcome: L('Manfaat utamanya: kebiasaan mencatat jadi ringan dan konsisten karena prosesnya cepat.', 'Main benefit: tracking becomes lighter and more consistent because the process is fast.'),
    },
    {
      id: 'wallet',
      eyebrow: L('Sumber dana', 'Money sources'),
      title: L('Wallet', 'Wallet'),
      description: L('Di Wallet Anda bisa lihat uang tunai, rekening bank, dan simulasi perpindahan dana supaya arus uang terasa lebih nyata.', 'In Wallet you can see cash, bank accounts, and simulated money movement so your cash flow feels more tangible.'),
      bullets: [
        L('Bagus untuk tahu uang Anda sedang tersimpan di mana.', 'Useful for knowing where your money is currently stored.'),
        L('Membantu saat Anda ingin bedakan uang belanja harian, tabungan, atau rekening utama.', 'Helpful when you want to separate daily spending money, savings, or your main account.'),
      ],
      outcome: L('Manfaat utamanya: struktur uang Anda lebih rapi sejak awal.', 'Main benefit: your money structure feels cleaner from the beginning.'),
    },
    {
      id: 'history',
      eyebrow: L('Jejak keputusan', 'Decision trail'),
      title: L('History', 'History'),
      description: L('Riwayat transaksi membantu Anda melacak kapan uang keluar, untuk apa, dan kategori mana yang paling sering aktif.', 'Transaction history helps you track when money moved, why, and which categories are most active.'),
      bullets: [
        L('Filter memudahkan evaluasi mingguan atau bulanan.', 'Filters make weekly or monthly reviews easier.'),
        L('Sangat membantu saat Anda ingin mencari kebocoran kecil yang sering tidak terasa.', 'Very helpful when you want to spot small leaks that usually go unnoticed.'),
      ],
      outcome: L('Manfaat utamanya: evaluasi jadi berbasis data, bukan perasaan.', 'Main benefit: reviews become data-based, not just gut feeling.'),
    },
    {
      id: 'growth',
      eyebrow: L('Tumbuh lebih sadar', 'Grow with more awareness'),
      title: L('Insights, Savings & Tasks', 'Insights, Savings & Tasks'),
      description: L('Setelah data mulai masuk, Insights membantu membaca pola, Savings menjaga target tetap terlihat, dan Tasks membantu aksi kecil tetap berjalan.', 'Once data starts flowing in, Insights helps read patterns, Savings keeps goals visible, and Tasks keeps small actions moving.'),
      bullets: [
        L('Insights membantu melihat kebiasaan, bukan cuma angka.', 'Insights helps you see habits, not just numbers.'),
        L('Savings dan Tasks menjaga tujuan tetap konkret dan bisa ditindaklanjuti.', 'Savings and Tasks keep goals concrete and actionable.'),
      ],
      outcome: L('Manfaat utamanya: aplikasi tidak cuma mencatat, tapi ikut membantu perubahan kebiasaan.', 'Main benefit: the app does more than log data, it supports habit change.'),
    },
  ], [lang]);

  const isLastStep = currentStep === tutorialSteps.length - 1;

  const goToStep = (index: number) => {
    if (index < 0 || index >= tutorialSteps.length) return;
    setCurrentStep(index);
  };

  const finishOnboarding = (startTour: boolean) => {
    if (startTour) {
      // Give EXP reward for completing tutorial mission
      const currentExp = parseInt(localStorage.getItem('user_exp') || '0');
      localStorage.setItem('user_exp', (currentExp + 50).toString());
      localStorage.setItem('onboarding_tour_pending', 'true');
      localStorage.setItem('mission_completed', 'true');
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/app');
      return;
    }
    // Still give some EXP for completing onboarding
    const currentExp = parseInt(localStorage.getItem('user_exp') || '0');
    localStorage.setItem('user_exp', (currentExp + 25).toString());
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_tour_pending');
    navigate('/app');
  };

  const stepColors = ['#4edea3', '#60a5fa', '#fbbf24'];

  return (
    <OnboardingShell
      title={L('Interactive Mission', 'Interactive Mission')}
      subtitle={L('Selesaikan tur singkat 30 detik untuk mendapatkan +50 EXP pertama kamu!', 'Complete a short 30-second tour to earn your first +50 EXP!')}
      step={4}
      totalSteps={4}
      onBack={() => {
        if (currentStep > 0) {
          goToStep(currentStep - 1);
        } else {
          navigate('/onboarding/profile');
        }
      }}
      onSkip={() => finishOnboarding(false)}
      skipLabel={L('Lewati & Masuk', 'Skip & Enter')}
      footer={(
        <div className="space-y-3">
          {isLastStep ? (
            <>
              <button
                onClick={() => finishOnboarding(true)}
                className="w-full rounded-[24px] py-4 font-semibold text-[#083626] shadow-[0_18px_40px_rgba(78,222,163,0.28)] transition-all"
                style={{ backgroundColor: '#4edea3' }}
              >
                {L('🎮 Mulai Mission (+50 EXP)', '🎮 Start Mission (+50 EXP)')}
              </button>
              <button
                onClick={() => finishOnboarding(false)}
                className="w-full rounded-[24px] py-3 text-sm font-semibold transition-all"
                style={{ backgroundColor: 'var(--app-card)', color: 'var(--app-text)', border: '1px solid var(--app-border)' }}
              >
                {L('Masuk tanpa mission', 'Enter without mission')}
              </button>
            </>
          ) : (
            <button
              onClick={() => goToStep(currentStep + 1)}
              className="w-full rounded-[24px] py-4 font-semibold text-[#083626] shadow-[0_18px_40px_rgba(78,222,163,0.28)] transition-all"
              style={{ backgroundColor: '#4edea3' }}
            >
              {L('Lanjutkan Mission', 'Continue Mission')}
            </button>
          )}
          {currentStep > 0 && (
            <button
              onClick={() => goToStep(currentStep - 1)}
              className="w-full rounded-[24px] py-3 text-sm font-semibold transition-all"
              style={{ backgroundColor: 'var(--app-card)', color: 'var(--app-text)', border: '1px solid var(--app-border)' }}
            >
              {L('Kembali', 'Go back')}
            </button>
          )}
        </div>
      )}
    >
      <div className="pb-2">
        {/* Satu card terpadu — daftar + detail inline */}
        <div className="rounded-[28px] border overflow-hidden" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>

          {/* Header card */}
          <div className="px-5 pt-5 pb-3">
            <p className="text-sm font-bold" style={{ color: 'var(--app-text)' }}>
              {L('Urutan panduan fitur', 'Feature guide flow')}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
              {L('Tap fitur untuk melihat penjelasan lengkap di bawahnya.', 'Tap a feature to see its full explanation below.')}
            </p>
          </div>

          {/* Daftar + detail accordion */}
          <div className="px-3 pb-3 space-y-1">
            {tutorialSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isDone = index < currentStep;
              const isTransaction = step.id === 'transaction';

              return (
                <div key={step.id}>
                  {/* Row item */}
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className="flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition-all"
                    style={{
                      backgroundColor: isActive ? 'rgba(78,222,163,0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(78,222,163,0.28)' : '1px solid transparent',
                    }}
                  >
                    {/* Nomor + garis vertikal */}
                    <div className="flex flex-col items-center self-stretch">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{
                          backgroundColor: isActive ? '#4edea3' : isDone ? 'rgba(78,222,163,0.25)' : 'rgba(78,222,163,0.1)',
                          color: isActive ? '#083626' : '#169b6d',
                        }}
                      >
                        {isDone ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </span>
                    </div>

                    {/* Teks */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--app-text)' }}>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--app-text2)' }}>
                        {step.eyebrow}
                      </p>
                    </div>

                    {/* Chevron */}
                    <svg
                      className="w-4 h-4 shrink-0 transition-transform duration-200"
                      style={{
                        color: isActive ? '#4edea3' : 'var(--app-text2)',
                        transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Detail expand — langsung di bawah item */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key={`detail-${step.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="mx-1 mb-2 rounded-[18px] p-4 space-y-3"
                          style={{ background: 'linear-gradient(145deg, rgba(78,222,163,0.08) 0%, rgba(18,185,129,0.03) 100%)', border: '1px solid rgba(78,222,163,0.18)' }}>

                          {/* Eyebrow + deskripsi */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: '#169b6d' }}>
                              {step.eyebrow}
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                              {step.description}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="h-px" style={{ backgroundColor: 'rgba(78,222,163,0.15)' }} />

                          {/* Label "Apa yang bisa dilakukan" */}
                          <p className="text-xs font-semibold" style={{ color: 'var(--app-text)' }}>
                            {L('Apa yang bisa Anda lakukan', 'What you can do')}
                          </p>

                          {/* Bullets */}
                          <div className="space-y-2">
                            {step.bullets.map((bullet, bi) => (
                              <div
                                key={bi}
                                className="flex items-start gap-2.5 rounded-[14px] p-3"
                                style={{
                                  backgroundColor: isTransaction
                                    ? `${stepColors[bi] ?? '#4edea3'}12`
                                    : 'var(--app-card2)',
                                  border: isTransaction
                                    ? `1px solid ${stepColors[bi] ?? '#4edea3'}28`
                                    : 'none',
                                }}
                              >
                                {isTransaction ? (
                                  <span
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5"
                                    style={{ backgroundColor: stepColors[bi] ?? '#4edea3', color: '#003824' }}
                                  >
                                    {bi + 1}
                                  </span>
                                ) : (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: '#4edea3' }} />
                                )}
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                                  {bullet}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Tip khusus transaksi */}
                          {isTransaction && (
                            <div className="flex items-start gap-2 rounded-[12px] p-2.5"
                              style={{ backgroundColor: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.2)' }}>
                              <span className="text-[13px] shrink-0">💡</span>
                              <p className="text-[11px] leading-relaxed" style={{ color: '#4edea3' }}>
                                {L('Saat tur interaktif, kamu akan dipandu langkah demi langkah di dalam form transaksi nyata.', 'During the interactive tour, you will be guided step by step inside the real transaction form.')}
                              </p>
                            </div>
                          )}

                          {/* Divider */}
                          <div className="h-px" style={{ backgroundColor: 'rgba(78,222,163,0.15)' }} />

                          {/* Outcome / kenapa penting */}
                          <div className="flex items-start gap-2">
                            <span className="text-[13px] shrink-0 mt-0.5">✨</span>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                              {step.outcome}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Garis penghubung antar item (kecuali item terakhir) */}
                  {index < tutorialSteps.length - 1 && !isActive && index + 1 !== currentStep && (
                    <div className="ml-[22px] h-3 w-[2px] rounded-full mx-auto"
                      style={{ backgroundColor: isDone ? 'rgba(78,222,163,0.3)' : 'rgba(148,163,184,0.15)', marginLeft: '22px' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* EXP Reward Banner */}
          <div className="mx-3 mb-3 rounded-[18px] p-4 text-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(78,222,163,0.12), rgba(251,191,36,0.08))',
              border: '1px solid rgba(78,222,163,0.2)' 
            }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                ⭐
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold" style={{ color: 'var(--app-text)' }}>
                  {L('Reward Menunggu!', 'Reward Awaits!')}
                </p>
                <p className="text-xs" style={{ color: 'var(--app-text2)' }}>
                  {L('Selesaikan mission untuk dapatkan EXP', 'Complete mission to earn EXP')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[12px] p-2" style={{ backgroundColor: 'rgba(78,222,163,0.1)' }}>
                <p className="text-xs font-bold text-green-600">+50 EXP</p>
                <p className="text-[10px]" style={{ color: 'var(--app-text2)' }}>{L('Selesai Mission', 'Complete Mission')}</p>
              </div>
              <div className="rounded-[12px] p-2" style={{ backgroundColor: 'rgba(78,222,163,0.1)' }}>
                <p className="text-xs font-bold text-green-600">Level Up</p>
                <p className="text-[10px]" style={{ color: 'var(--app-text2)' }}>{L('Pemula → Aktif', 'Beginner → Active')}</p>
              </div>
              <div className="rounded-[12px] p-2" style={{ backgroundColor: 'rgba(78,222,163,0.1)' }}>
                <p className="text-xs font-bold text-green-600">30 detik</p>
                <p className="text-[10px]" style={{ color: 'var(--app-text2)' }}>{L('Waktu mission', 'Mission time')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
