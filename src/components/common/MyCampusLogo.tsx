import React from 'react';
import { cn } from '../../lib/utils';

interface MyCampusLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  subtitle?: string;
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * MyCampus Official Brand Logo
 * 
 * Concept:
 * - Dynamic "M" integrated with an academic Calendar notebook & binder loops
 * - Graduation Mortarboard & Tassel crowning the right apex
 * - Discovery Sparkle star in the upper center valley
 * - 3D Orbital Swoosh ring encircling the event journey
 * - Theme-reactive: dynamically reflects active theme and custom accent colors
 */
export const MyCampusLogo: React.FC<MyCampusLogoProps> = ({
  className,
  iconOnly = false,
  size = 'md',
  showSubtitle = false,
  subtitle = 'Event Journey',
  interactive = true,
  onClick,
}) => {
  const sizeMap = {
    xs: { icon: 20, text: 'text-xs', sub: 'text-[9px]', gap: 'gap-1.5' },
    sm: { icon: 26, text: 'text-sm', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 34, text: 'text-base', sub: 'text-[11px]', gap: 'gap-2.5' },
    lg: { icon: 42, text: 'text-lg', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 54, text: 'text-2xl', sub: 'text-sm', gap: 'gap-3.5' },
    '2xl': { icon: 68, text: 'text-3xl', sub: 'text-base', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center select-none',
        currentSize.gap,
        onClick && 'cursor-pointer',
        interactive && 'group',
        className
      )}
    >
      {/* Vector Brandmark Symbol */}
      <div 
        className={cn(
          'relative flex-shrink-0 transition-transform duration-300',
          interactive && 'group-hover:scale-105'
        )}
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-sm"
        >
          <defs>
            {/* Primary Theme Accent Gradient */}
            <linearGradient id="mc-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-accent-primary, #C6FF3D)" />
              <stop offset="100%" stopColor="var(--theme-accent-secondary, #FF7138)" />
            </linearGradient>

            {/* Accent to Primary Gradient for Right Pillar */}
            <linearGradient id="mc-pillar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-accent-primary, #C6FF3D)" />
              <stop offset="70%" stopColor="var(--theme-accent-primary, #C6FF3D)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--theme-accent-secondary, #FF7138)" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing filter for orbital ring and star */}
            <filter id="mc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="var(--theme-accent-primary, #C6FF3D)" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* ============================================================== */}
          {/* 1. CALENDAR BINDER RINGS (Top)                                */}
          {/* ============================================================== */}
          <rect
            x="34"
            y="9"
            width="6"
            height="15"
            rx="3"
            fill="var(--theme-accent-primary, #C6FF3D)"
            className="transition-colors duration-200"
          />
          <rect
            x="49"
            y="9"
            width="6"
            height="15"
            rx="3"
            fill="var(--theme-accent-primary, #C6FF3D)"
            className="transition-colors duration-200"
          />

          {/* ============================================================== */}
          {/* 2. MAIN CALENDAR FRAME & "M" BODY                             */}
          {/* ============================================================== */}
          {/* Left Arch & Pillar */}
          <path
            d="M 23 27 C 23 20 28 16 35 16 L 59 16 C 62 16 64 18 64 21 L 64 25 C 64 27 62 29 59 29 L 36 29 C 34 29 33 30 33 32 L 33 67 C 33 69 31 71 29 71 L 27 71 C 25 71 23 69 23 67 Z"
            fill="var(--theme-text-primary, #F3F0E8)"
            className="transition-colors duration-200"
          />

          {/* Central 'M' Inner Fold (Diagonal Chevron) */}
          <path
            d="M 33 34 L 46 51 C 47.5 53 50.5 53 52 51 L 63 36 C 64 34.5 66 35 66 37 L 66 43 C 66 44.5 65 46 63.8 47.4 L 52 62 C 50 64.5 46.5 64.5 44.5 62 L 31.5 45 C 30.2 43.5 31 41 33 41 L 33 34 Z"
            fill="var(--theme-text-primary, #F3F0E8)"
            opacity="0.85"
            className="transition-colors duration-200"
          />

          {/* Right Pillar of the 'M' (Gradient Accent) */}
          <path
            d="M 64 31 L 73 31 C 75.2 31 77 32.8 77 35 L 77 67 C 77 69.2 75.2 71 73 71 L 68 71 C 65.8 71 64 69.2 64 67 Z"
            fill="url(#mc-pillar-grad)"
            className="transition-colors duration-200"
          />

          {/* ============================================================== */}
          {/* 3. GRADUATION CAP / MORTARBOARD (Top Right)                    */}
          {/* ============================================================== */}
          {/* Diamond Mortarboard Crown */}
          <path
            d="M 72 10 L 89 17.5 L 72 25 L 55 17.5 Z"
            fill="var(--theme-text-primary, #F3F0E8)"
            className="transition-colors duration-200"
          />

          {/* Skull Cap Underneath */}
          <path
            d="M 62 20.5 Q 72 26 82 20.5 L 82 24.5 Q 72 30 62 24.5 Z"
            fill="var(--theme-text-primary, #F3F0E8)"
            opacity="0.9"
            className="transition-colors duration-200"
          />

          {/* Button & Tassel hanging down the right */}
          <circle cx="72" cy="17.5" r="1.8" fill="var(--theme-accent-primary, #C6FF3D)" />
          <path
            d="M 72 17.5 C 79 18.5 84 21 85.5 25 L 85 33"
            stroke="var(--theme-accent-primary, #C6FF3D)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="85" cy="34" r="1.5" fill="var(--theme-accent-primary, #C6FF3D)" />

          {/* ============================================================== */}
          {/* 4. DISCOVERY SPARKLE / 4-POINT STAR (Center)                   */}
          {/* ============================================================== */}
          <path
            d="M 45 27 C 45 30.5 46.5 32 50 32 C 46.5 32 45 33.5 45 37 C 45 33.5 43.5 32 40 32 C 43.5 32 45 30.5 45 27 Z"
            fill="var(--theme-accent-primary, #C6FF3D)"
            filter="url(#mc-glow)"
            className="transition-colors duration-200"
          />

          {/* ============================================================== */}
          {/* 5. 3D ORBITAL SWOOSH RING (Encircling trajectory)              */}
          {/* ============================================================== */}
          {/* Background portion of the orbit (behind the M) */}
          <path
            d="M 23 52 C 16 54 13 58 15 62 C 17 65 24 67 33 67"
            stroke="var(--theme-accent-primary, #C6FF3D)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Foreground dynamic sweeping ring (in front of the M) */}
          <path
            d="M 15 60 C 13 63.5 22 69 42 68.5 C 64 68 83 60 88 47.5 C 89 45 87 43 85 44 C 79 48 64 56.5 45 58 C 28 59.5 17 58 15 60 Z"
            fill="url(#mc-accent-grad)"
            filter="url(#mc-glow)"
            className="transition-colors duration-200"
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
      {!iconOnly && (
        <div className="flex flex-col min-w-0 leading-none">
          <div className={cn('font-heading font-bold tracking-tight flex items-baseline', currentSize.text)}>
            <span 
              className="transition-colors duration-200"
              style={{ color: 'var(--theme-accent-primary, #C6FF3D)' }}
            >
              My
            </span>
            <span 
              className="text-[#F3F0E8] transition-colors duration-200"
            >
              Campus
            </span>
          </div>

          {showSubtitle && (
            <span className={cn('text-[#777C72] mt-1 font-mono tracking-wider uppercase truncate', currentSize.sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
