'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxHeight?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = '85vh',
}: BottomSheetProps) {
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
        try {
          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
        } catch {}
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      try {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
      } catch {}
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden max-w-lg mx-auto"
            style={{
              backgroundColor: 'rgba(14, 10, 11, 0.96)',
              backdropFilter: 'blur(20px)',
              maxHeight,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {title && (
              <div className="px-5 pb-3 border-b border-white/[0.07]">
                <h2 className="text-base font-semibold text-pearl">{title}</h2>
              </div>
            )}
            <div
              className="overflow-y-auto overscroll-contain safe-area-pb"
              style={{ maxHeight: `calc(${maxHeight} - 60px)` }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
