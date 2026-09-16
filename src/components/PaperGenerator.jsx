import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  CopyCheck,
  CheckCircle2,
  SlidersHorizontal,
  Settings2,
  ShieldCheck,
  Shuffle,
  RefreshCw,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';

const EXAM_TYPES = [
  'Unit Test',
  'Monthly Test',
  'Mid-Term Exam',
  'Half-Yearly Exam',
  'Annual Exam',
  'Pre-Board Exam',
  'Practice Paper',
  'Custom Paper'
];

export default function PaperGenerator({
  questions = [],
  patterns = [],
  settings = {},
  initialBlueprint,
  onGeneratePaper,
  setActiveTab
}) {
  const [classLevel, setClassLevel] = useState('10');
  const [subject, setSubject] = useState('Science');
  const [examName, setExamName] = useState('Annual Exam');
  const [academicSession, setAcademicSession] = useState(settings?.academic_session || '2026-27');
  const [schoolName, setSchoolName] = useState(settings?.school_name || 'DELHI PUBLIC SCHOOL');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeAllowed, setTimeAllowed] = useState(settings?.default_time_allowed || '3 Hours');
  const [totalMarks, setTotalMarks] = useState(80);
  const [teacherName, setTeacherName] = useState('');
  const [generationMode, setGenerationMode] = useState('blueprint'); // 'blueprint' | 'automatic' | 'manual'
  const [selectedPatternId, setSelectedPatternId] = useState(patterns[0]?.id || '');

  // ANTI-CHEATING MULTIPLE SETS STATE
  const [generateMultipleSets, setGenerateMultipleSets] = useState(true);
  const [numSets, setNumSets] = useState(4); // 2, 3, or 4 sets
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [swapEquivalent, setSwapEquivalent] = useState(false);
  const [chapterFilter, setChapterFilter] = useState('all');

  // Compute available chapters for current class and subject
  const availableChapters = useMemo(() => {
    const chaps = new Set();
    questions.forEach(q => {
      const matchClass = String(q.class_level) === String(classLevel) ||
        String(q.class_level).toLowerCase() === `class ${classLevel}`.toLowerCase();
      const matchSubject = !subject || String(q.subject).toLowerCase() === String(subject).toLowerCase();
      if (matchClass && matchSubject && q.chapter && q.chapter.trim()) {
        chaps.add(q.chapter.trim());
      }
    });
    return Array.from(chaps);
  }, [questions, classLevel, subject]);

  // General Instructions
  const [instructions, setInstructions] = useState(
    settings?.default_instructions || [
      'This question paper contains 5 sections: Section A, B, C, D, and E.',
      'Section A consists of 1-mark Multiple Choice Questions (MCQs).',
      'Section B consists of Very Short Answer questions carrying 2 marks each.',
      'Section C consists of Short Answer questions carrying 3 marks each.',
      'Section D consists of Long Answer questions carrying 5 marks each.',
      'Section E consists of Case-Based integrated units of assessment carrying 4 marks each.',
      'All questions are compulsory. Internal choices are provided in some questions.',
      'Use of calculators is strictly prohibited.',
      'Draw neat and clean diagrams wherever necessary.'
    ]
  );

  // Apply initial blueprint if passed from Pattern tab
  useEffect(() => {
    if (initialBlueprint) {
      setClassLevel(initialBlueprint.class_level);
      setSubject(initialBlueprint.subject);
      setExamName(initialBlueprint.exam_name);
      setTotalMarks(initialBlueprint.total_marks);
    }
  }, [initialBlueprint]);

  const activePattern = patterns.find(p => p.id === selectedPatternId) || patterns[0];

  // Generation Handler
  const handleGenerate = async () => {
    // 1. Determine blueprint rows
    const patternRows = initialBlueprint?.rows || activePattern?.rows || [
      { section_name: 'Section A', question_type: 'MCQ', number_of_questions: 10, marks_each: 1 },
      { section_name: 'Section B', question_type: 'Very Short Answer', number_of_questions: 5, marks_each: 2 },
      { section_name: 'Section C', question_type: 'Short Answer', number_of_questions: 5, marks_each: 3 },
      { section_name: 'Section D', question_type: 'Long Answer', number_of_questions: 3, marks_each: 5 },
      { section_name: 'Section E', question_type: 'Case Study / Passage Based', number_of_questions: 2, marks_each: 4 }
    ];

    // 2. Select questions from question bank matching each section
    const generatedSections = [];
    const usedQuestionIds = new Set();

    patternRows.forEach(row => {
      // Find matching questions for this type, class, subject, and optional chapter
      let pool = questions.filter(q =>
        (String(q.class_level) === String(classLevel) || String(q.class_level).toLowerCase() === `class ${classLevel}`.toLowerCase()) &&
        q.question_type === row.question_type &&
        (!subject || q.subject.toLowerCase() === subject.toLowerCase()) &&
        (chapterFilter === 'all' || (q.chapter && q.chapter.toLowerCase() === chapterFilter.toLowerCase())) &&
        !usedQuestionIds.has(q.id)
      );

      // If pool is empty with chapter filter, relax chapter constraint to provide matching questions
      if (pool.length === 0 && chapterFilter !== 'all') {
        pool = questions.filter(q =>
          (String(q.class_level) === String(classLevel) || String(q.class_level).toLowerCase() === `class ${classLevel}`.toLowerCase()) &&
          q.question_type === row.question_type &&
          (!subject || q.subject.toLowerCase() === subject.toLowerCase()) &&
          !usedQuestionIds.has(q.id)
        );
      }

      // If pool is still empty, relax subject constraint to provide fallback questions
      if (pool.length === 0) {
        pool = questions.filter(q =>
          q.question_type === row.question_type && !usedQuestionIds.has(q.id)
        );
      }

      // Randomly shuffle candidate questions using Fisher-Yates algorithm
      // Guarantees fresh, newly randomized questions on EVERY generation!
      const shuffledPool = [...pool];
      for (let s = shuffledPool.length - 1; s > 0; s--) {
        const j = Math.floor(Math.random() * (s + 1));
        [shuffledPool[s], shuffledPool[j]] = [shuffledPool[j], shuffledPool[s]];
      }

      const needed = Number(row.number_of_questions) || 1;
      const selected = [];

      for (let i = 0; i < needed; i++) {
        if (shuffledPool[i]) {
          selected.push(shuffledPool[i]);
          usedQuestionIds.add(shuffledPool[i].id);
        } else {
          // Fallback mock question if pool runs dry
          selected.push({
            id: `gen_${Date.now()}_${Math.random()}`,
            class_level: classLevel,
            subject,
            chapter: 'General Unit',
            topic: 'Core Concept',
            question_type: row.question_type,
            question_text: `Sample question for ${row.section_name} covering ${subject} concepts (${row.question_type}).`,
            marks: Number(row.marks_each) || 1,
            options: row.question_type === 'MCQ' ? [
              { id: 'A', text: 'Option A Statement', is_correct: true },
              { id: 'B', text: 'Option B Statement', is_correct: false },
              { id: 'C', text: 'Option C Statement', is_correct: false },
              { id: 'D', text: 'Option D Statement', is_correct: false },
            ] : [],
            answer_text: 'Expected solution and marking point criteria.',
            difficulty: 'Medium'
          });
        }
      }

      // Group into section
      const existingSec = generatedSections.find(s => s.name === row.section_name);
      if (existingSec) {
        existingSec.questions.push(...selected);
      } else {
        generatedSections.push({
          name: row.section_name,
          description: `All questions in this section carry ${row.marks_each} mark(s) each.`,
          marks_each: row.marks_each,
          questions: selected
        });
      }
    });

    // 3. Assemble full Paper object
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
      total_marks: totalMarks,
      general_instructions: instructions,
      sections: generatedSections,
      // Anti-cheating options passed to backend sets generator
      is_multi_set: generateMultipleSets,
      generate_multiple_sets: generateMultipleSets,
      num_sets: generateMultipleSets ? numSets : 1,
      set_names: generateMultipleSets ? ['Set A', 'Set B', 'Set C', 'Set D'].slice(0, numSets) : ['Set A'],
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions,
      swap_equivalent: swapEquivalent,
      anti_cheating: {
        enabled: generateMultipleSets,
        num_sets: generateMultipleSets ? numSets : 1,
        shuffle_questions: shuffleQuestions,
        shuffle_options: shuffleOptions,
        swap_equivalent: swapEquivalent
      }
    };

    if (onGeneratePaper) {
      await onGeneratePaper(paperPayload);
      setActiveTab('paper-preview');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span>Exam Paper Generator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure exam header details, choose pattern blueprint, and generate randomized multi-set papers (Set A, B, C, D).
        </p>
      </div>

      {/* ANTI-CHEATING MULTIPLE SETS HIGHLIGHT CARD */}
      <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Anti-Cheating Multiple Sets Generator</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-amber-500 text-slate-950">
                  Recommended
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Generate randomized Set A, B, C, D to prevent copying between adjacent students.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={generateMultipleSets}
              onChange={(e) => setGenerateMultipleSets(e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-200">Enable Sets</span>
          </label>
        </div>

        {generateMultipleSets && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            {/* Number of Sets Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-200">Generate Sets:</span>
              <div className="flex items-center gap-2">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumSets(num)}
                    className={`px-3 py-1 text-xs font-bold border transition ${
                      numSets === num
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num === 2 ? '2 Sets (A, B)' : num === 3 ? '3 Sets (A, B, C)' : '4 Sets (A, B, C, D)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-Cheating Techniques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <label className="p-3 bg-slate-950 border border-slate-800 flex items-start gap-2 cursor-pointer hover:border-amber-500/40 transition">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="accent-amber-500 mt-0.5"
                />
                <div className="text-[11px]">
                  <span className="font-bold text-slate-200 block">Jumble Questions</span>
                  <span className="text-slate-400 text-[10px]">Shuffles question order in each section per set</span>
                </div>
              </label>

              <label className="p-3 bg-slate-950 border border-slate-800 flex items-start gap-2 cursor-pointer hover:border-amber-500/40 transition">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="accent-amber-500 mt-0.5"
                />
                <div className="text-[11px]">
                  <span className="font-bold text-slate-200 block">Permute MCQ Options</span>
                  <span className="text-slate-400 text-[10px]">Reorders A/B/C/D & updates answer keys automatically</span>
                </div>
              </label>

              <label className="p-3 bg-slate-950 border border-slate-800 flex items-start gap-2 cursor-pointer hover:border-amber-500/40 transition">
                <input
                  type="checkbox"
                  checked={swapEquivalent}
                  onChange={(e) => setSwapEquivalent(e.target.checked)}
                  className="accent-amber-500 mt-0.5"
                />
                <div className="text-[11px]">
                  <span className="font-bold text-slate-200 block">Variant Substitution</span>
                  <span className="text-slate-400 text-[10px]">Swaps questions with equivalent bank alternatives</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Exam Header Details Form */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          <span>Paper Header & Examination Details</span>
        </h3>

        {/* Row 1: School Name & Academic Session */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">School / Institute Name *</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Academic Session *</label>
            <input
              type="text"
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Row 2: Exam Name, Class, Subject, Chapter Scope */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Examination Name *</label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {EXAM_TYPES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Class Level *</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Chapter Scope</label>
            <select
              value={chapterFilter}
              onChange={(e) => setChapterFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">All Chapters (Full Syllabus)</option>
              {availableChapters.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Exam Date, Time Allowed, Max Marks, Teacher Name */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Date of Exam</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Time Allowed *</label>
            <input
              type="text"
              value={timeAllowed}
              onChange={(e) => setTimeAllowed(e.target.value)}
              placeholder="e.g. 3 Hours"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Maximum Marks *</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Teacher Name (Optional)</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g. Dr. Sharma"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Question Blueprint Selection */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Select Question Pattern / Blueprint Template *
          </label>
          <select
            value={selectedPatternId}
            onChange={(e) => setSelectedPatternId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
          >
            {patterns.map(p => (
              <option key={p.id} value={p.id}>
                {p.pattern_name} ({p.total_marks} Marks • {p.total_questions || p.rows.reduce((s, r) => s + r.number_of_questions, 0)} Questions)
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Generate & Preview Exam Paper ({generateMultipleSets ? `${numSets} Sets` : 'Single Set'}) →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
