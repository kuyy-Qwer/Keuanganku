import { useState } from "react";
import { addTransaction, getCategories, formatRupiah } from "../store/database";
import { useLang } from "../i18n";
import { playAlertSound } from "../lib/sounds";
import { crudSuccess } from "../lib/notify";

interface ReceiptItem {
  id: string;
  name: string;
  price: string;
}

interface Props {
  onClose: () => void;
}

const L = (lang: string, id: string, en: string) => lang === "en" ? en : id;

export default function ReceiptScanner({ onClose }: Props) {
  const lang = useLang();
  const categories = getCategories().filter(c => c.type === "expense" || c.type === "both");

  const [items, setItems] = useState<ReceiptItem[]>([
    { id: crypto.randomUUID(), name: "", price: "" },
  ]);
  const [storeName, setStoreName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saved, setSaved] = useState(false);

  const total = items.reduce((sum, item) => sum + (parseInt(item.price.replace(/\D/g, ""), 10) || 0), 0);

  function addItem() {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: "", price: "" }]);
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem(id: string, field: "name" | "price", value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function handleSave() {
    if (total <= 0 || !selectedCategory) { playAlertSound(); return; }
    const notes = [
      storeName.trim(),
      items.filter(i => i.name.trim()).map(i => i.name.trim()).join(", "),
    ].filter(Boolean).join(" · ");

    addTransaction({
      amount: total,
      category: selectedCategory,
      notes: notes || L(lang, "Struk belanja", "Receipt"),
      type: "expense",
      paymentSource: { type: "cash", label: "Cash" },
    });
    void crudSuccess();
    setSaved(true);
    setTimeout(onClose, 1200);
  }

  const catMap: Record<string, string> = {};
  categories.forEach(c => { catMap[c.name] = c.emoji; });

  return (
    <div className="rounded-[28px] overflow-hidden shadow-2xl" style={{ backgroundColor: "var(--app-card)" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b" style={{ borderColor: "var(--app-border)" }}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-[12px] bg-[rgba(78,222,163,0.12)] flex items-center justify-center text-[20px]">🧾</div>
          <div>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[15px]" style={{ color: "var(--app-text)" }}>
              {L(lang, "Input Struk", "Receipt Input")}
            </p>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Catat item belanja sekaligus", "Log multiple items at once")}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card2)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Store + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-['Inter'] text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Nama Toko", "Store Name")}
            </label>
            <input value={storeName} onChange={e => setStoreName(e.target.value)}
              placeholder={L(lang, "Indomaret, Alfamart...", "Store name...")}
              className="w-full h-[42px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
              style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
          </div>
          <div className="space-y-1">
            <label className="font-['Inter'] text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Tanggal", "Date")}
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-[42px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
              style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="font-['Inter'] text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
            {L(lang, "Kategori", "Category")}
          </label>
          <div className="flex gap-2 flex-wrap">
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                className="px-3 py-1.5 rounded-full font-['Inter'] font-semibold text-[11px] transition-all"
                style={{
                  backgroundColor: selectedCategory === cat.name ? "#10B981" : "var(--app-card2)",
                  color: selectedCategory === cat.name ? "#fff" : "var(--app-text2)",
                }}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-['Inter'] text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Item Belanja", "Items")} ({items.length})
            </label>
            <button onClick={addItem}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full font-['Inter'] font-bold text-[11px] text-[#4edea3]"
              style={{ backgroundColor: "rgba(78,222,163,0.1)" }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              {L(lang, "Tambah", "Add")}
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center">
              <span className="font-['Inter'] text-[11px] w-5 text-center shrink-0" style={{ color: "var(--app-text2)" }}>
                {idx + 1}
              </span>
              <input value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)}
                placeholder={L(lang, "Nama item...", "Item name...")}
                className="flex-1 h-[40px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              <input type="number" value={item.price} onChange={e => updateItem(item.id, "price", e.target.value)}
                placeholder="0"
                className="w-[100px] h-[40px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              <button onClick={() => removeItem(item.id)} className="shrink-0 p-1.5 rounded-full"
                style={{ backgroundColor: items.length === 1 ? "transparent" : "rgba(255,100,100,0.1)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke={items.length === 1 ? "transparent" : "#ff6464"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="rounded-[16px] p-4 flex items-center justify-between border border-[rgba(78,222,163,0.2)]"
          style={{ backgroundColor: "rgba(78,222,163,0.06)" }}>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text2)" }}>
            {L(lang, "Total", "Total")}
          </p>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] text-[#4edea3]">
            {formatRupiah(total)}
          </p>
        </div>

        {/* Save Button */}
        {saved ? (
          <div className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2 bg-[#4edea3]">
            <svg className="w-5 h-5 text-[#003824]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[15px] text-[#003824]">
              {L(lang, "Tersimpan!", "Saved!")}
            </span>
          </div>
        ) : (
          <button onClick={handleSave}
            className="w-full h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[15px] text-[#003824] active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
            {L(lang, "Simpan Struk", "Save Receipt")} · {formatRupiah(total)}
          </button>
        )}
      </div>
    </div>
  );
}
