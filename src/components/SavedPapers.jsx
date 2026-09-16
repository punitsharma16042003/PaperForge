import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Eye,
  Trash2,
  Copy,
  Printer,
  FileDown,
  Calendar,
  Layers,
  CopyCheck,
  ArrowRight
} from 'lucide-react';

export default function SavedPapers({
  papers = [],
  onSelectPaper,
  onDeletePaper,
  onDuplicatePaper,
  setActiveTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  const filteredPapers = papers.filter(p => {
    if (filterClass !== 'all' && String(p.class_level) !== filterClass) return false;
    if (filterSubject !== 'all' && p.subject !== filterSubject) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const inTitle = p.title && p.title.toLowerCase().includes(s);
      const inExam = p.exam_name && p.exam_name.toLowerCase().includes(s);
      const inSubj = p.subject && p.subject.toLowerCase().includes(s);
      if (!inTitle && !inExam && !inSubj) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-orange-400" />
            <span>Saved Exam Papers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access past question papers, view generated sets (Set A, B, C, D), re-download, or duplicate.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('paper-generator')}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95"
        >
          <span>Generate New Paper</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved papers by title, subject, exam name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Classes</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Subjects</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800">
          <FolderArchive className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">No Saved Papers Found</h3>
          <p className="text-xs text-slate-400 mb-4">Generate and save an exam paper to view it here.</p>
          <button
            onClick={() => setActiveTab('paper-generator')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
          >
            Create Your First Paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map(paper => {
            const setKeys = paper.sets ? Object.keys(paper.sets) : ['Set A'];

            return (
              <div
                key={paper.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/70 p-5 transition space-y-4 flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                      Class {paper.class_level}
                    </span>
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {paper.total_marks} Marks
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition truncate">
                    {paper.title || `${paper.subject} Exam`}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span>{paper.subject}</span>
                    <span>•</span>
                    <span>{paper.exam_name}</span>
                    <span>•</span>
                    <span>{paper.time_allowed}</span>
                  </div>

                  {/* Sets Badge */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <CopyCheck className="w-3.5 h-3.5 text-amber-400" />
                      Sets:
                    </span>
                    {setKeys.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicatePaper && onDuplicatePaper(paper)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="Duplicate Paper"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePaper && onDeletePaper(paper.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectPaper) onSelectPaper(paper);
                      setActiveTab('paper-preview');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 group-hover:border-amber-500/40 transition"
                  >
                    <span>Open & Print</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
