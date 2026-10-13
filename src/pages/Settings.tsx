import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Calendar, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Save, 
  GraduationCap,
  Zap,
  Palette,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useTheme } from '../context/ThemeContext';
import { EventCategory } from '../types';
import { MyCampusLogo } from '../components/common/MyCampusLogo';

export const Settings: React.FC = () => {
  const { profile, updateProfile, showToast } = useEvents();
  const { 
    theme, 
    currentTheme, 
    setTheme, 
    customAccent, 
    setCustomAccent, 
    resetTheme, 
    themes, 
    accentPresets 
  } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [campusName, setCampusName] = useState('');
  const [interests, setInterests] = useState<EventCategory[]>([]);
  const [notifSettings, setNotifSettings] = useState({
    emailReminders: true,
    deadlineAlerts: true,
    aiRecommendations: true,
    weeklyDigest: false,
    browserPush: true,
  });
  const [calendarSync, setCalendarSync] = useState({
    google: true,
    apple: false,
    outlook: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setStudentId(profile.studentId);
      setDepartment(profile.department);
      setYearOfStudy(profile.yearOfStudy);
      setCampusName(profile.campusName);
      setInterests(profile.interests);
      setNotifSettings(profile.notificationSettings);
      setCalendarSync(profile.calendarSync);
    }
  }, [profile]);

  const allCategories: EventCategory[] = [
    'Hackathon',
    'Tech Talk',
    'Workshop',
    'Cultural',
    'Career',
    'Sports',
    'Academic',
  ];

  const toggleInterest = (cat: EventCategory) => {
    if (interests.includes(cat)) {
      setInterests(interests.filter((i) => i !== cat));
    } else {
      setInterests([...interests, cat]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfile({
        name,
        email,
        studentId,
        department,
        yearOfStudy,
        campusName,
        interests,
        notificationSettings: notifSettings,
        calendarSync,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#F3F0E8] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-[#A5A89F] mt-1">
          Manage your student profile, appearance & theme, event interests, notifications, and calendar sync.
        </p>
      </div>

      {/* Appearance & Theme Section */}
      <div className="bg-[#151713] rounded-3xl p-6 border border-[#353830] shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#353830]">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#C6FF3D]" />
            <h3 className="font-heading font-semibold text-xs sm:text-sm text-[#F3F0E8]">
              Appearance & Theme
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              resetTheme();
              showToast('Theme reset to Midnight Pulse default', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1D19] hover:bg-[#22251F] text-[#F3F0E8] text-xs font-medium border border-[#353830] transition-colors shadow-xs"
            title="Reset to default theme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>

        <div>
          <p className="text-xs text-[#A5A89F]">
            Select a visual aesthetic for your campus dashboard. All colors, contrast levels, and components adapt immediately.
          </p>
        </div>

        {/* Preset Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  showToast(`Switched to ${t.name}`, 'success');
                }}
                className={`relative flex flex-col text-left p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-[#C6FF3D] bg-[#1A1D19] shadow-lg ring-2 ring-[#C6FF3D]/40 opacity-100'
                    : 'border-[#353830] bg-[#1A1D19] opacity-75 hover:opacity-100 hover:border-[#C6FF3D]/60'
                }`}
              >
                {/* Active Check Badge */}
                {isActive && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C6FF3D] text-[#111311] flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}

                {/* Mode Indicator & Name */}
                <div className="flex items-center gap-2 mb-1 pr-6">
                  <span className="text-xs font-semibold font-heading text-[#F3F0E8] truncate">
                    {t.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#22251F] text-[#F3F0E8] border border-[#353830]">
                    {t.mode === 'dark' ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                    {t.mode === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>

                <p className="text-[11px] text-[#A5A89F] line-clamp-2 min-h-[32px] mb-3">
                  {t.tagline}
                </p>

                {/* Live Color Preview Mockup */}
                <div
                  className="w-full h-16 rounded-xl p-2.5 flex flex-col justify-between border border-[#353830]/60 mb-3 shadow-inner"
                  style={{ backgroundColor: t.colors.bgPrimary }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-md"
                        style={{ backgroundColor: t.colors.bgElevated, border: `1px solid ${t.colors.border}` }}
                      />
                      <div
                        className="w-10 h-1.5 rounded-full"
                        style={{ backgroundColor: t.colors.textMuted }}
                      />
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: t.colors.accentSecondary }}
                    />
                  </div>
                  <div
                    className="p-1.5 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: t.colors.bgCard, border: `1px solid ${t.colors.borderSubtle}` }}
                  >
                    <div
                      className="w-12 h-1.5 rounded-full"
                      style={{ backgroundColor: t.colors.textSecondary }}
                    />
                    <div
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: t.colors.accentPrimary,
                        color: t.colors.accentContrast,
                      }}
                    >
                      Active
                    </div>
                  </div>
                </div>

                {/* Color Swatch Dots */}
                <div className="flex items-center justify-between pt-2 border-t border-[#353830]/50 text-[10px] text-[#A5A89F]">
                  <span>Palette</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: t.colors.bgPrimary }}
                      title={`Primary Background: ${t.colors.bgPrimary}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: t.colors.bgCard }}
                      title={`Card Surface: ${t.colors.bgCard}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: t.colors.accentPrimary }}
                      title={`Primary Accent: ${t.colors.accentPrimary}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: t.colors.accentSecondary }}
                      title={`Secondary Accent: ${t.colors.accentSecondary}`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Accent Color Customizer */}
        <div className="pt-4 border-t border-[#353830] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold font-heading text-[#F3F0E8] flex items-center gap-1.5">
                <span>Accent Color</span>
                {customAccent && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#22251F] text-[#C6FF3D] border border-[#353830]">
                    Custom Active
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-[#A5A89F] mt-0.5">
                Pick a curated accent preset or choose your own custom color.
              </p>
            </div>
            {customAccent && (
              <button
                type="button"
                onClick={() => {
                  setCustomAccent(null);
                  showToast('Reverted to theme default accent', 'info');
                }}
                className="self-start sm:self-auto text-xs text-[#A5A89F] hover:text-[#F3F0E8] underline underline-offset-4 transition-colors"
              >
                Reset to theme default
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {accentPresets.map((preset) => {
              const isSelected = (!customAccent && currentTheme.colors.accentPrimary.toLowerCase() === preset.color.toLowerCase()) || (customAccent?.toLowerCase() === preset.color.toLowerCase());
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    setCustomAccent(preset.color);
                    showToast(`Accent set to ${preset.name}`, 'success');
                  }}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-[#C6FF3D] bg-[#22251F] text-[#F3F0E8] ring-1 ring-[#C6FF3D]/40 font-semibold'
                      : 'border-[#353830] bg-[#1A1D19] text-[#F3F0E8] hover:border-[#C6FF3D]/50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 flex-shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.name}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[2.5] text-[#C6FF3D]" />}
                </button>
              );
            })}

            {/* Custom Color Input */}
            <label className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#353830] bg-[#1A1D19] hover:border-[#C6FF3D]/50 text-xs text-[#F3F0E8] cursor-pointer transition-colors">
              <input
                type="color"
                value={customAccent || currentTheme.colors.accentPrimary}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="font-mono text-[11px] uppercase">
                {customAccent || currentTheme.colors.accentPrimary}
              </span>
            </label>
          </div>

          {/* Live Dynamic Logo Preview */}
          <div className="mt-4 pt-4 border-t border-[#353830] flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1A1D19] border border-[#353830]">
            <div className="flex items-center gap-3">
              <MyCampusLogo size="lg" showSubtitle subtitle="Theme-Adaptive Brand Vector" />
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-mono text-[#777C72] block">
                Favicon & Brand synced with {currentTheme.name}
              </span>
              <span className="text-[10px] text-[#A5A89F] block mt-0.5">
                Tab favicon updates dynamically in real-time
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#151713] rounded-3xl p-6 border border-[#353830] shadow-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#353830]">
            <User className="w-4 h-4 text-[#C6FF3D]" />
            <h3 className="font-heading font-semibold text-xs text-[#F3F0E8]">
              Profile Details
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
            <img
              src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={name}
              className="w-18 h-18 rounded-xl object-cover border border-[#353830]"
            />
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading font-bold text-[#F3F0E8] text-base">{name}</h4>
              <p className="text-xs text-[#A5A89F]">{department} • {yearOfStudy}</p>
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#22251F] text-[#C6FF3D] text-xs border border-[#353830]">
                ID: {studentId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs sm:text-sm text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs sm:text-sm text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs sm:text-sm text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Year of Study
              </label>
              <input
                type="text"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs sm:text-sm text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Campus / University
              </label>
              <input
                type="text"
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs sm:text-sm text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>
          </div>
        </div>

        {/* Interests Personalization */}
        <div className="bg-[#151713] rounded-3xl p-6 border border-[#353830] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#353830]">
            <Sparkles className="w-4 h-4 text-[#C6FF3D]" />
            <h3 className="font-heading font-semibold text-xs text-[#F3F0E8]">
              Event Interests
            </h3>
          </div>
          <p className="text-xs text-[#A5A89F]">
            Select topics you are interested in to personalize event suggestions.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {allCategories.map((cat) => {
              const selected = interests.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleInterest(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                      : 'bg-[#1A1D19] text-[#F3F0E8] hover:border-[#C6FF3D] border border-[#353830]'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-[#151713] rounded-3xl p-6 border border-[#353830] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#353830]">
            <Bell className="w-4 h-4 text-[#C6FF3D]" />
            <h3 className="font-heading font-semibold text-xs text-[#F3F0E8]">
              Notifications
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#1A1D19] border border-[#353830] cursor-pointer hover:bg-[#22251F] transition-colors">
              <div>
                <span className="text-xs font-semibold text-[#F3F0E8] block">Event Reminders</span>
                <span className="text-xs text-[#A5A89F]">Receive reminders 24 hours before your events start</span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.emailReminders}
                onChange={(e) => setNotifSettings({ ...notifSettings, emailReminders: e.target.checked })}
                className="w-4 h-4 rounded bg-[#151713] border-[#353830] text-[#C6FF3D] focus:ring-0 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#1A1D19] border border-[#353830] cursor-pointer hover:bg-[#22251F] transition-colors">
              <div>
                <span className="text-xs font-semibold text-[#F3F0E8] block">Deadline Alerts</span>
                <span className="text-xs text-[#A5A89F]">Get alerts before event registration closes</span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.deadlineAlerts}
                onChange={(e) => setNotifSettings({ ...notifSettings, deadlineAlerts: e.target.checked })}
                className="w-4 h-4 rounded bg-[#151713] border-[#353830] text-[#C6FF3D] focus:ring-0 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#1A1D19] border border-[#353830] cursor-pointer hover:bg-[#22251F] transition-colors">
              <div>
                <span className="text-xs font-semibold text-[#F3F0E8] block">Event Recommendations</span>
                <span className="text-xs text-[#A5A89F]">Get suggestions based on your interests</span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.aiRecommendations}
                onChange={(e) => setNotifSettings({ ...notifSettings, aiRecommendations: e.target.checked })}
                className="w-4 h-4 rounded bg-[#151713] border-[#353830] text-[#C6FF3D] focus:ring-0 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#1A1D19] border border-[#353830] cursor-pointer hover:bg-[#22251F] transition-colors">
              <div>
                <span className="text-xs font-semibold text-[#F3F0E8] block">Weekly Digest</span>
                <span className="text-xs text-[#A5A89F]">Receive a weekly summary of upcoming events and tasks</span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.weeklyDigest}
                onChange={(e) => setNotifSettings({ ...notifSettings, weeklyDigest: e.target.checked })}
                className="w-4 h-4 rounded bg-[#151713] border-[#353830] text-[#C6FF3D] focus:ring-0 focus:ring-offset-0"
              />
            </label>
          </div>
        </div>

        {/* Calendar Sync Integration */}
        <div className="bg-[#151713] rounded-3xl p-6 border border-[#353830] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#353830]">
            <Calendar className="w-4 h-4 text-[#C6FF3D]" />
            <h3 className="font-heading font-semibold text-xs text-[#F3F0E8]">
              Calendar Sync
            </h3>
          </div>
          <p className="text-xs text-[#A5A89F]">
            Sync registered events with your personal calendar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border text-center transition-all ${calendarSync.google ? 'bg-[#22251F] border-[#C6FF3D]' : 'bg-[#1A1D19] border-[#353830]'}`}>
              <h5 className="text-xs font-semibold text-[#F3F0E8] mb-1">Google Calendar</h5>
              <span className={`text-xs block mb-3 ${calendarSync.google ? 'text-[#C6FF3D]' : 'text-[#777C72]'}`}>
                {calendarSync.google ? 'Connected' : 'Not Connected'}
              </span>
              <button
                type="button"
                onClick={() => setCalendarSync({ ...calendarSync, google: !calendarSync.google })}
                className="px-3 py-1.5 rounded-lg border border-[#353830] bg-[#151713] text-xs text-[#F3F0E8] hover:border-[#C6FF3D] transition-colors"
              >
                {calendarSync.google ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className={`p-4 rounded-2xl border text-center transition-all ${calendarSync.apple ? 'bg-[#22251F] border-[#C6FF3D]' : 'bg-[#1A1D19] border-[#353830]'}`}>
              <h5 className="text-xs font-semibold text-[#F3F0E8] mb-1">Apple Calendar</h5>
              <span className={`text-xs block mb-3 ${calendarSync.apple ? 'text-[#C6FF3D]' : 'text-[#777C72]'}`}>
                {calendarSync.apple ? 'Connected' : 'Not Connected'}
              </span>
              <button
                type="button"
                onClick={() => setCalendarSync({ ...calendarSync, apple: !calendarSync.apple })}
                className="px-3 py-1.5 rounded-lg border border-[#353830] bg-[#151713] text-xs text-[#F3F0E8] hover:border-[#C6FF3D] transition-colors"
              >
                {calendarSync.apple ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className={`p-4 rounded-2xl border text-center transition-all ${calendarSync.outlook ? 'bg-[#22251F] border-[#C6FF3D]' : 'bg-[#1A1D19] border-[#353830]'}`}>
              <h5 className="text-xs font-semibold text-[#F3F0E8] mb-1">Outlook</h5>
              <span className={`text-xs block mb-3 ${calendarSync.outlook ? 'text-[#C6FF3D]' : 'text-[#777C72]'}`}>
                {calendarSync.outlook ? 'Connected' : 'Not Connected'}
              </span>
              <button
                type="button"
                onClick={() => setCalendarSync({ ...calendarSync, outlook: !calendarSync.outlook })}
                className="px-3 py-1.5 rounded-lg border border-[#353830] bg-[#151713] text-xs text-[#F3F0E8] hover:border-[#C6FF3D] transition-colors"
              >
                {calendarSync.outlook ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-semibold transition-all shadow-card flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
