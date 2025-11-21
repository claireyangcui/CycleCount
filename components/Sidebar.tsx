import React from 'react';
import { LayoutDashboard, Bike, FileUp, Settings, BarChart3, ChevronDown } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Inventory', icon: LayoutDashboard },
    { id: 'analytics', label: 'Insights', icon: BarChart3 },
    { id: 'upload', label: 'Import', icon: FileUp },
  ];

  return (
    <div className="w-[240px] border-r border-border h-screen flex flex-col bg-sidebar flex-shrink-0 select-none">
      {/* Workspace Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-transparent hover:bg-surface/50 transition-colors cursor-pointer mb-2">
        <div className="w-5 h-5 bg-primary/20 text-primary rounded flex items-center justify-center">
            <Bike size={12} strokeWidth={2.5} />
        </div>
        <span className="font-medium text-sm text-textMain truncate flex-1">CycleCount Workspace</span>
        <ChevronDown size={14} className="text-textMuted" />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 space-y-0.5">
        <div className="px-2 py-2 text-xs font-medium text-textMuted/60 uppercase tracking-wider">
            Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-md transition-all duration-150 group ${
                isActive 
                  ? 'bg-surfaceHover text-textMain' 
                  : 'text-textMuted hover:bg-surfaceHover/50 hover:text-textMain'
              }`}
            >
              <Icon 
                size={16} 
                className={isActive ? 'text-textMain' : 'text-textMuted group-hover:text-textMain'} 
                strokeWidth={2}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-textMuted hover:text-textMain w-full transition-colors rounded-md hover:bg-surfaceHover/50">
            <Settings size={16} />
            Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;