'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    } catch {}
    onClick?.(e);
  };

  const variants = {
    primary:
      'bg-gradient-to-b from-ruby-800 to-ruby-950 text-pearl border border-ruby-700/40 hover:from-ruby-700 hover:to-ruby-900',
    secondary:
      'bg-obsidian text-pearl border border-ruby-800/35 hover:border-ruby-700/50',
    ghost:
      'bg-transparent text-ash hover:text-pearl hover:bg-white/[0.04]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-11 px-4 text-sm rounded-xl',
    lg: 'h-12 px-5 text-base rounded-xl',
  };

  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...(props as Record<string, unknown>)}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </motion.button>
  );
}
