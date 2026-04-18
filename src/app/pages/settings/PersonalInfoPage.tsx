import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { getUser, saveUser, type UserProfile } from "../../store/database";
import { useLang, t } from "../../i18n";

const AVATAR_KEY = "luminary_avatar";

function getAvatar(): string {
  return localStorage.getItem(AVATAR_KEY) || "";
}

function saveAvatar(dataUrl: string) {
  localStorage.setItem(AVATAR_KEY, dataUrl);
  window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: AVATAR_KEY } }));
}

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState(false);
  const [initialForm, setInitialForm] = useState<UserProfile>(getUser());
  const [form, setForm] = useState<UserProfile>(getUser());
  const [avatar, setAvatar] = useState(getAvatar());
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    const u = getUser();
    setForm(u);
    setInitialForm(u);
    setAvatar(getAvatar());
  }, []);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleChange = (key: keyof UserProfile, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!form.fullName.trim()) return;
    saveUser(form);
    setSaved(true);
    if (hasChanges) {
      setTimeout(() => navigate("/app/account"), 800);
    } else {
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(lang === "en" ? "Max file size is 2MB" : "Ukuran file maksimal 2MB");
      return;
    }
    setAvatarError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatar(result);
      saveAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    saveAvatar("");
    localStorage.removeItem(AVATAR_KEY);
    window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: AVATAR_KEY } }));
  };

  const initials = form.fullName
    ? form.fullName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2}
              stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>
            {t("personalInfoTitle", lang)}
          </h1>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative">
            <div className="size-[100px] rounded-full overflow-hidden border-[3px] border-[#4edea3]"
              style={{ backgroundColor: "var(--app-card2)" }}>
              {avatar ? (
                <img src={avatar} alt="avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] text-[#4edea3]">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            {/* Camera button */}
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 size-8 rounded-full bg-[#4edea3] flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#003824" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={handleAvatarChange} />

          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-full font-['Inter'] font-semibold text-[12px] text-[#4edea3] transition-all active:scale-95"
              style={{ backgroundColor: "rgba(78,222,163,0.1)", border: "1px solid rgba(78,222,163,0.2)" }}>
              {lang === "en" ? "Change Photo" : "Ganti Foto"}
            </button>
            {avatar && (
              <button onClick={handleRemoveAvatar}
                className="px-4 py-2 rounded-full font-['Inter'] font-semibold text-[12px] text-[#ffb4ab] transition-all active:scale-95"
                style={{ backgroundColor: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.2)" }}>
                {lang === "en" ? "Remove" : "Hapus"}
              </button>
            )}
          </div>

          {avatarError && (
            <p className="font-['Inter'] text-[12px] text-[#ffb4ab]">{avatarError}</p>
          )}
        </div>

        {/* Form Fields */}
        <InputField
          label={t("fullName", lang)}
          value={form.fullName}
          onChange={(v) => handleChange("fullName", v)}
          placeholder={lang === "en" ? "Enter full name" : "Masukkan nama lengkap"}
          required
        />
        <InputField
          label={t("email", lang)}
          value={form.email}
          onChange={(v) => handleChange("email", v)}
          type="email"
          placeholder={lang === "en" ? "example@email.com" : "contoh@email.com"}
        />
        <InputField
          label={t("phone", lang)}
          value={form.phone}
          onChange={(v) => handleChange("phone", v)}
          type="tel"
          placeholder="+62 8xx xxxx xxxx"
        />
        <InputField
          label={t("dob", lang)}
          value={form.dob}
          onChange={(v) => handleChange("dob", v)}
          type="date"
        />
        <InputField
          label={t("address", lang)}
          value={form.address}
          onChange={(v) => handleChange("address", v)}
          multiline
          placeholder={lang === "en" ? "Enter full address" : "Masukkan alamat lengkap"}
        />

        {/* Validation hint */}
        {!form.fullName.trim() && (
          <p className="font-['Inter'] text-[12px] text-[#ffb4ab] -mt-2">
            {lang === "en" ? "Full name is required" : "Nama lengkap wajib diisi"}
          </p>
        )}

        {/* Save Button */}
        <button onClick={handleSave}
          disabled={!form.fullName.trim()}
          className="w-full rounded-[16px] py-4 transition-all active:scale-[0.98]"
          style={{
            backgroundColor: saved ? "#059669" : form.fullName.trim() ? "#00d18b" : "var(--app-card2)",
            boxShadow: form.fullName.trim() ? "0px 12px 40px rgba(0,209,139,0.3)" : "none",
            cursor: form.fullName.trim() ? "pointer" : "not-allowed",
          }}>
          <span className="font-['Inter'] font-semibold text-[15px] tracking-[1px] uppercase"
            style={{ color: form.fullName.trim() ? "#060e20" : "var(--app-text2)" }}>
            {saved ? (lang === "en" ? "✓ Saved!" : "✓ Tersimpan!") : t("saveChanges", lang)}
          </span>
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", multiline = false, placeholder = "", required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase mb-2"
        style={{ color: "var(--app-text2)" }}>
        {label}{required && <span className="text-[#ffb4ab] ml-1">*</span>}
      </p>
      <div className="rounded-[14px] border transition-colors focus-within:border-[rgba(78,222,163,0.4)]"
        style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent px-4 py-3.5 font-['Inter'] text-[14px] resize-none outline-none min-h-[80px]"
            style={{ color: "var(--app-text)" }} />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent px-4 py-3.5 font-['Inter'] text-[14px] outline-none"
            style={{ color: "var(--app-text)" }} />
        )}
      </div>
    </div>
  );
}
