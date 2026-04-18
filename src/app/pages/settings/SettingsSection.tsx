import React from "react";

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[11px] tracking-[2px] text-[#64748b] uppercase mb-3 px-1">{title}</p>
      <div className="bg-[#171f33] rounded-[24px] border border-white/5 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

interface SettingsButtonProps {
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
  divider?: boolean;
}

export function SettingsButton({ icon, label, onClick, divider }: SettingsButtonProps) {
  return (
    <>
      <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 active:scale-[0.98] transition-all group">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-[18px] group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white">{label}</span>
        </div>
        <svg className="w-4 h-4 text-[#64748b] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {divider && <div className="mx-4 h-[1px] bg-white/5" />}
    </>
  );
}
