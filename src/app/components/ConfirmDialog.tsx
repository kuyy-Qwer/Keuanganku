import { useEffect } from "react";
import { createPortal } from "react-dom";
import { playConfirmPromptSound } from "../lib/sounds";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    playConfirmPromptSound();
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[320px] rounded-[28px] p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: "var(--app-card)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Icon */}
        <div className={`size-14 mx-auto rounded-2xl flex items-center justify-center text-[28px]
          ${danger ? "bg-[rgba(255,107,107,0.12)]" : "bg-[rgba(78,222,163,0.12)]"}`}>
          {danger ? "🗑️" : "❓"}
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px] text-white">{title}</h3>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--app-text2)" }}>{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[14px] font-bold text-[13px] transition-all active:scale-95"
            style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-[14px] font-extrabold text-[13px] transition-all active:scale-95
              ${danger
                ? "bg-[#ff6b6b] text-white shadow-[0_4px_16px_rgba(255,107,107,0.3)]"
                : "bg-[#4edea3] text-[#003824] shadow-[0_4px_16px_rgba(78,222,163,0.3)]"
              }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
