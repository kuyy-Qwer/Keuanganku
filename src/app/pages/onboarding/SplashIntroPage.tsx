import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export default function SplashIntroPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/welcome', { replace: true });
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0b1326 0%, #0d1f18 50%, #0b1326 100%)' }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="absolute rounded-full blur-[120px] pointer-events-none"
        style={{ width: 320, height: 320, background: 'rgba(78,222,163,0.18)', top: '-60px', left: '-80px' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px] pointer-events-none"
        style={{ width: 260, height: 260, background: 'rgba(0,180,162,0.14)', bottom: '-40px', right: '-60px' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.14, 0.22, 0.14] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute rounded-full blur-[80px] pointer-events-none"
        style={{ width: 180, height: 180, background: 'rgba(78,222,163,0.1)', top: '40%', right: '10%' }}
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        {/* App icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mb-8"
        >
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-[0_20px_60px_rgba(78,222,163,0.35)]"
            style={{ background: 'linear-gradient(135deg, #4edea3, #00b4a2)' }}
          >
            <span className="text-5xl">💰</span>
          </div>
        </motion.div>

        {/* Tagline kecil */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-xs font-semibold uppercase tracking-[0.3em] mb-4"
          style={{ color: 'rgba(78,222,163,0.7)' }}
        >
          Keuanganku
        </motion.p>

        {/* Judul utama */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-['Plus_Jakarta_Sans'] font-black leading-[1.1] mb-5"
          style={{ fontSize: '38px', color: '#ffffff' }}
        >
          Bangun{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Masa Depan
          </span>
          {' '}Finansial
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="text-base leading-relaxed max-w-[280px]"
          style={{ color: 'rgba(218,226,253,0.65)' }}
        >
          Mulai perjalanan keuangan yang lebih terarah, terencana, dan bermakna.
        </motion.p>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex gap-2 mt-12"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ backgroundColor: 'rgba(78,222,163,0.4)', width: 6, height: 6 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 rounded-full"
        style={{ background: 'linear-gradient(90deg, #4edea3, #00b4a2)' }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </div>
  );
}
