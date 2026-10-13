import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Clock, 
  Sparkles, 
  Compass, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle,
  Zap
} from 'lucide-react';
import { MyCampusLogo } from '../common/MyCampusLogo';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { NavigationPage } from '../../types';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, registeredEvents, profile, setIsAddEventModalOpen } = useEvents();
  const { user, navigate } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleNavClick = (pageId: NavigationPage) => {
    setActivePage(pageId);
    navigate(`/${pageId}`);
  };

  const navItems: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; isAi?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-events', label: 'My Events', icon: CalendarCheck2, badge: registeredEvents.length || undefined },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'ai-importer', label: 'AI Importer', icon: Sparkles, badge: 'AI', isAi: true },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[#353830] bg-[#151713] transition-all duration-300 ease-in-out relative z-30 select-none h-screen sticky top-0',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#353830]">
        <div 
          className="flex items-center cursor-pointer overflow-hidden group min-w-0" 
          onClick={() => handleNavClick('dashboard')}
        >
          <MyCampusLogo 
            size="sm" 
            iconOnly={collapsed} 
            showSubtitle={!collapsed} 
            subtitle="Event Journey"
          />
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-[#777C72] hover:text-[#F3F0E8] hover:bg-[#22251F] transition-colors',
            collapsed && 'mx-auto'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => setIsAddEventModalOpen(true)}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl bg-[#C6FF3D] text-[#111311] font-semibold tracking-tight hover:bg-[#C6FF3D]/90 active:scale-[0.98] transition-all shadow-card focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]',
            collapsed ? 'h-10 w-10 p-0 mx-auto' : 'py-2 px-3 text-xs'
          )}
          title="Add Event"
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
          {!collapsed && <span>Add Event</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className={cn('px-2 py-1 text-[11px] font-medium text-[#777C72]', collapsed && 'hidden')}>
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center rounded-xl text-xs font-medium transition-all group relative border',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-[#22251F] text-[#C6FF3D] border-[#353830] font-semibold'
                  : 'text-[#A5A89F] border-transparent hover:text-[#F3F0E8] hover:bg-[#1A1D19]'
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#C6FF3D] rounded-r" />
              )}

              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-[#C6FF3D]' : 'text-[#777C72] group-hover:text-[#A5A89F]'
                )}
              />

              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!collapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-mono',
                    item.isAi
                      ? 'bg-[#C6FF3D] text-[#111311] font-bold'
                      : isActive
                      ? 'bg-[#151713] text-[#C6FF3D] border border-[#353830]'
                      : 'bg-[#1A1D19] text-[#777C72] border border-[#353830]'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#353830] bg-[#151713]">
        <div 
          onClick={() => handleNavClick('settings')}
          className={cn(
            'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#1A1D19] cursor-pointer transition-colors border border-transparent hover:border-[#353830]',
            collapsed && 'justify-center p-1'
          )}
          title="Student Settings"
        >
          <img
            src={user?.avatar_url || profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
            alt={user?.name || profile?.name || 'User'}
            className="w-8 h-8 rounded-lg object-cover border border-[#353830] flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F3F0E8] truncate">
                {user?.name || profile?.name || 'Jordan Lee'}
              </p>
              <p className="text-[11px] text-[#C6FF3D] font-mono truncate">
                {user?.role_title || profile?.studentId || 'Campus Explorer'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
