import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search events, topics, or clubs...',
  className,
}) => {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-[#777C72] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-all shadow-card"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-0.5 text-[#777C72] hover:text-[#F3F0E8] rounded-md hover:bg-[#22251F] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
