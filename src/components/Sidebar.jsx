import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  SlidersHorizontal,
  Sparkles,
  CheckSquare,
  Eye,
  KeyRound,
  FolderArchive,
  Building2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-question', label: 'Add Question', icon: PlusCircle },
  { id: 'import-questions', label: 'Import Questions', icon: FileSpreadsheet },
  { id: 'pattern-marks', label: 'Question Pattern & Marks', icon: SlidersHorizontal },
  { id: 'paper-generator', label: 'Paper Generator', icon: Sparkles },
  { id: 'custom-exam', label: 'Custom Exam Paper', icon: CheckSquare },
  { id: 'paper-preview', label: 'Paper Preview', icon: Eye },
  { id: 'answer-key', label: 'Answer Key', icon: KeyRound },
  { id: 'saved-papers', label: 'Saved Papers', icon: FolderArchive },
  { id: 'school-settings', label: 'School Settings', icon: Building2 },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`no-print shrink-0 bg-slate-900 border-r border-slate-800 h-full overflow-y-auto flex flex-col transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-14 p-1.5' : 'w-60 p-2.5'
      }`}
    >
      {/* Sidebar Header with Collapse Toggle */}
      <div className={`flex items-center justify-between pb-2 mb-1.5 border-b border-slate-800 ${collapsed ? 'px-1' : 'px-2'}`}>
        {!collapsed && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Navigation
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition mx-auto cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar for Full Width View'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav items list */}
      <div className="space-y-0.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center text-xs font-medium transition-colors cursor-pointer ${
                collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } ${
                isActive
                  ? 'bg-slate-800/90 text-amber-400 border-l-2 border-amber-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
