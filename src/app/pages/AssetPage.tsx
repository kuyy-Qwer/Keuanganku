import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  getAssets, addAsset, updateAsset, deleteAsset, disposeAsset,
  formatRupiah, type Asset, type AssetCategory, type AssetDisposalType,
  addTransaction,
  getBankAccounts, addBankTransaction, getBankAvailableBalance,
  getCashWalletBalance, addCashWalletTransaction,
  formatMoneyInput, parseMoneyInput,
} from "../store/database";
import { useLang } from "../i18n";
import { playAlertSound } from "../lib/sounds";
import { crudDeleteSuccess, crudSuccess } from "../lib/notify";

const CATEGORY_META: Record<AssetCategory, { label: { id: string; en: string }; emoji: string }> = {
  properti:   { label: { id: "Properti",   en: "Property"    }, emoji: "🏠" },
  kendaraan:  { label: { id: "Kendaraan",  en: "Vehicle"     }, emoji: "🚗" },
  elektronik: { label: { id: "Elektronik", en: "Electronics" }, emoji: "💻" },
  investasi:  { label: { id: "Investasi",  en: "Investment"  }, emoji: "📈" },
  lainnya:    { label: { id: "Lainnya",    en: "Other"       }, emoji: "📦" },
};

const CATEGORIES = Object.keys(CATEGORY_META) as AssetCategory[];

const DISPOSAL_META: Record<AssetDisposalType, { emoji: string; label: { id: string; en: string } }> = {
  dijual:        { emoji: "💰", label: { id: "Dijual",              en: "Sold"           } },
  rusak:         { emoji: "🔨", label: { id: "Rusak",               en: "Damaged"        } },
  habis_manfaat: { emoji: "⏰", label: { id: "Habis Masa Manfaat",  en: "End of Life"    } },
};

const EMPTY_FORM = {
  name: "",
  category: "lainnya" as AssetCategory,
  emoji: "📦",
  purchaseValue: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

const EMPTY_DISPOSAL = {
  type: "dijual" as AssetDisposalType,
  date: new Date().toISOString().slice(0, 10),
  saleValue: "",
  saleDestination: "cash" as "cash" | string,
  notes: "",
};

export default function AssetPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editCurrentValue, setEditCurrentValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<AssetCategory | "semua">("semua");
  const [tabFilter, setTabFilter] = useState<"aktif" | "dilepas">("aktif");

  // Disposal modal state
  const [disposeTarget, setDisposeTarget] = useState<Asset | null>(null);
  const [disposeForm, setDisposeForm] = useState({ ...EMPTY_DISPOSAL });

  const refresh = () => setAssets(getAssets());

  useEffect(() => {
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  const activeAssets = assets.filter(a => !a.isDisposed);
  const disposedAssets = assets.filter(a => a.isDisposed);

  const totalValue = activeAssets.reduce((s, a) => s + a.currentValue, 0);
  const totalPurchase = activeAssets.reduce((s, a) => s + a.purchaseValue, 0);
  const gainLoss = totalValue - totalPurchase;

  const displayAssets = tabFilter === "aktif" ? activeAssets : disposedAssets;
  const filtered = filterCat === "semua" ? displayAssets : displayAssets.filter(a => a.category === filterCat);

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setEditCurrentValue("");
    setShowModal(true);
  }

  function openEdit(asset: Asset) {
    setEditId(asset.id);
    setForm({
      name: asset.name,
      category: asset.category,
      emoji: asset.emoji,
      purchaseValue: String(asset.purchaseValue),
      purchaseDate: asset.purchaseDate.slice(0, 10),
      notes: asset.notes,
    });
    setEditCurrentValue(String(asset.currentValue));
    setShowModal(true);
  }

  function openDispose(asset: Asset) {
    setDisposeTarget(asset);
    setDisposeForm({ ...EMPTY_DISPOSAL, date: new Date().toISOString().slice(0, 10) });
  }

  function handleSubmit() {
    const pv = parseMoneyInput(form.purchaseValue);
    if (!form.name.trim() || !pv) { playAlertSound(); return; }
    const payload = {
      name: form.name.trim(),
      category: form.category,
      emoji: form.emoji || CATEGORY_META[form.category].emoji,
      purchaseValue: pv,
      currentValue: editId ? (parseMoneyInput(editCurrentValue) || pv) : pv,
      purchaseDate: new Date(form.purchaseDate).toISOString(),
      notes: form.notes.trim(),
    };
    if (editId) {
      updateAsset(editId, payload);
      void crudSuccess();
    } else {
      addAsset(payload);
      void crudSuccess();
    }
    setShowModal(false);
  }

  function handleDispose() {
    if (!disposeTarget) return;
    const sv = disposeForm.type === "dijual" ? parseMoneyInput(disposeForm.saleValue) : 0;
    if (disposeForm.type === "dijual" && !sv) { playAlertSound(); return; }

    const disposal = {
      type: disposeForm.type,
      date: new Date(disposeForm.date).toISOString(),
      saleValue: sv,
      saleDestination: disposeForm.type === "dijual"
        ? (disposeForm.saleDestination === "cash"
            ? { type: "cash" as const, label: "Cash" }
            : { type: "bank" as const, id: disposeForm.saleDestination, label: getBankAccounts().find(a => a.id === disposeForm.saleDestination)?.bankName })
        : undefined,
      notes: disposeForm.notes.trim(),
    };

    disposeAsset(disposeTarget.id, disposal);

    // Record transaction
    if (disposeForm.type === "dijual" && sv > 0) {
      const dest = disposeForm.saleDestination;
      if (dest === "cash") {
        const mainTx = addTransaction({
          amount: sv,
          category: "Aset",
          notes: `Penjualan Aset: ${disposeTarget.name}${disposeForm.notes ? ` · ${disposeForm.notes}` : ""}`,
          type: "income",
          date: new Date().toISOString(),
          paymentSource: { type: "cash", label: "Cash" },
        });
        addCashWalletTransaction({ type: "in", amount: sv, category: "Aset", notes: disposeTarget.name, date: new Date().toISOString(), relatedTransactionId: mainTx.id });
      } else {
        const mainTx = addTransaction({
          amount: sv,
          category: "Aset",
          notes: `Penjualan Aset: ${disposeTarget.name}${disposeForm.notes ? ` · ${disposeForm.notes}` : ""}`,
          type: "income",
          date: new Date().toISOString(),
          paymentSource: { type: "bank", id: dest, label: getBankAccounts().find(a => a.id === dest)?.bankName },
        });
        addBankTransaction({
          bankAccountId: dest,
          type: "credit",
          amount: sv,
          adminFee: 0,
          category: "Aset",
          notes: disposeTarget.name,
          paymentMethod: dest,
          relatedTransactionId: mainTx.id,
          date: new Date().toISOString(),
        });
      }
    } else {
      // Rusak / habis masa manfaat — catat expense Rp 0 sebagai penanda
      addTransaction({
        amount: 0,
        category: "Aset",
        notes: `Pelepasan Aset: ${disposeTarget.name} (${DISPOSAL_META[disposeForm.type].label.id})${disposeForm.notes ? ` · ${disposeForm.notes}` : ""}`,
        type: "expense",
        date: new Date().toISOString(),
        paymentSource: { type: "cash", label: "Cash" },
      });
    }

    void crudSuccess();
    setDisposeTarget(null);
  }

  function handleDelete(id: string) {
    deleteAsset(id);
    void crudDeleteSuccess();
    setDeleteConfirm(null);
  }

  const gainColor = gainLoss >= 0 ? "#4edea3" : "#ffb4ab";

  return (
    <div className="w-full min-h-screen flex justify-center pb-28" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/app")} className="p-2 rounded-full"
              style={{ backgroundColor: "var(--app-card)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
              {L("Aset Saya", "My Assets")}
            </h1>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]"
            style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
            {L("Tambah", "Add")}
          </button>
        </div>

        {/* Summary Card — active assets only */}
        <div className="rounded-[24px] p-5 border space-y-3"
          style={{ background: "linear-gradient(135deg,var(--app-card),var(--app-card2))", borderColor: "var(--app-border)" }}>
          <p className="font-['Inter'] font-medium text-[11px] uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
            {L("Total Nilai Aset Aktif", "Total Active Asset Value")}
          </p>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] leading-none tracking-tight" style={{ color: "var(--app-text)" }}>
            {formatRupiah(totalValue)}
          </p>
          <div className="flex gap-4 pt-1">
            <div>
              <p className="font-['Inter'] text-[10px] uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>{L("Harga Beli", "Purchase Price")}</p>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>{formatRupiah(totalPurchase)}</p>
            </div>
            <div>
              <p className="font-['Inter'] text-[10px] uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>{L("Untung/Rugi", "Gain/Loss")}</p>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: gainColor }}>
                {gainLoss >= 0 ? "+" : ""}{formatRupiah(gainLoss)}
              </p>
            </div>
            <div>
              <p className="font-['Inter'] text-[10px] uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>{L("Jumlah", "Count")}</p>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>{activeAssets.length} {L("aset", "assets")}</p>
            </div>
          </div>
        </div>

        {/* Tab Filter: Aktif / Dilepas */}
        <div className="flex gap-2 p-1 rounded-[16px]" style={{ backgroundColor: "var(--app-card)" }}>
          {(["aktif", "dilepas"] as const).map(tab => (
            <button key={tab} onClick={() => setTabFilter(tab)}
              className="flex-1 py-2 rounded-[12px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] transition-all"
              style={{
                backgroundColor: tabFilter === tab ? (tab === "aktif" ? "#10B981" : "#F59E0B") : "transparent",
                color: tabFilter === tab ? "#fff" : "var(--app-text2)",
              }}>
              {tab === "aktif" ? L("Aktif", "Active") : L("Dilepas", "Disposed")}
              <span className="ml-1.5 text-[11px] opacity-70">
                ({tab === "aktif" ? activeAssets.length : disposedAssets.length})
              </span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(["semua", ...CATEGORIES] as const).map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className="shrink-0 px-3 py-1.5 rounded-full font-['Inter'] font-semibold text-[11px] transition-all"
              style={{
                backgroundColor: filterCat === cat ? "#10B981" : "var(--app-card)",
                color: filterCat === cat ? "#fff" : "var(--app-text2)",
              }}>
              {cat === "semua" ? L("Semua", "All") : `${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label[lang] ?? CATEGORY_META[cat].label.id}`}
            </button>
          ))}
        </div>

        {/* Asset List */}
        {filtered.length === 0 ? (
          <div className="rounded-[20px] p-10 text-center" style={{ backgroundColor: "var(--app-card)" }}>
            <span className="text-[40px] block mb-3">{tabFilter === "aktif" ? "🏦" : "📦"}</span>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] mb-1" style={{ color: "var(--app-text)" }}>
              {tabFilter === "aktif"
                ? L("Belum ada aset aktif", "No active assets yet")
                : L("Belum ada aset yang dilepas", "No disposed assets yet")}
            </p>
            <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
              {tabFilter === "aktif"
                ? L("Catat aset kamu seperti rumah, kendaraan, atau investasi", "Record assets like property, vehicles, or investments")
                : L("Aset yang dijual, rusak, atau habis masa manfaat akan muncul di sini", "Sold, damaged, or expired assets will appear here")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(asset => {
              const diff = asset.currentValue - asset.purchaseValue;
              const pct = asset.purchaseValue > 0 ? (diff / asset.purchaseValue) * 100 : 0;
              const isDisposed = asset.isDisposed;
              const disposalMeta = isDisposed && asset.disposal ? DISPOSAL_META[asset.disposal.type] : null;
              return (
                <div key={asset.id}
                  className="rounded-[18px] p-4 border transition-all"
                  style={{
                    backgroundColor: "var(--app-card)",
                    borderColor: isDisposed ? "rgba(245,158,11,0.35)" : "var(--app-border)",
                    opacity: isDisposed ? 0.6 : 1,
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="size-[44px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]"
                        style={{ backgroundColor: "var(--app-card2)" }}>
                        {asset.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] truncate" style={{ color: "var(--app-text)" }}>
                            {asset.name}
                          </p>
                          {isDisposed && (
                            <span className="px-2 py-0.5 rounded-full font-['Inter'] font-bold text-[10px] shrink-0"
                              style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>
                              DILEPAS
                            </span>
                          )}
                        </div>
                        <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                          {CATEGORY_META[asset.category].label[lang] ?? CATEGORY_META[asset.category].label.id} · {new Date(asset.purchaseDate).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { year: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!isDisposed && (
                        <>
                          {/* Dispose button — amber */}
                          <button onClick={() => openDispose(asset)} className="p-2 rounded-full"
                            style={{ backgroundColor: "rgba(245,158,11,0.15)" }}
                            title={L("Lepas Aset", "Dispose Asset")}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button onClick={() => openEdit(asset)} className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card2)" }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button onClick={() => setDeleteConfirm(asset.id)} className="p-2 rounded-full" style={{ backgroundColor: "rgba(255,100,100,0.1)" }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ff6464" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--app-text2)" }}>
                        {isDisposed ? L("Nilai Jual", "Sale Value") : L("Nilai Sekarang", "Current Value")}
                      </p>
                      <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
                        {formatRupiah(asset.currentValue)}
                      </p>
                    </div>
                    {isDisposed && disposalMeta ? (
                      <div className="px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: "rgba(245,158,11,0.15)" }}>
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "#F59E0B" }}>
                          {disposalMeta.emoji} {disposalMeta.label[lang] ?? disposalMeta.label.id}
                        </span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: diff >= 0 ? "rgba(78,222,163,0.15)" : "rgba(255,100,100,0.12)" }}>
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: diff >= 0 ? "#4edea3" : "#ffb4ab" }}>
                          {diff >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Disposal date + notes */}
                  {isDisposed && asset.disposal && (
                    <div className="mt-2 space-y-0.5">
                      <p className="font-['Inter'] text-[11px]" style={{ color: "#F59E0B" }}>
                        📅 {new Date(asset.disposal.date).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      {asset.disposal.notes ? (
                        <p className="font-['Inter'] text-[11px] italic truncate" style={{ color: "var(--app-text2)" }}>
                          {asset.disposal.notes}
                        </p>
                      ) : null}
                    </div>
                  )}
                  {!isDisposed && asset.notes ? (
                    <p className="mt-2 font-['Inter'] text-[11px] italic truncate" style={{ color: "var(--app-text2)" }}>
                      {asset.notes}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-[400px] rounded-[28px] overflow-hidden shadow-2xl mb-4 max-h-[80vh] flex flex-col"
            style={{ backgroundColor: "var(--app-card)" }}
            onClick={e => e.stopPropagation()}>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
                {editId ? L("Edit Aset", "Edit Asset") : L("Tambah Aset", "Add Asset")}
              </h2>

              {/* Emoji + Name */}
              <div className="flex gap-2">
                <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  className="w-[52px] h-[48px] rounded-[14px] text-center text-[22px] outline-none border"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={L("Nama aset", "Asset name")}
                  className="flex-1 h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>

              {/* Category */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat, emoji: f.emoji || CATEGORY_META[cat].emoji }))}
                    className="px-3 py-1.5 rounded-full font-['Inter'] font-semibold text-[11px] transition-all"
                    style={{
                      backgroundColor: form.category === cat ? "#10B981" : "var(--app-card2)",
                      color: form.category === cat ? "#fff" : "var(--app-text2)",
                    }}>
                    {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label[lang] ?? CATEGORY_META[cat].label.id}
                  </button>
                ))}
              </div>

              {/* Purchase Value */}
              <div>
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L("Harga Beli (Rp)", "Purchase Price (Rp)")}
                </label>
                <input type="text" inputMode="numeric" value={form.purchaseValue}
                  onChange={e => setForm(f => ({ ...f, purchaseValue: formatMoneyInput(e.target.value) }))}
                  placeholder="0"
                  className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>

              {/* Current Value — only in Edit mode */}
              {editId && (
                <div>
                  <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                    {L("Estimasi Nilai Sekarang (Rp)", "Estimated Current Value (Rp)")}
                  </label>
                  <input type="text" inputMode="numeric" value={editCurrentValue}
                    onChange={e => setEditCurrentValue(formatMoneyInput(e.target.value))}
                    placeholder={L("Sama dengan harga beli jika kosong", "Same as purchase price if empty")}
                    className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                </div>
              )}

              {/* Purchase Date */}
              <div>
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L("Tanggal Beli", "Purchase Date")}
                </label>
                <input type="date" value={form.purchaseDate}
                  onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
                  className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>

              {/* Notes */}
              <div>
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L("Catatan (opsional)", "Notes (optional)")}
                </label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={L("Misal: Beli second, kondisi baik", "e.g. Second-hand, good condition")}
                  className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L("Batal", "Cancel")}
              </button>
              <button onClick={handleSubmit}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#003824]"
                style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
                {editId ? L("Simpan", "Save") : L("Tambah", "Add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disposal Modal — Lepas Aset */}
      {disposeTarget && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDisposeTarget(null)}>
          <div className="w-full max-w-[400px] rounded-[28px] overflow-hidden shadow-2xl mb-4 max-h-[85vh] flex flex-col"
            style={{ backgroundColor: "var(--app-card)" }}
            onClick={e => e.stopPropagation()}>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
                  {L("Lepas Aset", "Dispose Asset")}
                </h2>
                <p className="font-['Inter'] text-[12px] mt-0.5" style={{ color: "var(--app-text2)" }}>
                  {disposeTarget.emoji} {disposeTarget.name}
                </p>
              </div>

              {/* Disposal type selector */}
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(DISPOSAL_META) as AssetDisposalType[]).map(type => (
                  <button key={type} onClick={() => setDisposeForm(f => ({ ...f, type }))}
                    className="flex flex-col items-center gap-1 py-3 px-2 rounded-[14px] border transition-all"
                    style={{
                      backgroundColor: disposeForm.type === type ? "rgba(245,158,11,0.15)" : "var(--app-card2)",
                      borderColor: disposeForm.type === type ? "#F59E0B" : "var(--app-border)",
                    }}>
                    <span className="text-[20px]">{DISPOSAL_META[type].emoji}</span>
                    <span className="font-['Inter'] font-semibold text-[10px] text-center leading-tight"
                      style={{ color: disposeForm.type === type ? "#F59E0B" : "var(--app-text2)" }}>
                      {DISPOSAL_META[type].label[lang] ?? DISPOSAL_META[type].label.id}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sale value + destination — only when "dijual" */}
              {disposeForm.type === "dijual" && (
                <>
                  <div>
                    <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                      {L("Nilai Jual (Rp)", "Sale Value (Rp)")}
                    </label>
                    <input type="text" inputMode="numeric" value={disposeForm.saleValue}
                      onChange={e => setDisposeForm(f => ({ ...f, saleValue: formatMoneyInput(e.target.value) }))}
                      placeholder="0"
                      className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                      style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                  </div>
                  <div>
                    <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                      {L("Uang Masuk Ke", "Proceeds To")}
                    </label>
                    <select value={disposeForm.saleDestination}
                      onChange={e => setDisposeForm(f => ({ ...f, saleDestination: e.target.value }))}
                      className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                      style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
                      <option value="cash">💵 Cash — {formatRupiah(getCashWalletBalance())}</option>
                      {getBankAccounts().map(a => (
                        <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Disposal date */}
              <div>
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L("Tanggal Pelepasan", "Disposal Date")}
                </label>
                <input type="date" value={disposeForm.date}
                  onChange={e => setDisposeForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>

              {/* Notes */}
              <div>
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L("Catatan (opsional)", "Notes (optional)")}
                </label>
                <input value={disposeForm.notes}
                  onChange={e => setDisposeForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={L("Misal: Dijual ke tetangga", "e.g. Sold to neighbor")}
                  className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setDisposeTarget(null)}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L("Batal", "Cancel")}
              </button>
              <button onClick={handleDispose}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white"
                style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}>
                {L("Konfirmasi", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl space-y-4"
            style={{ backgroundColor: "var(--app-card)" }}
            onClick={e => e.stopPropagation()}>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px] text-center" style={{ color: "var(--app-text)" }}>
              {L("Hapus aset ini?", "Delete this asset?")}
            </p>
            <p className="font-['Inter'] text-[13px] text-center" style={{ color: "var(--app-text2)" }}>
              {L("Data tidak bisa dikembalikan.", "This cannot be undone.")}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-[44px] rounded-[12px] font-['Plus_Jakarta_Sans'] font-bold text-[13px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L("Batal", "Cancel")}
              </button>
              <button onClick={() => handleDelete(deleteConfirm!)}
                className="flex-1 h-[44px] rounded-[12px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white"
                style={{ backgroundColor: "#ef4444" }}>
                {L("Hapus", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
