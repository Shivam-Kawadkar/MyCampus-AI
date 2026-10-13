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

export const StatusBadge: React.FC<{ status: RegistrationStatus; className?: string }> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'registered':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1A1D19] text-[#C6FF3D] border border-[#353830]', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D] shadow-[0_0_6px_#C6FF3D]"></span>
          Registered
        </span>
      );
    case 'waitlisted':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1A1D19] text-[#FF7138] border border-[#353830]', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7138] shadow-[0_0_6px_#FF7138]"></span>
          Waitlisted
        </span>
      );
    case 'attended':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#22251F] text-[#A5A89F] border border-[#353830]', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#777C72]"></span>
          Attended
        </span>
      );
    case 'saved':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1A1D19] text-[#C6FF3D] border border-[#353830]', className)}>
          Saved
        </span>
      );
    default:
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#151713] text-[#777C72] border border-[#353830]', className)}>
          Available
        </span>
      );
  }
};
