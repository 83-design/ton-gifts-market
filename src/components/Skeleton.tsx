'use client';

interface SkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'row';
  className?: string;
}

export function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div
        className={`rounded-xl overflow-hidden border border-white/[0.06] bg-obsidian ${className}`}
      >
        <div className="aspect-square skeleton" />
        <div className="p-2.5 space-y-2">
          <div className="h-3 w-1/2 rounded skeleton" />
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="h-4 w-1/3 rounded skeleton" />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={`w-10 h-10 rounded-full skeleton ${className}`} />;
  }

  if (variant === 'row') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-obsidian ${className}`}>
        <div className="w-11 h-11 rounded-lg skeleton shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded skeleton" />
          <div className="h-3 w-1/3 rounded skeleton" />
        </div>
        <div className="h-4 w-16 rounded skeleton" />
      </div>
    );
  }

  return <div className={`h-4 rounded skeleton ${className}`} />;
}
