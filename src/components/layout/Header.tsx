import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  Plus, 
  Calendar, 
  Clock, 
  Sparkles, 
  Check, 
  ChevronDown, 
  User, 
  SlidersHorizontal,
  X,
  LogOut,
  RotateCcw,
  Users,
  Home
} from 'lucide-react';
import { MyCampusLogo } from '../common/MyCampusLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    unreadNotifCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    profile, 
    setIsAddEventModalOpen,
    setActivePage,
    events,
    openEventDetail,
    refreshData,
    showToast
  } = useEvents();

  const { user, logout, switchDemoUser, resetDemoData, navigate } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const matchingEvents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return events.filter((e) => {
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchVenue = (e.venue || '').toLowerCase().includes(q);
      const matchOrg = (e.organizer || '').toLowerCase().includes(q);
      const matchCat = (e.category || '').toLowerCase().includes(q);
      const matchDesc = (e.shortDescription || '').toLowerCase().includes(q);
      const matchTags = e.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchVenue || matchOrg || matchCat || matchDesc || matchTags;
    }).slice(0, 5);
  }, [events, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notifId: string, eventId?: string) => {
    markNotificationAsRead(notifId);
    if (eventId) {
      const targetEvent = events.find((e) => e.id === eventId);
      if (targetEvent) {
        openEventDetail(targetEvent);
        setIsNotifOpen(false);
      }
    }
  };

  const handleSwitchAccount = async (email: string) => {
    try {
      setIsProfileOpen(false);
      await switchDemoUser(email);
      showToast('Switched demo account', 'info');
    } catch (err) {
      showToast('Failed to switch account', 'error');
    }
  };

  const handleResetData = async () => {
    try {
      setIsProfileOpen(false);
      await resetDemoData();
      await refreshData();
      showToast('Demo data restored to initial state', 'success');
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
    }
  };

  const otherDemoAccounts = [
    { email: 'demo1@mycampus.demo', label: 'Demo 1: Campus Explorer' },
    { email: 'demo2@mycampus.demo', label: 'Demo 2: Event Organizer' },
    { email: 'demo3@mycampus.demo', label: 'Demo 3: AI Feature Tester' },
  ].filter((a) => a.email !== user?.email);

  return (
    <header className="h-16 bg-[#151713] border-b border-[#353830] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button
          onClick={onToggleMobileNav}
          className="p-2 text-[#A5A89F] hover:text-[#F3F0E8] rounded-lg hover:bg-[#22251F] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <MyCampusLogo size="xs" />
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#777C72] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsSearchOpen(false);
                setActivePage('discover');
              } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
              }
            }}
            placeholder="Search events, topics, or clubs..."
            className="w-full pl-10 pr-9 py-2 bg-[#1A1D19] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 p-1 text-[#777C72] hover:text-[#F3F0E8] rounded-md hover:bg-[#22251F]"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Quick Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D19] border border-[#353830] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-2.5 border-b border-[#2A2E26] flex items-center justify-between text-[11px] text-[#A5A89F]">
              <span>Results for "{searchQuery}"</span>
              <span className="font-mono text-[#C6FF3D] font-semibold">{matchingEvents.length} found</span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#2A2E26]/50">
              {matchingEvents.length > 0 ? (
                matchingEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => {
                      openEventDetail(evt);
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-[#22251F] transition-colors flex items-start gap-3 group"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#C6FF3D] mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-[#F3F0E8] group-hover:text-[#C6FF3D] transition-colors truncate">
                        {evt.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A5A89F]">
                        <span className="px-1.5 py-0.5 rounded bg-[#22251F] border border-[#353830] text-[10px] text-[#F3F0E8]">
                          {evt.category}
                        </span>
                        <span>{evt.startDate}</span>
                        <span>•</span>
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#A5A89F]">
                  No events found matching "{searchQuery}"
                </div>
              )}
            </div>

            <div className="p-2.5 bg-[#151713] border-t border-[#2A2E26] flex items-center justify-between">
              <span className="text-[10px] text-[#777C72]">Press Enter to open in Discover</span>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setActivePage('discover');
                }}
                className="text-xs text-[#C6FF3D] hover:underline font-medium"
              >
                View all in Discover →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Demo Role Indicator */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1A1D19] border border-[#353830] text-[11px] font-mono text-[#A5A89F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D]" />
            <span className="text-[#C6FF3D] font-semibold">{user.role_title}</span>
          </div>
        )}

        {/* Quick Add Event button */}
        <button
          onClick={() => setIsAddEventModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22251F] border border-[#353830] hover:border-[#C6FF3D] text-[#C6FF3D] text-xs font-medium transition-all shadow-card"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Event</span>
        </button>

        {/* Quick Theme Switcher */}
        <ThemeToggle variant="compact" />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C6FF3D] shadow-[0_0_6px_#C6FF3D]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1A1D19] rounded-2xl shadow-modal border border-[#353830] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-[#353830]">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-xs text-[#F3F0E8]">
                    Notifications
                  </span>
                  {unreadNotifCount > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#22251F] text-[#C6FF3D] border border-[#353830]">
                      {unreadNotifCount} new
                    </span>
                  )}
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#C6FF3D] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#22251F] py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#777C72]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id, notif.eventId)}
                      className={cn(
                        'px-4 py-3 hover:bg-[#22251F] cursor-pointer transition-colors flex gap-3 items-start',
                        !notif.read && 'bg-[#151713]'
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#22251F] border border-[#353830] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {notif.type === 'deadline' && <Clock className="w-3.5 h-3.5 text-[#FF7138]" />}
                        {notif.type === 'reminder' && <Calendar className="w-3.5 h-3.5 text-[#C6FF3D]" />}
                        {notif.type === 'ai' && <Sparkles className="w-3.5 h-3.5 text-[#C6FF3D]" />}
                        {notif.type === 'update' && <Bell className="w-3.5 h-3.5 text-[#A5A89F]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#F3F0E8] truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#777C72] whitespace-nowrap ml-2">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#A5A89F] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D] flex-shrink-0 mt-1.5 shadow-[0_0_6px_#C6FF3D]" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-[#353830] text-center">
                <button
                  onClick={() => {
                    setActivePage('timeline');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs text-[#C6FF3D] hover:underline transition-colors"
                >
                  View full timeline →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#22251F] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]"
          >
            <img
              src={user?.avatar_url || profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={user?.name || profile?.name || 'Student'}
              className="w-8 h-8 rounded-lg object-cover border border-[#353830]"
            />
            <ChevronDown className="w-3.5 h-3.5 text-[#777C72] hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1A1D19] rounded-2xl shadow-modal border border-[#353830] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#353830]">
                <p className="text-xs font-semibold text-[#F3F0E8]">{user?.name || profile?.name}</p>
                <p className="text-[11px] text-[#A5A89F] truncate">{user?.email || profile?.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#22251F] text-[10px] text-[#C6FF3D] border border-[#353830] font-mono">
                    {user?.role_title || 'Campus Explorer'}
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setActivePage('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#777C72]" />
                  Profile & Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] transition-colors text-left"
                >
                  <Home className="w-3.5 h-3.5 text-[#777C72]" />
                  Public Landing Page
                </button>
              </div>

              {/* Switch Demo Accounts */}
              <div className="pt-1 border-t border-[#22251F]">
                <div className="px-4 py-1 text-[10px] font-mono text-[#777C72] uppercase tracking-wider">
                  Switch Demo Account
                </div>
                {otherDemoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSwitchAccount(account.email)}
                    className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] text-[#A5A89F] hover:text-[#C6FF3D] hover:bg-[#22251F] transition-colors text-left"
                  >
                    <Users className="w-3 h-3 text-[#777C72]" />
                    <span>{account.label}</span>
                  </button>
                ))}
              </div>

              {/* Reset Data & Sign Out */}
              <div className="pt-1 mt-1 border-t border-[#22251F]">
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#A5A89F] hover:text-[#C6FF3D] hover:bg-[#22251F] transition-colors text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#777C72]" />
                  Reset Demo Data
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-[#22251F] transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
