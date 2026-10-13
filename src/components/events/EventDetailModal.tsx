import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Share2, 
  CalendarPlus, 
  ExternalLink, 
  CheckCircle2, 
  Building,
  ListTodo
} from 'lucide-react';
import { useEvents } from '../../context/EventContext';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';

export const EventDetailModal: React.FC = () => {
  const { 
    selectedEvent, 
    closeEventDetail, 
    updateEventRegistration, 
    showToast,
    addTask
  } = useEvents();

  if (!selectedEvent) return null;

  const isRegistered = selectedEvent.registrationStatus === 'registered';

  const handleToggleRegistration = () => {
    if (isRegistered) {
      updateEventRegistration(selectedEvent.id, 'not_registered');
    } else {
      updateEventRegistration(selectedEvent.id, 'registered');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Event link copied to clipboard!', 'info');
  };

  const handleAddToCalendar = () => {
    showToast(`Added "${selectedEvent.title}" to calendar!`, 'success');
  };

  const handleAddChecklistToMyTasks = (taskTitle: string) => {
    addTask({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      title: taskTitle,
      dueDate: selectedEvent.startDate,
      isCompleted: false,
      priority: 'medium',
      category: 'prep',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#111311]/85 transition-opacity"
        onClick={closeEventDetail}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-[#1A1D19] rounded-3xl shadow-modal border border-[#353830] overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner with controls */}
        <div className="relative h-52 sm:h-60 w-full bg-[#0B0D0B] border-b border-[#353830] flex-shrink-0 overflow-hidden">
          <img
            src={selectedEvent.bannerImage}
            alt={selectedEvent.title}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 banner-overlay-scrim pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeEventDetail}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/85 text-white border border-white/20 transition-all z-20 backdrop-blur-md shadow-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <CategoryBadge category={selectedEvent.category} />
            <StatusBadge status={selectedEvent.registrationStatus} />
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p 
              style={{ color: 'rgba(255, 255, 255, 0.85)' }}
              className="banner-overlay-subtext text-xs font-medium mb-1 drop-shadow-sm flex items-center gap-1.5"
            >
              <span>Organized by</span>
              <span style={{ color: '#FFFFFF' }} className="font-semibold text-white">{selectedEvent.organizer}</span>
            </p>
            <h2 
              style={{ color: '#FFFFFF' }}
              className="banner-overlay-text text-lg sm:text-2xl font-bold font-heading tracking-tight leading-snug drop-shadow-md"
            >
              {selectedEvent.title}
            </h2>
          </div>
        </div>

        {/* Action Header Strip */}
        <div className="px-6 py-3.5 bg-[#151713] border-b border-[#353830] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRegistration}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-card ${
                isRegistered
                  ? 'bg-[#22251F] text-[#FF7138] hover:bg-[#22251F]/80 border border-[#353830]'
                  : 'bg-[#C6FF3D] text-[#111311] hover:bg-[#C6FF3D]/90'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRegistered ? 'Cancel Registration' : 'Register for Event'}</span>
            </button>

            <button
              onClick={handleAddToCalendar}
              className="px-3 py-2 rounded-xl border border-[#353830] bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4 text-[#777C72]" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-[#777C72] hover:text-[#F3F0E8] rounded-xl hover:bg-[#22251F] border border-transparent hover:border-[#353830] transition-colors"
              title="Share event link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {selectedEvent.externalUrl && (
              <a
                href={selectedEvent.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-[#777C72] hover:text-[#F3F0E8] rounded-xl hover:bg-[#22251F] border border-transparent hover:border-[#353830] transition-colors"
                title="External event page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#F3F0E8]">
          
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 bg-[#151713] p-4 rounded-2xl border border-[#353830]">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] text-[#777C72] uppercase block font-medium">Date & Time</span>
              <div className="flex items-start gap-1.5 text-xs text-[#F3F0E8] min-w-0">
                <Calendar className="w-3.5 h-3.5 text-[#C6FF3D] flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{formatDate(selectedEvent.startDate)}</p>
                  <p className="text-[#A5A89F] truncate">{selectedEvent.startTime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] text-[#777C72] uppercase block font-medium">Location</span>
              <div className="flex items-start gap-1.5 text-xs text-[#F3F0E8] min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#C6FF3D] flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug line-clamp-2 break-words" title={selectedEvent.venue}>
                    {selectedEvent.venue}
                  </p>
                  {selectedEvent.room && (
                    <p className="text-[#A5A89F] truncate text-[11px] mt-0.5" title={selectedEvent.room}>
                      {selectedEvent.room}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] text-[#777C72] uppercase block font-medium">RSVP Deadline</span>
              <div className="flex items-start gap-1.5 text-xs text-[#F3F0E8] min-w-0">
                <Clock className="w-3.5 h-3.5 text-[#FF7138] flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{formatDate(selectedEvent.registrationDeadline)}</p>
                  <p className="text-[#A5A89F] truncate">{selectedEvent.registrationFee || 'Free'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] text-[#777C72] uppercase block font-medium">Attendees</span>
              <div className="flex items-start gap-1.5 text-xs text-[#F3F0E8] min-w-0">
                <Users className="w-3.5 h-3.5 text-[#C6FF3D] flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{selectedEvent.attendeesCount} confirmed</p>
                  {selectedEvent.capacity && (
                    <p className="text-[#A5A89F] truncate text-[11px]">Capacity: {selectedEvent.capacity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-[#A5A89F] uppercase tracking-wider mb-2">About this Event</h4>
            <p className="text-sm text-[#F3F0E8] leading-relaxed whitespace-pre-line opacity-95">
              {selectedEvent.fullDescription}
            </p>
          </div>

          {/* Schedule */}
          {selectedEvent.schedule && selectedEvent.schedule.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#A5A89F] uppercase tracking-wider mb-3">Schedule</h4>
              <div className="relative border-l-2 border-[#353830] ml-3 space-y-4 py-1">
                {selectedEvent.schedule.map((item, idx) => (
                  <div key={idx} className="relative pl-6">
                    <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#C6FF3D] ring-4 ring-[#1A1D19]" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[#C6FF3D]">{item.time}</span>
                      <span className="text-xs font-medium text-[#F3F0E8]">{item.title}</span>
                    </div>
                    {item.venue && (
                      <p className="text-xs text-[#777C72] mt-0.5">Location: {item.venue}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#A5A89F] uppercase tracking-wider mb-3">Speakers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedEvent.speakers.map((spk, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#22251F] border border-[#353830]">
                    <img
                      src={spk.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                      alt={spk.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#353830] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F3F0E8] truncate font-heading">{spk.name}</p>
                      <p className="text-[11px] text-[#A5A89F] truncate">{spk.role}</p>
                      {spk.organization && (
                        <p className="text-[10px] text-[#C6FF3D] truncate">{spk.organization}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparation Checklist */}
          {selectedEvent.checklistTasks && selectedEvent.checklistTasks.length > 0 && (
            <div className="bg-[#151713] rounded-2xl p-4 border border-[#353830]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#C6FF3D]" />
                  <h4 className="text-xs font-semibold text-[#F3F0E8] uppercase tracking-wider">
                    Preparation Checklist
                  </h4>
                </div>
                <span className="text-[11px] text-[#777C72]">Click to add to your tasks</span>
              </div>

              <div className="space-y-2">
                {selectedEvent.checklistTasks.map((taskStr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 bg-[#1A1D19] rounded-xl border border-[#353830] hover:border-[#C6FF3D] transition-colors text-xs"
                  >
                    <span className="text-[#F3F0E8] flex-1">{taskStr}</span>
                    <button
                      onClick={() => handleAddChecklistToMyTasks(taskStr)}
                      className="px-2.5 py-1 rounded-md bg-[#22251F] hover:bg-[#C6FF3D] hover:text-[#111311] text-[#C6FF3D] text-[11px] font-medium transition-colors flex-shrink-0 border border-[#353830]"
                    >
                      + Add Task
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs text-[#777C72]">Tags:</span>
            {selectedEvent.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded text-[11px] bg-[#22251F] text-[#A5A89F] border border-[#353830]">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#151713] border-t border-[#353830] flex items-center justify-between text-xs text-[#777C72] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5" />
            <span>Event ID: {selectedEvent.id}</span>
          </div>
          <button
            onClick={closeEventDetail}
            className="px-4 py-2 rounded-xl text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
