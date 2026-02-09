
import React, { useState, useRef } from 'react';
import { Priority, Project, FeasibilityResponse, FeasibilityOption } from '../types';
import { checkFeasibility, generateTaskRoadmap } from '../services/geminiService';
import { Loader2, Sparkles, X, AlertCircle, ArrowRight, Paperclip } from 'lucide-react';

interface SetupWizardProps {
  onProjectCreated: (project: Project, tasks: any[]) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onProjectCreated }) => {
  const [loading, setLoading] = useState(false);
  const [feasibility, setFeasibility] = useState<FeasibilityResponse | null>(null);
  const [files, setFiles] = useState<{ name: string, data: string, mimeType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    background: '',
    priority: Priority.ON_TIME,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dailyWorkTime: 2
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [...prev, {
          name: file.name,
          data: event.target?.result as string,
          mimeType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tempProject: Project = { id: 'temp', ...formData };
      const res = await checkFeasibility(tempProject, files);
      if (res.isFeasible) await generateFinalRoadmap(formData);
      else setFeasibility(res);
    } catch (error) {
      alert("Error checking feasibility.");
    } finally {
      setLoading(false);
    }
  };

  const generateFinalRoadmap = async (data: typeof formData) => {
    setLoading(true);
    try {
      const project: Project = { id: Math.random().toString(36).substr(2, 9), ...data };
      const roadmap = await generateTaskRoadmap(project, files);
      onProjectCreated(project, roadmap);
    } catch (error) {
      alert("Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const applyOption = (option: FeasibilityOption) => {
    const updatedData = { ...formData };
    if (option.type === 'hours') updatedData.dailyWorkTime = Number(option.suggestedValue);
    if (option.type === 'deadline') updatedData.endDate = String(option.suggestedValue);
    if (option.type === 'goal') updatedData.goal = String(option.suggestedValue);
    setFormData(updatedData);
    setFeasibility(null);
    generateFinalRoadmap(updatedData);
  };

  const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2";
  const inputClasses = "w-full px-4 py-3 rounded border border-slate-200 bg-white text-sm focus:border-black focus:outline-none transition-all placeholder:text-slate-300";

  if (feasibility && !feasibility.isFeasible) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6">
        <div className="border border-slate-200 rounded-lg p-8">
          <div className="flex items-center gap-2 text-slate-900 mb-6">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-bold">Adjustments Suggested</h3>
          </div>
          <p className="text-slate-500 text-[13px] mb-8 leading-relaxed">{feasibility.reasoning}</p>
          <div className="space-y-3">
            {feasibility.options?.map((opt, idx) => (
              <button key={idx} onClick={() => applyOption(opt)} className="w-full bg-white border border-slate-200 p-4 rounded-lg hover:border-black transition-all text-left group">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Solution {idx + 1}</span>
                <p className="text-slate-900 font-bold text-sm">{opt.description}</p>
              </button>
            ))}
            <button onClick={() => setFeasibility(null)} className="w-full text-slate-400 text-[10px] font-bold mt-6 uppercase tracking-widest hover:text-black transition-colors">Go Back & Edit</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Setup New Roadmap</h2>
        <p className="text-slate-400 text-sm mt-1">AI will organize your tasks into a daily schedule.</p>
      </div>

      <form onSubmit={handleInitialSubmit} className="space-y-10">
        <div className="space-y-6">
          <div>
            <label className={labelClasses}>Project Name</label>
            <input required type="text" className={inputClasses} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., HSK 1 Mandarin Proficiency" />
          </div>

          <div>
            <label className={labelClasses}>Main Goal</label>
            <textarea required className={`${inputClasses} h-24 resize-none`} value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} placeholder="Be as specific as possible..." />
          </div>

          <div>
            <label className={labelClasses}>Resources & Context</label>
            <textarea className={`${inputClasses} h-24 resize-none mb-3`} value={formData.background} onChange={(e) => setFormData({ ...formData, background: e.target.value })} placeholder="Knowledge level, available books..." />
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="border border-dashed border-slate-200 rounded p-4 bg-[#F7F7F5] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-400 transition-colors"
            >
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attach Files</span>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((f, i) => (
                  <div key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2">
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Start Date</label>
            <input required type="date" className={inputClasses} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Target End Date</label>
            <input required type="date" className={inputClasses} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Hours Per Day</label>
            <input required type="number" min="0.5" step="0.5" className={inputClasses} value={formData.dailyWorkTime} onChange={(e) => setFormData({ ...formData, dailyWorkTime: Number(e.target.value) })} />
          </div>
          <div>
            <label className={labelClasses}>Buffer Priority</label>
            <select className={inputClasses} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}>
              <option value={Priority.ON_TIME}>On-time (10% Buffer)</option>
              <option value={Priority.IN_TIME}>In-time (2% Buffer)</option>
              <option value={Priority.JUST_DONE}>Just Done (Flexible)</option>
            </select>
          </div>
        </div>

        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-black text-white font-bold py-4 rounded text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Generate Plan</>}
        </button>
      </form>
    </div>
  );
};

export default SetupWizard;
