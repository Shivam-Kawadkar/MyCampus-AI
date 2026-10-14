import React from 'react';
import { EventCategory, RegistrationStatus } from '../../types';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'neutral' | 'lime' | 'orange' | 'elevated' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles = {
    neutral: 'bg-[#1A1D19] text-[#A5A89F] border-[#353830]',
    lime: 'bg-[#22251F] text-[#C6FF3D] border-[#353830]',
    orange: 'bg-[#22251F] text-[#FF7138] border-[#353830]',
    elevated: 'bg-[#22251F] text-[#F3F0E8] border-[#353830]',
    outline: 'bg-transparent text-[#A5A89F] border-[#353830]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-normal',
    md: 'text-xs px-2.5 py-1 tracking-normal',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: EventCategory; className?: string; size?: 'sm' | 'md' }> = ({
  category,
  className,
  size = 'sm',
}) => {
  const categoryVariantMap: Record<EventCategory, BadgeProps['variant']> = {
    'Hackathon': 'lime',
    'Tech Talk': 'elevated',
    'Workshop': 'neutral',
    'Cultural': 'orange',
    'Career': 'lime',
    'Sports': 'elevated',
    'Academic': 'neutral',
  };

  return (
    <Badge variant={categoryVariantMap[category] || 'neutral'} size={size} className={className}>
      {category}
    </Badge>
  );
};

import { AlertTriangle } from 'lucide-react';

export const ConflictBadge: React.FC<{ className?: string; label?: string }> = ({
  className,
  label = 'Schedule Conflict',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#2A1512] text-[#FF7138] border border-[#5C231E] shadow-sm',
        className
      )}
      title="Overlaps with another event in your schedule"
    >
      <AlertTriangle className="w-3 h-3 text-[#FF7138] flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const DeadlineBadge: React.FC<{ isExpired: boolean; className?: string }> = ({
  isExpired,
  className,
}) => {
  if (isExpired) {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2A1810] text-[#FF7138] border border-[#5C2D1E]', className)}>
        Closed
      </span>
    );
  }
  return null;
};

export const StatusBadge: React.FC<{ 
  status: RegistrationStatus; 
  isDeadlineExpired?: boolean;
  className?: string; 
}> = ({
  status,
  isDeadlineExpired = false,
  className,
}) => {
  // If user is already registered, waitlisted, or attended, show their registration status.
  // We do not confuse event dates with registration deadlines or alter existing registration status.
  if (status === 'registered') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1A1D19] text-[#C6FF3D] border border-[#353830]', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D] shadow-[0_0_6px_#C6FF3D]"></span>
        Registered
      </span>
    );
  }
  if (status === 'waitlisted') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1A1D19] text-[#FF7138] border border-[#353830]', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7138] shadow-[0_0_6px_#FF7138]"></span>
        Waitlisted
      </span>
    );
  }
  if (status === 'attended') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#22251F] text-[#A5A89F] border border-[#353830]', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#777C72]"></span>
        Attended
      </span>
    );
  }

  // If not registered/saved and deadline has expired:
  if (isDeadlineExpired) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#2A1810] text-[#FF7138] border border-[#5C2D1E]', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7138]"></span>
        Registration Closed
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1A1D19] text-[#C6FF3D] border border-[#353830]', className)}>
        Saved
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#151713] text-[#777C72] border border-[#353830]', className)}>
      Available
    </span>
  );
};
