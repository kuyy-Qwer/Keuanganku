import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { exportAllData, importAllData, getUser } from "../store/database";
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

  // ── Export ────────────────────────────────────────────────────────
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luminary_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
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
      // Quick pre-validation before asking for PIN
      const result = importAllData(content);
      if (!result.success) {
        setImportStatus("error");
        setImportError(result.error ?? L("File tidak valid", "Invalid file"));
        return;
      }
      // Store pending and ask for PIN confirmation
      setPendingJson(content);
      setConfirmPin("");
      setPinError("");
      setImportStatus("confirm");
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
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
              💾 {L("Ekspor & Impor Data", "Export & Import Data")}
            </h1>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {L("Cadangkan atau pulihkan data keuanganmu", "Back up or restore your financial data")}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-[20px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <p className="font-['Inter'] text-[12px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
            {L(
              "Cadangan mencakup semua data: transaksi, tabungan, dana darurat, aset, rekening bank, dan pengaturan. Format file: JSON terenkripsi dengan metadata versi.",
              "Backup includes all data: transactions, savings, emergency funds, assets, bank accounts, and settings. File format: JSON with version metadata."
            )}
          </p>
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
                {L("Unduh Cadangan", "Download Backup")}
              </p>
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {L("Simpan file .json ke perangkat", "Save .json file to device")}
              </p>
            </div>
          </div>
          <button onClick={handleExport}
            className="w-full h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: exportDone ? "linear-gradient(135deg,#4edea3,#00b4a2)" : "linear-gradient(135deg,#4edea3,#00b4a2)", color: "#003824" }}>
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

          {/* Warning */}
          <div className="rounded-[12px] p-3 border border-[rgba(251,191,36,0.3)]"
            style={{ backgroundColor: "rgba(251,191,36,0.08)" }}>
            <p className="font-['Inter'] text-[11px] text-[#fbbf24]">
              ⚠️ {L(
                "Memuat data akan menggantikan SEMUA data yang ada saat ini. Pastikan kamu sudah mengunduh cadangan terbaru sebelum melanjutkan.",
                "Loading data will replace ALL current data. Make sure you have downloaded the latest backup before proceeding."
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
              {/* PIN dots */}
              <div className="flex gap-3 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="size-3.5 rounded-full transition-all"
                    style={{
                      backgroundColor: i < confirmPin.length ? (pinError ? "#ffb4ab" : "#60a5fa") : "var(--app-card2)",
                    }} />
                ))}
              </div>
              {pinError && (
                <p className="font-['Inter'] text-[12px] text-[#ffb4ab] text-center">{pinError}</p>
              )}
              {/* Numpad */}
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
