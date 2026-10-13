import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEvents } from '../../context/EventContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEvents();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#C6FF3D] flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-[#FF7138] flex-shrink-0" />,
          info: <Info className="w-4 h-4 text-[#C6FF3D] flex-shrink-0" />,
        };

        const borderStyles = {
          success: 'border-[#353830] border-l-2 border-l-[#C6FF3D]',
          error: 'border-[#353830] border-l-2 border-l-[#FF7138]',
          info: 'border-[#353830] border-l-2 border-l-[#C6FF3D]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl bg-[#1A1D19] text-[#F3F0E8] shadow-card ${borderStyles[toast.type]} transition-all transform animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <span className="text-xs sm:text-sm font-medium font-sans">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#777C72] hover:text-[#F3F0E8] p-1 rounded-md hover:bg-[#22251F] transition-colors ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
