import React from 'react';
import { LayoutDashboard, FileSearch, Bot, Sparkles, Library, LogOut, ShieldCheck } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onSignOut }) => {
  
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PLAGIARISM, label: 'Plagiarism Checker', icon: FileSearch },
    { id: AppView.AI_DETECTOR, label: 'AI Content Detector', icon: Bot },
    { id: AppView.HUMANIZER, label: 'Humanize Content', icon: Sparkles },
    { id: AppView.LIBRARY, label: 'My Library', icon: Library },
  ];

  return (
    <aside className="w-64 bg-scholar-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20 shadow-xl border-r border-scholar-800">
      <div className="p-6 flex items-center gap-3 border-b border-scholar-800">
        <ShieldCheck className="w-8 h-8 text-scholar-gold" />
        <div>
          <h1 className="font-serif font-bold text-xl tracking-wide text-white">ScholarGuard</h1>
          <p className="text-xs text-scholar-gold uppercase tracking-widest">Academic Integrity</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-scholar-800 text-scholar-gold border-l-4 border-scholar-gold shadow-md' 
                  : 'text-gray-400 hover:bg-scholar-800 hover:text-white'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-scholar-gold' : 'group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-scholar-800">
        <div className="bg-scholar-800 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-400 mb-1">Institution Plan</p>
          <p className="text-sm font-semibold text-white">University of Science</p>
        </div>
        <button 
          onClick={onSignOut}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full px-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};