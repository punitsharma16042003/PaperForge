import React from 'react';
import {
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  BookOpen,
  ArrowRight,
  FileText,
  CopyCheck,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { RenderMathText } from '../utils/mathRenderer';

export default function Dashboard({
  questions = [],
  papers = [],
  settings = null,
  setActiveTab,
  onSelectPaper
}) {
  const recentQuestions = [...questions].slice(0, 6);
  const recentPapers = [...papers].slice(0, 6);

  return (
    <div className="space-y-5 pb-12 w-full">
      {/* Top Professional Control Bar */}
      <div className="border border-slate-800 bg-slate-900/90 p-5 sm:p-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="PaperForge App Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                <span>{settings?.school_name || "Exam Paper Maker Studio"}</span>
                {settings?.academic_session && (
                  <span className="text-slate-500 font-mono">| {settings.academic_session}</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                PaperForge Command Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Create unit tests and board-style exam papers with anti-cheating Multiple Sets (Set A, B, C, D) and direct Excel import.
              </p>
            </div>
          </div>

          {/* Direct Action Buttons (Square Panels) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('paper-generator')}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Generate Paper</span>
            </button>
            <button
              onClick={() => setActiveTab('import-questions')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste from Excel</span>
            </button>
            <button
              onClick={() => setActiveTab('add-question')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Square Quick-Access Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('paper-generator')}
          className="border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 p-4 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition">Multi-Set Generator</h3>
              <p className="text-[11px] text-slate-400">Set A, B, C, D anti-cheating</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
        </div>

        <div
          onClick={() => setActiveTab('add-question')}
          className="border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 p-4 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">Question Manager</h3>
              <p className="text-[11px] text-slate-400">Class → Subject hierarchy</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition" />
        </div>

        <div
          onClick={() => setActiveTab('import-questions')}
          className="border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 p-4 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Excel Import</h3>
              <p className="text-[11px] text-slate-400">Class & Subject bulk upload</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
        </div>

        <div
          onClick={() => setActiveTab('pattern-marks')}
          className="border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 p-4 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition">Pattern & Marks</h3>
              <p className="text-[11px] text-slate-400">Blueprint exam structure</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
        </div>
      </div>

      {/* Main Grid: Square Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Generated Papers Panel */}
        <div className="border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Recent Generated Papers
              </h3>
              <button
                onClick={() => setActiveTab('saved-papers')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentPapers.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800">
                <FileText className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">No exam papers generated yet.</p>
                <button
                  onClick={() => setActiveTab('paper-generator')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                >
                  Create Your First Paper
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPapers.map((paper) => {
                  const setKeys = paper.sets ? Object.keys(paper.sets) : ['Set A'];

                  return (
                    <div
                      key={paper.id}
                      onClick={() => {
                        if (onSelectPaper) onSelectPaper(paper);
                        setActiveTab('paper-preview');
                      }}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition truncate">
                            {paper.title || `${paper.subject} Exam`}
                          </span>
                          {paper.is_multi_set && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {setKeys.length} Sets
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                          <span className="text-slate-300">Class {paper.class_level}</span>
                          <span>•</span>
                          <span>{paper.subject}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">{paper.total_marks} Marks</span>
                          <span>•</span>
                          <span>{paper.time_allowed}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-amber-400 shrink-0">
                        <span className="text-[11px] font-semibold hidden sm:inline">Preview</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Added Questions Panel */}
        <div className="border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Recent Added Questions
              </h3>
              <button
                onClick={() => setActiveTab('add-question')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
              >
                <span>Manage Questions</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recentQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700">
                        Class {q.class_level}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {q.question_type}
                      </span>
                      <span className="text-[11px] text-slate-400">{q.subject}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 shrink-0">
                      {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-serif-exam">
                    <RenderMathText text={q.question_text} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
