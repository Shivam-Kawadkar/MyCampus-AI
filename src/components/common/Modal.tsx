import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed solid dark backdrop */}
      <div 
        className="fixed inset-0 bg-[#111311]/85 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal command card */}
      <div 
        className={cn(
          'relative w-full bg-[#1A1D19] rounded-2xl shadow-modal border border-[#353830] overflow-hidden transform transition-all duration-200 z-10 my-auto flex flex-col max-h-[90vh]',
          maxWidthClasses[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#353830] bg-[#151713] sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D]" />
                {title && <h3 className="text-base sm:text-lg font-bold text-[#F3F0E8] font-heading tracking-tight">{title}</h3>}
              </div>
              {subtitle && <p className="text-xs text-[#A5A89F] mt-1 ml-3.5 leading-relaxed">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1 text-[#777C72] hover:text-[#F3F0E8] hover:bg-[#22251F] rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto text-[#F3F0E8]">
          {children}
        </div>
      </div>
    </div>
  );
};
