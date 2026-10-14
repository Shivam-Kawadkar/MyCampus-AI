import React, { useState, useEffect } from 'react';
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
  ListTodo,
  Edit3,
  Trash2,
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';
import { useEvents } from '../../context/EventContext';
import { CategoryBadge, StatusBadge, ConflictBadge } from '../common/Badge';
import { formatDate, isDeadlineExpired } from '../../lib/utils';
import { CampusEvent, EventCategory } from '../../types';

export const EventDetailModal: React.FC = () => {
  const { 
    selectedEvent, 
    closeEventDetail, 
    updateEventRegistration, 
    updateEvent,
    deleteEvent,
    conflicts,
    showToast,
    addTask
  } = useEvents();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'Tech Talk' as EventCategory,
    organizer: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: '',
    room: '',
    registrationDeadline: '',
    registrationFee: '',
    shortDescription: '',
    fullDescription: '',
    externalUrl: '',
    tags: '',
  });

  // Populate edit form when selectedEvent changes or editing is toggled
  useEffect(() => {
    if (selectedEvent) {
      setEditForm({
        title: selectedEvent.title || '',
        category: selectedEvent.category || 'Tech Talk',
        organizer: selectedEvent.organizer || '',
        startDate: selectedEvent.startDate || '',
        startTime: selectedEvent.startTime || '',
        endDate: selectedEvent.endDate || selectedEvent.startDate || '',
        endTime: selectedEvent.endTime || selectedEvent.startTime || '',
        venue: selectedEvent.venue || '',
        room: selectedEvent.room || '',
        registrationDeadline: selectedEvent.registrationDeadline || selectedEvent.startDate || '',
        registrationFee: selectedEvent.registrationFee || '',
        shortDescription: selectedEvent.shortDescription || '',
        fullDescription: selectedEvent.fullDescription || '',
        externalUrl: selectedEvent.externalUrl || '',
        tags: (selectedEvent.tags || []).join(', '),
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedEvent]);

  if (!selectedEvent) return null;

  const isRegistered = selectedEvent.registrationStatus === 'registered';
  const isClosed = isDeadlineExpired(selectedEvent.registrationDeadline);
  
  // Find conflicts involving this event
  const eventConflicts = conflicts.filter(
    (c) => c.event1Id === selectedEvent.id || c.event2Id === selectedEvent.id
  );
  const hasConflict = eventConflicts.length > 0;

  const handleToggleRegistration = () => {
    if (isRegistered) {
      updateEventRegistration(selectedEvent.id, 'not_registered');
    } else if (!isClosed) {
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      showToast('Event title is required', 'error');
      return;
    }
    if (!editForm.venue.trim()) {
      showToast('Event venue is required', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const updates: Partial<CampusEvent> = {
        title: editForm.title.trim(),
        category: editForm.category,
        organizer: editForm.organizer.trim(),
        startDate: editForm.startDate,
        startTime: editForm.startTime.trim(),
        endDate: editForm.endDate || editForm.startDate,
        endTime: editForm.endTime.trim() || editForm.startTime.trim(),
        venue: editForm.venue.trim(),
        room: editForm.room.trim() || undefined,
        registrationDeadline: editForm.registrationDeadline.trim() || editForm.startDate,
        registrationFee: editForm.registrationFee.trim() || 'Free',
        shortDescription: editForm.shortDescription.trim(),
        fullDescription: editForm.fullDescription.trim(),
        externalUrl: editForm.externalUrl.trim() || undefined,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await updateEvent(selectedEvent.id, updates);
      setIsEditing(false);
    } catch (err: any) {
      // Handled in updateEvent toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEvent(selectedEvent.id);
    } catch (err) {
      setIsDeleting(false);
    }
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
        <div className="relative h-48 sm:h-56 w-full bg-[#0B0D0B] border-b border-[#353830] flex-shrink-0 overflow-hidden">
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
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10 flex-wrap">
            <CategoryBadge category={selectedEvent.category} />
            <StatusBadge status={selectedEvent.registrationStatus} isDeadlineExpired={isClosed} />
            {hasConflict && <ConflictBadge label="Schedule Conflict" />}
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleRegistration}
              disabled={!isRegistered && isClosed}
              title={!isRegistered && isClosed ? 'Registration deadline has passed' : undefined}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-card ${
                isRegistered
                  ? 'bg-[#22251F] text-[#FF7138] hover:bg-[#22251F]/80 border border-[#353830]'
                  : isClosed
                  ? 'bg-[#1D1F1C] text-[#777C72] border border-[#2D302A] cursor-not-allowed opacity-75'
                  : 'bg-[#C6FF3D] text-[#111311] hover:bg-[#C6FF3D]/90'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isRegistered
                  ? 'Cancel Registration'
                  : isClosed
                  ? 'Registration Closed'
                  : 'Register for Event'}
              </span>
            </button>

            <button
              onClick={handleAddToCalendar}
              className="px-3 py-2 rounded-xl border border-[#353830] bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4 text-[#777C72]" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Edit Button */}
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setIsEditing(!isEditing);
              }}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 border ${
                isEditing
                  ? 'bg-[#C6FF3D] text-[#111311] border-[#C6FF3D] font-semibold'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] border-[#353830]'
              }`}
              title="Edit event details"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                setIsEditing(false);
                setShowDeleteConfirm(!showDeleteConfirm);
              }}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 border ${
                showDeleteConfirm
                  ? 'bg-[#2A1512] text-[#FF7138] border-[#5C231E]'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#FF7138] hover:bg-[#22251F] border-[#353830]'
              }`}
              title="Delete event"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

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

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="px-6 py-4 bg-[#2A1512] border-b border-[#5C231E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#FF7138] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#F3F0E8]">Confirm Event Deletion</p>
                <p className="text-[11px] text-[#A5A89F] mt-0.5 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-semibold">"{selectedEvent.title}"</span>? This will also remove any linked preparation tasks.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#22251F] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF7138] hover:bg-[#FF7138]/90 text-[#111311] shadow-card disabled:opacity-50 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Schedule Conflict Banner */}
        {hasConflict && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#2A1512] border border-[#5C231E] flex items-start gap-3 shadow-card animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-[#FF7138] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#FF7138] uppercase tracking-wider">
                Schedule Conflict Detected
              </h4>
              <div className="mt-1 space-y-2">
                {eventConflicts.map((c, idx) => {
                  const otherTitle = c.event1Id === selectedEvent.id ? c.event2Title : c.event1Title;
                  const otherTime = c.event1Id === selectedEvent.id ? c.event2Time : c.event1Time;
                  const myTime = c.event1Id === selectedEvent.id ? c.event1Time : c.event2Time;
                  return (
                    <div key={idx} className="text-xs text-[#F3F0E8] space-y-1">
                      <p className="text-xs text-[#E0A090] font-medium leading-relaxed">{c.conflictReason}</p>
                      <div className="flex items-center gap-2.5 text-[11px] text-[#A5A89F] flex-wrap">
                        <span>Overlapping with: <strong className="text-white font-semibold">{otherTitle}</strong></span>
                        <span>• Date: <span className="text-[#C6FF3D] font-mono">{c.conflictDate}</span></span>
                        <span>• Times: <span className="text-[#FF7138] font-mono">{myTime}</span> vs <span className="text-[#C6FF3D] font-mono">{otherTime}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content: View or Edit Mode */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-[#F3F0E8]">
            <div className="flex items-center justify-between pb-2 border-b border-[#353830]">
              <h3 className="text-sm font-bold font-heading text-[#C6FF3D] flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <span>Edit Event Details</span>
              </h3>
              <span className="text-xs text-[#777C72]">Saved to your isolated demo account</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as EventCategory })}
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Tech Talk">Tech Talk</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Career">Career</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Organizer
                </label>
                <input
                  type="text"
                  value={editForm.organizer}
                  onChange={(e) => setEditForm({ ...editForm, organizer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Start Time *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  End Time
                </label>
                <input
                  type="text"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  placeholder="e.g. 05:00 PM"
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.venue}
                  onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                  placeholder="e.g. Gates Computer Science Hall"
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Room
                </label>
                <input
                  type="text"
                  value={editForm.room}
                  onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                  placeholder="e.g. Room 100"
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  RSVP Registration Deadline
                </label>
                <input
                  type="date"
                  value={editForm.registrationDeadline}
                  onChange={(e) => setEditForm({ ...editForm, registrationDeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Fee / Cost
                </label>
                <input
                  type="text"
                  value={editForm.registrationFee}
                  onChange={(e) => setEditForm({ ...editForm, registrationFee: e.target.value })}
                  placeholder="Free, $10, etc."
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Short Description
              </label>
              <textarea
                rows={2}
                value={editForm.shortDescription}
                onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                Full Description
              </label>
              <textarea
                rows={4}
                value={editForm.fullDescription}
                onChange={(e) => setEditForm({ ...editForm, fullDescription: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="AI, Robotics, Career"
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
                  External URL
                </label>
                <input
                  type="url"
                  value={editForm.externalUrl}
                  onChange={(e) => setEditForm({ ...editForm, externalUrl: e.target.value })}
                  placeholder="https://campus.edu/event"
                  className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#353830] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-bold transition-all shadow-card disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Normal View Mode */
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium truncate">{formatDate(selectedEvent.registrationDeadline)}</p>
                      {isClosed && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#2A1810] text-[#FF7138] border border-[#5C2D1E] font-semibold">
                          Closed
                        </span>
                      )}
                    </div>
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
        )}

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
