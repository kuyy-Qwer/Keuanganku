import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getUser, saveUser } from "../../store/database";
import { useLang } from "../../i18n";
import { resetLoginAttempts, validatePinStrength } from "../../lib/pinSecurity";
export default function ChangePinPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [storedPin, setStoredPin] = useState("");
  const [hasExistingPin, setHasExistingPin] = useState(false);

  useEffect(() => {
    const pin = getUser().pin;
    setStoredPin(pin || "");
    // Check if user has a custom PIN (not empty or default "123456")
    setHasExistingPin(!!(pin && pin.trim() !== "" && pin !== "123456"));
  }, []);

  const handleSubmit = () => {
    // If user has existing PIN, validate current PIN
    if (hasExistingPin && currentPin !== storedPin) {
      setStatus("error");
      setErrorMsg(L("PIN saat ini salah", "Current PIN is incorrect"));
      return;
    }
    
    const pinError = validatePinStrength(newPin, L);
    if (pinError) {
      setStatus("error");
      setErrorMsg(pinError);
      return;
    }
    if (newPin !== confirmPin) {
      setStatus("error");
      setErrorMsg(L("Konfirmasi PIN tidak cocok", "PIN confirmation doesn't match"));
      return;
    }
    saveUser({ pin: newPin });
    resetLoginAttempts();
    setStoredPin(newPin);
    setHasExistingPin(true);
    setStatus("success");
    setErrorMsg("");
    setTimeout(() => {
      setStatus("idle");
      setCurrentPin(""); setNewPin(""); setConfirmPin("");
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>
            {hasExistingPin ? L("Ubah PIN", "Change PIN") : L("Buat PIN", "Create PIN")}
          </h1>
        </div>

        <div className="rounded-[16px] p-4 flex gap-3"
          style={{ backgroundColor: "rgba(78,222,163,0.06)", border: "1px solid rgba(78,222,163,0.15)" }}>
          <span className="text-[20px]">🔒</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed"
            style={{ color: "var(--app-text2)" }}>
            {hasExistingPin
              ? L("Gunakan PIN 6 digit yang tidak berurutan dan tidak berulang agar akun lebih aman.", "Use a 6-digit PIN that is not sequential or repetitive to keep the account safer.")
              : L("Buat PIN 6 digit untuk mengamankan aplikasi. PIN akan diminta saat membuka aplikasi.", "Create a 6-digit PIN to secure the app. PIN will be required when opening the app.")}
          </p>
        </div>

        {status === "error" && (
          <div className="rounded-[12px] p-3"
            style={{ backgroundColor: "var(--app-danger-bg)", border: "1px solid var(--app-danger-border)" }}>
            <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-danger)" }}>⚠️ {errorMsg}</p>
          </div>
        )}
        {status === "success" && (
          <div className="rounded-[12px] p-3"
            style={{ backgroundColor: "rgba(78,222,163,0.1)", border: "1px solid rgba(78,222,163,0.2)" }}>
            <p className="font-['Inter'] text-[13px] text-[#4edea3]">
              ✓ {hasExistingPin 
                ? L("PIN berhasil diubah!", "PIN changed successfully!")
                : L("PIN berhasil dibuat!", "PIN created successfully!")}
            </p>
          </div>
        )}

        {hasExistingPin && <PinInput label={L("PIN SAAT INI", "CURRENT PIN")} value={currentPin} onChange={setCurrentPin} />}
        <PinInput label={L("PIN BARU", "NEW PIN")} value={newPin} onChange={setNewPin} />
        <PinInput label={L("KONFIRMASI PIN BARU", "CONFIRM NEW PIN")} value={confirmPin} onChange={setConfirmPin} />

        <button onClick={handleSubmit}
          className="w-full rounded-[16px] py-4 shadow-[0px_12px_40px_rgba(0,209,139,0.3)] active:scale-[0.98] transition-all mt-4"
          style={{ backgroundColor: "#00d18b" }}>
          <span className="font-['Inter'] font-semibold text-[15px] text-[#060e20] tracking-[1px] uppercase">
            {hasExistingPin ? L("Update PIN", "Update PIN") : L("Buat PIN", "Create PIN")}
          </span>
        </button>
      </div>
    </div>
  );
}

function PinInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase mb-2"
        style={{ color: "var(--app-text2)" }}>{label}</p>
      <div className="rounded-[14px] border focus-within:border-[rgba(78,222,163,0.4)] transition-colors"
        style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
        <input type="password" maxLength={6} value={value}
          onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className="w-full bg-transparent px-4 py-3.5 font-['Inter'] text-[20px] tracking-[8px] outline-none text-center"
          style={{ color: "var(--app-text)" }} />
      </div>
    </div>
  );
}
