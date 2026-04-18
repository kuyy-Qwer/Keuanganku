import React from 'react';
import { motion } from 'motion/react';

interface OnboardingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  withBorder?: boolean;
  withShadow?: boolean;
}

export default function OnboardingCard({ 
  children, 
  className = '', 
  delay = 0,
  withBorder = true,
  withShadow = true 
}: OnboardingCardProps) {
  return (
    <motion.div
      className={`rounded-2xl p-5 ${withBorder ? 'green-border' : ''} ${withShadow ? 'green-shadow' : ''} ${className}`}
      style={{ 
        backgroundColor: 'var(--app-card)',
        borderColor: withBorder ? 'rgba(78, 222, 163, 0.2)' : 'transparent'
      }}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: delay * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
  highlight?: boolean;
}

export function FeatureCard({ icon, title, description, delay = 0, highlight = false }: FeatureCardProps) {
  return (
    <motion.div
      className={`rounded-xl p-4 ${highlight ? 'green-gradient-card' : ''}`}
      style={{ 
        backgroundColor: highlight ? 'rgba(78, 222, 163, 0.05)' : 'var(--app-card2)',
        border: '1px solid rgba(78, 222, 163, 0.1)'
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.25, 
        delay: delay * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${highlight ? 'bg-green-500/20' : 'bg-green-400/10'}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-sm ${highlight ? 'text-green-600' : 'text-green-500'}`}>
            {title}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--app-text2)' }}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface StepIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function StepIndicator({ current, total, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index < current 
              ? 'bg-green-500 w-6' 
              : 'bg-green-200 w-3'
          }`}
        />
      ))}
      <span className="text-xs font-medium ml-2 text-green-600">
        {current}/{total}
      </span>
    </div>
  );
}