import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Filter, 
  Plus, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { CategoryBadge } from '../components/common/Badge';
import { formatDate, formatShortDate, cn } from '../lib/utils';
import { CampusEvent, PrepTask, PendingDeadline } from '../types';

type TimelineFilter = 'all' | 'events' | 'deadlines' | 'tasks';

interface TimelineItem {
  id: string;
  type: 'event' | 'deadline' | 'task';
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  category?: string;
  isCompleted?: boolean;
  isUrgent?: boolean;
  originalData: CampusEvent | PrepTask | PendingDeadline;
}

export const Timeline: React.FC = () => {
  const { 
    events, 
    tasks, 
    deadlines, 
    toggleTask, 
    openEventDetail, 
    setIsAddTaskModalOpen,
    setIsAddEventModalOpen 
  } = useEvents();

  const [filterType, setFilterType] = useState<TimelineFilter>('all');

  // Build unified chronological timeline items
  const timelineItems: TimelineItem[] = useMemo(() => {
    const list: TimelineItem[] = [];

    // 1. Events
    events.forEach((evt: CampusEvent) => {
      list.push({
        id: `timeline_evt_${evt.id}`,
        type: 'event',
        date: evt.startDate,
        time: evt.startTime,
        title: evt.title,
        subtitle: `${evt.venue} • ${evt.organizer}`,
        category: evt.category,
        originalData: evt,
      });
    });

    // 2. Deadlines
    deadlines.forEach((dl: PendingDeadline) => {
      list.push({
        id: `timeline_dl_${dl.id}`,
        type: 'deadline',
        date: dl.deadlineDate,
        time: dl.deadlineTime,
        title: dl.title,
        subtitle: `Linked: ${dl.eventTitle}`,
        category: dl.category,
        isUrgent: dl.isUrgent,
        originalData: dl,
      });
    });

    // 3. Tasks
    tasks.forEach((tsk: PrepTask) => {
      list.push({
        id: `timeline_tsk_${tsk.id}`,
        type: 'task',
        date: tsk.dueDate,
        time: tsk.dueTime,
        title: tsk.title,
        subtitle: tsk.eventTitle ? `Linked: ${tsk.eventTitle}` : 'General Preparation',
        isCompleted: tsk.isCompleted,
        isUrgent: tsk.priority === 'high',
        originalData: tsk,
      });
    });

    // Sort by date ascending
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter
    if (filterType === 'all') return list;
    if (filterType === 'events') return list.filter((i) => i.type === 'event');
    if (filterType === 'deadlines') return list.filter((i) => i.type === 'deadline');
    if (filterType === 'tasks') return list.filter((i) => i.type === 'task');

    return list;
  }, [events, deadlines, tasks, filterType]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: TimelineItem[] } = {};
    timelineItems.forEach((item) => {
      const formatted = formatDate(item.date);
      if (!groups[formatted]) {
        groups[formatted] = [];
      }
      groups[formatted].push(item);
    });
    return groups;
  }, [timelineItems]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#F3F0E8] tracking-tight">
            Timeline
          </h1>
          <p className="text-xs text-[#A5A89F] mt-1">
            Chronological view of events, registration deadlines, and tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-[#353830] bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#22251F] text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#C6FF3D]" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-semibold transition-all shadow-card"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#151713] rounded-2xl p-3 border border-[#353830] shadow-card flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterType === 'all'
                ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
            )}
          >
            All ({timelineItems.length})
          </button>
          <button
            onClick={() => setFilterType('events')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              filterType === 'events'
                ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events ({events.length})
          </button>
          <button
            onClick={() => setFilterType('deadlines')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              filterType === 'deadlines'
                ? 'bg-[#FF7138] text-[#111311] font-semibold shadow-card'
                : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Deadlines ({deadlines.length})
          </button>
          <button
            onClick={() => setFilterType('tasks')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              filterType === 'tasks'
                ? 'bg-[#C6FF3D] text-[#111311] font-semibold shadow-card'
                : 'bg-[#1A1D19] text-[#A5A89F] hover:text-[#F3F0E8] border border-[#353830]'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tasks ({tasks.length})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#777C72]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" /> Event
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF7138]" /> Deadline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A5A89F]" /> Task
          </span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-8">
        {Object.entries(groupedByDate).map(([dateStr, items]) => (
          <div key={dateStr} className="relative">
            {/* Date Section Header */}
            <div className="sticky top-16 z-10 py-2 bg-[#111311] flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1A1D19] border border-[#353830] text-xs font-semibold text-[#F3F0E8]">
                <CalendarDays className="w-3.5 h-3.5 text-[#C6FF3D]" />
                <span>{dateStr}</span>
              </div>
              <div className="h-px bg-[#353830] flex-1" />
            </div>

            {/* Items Vertical Stack */}
            <div className="relative pl-6 ml-4 border-l-2 border-[#353830] space-y-4 pt-3">
              {items.map((item) => {
                const isEvent = item.type === 'event';
                const isDeadline = item.type === 'deadline';
                const isTask = item.type === 'task';

                return (
                  <div key={item.id} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={cn(
                        'absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-[#111311] flex items-center justify-center transition-all',
                        isEvent && 'bg-[#C6FF3D] shadow-[0_0_8px_#C6FF3D]',
                        isDeadline && 'bg-[#FF7138] shadow-[0_0_8px_#FF7138]',
                        isTask && (item.isCompleted ? 'bg-[#C6FF3D]' : 'bg-[#777C72]')
                      )}
                    />

                    {/* Timeline Item Box */}
                    <div
                      className={cn(
                        'bg-[#1A1D19] rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-card flex items-start justify-between gap-4',
                        isEvent && 'border-[#353830] hover:border-[#C6FF3D] cursor-pointer',
                        isDeadline && 'border-[#353830] hover:border-[#FF7138]',
                        isTask && (item.isCompleted ? 'border-[#292D27] bg-[#151713] opacity-60' : 'border-[#353830] hover:border-[#C6FF3D]')
                      )}
                      onClick={() => {
                        if (isEvent) {
                          openEventDetail(item.originalData as CampusEvent);
                        }
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        {/* Type & Time Label */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className={cn(
                              'text-[10px] font-medium px-2 py-0.5 rounded border',
                              isEvent && 'bg-[#22251F] text-[#C6FF3D] border-[#353830]',
                              isDeadline && 'bg-[#22251F] text-[#FF7138] border-[#353830]',
                              isTask && 'bg-[#151713] text-[#A5A89F] border-[#353830]'
                            )}
                          >
                            {isEvent ? 'Event' : isDeadline ? 'Deadline' : 'Task'}
                          </span>

                          {item.time && (
                            <span className="text-[11px] text-[#A5A89F] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#777C72]" />
                              {item.time}
                            </span>
                          )}

                          {item.isUrgent && (
                            <span className="text-[10px] font-semibold text-[#FF7138] bg-[#22251F] px-1.5 py-0.5 rounded border border-[#353830]">
                              Urgent
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={cn(
                            'text-sm sm:text-base font-bold font-heading text-[#F3F0E8]',
                            item.isCompleted && 'line-through text-[#777C72]'
                          )}
                        >
                          {item.title}
                        </h4>

                        {/* Subtitle */}
                        {item.subtitle && (
                          <p className="text-xs text-[#A5A89F] mt-1 font-sans leading-relaxed">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Right Action */}
                      <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                        {isTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const taskObj = item.originalData as PrepTask;
                              toggleTask(taskObj.id);
                            }}
                            className={cn(
                              'w-6 h-6 rounded border flex items-center justify-center transition-all',
                              item.isCompleted
                                ? 'bg-[#C6FF3D] border-[#C6FF3D] text-[#111311]'
                                : 'border-[#353830] bg-[#151713] hover:border-[#C6FF3D] text-transparent'
                            )}
                            title={item.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        )}

                        {isEvent && (
                          <button
                            onClick={() => openEventDetail(item.originalData as CampusEvent)}
                            className="px-3 py-1.5 rounded-lg border border-[#353830] bg-[#22251F] text-xs font-medium text-[#F3F0E8] hover:border-[#C6FF3D] transition-colors"
                          >
                            Details
                          </button>
                        )}

                        {isDeadline && (
                          <button
                            onClick={() => {
                              const dl = item.originalData as PendingDeadline;
                              const rel = events.find((e) => e.id === dl.eventId);
                              if (rel) openEventDetail(rel);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#22251F] hover:bg-[#FF7138] hover:text-[#111311] text-[#FF7138] text-xs font-semibold border border-[#353830] transition-colors"
                          >
                            View Event
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
