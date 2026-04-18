import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'button' | 'circle';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  if (type === 'card') {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className={`rounded-[24px] animate-pulse ${className}`}
            style={{
              backgroundColor: 'rgba(78, 222, 163, 0.1)',
              height: '120px',
            }}
          />
        ))}
      </>
    );
  }
  
  if (type === 'text') {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className={`rounded-[8px] animate-pulse ${className}`}
            style={{
              backgroundColor: 'rgba(78, 222, 163, 0.1)',
              height: '16px',
              width: i % 2 === 0 ? '80%' : '60%',
            }}
          />
        ))}
      </>
    );
  }
  
  if (type === 'button') {
    return (
      <div
        className={`rounded-[24px] animate-pulse ${className}`}
        style={{
          backgroundColor: 'rgba(78, 222, 163, 0.1)',
          height: '56px',
        }}
      />
    );
  }
  
  if (type === 'circle') {
    return (
      <div
        className={`rounded-full animate-pulse ${className}`}
        style={{
          backgroundColor: 'rgba(78, 222, 163, 0.1)',
          height: '40px',
          width: '40px',
        }}
      />
    );
  }
  
  return null;
}