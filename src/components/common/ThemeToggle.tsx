import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeId } from '../../types/theme';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, variant = 'compact' }) => {
  const { theme, currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemePreviewDot = (themeId: ThemeId) => {
    switch (themeId) {
      case 'midnight-pulse':
        return '#C6FF3D';
      case 'clean-light':
        return '#1E5E2E';
      case 'graphite-ember':
        return '#FF6B35';
      case 'warm-sand':
        return '#B34B28';
      default:
        return '#C6FF3D';
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 p-2 rounded-xl text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] transition-all border border-transparent hover:border-[#353830] focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]',
          variant === 'full' && 'px-3 py-1.5 text-xs'
        )}
        title={`Current Theme: ${currentTheme.name}`}
        aria-label="Change Theme"
      >
        {currentTheme.mode === 'light' ? (
          <Sun className="w-4 h-4 text-[#FF7138] transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-[#C6FF3D] transition-transform hover:-rotate-12" />
        )}
        {variant === 'full' && (
          <span className="hidden sm:inline font-mono text-[11px] font-medium text-[#F3F0E8]">
            {currentTheme.name}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1A1D19] border border-[#353830] shadow-modal py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-[#22251F] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#777C72]">
              Select Theme
            </span>
          </div>

          <div className="space-y-0.5 px-1.5">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              const accentColor = getThemePreviewDot(t.id);

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors',
                    isSelected
                      ? 'bg-[#22251F] text-[#C6FF3D] font-semibold border border-[#353830]'
                      : 'text-[#F3F0E8] hover:bg-[#22251F]/60'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="text-left">
                      <div className="leading-snug">{t.name}</div>
                      <div className="text-[10px] text-[#777C72] font-mono leading-none capitalize">
                        {t.mode} mode
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
