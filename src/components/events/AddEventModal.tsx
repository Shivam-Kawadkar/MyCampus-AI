import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useEvents } from '../../context/EventContext';
import { EventCategory } from '../../types';

export const AddEventModal: React.FC = () => {
  const { isAddEventModalOpen, setIsAddEventModalOpen, addNewEvent } = useEvents();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Tech Talk');
  const [organizer, setOrganizer] = useState('');
  const [startDate, setStartDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('02:00 PM');
  const [venue, setVenue] = useState('');
  const [room, setRoom] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [tagsInput, setTagsInput] = useState('Campus, Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    try {
      setIsSubmitting(true);
      await addNewEvent({
        title: title.trim(),
        category,
        organizer: organizer.trim() || 'Student Club',
        startDate,
        startTime,
        endDate: startDate,
        endTime: '04:00 PM',
        venue: venue.trim(),
        room: room.trim() || undefined,
        shortDescription: shortDesc.trim() || title,
        fullDescription: shortDesc.trim() || `Event hosted at ${venue}.`,
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
        registrationStatus: 'registered',
        registrationDeadline: startDate,
        attendeesCount: 1,
        capacity: 100,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        checklistTasks: ['Add event to my calendar', 'Set reminder 1 hour before'],
      });

      setTitle('');
      setOrganizer('');
      setVenue('');
      setRoom('');
      setShortDesc('');
      setIsAddEventModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddEventModalOpen}
      onClose={() => setIsAddEventModalOpen(false)}
      title="Add Event"
      subtitle="Add an upcoming campus event to your schedule."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next.js & React Workshop"
            className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
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
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g. Coding Club"
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Time
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 02:00 PM"
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
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
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Student Center Hall A"
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Room
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 202"
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Brief overview of event topics and takeaways..."
            className="w-full px-3.5 py-2 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="AI, Web, Workshop"
            className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
          />
        </div>

        <div className="pt-3 border-t border-[#353830] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsAddEventModalOpen(false)}
            className="px-4 py-2.5 rounded-xl text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-bold transition-all shadow-card disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
