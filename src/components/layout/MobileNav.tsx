import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Clock, 
  Sparkles, 
  Compass, 
  Settings, 
  X, 
  Zap, 
  PlusCircle 
} from 'lucide-react';
import { MyCampusLogo } from '../common/MyCampusLogo';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { NavigationPage } from '../../types';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, registeredEvents, profile, setIsAddEventModalOpen } = useEvents();
  const { navigate } = useAuth();

  const navItems: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-events', label: 'My Events', icon: CalendarCheck2, badge: registeredEvents.length || undefined },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'ai-importer', label: 'AI Importer', icon: Sparkles, badge: 'AI' },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (page: NavigationPage) => {
    setActivePage(page);
    navigate(`/${page}`);
    onClose();
  };

  return (
    <>
      {/* Slide-over Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#111311]/85 transition-opacity"
            onClick={onClose}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-[#151713] border-r border-[#353830] h-full shadow-modal flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[#353830] flex items-center justify-between">
              <MyCampusLogo size="sm" showSubtitle subtitle="Event Journey" />
              <button
                onClick={onClose}
                className="p-1.5 text-[#777C72] hover:text-[#F3F0E8] rounded-lg hover:bg-[#22251F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add */}
            <div className="p-3">
              <button
                onClick={() => {
                  onClose();
                  setIsAddEventModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#C6FF3D] text-[#111311] font-semibold text-xs shadow-card"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Add Event</span>
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all border',
                      isActive
                        ? 'bg-[#22251F] text-[#C6FF3D] border-[#353830] font-semibold'
                        : 'text-[#A5A89F] border-transparent hover:text-[#F3F0E8] hover:bg-[#1A1D19]'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-[#C6FF3D]' : 'text-[#777C72]')} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1D19] text-[#C6FF3D] border border-[#353830]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer Profile */}
            <div className="p-4 border-t border-[#353830] bg-[#1A1D19]">
              <div className="flex items-center gap-3">
                <img
                  src={profile?.avatarUrl}
                  alt={profile?.name}
                  className="w-9 h-9 rounded-lg object-cover border border-[#353830]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#F3F0E8] truncate">{profile?.name}</p>
                  <p className="text-[11px] text-[#777C72] truncate">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#151713] border-t border-[#353830] px-2 py-2 flex items-center justify-around md:hidden shadow-modal">
        <button
          onClick={() => handleNavigate('dashboard')}
          className={cn(
            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors',
            activePage === 'dashboard' ? 'text-[#C6FF3D] font-medium' : 'text-[#777C72] hover:text-[#F3F0E8]'
          )}
        >
          <LayoutDashboard className="w-4 h-4 mb-1" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavigate('my-events')}
          className={cn(
            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors relative',
            activePage === 'my-events' ? 'text-[#C6FF3D] font-medium' : 'text-[#777C72] hover:text-[#F3F0E8]'
          )}
        >
          <CalendarCheck2 className="w-4 h-4 mb-1" />
          <span>My Events</span>
          {registeredEvents.length > 0 && (
            <span className="absolute top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-[#C6FF3D]" />
          )}
        </button>

        <button
          onClick={() => handleNavigate('ai-importer')}
          className={cn(
            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors',
            activePage === 'ai-importer' ? 'text-[#C6FF3D] font-medium' : 'text-[#777C72] hover:text-[#F3F0E8]'
          )}
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span>AI Import</span>
        </button>

        <button
          onClick={() => handleNavigate('timeline')}
          className={cn(
            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors',
            activePage === 'timeline' ? 'text-[#C6FF3D] font-medium' : 'text-[#777C72] hover:text-[#F3F0E8]'
          )}
        >
          <Clock className="w-4 h-4 mb-1" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => handleNavigate('discover')}
          className={cn(
            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors',
            activePage === 'discover' ? 'text-[#C6FF3D] font-medium' : 'text-[#777C72] hover:text-[#F3F0E8]'
          )}
        >
          <Compass className="w-4 h-4 mb-1" />
          <span>Discover</span>
        </button>
      </div>
    </>
  );
};
