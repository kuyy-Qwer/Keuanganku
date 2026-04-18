import React from 'react';
import { motion } from 'motion/react';

interface CompletionCardProps {
  title: string;
  subtitle: string;
  expReward: number;
  levelUp?: string;
  onContinue: () => void;
}

export default function CompletionCard({ title, subtitle, expReward, levelUp, onContinue }: CompletionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[32px] border p-6 text-center green-shadow"
      style={{
        background: 'linear-gradient(135deg, rgba(78,222,163,0.08), rgba(251,191,36,0.05))',
        borderColor: 'rgba(78,222,163,0.2)',
      }}
    >
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#4edea3', '#fbbf24', '#60a5fa'][i % 3],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              repeat: 0,
            }}
          />
        ))}
      </div>

      {/* Icon */}
      <div className="relative mb-4">
        <div className="h-20 w-20 mx-auto rounded-full flex items-center justify-center text-3xl"
          style={{
            background: 'linear-gradient(135deg, #4edea3, #fbbf24)',
            color: '#083626',
          }}>
          🎉
        </div>
      </div>

      {/* Title */}
      <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-2 text-green-600">
        {title}
      </h2>
      
      {/* Subtitle */}
      <p className="text-sm mb-6" style={{ color: 'var(--app-text2)' }}>
        {subtitle}
      </p>

      {/* EXP Reward */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(78,222,163,0.15))',
            border: '1px solid rgba(251,191,36,0.2)',
          }}>
          <span className="text-lg">⭐</span>
          <span className="font-bold text-yellow-600">+{expReward} EXP</span>
          <span className="text-xs" style={{ color: 'var(--app-text2)' }}>didapatkan!</span>
        </div>
        
        {levelUp && (
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: 'rgba(78,222,163,0.1)',
              border: '1px solid rgba(78,222,163,0.2)',
            }}>
            <span className="text-sm">📈</span>
            <span className="text-sm font-semibold text-green-600">{levelUp}</span>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full rounded-[24px] py-4 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
          color: '#083626',
          boxShadow: '0 18px 40px rgba(78,222,163,0.28)',
        }}
      >
        Masuk ke Dashboard
      </button>

      {/* Celebration Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-xs" 
        style={{ color: 'var(--app-text2)' }}
      >
        Selamat! Perjalanan finansial Anda dimulai sekarang 🚀
      </motion.p>
    </motion.div>
  );
}