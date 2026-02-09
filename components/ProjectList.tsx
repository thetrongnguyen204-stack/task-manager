
import React from 'react';
import { Project } from '../types';
import { Folder, ArrowRight, Calendar, Clock, Target } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onNewProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onNewProject }) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-slate-400 text-[13px] mt-1">Manage your active roadmaps</p>
        </div>
        <button 
          onClick={onNewProject}
          className="bg-black text-white px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
        >
          New Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {projects.length > 0 ? (
          projects.map(p => (
            <div 
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="bg-white border border-slate-200 rounded-lg p-5 cursor-pointer hover:border-black transition-all group flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-3 mb-1">
                  <Folder className="w-4 h-4 text-slate-400" />
                  <h3 className="font-bold text-slate-900 text-[15px] truncate">{p.name}</h3>
                </div>
                <p className="text-slate-400 text-xs truncate max-w-md">{p.goal}</p>
                <div className="flex items-center gap-4 mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.startDate}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.dailyWorkTime}h/d</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="py-24 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
            <Target className="w-10 h-10 text-slate-200 mb-4" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Roadmaps</h3>
            <button 
              onClick={onNewProject}
              className="mt-4 text-xs font-bold text-black underline underline-offset-4 hover:text-slate-600"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
