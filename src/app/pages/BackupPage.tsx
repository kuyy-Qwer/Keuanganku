import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  exportAllData, importAllData, getUser,
  generateBackupFilename, getBackupSettings, saveBackupSettings, shouldAutoBackupToday,
} from "../store/database";
import { useLang } from "../i18n";

export default function BackupPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<"idle" | "confirm" | "success" | "error">("idle");
  const [importError, setImportError] = useState("");
  const [pendingJson, setPendingJson] = useState<string | null>(null);
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [exportDone, setExportDone] = useState(false);

  // Backup schedule state
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoDay, setAutoDay] = useState(0); // 0 = akhir bulan
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [customDayInput, setCustomDayInput] = useState(""); // input tanggal kustom

  useEffect(() => {
    const s = getBackupSettings();
    setAutoEnabled(s.autoBackupEnabled);
    setAutoDay(s.autoBackupDay);
    setLastBackup(s.lastAutoBackup);
    setCustomDayInput(s.autoBackupDay === 0 ? "" : String(s.autoBackupDay));
  }, []);

  // Cek auto-backup saat halaman dibuka
  useEffect(() => {
    if (shouldAutoBackupToday()) {
      triggerAutoBackup();
    }
  }, []);

  const triggerAutoBackup = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateBackupFilename();
    a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    saveBackupSettings({ lastAutoBackup: now });
    setLastBackup(now);
  };

  // ── Export manual ─────────────────────────────────────────────────
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateBackupFilename();
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    // Catat sebagai backup terakhir
    const now = new Date().toISOString();
    saveBackupSettings({ lastAutoBackup: now });
    setLastBackup(now);
    setTimeout(() => setExportDone(false), 3000);
  };

  // ── Simpan pengaturan jadwal ──────────────────────────────────────
  const handleSaveSchedule = () => {
    const day = customDayInput === "" ? 0 : Math.min(28, Math.max(1, parseInt(customDayInput) || 0));
    setAutoDay(day);
    saveBackupSettings({ autoBackupEnabled: autoEnabled, autoBackupDay: day });
  };

  // ── Import — step 1: read file ────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      setImportStatus("error");
      setImportError(L("File harus berformat .json", "File must be in .json format"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const result = importAllData(content);
      if (!result.success) {
        setImportStatus("error");
        setImportError(result.error ?? L("File tidak valid", "Invalid file"));
        return;
      }
      setPendingJson(content);
      setConfirmPin("");
      setPinError("");
      setImportStatus("confirm");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Import — step 2: confirm with PIN ────────────────────────────
  const handleConfirmImport = () => {
    if (!pendingJson) return;
    const user = getUser();
    if (confirmPin !== user.pin) {
      setPinError(L("PIN salah. Coba lagi.", "Wrong PIN. Try again."));
      setConfirmPin("");
      return;
    }
    const result = importAllData(pendingJson);
    if (result.success) {
      setImportStatus("success");
      setPendingJson(null);
      setTimeout(() => navigate("/app"), 2000);
    } else {
      setImportStatus("error");
      setImportError(result.error ?? L("Gagal memuat data", "Failed to load data"));
    }
  };

  // Format tanggal terakhir backup
  const formatLastBackup = (iso: string | null) => {
    if (!iso) return L("Belum pernah", "Never");
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  // Label hari backup
  const dayLabel = autoDay === 0
    ? L("Akhir bulan (default)", "End of month (default)")
    : L(`Tanggal ${autoDay} setiap bulan`, `Day ${autoDay} of every month`);

  // Nama file preview
  const user = getUser();
  const previewName = generateBackupFilename();

  return (
    <div className="w-full min-h-screen flex justify-center pb-32 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full"
            style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
              💾 {L("Backup & Restore", "Backup & Restore")}
            </h1>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {L("Cadangkan atau pulihkan data keuanganmu", "Back up or restore your financial data")}
            </p>
          </div>
        </div>

        {/* Nama file preview */}
        <div className="rounded-[16px] px-4 py-3 border"
          style={{ backgroundColor: "rgba(78,222,163,0.06)", borderColor: "rgba(78,222,163,0.2)" }}>
          <p className="font-['Inter'] text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#4edea3" }}>
            {L("Nama file backup", "Backup filename")}
          </p>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] break-all" style={{ color: "var(--app-text)" }}>
            {previewName}
          </p>
        </div>

        {/* ── Jadwal Backup Otomatis ── */}
        <div className="rounded-[24px] p-5 border space-y-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[12px] flex items-center justify-center"
                style={{ backgroundColor: "rgba(251,191,36,0.15)" }}>
                <span className="text-[20px]">⏰</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                  {L("Backup Otomatis", "Auto Backup")}
                </p>
                <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                  {autoEnabled ? dayLabel : L("Nonaktif", "Disabled")}
                </p>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => {
                const next = !autoEnabled;
                setAutoEnabled(next);
                saveBackupSettings({ autoBackupEnabled: next, autoBackupDay: autoDay });
              }}
              className="w-[48px] h-[26px] rounded-full transition-all duration-200 relative shrink-0"
              style={{ backgroundColor: autoEnabled ? "#4edea3" : "var(--app-card2)" }}>
              <div className="size-[18px] rounded-full absolute top-1 transition-all duration-200"
                style={{
                  backgroundColor: autoEnabled ? "#003824" : "#64748b",
                  left: autoEnabled ? "26px" : "4px",
                }} />
            </button>
          </div>

          {/* Pilih tanggal */}
          {autoEnabled && (
            <div className="space-y-3 pt-1 border-t" style={{ borderColor: "var(--app-border)" }}>
              <p className="font-['Inter'] text-[11px] font-semibold uppercase tracking-wider pt-2"
                style={{ color: "var(--app-text2)" }}>
                {L("Tanggal backup setiap bulan", "Backup date each month")}
              </p>

              {/* Quick options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: L("Akhir bulan", "End of month"), value: 0 },
                  { label: L("Tgl 1", "1st"), value: 1 },
                  { label: L("Tgl 15", "15th"), value: 15 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setAutoDay(opt.value);
                      setCustomDayInput(opt.value === 0 ? "" : String(opt.value));
                      saveBackupSettings({ autoBackupEnabled: true, autoBackupDay: opt.value });
                    }}
                    className="rounded-[12px] py-2.5 text-[11px] font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: autoDay === opt.value ? "rgba(78,222,163,0.15)" : "var(--app-card2)",
                      color: autoDay === opt.value ? "#4edea3" : "var(--app-text2)",
                      border: `1px solid ${autoDay === opt.value ? "rgba(78,222,163,0.3)" : "var(--app-border)"}`,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Input tanggal kustom */}
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-[14px] border flex items-center px-4 gap-2"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--app-text2)" }}>
                    {L("Tgl", "Day")}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={customDayInput}
                    onChange={e => setCustomDayInput(e.target.value)}
                    placeholder="1–28"
                    className="flex-1 bg-transparent py-3 text-[14px] font-bold outline-none"
                    style={{ color: "var(--app-text)" }}
                  />
                </div>
                <button
                  onClick={handleSaveSchedule}
                  className="rounded-[14px] px-4 py-3 font-bold text-[12px] transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)", color: "#003824" }}>
                  {L("Simpan", "Save")}
                </button>
              </div>

              <p className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                💡 {L(
                  "Masukkan tanggal 1–28. Kosongkan untuk akhir bulan. Backup akan otomatis diunduh saat kamu membuka halaman ini pada tanggal tersebut.",
                  "Enter day 1–28. Leave empty for end of month. Backup will auto-download when you open this page on that date."
                )}
              </p>
            </div>
          )}

          {/* Terakhir backup */}
          <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "var(--app-border)" }}>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {L("Backup terakhir", "Last backup")}
            </p>
            <p className="font-['Inter'] text-[11px] font-semibold" style={{ color: lastBackup ? "#4edea3" : "var(--app-text2)" }}>
              {formatLastBackup(lastBackup)}
            </p>
          </div>
        </div>

        {/* Export Card */}
        <div className="rounded-[24px] p-5 border space-y-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[12px] flex items-center justify-center"
              style={{ backgroundColor: "rgba(78,222,163,0.15)" }}>
              <span className="text-[20px]">📤</span>
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                {L("Unduh Cadangan Sekarang", "Download Backup Now")}
              </p>
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {L("Simpan file .json ke perangkat", "Save .json file to device")}
              </p>
            </div>
          </div>
          <button onClick={handleExport}
            className="w-full h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)", color: "#003824" }}>
            {exportDone ? (
              <>✓ {L("Berhasil Diunduh!", "Downloaded!")}</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {L("Unduh Cadangan", "Download Backup")}
              </>
            )}
          </button>
        </div>

        {/* Import Card */}
        <div className="rounded-[24px] p-5 border space-y-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[12px] flex items-center justify-center"
              style={{ backgroundColor: "rgba(96,165,250,0.15)" }}>
              <span className="text-[20px]">📥</span>
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                {L("Muat Data", "Load Data")}
              </p>
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {L("Pulihkan dari file cadangan .json", "Restore from .json backup file")}
              </p>
            </div>
          </div>

          <div className="rounded-[12px] p-3 border border-[rgba(251,191,36,0.3)]"
            style={{ backgroundColor: "rgba(251,191,36,0.08)" }}>
            <p className="font-['Inter'] text-[11px] text-[#fbbf24]">
              ⚠️ {L(
                "Memuat data akan menggantikan SEMUA data yang ada saat ini.",
                "Loading data will replace ALL current data."
              )}
            </p>
          </div>

          <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          <button onClick={() => fileRef.current?.click()}
            className="w-full h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 border"
            style={{ backgroundColor: "var(--app-card2)", borderColor: "rgba(96,165,250,0.4)", color: "#60a5fa" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {L("Pilih File Cadangan", "Select Backup File")}
          </button>
        </div>

        {/* Status messages */}
        {importStatus === "success" && (
          <div className="rounded-[16px] p-4 border border-[rgba(78,222,163,0.4)] text-center"
            style={{ backgroundColor: "rgba(78,222,163,0.1)" }}>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#4edea3]">
              ✓ {L("Data berhasil dimuat! Mengalihkan...", "Data loaded! Redirecting...")}
            </p>
          </div>
        )}
        {importStatus === "error" && (
          <div className="rounded-[16px] p-4 border border-[rgba(255,180,171,0.4)]"
            style={{ backgroundColor: "rgba(255,180,171,0.1)" }}>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] text-[#ffb4ab] mb-1">
              ❌ {L("Gagal memuat data", "Failed to load data")}
            </p>
            <p className="font-['Inter'] text-[11px] text-[#ffb4ab]">{importError}</p>
            <button onClick={() => setImportStatus("idle")}
              className="mt-2 font-['Inter'] text-[11px] underline text-[#ffb4ab]">
              {L("Coba lagi", "Try again")}
            </button>
          </div>
        )}

        {/* Transfer Guide */}
        <div className="rounded-[20px] p-5 border space-y-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[1px] uppercase"
            style={{ color: "var(--app-text2)" }}>
            {L("Panduan Pindah Perangkat", "Device Transfer Guide")}
          </p>
          <div className="space-y-3">
            {[
              [L("Unduh cadangan", "Download backup"), L("Klik 'Unduh Cadangan' di perangkat lama.", "Click 'Download Backup' on old device.")],
              [L("Kirim file", "Send file"), L("Kirim file .json ke perangkat baru via Email atau WhatsApp.", "Send the .json file to new device via Email or WhatsApp.")],
              [L("Muat data", "Load data"), L("Di perangkat baru, klik 'Pilih File Cadangan' dan konfirmasi dengan PIN.", "On new device, click 'Select Backup File' and confirm with PIN.")],
            ].map(([step, desc], i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="size-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px]"
                  style={{ backgroundColor: "rgba(78,222,163,0.15)", color: "#4edea3" }}>
                  {i + 1}
                </div>
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "var(--app-text)" }}>{step}</p>
                  <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PIN Confirmation Modal */}
      {importStatus === "confirm" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => { setImportStatus("idle"); setPendingJson(null); }}>
          <div className="w-full max-w-[340px] rounded-[28px] overflow-hidden shadow-2xl"
            style={{ backgroundColor: "var(--app-card)" }}
            onClick={e => e.stopPropagation()}>
            <div className="p-5 text-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
              <span className="text-[40px] block mb-2">🔐</span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px] text-white">
                {L("Konfirmasi dengan PIN", "Confirm with PIN")}
              </h2>
              <p className="font-['Inter'] text-[12px] text-white/80 mt-1">
                {L("Masukkan PIN untuk melanjutkan impor data", "Enter your PIN to proceed with data import")}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="size-3.5 rounded-full transition-all"
                    style={{ backgroundColor: i < confirmPin.length ? (pinError ? "#ffb4ab" : "#60a5fa") : "var(--app-card2)" }} />
                ))}
              </div>
              {pinError && (
                <p className="font-['Inter'] text-[12px] text-[#ffb4ab] text-center">{pinError}</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => {
                  if (d === "") return <div key={i} />;
                  return (
                    <button key={i} type="button"
                      onClick={() => {
                        if (d === "⌫") { setConfirmPin(p => p.slice(0, -1)); setPinError(""); }
                        else if (confirmPin.length < 6) { setConfirmPin(p => p + d); setPinError(""); }
                      }}
                      className="h-[52px] rounded-[14px] flex items-center justify-center transition-all active:scale-90 font-['Plus_Jakarta_Sans'] font-bold text-[18px]"
                      style={{
                        backgroundColor: d === "⌫" ? "rgba(255,180,171,0.1)" : "var(--app-card2)",
                        color: d === "⌫" ? "#ffb4ab" : "var(--app-text)",
                        border: "1px solid var(--app-border)",
                      }}>
                      {d}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setImportStatus("idle"); setPendingJson(null); setConfirmPin(""); }}
                  className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[13px]"
                  style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                  {L("Batal", "Cancel")}
                </button>
                <button onClick={handleConfirmImport}
                  disabled={confirmPin.length < 6}
                  className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                  {L("Konfirmasi", "Confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
