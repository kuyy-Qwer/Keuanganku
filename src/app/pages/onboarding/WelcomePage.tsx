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
          className={`w-full rounded-2xl py-4 font-bold text-base transition-all ${hasScrolledToBottom ? 'btn-green green-shadow' : 'cursor-not-allowed'}`}
          style={{ 
            backgroundColor: hasScrolledToBottom ? '' : 'var(--app-card2)', 
            color: hasScrolledToBottom ? 'white' : 'var(--app-text2)'
          }}
        >
          {L('Saya setuju dan lanjut', 'I agree and continue')}
        </button>
      )}
    >
      <div className="space-y-5">
        {/* App Introduction Card */}
        <div className="green-gradient-card rounded-2xl p-5 green-border">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl bg-white/50">
              💰
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-green-600">
                Keuanganku
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {L('Pendamping untuk mencatat, memahami, dan menjaga ritme keuangan pribadi Anda.', 'A companion for recording, understanding, and maintaining your personal finance rhythm.')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {featureHighlights.map((item, index) => (
              <div key={item.title} className="rounded-xl border p-4" style={{ 
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(78,222,163,0.2)'
              }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-700">{item.title}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--app-text2)' }}>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms Card */}
        <div className="card-green rounded-2xl p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-green-600">
                {L('Ringkasan persetujuan', 'Consent summary')}
              </h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {L('Baca sampai bawah untuk membuka tombol lanjut.', 'Read to the bottom to unlock the continue button.')}
              </p>
            </div>
            {!hasScrolledToBottom ? (
              <span className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-700">
                {L('Baca dulu', 'Read first')}
              </span>
            ) : (
              <span className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-green-500 text-white">
                {L('Siap', 'Ready')}
              </span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="max-h-[280px] space-y-3 overflow-y-auto pr-1"
          >
            {termsContent.map((term, index) => (
              <div key={term.title} className="rounded-xl p-4" style={{ 
                backgroundColor: 'var(--app-card2)',
                border: '1px solid rgba(78,222,163,0.1)'
              }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-700 mb-1">
                      {term.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                      {term.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasScrolledToBottom ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-medium bg-green-50 text-green-700">
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
