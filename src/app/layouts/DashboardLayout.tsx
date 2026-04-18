import { Outlet, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TransactionInputWithNotesGoPayInspired from "../../imports/TransactionInputWithNotesGoPayInspired/TransactionInputWithNotesGoPayInspired";
import { useLang, t, type Lang } from "../i18n";
import { getSettings, isExtremeSavingMode, getDisciplineState, isInvestFrozen } from "../store/database";
import GuidedTour from "../components/GuidedTour";
import { onboardingTourSteps } from "../config/tourSteps";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isExtended, setIsExtended] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [extremeMode, setExtremeMode] = useState(false);
  const [disciplineScore, setDisciplineScore] = useState(100);
  const [strikeCount, setStrikeCount] = useState(0);
  const [coolingOff, setCoolingOff] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    const syncDiscipline = () => {
      setExtremeMode(isExtremeSavingMode());
      const s = getDisciplineState();
      setDisciplineScore(s.financialScore);
      setStrikeCount((s.withdrawalStrikes ?? []).length);
      setCoolingOff(isInvestFrozen());
    };
    syncDiscipline();
    window.addEventListener("luminary_data_change", syncDiscipline);
    return () => window.removeEventListener("luminary_data_change", syncDiscipline);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll <= 10) {
        setIsExtended(true);
      } else if (currentScroll > lastScrollY + 5) {
        // Scrolling down
        setIsExtended(false);
      } else if (currentScroll < lastScrollY - 10) {
        // Scrolling up
        setIsExtended(true);
      }

      setLastScrollY(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Check if onboarding tutorial step is active
  useEffect(() => {
    const onboardingStep = localStorage.getItem('onboarding_step');
    const tourPending = localStorage.getItem('onboarding_tour_pending') === 'true';
    if (tourPending && onboardingStep === 'tutorial' && location.pathname === '/app') {
      // Wait for page to render, then show tour
      const timer = setTimeout(() => {
        setTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleTourComplete = () => {
    setTourOpen(false);
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_tour_pending');
  };

  const handleTourClose = () => {
    setTourOpen(false);
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_tour_pending');
  };

  const closeTransactionModal = (reason: "saved" | "dismissed" = "dismissed") => {
    setIsClosing(true);
    setTimeout(() => {
      setShowTransactionModal(false);
      setIsClosing(false);
      window.dispatchEvent(new CustomEvent("luminary_transaction_modal_closed", { detail: { reason } }));
    }, 400);
  };

  // Read lang directly from settings on every change — most reliable approach
  const [lang, setLang] = useState<Lang>(() => (getSettings().language as Lang) || "id");

  useEffect(() => {
    const update = () => setLang((getSettings().language as Lang) || "id");
    update(); // sync on mount
    window.addEventListener("luminary_data_change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("luminary_data_change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      path: "/app",
      labelKey: "home" as const,
      id: "tour-nav-home",
      icon: (active: boolean) => (
        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24">
          <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
            fill={active ? "rgba(16,185,129,0.15)" : "none"}
            stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V16H15V21" stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      path: "/app/wallet",
      labelKey: "wallet" as const,
      id: "tour-nav-wallet",
      icon: (active: boolean) => (
        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2"
            fill={active ? "rgba(16,185,129,0.15)" : "none"}
            stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" />
          <path d="M16 12H18" stroke={active ? "#10B981" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" />
          <circle cx="17" cy="12" r="1" fill={active ? "#10B981" : "#94A3B8"} />
        </svg>
      ),
    },
    {
      path: "/app/history",
      labelKey: "history" as const,
      id: "tour-nav-history",
      icon: (active: boolean) => (
        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="17" rx="2"
            fill={active ? "rgba(16,185,129,0.15)" : "none"}
            stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" />
          <path d="M3 9H21" stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 2V6M16 2V6" stroke={active ? "#10B981" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7 13H12M7 17H10" stroke={active ? "#10B981" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      path: "/app/tasks",
      labelKey: "tasks" as const,
      id: "tour-nav-tasks",
      icon: (active: boolean) => (
        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="18" rx="2"
            fill={active ? "rgba(16,185,129,0.15)" : "none"}
            stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" />
          <path d="M8 8H16M8 12H14M8 16H11" stroke={active ? "#10B981" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3" fill={active ? "#10B981" : "none"} stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" />
          <path d="M15 16L15.8 16.8L17 15.5" stroke={active ? "white" : "#64748B"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      path: "/app/account",
      labelKey: "account" as const,
      id: "tour-nav-account",
      icon: (active: boolean) => (
        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4"
            fill={active ? "rgba(16,185,129,0.15)" : "none"}
            stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" />
          <path d="M4 21C4 17.134 7.582 14 12 14C16.418 14 20 17.134 20 21"
            stroke={active ? "#10B981" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative w-full min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>

      {/* ── Discipline Master: Extreme Mode Red Overlay ── */}
      {extremeMode && (
        <div className="fixed inset-0 pointer-events-none z-[40]"
          style={{ boxShadow: "inset 0 0 80px rgba(239,68,68,0.25)", background: "radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.08) 100%)" }} />
      )}

      {/* ── Discipline Master: Score Banner (non-intrusive, top) ── */}
      {(extremeMode || coolingOff || strikeCount >= 3) && (
        <div
          className="fixed top-0 left-0 right-0 z-[45] flex items-center justify-between px-4 py-2 cursor-pointer"
          style={{ background: extremeMode ? "linear-gradient(90deg,rgba(239,68,68,0.95),rgba(185,28,28,0.95))" : coolingOff ? "linear-gradient(90deg,rgba(96,165,250,0.95),rgba(59,130,246,0.95))" : "linear-gradient(90deg,rgba(251,191,36,0.95),rgba(217,119,6,0.95))" }}
          onClick={() => navigate("/app/discipline")}>
          <div className="flex items-center gap-2">
            <span className="text-[14px]">{extremeMode ? "🔴" : coolingOff ? "🧊" : "⚡"}</span>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[11px] text-white">
              {extremeMode
                ? `MODE KRITIS — Skor ${disciplineScore}/100`
                : coolingOff
                ? `Masa jeda aktif — Penarikan dana darurat ditangguhkan`
                : `${strikeCount}/5 Pelanggaran — ${5 - strikeCount} lagi sebelum masa jeda`}
            </p>
          </div>
          <p className="font-['Inter'] text-[10px] text-white/80">Tap untuk detail →</p>
        </div>
      )}

      <div className={`relative w-full min-h-screen ${extremeMode || coolingOff || strikeCount >= 3 ? "pt-8" : ""}`}>
        <Outlet context={{ openTransactionModal: () => setShowTransactionModal(true) }} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-6 px-4">
        <div className="w-full max-w-[360px] h-[70px] backdrop-blur-[16px] px-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] border border-white/10"
          style={{ backgroundColor: "var(--app-nav-bg)" }}>
          <div className="flex items-center justify-around h-full">
            {navItems.map(item => {
              const active = isActive(item.path);
              return (
                <button key={item.path} id={item.id} onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center w-[64px] h-full outline-none group">

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="size-12 rounded-full bg-white/5 blur-md" />
                  </div>

                  {/* Docked Area (Combined Background + Icon for perfect centering) */}
                  <div id={`${item.id}-icon`} className="absolute -top-3 size-[44px] flex items-center justify-center">
                    {/* Background Circle */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_8px_20px_rgba(16,185,129,0.4)] transition-all duration-500 ${active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }} />

                    {/* Active Content Icon (White, Centered) */}
                    <div className={`relative z-20 size-10 flex items-center justify-center transition-all duration-500 brightness-100 invert ${active ? 'scale-110 translate-y-0 opacity-100' : 'scale-0 translate-y-8 opacity-0'}`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                      {item.icon(true)}
                    </div>
                  </div>

                  {/* Normal (Inactive) Icon Container */}
                  <div className={`flex items-center justify-center h-full pb-4 transition-all duration-500 ${active ? 'opacity-0 -translate-y-2' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110 translate-y-0'}`}
                    style={{ filter: "var(--nav-icon-filter, none)" }}>
                    <div className="size-10 flex items-center justify-center">
                      {item.icon(false)}
                    </div>
                  </div>

                  {/* Refined Label */}
                  <div className="absolute bottom-[10px] w-full flex justify-center">
                    <span className={`text-[8px] font-black font-['Plus_Jakarta_Sans'] tracking-[1.5px] transition-all duration-500 ${active ? 'opacity-0 translate-y-2' : 'opacity-100'}`}
                      style={{ color: "var(--app-text2)" }}>
                      {t(item.labelKey, lang).toUpperCase()}
                    </span>
                  </div>

                  {/* Indicator Dot */}
                  <div className={`absolute bottom-[6px] size-1 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981] transition-all duration-500 ${active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button — Transaksi */}
      {isActive("/app") && (
        <div id="tour-fab-transaction" className="fixed z-[60] animate-slide-up" style={{ bottom: 104, right: "calc(50% - 195px + 20px)" }}>
          <style>{`
            .fab-tx:hover { box-shadow: 0 0 0 8px rgba(78,222,163,0.18), 0 16px 36px rgba(78,222,163,0.55) !important; filter: brightness(1.08); }
            .fab-tx:hover .fab-glow { opacity: 0.5 !important; }
          `}</style>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransactionModal(true)}
              className={`fab-tx group relative flex items-center h-14 bg-gradient-to-br from-[#4edea3] to-[#00b4a2] shadow-[0_12px_30px_rgba(78,222,163,0.4)] border border-white/10 active:scale-95 transition-all duration-500 will-change-[width,border-radius,padding,transform]`}
              style={{
                width: isExtended ? '154px' : '56px',
                borderRadius: '28px',
                paddingLeft: isExtended ? '18px' : '16px',
                paddingRight: isExtended ? '18px' : '16px',
                transform: isExtended ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(8px)',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              title={lang === "en" ? "New Transaction" : "Transaksi Baru"}
            >
              <div className={`fab-glow absolute inset-0 rounded-full bg-[#4edea3] blur-xl opacity-20 transition-opacity`} />

              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003824" strokeWidth={3} className="shrink-0 relative">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" />
              </svg>

              <div className={`relative overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap ${isExtended ? 'max-w-[100px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}>
                <span className="font-['Plus_Jakarta_Sans'] font-black text-[#003824] text-[13px] tracking-wide uppercase">
                  {t("transaksi", lang) || (lang === 'en' ? 'TRANSACTION' : 'TRANSAKSI')}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Transaction Modal — via portal so it escapes overflow:hidden */}
      {showTransactionModal && (
        <div className={`fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm pb-safe p-4 ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
          onClick={() => closeTransactionModal("dismissed")}>
          <div className={`w-full max-w-[400px] rounded-[32px] overflow-hidden mb-4 shadow-2xl ${isClosing ? "animate-slide-down" : "animate-slide-up"}`}
            onClick={e => e.stopPropagation()}>
            <TransactionInputWithNotesGoPayInspired onClose={closeTransactionModal} />
          </div>
        </div>
      )}

      {/* Guided Tour for Onboarding */}
      <GuidedTour
        steps={onboardingTourSteps}
        isOpen={tourOpen}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
      />
    </div>
  );
}
