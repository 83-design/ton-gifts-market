'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export function Input({
  label,
  error,
  suffix,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-medium text-ash">{label}</label>
      )}
      <div className="relative flex items-center">
        <input
          className={cn(
            'w-full h-11 px-3.5 rounded-xl bg-obsidian text-pearl text-sm placeholder:text-ash/60',
            'border border-white/[0.07] focus:border-ruby-800/60 focus:outline-none transition-colors tabular-nums',
            suffix && 'pr-14',
            error && 'border-ruby-700',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-xs font-semibold text-ash pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-ruby-700">{error}</p>}
    </div>
  );
}
