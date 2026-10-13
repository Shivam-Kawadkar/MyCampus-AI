import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useEvents } from '../../context/EventContext';

export const AddTaskModal: React.FC = () => {
  const { isAddTaskModalOpen, setIsAddTaskModalOpen, addTask, events } = useEvents();

  const [title, setTitle] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-18');
  const [dueTime, setDueTime] = useState('06:00 PM');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'prep' | 'submission' | 'travel' | 'registration'>('prep');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const chosenEvent = events.find((e) => e.id === selectedEventId);

      await addTask({
        title: title.trim(),
        eventId: selectedEventId || undefined,
        eventTitle: chosenEvent?.title || undefined,
        dueDate,
        dueTime,
        priority,
        category,
        isCompleted: false,
      });

      setTitle('');
      setSelectedEventId('');
      setIsAddTaskModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddTaskModalOpen}
      onClose={() => setIsAddTaskModalOpen(false)}
      title="Add Task"
      subtitle="Create a task or checklist item for an upcoming event."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Print resume copies or clone repository"
            className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
            Linked Event (Optional)
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-xs focus:outline-none focus:border-[#C6FF3D]"
          >
            <option value="">General Task</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-xs focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Due Time
            </label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 05:00 PM"
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] placeholder:text-[#777C72] border border-[#353830] rounded-xl text-sm focus:outline-none focus:border-[#C6FF3D]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-xs focus:outline-none focus:border-[#C6FF3D]"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5A89F] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'prep' | 'submission' | 'travel' | 'registration')}
              className="w-full px-3.5 py-2.5 bg-[#151713] text-[#F3F0E8] border border-[#353830] rounded-xl text-xs focus:outline-none focus:border-[#C6FF3D]"
            >
              <option value="prep">Preparation</option>
              <option value="submission">Submission</option>
              <option value="travel">Logistics</option>
              <option value="registration">Registration</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-[#353830] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsAddTaskModalOpen(false)}
            className="px-4 py-2 rounded-xl text-[#A5A89F] hover:text-[#F3F0E8] text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-semibold transition-all shadow-card"
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
