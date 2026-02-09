
import React, { useState } from 'react';
import { Layout as LayoutIcon, Calendar, PlusCircle, Briefcase, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'dashboard' | 'setup' | 'projects';
  onNavigate: (view: 'dashboard' | 'setup' | 'projects') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white">
      {/* Sidebar - Desktop Only */}
      <aside 
        className={`hidden md:flex flex-col bg-[#F7F7F5] border-r border-slate-200 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center flex-shrink-0">
                <LayoutIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-slate-800 text-sm whitespace-nowrap">Task Master</h1>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <LayoutIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1 hover:bg-slate-200 rounded-md text-slate-400 transition-colors ${isSidebarCollapsed ? 'mt-4' : ''}`}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem 
            icon={<Calendar className="w-4 h-4" />} 
            label="Today's Focus" 
            isActive={activeView === 'dashboard'} 
            isCollapsed={isSidebarCollapsed}
            onClick={() => onNavigate('dashboard')} 
          />
          <NavItem 
            icon={<Briefcase className="w-4 h-4" />} 
            label="All Projects" 
            isActive={activeView === 'projects'} 
            isCollapsed={isSidebarCollapsed}
            onClick={() => onNavigate('projects')} 
          />
          <NavItem 
            icon={<PlusCircle className="w-4 h-4" />} 
            label="New Roadmap" 
            isActive={activeView === 'setup'} 
            isCollapsed={isSidebarCollapsed}
            onClick={() => onNavigate('setup')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              AI Task Master v1.0
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0 bg-white">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeView === 'dashboard' ? 'text-black' : 'text-slate-400'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Focus</span>
        </button>
        <button
          onClick={() => onNavigate('projects')}
          className={`flex flex-col items-center gap-1 ${activeView === 'projects' ? 'text-black' : 'text-slate-400'}`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Projects</span>
        </button>
        <button
          onClick={() => onNavigate('setup')}
          className={`flex flex-col items-center gap-1 ${activeView === 'setup' ? 'text-black' : 'text-slate-400'}`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">New</span>
        </button>
      </nav>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all group ${
      isActive 
        ? 'bg-white text-black shadow-sm ring-1 ring-slate-200' 
        : 'text-slate-600 hover:bg-slate-200/50'
    }`}
    title={isCollapsed ? label : ''}
  >
    <span className={`${isActive ? 'text-black' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
    {!isCollapsed && <span className="font-medium text-[13px] whitespace-nowrap">{label}</span>}
  </button>
);

export default Layout;
