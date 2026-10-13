import React from 'react';
import { CalendarX, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = CalendarX,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#353830] bg-[#1A1D19]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#22251F] border border-[#353830] flex items-center justify-center text-[#777C72] mb-4">
        <Icon className="w-5 h-5 stroke-[1.75]" />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-[#F3F0E8] font-heading mb-1.5">{title}</h4>
      <p className="text-xs text-[#A5A89F] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C6FF3D] text-[#111311] text-xs sm:text-sm font-bold tracking-tight hover:bg-[#C6FF3D]/90 transition-all shadow-card focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
