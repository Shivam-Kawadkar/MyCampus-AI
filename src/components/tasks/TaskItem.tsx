import React from 'react';
import { Check, Trash2, Calendar } from 'lucide-react';
import { PrepTask } from '../../types';
import { useEvents } from '../../context/EventContext';
import { formatShortDate, cn } from '../../lib/utils';

interface TaskItemProps {
  task: PrepTask;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask } = useEvents();

  const priorityStyles = {
    high: 'text-[#FF7138] bg-[#22251F] border-[#353830]',
    medium: 'text-[#C6FF3D] bg-[#22251F] border-[#353830]',
    low: 'text-[#A5A89F] bg-[#1A1D19] border-[#353830]',
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <div
      className={cn(
        'group flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200',
        task.isCompleted
          ? 'bg-[#151713] border-[#292D27] opacity-60'
          : 'bg-[#1A1D19] border-[#353830] hover:border-[#C6FF3D]/60 hover:bg-[#22251F]'
      )}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 mt-0.5 sm:mt-0 focus:outline-none focus:ring-1 focus:ring-[#C6FF3D]',
            task.isCompleted
              ? 'bg-[#C6FF3D] border-[#C6FF3D] text-[#111311]'
              : 'border-[#353830] bg-[#151713] hover:border-[#C6FF3D] text-transparent'
          )}
          aria-label={task.isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-xs sm:text-sm font-medium transition-all text-[#F3F0E8]',
              task.isCompleted && 'line-through text-[#777C72]'
            )}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.eventTitle && (
              <span className="text-[11px] text-[#C6FF3D] bg-[#22251F] px-2 py-0.5 rounded border border-[#353830]">
                {task.eventTitle}
              </span>
            )}

            <div className="flex items-center gap-1 text-[11px] text-[#A5A89F]">
              <Calendar className="w-3 h-3 text-[#777C72]" />
              <span>Due {formatShortDate(task.dueDate)}</span>
              {task.dueTime && <span>• {task.dueTime}</span>}
            </div>

            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded border font-medium',
                priorityStyles[task.priority]
              )}
            >
              {priorityLabels[task.priority]}
            </span>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#777C72] hover:text-[#FF7138] rounded-lg hover:bg-[#151713] transition-all flex-shrink-0"
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
