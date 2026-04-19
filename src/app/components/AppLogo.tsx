/**
 * AppLogo — Logo Keuanganku yang konsisten di seluruh aplikasi.
 * Menggunakan SVG inline agar tidak perlu request file tambahan.
 * Sudut tumpul sesuai permintaan.
 */

interface AppLogoProps {
  size?: number;
  /** dark = background gelap (untuk splash/login), light = background terang */
  variant?: 'dark' | 'light' | 'transparent';
  className?: string;
}

export default function AppLogo({ size = 72, variant = 'dark', className = '' }: AppLogoProps) {
  const bg = variant === 'dark'
    ? '#0b1326'
    : variant === 'light'
    ? '#f0f4ff'
    : 'transparent';

  const radius = Math.round(size * 0.215); // ~22% untuk sudut tumpul

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Background dengan sudut tumpul */}
      {variant !== 'transparent' && (
        <rect width="512" height="512" rx={radius * (512 / size)} fill={bg} />
      )}

      {/* Glow subtle */}
      {variant === 'dark' && (
        <circle cx="256" cy="210" r="170" fill="url(#bgGlowL)" opacity="0.2" />
      )}

      {/* Panah hijau melengkung (bawah) */}
      <path
        d="M 88 345 Q 256 468 424 345"
        stroke="#22c55e"
        strokeWidth="34"
        fill="none"
        strokeLinecap="round"
      />
      {/* Ujung panah kanan */}
      <polygon points="424,312 456,358 392,362" fill="#22c55e" />

      {/* Tumpukan uang hijau */}
      {/* Lembar belakang */}
      <rect
        x="130" y="238" width="138" height="86" rx="11"
        fill="#15803d"
        transform="rotate(-8 199 281)"
      />
      {/* Lembar tengah */}
      <rect
        x="135" y="243" width="138" height="86" rx="11"
        fill="#16a34a"
        transform="rotate(-3 204 286)"
      />
      {/* Lembar depan */}
      <rect x="140" y="248" width="138" height="86" rx="11" fill="#4ade80" />
      {/* Garis dekorasi */}
      <rect x="156" y="268" width="96" height="7" rx="3.5" fill="#15803d" opacity="0.55" />
      <rect x="156" y="283" width="72" height="7" rx="3.5" fill="#15803d" opacity="0.55" />
      {/* Simbol dollar */}
      <circle cx="205" cy="291" r="20" fill="#15803d" opacity="0.7" />
      <text
        x="205" y="298"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, sans-serif"
      >$</text>

      {/* Bar chart biru — 3 batang naik */}
      <rect x="228" y="196" width="40" height="126" rx="9" fill="url(#b1)" />
      <rect x="278" y="148" width="40" height="174" rx="9" fill="url(#b2)" />
      <rect x="328" y="100" width="40" height="222" rx="9" fill="url(#b3)" />

      {/* Highlight putih (efek 3D) */}
      <rect x="232" y="200" width="13" height="65" rx="5" fill="white" opacity="0.22" />
      <rect x="282" y="152" width="13" height="85" rx="5" fill="white" opacity="0.22" />
      <rect x="332" y="104" width="13" height="110" rx="5" fill="white" opacity="0.22" />

      <defs>
        <radialGradient id="bgGlowL" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4edea3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="b1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="b2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="b3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
