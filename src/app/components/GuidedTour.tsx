import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../i18n';

export interface TourStep {
  target: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  requireInteraction?: boolean;
  completionAction?: 'transaction-save' | 'navigation' | 'click' | 'category-select' | 'amount-filled' | 'nav-wallet' | 'nav-history' | 'nav-tasks' | 'nav-account';
  highlightPadding?: number;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
}

// Step index 2–4 = di dalam modal transaksi (tooltip compact)
const TX_STEP_RANGE = [2, 3, 4];

export default function GuidedTour({ steps, isOpen, onClose, onComplete, onStepChange }: GuidedTourProps) {
  // ── Semua hooks di atas, tidak ada early return sebelum ini ──────
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, width: 0 });
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [fading, setFading] = useState(false);
  const [waitingForModalClose, setWaitingForModalClose] = useState(false);
  const lang = useLang();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const L = (id: string, en: string) => lang === 'en' ? en : id;

  // Derived — aman karena tidak dipakai sebelum guard di bawah
  const totalSteps = steps.length;
  const safeStep = Math.min(currentStep, Math.max(0, totalSteps - 1));
  const step = steps[safeStep] ?? null;
  const isLastStep = safeStep === totalSteps - 1;
  const isFirstStep = safeStep === 0;
  const isCompact = TX_STEP_RANGE.includes(safeStep);

  // ── updateHighlight ───────────────────────────────────────────────
  const updateHighlight = useCallback((attempt = 0) => {
    const s = steps[safeStep];
    if (!s) return;
    const el = document.querySelector(s.target) as HTMLElement | null;
    if (!el) {
      if (attempt < 10) setTimeout(() => updateHighlight(attempt + 1), 200);
      return;
    }
    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);

    const pad = 16;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const tipW = isCompact ? Math.min(W - 32, 240) : Math.min(W - 32, 300);
    const tipH = isCompact ? 140 : 190;
    let top = 0, left = 0;

    // Kalau elemen ada di bagian atas layar (< 30% tinggi), paksa tooltip ke bawah
    const forceBottom = rect.top < H * 0.3;
    const effectivePos = forceBottom ? 'bottom' : (s.position ?? 'bottom');

    switch (effectivePos) {      case 'top':    top = rect.top - tipH - pad; left = rect.left + rect.width / 2 - tipW / 2; break;
      case 'bottom': top = rect.bottom + pad;     left = rect.left + rect.width / 2 - tipW / 2; break;
      case 'left':   top = rect.top + rect.height / 2 - tipH / 2; left = rect.left - tipW - pad; break;
      case 'right':  top = rect.top + rect.height / 2 - tipH / 2; left = rect.right + pad; break;
      case 'center': top = H / 2 - tipH / 2; left = W / 2 - tipW / 2; break;
    }
    left = Math.max(pad, Math.min(left, W - tipW - pad));
    top  = Math.max(pad, Math.min(top,  H - tipH - pad));
    setTooltipPos({ top, left, width: tipW });
  }, [safeStep, steps, isCompact]);

  // ── advanceStep ───────────────────────────────────────────────────
  const advanceStep = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      if (safeStep >= totalSteps - 1) {
        onComplete?.();
        onClose();
      } else {
        setCurrentStep(prev => prev + 1);
      }
      setFading(false);
    }, 250);
  }, [safeStep, totalSteps, onComplete, onClose]);

  // ── goBack ────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    if (safeStep === 0) { onClose(); return; }
    setFading(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(0, prev - 1));
      setFading(false);
    }, 200);
  }, [safeStep, onClose]);

  // ── Open/close lifecycle ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setWaitingForModalClose(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Scroll + highlight saat step berubah ─────────────────────────
  useEffect(() => {
    if (!isOpen || !step) return;
    setWaitingForModalClose(false);

    const scrollAndHighlight = (attempt = 0) => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) {
        if (attempt < 8) setTimeout(() => scrollAndHighlight(attempt + 1), 200);
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setTimeout(() => updateHighlight(), 500);
    };
    scrollAndHighlight();

    step.action?.();
    onStepChange?.(safeStep);
  }, [safeStep, isOpen]); // eslint-disable-line

  // ── Resize/scroll refresh ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const refresh = () => setTimeout(() => updateHighlight(), 100);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [isOpen, updateHighlight]);

  // ── Completion listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !step?.requireInteraction) return;

    if (step.completionAction === 'click') {
      const fn = (e: MouseEvent) => {
        const el = document.querySelector(step.target) as HTMLElement | null;
        if (el?.contains(e.target as Node)) {
          document.removeEventListener('click', fn, true);
          setTimeout(() => advanceStep(), 600);
        }
      };
      document.addEventListener('click', fn, true);
      return () => document.removeEventListener('click', fn, true);
    }

    if (step.completionAction === 'category-select') {
      let done = false;

      const fn = (e: MouseEvent) => {
        if (done) return;
        const list = document.querySelector('#tour-tx-category .absolute');
        if (!list?.contains(e.target as Node)) return;

        // Cek apakah yang diklik adalah item kategori (bukan search input)
        const clickedEl = e.target as HTMLElement;
        const isSearchInput = clickedEl.tagName === 'INPUT';
        if (isSearchInput) return; // abaikan klik di search box

        done = true;
        document.removeEventListener('click', fn, true);

        // Tunggu dropdown tertutup, lalu cek apakah ada sub-pilihan Belanja
        const waitForDropdownClose = () => {
          const stillOpen = document.querySelector('#tour-tx-category .absolute');
          if (stillOpen) {
            setTimeout(waitForDropdownClose, 120);
            return;
          }

          // Cek apakah muncul sub-pilihan Belanja (Offline/Online)
          // Jika ada, tunggu user selesai pilih sub-kategori
          const checkBelanjaSubMode = (attempt = 0) => {
            const belanjaSubPicker = document.querySelector('[data-belanja-sub]');
            const marketplacePicker = document.querySelector('[data-marketplace-picker]');
            const hasSubPicker = belanjaSubPicker || marketplacePicker;

            if (hasSubPicker) {
              // Ada sub-pilihan — tunggu user pilih salah satu
              const subFn = (ev: MouseEvent) => {
                const subEl = ev.target as HTMLElement;
                // Advance setelah user klik item di sub-picker
                if (belanjaSubPicker?.contains(subEl) || marketplacePicker?.contains(subEl)) {
                  document.removeEventListener('click', subFn, true);
                  setTimeout(() => advanceStep(), 500);
                }
              };
              document.addEventListener('click', subFn, true);
            } else if (attempt < 5) {
              // Belum muncul, cek lagi sebentar
              setTimeout(() => checkBelanjaSubMode(attempt + 1), 150);
            } else {
              // Tidak ada sub-pilihan, langsung advance
              advanceStep();
            }
          };

          setTimeout(checkBelanjaSubMode, 200);
        };

        setTimeout(waitForDropdownClose, 300);
      };

      document.addEventListener('click', fn, true);
      return () => document.removeEventListener('click', fn, true);
    }

    if (step.completionAction === 'amount-filled') {
      const inp = document.querySelector('#tour-tx-amount input') as HTMLInputElement | null;
      if (!inp) return;
      let done = false;
      let timer: ReturnType<typeof setTimeout>;
      const fn = () => {
        if (done) return;
        clearTimeout(timer);
        if (parseInt(inp.value.replace(/\D/g, '')) > 0) {
          timer = setTimeout(() => {
            if (done) return;
            done = true;
            inp.removeEventListener('input', fn);
            advanceStep();
          }, 1200);
        }
      };
      inp.addEventListener('input', fn);
      return () => { inp.removeEventListener('input', fn); clearTimeout(timer); };
    }

    if (step.completionAction === 'transaction-save') {
      const fn = (e: MouseEvent) => {
        const btn = document.querySelector('#tour-tx-save') as HTMLElement | null;
        if (btn?.contains(e.target as Node)) {
          document.removeEventListener('click', fn, true);
          setWaitingForModalClose(true);
        }
      };
      document.addEventListener('click', fn, true);
      return () => document.removeEventListener('click', fn, true);
    }

    const navMap: Record<string, { path: string; btn: string }> = {
      'nav-wallet':  { path: '/app/wallet',  btn: '#tour-nav-wallet' },
      'nav-history': { path: '/app/history', btn: '#tour-nav-history' },
      'nav-tasks':   { path: '/app/tasks',   btn: '#tour-nav-tasks' },
      'nav-account': { path: '/app/account', btn: '#tour-nav-account' },
    };
    const nav = navMap[step.completionAction ?? ''];
    if (nav) {
      const fn = (e: MouseEvent) => {
        const btn = document.querySelector(nav.btn) as HTMLElement | null;
        if (btn?.contains(e.target as Node)) {
          document.removeEventListener('click', fn, true);
          // Tunggu navigasi selesai, lalu update highlight mengikuti animasi navbar
          const p = setInterval(() => {
            if (window.location.pathname === nav.path) {
              clearInterval(p);
              // Tunggu animasi navbar selesai (icon naik + background muncul ~500ms)
              setTimeout(() => {
                updateHighlight(); // update posisi highlight ke icon yang sudah aktif
                setTimeout(() => advanceStep(), 600);
              }, 500);
            }
          }, 150);
          setTimeout(() => clearInterval(p), 3000);
        }
      };
      document.addEventListener('click', fn, true);
      return () => document.removeEventListener('click', fn, true);
    }
  }, [safeStep, isOpen, advanceStep]); // eslint-disable-line

  // ── Tunggu modal tertutup ─────────────────────────────────────────
  useEffect(() => {
    if (!waitingForModalClose) return;
    const onClosed = (e: Event) => {
      if ((e as CustomEvent).detail?.reason === 'saved') {
        setWaitingForModalClose(false);
        setTimeout(() => advanceStep(), 600);
      }
    };
    const poll = setInterval(() => {
      if (!document.querySelector('#tour-tx-save')) {
        clearInterval(poll);
        setWaitingForModalClose(false);
        setTimeout(() => advanceStep(), 400);
      }
    }, 300);
    window.addEventListener('luminary_transaction_modal_closed', onClosed);
    return () => {
      window.removeEventListener('luminary_transaction_modal_closed', onClosed);
      clearInterval(poll);
    };
  }, [waitingForModalClose, advanceStep]);

  // ── Guard — setelah semua hooks ───────────────────────────────────
  if (!isOpen || totalSteps === 0 || !step) return null;

  const pad = step.highlightPadding ?? 6;
  const hlTop  = highlightRect.top  - pad;
  const hlLeft = highlightRect.left - pad;
  const hlW    = highlightRect.width  + pad * 2;
  const hlH    = highlightRect.height + pad * 2;
  const isCatStep  = step.completionAction === 'category-select';
  const hideTooltip = waitingForModalClose;

  return createPortal(
    <>
      {/* ── Overlay + highlight ── */}
      {!isCatStep && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute bg-black/50" style={{ top: 0, left: 0, right: 0, height: Math.max(0, hlTop) }} />
          <div className="absolute bg-black/50" style={{ top: hlTop + hlH, left: 0, right: 0, bottom: 0 }} />
          <div className="absolute bg-black/50" style={{ top: hlTop, left: 0, width: Math.max(0, hlLeft), height: hlH }} />
          <div className="absolute bg-black/50" style={{ top: hlTop, left: hlLeft + hlW, right: 0, height: hlH }} />

          {/* Highlight persegi hijau */}
          <div className="absolute" style={{
            top: hlTop, left: hlLeft, width: hlW, height: hlH,
            borderRadius: step.completionAction?.startsWith('nav-') ? 20 : 14,
            border: '2.5px solid #4edea3',
            boxShadow: '0 0 0 3px rgba(78,222,163,0.18)',
            transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Corner accents */}
            {([
              { top: -3, left: -3, borderTop: '3px solid #4edea3', borderLeft: '3px solid #4edea3' },
              { top: -3, right: -3, borderTop: '3px solid #4edea3', borderRight: '3px solid #4edea3' },
              { bottom: -3, left: -3, borderBottom: '3px solid #4edea3', borderLeft: '3px solid #4edea3' },
              { bottom: -3, right: -3, borderBottom: '3px solid #4edea3', borderRight: '3px solid #4edea3' },
            ] as React.CSSProperties[]).map((s, i) => (
              <div key={i} className="absolute" style={{ ...s, width: 12, height: 12, borderRadius: 2 }} />
            ))}
            {/* Step badge */}
            <div className="absolute -top-3 -right-3 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ width: 22, height: 22, backgroundColor: '#4edea3', color: '#003824', boxShadow: '0 2px 8px rgba(78,222,163,0.5)' }}>
              {safeStep + 1}
            </div>
          </div>

          {/* Pulse ring */}
          <div className="absolute pointer-events-none" style={{
            top: hlTop - 4, left: hlLeft - 4, width: hlW + 8, height: hlH + 8,
            borderRadius: step.completionAction?.startsWith('nav-') ? 24 : 18,
            border: '1.5px solid rgba(78,222,163,0.4)',
            animation: 'tourPulse 2s ease-out infinite',
            transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
      )}

      {/* ── Tooltip ── */}
      {!hideTooltip && (
        <div ref={tooltipRef} className="fixed z-[10000] rounded-[18px] border shadow-[0_16px_48px_rgba(0,0,0,0.28)]"
          style={{
            ...(isCatStep
              ? {
                  bottom: 80,          // di atas navbar
                  left: 16,
                  right: 16,
                  top: 'auto',
                  width: 'auto',
                  maxWidth: 400,
                  margin: '0 auto',
                }
              : { top: tooltipPos.top, left: tooltipPos.left, width: tooltipPos.width }),
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(0.96) translateY(4px)' : 'scale(1) translateY(0)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            background: 'linear-gradient(160deg, #131b2e 0%, #0f1e3a 100%)',
            borderColor: 'rgba(78,222,163,0.25)',
            padding: isCompact ? '12px 14px' : '16px',
          }}
        >
          {/* Progress */}
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${((safeStep + 1) / totalSteps) * 100}%`, backgroundColor: '#4edea3', transition: 'width 0.3s ease' }} />
            </div>
            <span className="text-[10px] font-bold" style={{ color: '#4edea3' }}>{safeStep + 1}/{totalSteps}</span>
            <button onClick={onClose} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              {L('Lewati', 'Skip')}
            </button>
          </div>

          {/* Title */}
          <p className={`font-['Plus_Jakarta_Sans'] font-bold leading-tight mb-1 ${isCompact ? 'text-[13px]' : 'text-[15px]'}`}
            style={{ color: '#dae2fd' }}>
            {L(step.title, step.titleEn)}
          </p>

          {/* Content */}
          <p className={`leading-relaxed mb-2 ${isCompact ? 'text-[11px]' : 'text-[12px]'}`}
            style={{ color: '#94a3b8' }}>
            {L(step.content, step.contentEn)}
          </p>

          {/* Interaction hint */}
          {step.requireInteraction && (
            <div className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 mb-2"
              style={{ backgroundColor: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)' }}>
              <span className="text-[11px]">👆</span>
              <p className="text-[10px] font-medium" style={{ color: '#4edea3' }}>
                {step.completionAction === 'transaction-save' ? L('Tap Simpan untuk melanjutkan', 'Tap Save to continue')
                  : step.completionAction === 'category-select' ? L('Pilih kategori. Jika pilih Belanja, lanjutkan pilih tipe belanjanya dulu.', 'Select a category. If you choose Shopping, continue to select the shopping type first.')
                  : step.completionAction === 'amount-filled' ? L('Ketik nominal, berhenti sejenak untuk lanjut', 'Type amount, pause to continue')
                  : step.completionAction?.startsWith('nav-') ? L('Tap menu ini untuk melanjutkan', 'Tap this menu to continue')
                  : L('Tap area yang disorot untuk melanjutkan', 'Tap the highlighted area to continue')}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-1">
            <button onClick={goBack}
              className="rounded-[12px] py-2 px-3 text-[11px] font-semibold flex items-center gap-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {isFirstStep ? L('Keluar', 'Exit') : L('Kembali', 'Back')}
            </button>
            {!step.requireInteraction && (
              <button onClick={() => isLastStep ? (onComplete?.(), onClose()) : advanceStep()}
                className="flex-1 rounded-[12px] py-2 text-[11px] font-semibold"
                style={{ backgroundColor: '#4edea3', color: '#003824' }}>
                {isLastStep ? L('Selesai', 'Done') : L('Lanjut', 'Next')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Waiting indicator — terpisah dari tooltip */}
      {waitingForModalClose && (
        <div className="fixed z-[10000] bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-[14px] px-4 py-2.5 shadow-lg"
          style={{ background: '#131b2e', border: '1px solid rgba(96,165,250,0.3)' }}>
          {[0,1,2].map(i => (
            <div key={i} className="rounded-full" style={{ width: 5, height: 5, backgroundColor: '#60a5fa', animation: `tourDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
          <p className="text-[11px] font-medium" style={{ color: '#60a5fa' }}>
            {L('Menunggu transaksi tersimpan...', 'Saving transaction...')}
          </p>
        </div>
      )}

      <style>{`
        @keyframes tourPulse {
          0%   { opacity: 0.8; transform: scale(1); }
          70%  { opacity: 0; transform: scale(1.06); }
          100% { opacity: 0; transform: scale(1.06); }
        }
        @keyframes tourDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>,
    document.body
  );
}

// Re-export React CSSProperties type helper
import type React from 'react';
