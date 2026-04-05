import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[1.35rem] border border-white/70 bg-white/88 p-6 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)] backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/88 ${onClick ? 'cursor-pointer transition-shadow duration-200 hover:shadow-[0_20px_60px_-28px_rgba(15,23,42,0.38)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
