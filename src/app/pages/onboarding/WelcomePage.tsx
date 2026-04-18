import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLang } from '../../i18n';
import OnboardingShell from './OnboardingShell';

export default function WelcomePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      setHasScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 12);
    };

    element.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNext = () => {
    localStorage.setItem('onboarding_terms_accepted', 'true');
    localStorage.setItem('onboarding_step', 'profile');
    navigate('/onboarding/profile');
  };

  const featureHighlights = [
    {
      title: L('Pantau kondisi keuangan', 'Track your financial health'),
      description: L('Lihat saldo, arus uang, dan progres tabungan dari satu dashboard.', 'See balances, cash flow, and savings progress from one dashboard.'),
    },
    {
      title: L('Catat transaksi lebih rapi', 'Log transactions more cleanly'),
      description: L('Pemasukan dan pengeluaran tersusun per kategori supaya analisisnya lebih jelas.', 'Income and expenses stay organized by category so analysis is clearer.'),
    },
    {
      title: L('Siapkan target finansial', 'Set financial goals'),
      description: L('Gunakan task, savings, dan insight untuk bantu keputusan harian Anda.', 'Use tasks, savings, and insights to support your daily money decisions.'),
    },
  ];

  const termsContent = [
    {
      title: L('Data dipakai untuk personalisasi', 'Data is used for personalization'),
      content: L('Informasi yang Anda masukkan dipakai untuk menampilkan ringkasan, insight, dan pengingat yang relevan.', 'The information you enter is used to show relevant summaries, insights, and reminders.'),
    },
    {
      title: L('Privasi tetap milik Anda', 'Your privacy stays yours'),
      content: L('Data keuangan disimpan di perangkat Anda dan tidak dijual untuk kepentingan komersial.', 'Financial data stays on your device and is not sold for commercial use.'),
    },
    {
      title: L('Aplikasi membantu, bukan menggantikan keputusan', 'The app supports, not replaces decisions'),
      content: L('Luminary Finance membantu pencatatan dan analisis, tetapi keputusan finansial tetap ada di tangan Anda.', 'Luminary Finance helps with tracking and analysis, but financial decisions remain yours.'),
    },
    {
      title: L('Gunakan dengan wajar dan aman', 'Use it fairly and safely'),
      content: L('Jangan gunakan aplikasi untuk aktivitas ilegal, penipuan, atau penyalahgunaan data.', 'Do not use the app for illegal activity, fraud, or data misuse.'),
    },
  ];

  return (
    <OnboardingShell
      title={L('Selamat datang', 'Welcome')}
      subtitle={L('Kita mulai dengan gambaran singkat aplikasi dan persetujuan dasar sebelum profil Anda dibuat.', 'Let us start with a quick app overview and the core terms before your profile is created.')}
      step={1}
      totalSteps={4}
      footer={(
        <button
          onClick={handleNext}
          disabled={!hasScrolledToBottom}
          className={`w-full rounded-[24px] py-4 font-semibold transition-all ${hasScrolledToBottom ? 'text-white shadow-[0_18px_40px_rgba(78,222,163,0.28)]' : 'cursor-not-allowed'}`}
          style={{ backgroundColor: hasScrolledToBottom ? '#4edea3' : 'var(--app-card2)', color: hasScrolledToBottom ? '#083626' : 'var(--app-text2)' }}
        >
          {L('Saya setuju dan lanjut', 'I agree and continue')}
        </button>
      )}
    >
      <div className="space-y-4">
        <div className="rounded-[28px] border p-5" style={{ background: 'linear-gradient(135deg, rgba(78,222,163,0.18) 0%, rgba(18,185,129,0.04) 100%)', borderColor: 'rgba(78,222,163,0.26)' }}>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] text-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
              {'</>'}
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold" style={{ color: 'var(--app-text)' }}>
                Luminary Finance
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {L('Pendamping untuk mencatat, memahami, dan menjaga ritme keuangan pribadi Anda.', 'A companion for recording, understanding, and maintaining your personal finance rhythm.')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {featureHighlights.map((item) => (
              <div key={item.title} className="rounded-[22px] border p-4" style={{ backgroundColor: 'rgba(255,255,255,0.42)', borderColor: 'rgba(255,255,255,0.28)' }}>
                <p className="mb-1 text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{item.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border p-5" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold" style={{ color: 'var(--app-text)' }}>
                {L('Ringkasan persetujuan', 'Consent summary')}
              </h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {L('Baca sampai bawah untuk membuka tombol lanjut.', 'Read to the bottom to unlock the continue button.')}
              </p>
            </div>
            {!hasScrolledToBottom ? (
              <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ backgroundColor: 'rgba(78,222,163,0.12)', color: '#1a9f71' }}>
                {L('Baca dulu', 'Read first')}
              </span>
            ) : (
              <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ backgroundColor: 'rgba(78,222,163,0.18)', color: '#1a9f71' }}>
                {L('Siap', 'Ready')}
              </span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="max-h-[320px] space-y-3 overflow-y-auto pr-1"
          >
            {termsContent.map((term, index) => (
              <div key={term.title} className="rounded-[22px] p-4" style={{ backgroundColor: 'var(--app-card2)' }}>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                  {index + 1}. {term.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                  {term.content}
                </p>
              </div>
            ))}
          </div>

          {!hasScrolledToBottom ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-medium" style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text2)' }}>
              <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
              </svg>
              {L('Scroll sampai akhir untuk melanjutkan', 'Scroll to the end to continue')}
            </div>
          ) : null}
        </div>
      </div>
    </OnboardingShell>
  );
}
