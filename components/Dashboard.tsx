
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Project } from '../types';
import { 
  Calendar, Share2, CheckCircle2, Clock, Trash2, ArrowRight, GripVertical, FileText, ChevronDown, ChevronUp, X as CloseIcon
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardProps {
  project: Project;
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
  onUpdateTasks: (projectId: string, updatedTasks: Task[]) => void;
  onDeleteProject: () => void;
}

interface SortableTaskItemProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onPushToTomorrow: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ 
  task, 
  onUpdateTask, 
  onPushToTomorrow, 
  onToggleComplete 
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-lg border transition-all duration-200 flex flex-col hover:border-slate-400 ${
        task.completionPercent === 100 ? 'border-slate-100 bg-slate-50/30' : 'border-slate-200'
      }`}
    >
      <div className="p-3 md:p-4 flex items-start gap-2 md:gap-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-1 rounded"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <button 
          onClick={() => onToggleComplete(task)}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-all ${
            task.completionPercent === 100 
              ? 'bg-black border-black text-white' 
              : 'bg-white border-slate-300 text-transparent hover:border-slate-600'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 pr-2 overflow-hidden">
              <input
                type="text"
                className={`w-full bg-transparent focus:outline-none font-medium text-slate-800 transition-all text-[13px] md:text-sm ${
                  task.completionPercent === 100 ? 'line-through text-slate-400' : ''
                }`}
                value={task.content}
                onChange={(e) => onUpdateTask({ ...task, content: e.target.value })}
              />
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  task.type === 'review' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 
                  task.type === 'check' ? 'bg-slate-800 text-white' : 
                  'bg-white text-slate-500 border border-slate-200'
                }`}>
                  {task.type}
                </span>
                <button 
                  onClick={() => setIsNotesOpen(!isNotesOpen)}
                  className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase transition-colors ${
                    task.notes ? 'text-black underline' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FileText className="w-2.5 h-2.5" />
                  Notes
                </button>
              </div>
            </div>

            <button 
              onClick={() => onPushToTomorrow(task)}
              className="p-1.5 text-slate-300 hover:text-black transition-all"
              title="Push to Tomorrow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-400 transition-all duration-500" 
                style={{ width: `${task.completionPercent}%` }}
              />
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={task.completionPercent}
              onChange={(e) => onUpdateTask({ ...task, completionPercent: Number(e.target.value) })}
              className="w-20 md:w-24 h-1 bg-transparent appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>
      </div>

      {isNotesOpen && (
        <div className="px-4 pb-4 pt-0 md:px-5 md:pb-5 ml-10">
          <textarea
            className="w-full bg-white border border-slate-200 rounded p-3 text-[12px] text-slate-600 focus:outline-none focus:border-slate-400 transition-all resize-none placeholder:text-slate-300"
            placeholder="Details or reflections..."
            rows={2}
            value={task.notes || ''}
            onChange={(e) => onUpdateTask({ ...task, notes: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

const CalendarSyncModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  date: string;
}> = ({ isOpen, onClose, onConfirm, date }) => {
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('19:00');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Sync Calendar</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Start</label>
              <input 
                type="time" 
                className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-black focus:outline-none"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">End</label>
              <input 
                type="time" 
                className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:border-black focus:outline-none"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={() => onConfirm(startTime, endTime)}
            className="w-full bg-black text-white font-bold py-3 rounded text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Confirm & Sync
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ project, tasks, onUpdateTask, onUpdateTasks, onDeleteProject }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dates = useMemo(() => {
    const d = tasks.map(t => t.date);
    return Array.from(new Set(d)).sort();
  }, [tasks]);

  useEffect(() => {
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const dailyTasks = useMemo(() => {
    return tasks
      .filter(t => t.date === selectedDate)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [tasks, selectedDate]);

  const progress = useMemo(() => {
    const currentDayTasks = tasks.filter(t => t.date === selectedDate);
    if (currentDayTasks.length === 0) return 0;
    const total = currentDayTasks.reduce((acc, curr) => acc + curr.completionPercent, 0);
    return Math.round(total / currentDayTasks.length);
  }, [tasks, selectedDate]);

  const handlePushToTomorrow = (task: Task) => {
    const currentIndex = dates.indexOf(selectedDate);
    if (currentIndex < dates.length - 1) {
      const tomorrow = dates[currentIndex + 1];
      onUpdateTask({ ...task, date: tomorrow });
    } else {
      alert("No more days in roadmap.");
    }
  };

  const executeCalendarSync = (startTime: string, endTime: string) => {
    const cleanDate = selectedDate.replace(/-/g, '');
    const startDateTime = `${cleanDate}T${startTime.replace(':', '')}00`;
    const endDateTime = `${cleanDate}T${endTime.replace(':', '')}00`;
    const taskListText = dailyTasks.map(t => `${t.completionPercent === 100 ? '[x]' : '[ ]'} ${t.content}`).join('\n');
    const details = encodeURIComponent(`Project: ${project.name}\n\nTasks:\n${taskListText}`);
    const title = encodeURIComponent(`${project.name} Focus Session`);
    const datesParam = `${startDateTime}/${endDateTime}`;
    window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}`, '_blank');
    setIsSyncModalOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = dailyTasks.findIndex((t) => t.id === active.id);
      const newIndex = dailyTasks.findIndex((t) => t.id === over.id);
      const reorderedTasks = arrayMove(dailyTasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        orderIndex: index,
      }));
      onUpdateTasks(project.id, reorderedTasks);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900 truncate tracking-tight">{project.name}</h2>
          <p className="text-[11px] text-slate-400 font-medium truncate uppercase tracking-widest">{project.goal}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button 
            onClick={() => setIsSyncModalOpen(true)}
            className="p-2 text-slate-400 hover:text-black transition-colors"
            title="Sync to Calendar"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onDeleteProject}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="bg-[#F7F7F5] border-b border-slate-200 p-3 sticky top-[68px] z-10 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide no-scrollbar max-w-3xl mx-auto">
          {dates.map((date) => {
            const dateObj = new Date(date);
            const isToday = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-md transition-all ${
                  isToday 
                    ? 'bg-black text-white shadow-sm scale-105' 
                    : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
              >
                <span className={`text-[8px] uppercase font-bold mb-0.5 ${isToday ? 'text-slate-300' : 'text-slate-400'}`}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-sm font-bold">
                  {dateObj.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Progress
            </h3>
            <span className="text-[11px] font-bold text-slate-900">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden -mt-6">
            <div 
              className="h-full bg-black transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={dailyTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {dailyTasks.length > 0 ? (
                  dailyTasks.map((task) => (
                    <SortableTaskItem 
                      key={task.id}
                      task={task}
                      onUpdateTask={onUpdateTask}
                      onPushToTomorrow={handlePushToTomorrow}
                      onToggleComplete={() => onUpdateTask({...task, completionPercent: task.completionPercent === 100 ? 0 : 100})}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-300 italic text-xs">No tasks for this day.</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <CalendarSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} onConfirm={executeCalendarSync} date={selectedDate} />
    </div>
  );
};

export default Dashboard;
