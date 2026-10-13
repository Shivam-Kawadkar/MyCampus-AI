import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CalendarCheck2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { EventCard } from '../components/events/EventCard';
import { EmptyState } from '../components/common/EmptyState';
import { SearchBar } from '../components/common/SearchBar';
import { CampusEvent, EventCategory } from '../types';

type StatusFilter = 'all' | 'registered' | 'waitlisted' | 'attended';

export const MyEvents: React.FC = () => {
  const { 
    events, 
    registeredEvents, 
    setIsAddEventModalOpen,
    setActivePage 
  } = useEvents();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

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

  // Filter user's events
  const filteredEvents = useMemo(() => {
    return events.filter((e: CampusEvent) => {
      const isMyEvent = e.registrationStatus !== 'not_registered';
      if (!isMyEvent) return false;

      if (statusFilter !== 'all' && e.registrationStatus !== statusFilter) {
        return false;
      }

      if (categoryFilter !== 'all' && e.category !== categoryFilter) {
        return false;
      }

      if (localSearch.trim()) {
        const query = localSearch.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesVenue = e.venue.toLowerCase().includes(query);
        const matchesOrganizer = e.organizer.toLowerCase().includes(query);
        const matchesTags = e.tags.some((t: string) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesVenue && !matchesOrganizer && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [events, statusFilter, categoryFilter, localSearch]);

  const counts = useMemo(() => {
    const myEventsList = events.filter((e: CampusEvent) => e.registrationStatus !== 'not_registered');
    return {
      all: myEventsList.length,
      registered: myEventsList.filter((e: CampusEvent) => e.registrationStatus === 'registered').length,
      waitlisted: myEventsList.filter((e: CampusEvent) => e.registrationStatus === 'waitlisted').length,
      attended: myEventsList.filter((e: CampusEvent) => e.registrationStatus === 'attended').length,
    };
  }, [events]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#F3F0E8] tracking-tight">
            My Events
          </h1>
          <p className="text-xs text-[#A5A89F] mt-1">
            Track your registered, waitlisted, and attended campus events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('discover')}
            className="px-4 py-2.5 rounded-xl border border-[#353830] bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] text-xs font-medium transition-colors"
          >
            Discover Events
          </button>
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-semibold transition-all shadow-card"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151713] rounded-3xl p-5 border border-[#353830] shadow-card space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#353830] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('registered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                statusFilter === 'registered'
                  ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
              }`}
            >
              Registered ({counts.registered})
            </button>
            <button
              onClick={() => setStatusFilter('waitlisted')}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                statusFilter === 'waitlisted'
                  ? 'bg-[#FF7138] text-[#111311] font-semibold shadow-card'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
              }`}
            >
              Waitlisted ({counts.waitlisted})
            </button>
            <button
              onClick={() => setStatusFilter('attended')}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                statusFilter === 'attended'
                  ? 'bg-[#F3F0E8] text-[#111311] font-semibold shadow-card'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
              }`}
            >
              Attended ({counts.attended})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <SearchBar
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search by title, venue, or tag..."
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-[#777C72] mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#22251F] text-[#C6FF3D] border border-[#C6FF3D] font-medium'
                  : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your filters or explore upcoming campus events."
          actionLabel="Discover Events"
          onAction={() => setActivePage('discover')}
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
