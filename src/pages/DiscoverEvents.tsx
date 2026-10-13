import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Users,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { EventCard } from '../components/events/EventCard';
import { SearchBar } from '../components/common/SearchBar';
import { EmptyState } from '../components/common/EmptyState';
import { CategoryBadge } from '../components/common/Badge';
import { CampusEvent, EventCategory } from '../types';
import { formatDate } from '../lib/utils';

export const DiscoverEvents: React.FC = () => {
  const { events, openEventDetail, updateEventRegistration } = useEvents();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const featuredEvent = events.find((e: CampusEvent) => e.isFeatured) || events[0];

  const categories: ('all' | EventCategory)[] = [
    'all',
    'Hackathon',
    'Tech Talk',
    'Workshop',
    'Cultural',
    'Career',
    'Sports',
    'Academic',
  ];

  const venues = [
    { label: 'All Venues', value: 'all' },
    { label: 'Student Innovation Center', value: 'Student Innovation Center' },
    { label: 'Turing Lecture Hall', value: 'Turing Lecture Hall' },
    { label: 'University Recreation Pavilion', value: 'University Recreation Pavilion' },
    { label: 'Campus Amphitheater', value: 'Campus Amphitheater' },
    { label: 'Gates Computer Lab', value: 'Gates Computer Lab' },
    { label: 'Virtual (Online)', value: 'Virtual' },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((e: CampusEvent) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      if (selectedVenue !== 'all') {
        if (selectedVenue === 'Virtual' && !e.isVirtual) return false;
        if (selectedVenue !== 'Virtual' && !e.venue.includes(selectedVenue)) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesDesc = e.shortDescription.toLowerCase().includes(query);
        const matchesVenue = e.venue.toLowerCase().includes(query);
        const matchesOrganizer = e.organizer.toLowerCase().includes(query);
        const matchesTags = e.tags.some((t: string) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesOrganizer && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedCategory, selectedVenue, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#F3F0E8] tracking-tight">
          Discover Events
        </h1>
        <p className="text-xs text-[#A5A89F] mt-1">
          Explore hackathons, workshops, guest lectures, and student activities across campus.
        </p>
      </div>

      {/* Featured Event Banner */}
      {featuredEvent && (
        <div 
          onClick={() => openEventDetail(featuredEvent)}
          className="bg-[#151713] rounded-3xl overflow-hidden border border-[#353830] shadow-card cursor-pointer group p-6 sm:p-8 transition-all"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#353830] mb-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22251F] text-[#FF7138] text-xs font-semibold border border-[#353830]">
                <Flame className="w-3.5 h-3.5" />
                Featured Event
              </span>
              <span className="text-xs text-[#A5A89F]">
                {featuredEvent.category} • {featuredEvent.organizer}
              </span>
            </div>
            <span className="text-xs text-[#C6FF3D] bg-[#22251F] px-2.5 py-1 rounded-md border border-[#353830] font-medium">
              {featuredEvent.registrationStatus === 'registered' ? 'Registered' : 'Available'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Poster */}
            <div className="lg:col-span-5 h-56 sm:h-64 rounded-2xl overflow-hidden bg-[#22251F] border border-[#353830] relative group">
              <img
                src={featuredEvent.bannerImage}
                alt={featuredEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute top-3 left-3">
                <CategoryBadge category={featuredEvent.category} />
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-[#F3F0E8] tracking-tight leading-tight group-hover:text-[#C6FF3D] transition-colors">
                {featuredEvent.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#A5A89F] line-clamp-3 leading-relaxed">
                {featuredEvent.shortDescription}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#A5A89F] pt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C6FF3D]" />
                  <span className="text-[#F3F0E8]">{formatDate(featuredEvent.startDate)} ({featuredEvent.startTime})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#777C72]" />
                  <span className="truncate">{featuredEvent.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C6FF3D]" />
                  <span className="text-[#F3F0E8]">{featuredEvent.attendeesCount} registered</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateEventRegistration(
                      featuredEvent.id,
                      featuredEvent.registrationStatus === 'registered' ? 'not_registered' : 'registered'
                    );
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-card ${
                    featuredEvent.registrationStatus === 'registered'
                      ? 'bg-[#22251F] text-[#FF7138] border border-[#353830]'
                      : 'bg-[#C6FF3D] text-[#111311] hover:bg-[#C6FF3D]/90'
                  }`}
                >
                  {featuredEvent.registrationStatus === 'registered' ? 'Cancel RSVP' : 'Register Now'}
                </button>
                <button
                  onClick={() => openEventDetail(featuredEvent)}
                  className="px-4 py-2.5 rounded-xl bg-[#22251F] hover:bg-[#22251F]/80 text-[#F3F0E8] border border-[#353830] text-xs font-medium transition-colors"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#151713] rounded-3xl p-5 border border-[#353830] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search events by title, organizer, or venue..."
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-[#777C72] hidden sm:block" />
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full sm:w-60 px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
              >
                {venues.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[#353830]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                  : 'bg-[#1A1D19] text-[#F3F0E8] font-medium hover:border-[#C6FF3D] border border-[#353830]'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#777C72] font-medium">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
        </span>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your venue or category filters, or search for another keyword."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedCategory('all');
            setSelectedVenue('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt: CampusEvent) => (
            <EventCard key={evt.id} event={evt} showQuickRegister />
          ))}
        </div>
      )}
    </div>
  );
};
