import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import AppLogo from '../../components/AppLogo';

export default function SplashIntroPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/welcome', { replace: true });
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    /* Full-screen, portrait-locked, max 390px centered — feels native on phone */
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #071a10 0%, #0b2318 45%, #071a10 100%)' }}
    >
      {/* ── Ambient orbs ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 340, height: 340,
          background: 'radial-gradient(circle, rgba(78,222,163,0.22) 0%, transparent 70%)',
          top: '-80px', left: '-100px',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.35, 0.22] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(0,180,162,0.18) 0%, transparent 70%)',
          bottom: '-60px', right: '-80px',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(78,222,163,0.12) 0%, transparent 70%)',
          top: '42%', right: '8%',
          filter: 'blur(40px)',
        }}
        animate={{ y: [0, -24, 0], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />

      {/* ── Content — constrained to phone width ── */}
      <div className="relative z-10 w-full max-w-[390px] mx-auto flex flex-col items-center justify-center min-h-screen px-8 text-center">

        {/* App icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mb-10"
        >
          <AppLogo size={96} variant="dark" />
        </motion.div>

        {/* App name */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="font-['Plus_Jakarta_Sans'] font-semibold text-xs uppercase tracking-[0.35em] mb-5"
          style={{ color: 'rgba(78,222,163,0.75)' }}
        >
          Keuanganku
        </motion.p>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-['Plus_Jakarta_Sans'] font-black leading-[1.08] mb-6"
          style={{ fontSize: '40px', color: '#ffffff', letterSpacing: '-0.5px' }}
        >
          Bangun{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #4edea3 0%, #00e5c8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Masa Depan
          </span>
          <br />Finansial
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="text-[15px] leading-[1.65] max-w-[260px]"
          style={{ color: 'rgba(218,226,253,0.6)' }}
        >
          Mulai perjalanan keuangan yang lebih terarah, terencana, dan bermakna.
        </motion.p>

        {/* Breathing dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-2.5 mt-14"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ width: 7, height: 7, backgroundColor: 'rgba(78,222,163,0.45)' }}
              animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.35, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.32, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Bottom progress bar ── */}
      <motion.div
        className="absolute bottom-0 left-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #4edea3, #00b4a2)' }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </div>
  );
}
