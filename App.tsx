
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SetupWizard from './components/SetupWizard';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import FullRoadmapView from './components/FullRoadmapView';
import { Project, Task } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'setup' | 'projects' | 'full_roadmap'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedProjects = localStorage.getItem('taskMasterProjects');
    const lastActiveId = localStorage.getItem('lastActiveProjectId');
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects);
      setProjects(parsed);
      if (lastActiveId) setCurrentProjectId(lastActiveId);
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('taskMasterProjects', JSON.stringify(projects));
      if (currentProjectId) localStorage.setItem('lastActiveProjectId', currentProjectId);
    }
  }, [projects, currentProjectId, isInitializing]);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleProjectCreated = (newProject: Project, roadmap: any[]) => {
    const allTasks: Task[] = [];
    roadmap.forEach((day: any) => {
      day.tasks.forEach((t: any, idx: number) => {
        allTasks.push({
          id: Math.random().toString(36).substr(2, 9),
          projectId: newProject.id,
          date: day.date,
          content: t.content,
          completionPercent: 0,
          notes: '',
          orderIndex: idx,
          isBufferTask: t.isBuffer || false,
          type: t.type || 'normal'
        });
      });
    });
    const projectWithTasks = { ...newProject, tasks: allTasks };
    setProjects(prev => [projectWithTasks, ...prev]);
    setCurrentProjectId(newProject.id);
    setActiveView('dashboard');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setProjects(prev => prev.map(p => {
      if (p.id === updatedTask.projectId) {
        return { ...p, tasks: p.tasks?.map(t => t.id === updatedTask.id ? updatedTask : t) || [] };
      }
      return p;
    }));
  };

  const handleUpdateTasks = (projectId: string, updatedTasks: Task[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const taskMap = new Map((p.tasks || []).map(t => [t.id, t]));
        updatedTasks.forEach(t => taskMap.set(t.id, t));
        return { ...p, tasks: Array.from(taskMap.values()) };
      }
      return p;
    }));
  };

  const handleSaveFullRoadmap = (updatedTasks: Task[]) => {
    if (!currentProjectId) return;
    setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, tasks: updatedTasks } : p));
    setActiveView('dashboard');
  };

  const handleDeleteProject = () => {
    if (confirm("Delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== currentProjectId));
      setCurrentProjectId(null);
      setActiveView('projects');
    }
  };

  if (isInitializing) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfc]"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  const renderView = () => {
    switch (activeView) {
      case 'setup':
        return <SetupWizard onProjectCreated={handleProjectCreated} />;
      case 'dashboard':
        return currentProject ? (
          <div className="h-full flex flex-col relative">
            <Dashboard 
              project={currentProject} 
              tasks={currentProject.tasks || []} 
              onUpdateTask={handleUpdateTask} 
              onUpdateTasks={handleUpdateTasks}
              onDeleteProject={handleDeleteProject}
            />
            <button 
              onClick={() => setActiveView('full_roadmap')}
              className="fixed bottom-24 right-6 md:absolute md:bottom-8 md:right-8 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-full shadow-xl hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-widest z-40"
            >
              Roadmap Overview
            </button>
          </div>
        ) : setActiveView('projects');
      case 'full_roadmap':
        return currentProject ? (
          <FullRoadmapView 
            project={currentProject} 
            onBack={() => setActiveView('dashboard')}
            onSaveTasks={handleSaveFullRoadmap}
          />
        ) : setActiveView('projects');
      case 'projects':
      default:
        return (
          <ProjectList 
            projects={projects} 
            onSelectProject={(p) => { setCurrentProjectId(p.id); setActiveView('dashboard'); }} 
            onNewProject={() => setActiveView('setup')} 
          />
        );
    }
  };

  return (
    <Layout activeView={activeView === 'full_roadmap' ? 'projects' : activeView as any} onNavigate={(v) => setActiveView(v as any)}>
      {renderView()}
    </Layout>
  );
};

export default App;
