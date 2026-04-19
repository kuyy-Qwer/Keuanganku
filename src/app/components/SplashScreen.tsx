import { useEffect, useState } from "react";
import AppLogo from "./AppLogo";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    // enter: 600ms → hold: 900ms → exit: 500ms → done
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 1500);
    const t3 = setTimeout(() => onDone(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none"
      style={{
        background: "linear-gradient(135deg, #0b1326 0%, #0f1e3a 50%, #0b1326 100%)",
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "scale(1.04)" : "scale(1)",
        transition: phase === "exit"
          ? "opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)"
          : "none",
        pointerEvents: "none",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute rounded-full blur-[120px] pointer-events-none"
        style={{
          width: 320, height: 320,
          top: "15%", left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(78,222,163,0.18) 0%, transparent 70%)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 0.8s ease",
        }}
      />
      <div
        className="absolute rounded-full blur-[80px] pointer-events-none"
        style={{
          width: 200, height: 200,
          bottom: "20%", right: "10%",
          background: "radial-gradient(circle, rgba(4,180,162,0.12) 0%, transparent 70%)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 1s ease 0.2s",
        }}
      />

      {/* Logo container */}
      <div
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.7) translateY(20px)" : "scale(1) translateY(0)",
          transition: "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        className="flex flex-col items-center gap-5"
      >
        {/* Icon */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 88, height: 88 }}
        >
          {/* Outer ring pulse */}
          <div
            className="absolute inset-0 rounded-[28px]"
            style={{
              background: "rgba(78,222,163,0.12)",
              boxShadow: "0 0 0 0 rgba(78,222,163,0.4)",
              animation: phase === "hold" ? "splashPulse 1.4s ease-out infinite" : "none",
            }}
          />
          {/* Icon box */}
          <div
            className="relative flex items-center justify-center rounded-[28px]"
            style={{
              width: 80, height: 80,
              background: "linear-gradient(135deg, #4edea3 0%, #04b4a2 100%)",
              boxShadow: "0 20px 60px rgba(78,222,163,0.45), 0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <span style={{ fontSize: 38, lineHeight: 1 }}>💎</span>
          </div>
        </div>

        {/* App name */}
        <div className="flex flex-col items-center gap-1.5">
          <p
            className="font-['Plus_Jakarta_Sans'] font-extrabold tracking-[-0.5px]"
            style={{
              fontSize: 32,
              color: "#dae2fd",
              letterSpacing: "-0.5px",
            }}
          >
            Luminary
          </p>
          <p
            className="font-['Inter'] font-medium"
            style={{ fontSize: 13, color: "#4edea3", letterSpacing: "0.08em" }}
          >
            Finance
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 6, height: 6,
                backgroundColor: "#4edea3",
                opacity: phase === "hold" ? 1 : 0,
                animation: phase === "hold"
                  ? `splashDot 1.2s ease-in-out ${i * 0.18}s infinite`
                  : "none",
                transition: "opacity 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Tagline */}
      <p
        className="absolute font-['Inter'] font-medium"
        style={{
          bottom: "10%",
          fontSize: 11,
          color: "rgba(148,163,184,0.5)",
          letterSpacing: "0.12em",
          opacity: phase === "hold" ? 1 : 0,
          transition: "opacity 0.6s ease 0.4s",
        }}
      >
        Kelola keuangan lebih cerdas
      </p>

      <style>{`
        @keyframes splashPulse {
          0%   { box-shadow: 0 0 0 0 rgba(78,222,163,0.35); }
          70%  { box-shadow: 0 0 0 18px rgba(78,222,163,0); }
          100% { box-shadow: 0 0 0 0 rgba(78,222,163,0); }
        }
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
