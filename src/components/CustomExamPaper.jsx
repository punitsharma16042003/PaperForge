import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Search,
  Filter,
  Bookmark,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Award,
  HelpCircle,
  Printer,
  Eye,
  Layers,
  Settings2,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck
} from 'lucide-react';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../utils/excelHelper';
import { RenderMathText } from '../utils/mathRenderer';

const EXAM_TYPES = [
  'Unit Test',
  'Periodic Test',
  'Monthly Test',
  'Mid-Term Exam',
  'Half-Yearly Exam',
  'Annual Exam',
  'Pre-Board Exam',
  'Practice Paper',
  'Custom Paper'
];

const DEFAULT_SECTIONS = [
  { id: 'sec-a', name: 'Section A', description: 'Multiple Choice Questions carrying 1 mark each', defaultMarks: 1 },
  { id: 'sec-b', name: 'Section B', description: 'Very Short Answer Questions carrying 2 marks each', defaultMarks: 2 },
  { id: 'sec-c', name: 'Section C', description: 'Short Answer Questions carrying 3 marks each', defaultMarks: 3 },
  { id: 'sec-d', name: 'Section D', description: 'Long Answer Questions carrying 5 marks each', defaultMarks: 5 },
  { id: 'sec-e', name: 'Section E', description: 'Case Study / Passage-Based Assessment Questions carrying 4 marks each', defaultMarks: 4 }
];

export default function CustomExamPaper({
  questions = [],
  settings = {},
  onGeneratePaper,
  setActiveTab
}) {
  // Exam Header Configuration
  const [classLevel, setClassLevel] = useState('10');
  const [subject, setSubject] = useState('Science');
  const [examName, setExamName] = useState('Custom Exam Paper');
  const [academicSession, setAcademicSession] = useState(settings?.academic_session || '2026-27');
  const [schoolName, setSchoolName] = useState(settings?.school_name || 'DELHI PUBLIC SCHOOL');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeAllowed, setTimeAllowed] = useState(settings?.default_time_allowed || '3 Hours');
  const [teacherName, setTeacherName] = useState('');

  // Anti-Cheating Multi-Sets options
  const [generateMultipleSets, setGenerateMultipleSets] = useState(true);
  const [numSets, setNumSets] = useState(4);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);

  // Sections State
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [activeTargetSectionId, setActiveTargetSectionId] = useState('sec-a');

  // Selected Questions mapping: { [sectionId]: [question1, question2, ...] }
  const [selectedQuestionsBySection, setSelectedQuestionsBySection] = useState({
    'sec-a': [],
    'sec-b': [],
    'sec-c': [],
    'sec-d': [],
    'sec-e': []
  });

  // Filter and Search states for Question Bank
  const [chapterFilter, setChapterFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAnswerId, setPreviewAnswerId] = useState(null);

  // Dynamic available classes and subjects from question bank
  const availableClasses = useMemo(() => {
    const clsSet = new Set(['6', '7', '8', '9', '10', '11', '12']);
    questions.forEach(q => {
      const c = String(q.class_level).replace(/Class\s*/i, '').trim();
      if (c) clsSet.add(c);
    });
    return Array.from(clsSet).sort((a, b) => Number(a) - Number(b));
  }, [questions]);

  const availableSubjects = useMemo(() => {
    const subSet = new Set(['Science', 'Mathematics', 'Social Science', 'English', 'Physics', 'Chemistry', 'Biology']);
    questions.forEach(q => {
      if (q.subject && q.subject.trim()) subSet.add(q.subject.trim());
    });
    return Array.from(subSet);
  }, [questions]);

  // Dynamic available chapters for chosen class and subject
  const availableChapters = useMemo(() => {
    const chapSet = new Set();
    questions.forEach(q => {
      const matchCls = String(q.class_level).replace(/Class\s*/i, '').trim() === classLevel;
      const matchSubj = !subject || String(q.subject).toLowerCase() === subject.toLowerCase();
      if (matchCls && matchSubj && q.chapter && q.chapter.trim()) {
        chapSet.add(q.chapter.trim());
      }
    });
    return Array.from(chapSet);
  }, [questions, classLevel, subject]);

  // Set of all question IDs currently selected in the paper
  const selectedQuestionIdSet = useMemo(() => {
    const idSet = new Map(); // questionId -> sectionId
    Object.entries(selectedQuestionsBySection).forEach(([secId, qList]) => {
      (qList || []).forEach(q => idSet.set(q.id, secId));
    });
    return idSet;
  }, [selectedQuestionsBySection]);

  // Filtered Question Bank candidates
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const qCls = String(q.class_level).replace(/Class\s*/i, '').trim();
      if (qCls !== classLevel) return false;

      if (subject && q.subject && q.subject.toLowerCase() !== subject.toLowerCase()) {
        return false;
      }

      if (chapterFilter !== 'all' && (!q.chapter || q.chapter.toLowerCase() !== chapterFilter.toLowerCase())) {
        return false;
      }

      if (typeFilter !== 'all' && q.question_type !== typeFilter) {
        return false;
      }

      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const inText = q.question_text && q.question_text.toLowerCase().includes(s);
        const inChapter = q.chapter && q.chapter.toLowerCase().includes(s);
        const inTopic = q.topic && q.topic.toLowerCase().includes(s);
        if (!inText && !inChapter && !inTopic) return false;
      }

      return true;
    });
  }, [questions, classLevel, subject, chapterFilter, typeFilter, difficultyFilter, searchQuery]);

  // Summary counts
  const totalQuestionsSelected = useMemo(() => {
    return Object.values(selectedQuestionsBySection).reduce((sum, list) => sum + (list ? list.length : 0), 0);
  }, [selectedQuestionsBySection]);

  const totalMarksCalculated = useMemo(() => {
    return Object.entries(selectedQuestionsBySection).reduce((total, [secId, list]) => {
      const sec = sections.find(s => s.id === secId);
      const defaultM = sec?.defaultMarks || 1;
      return total + (list || []).reduce((sSum, q) => sSum + (Number(q.marks) || defaultM), 0);
    }, 0);
  }, [selectedQuestionsBySection, sections]);

  // Add Question to a Section
  const handleAddQuestionToSection = (q, targetSectionId = activeTargetSectionId) => {
    const secId = targetSectionId || sections[0]?.id || 'sec-a';
    setSelectedQuestionsBySection(prev => {
      // Remove from any existing section first
      const updated = {};
      Object.keys(prev).forEach(key => {
        updated[key] = (prev[key] || []).filter(item => item.id !== q.id);
      });
      // Add to target section
      updated[secId] = [...(updated[secId] || []), q];
      return updated;
    });
  };

  // Remove Question from a Section
  const handleRemoveQuestion = (questionId, secId) => {
    setSelectedQuestionsBySection(prev => ({
      ...prev,
      [secId]: (prev[secId] || []).filter(q => q.id !== questionId)
    }));
  };

  // Move Question within a Section
  const handleMoveQuestion = (secId, index, direction) => {
    setSelectedQuestionsBySection(prev => {
      const list = [...(prev[secId] || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, [secId]: list };
    });
  };

  // Clear all selected questions
  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to clear all selected questions?')) return;
    const cleared = {};
    sections.forEach(s => { cleared[s.id] = []; });
    setSelectedQuestionsBySection(cleared);
  };

  // Create new Section
  const handleAddNewSection = () => {
    const nextChar = String.fromCharCode(65 + sections.length);
    const newSecId = `sec-${nextChar.toLowerCase()}-${Date.now()}`;
    const newSection = {
      id: newSecId,
      name: `Section ${nextChar}`,
      description: `Questions for Section ${nextChar}`,
      defaultMarks: 1
    };
    setSections(prev => [...prev, newSection]);
    setSelectedQuestionsBySection(prev => ({ ...prev, [newSecId]: [] }));
    setActiveTargetSectionId(newSecId);
  };

  // Final Generate Action
  const handleCreateCustomPaper = async () => {
    if (totalQuestionsSelected === 0) {
      alert('Please select at least 1 question to create the exam paper.');
      return;
    }

    // Assemble sections that contain questions
    const compiledSections = sections
      .filter(sec => (selectedQuestionsBySection[sec.id] || []).length > 0)
      .map(sec => {
        const secQuestions = selectedQuestionsBySection[sec.id] || [];
        return {
          name: sec.name,
          description: sec.description || `All questions in this section carry marks as specified.`,
          marks_each: sec.defaultMarks || 1,
          questions: secQuestions.map(q => ({
            ...q,
            marks: Number(q.marks) || sec.defaultMarks || 1
          }))
        };
      });

    const paperPayload = {
      title: `${schoolName} - ${examName} (${academicSession})`,
      school_name: schoolName,
      school_logo: settings?.school_logo || '/logo.png',
      academic_session: academicSession,
      class_level: classLevel,
      subject,
      exam_name: examName,
      exam_date: examDate,
      time_allowed: timeAllowed,
      total_marks: totalMarksCalculated,
      teacher_name: teacherName,
      general_instructions: settings?.default_instructions || [
        `This question paper contains ${compiledSections.length} sections.`,
        'All questions are compulsory. Internal choices are provided wherever applicable.',
        'Use of calculators or electronic devices is strictly prohibited.',
        'Draw neat and clean diagrams wherever necessary.'
      ],
      sections: compiledSections,
      // Anti-cheating options passed to backend sets generator
      is_multi_set: generateMultipleSets,
      generate_multiple_sets: generateMultipleSets,
      num_sets: generateMultipleSets ? numSets : 1,
      set_names: generateMultipleSets ? ['Set A', 'Set B', 'Set C', 'Set D'].slice(0, numSets) : ['Set A'],
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions,
      swap_equivalent: false,
      anti_cheating: {
        enabled: generateMultipleSets,
        num_sets: generateMultipleSets ? numSets : 1,
        shuffle_questions: shuffleQuestions,
        shuffle_options: shuffleOptions,
        swap_equivalent: false
      }
    };

    if (onGeneratePaper) {
      await onGeneratePaper(paperPayload);
      setActiveTab('paper-preview');
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 uppercase tracking-widest text-[10px]">
              Manual Question Picker
            </span>
            <span>•</span>
            <span>Custom Exam Paper</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>Custom Exam Paper Builder</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manually hand-pick exact questions from your question bank, organize them into sections, and generate an exam paper.
          </p>
        </div>

        {/* Action Buttons & Counters */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 flex items-center gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
              <strong className="text-amber-400 text-sm font-black">{totalQuestionsSelected}</strong>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks</span>
              <strong className="text-emerald-400 text-sm font-black">{totalMarksCalculated}M</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateCustomPaper}
            disabled={totalQuestionsSelected === 0}
            className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs transition cursor-pointer active:scale-95 ${
              totalQuestionsSelected > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Exam Paper</span>
          </button>
        </div>
      </div>

      {/* Exam Configuration Form (Collapsible/Crisp) */}
      <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          <span>Paper Metadata & Anti-Cheating Settings</span>
        </h3>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Examination Title *</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. Unit Test 1, Mid-Term Exam"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Class Level *</label>
            <select
              value={classLevel}
              onChange={(e) => {
                setClassLevel(e.target.value);
                setChapterFilter('all');
              }}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            >
              {availableClasses.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Subject *</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setChapterFilter('all');
              }}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            >
              {availableSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Time Allowed</label>
            <input
              type="text"
              value={timeAllowed}
              onChange={(e) => setTimeAllowed(e.target.value)}
              placeholder="e.g. 3 Hours"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Row 2: Anti-Cheating & Multi-Sets */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={generateMultipleSets}
                onChange={(e) => setGenerateMultipleSets(e.target.checked)}
                className="accent-amber-500"
              />
              <span className="text-xs font-bold text-slate-200">
                Generate Multiple Sets (Anti-Cheating)
              </span>
            </label>

            {generateMultipleSets && (
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumSets(num)}
                    className={`px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
                      numSets === num
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Sets
                  </button>
                ))}
              </div>
            )}

            {generateMultipleSets && (
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Jumble Questions</span>
              </label>
            )}

            {generateMultipleSets && (
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Permute Options</span>
              </label>
            )}
          </div>

          <div className="text-[11px] text-slate-400">
            School: <strong className="text-slate-200">{schoolName}</strong> ({academicSession})
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Layout: Left = Question Bank Picker, Right = Paper Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT PANE: QUESTION BANK BROWSER & PICKER (7 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Available Question Bank
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800">
                {filteredQuestions.length} Found
              </span>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Chapter Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Chapter Scope
                </label>
                <select
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="all">All Chapters ({availableChapters.length})</option>
                  {availableChapters.map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>

              {/* Question Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Question Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Types</option>
                  {QUESTION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Difficulties</option>
                  {DIFFICULTY_LEVELS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Bar & Quick Target Section Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by statement or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                  Default Target:
                </span>
                <select
                  value={activeTargetSectionId}
                  onChange={(e) => setActiveTargetSectionId(e.target.value)}
                  className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name} ({s.defaultMarks}M)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Question Cards List */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 p-6">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">No Matching Questions Found</h4>
              <p className="text-xs text-slate-400 mb-3">
                Try selecting "All Chapters" or adjusting filters for Class {classLevel} {subject}.
              </p>
              <button
                onClick={() => {
                  setChapterFilter('all');
                  setTypeFilter('all');
                  setDifficultyFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => {
                const assignedSecId = selectedQuestionIdSet.get(q.id);
                const isSelected = Boolean(assignedSecId);
                const assignedSection = sections.find(s => s.id === assignedSecId);
                const isExpanded = previewAnswerId === q.id;

                return (
                  <div
                    key={q.id || idx}
                    className={`bg-slate-900 border transition p-4 space-y-3 ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-500/[0.02] shadow-sm'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Top: Badges & Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {q.marks || 1} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700">
                          {q.question_type}
                        </span>
                        {q.chapter && (
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800">
                            {q.chapter}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 ${
                          q.difficulty === 'Easy'
                            ? 'text-emerald-400'
                            : q.difficulty === 'Hard'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}>
                          {q.difficulty || 'Medium'}
                        </span>
                      </div>

                      {/* Add/Remove Action Controls */}
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 border border-amber-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>In {assignedSection?.name || 'Paper'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id, assignedSecId)}
                              className="px-2 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-bold transition"
                              title="Remove from paper"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <select
                              defaultValue={activeTargetSectionId}
                              onChange={(e) => handleAddQuestionToSection(q, e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] px-2 py-1 focus:outline-none"
                            >
                              {sections.map(s => (
                                <option key={s.id} value={s.id}>Add to {s.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAddQuestionToSection(q, activeTargetSectionId)}
                              className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="text-xs text-slate-200 leading-relaxed pl-1 font-medium">
                      <RenderMathText text={q.question_text} />
                    </div>

                    {/* Diagram Preview */}
                    {q.diagram_url && (
                      <div className="p-2 bg-slate-950 border border-slate-800 max-w-xs">
                        <img
                          src={q.diagram_url}
                          alt={q.diagram_caption || 'Question Diagram'}
                          className="max-h-28 object-contain mx-auto"
                        />
                        {q.diagram_caption && (
                          <p className="text-[10px] text-slate-400 text-center mt-1 italic">
                            {q.diagram_caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* MCQ Options Preview */}
                    {q.question_type === 'MCQ' && q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 pl-1">
                        {q.options.map(opt => (
                          <div
                            key={opt.id}
                            className={`p-1.5 text-[11px] border flex items-center gap-1.5 ${
                              opt.is_correct
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-bold text-[10px] text-slate-400">({opt.id})</span>
                            <RenderMathText text={opt.text} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Solution Toggle */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewAnswerId(isExpanded ? null : q.id)}
                        className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Solution' : 'View Solution & Marking Key'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {q.topic && (
                        <span className="text-[10px] text-slate-500">Topic: {q.topic}</span>
                      )}
                    </div>

                    {/* Expanded Solution */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                        <div className="font-bold text-amber-400 text-[11px]">Solution / Expected Answer:</div>
                        <div className="text-slate-200">
                          <RenderMathText text={q.answer_text || 'No solution recorded.'} />
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-400 mt-1 italic border-t border-slate-800/60 pt-1">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: EXAM PAPER SECTIONS & SELECTED QUESTIONS (5 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 sticky top-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Exam Paper Structure ({totalQuestionsSelected} Questions)
                </h3>
              </div>

              {totalQuestionsSelected > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-400 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Sections Accordion / Cards */}
            <div className="space-y-3">
              {sections.map((sec, secIdx) => {
                const secQuestions = selectedQuestionsBySection[sec.id] || [];
                const secMarksTotal = secQuestions.reduce((s, q) => s + (Number(q.marks) || sec.defaultMarks || 1), 0);
                const isActive = activeTargetSectionId === sec.id;

                return (
                  <div
                    key={sec.id}
                    className={`border transition ${
                      isActive ? 'bg-slate-950/80 border-amber-500/80' : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => setActiveTargetSectionId(sec.id)}
                      className="p-3 cursor-pointer flex items-center justify-between border-b border-slate-800/80 hover:bg-slate-800/30 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{sec.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {sec.defaultMarks}M Each
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {sec.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-400 block">
                          {secQuestions.length} Q ({secMarksTotal}M)
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-500">
                          {isActive ? 'Target Active' : 'Click to Set Target'}
                        </span>
                      </div>
                    </div>

                    {/* Questions in this section */}
                    {secQuestions.length === 0 ? (
                      <div className="p-3 text-center text-[11px] text-slate-500 italic">
                        No questions in {sec.name}. Pick questions on the left.
                      </div>
                    ) : (
                      <div className="p-2 space-y-1.5 divide-y divide-slate-800/40">
                        {secQuestions.map((q, qIndex) => (
                          <div
                            key={q.id || qIndex}
                            className="pt-1.5 flex items-start justify-between gap-2 text-xs"
                          >
                            <div className="flex items-start gap-1.5 flex-1 min-w-0">
                              <span className="font-mono text-[11px] font-bold text-slate-400 shrink-0">
                                Q{qIndex + 1}.
                              </span>
                              <div className="min-w-0">
                                <p className="text-[11px] text-slate-200 line-clamp-2 leading-tight">
                                  {q.question_text}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-0.5">
                                  <span className="font-bold text-amber-400/90">{q.marks || sec.defaultMarks}M</span>
                                  <span>•</span>
                                  <span>{q.question_type}</span>
                                  {q.chapter && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[100px]">{q.chapter}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reorder and Delete controls */}
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                disabled={qIndex === 0}
                                onClick={() => handleMoveQuestion(sec.id, qIndex, -1)}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                                title="Move up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={qIndex === secQuestions.length - 1}
                                onClick={() => handleMoveQuestion(sec.id, qIndex, 1)}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                                title="Move down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(q.id, sec.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                title="Remove question"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Custom Section Button */}
              <button
                type="button"
                onClick={handleAddNewSection}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Section</span>
              </button>
            </div>

            {/* Bottom Final Action */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={handleCreateCustomPaper}
                disabled={totalQuestionsSelected === 0}
                className={`w-full py-3 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                  totalQuestionsSelected > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <FileCheck className="w-4 h-4 text-slate-950" />
                <span>Create Exam Paper ({totalQuestionsSelected} Questions • {totalMarksCalculated}M)</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center">
                Generates full printable exam paper + Word (.docx) export + multi-set keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
