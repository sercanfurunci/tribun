import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    // Outer: covers viewport, scrollable so tall modals don't clip at top
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centering wrapper — min-h-full pushes content to center */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        {/* Panel */}
        <div
          className={clsx(
            'relative w-full bg-white border border-[#D9D4CC] rounded-lg shadow-xl',
            'flex flex-col',
            'max-h-[calc(100vh-2rem)]',
            sizes[size]
          )}
        >
          {/* Header — always visible, never scrolls */}
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DE] shrink-0">
              <h2 className="font-heading font-black text-base text-[#111111]">{title}</h2>
              <button
                onClick={onClose}
                className="size-7 rounded flex items-center justify-center text-[#999390] hover:text-[#111111] hover:bg-[#F2EFE9] transition-colors duration-150"
                aria-label="Kapat"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content — scrollable if too tall */}
          <div className="overflow-y-auto px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
