
import React, { useState } from 'react';
import { Project, Task } from '../types';
import { ChevronLeft, Save, Calendar, CheckSquare, Edit3, Trash2 } from 'lucide-react';

interface FullRoadmapViewProps {
  project: Project;
  onBack: () => void;
  onSaveTasks: (tasks: Task[]) => void;
}

const FullRoadmapView: React.FC<FullRoadmapViewProps> = ({ project, onBack, onSaveTasks }) => {
  const [editedTasks, setEditedTasks] = useState<Task[]>(project.tasks || []);

  const updateTask = (id: string, updates: Partial<Task>) => {
    setEditedTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setEditedTasks(prev => prev.filter(t => t.id !== id));
  };

  // Group tasks by date
  const groupedTasks = editedTasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const dates = Object.keys(groupedTasks).sort();

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      <header className="p-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{project.name} - Roadmap View</h2>
            <p className="text-xs text-slate-500">Edit your full schedule</p>
          </div>
        </div>
        <button 
          onClick={() => onSaveTasks(editedTasks)}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          {dates.map((date) => (
            <div key={date} className="relative pl-8 border-l-2 border-slate-100 pb-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-500" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              
              <div className="space-y-3">
                {groupedTasks[date].map((task) => (
                  <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-all flex items-center gap-4 group">
                    <CheckSquare className={`w-5 h-5 ${task.completionPercent === 100 ? 'text-indigo-600' : 'text-slate-200'}`} />
                    <input 
                      type="text" 
                      className={`flex-1 bg-transparent focus:outline-none font-medium text-slate-700 ${task.completionPercent === 100 ? 'line-through text-slate-400' : ''}`}
                      value={task.content}
                      onChange={(e) => updateTask(task.id, { content: e.target.value })}
                    />
                    <select 
                      className="text-[10px] font-bold uppercase bg-slate-50 px-2 py-1 rounded border-none focus:ring-0 text-slate-500"
                      value={task.type}
                      onChange={(e) => updateTask(task.id, { type: e.target.value as any })}
                    >
                      <option value="normal">Normal</option>
                      <option value="review">Review</option>
                      <option value="check">Check</option>
                    </select>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullRoadmapView;
