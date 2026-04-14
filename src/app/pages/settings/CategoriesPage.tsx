import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import {
  getCategories, addCategory, updateCategory, deleteCategory, type Category,
  getBudgets, saveBudget, getInflowTargets, saveInflowTarget, formatNumber,
  getTransactions,
} from "../../store/database";
import { useLang } from "../../i18n";
import ConfirmDialog from "../../components/ConfirmDialog";
import { playDeleteSound, playSuccessSound, playAlertSound } from "../../lib/sounds";

const EMOJI_OPTIONS = ["🍔","🚗","🛍️","📄","🎮","💊","💵","💻","📈","💰","🏠","✈️","📚","🎬","🐕","☕","🎵","👕","💡","🎁","🍕","🎨","⚽","🔧","📱","🧹"];

function parseNum(val: string): number {
  return parseInt(val.replace(/\./g, "").replace(/,/g, "")) || 0;
}

function fmtInput(val: string): string {
  const num = val.replace(/\D/g, "");
  if (!num) return "";
  return parseInt(num).toLocaleString("id-ID");
}

interface FormState {
  name: string;
  emoji: string;
  type: "expense" | "income" | "both";
  budgetAmt: string;
  inflowAmt: string;
}

const defaultForm = (): FormState => ({ name: "", emoji: "💳", type: "expense", budgetAmt: "", inflowAmt: "" });

function CategoryForm({
  form, setForm, onSave, onCancel, isEdit, L,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
  L: (id: string, en: string) => string;
}) {
  const showBudget = form.type === "expense" || form.type === "both";
  const showInflow = form.type === "income" || form.type === "both";

  const typeBadge = (t: string) => {
    if (t === "income") return { label: L("Masuk", "Income"), color: "#4edea3", bg: "rgba(78,222,163,0.1)" };
    if (t === "both")   return { label: L("Dua-nya", "Both"),  color: "#60a5fa", bg: "rgba(96,165,250,0.1)" };
    return                     { label: L("Keluar", "Expense"), color: "#ffb4ab", bg: "rgba(255,180,171,0.1)" };
  };

  return (
    <div className="rounded-[20px] p-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200"
      style={{ backgroundColor: "var(--app-card)", border: "1px solid rgba(78,222,163,0.25)" }}>

      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
        {isEdit ? L("Edit Kategori", "Edit Category") : L("Tambah Kategori", "Add Category")}
      </p>

      {/* Emoji */}
      <div>
        <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2" style={{ color: "var(--app-text2)" }}>EMOJI</p>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map(e => (
            <button key={e} onClick={() => setForm({ ...form, emoji: e })}
              className="size-10 rounded-[12px] flex items-center justify-center text-[20px] transition-all"
              style={{
                backgroundColor: form.emoji === e ? "#4edea3" : "var(--app-card2)",
                boxShadow: form.emoji === e ? "0 4px 12px rgba(78,222,163,0.3)" : "none",
              }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Nama */}
      <div>
        <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2" style={{ color: "var(--app-text2)" }}>{L("NAMA", "NAME")}</p>
        <div className="rounded-[14px] border" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder={L("Nama kategori", "Category name")}
            className="w-full bg-transparent px-4 py-3 text-[14px] outline-none text-white" />
        </div>
      </div>

      {/* Tipe */}
      <div>
        <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2" style={{ color: "var(--app-text2)" }}>{L("TIPE", "TYPE")}</p>
        <div className="flex gap-2">
          {(["expense", "income", "both"] as const).map(tp => (
            <button key={tp} onClick={() => setForm({ ...form, type: tp })}
              className="flex-1 py-2 rounded-full font-semibold text-[12px] transition-all"
              style={{
                backgroundColor: form.type === tp ? typeBadge(tp).bg : "var(--app-card2)",
                color: form.type === tp ? typeBadge(tp).color : "var(--app-text2)",
                border: form.type === tp ? `1px solid ${typeBadge(tp).color}50` : "1px solid transparent",
              }}>{typeBadge(tp).label}</button>
          ))}
        </div>
        <div className="mt-2 rounded-[14px] px-3 py-2 border"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "var(--app-border)", color: "var(--app-text2)" }}>
          <p className="text-[11px] leading-relaxed">
            {form.type === "expense"
              ? L("Pilih ini untuk kategori pengeluaran. Bisa dipakai untuk Budget bulanan.", "Use for expenses. You can set a monthly budget.")
              : form.type === "income"
                ? L("Pilih ini untuk kategori pemasukan. Bisa dipakai untuk Target pemasukan bulanan.", "Use for income. You can set a monthly income target.")
                : L("Pilih ini jika kategorinya bisa Masuk & Keluar (mis. Investasi). Akan muncul Budget & Target sekaligus.", "Use when a category can be both income & expense (e.g., investing). You'll get both budget & target.")
            }
          </p>
          {form.type === "both" && (
            <p className="text-[10px] mt-1" style={{ color: "rgba(96,165,250,0.9)" }}>
              💡 {L("Tips: gunakan 'Dua-nya' untuk Investasi agar halaman Portfolio otomatis membaca kategorinya.", "Tip: use 'Both' for investing so the Portfolio page can detect it.")}
            </p>
          )}
        </div>
      </div>

      {/* Target Dua Arah */}
      <div className="space-y-3">
        {showBudget && (
          <div className="animate-in slide-in-from-top duration-200">
            <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2 text-[#ffb4ab]">
              📤 {L("BATAS ANGGARAN KELUAR / BULAN", "MONTHLY EXPENSE BUDGET")}
            </p>
            <div className="rounded-[14px] border flex items-center px-4 gap-2"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "rgba(255,180,171,0.2)" }}>
              <span className="text-[#64748b] text-[12px] font-bold">Rp</span>
              <input value={form.budgetAmt} onChange={e => setForm({ ...form, budgetAmt: fmtInput(e.target.value) })}
                placeholder="0" inputMode="numeric"
                className="flex-1 bg-transparent py-3 px-1 text-white font-bold outline-none text-[15px]" />
            </div>
            {form.budgetAmt && (
              <p className="text-[10px] text-[#ffb4ab]/60 mt-1 px-1">= Rp {form.budgetAmt} / bulan</p>
            )}
          </div>
        )}

        {showInflow && (
          <div className="animate-in slide-in-from-top duration-200">
            <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2 text-[#4edea3]">
              📥 {L("TARGET PEMASUKAN / BULAN", "MONTHLY INCOME TARGET")}
            </p>
            <div className="rounded-[14px] border flex items-center px-4 gap-2"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "rgba(78,222,163,0.2)" }}>
              <span className="text-[#64748b] text-[12px] font-bold">Rp</span>
              <input value={form.inflowAmt} onChange={e => setForm({ ...form, inflowAmt: fmtInput(e.target.value) })}
                placeholder="0" inputMode="numeric"
                className="flex-1 bg-transparent py-3 px-1 text-white font-bold outline-none text-[15px]" />
            </div>
            {form.inflowAmt && (
              <p className="text-[10px] text-[#4edea3]/60 mt-1 px-1">= Rp {form.inflowAmt} / bulan</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-[14px] font-semibold text-[13px]"
          style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
          {L("Batal", "Cancel")}
        </button>
        <button onClick={onSave}
          className="flex-1 py-3 rounded-[14px] bg-[#00d18b] font-semibold text-[13px] text-[#060e20]">
          {isEdit ? L("Update", "Update") : L("Tambah", "Add")}
        </button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(defaultForm());

  // editId = id kategori yang sedang diedit inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(defaultForm());
  const editRef = useRef<HTMLDivElement>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const refresh = () => setCategories(getCategories());

  useEffect(() => {
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  // Scroll ke form edit setelah render
  useEffect(() => {
    if (editId && editRef.current) {
      setTimeout(() => editRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [editId]);

  const handleAdd = () => {
    if (!addForm.name.trim()) {
      playAlertSound();
      return;
    }
    const catName = addForm.name.trim();
    addCategory({ name: catName, emoji: addForm.emoji, type: addForm.type });
    if (addForm.type === "expense" || addForm.type === "both") saveBudget(catName, parseNum(addForm.budgetAmt));
    if (addForm.type === "income" || addForm.type === "both") saveInflowTarget(catName, parseNum(addForm.inflowAmt));
    playSuccessSound();
    setAddForm(defaultForm());
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!editId || !editForm.name.trim()) {
      playAlertSound();
      return;
    }
    const catName = editForm.name.trim();
    updateCategory(editId, { name: catName, emoji: editForm.emoji, type: editForm.type });
    if (editForm.type === "expense" || editForm.type === "both") saveBudget(catName, parseNum(editForm.budgetAmt));
    if (editForm.type === "income" || editForm.type === "both") saveInflowTarget(catName, parseNum(editForm.inflowAmt));
    playSuccessSound();
    setEditId(null);
  };

  const startEdit = (cat: Category) => {
    // Toggle: klik edit lagi pada kategori yang sama = tutup
    if (editId === cat.id) { setEditId(null); return; }
    const b  = getBudgets().find(b => b.category === cat.name);
    const it = getInflowTargets().find(t => t.category === cat.name);
    setEditForm({
      name: cat.name,
      emoji: cat.emoji,
      type: cat.type,
      budgetAmt: b  ? b.limit.toLocaleString("id-ID")  : "",
      inflowAmt: it ? it.target.toLocaleString("id-ID") : "",
    });
    setEditId(cat.id);
    setShowAddForm(false); // tutup form tambah jika terbuka
  };

  const typeBadge = (t: string) => {
    if (t === "income") return { label: L("Masuk", "Income"), color: "#4edea3", bg: "rgba(78,222,163,0.1)" };
    if (t === "both")   return { label: L("Dua-nya", "Both"),  color: "#60a5fa", bg: "rgba(96,165,250,0.1)" };
    return                     { label: L("Keluar", "Expense"), color: "#ffb4ab", bg: "rgba(255,180,171,0.1)" };
  };

  // Realisasi bulan ini
  const now = new Date();
  const txs = getTransactions().filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyIn: Record<string, number>  = {};
  const monthlyOut: Record<string, number> = {};
  txs.forEach(t => {
    if (t.type === "income") monthlyIn[t.category]  = (monthlyIn[t.category]  || 0) + t.amount;
    else                     monthlyOut[t.category] = (monthlyOut[t.category] || 0) + t.amount;
  });

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-4">
        {pendingDeleteId && (
          <ConfirmDialog
            title={L("Hapus Kategori?", "Delete Category?")}
            message={L("Kategori ini akan dihapus permanen.", "This category will be permanently deleted.")}
            confirmLabel={L("Hapus", "Delete")}
            cancelLabel={L("Batal", "Cancel")}
            onConfirm={() => { playDeleteSound(); deleteCategory(pendingDeleteId); setPendingDeleteId(null); }}
            onCancel={() => setPendingDeleteId(null)}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>{L("Kelola Kategori", "Manage Categories")}</h1>
        </div>

        {/* Quick guide */}
        <div className="rounded-[18px] p-4 border"
          style={{ background: "linear-gradient(135deg,rgba(78,222,163,0.08),rgba(96,165,250,0.06))", borderColor: "var(--app-border)" }}>
          <p className="text-[12px] font-black tracking-widest uppercase mb-2" style={{ color: "var(--app-text2)" }}>
            {L("Cara pakai kategori", "How categories work")}
          </p>
          <div className="space-y-1.5 text-[12px]" style={{ color: "var(--app-text2)" }}>
            <p><span className="font-bold text-[#ffb4ab]">📤 {L("Keluar", "Expense")}</span> — {L("untuk pengeluaran, bisa diberi Budget.", "for spending, can have a monthly budget.")}</p>
            <p><span className="font-bold text-[#4edea3]">📥 {L("Masuk", "Income")}</span> — {L("untuk pemasukan, bisa diberi Target.", "for earnings, can have a monthly target.")}</p>
            <p><span className="font-bold text-[#60a5fa]">🔁 {L("Dua-nya", "Both")}</span> — {L("untuk kategori dua arah (contoh Investasi).", "for two-way categories (e.g., investing).")}</p>
          </div>
          <p className="text-[11px] mt-2" style={{ color: "rgba(148,163,184,0.9)" }}>
            {L("Kategori dipakai saat kamu menambah transaksi baru. Budget/Target akan dipakai di laporan & insights.", "Categories are used when adding transactions. Budgets/targets show up in reports & insights.")}
          </p>
        </div>

        {/* Budget guide */}
        <div className="rounded-[18px] p-4 border"
          style={{ backgroundColor: "rgba(255,180,171,0.06)", borderColor: "rgba(255,180,171,0.18)" }}>
          <p className="text-[12px] font-black tracking-widest uppercase mb-2" style={{ color: "var(--app-text2)" }}>
            {L("Cara pakai batas anggaran", "How to use budgets")}
          </p>
          <div className="space-y-2 text-[12px]" style={{ color: "var(--app-text2)" }}>
            <p>
              <span className="font-bold text-[#ffb4ab]">1)</span>{" "}
              {L("Set budget per kategori pengeluaran (mis. Makanan Rp1.500.000/bulan).", "Set a budget per expense category (e.g., Food Rp1,500,000/month).")}
            </p>
            <p>
              <span className="font-bold text-[#ffb4ab]">2)</span>{" "}
              {L("Saat kamu menambah transaksi, sistem akan memberi peringatan jika budget kategori sudah habis.", "When you add a transaction, the app will warn you if that category budget is depleted.")}
            </p>
            <p>
              <span className="font-bold text-[#ffb4ab]">3)</span>{" "}
              {L("Budget dihitung per bulan (reset otomatis setiap ganti bulan).", "Budgets are calculated monthly (auto-reset every new month).")}
            </p>
          </div>
          <div className="mt-3 rounded-[14px] p-3 border"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "var(--app-border)" }}>
            <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.95)" }}>
              💡 {L("Tips: mulai dari 1–3 kategori terbesar dulu. Budget bisa kamu ubah kapan saja.", "Tip: start with your top 1–3 spending categories. You can adjust budgets anytime.")}
            </p>
          </div>
        </div>

        {/* Form Tambah (di atas, hanya untuk add baru) */}
        {showAddForm && (
          <CategoryForm
            form={addForm} setForm={setAddForm}
            onSave={handleAdd}
            onCancel={() => { setShowAddForm(false); setAddForm(defaultForm()); }}
            isEdit={false} L={L}
          />
        )}

        {!showAddForm && (
          <button onClick={() => { setShowAddForm(true); setEditId(null); }}
            className="w-full rounded-[16px] py-4 flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: "var(--app-card)", border: "1px dashed rgba(78,222,163,0.35)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4edea3" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="font-semibold text-[14px] text-[#4edea3]">{L("Tambah Kategori", "Add Category")}</span>
          </button>
        )}

        {/* Category List — form edit muncul inline di bawah kartu */}
        <div className="space-y-2">
          {categories.map(cat => {
            const badge    = typeBadge(cat.type);
            const budget   = getBudgets().find(b => b.category === cat.name);
            const inflow   = getInflowTargets().find(t => t.category === cat.name);
            const outSpent = monthlyOut[cat.name] || 0;
            const inEarned = monthlyIn[cat.name]  || 0;
            const isEditing = editId === cat.id;

            return (
              <div key={cat.id} className="space-y-2">
                {/* Kartu kategori */}
                <div className={`rounded-[20px] p-4 space-y-3 transition-all ${isEditing ? 'ring-2 ring-[#4edea3]/40' : ''}`}
                  style={{ backgroundColor: "var(--app-card)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-[42px] rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--app-card2)" }}>
                        <span className="text-[20px]">{cat.emoji}</span>
                      </div>
                      <div>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white">{cat.name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(cat)}
                        className={`rounded-full p-2 transition-all ${isEditing ? 'bg-[#4edea3]/20' : 'bg-[rgba(96,165,250,0.1)]'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                          stroke={isEditing ? "#4edea3" : "#60a5fa"} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button onClick={() => setPendingDeleteId(cat.id)} className="bg-[rgba(255,180,171,0.1)] rounded-full p-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ffb4ab" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress bars */}
                  {budget && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-[#ffb4ab]">📤 {L("Keluar", "Out")}</span>
                        <span className="text-white">
                          Rp{formatNumber(outSpent)}
                          <span className="text-[#64748b]"> / Rp{formatNumber(budget.limit)}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((outSpent / budget.limit) * 100, 100)}%`,
                            backgroundColor: outSpent > budget.limit ? "#ff6b6b" : "#ffb4ab",
                          }} />
                      </div>
                    </div>
                  )}

                  {inflow && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-[#4edea3]">📥 {L("Masuk", "In")}</span>
                        <span className="text-white">
                          Rp{formatNumber(inEarned)}
                          <span className="text-[#64748b]"> / Rp{formatNumber(inflow.target)}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-[#4edea3] transition-all duration-700"
                          style={{ width: `${Math.min((inEarned / inflow.target) * 100, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form edit inline — muncul tepat di bawah kartu */}
                {isEditing && (
                  <div ref={editRef}>
                    <CategoryForm
                      form={editForm} setForm={setEditForm}
                      onSave={handleUpdate}
                      onCancel={() => setEditId(null)}
                      isEdit={true} L={L}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
