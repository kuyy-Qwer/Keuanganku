import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getUser, saveUser } from "../store/database";
import { useLang, t } from "../i18n";
import { getLoginLockoutRemaining, registerFailedLoginAttempt, resetLoginAttempts, validatePinStrength } from "../lib/pinSecurity";
import { createSession } from "../lib/authGuard";
import AppLogo from "../components/AppLogo";

type Screen = "pin" | "forgot_verify" | "forgot_newpin" | "forgot_success";

export default function LoginPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  // Check if user has set a PIN
  const userPin = getUser().pin;
  const hasCustomPin = userPin && userPin.trim() !== "" && userPin !== "123456";

  // If no custom PIN, redirect to app
  useEffect(() => {
    if (!hasCustomPin) {
      navigate("/app", { replace: true });
    }
  }, [hasCustomPin, navigate]);

  // ── PIN login ────────────────────────────────────────────────────
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [lockMessage, setLockMessage] = useState("");

  // ── Forgot PIN ───────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("pin");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyDob, setVerifyDob] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [newPinError, setNewPinError] = useState("");

  // If no custom PIN set, show loading while redirecting
  if (!hasCustomPin) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center px-8 select-none"
        style={{ backgroundColor: "var(--app-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <AppLogo size={72} variant="dark" />
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[26px] tracking-[-0.5px]"
            style={{ color: "var(--app-text)" }}>Keuanganku</p>
          <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
            {L("Memuat...", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  // ── Handlers: PIN login ──────────────────────────────────────────
  const handleDigit = (d: string) => {
    if (pin.length >= 6) return;
    const lockRemaining = getLoginLockoutRemaining();
    if (lockRemaining > 0) {
      setLockMessage(L(`Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(lockRemaining / 1000)} detik`, `Too many attempts. Try again in ${Math.ceil(lockRemaining / 1000)} seconds`));
      return;
    }
    const next = pin + d;
    setPin(next);
    setError(false);
    setLockMessage("");
    if (next.length === 6) {
      setTimeout(() => {
        if (next === getUser().pin) {
          resetLoginAttempts();
          createSession();
          navigate("/app");
        } else {
          const result = registerFailedLoginAttempt();
          setError(true);
          setShake(true);
          setLockMessage(result.lockedUntil
            ? L(`Akun dikunci sementara selama ${Math.ceil((result.lockedUntil - Date.now()) / 1000)} detik`, `Account temporarily locked for ${Math.ceil((result.lockedUntil - Date.now()) / 1000)} seconds`)
            : L(`PIN salah. Sisa percobaan ${result.remainingAttempts}`, `Wrong PIN. ${result.remainingAttempts} attempts remaining`));
          setTimeout(() => { setPin(""); setShake(false); }, 600);
        }
      }, 150);
    }
  };
  const handleDelete = () => setPin(p => p.slice(0, -1));

  // ── Handlers: Verifikasi identitas ──────────────────────────────
  const handleVerify = () => {
    const user = getUser();
    const emailOk = user.email && user.email.trim().toLowerCase() === verifyEmail.trim().toLowerCase();
    const dobOk   = user.dob  && user.dob.slice(0, 10) === verifyDob;

    if (!verifyEmail.trim() || !verifyDob) {
      setVerifyError(L("Isi semua kolom terlebih dahulu", "Please fill in all fields"));
      return;
    }
    if (!user.email && !user.dob) {
      setVerifyError(L("Profil belum diisi. Lengkapi email & tanggal lahir di Settings terlebih dahulu.", "Profile incomplete. Please fill in email & date of birth in Settings first."));
      return;
    }
    if (!emailOk || !dobOk) {
      setVerifyError(L("Email atau tanggal lahir tidak sesuai", "Email or date of birth does not match"));
      return;
    }
    setVerifyError("");
    setNewPin("");
    setNewPinConfirm("");
    setNewPinError("");
    setScreen("forgot_newpin");
  };

  // ── Handlers: Buat PIN baru ──────────────────────────────────────
  const handleNewPinDigit = (d: string) => {
    const isConfirmMode = newPin.length === 6;
    if (isConfirmMode) {
      if (newPinConfirm.length >= 6) return;
      setNewPinConfirm(p => p + d);
    } else {
      if (newPin.length >= 6) return;
      setNewPin(p => p + d);
    }
    setNewPinError("");
  };
  const handleNewPinDelete = () => {
    if (newPin.length === 6) setNewPinConfirm(p => p.slice(0, -1));
    else setNewPin(p => p.slice(0, -1));
    setNewPinError("");
  };
  const handleSaveNewPin = () => {
    const pinError = validatePinStrength(newPin, L);
    if (pinError) { setNewPinError(pinError); return; }
    if (newPin !== newPinConfirm) { setNewPinError(L("PIN tidak cocok", "PINs do not match")); return; }
    saveUser({ pin: newPin });
    resetLoginAttempts();
    setScreen("forgot_success");
    setTimeout(() => {
      setScreen("pin");
      setPin(""); setNewPin(""); setNewPinConfirm("");
      setVerifyEmail(""); setVerifyDob("");
    }, 2000);
  };

  // ── Screen: Sukses ───────────────────────────────────────────────
  if (screen === "forgot_success") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center px-8 select-none"
        style={{ backgroundColor: "var(--app-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="size-20 rounded-full bg-[rgba(78,222,163,0.15)] flex items-center justify-center">
            <span className="text-[40px]">✅</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px] text-center" style={{ color: "var(--app-text)" }}>
            {L("PIN Berhasil Diubah!", "PIN Changed Successfully!")}
          </p>
          <p className="font-['Inter'] text-[13px] text-center" style={{ color: "var(--app-text2)" }}>
            {L("Silakan login dengan PIN baru kamu", "Please login with your new PIN")}
          </p>
        </div>
      </div>
    );
  }

  // ── Screen: Buat PIN baru ────────────────────────────────────────
  if (screen === "forgot_newpin") {
    const isConfirmMode = newPin.length === 6;
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center px-8 select-none"
        style={{ backgroundColor: "var(--app-bg)" }}>
        <button onClick={() => setScreen("forgot_verify")}
          className="absolute top-10 left-5 p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="size-14 rounded-[18px] bg-gradient-to-br from-[#4edea3] to-[#04b4a2] flex items-center justify-center shadow-[0_8px_24px_rgba(78,222,163,0.3)]">
            <span className="text-[28px]">🔑</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px]" style={{ color: "var(--app-text)" }}>
            {L("Buat PIN Baru", "Create New PIN")}
          </p>
          <p className="font-['Inter'] text-[12px] text-center" style={{ color: "var(--app-text2)" }}>
            {isConfirmMode
              ? L("Konfirmasi PIN baru kamu", "Confirm your new PIN")
              : L("Masukkan PIN 6 digit baru", "Enter a new 6-digit PIN")}
          </p>
        </div>

        {/* Dots: PIN baru */}
        <div className="w-full max-w-[280px] mb-6 space-y-4">
          <div>
            <p className="font-['Inter'] text-[10px] uppercase tracking-widest text-center mb-2"
              style={{ color: isConfirmMode ? "var(--app-text2)" : "#4edea3" }}>
              {L("PIN Baru", "New PIN")}
            </p>
            <div className="flex gap-3 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="size-4 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: i < newPin.length ? "var(--app-pin-dot-filled)" : "var(--app-pin-dot-empty)",
                    boxShadow: i < newPin.length ? "0 0 8px rgba(78,222,163,0.5)" : "none",
                    opacity: isConfirmMode ? 0.5 : 1,
                  }} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-['Inter'] text-[10px] uppercase tracking-widest text-center mb-2"
              style={{ color: isConfirmMode ? "#4edea3" : "var(--app-text2)" }}>
              {L("Konfirmasi PIN", "Confirm PIN")}
            </p>
            <div className="flex gap-3 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="size-4 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: i < newPinConfirm.length ? (newPinError ? "var(--app-danger)" : "var(--app-pin-dot-filled)") : "var(--app-pin-dot-empty)",
                    boxShadow: i < newPinConfirm.length && !newPinError ? "0 0 8px rgba(78,222,163,0.5)" : "none",
                  }} />
              ))}
            </div>
          </div>
        </div>

        {newPinError
          ? <p className="font-['Inter'] text-[13px] mb-4 text-center" style={{ color: "var(--app-danger)" }}>{newPinError}</p>
          : <div className="mb-4 h-5" />}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-4">
          {digits.map((d, i) => {
            if (d === "") return <div key={i} />;
            return (
              <button key={i}
                onClick={() => d === "⌫" ? handleNewPinDelete() : handleNewPinDigit(d)}
                className="h-[64px] rounded-[20px] flex items-center justify-center transition-all active:scale-90"
                style={{
                  backgroundColor: d === "⌫" ? "var(--app-danger-bg)" : "var(--app-keypad-bg)",
                  border: `1px solid ${d === "⌫" ? "var(--app-danger-border)" : "var(--app-keypad-border)"}`,
                }}>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[22px]"
                  style={{ color: d === "⌫" ? "var(--app-danger)" : "var(--app-text)" }}>{d}</span>
              </button>
            );
          })}
        </div>

        {newPin.length === 6 && newPinConfirm.length === 6 && (
          <button onClick={handleSaveNewPin}
            className="w-full max-w-[280px] h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[15px] text-[#003824] transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
            {L("Simpan PIN Baru", "Save New PIN")}
          </button>
        )}
      </div>
    );
  }

  // ── Screen: Verifikasi identitas ─────────────────────────────────
  if (screen === "forgot_verify") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center px-8 select-none"
        style={{ backgroundColor: "var(--app-bg)" }}>
        <button onClick={() => { setScreen("pin"); setVerifyError(""); }}
          className="absolute top-10 left-5 p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="size-14 rounded-[18px] bg-gradient-to-br from-[#4edea3] to-[#04b4a2] flex items-center justify-center shadow-[0_8px_24px_rgba(78,222,163,0.3)]">
            <span className="text-[28px]">🔐</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px]" style={{ color: "var(--app-text)" }}>
            {L("Verifikasi Identitas", "Verify Identity")}
          </p>
          <p className="font-['Inter'] text-[13px] text-center leading-relaxed" style={{ color: "var(--app-text2)" }}>
            {L(
              "Masukkan email & tanggal lahir yang terdaftar di profilmu",
              "Enter the email & date of birth registered in your profile"
            )}
          </p>
        </div>

        <div className="w-full max-w-[320px] space-y-4">
          {/* Email */}
          <div>
            <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold mb-1.5 block"
              style={{ color: "var(--app-text2)" }}>
              {L("Email Terdaftar", "Registered Email")}
            </label>
            <input
              type="email"
              value={verifyEmail}
              onChange={e => { setVerifyEmail(e.target.value); setVerifyError(""); }}
              placeholder="contoh@email.com"
              className="w-full h-[52px] px-4 rounded-[16px] outline-none border font-['Inter'] text-[14px]"
              style={{
                backgroundColor: "var(--app-card)",
                borderColor: verifyError ? "#ffb4ab" : "var(--app-border)",
                color: "var(--app-text)",
              }}
              autoFocus
            />
          </div>

          {/* Tanggal lahir */}
          <div>
            <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold mb-1.5 block"
              style={{ color: "var(--app-text2)" }}>
              {L("Tanggal Lahir", "Date of Birth")}
            </label>
            <input
              type="date"
              value={verifyDob}
              onChange={e => { setVerifyDob(e.target.value); setVerifyError(""); }}
              className="w-full h-[52px] px-4 rounded-[16px] outline-none border font-['Inter'] text-[14px]"
              style={{
                backgroundColor: "var(--app-card)",
                borderColor: verifyError ? "#ffb4ab" : "var(--app-border)",
                color: "var(--app-text)",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Error */}
          {verifyError && (
            <div className="flex items-start gap-2 p-3 rounded-[12px] bg-[rgba(255,180,171,0.1)] border border-[rgba(255,180,171,0.25)]">
              <span className="text-[14px] shrink-0">⚠️</span>
              <p className="font-['Inter'] text-[12px] text-[#ffb4ab] leading-relaxed">{verifyError}</p>
            </div>
          )}

          {/* Tombol verifikasi */}
          <button
            onClick={handleVerify}
            disabled={!verifyEmail.trim() || !verifyDob}
            className="w-full h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[15px] text-[#003824] transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
            {L("Verifikasi", "Verify")}
          </button>

          {/* Hint */}
          <p className="font-['Inter'] text-[11px] text-center leading-relaxed" style={{ color: "var(--app-text2)" }}>
            {L(
              "Pastikan email & tanggal lahir sudah diisi di Settings → Informasi Pribadi",
              "Make sure email & date of birth are filled in Settings → Personal Info"
            )}
          </p>
        </div>
      </div>
    );
  }

  // ── Screen: PIN login (default) ──────────────────────────────────
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-8 select-none"
      style={{ backgroundColor: "var(--app-bg)" }}>
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <AppLogo size={72} variant="dark" />
        <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[26px] tracking-[-0.5px]"
          style={{ color: "var(--app-text)" }}>Keuanganku</p>
        <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
          {t("loginSubtitle", lang)}
        </p>
      </div>

      {/* PIN Dots */}
      <div className={`flex gap-4 mb-3 transition-all ${shake ? "shake-anim" : ""}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="size-4 rounded-full transition-all duration-200"
            style={{
              backgroundColor: i < pin.length ? (error ? "var(--app-danger)" : "var(--app-pin-dot-filled)") : "var(--app-pin-dot-empty)",
              boxShadow: i < pin.length && !error ? "0 0 8px rgba(78,222,163,0.5)" : "none",
            }} />
        ))}
      </div>

      {error
        ? <p className="font-['Inter'] text-[13px] mb-4" style={{ color: "var(--app-danger)" }}>{t("pinWrong", lang)}</p>
        : <div className="mb-4 h-5" />}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {digits.map((d, i) => {
          if (d === "") return <div key={i} />;
          return (
            <button key={i}
              onClick={() => d === "⌫" ? handleDelete() : handleDigit(d)}
              className="h-[64px] rounded-[20px] flex items-center justify-center transition-all active:scale-90"
              style={{
                backgroundColor: d === "⌫" ? "var(--app-danger-bg)" : "var(--app-keypad-bg)",
                border: `1px solid ${d === "⌫" ? "var(--app-danger-border)" : "var(--app-keypad-border)"}`,
              }}>
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-[22px]"
                style={{ color: d === "⌫" ? "var(--app-danger)" : "var(--app-text)" }}>{d}</span>
            </button>
          );
        })}
      </div>

      <p className="font-['Inter'] text-[11px] mt-10 text-center leading-relaxed" style={{ color: "var(--app-text2)" }}>
        {L("Gunakan PIN yang Anda buat di Settings. Setelah beberapa percobaan salah, login akan dikunci sementara.", "Use the PIN you created in Settings. After several failed attempts, login is temporarily locked.")}
      </p>

      {lockMessage ? (
        <p className="font-['Inter'] text-[12px] mt-3 text-center" style={{ color: error ? "var(--app-danger)" : "var(--app-text2)" }}>
          {lockMessage}
        </p>
      ) : null}

      {/* Lupa PIN */}
      <button
        onClick={() => { setScreen("forgot_verify"); setVerifyEmail(""); setVerifyDob(""); setVerifyError(""); }}
        className="mt-4 font-['Inter'] text-[13px] font-semibold transition-all active:scale-95"
        style={{ color: "#4edea3" }}>
        {L("Lupa PIN?", "Forgot PIN?")}
      </button>
    </div>
  );
}
