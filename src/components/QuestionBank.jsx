import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Copy,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { RenderMathText } from '../utils/mathRenderer';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../utils/excelHelper';

const AVAILABLE_TAGS = [
  'important',
  'repeated',
  'board question',
  'conceptual',
  'numerical',
  'diagram-based'
];

export default function QuestionBank({
  questions = [],
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  setActiveTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Extract distinct classes and subjects
  const classes = useMemo(() => {
    const set = new Set(questions.map(q => String(q.class_level || '')).filter(Boolean));
    return Array.from(set).sort();
  }, [questions]);

  const subjects = useMemo(() => {
    const set = new Set(questions.map(q => q.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [questions]);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedClass !== 'all' && String(q.class_level) !== selectedClass) return false;
      if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
      if (selectedType !== 'all' && q.question_type !== selectedType) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedTag !== 'all' && (!q.tags || !q.tags.includes(selectedTag))) return false;

      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const inText = q.question_text && q.question_text.toLowerCase().includes(s);
        const inTopic = q.topic && q.topic.toLowerCase().includes(s);
        const inChapter = q.chapter && q.chapter.toLowerCase().includes(s);
        const inAnswer = q.answer_text && q.answer_text.toLowerCase().includes(s);
        if (!inText && !inTopic && !inChapter && !inAnswer) return false;
      }

      return true;
    });
  }, [questions, selectedClass, selectedSubject, selectedType, selectedDifficulty, selectedTag, searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setSelectedTag('all');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedClass !== 'all' ||
    selectedSubject !== 'all' ||
    selectedType !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedTag !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Question Bank</span>
            <span className="text-xs px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 font-bold">
              {filteredQuestions.length} Questions
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store, search, and manage questions with MCQ options, diagrams, and marking schemes across Classes 9 to 12.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('import-questions')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setActiveTab('add-question')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by keyword, topic, chapter, formula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Question Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Types</option>
            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Difficulties</option>
            {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Tags</option>
            {AVAILABLE_TAGS.map(t => <option key={t} value={t}>Tag: {t}</option>)}
          </select>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className={`px-3 py-1.5 border text-xs font-semibold transition ${
              hasActiveFilters
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Questions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query or filters, or add new questions to your bank.
          </p>
          <button
            onClick={() => setActiveTab('add-question')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
          >
            Add New Question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, index) => {
            const isExpanded = expandedId === q.id;
            const hasDiagram = !!q.diagram_url;
            const isMcq = q.question_type === 'MCQ';

            return (
              <div
                key={q.id || index}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition space-y-3"
              >
                {/* Header Row: Badges, Marks, Actions */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-950 text-slate-200 border border-slate-800 font-mono">
                      Class {q.class_level}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      {q.question_type}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {q.subject}
                    </span>
                    {q.chapter && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        • {q.chapter}
                      </span>
                    )}
                    {hasDiagram && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <ImageIcon className="w-3 h-3" />
                        <span>Diagram</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 border ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : q.difficulty === 'Hard'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Marks & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                    </span>

                    <button
                      onClick={() => onDuplicateQuestion && onDuplicateQuestion(q)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="Duplicate Question"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onEditQuestion && onEditQuestion(q)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                      title="Edit Question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteQuestion && onDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text with Math Formula rendering */}
                <div className="text-sm font-medium text-slate-100 leading-relaxed font-serif-exam">
                  <RenderMathText text={q.question_text} />
                </div>

                {/* Diagram Preview if any */}
                {q.diagram_url && (
                  <div className="my-2 p-2 bg-slate-950 inline-block border border-slate-800">
                    <img
                      src={q.diagram_url}
                      alt={q.diagram_caption || 'Question Diagram'}
                      className="max-h-48 object-contain"
                    />
                    {q.diagram_caption && (
                      <p className="text-[11px] text-slate-400 italic text-center mt-1">
                        Fig: {q.diagram_caption}
                      </p>
                    )}
                  </div>
                )}

                {/* MCQ Options Display */}
                {isMcq && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`px-3 py-2 text-xs flex items-center gap-2 border transition ${
                          opt.is_correct
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                            opt.is_correct
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="flex-1">
                          <RenderMathText text={opt.text} />
                        </span>
                        {opt.is_correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {q.tags && q.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {q.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Answer / Solution Drawer Toggle */}
                <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <span>{isExpanded ? 'Hide Solution & Marking Scheme' : 'View Solution & Marking Scheme'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[10px] text-slate-500">
                    Topic: {q.topic || 'General'}
                  </span>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-950 border border-amber-500/30 text-xs space-y-2 mt-2">
                    <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                      Answer / Marking Scheme:
                    </div>
                    <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                      <RenderMathText text={q.answer_text || 'No answer provided yet.'} />
                    </div>
                    {q.explanation && (
                      <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] italic">
                        <strong>Explanation:</strong> <RenderMathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
