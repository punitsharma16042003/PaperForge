import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  ChevronRight,
  Plus,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Copy,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  HelpCircle,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../utils/excelHelper';
import { RenderMathText } from '../utils/mathRenderer';

const PREDEFINED_TAGS = [
  'important',
  'repeated',
  'board question',
  'conceptual',
  'numerical',
  'diagram-based'
];

export default function AddQuestion({
  questions = [],
  editingQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  setActiveTab
}) {
  // Navigation hierarchy:
  // viewLevel: 'classes' | 'subjects' | 'chapters' | 'questions' | 'add-form'
  const [viewLevel, setViewLevel] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null); // { id, name, description }
  const [selectedSubject, setSelectedSubject] = useState(null); // { id, class_name, name, description }
  const [selectedChapter, setSelectedChapter] = useState(null); // { id, class_name, subject_name, chapter_number, name, description }

  // Classes, Subjects, and Chapters data state
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals for Class, Subject & Chapter creation/editing
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescInput, setClassDescInput] = useState('');

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectNameInput, setSubjectNameInput] = useState('');
  const [subjectDescInput, setSubjectDescInput] = useState('');

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterNumberInput, setChapterNumberInput] = useState('');
  const [chapterNameInput, setChapterNameInput] = useState('');
  const [chapterDescInput, setChapterDescInput] = useState('');

  // Question Form State
  const [editingQ, setEditingQ] = useState(null);
  const [formData, setFormData] = useState({
    chapter: '',
    topic: '',
    question_type: 'MCQ',
    question_text: '',
    options: [
      { id: 'A', text: '', is_correct: true },
      { id: 'B', text: '', is_correct: false },
      { id: 'C', text: '', is_correct: false },
      { id: 'D', text: '', is_correct: false }
    ],
    answer_text: '',
    explanation: '',
    marks: 1,
    difficulty: 'Medium',
    tags: ['board question'],
    diagram_url: '',
    diagram_caption: ''
  });

  const [questionSearch, setQuestionSearch] = useState('');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all');
  const [expandedAnswerId, setExpandedAnswerId] = useState(null);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // 1. Fetch Classes and Subjects
  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, chRes] = await Promise.all([
        fetch('/api/classes').then(r => r.json()).catch(() => []),
        fetch('/api/subjects').then(r => r.json()).catch(() => []),
        fetch('/api/chapters').then(r => r.json()).catch(() => [])
      ]);
      setClasses(Array.isArray(cRes) ? cRes : []);
      setSubjects(Array.isArray(sRes) ? sRes : []);
      setChapters(Array.isArray(chRes) ? chRes : []);
    } catch (err) {
      console.error('Failed to load hierarchy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchyData();
  }, []);

  // Handle external edit prop
  useEffect(() => {
    if (editingQuestion) {
      const clsNum = String(editingQuestion.class_level || '10');
      const clsName = clsNum.toLowerCase().startsWith('class') ? clsNum : `Class ${clsNum}`;
      const subjName = String(editingQuestion.subject || 'Science');
      setSelectedClass({ name: clsName });
      setSelectedSubject({ name: subjName });
      if (editingQuestion.chapter) {
        setSelectedChapter({ name: editingQuestion.chapter, chapter_number: '' });
      }
      setEditingQ(editingQuestion);
      setFormData({
        ...editingQuestion,
        options: editingQuestion.options && editingQuestion.options.length === 4 ? editingQuestion.options : [
          { id: 'A', text: '', is_correct: true },
          { id: 'B', text: '', is_correct: false },
          { id: 'C', text: '', is_correct: false },
          { id: 'D', text: '', is_correct: false }
        ]
      });
      setViewLevel('add-form');
    }
  }, [editingQuestion]);

  // Show Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Helper count methods
  const getSubjectCountForClass = (className) => {
    return subjects.filter(s => s.class_name.toLowerCase() === className.toLowerCase()).length;
  };

  const getChapterCountForSubject = (className, subjectName) => {
    return chapters.filter(ch =>
      ch.class_name.toLowerCase() === className.toLowerCase() &&
      ch.subject_name.toLowerCase() === subjectName.toLowerCase()
    ).length;
  };

  const getQuestionCountForClass = (className) => {
    const rawClassNum = className.replace(/Class\s*/i, '').trim();
    return questions.filter(q =>
      String(q.class_level).toLowerCase() === rawClassNum.toLowerCase() ||
      String(q.class_level).toLowerCase() === className.toLowerCase()
    ).length;
  };

  const getQuestionCountForSubject = (className, subjectName) => {
    const rawClassNum = className.replace(/Class\s*/i, '').trim();
    return questions.filter(q =>
      (String(q.class_level).toLowerCase() === rawClassNum.toLowerCase() ||
       String(q.class_level).toLowerCase() === className.toLowerCase()) &&
      String(q.subject).toLowerCase() === subjectName.toLowerCase()
    ).length;
  };

  const getQuestionCountForChapter = (className, subjectName, chapterName) => {
    const rawClassNum = className.replace(/Class\s*/i, '').trim();
    return questions.filter(q =>
      (String(q.class_level).toLowerCase() === rawClassNum.toLowerCase() ||
       String(q.class_level).toLowerCase() === className.toLowerCase()) &&
      String(q.subject).toLowerCase() === subjectName.toLowerCase() &&
      String(q.chapter || '').toLowerCase() === chapterName.toLowerCase()
    ).length;
  };

  // -------------------------------------------------------------
  // CLASS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassNameInput('');
    setClassDescInput('');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls, e) => {
    e.stopPropagation();
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setClassDescInput(cls.description || '');
    setShowClassModal(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    try {
      const payload = {
        name: classNameInput.trim(),
        description: classDescInput.trim()
      };

      if (editingClass) {
        await fetch(`/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        triggerToast(`Class "${classNameInput}" updated successfully!`);
      } else {
        await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        triggerToast(`New class "${classNameInput}" created successfully!`);
      }

      setShowClassModal(false);
      fetchHierarchyData();
    } catch (err) {
      console.error(err);
      triggerToast('Error saving class. Please try again.');
    }
  };

  const handleDeleteClass = async (cls, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${cls.name}" and all its subjects?`)) return;

    try {
      await fetch(`/api/classes/${cls.id}`, { method: 'DELETE' });
      if (selectedClass?.id === cls.id) {
        setSelectedClass(null);
        setSelectedSubject(null);
        setViewLevel('classes');
      }
      triggerToast(`Class "${cls.name}" deleted.`);
      fetchHierarchyData();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // SUBJECT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectNameInput('');
    setSubjectDescInput('');
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (subj, e) => {
    e.stopPropagation();
    setEditingSubject(subj);
    setSubjectNameInput(subj.name);
    setSubjectDescInput(subj.description || '');
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectNameInput.trim() || !selectedClass) return;

    try {
      const payload = {
        class_name: selectedClass.name,
        name: subjectNameInput.trim(),
        description: subjectDescInput.trim()
      };

      if (editingSubject) {
        await fetch(`/api/subjects/${editingSubject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        triggerToast(`Subject "${subjectNameInput}" updated successfully!`);
      } else {
        await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        triggerToast(`Subject "${subjectNameInput}" added to ${selectedClass.name}!`);
      }

      setShowSubjectModal(false);
      fetchHierarchyData();
    } catch (err) {
      console.error(err);
      triggerToast('Error saving subject.');
    }
  };

  const handleDeleteSubject = async (subj, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete subject "${subj.name}" from ${selectedClass.name}?`)) return;

    try {
      await fetch(`/api/subjects/${subj.id}`, { method: 'DELETE' });
      if (selectedSubject?.id === subj.id) {
        setSelectedSubject(null);
        setViewLevel('subjects');
      }
      triggerToast(`Subject "${subj.name}" deleted.`);
      fetchHierarchyData();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // CHAPTER HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddChapter = () => {
    setEditingChapter(null);
    const subChaps = chapters.filter(ch =>
      ch.class_name.toLowerCase() === selectedClass?.name?.toLowerCase() &&
      ch.subject_name.toLowerCase() === selectedSubject?.name?.toLowerCase()
    );
    setChapterNumberInput(`Chapter ${subChaps.length + 1}`);
    setChapterNameInput('');
    setChapterDescInput('');
    setShowChapterModal(true);
  };

  const handleOpenEditChapter = (chap, e) => {
    e.stopPropagation();
    setEditingChapter(chap);
    setChapterNumberInput(chap.chapter_number || '');
    setChapterNameInput(chap.name);
    setChapterDescInput(chap.description || '');
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterNameInput.trim() || !selectedClass || !selectedSubject) return;

    try {
      const payload = {
        class_name: selectedClass.name,
        subject_name: selectedSubject.name,
        chapter_number: chapterNumberInput.trim() || `Chapter 1`,
        name: chapterNameInput.trim(),
        description: chapterDescInput.trim()
      };

      if (editingChapter) {
        await fetch(`/api/chapters/${editingChapter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        triggerToast(`Chapter "${chapterNameInput}" updated!`);
      } else {
        await fetch('/api/chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        triggerToast(`New Chapter "${chapterNameInput}" created!`);
      }

      setShowChapterModal(false);
      fetchHierarchyData();
    } catch (err) {
      console.error(err);
      triggerToast('Error saving chapter.');
    }
  };

  const handleDeleteChapter = async (chap, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete chapter "${chap.name}"? Questions will remain in the subject.`)) return;

    try {
      await fetch(`/api/chapters/${chap.id}`, { method: 'DELETE' });
      if (selectedChapter?.id === chap.id) {
        setSelectedChapter(null);
      }
      triggerToast(`Chapter "${chap.name}" deleted.`);
      fetchHierarchyData();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // QUESTION FORM HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddQuestionForm = () => {
    setEditingQ(null);
    setFormData({
      chapter: selectedChapter ? selectedChapter.name : '',
      topic: '',
      question_type: 'MCQ',
      question_text: '',
      options: [
        { id: 'A', text: '', is_correct: true },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false }
      ],
      answer_text: '',
      explanation: '',
      marks: 1,
      difficulty: 'Medium',
      tags: ['board question'],
      diagram_url: '',
      diagram_caption: ''
    });
    setFormError('');
    setViewLevel('add-form');
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQ(q);
    setFormData({
      ...q,
      options: q.options && q.options.length === 4 ? q.options : [
        { id: 'A', text: '', is_correct: true },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false }
      ]
    });
    setFormError('');
    setViewLevel('add-form');
  };

  const handleTypeChange = (newType) => {
    let defaultMark = 1;
    if (newType === 'Very Short Answer') defaultMark = 2;
    else if (newType === 'Short Answer' || newType === 'Diagram Based') defaultMark = 3;
    else if (newType === 'Case Study / Passage Based') defaultMark = 4;
    else if (newType === 'Long Answer' || newType === 'Essay Type Questions') defaultMark = 5;

    setFormData(prev => ({
      ...prev,
      question_type: newType,
      marks: defaultMark
    }));
  };

  const handleOptionChange = (idx, text) => {
    const updated = [...formData.options];
    updated[idx].text = text;
    setFormData(prev => ({ ...prev, options: updated }));
  };

  const handleCorrectOptionChange = (selectedId) => {
    const updated = formData.options.map(opt => ({
      ...opt,
      is_correct: opt.id === selectedId
    }));
    setFormData(prev => ({ ...prev, options: updated }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      const exists = prev.tags.includes(tag);
      const updated = exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag];
      return { ...prev, tags: updated };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({
          ...prev,
          diagram_url: data.url,
          tags: prev.tags.includes('diagram-based') ? prev.tags : [...prev.tags, 'diagram-based']
        }));
      }
    } catch (err) {
      console.error(err);
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, diagram_url: localUrl }));
    }
  };

  const validateForm = () => {
    if (!formData.question_text.trim()) {
      setFormError('Question text statement is required.');
      return false;
    }
    if (!formData.marks || Number(formData.marks) <= 0) {
      setFormError('Marks must be greater than 0.');
      return false;
    }

    if (formData.question_type === 'MCQ') {
      const emptyOpt = formData.options.find(o => !o.text.trim());
      if (emptyOpt) {
        setFormError(`Please enter text for Option ${emptyOpt.id}.`);
        return false;
      }
      const hasCorrect = formData.options.some(o => o.is_correct);
      if (!hasCorrect) {
        setFormError('Please select one correct option for the MCQ.');
        return false;
      }
    } else {
      if (!formData.answer_text.trim()) {
        setFormError('Please provide the expected answer/solution or key marking points.');
        return false;
      }
    }

    setFormError('');
    return true;
  };

  const handleSaveQuestion = async (addAnother = false) => {
    if (!validateForm()) return;

    const rawClassNum = selectedClass?.name ? selectedClass.name.replace(/Class\s*/i, '').trim() : '10';

    const questionPayload = {
      ...formData,
      id: editingQ ? editingQ.id : undefined,
      class_level: rawClassNum,
      subject: selectedSubject?.name || 'General',
      marks: Number(formData.marks),
      created_at: editingQ ? editingQ.created_at : new Date().toISOString()
    };

    try {
      if (onSaveQuestion) {
        await onSaveQuestion(questionPayload);
      }

      // Check if this chapter is new, if so auto-register in chapters database
      if (formData.chapter && formData.chapter.trim()) {
        const chapName = formData.chapter.trim();
        const existsInDb = chapters.some(ch =>
          ch.class_name.toLowerCase() === selectedClass.name.toLowerCase() &&
          ch.subject_name.toLowerCase() === selectedSubject.name.toLowerCase() &&
          ch.name.toLowerCase() === chapName.toLowerCase()
        );
        if (!existsInDb) {
          fetch('/api/chapters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              class_name: selectedClass.name,
              subject_name: selectedSubject.name,
              name: chapName,
              chapter_number: `Chapter ${currentSubjectChapters.length + 1}`,
              description: ''
            })
          }).then(() => fetchHierarchyData()).catch(() => {});
        }
      }

      triggerToast(`Question ${editingQ ? 'updated' : 'saved'} successfully!`);

      if (addAnother) {
        setFormData(prev => ({
          ...prev,
          question_text: '',
          options: [
            { id: 'A', text: '', is_correct: true },
            { id: 'B', text: '', is_correct: false },
            { id: 'C', text: '', is_correct: false },
            { id: 'D', text: '', is_correct: false }
          ],
          answer_text: '',
          explanation: '',
          diagram_url: '',
          diagram_caption: ''
        }));
        setEditingQ(null);
      } else {
        setViewLevel('questions');
      }
    } catch (err) {
      console.error(err);
      setFormError('Error saving question.');
    }
  };

  // Current subject chapters
  const currentSubjectChapters = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    return chapters.filter(ch =>
      ch.class_name.toLowerCase() === selectedClass.name.toLowerCase() &&
      ch.subject_name.toLowerCase() === selectedSubject.name.toLowerCase()
    );
  }, [chapters, selectedClass, selectedSubject]);

  // Filtered questions for Level 4
  const currentSubjectQuestions = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    const rawClassNum = selectedClass.name.replace(/Class\s*/i, '').trim();

    return questions.filter(q => {
      const matchClass =
        String(q.class_level).toLowerCase() === rawClassNum.toLowerCase() ||
        String(q.class_level).toLowerCase() === selectedClass.name.toLowerCase();
      const matchSubj = String(q.subject).toLowerCase() === selectedSubject.name.toLowerCase();
      if (!matchClass || !matchSubj) return false;

      // Filter by selected chapter if one is chosen
      if (selectedChapter) {
        const qChap = (q.chapter || '').toLowerCase().trim();
        const targetChap = selectedChapter.name.toLowerCase().trim();
        if (qChap !== targetChap) return false;
      }

      if (questionTypeFilter !== 'all' && q.question_type !== questionTypeFilter) return false;

      if (questionSearch.trim()) {
        const s = questionSearch.toLowerCase();
        const inText = q.question_text && q.question_text.toLowerCase().includes(s);
        const inChapter = q.chapter && q.chapter.toLowerCase().includes(s);
        const inTopic = q.topic && q.topic.toLowerCase().includes(s);
        if (!inText && !inChapter && !inTopic) return false;
      }

      return true;
    });
  }, [questions, selectedClass, selectedSubject, selectedChapter, questionTypeFilter, questionSearch]);

  // Breadcrumbs renderer
  const renderBreadcrumbs = () => (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 p-3">
      <button
        onClick={() => {
          setViewLevel('classes');
          setSelectedClass(null);
          setSelectedSubject(null);
          setSelectedChapter(null);
        }}
        className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
          viewLevel === 'classes' ? 'text-amber-400 font-bold' : ''
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        <span>Question Addition</span>
      </button>

      {selectedClass && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => {
              setViewLevel('subjects');
              setSelectedSubject(null);
              setSelectedChapter(null);
            }}
            className={`hover:text-amber-400 transition flex items-center gap-1 ${
              viewLevel === 'subjects' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <span>{selectedClass.name}</span>
          </button>
        </>
      )}

      {selectedSubject && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => {
              setViewLevel('chapters');
              setSelectedChapter(null);
            }}
            className={`hover:text-amber-400 transition flex items-center gap-1 ${
              viewLevel === 'chapters' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedSubject.name}</span>
          </button>
        </>
      )}

      {selectedSubject && viewLevel !== 'chapters' && selectedChapter && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => {
              setViewLevel('questions');
            }}
            className={`hover:text-amber-400 transition flex items-center gap-1 ${
              viewLevel === 'questions' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[180px]">{selectedChapter.chapter_number ? `${selectedChapter.chapter_number}: ` : ''}{selectedChapter.name}</span>
          </button>
        </>
      )}

      {selectedSubject && viewLevel === 'questions' && !selectedChapter && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-amber-400 font-bold">All Questions</span>
        </>
      )}

      {viewLevel === 'add-form' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-amber-400 font-bold">
            {editingQ ? 'Edit Question' : 'Add Question'}
          </span>
        </>
      )}
    </nav>
  );

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Breadcrumbs Navigation */}
      {renderBreadcrumbs()}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* LEVEL 1: CLASS SELECTION & MANAGEMENT */}
      {/* ========================================================= */}
      {viewLevel === 'classes' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-amber-400" />
                <span>Select a Class</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Choose a class to manage its subjects and question bank, or create a new class.
              </p>
            </div>

            <button
              onClick={handleOpenAddClass}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Add Class</span>
            </button>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {classes.map(cls => {
              const subjCount = getSubjectCountForClass(cls.name);
              const qCount = getQuestionCountForClass(cls.name);

              return (
                <div
                  key={cls.id}
                  onClick={() => {
                    setSelectedClass(cls);
                    setViewLevel('subjects');
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/70 p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <GraduationCap className="w-5 h-5" />
                      </div>

                      {/* Edit / Delete actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleOpenEditClass(cls, e)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                          title="Edit Class Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClass(cls, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                        {cls.name}
                      </h3>
                      {cls.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cls.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span><strong>{subjCount}</strong> Subjects</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{qCount} Questions</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LEVEL 2: SUBJECT SELECTION & MANAGEMENT */}
      {/* ========================================================= */}
      {viewLevel === 'subjects' && selectedClass && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewLevel('classes')}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Classes</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <span>{selectedClass.name} — Subjects</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a subject to view or add questions, or add a new subject to {selectedClass.name}.
              </p>
            </div>

            <button
              onClick={handleOpenAddSubject}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Add Subject</span>
            </button>
          </div>

          {/* Subjects Grid */}
          {subjects.filter(s => s.class_name.toLowerCase() === selectedClass.name.toLowerCase()).length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No Subjects Added in {selectedClass.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Add your first subject to start adding questions.</p>
              <button
                onClick={handleOpenAddSubject}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
              >
                + Add Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects
                .filter(s => s.class_name.toLowerCase() === selectedClass.name.toLowerCase())
                .map(subj => {
                  const qCount = getQuestionCountForSubject(selectedClass.name, subj.name);
                  const chapCount = getChapterCountForSubject(selectedClass.name, subj.name);

                  return (
                    <div
                      key={subj.id}
                      onClick={() => {
                        setSelectedSubject(subj);
                        setSelectedChapter(null);
                        setViewLevel('chapters');
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500/70 p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                            <BookOpen className="w-5 h-5" />
                          </div>

                          {/* Edit / Delete actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleOpenEditSubject(subj, e)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                              title="Edit Subject Name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSubject(subj, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                            {subj.name}
                          </h3>
                          {subj.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {subj.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400/90 font-bold">{chapCount} Chapters</span>
                          <span>•</span>
                          <span>{qCount} Questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-400 transition">
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* LEVEL 3: CHAPTER SELECTION & MANAGEMENT */}
      {/* ========================================================= */}
      {viewLevel === 'chapters' && selectedClass && selectedSubject && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => {
                    setViewLevel('subjects');
                    setSelectedSubject(null);
                    setSelectedChapter(null);
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {selectedClass.name} Subjects</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-amber-400" />
                <span>{selectedClass.name} • {selectedSubject.name} Chapters</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage chapters, add new chapters, or select a chapter to view and add questions.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedChapter(null);
                  setViewLevel('questions');
                }}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
              >
                View All Questions ({getQuestionCountForSubject(selectedClass.name, selectedSubject.name)})
              </button>
              <button
                onClick={handleOpenAddChapter}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>+ Add Chapter</span>
              </button>
            </div>
          </div>

          {/* Chapters Grid */}
          {currentSubjectChapters.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No Chapters Created in {selectedSubject.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Create your first chapter to organize questions cleanly.</p>
              <button
                onClick={handleOpenAddChapter}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
              >
                + Add Chapter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentSubjectChapters.map(chap => {
                const qCount = getQuestionCountForChapter(selectedClass.name, selectedSubject.name, chap.name);

                return (
                  <div
                    key={chap.id}
                    onClick={() => {
                      setSelectedChapter(chap);
                      setViewLevel('questions');
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/70 p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          {chap.chapter_number || 'Chapter'}
                        </span>

                        {/* Edit / Delete actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleOpenEditChapter(chap, e)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                            title="Edit Chapter"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChapter(chap, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Chapter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition line-clamp-2">
                          {chap.name}
                        </h3>
                        {chap.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {chap.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">{qCount} Questions</span>
                      <span className="text-amber-400 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                        Open Questions →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* LEVEL 4: QUESTION MANAGEMENT FOR CLASS + SUBJECT (+ CHAPTER) */}
      {/* ========================================================= */}
      {viewLevel === 'questions' && selectedClass && selectedSubject && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => {
                    setViewLevel('chapters');
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chapters</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <HelpCircle className="w-6 h-6 text-amber-400" />
                <span>
                  {selectedChapter
                    ? `${selectedChapter.chapter_number ? selectedChapter.chapter_number + ': ' : ''}${selectedChapter.name}`
                    : `All Questions in ${selectedSubject.name}`}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700">
                  {currentSubjectQuestions.length} Questions
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedChapter
                  ? `Showing questions for ${selectedChapter.name} (${selectedClass.name} • ${selectedSubject.name}).`
                  : `Showing all questions for ${selectedClass.name} ${selectedSubject.name}.`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenAddQuestionForm}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>+ Add Question {selectedChapter ? 'to Chapter' : ''}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search questions by text statement, chapter, topic...`}
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Chapter Selector Dropdown */}
            <select
              value={selectedChapter ? selectedChapter.name : 'all'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') {
                  setSelectedChapter(null);
                } else {
                  const found = chapters.find(ch =>
                    ch.class_name.toLowerCase() === selectedClass.name.toLowerCase() &&
                    ch.subject_name.toLowerCase() === selectedSubject.name.toLowerCase() &&
                    ch.name.toLowerCase() === val.toLowerCase()
                  );
                  if (found) setSelectedChapter(found);
                }
              }}
              className="bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-auto font-medium"
            >
              <option value="all">All Chapters ({currentSubjectChapters.length})</option>
              {currentSubjectChapters.map(ch => (
                <option key={ch.id} value={ch.name}>
                  {ch.chapter_number ? `${ch.chapter_number}: ` : ''}{ch.name}
                </option>
              ))}
            </select>

            {/* Question Type Filter Dropdown */}
            <select
              value={questionTypeFilter}
              onChange={(e) => setQuestionTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-auto"
            >
              <option value="all">All Question Types</option>
              {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Questions List for this Class + Subject */}
          {currentSubjectQuestions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No Questions Found in {selectedSubject.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Click below to add your first question.</p>
              <button
                onClick={handleOpenAddQuestionForm}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
              >
                + Add Question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentSubjectQuestions.map((q, idx) => {
                const isExpanded = expandedAnswerId === q.id;
                const isMcq = q.question_type === 'MCQ';

                return (
                  <div
                    key={q.id || idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                          {q.question_type}
                        </span>
                        {q.chapter && (
                          <span className="text-xs font-semibold text-slate-300">
                            {q.chapter}
                          </span>
                        )}
                        {q.topic && (
                          <span className="text-xs text-slate-400 truncate max-w-xs">
                            • {q.topic}
                          </span>
                        )}
                        {q.diagram_url && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <ImageIcon className="w-3 h-3" />
                            <span>Diagram</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                        </span>

                        <button
                          onClick={() => handleOpenEditQuestion(q)}
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

                    <div className="text-sm font-medium text-slate-100 leading-relaxed font-serif-exam">
                      <RenderMathText text={q.question_text} />
                    </div>

                    {q.diagram_url && (
                      <div className="my-2 p-2 bg-slate-950 inline-block border border-slate-800">
                        <img src={q.diagram_url} alt="Question figure" className="max-h-40 object-contain" />
                        {q.diagram_caption && (
                          <p className="text-[11px] text-slate-400 italic text-center mt-1">Fig: {q.diagram_caption}</p>
                        )}
                      </div>
                    )}

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
                            <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                              opt.is_correct ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {opt.id}
                            </span>
                            <span className="flex-1"><RenderMathText text={opt.text} /></span>
                            {opt.is_correct && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedAnswerId(isExpanded ? null : q.id)}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                      >
                        <span>{isExpanded ? 'Hide Answer' : 'View Answer'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 bg-slate-950 border border-amber-500/30 text-xs space-y-1.5 mt-2">
                        <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Solution / Answer:</div>
                        <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                          <RenderMathText text={q.answer_text || 'No answer provided.'} />
                        </div>
                        {q.explanation && (
                          <div className="pt-1.5 border-t border-slate-800 text-slate-400 text-[11px] italic">
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
      )}

      {/* ========================================================= */}
      {/* LEVEL 4: QUESTION ENTRY & EDITING FORM */}
      {/* ========================================================= */}
      {viewLevel === 'add-form' && selectedClass && selectedSubject && (
        <div className="space-y-6">
          {/* Header Banner locking Class + Subject */}
          <div className="flex items-center justify-between bg-slate-900 p-4 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>Class: <strong className="text-white">{selectedClass.name}</strong></span>
                <span>•</span>
                <span>Subject: <strong className="text-amber-400">{selectedSubject.name}</strong></span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                {editingQ ? 'Edit Question' : `Add New Question to ${selectedSubject.name}`}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setViewLevel('questions')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Question Form */}
          <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5">
            {/* Chapter, Topic, Question Type, Marks, Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Chapter / Unit *</label>
                <input
                  type="text"
                  list="form-chapters-list"
                  value={formData.chapter}
                  onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                  placeholder="Select or enter chapter"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
                <datalist id="form-chapters-list">
                  {currentSubjectChapters.map(ch => (
                    <option key={ch.id} value={ch.name}>
                      {ch.chapter_number ? `${ch.chapter_number}: ` : ''}{ch.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g. Ohm's Law"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question Type *</label>
                <select
                  value={formData.question_type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
                >
                  {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Marks Assigned *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.marks}
                  onChange={(e) => setFormData(prev => ({ ...prev, marks: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Question Statement *</label>
                <span className="text-[10px] text-amber-400 font-medium">
                  Supports LaTeX: <code className="bg-slate-950 px-1 border border-slate-800">$E=mc^2$</code>
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                placeholder="Type your question statement here..."
                className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-serif-exam text-sm"
              />
            </div>

            {/* MCQ Options */}
            {formData.question_type === 'MCQ' && (
              <div className="p-4 bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    MCQ Options (4 Options Required)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Select the radio button for the correct option
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 p-2 border transition ${
                        opt.is_correct ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={opt.is_correct}
                          onChange={() => handleCorrectOptionChange(opt.id)}
                          className="accent-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <span className={`w-6 h-6 flex items-center justify-center text-[11px] font-black ${
                          opt.is_correct ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {opt.id}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${opt.id} text...`}
                        className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Answer Explanation (Optional):
                  </label>
                  <input
                    type="text"
                    value={formData.explanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Reasoning for why this option is correct..."
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Answer Text for Non-MCQ */}
            {formData.question_type !== 'MCQ' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Answer / Expected Solution & Marking Points
                </label>
                <textarea
                  rows={3}
                  value={formData.answer_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer_text: e.target.value }))}
                  placeholder="Provide solution details, key steps, formulas, and marking criteria..."
                  className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            )}

            {/* Direct Question Diagram Attachment */}
            <div className="p-4 bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Question Diagram / Image Attachment (Optional)
              </span>

              {formData.diagram_url ? (
                <div className="flex items-start gap-4 p-3 bg-slate-900 border border-slate-800">
                  <img src={formData.diagram_url} alt="Attached" className="w-24 h-24 object-cover border border-slate-700" />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={formData.diagram_caption}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagram_caption: e.target.value }))}
                      placeholder="Diagram caption (e.g. Ray optics refraction figure)..."
                      className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, diagram_url: '', diagram_caption: '' }))}
                      className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Diagram</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border border-dashed border-slate-700 hover:border-amber-500/60 p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 transition">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-300">Click to upload diagram image (JPG, PNG, WEBP, SVG)</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Question Tags</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => {
                  const isSelected = formData.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-semibold px-2.5 py-1 border transition ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewLevel('questions')}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back to Questions
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveQuestion(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Save & Add Another</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveQuestion(false)}
                  className="flex items-center gap-1.5 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 transition active:scale-95"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Save Question</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CLASS */}
      {/* ========================================================= */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveClass} className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </span>
              <button type="button" onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Class Name *</label>
              <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                placeholder="e.g. Class 10, Class 8, Class 12"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={classDescInput}
                onChange={(e) => setClassDescInput(e.target.value)}
                placeholder="e.g. Secondary Board Examination Level"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                {editingClass ? 'Save Changes' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT */}
      {/* ========================================================= */}
      {showSubjectModal && selectedClass && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveSubject} className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                {editingSubject ? 'Edit Subject' : `Add Subject to ${selectedClass.name}`}
              </span>
              <button type="button" onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Subject Name *</label>
              <input
                type="text"
                value={subjectNameInput}
                onChange={(e) => setSubjectNameInput(e.target.value)}
                placeholder="e.g. Science, Mathematics, English, History"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={subjectDescInput}
                onChange={(e) => setSubjectDescInput(e.target.value)}
                placeholder="e.g. Physics, Chemistry, and Biology combined"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                {editingSubject ? 'Save Changes' : 'Add Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CHAPTER */}
      {/* ========================================================= */}
      {showChapterModal && selectedClass && selectedSubject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveChapter} className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                {editingChapter ? 'Edit Chapter' : `Add Chapter to ${selectedSubject.name}`}
              </span>
              <button type="button" onClick={() => setShowChapterModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-300 mb-1">Number / Code</label>
                <input
                  type="text"
                  value={chapterNumberInput}
                  onChange={(e) => setChapterNumberInput(e.target.value)}
                  placeholder="e.g. Chapter 1"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Chapter Title / Name *</label>
                <input
                  type="text"
                  value={chapterNameInput}
                  onChange={(e) => setChapterNameInput(e.target.value)}
                  placeholder="e.g. Chemical Reactions and Equations"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description / Key Topics (Optional)</label>
              <textarea
                rows={2}
                value={chapterDescInput}
                onChange={(e) => setChapterDescInput(e.target.value)}
                placeholder="e.g. Types of reactions, oxidation, reduction, balancing equations"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChapterModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                {editingChapter ? 'Save Changes' : 'Create Chapter'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
