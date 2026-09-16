import React from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, settings, stats, onQuickGenerate }) {
  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 shrink-0 z-40 px-4 sm:px-6 py-2.5 w-full select-none">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Brand & App Icon */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="PaperForge Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                PaperForge
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
              {settings?.school_name || "Exam Paper Maker"}
            </p>
          </div>
        </div>

        {/* Center: Session Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1 border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider">Session:</span>
          <strong className="text-amber-400 font-semibold">{settings?.academic_session || "2026-27"}</strong>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('add-question')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Add Question"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Add Question</span>
          </button>

          <button
            onClick={onQuickGenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            title="Generate Paper with Anti-Cheating Multiple Sets"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Generate Paper</span>
          </button>
        </div>
      </div>
    </header>
  );
}
