import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { CampusEvent } from '../../types';
import { CategoryBadge, StatusBadge, ConflictBadge } from '../common/Badge';
import { formatDate, getDaysRemaining, isDeadlineExpired } from '../../lib/utils';
import { useEvents } from '../../context/EventContext';

interface EventCardProps {
  event: CampusEvent;
  onSelect?: () => void;
  showQuickRegister?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onSelect, 
  showQuickRegister = false 
}) => {
  const { openEventDetail, updateEventRegistration, conflicts } = useEvents();
  const daysLeft = getDaysRemaining(event.startDate);
  const isClosed = isDeadlineExpired(event.registrationDeadline);
  const isRegistered = event.registrationStatus === 'registered';
  const hasConflict = conflicts.some(
    (c) => c.event1Id === event.id || c.event2Id === event.id
  );

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      openEventDetail(event);
    }
  };

  const handleRegisterToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRegistered) {
      updateEventRegistration(event.id, 'not_registered');
    } else if (!isClosed) {
      updateEventRegistration(event.id, 'registered');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-[#1A1D19] rounded-2xl border border-[#353830] hover:border-[#C6FF3D] hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer shadow-card"
    >
      {/* Card Banner Image or Solid Typographic Fallback */}
      <div className="relative h-44 w-full overflow-hidden bg-[#22251F] border-b border-[#353830]">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
          <CategoryBadge category={event.category} />
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasConflict && <ConflictBadge label="Conflict" />}
            <StatusBadge status={event.registrationStatus} isDeadlineExpired={isClosed} />
          </div>
        </div>

        {/* Days Left Chip */}
        <div className="absolute bottom-3 left-3">
          {daysLeft >= 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111311] text-[#F3F0E8] border border-[#353830] text-[11px] font-mono">
              <Clock className="w-3 h-3 text-[#C6FF3D]" />
              {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#151713] text-[#777C72] border border-[#353830] text-[11px]">
              Past
            </span>
          )}
        </div>

        {event.capacity && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#111311] text-[#A5A89F] border border-[#353830] text-[11px] font-mono">
              <Users className="w-3 h-3 text-[#777C72]" />
              {event.attendeesCount}/{event.capacity}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organizer */}
          <p className="text-xs text-[#777C72] mb-1 truncate">
            {event.organizer}
          </p>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-[#F3F0E8] font-heading group-hover:text-[#C6FF3D] transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-[#A5A89F] mt-2 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>

          {/* Event Metadata */}
          <div className="mt-4 pt-3 border-t border-[#292D27] space-y-1.5 text-xs text-[#A5A89F]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#C6FF3D] flex-shrink-0" />
              <span className="text-xs text-[#F3F0E8]">{formatDate(event.startDate)}</span>
              <span className="text-[#353830]">•</span>
              <span className="text-xs text-[#A5A89F]">{event.startTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#777C72] flex-shrink-0" />
              <span className="truncate text-xs text-[#A5A89F]">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[#292D27] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {event.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] bg-[#22251F] text-[#A5A89F] border border-[#353830]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {showQuickRegister && (
              <button
                onClick={handleRegisterToggle}
                disabled={!isRegistered && isClosed}
                title={!isRegistered && isClosed ? 'Registration deadline has passed' : undefined}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  isRegistered
                    ? 'bg-[#22251F] text-[#C6FF3D] border border-[#353830] hover:border-[#C6FF3D]'
                    : isClosed
                    ? 'bg-[#1D1F1C] text-[#777C72] border border-[#2D302A] cursor-not-allowed opacity-75'
                    : 'bg-[#C6FF3D] text-[#111311] font-semibold hover:bg-[#C6FF3D]/90'
                }`}
              >
                {isRegistered ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Registered</span>
                  </>
                ) : isClosed ? (
                  <span>Closed</span>
                ) : (
                  <span>Register</span>
                )}
              </button>
            )}

            <button
              onClick={handleCardClick}
              className="p-1.5 text-[#777C72] hover:text-[#C6FF3D] hover:bg-[#22251F] rounded-lg transition-colors border border-transparent hover:border-[#353830]"
              title="View details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
