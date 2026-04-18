import { useState } from "react";
import { addTransaction, getCategories, formatRupiah, type Category } from "../../app/store/database";
import { playAlertSound } from "../../app/lib/sounds";
import { crudSuccess } from "../../app/lib/notify";
import { useLang } from "../../app/i18n";

interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface InvoiceInputProps {
  onClose?: () => void;
}

export default function InvoiceInput({ onClose }: InvoiceInputProps) {
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), name: "", qty: 1, price: 0 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredCats = categories.filter(c => c.type === "expense" || c.type === "both");

  const subtotal = items.reduce((s, item) => s + (item.qty * item.price), 0);

  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: "", qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirm = () => {
    if (!selectedCategory) {
      setError(L("Pilih kategori dulu", "Select category first"));
      playAlertSound();
      return;
    }

    const validItems = items.filter(i => i.name.trim() && i.price > 0);
    if (validItems.length === 0) {
      setError(L("Tambah minimal 1 item", "Add at least 1 item"));
      playAlertSound();
      return;
    }

    if (subtotal < 1000) {
      setError("Nominal minimal " + formatRupiah(1000));
      playAlertSound();
      return;
    }

    addTransaction({
      amount: subtotal,
      category: selectedCategory,
      notes: notes + (validItems.length > 1 ? ` (${validItems.length} items)` : ""),
      type: "expense",
      paymentSource: { type: "cash", label: "Cash" },
    });

    void crudSuccess();
    setShowSuccess(true);
    setTimeout(() => {
      onClose?.();
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="relative w-full" onClick={e => e.stopPropagation()}>
        <div className="rounded-t-[40px] border-t p-10 flex flex-col items-center gap-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="bg-[rgba(78,222,163,0.15)] rounded-full size-20 flex items-center justify-center">
            <span className="text-[40px]">✅</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[18px]" style={{ color: "var(--app-text)" }}>
            {L("Berhasil!", "Success!")}
          </p>
          <p className="font-['Inter'] text-[14px]" style={{ color: "var(--app-text2)" }}>
            {formatRupiah(subtotal)} {L("ditambahkan", "added")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="rounded-t-[40px] border-t p-5 flex-1 overflow-y-auto"
        style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
            {L("Input Invoice", "Invoice Input")}
          </h2>
          <button onClick={() => setNotes("")} className="text-[12px] text-[#64748b]">
            {L("Clear", "Clear")}
          </button>
        </div>

        {/* Barcode Scanner Button */}
        <button className="w-full mb-4 py-3 rounded-[16px] border border-dashed flex items-center justify-center gap-2"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card2)" }}>
          <span className="text-[20px]">📷</span>
          <span className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
            {L("Scan Barcode / QR", "Scan Barcode / QR")}
          </span>
        </button>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  value={item.name}
                  onChange={e => handleItemChange(item.id, "name", e.target.value)}
                  placeholder={L(`Item ${idx + 1}`, `Item ${idx + 1}`)}
                  className="w-full h-[40px] px-3 rounded-[10px] text-[13px] outline-none"
                  style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                />
              </div>
              <input
                type="number"
                value={item.qty || ""}
                onChange={e => handleItemChange(item.id, "qty", parseInt(e.target.value) || 0)}
                className="w-[50px] h-[40px] px-2 rounded-[10px] text-[13px] text-center outline-none"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
              />
              <input
                type="number"
                value={item.price || ""}
                onChange={e => handleItemChange(item.id, "price", parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-[90px] h-[40px] px-2 rounded-[10px] text-[13px] text-right outline-none"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
              />
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="size-8 rounded-full flex items-center justify-center text-[#ff6464]"
                style={{ backgroundColor: "rgba(255,100,100,0.1)" }}>
                <span className="text-[16px]">×</span>
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleAddItem} className="w-full py-2 rounded-[12px] mb-4 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
          <span className="text-[16px]">+</span>
          <span className="text-[12px] font-['Inter']">{L("Tambah Item", "Add Item")}</span>
        </button>

        {/* Category */}
        <div className="mb-4">
          <p className="text-[11px] font-['Inter'] uppercase tracking-wider mb-2" style={{ color: "var(--app-text2)" }}>
            {L("Kategori", "Category")}
          </p>
          <div className="flex gap-2 flex-wrap">
            {filteredCats.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className="px-3 py-1.5 rounded-full text-[11px] font-['Inter'] font-semibold transition-all"
                style={{
                  backgroundColor: selectedCategory === cat.id ? "#10B981" : "var(--app-card2)",
                  color: selectedCategory === cat.id ? "#fff" : "var(--app-text2)",
                }}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <p className="text-[11px] font-['Inter'] uppercase tracking-wider mb-2" style={{ color: "var(--app-text2)" }}>
            {L("Catatan", "Notes")}
          </p>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={L("Opsional...", "Optional...")}
            className="w-full h-[40px] px-3 rounded-[10px] text-[13px] outline-none"
            style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-[12px] text-[#ff6464] mb-3 font-['Inter']">{error}</p>
        )}
      </div>

      {/* Footer with Total */}
      <div className="p-5 border-t"
        style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
            {L("Total", "Total")}
          </span>
          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[24px]" style={{ color: "var(--app-text)" }}>
            {formatRupiah(subtotal)}
          </span>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
            style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
            {L("Batal", "Cancel")}
          </button>
          <button onClick={handleConfirm}
            className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#003824]"
            style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
            {L("Simpan", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}