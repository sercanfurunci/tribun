import { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — fade in, Emil: separate opacity transition */}
      <div
        className="absolute inset-0 backdrop-enter"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal panel — scale from 0.95 + opacity (Emil: nothing appears from nothing) */}
      {/* transform-origin: center — correct for modals per Emil (not anchored to a trigger) */}
      <div
        className={clsx(
          'relative w-full rounded-2xl shadow-2xl shadow-black/70 modal-enter',
          'border border-white/10 backdrop-blur-xl',
          sizes[size]
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(14,30,56,0.98) 0%, rgba(12,22,40,0.98) 100%)',
          transformOrigin: 'center',
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="text-sm font-bold text-white font-heading tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className={clsx(
                'size-8 rounded-lg flex items-center justify-center text-slate-500',
                'transition-[color,background-color] duration-150',
                'hover:text-white hover:bg-white/8',
                // Scale on press — Emil: pressable elements need feedback
                'active:scale-95',
              )}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
