import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  PlusCircle,
  Download,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Bookmark,
  Plus,
  X,
  FileText,
  Layers,
  ArrowRight,
  Eye,
  Sparkles
} from 'lucide-react';
import ReceiverTable from './ReceiverTable';
import { parseExcelFile, downloadSampleExcel, formatClassLevel, QUESTION_TYPES } from '../utils/excelHelper';

export default function ImportQuestions({ onSaveBulkQuestions, setActiveTab }) {
  const [importMode, setImportMode] = useState('paste-excel'); // 'paste-excel' | 'upload-file'
  
  // Hierarchy state
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [targetClass, setTargetClass] = useState('Class 10');
  const [targetSubject, setTargetSubject] = useState('Science');
  const [targetChapter, setTargetChapter] = useState('all');
  const [autoApplyTarget, setAutoApplyTarget] = useState(true);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);

  // Modals for Class, Subject & Chapter quick addition
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newChapterNumber, setNewChapterNumber] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');

  // File upload & preview state
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);

  // Fetch classes, subjects, and chapters
  const loadClassesAndSubjects = async () => {
    try {
      setHierarchyLoading(true);
      const [cRes, sRes, chRes] = await Promise.all([
        fetch('/api/classes').then(r => r.json()).catch(() => []),
        fetch('/api/subjects').then(r => r.json()).catch(() => []),
        fetch('/api/chapters').then(r => r.json()).catch(() => [])
      ]);
      const fetchedClasses = Array.isArray(cRes) ? cRes : [];
      const fetchedSubjects = Array.isArray(sRes) ? sRes : [];
      const fetchedChapters = Array.isArray(chRes) ? chRes : [];
      setClasses(fetchedClasses);
      setSubjects(fetchedSubjects);
      setChapters(fetchedChapters);

      // Default target class & subject if not already set
      if (fetchedClasses.length > 0) {
        const defaultCls = fetchedClasses.find(c => c.name.includes('10')) || fetchedClasses[0];
        setTargetClass(defaultCls.name);
        const subjsForCls = fetchedSubjects.filter(s => s.class_name.toLowerCase() === defaultCls.name.toLowerCase());
        if (subjsForCls.length > 0) {
          setTargetSubject(subjsForCls[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load hierarchy data:', err);
    } finally {
      setHierarchyLoading(false);
    }
  };

  useEffect(() => {
    loadClassesAndSubjects();
  }, []);

  // Filter subjects for currently selected class
  const availableSubjects = useMemo(() => {
    return subjects.filter(s => s.class_name.toLowerCase() === targetClass.toLowerCase());
  }, [subjects, targetClass]);

  // Filter chapters for currently selected class and subject
  const availableChapters = useMemo(() => {
    return chapters.filter(ch =>
      ch.class_name.toLowerCase() === targetClass.toLowerCase() &&
      ch.subject_name.toLowerCase() === targetSubject.toLowerCase()
    );
  }, [chapters, targetClass, targetSubject]);

  // When targetClass changes, update targetSubject to first available subject
  const handleTargetClassChange = (newCls) => {
    setTargetClass(newCls);
    const subs = subjects.filter(s => s.class_name.toLowerCase() === newCls.toLowerCase());
    if (subs.length > 0) {
      setTargetSubject(subs[0].name);
    } else {
      setTargetSubject('General');
    }
    setTargetChapter('all');
    // Clear previous parsed preview if class changes
    setParsedPreview(null);
    setUploadedFile(null);
    setImportSuccess(null);
  };

  // When targetSubject changes, reset targetChapter
  const handleTargetSubjectChange = (newSub) => {
    setTargetSubject(newSub);
    setTargetChapter('all');
    setParsedPreview(null);
    setUploadedFile(null);
    setImportSuccess(null);
  };

  // Quick add class inline
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName.trim() })
      });
      const created = await res.json();
      if (created.name) {
        setClasses(prev => [...prev, created]);
        setTargetClass(created.name);
        setNewClassName('');
        setShowAddClassModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick add subject inline
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_name: targetClass, name: newSubjectName.trim() })
      });
      const created = await res.json();
      if (created.name) {
        setSubjects(prev => [...prev, created]);
        setTargetSubject(created.name);
        setNewSubjectName('');
        setShowAddSubjectModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick add chapter inline
  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_name: targetClass,
          subject_name: targetSubject,
          chapter_number: newChapterNumber.trim() || `Chapter ${availableChapters.length + 1}`,
          name: newChapterName.trim(),
          description: newChapterDesc.trim()
        })
      });
      const created = await res.json();
      if (created.name) {
        setChapters(prev => [...prev, created]);
        setTargetChapter(created.name);
        setNewChapterNumber('');
        setNewChapterName('');
        setNewChapterDesc('');
        setShowAddChapterModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // File parsing and preview logic
  const handleFileSelect = async (file) => {
    if (!file) return;
    setUploadError('');
    setImportSuccess(null);
    setUploadLoading(true);
    setUploadedFile(file);

    try {
      const parsedRows = await parseExcelFile(file, {
        defaultClass: targetClass,
        defaultSubject: targetSubject,
        defaultChapter: targetChapter,
        autoApplyTarget: autoApplyTarget
      });

      if (!parsedRows || parsedRows.length === 0) {
        setUploadError('No valid questions found in the uploaded file. Please ensure question text exists.');
        setParsedPreview(null);
      } else {
        setParsedPreview(parsedRows);
      }
    } catch (err) {
      console.error(err);
      setUploadError(`Failed to parse file: ${err.message}`);
      setParsedPreview(null);
    } finally {
      setUploadLoading(false);
    }
  };

  // Confirm and save previewed questions
  const handleConfirmImport = async () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    setUploadLoading(true);

    try {
      const formattedQuestions = parsedPreview.map(r => ({
        ...r,
        marks: Number(r.marks) || 1,
        options: r.question_type === 'MCQ' ? [
          { id: 'A', text: r.option_a, is_correct: r.correct_option === 'A' },
          { id: 'B', text: r.option_b, is_correct: r.correct_option === 'B' },
          { id: 'C', text: r.option_c, is_correct: r.correct_option === 'C' },
          { id: 'D', text: r.option_d, is_correct: r.correct_option === 'D' },
        ] : [],
        tags: r.diagram_file_name ? ['diagram-based'] : []
      }));

      if (onSaveBulkQuestions) {
        await onSaveBulkQuestions(formattedQuestions);
      }

      setImportSuccess({
        count: formattedQuestions.length,
        fileName: uploadedFile?.name || 'Spreadsheet',
        targetClass: targetClass,
        targetSubject: targetSubject,
        targetChapter: targetChapter !== 'all' ? targetChapter : ''
      });
      setParsedPreview(null);
      setUploadedFile(null);
    } catch (err) {
      console.error(err);
      setUploadError(`Failed to save questions: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Breakdown counts for previewed questions
  const previewTypeCounts = useMemo(() => {
    if (!parsedPreview) return {};
    const counts = {};
    parsedPreview.forEach(q => {
      counts[q.question_type] = (counts[q.question_type] || 0) + 1;
    });
    return counts;
  }, [parsedPreview]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Import Questions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Effortlessly upload and paste questions for any Class and Subject with automatic format detection.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 border border-slate-800 text-xs flex-wrap gap-1">
          <button
            onClick={() => setImportMode('paste-excel')}
            className={`px-3.5 py-1.5 font-semibold transition cursor-pointer ${
              importMode === 'paste-excel'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Paste from Excel (Receiver Table)
          </button>

          <button
            onClick={() => setImportMode('upload-file')}
            className={`px-3.5 py-1.5 font-semibold transition cursor-pointer ${
              importMode === 'upload-file'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Upload File (.xlsx / .csv)
          </button>

          <button
            onClick={() => setActiveTab('add-question')}
            className="px-3.5 py-1.5 font-semibold text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <span>Question Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TARGET CLASS, SUBJECT & CHAPTER SELECTION BAR (Universal across both modes) */}
      <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Step 1: Choose Target Class, Subject & Chapter
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Auto-Routing Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select which class, subject, and chapter these questions belong to. PaperForge will automatically file all questions into this destination.
            </p>
          </div>

          {/* Quick Template Download for this Class, Subject & Chapter */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadSampleExcel(targetClass, targetSubject, targetChapter, 'xlsx')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title={`Download template formatted for ${targetClass} ${targetSubject}${targetChapter && targetChapter !== 'all' ? ` - ${targetChapter}` : ''}`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download {formatClassLevel(targetClass)} - {targetSubject} {targetChapter && targetChapter !== 'all' ? `(${targetChapter}) ` : ''}Template (.xlsx)</span>
            </button>
            <button
              onClick={() => downloadSampleExcel(targetClass, targetSubject, targetChapter, 'csv')}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Download CSV format"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Dropdowns & Options Row: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          {/* 1. Class Selector */}
          <div className="lg:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Target Class</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                onClick={() => setShowAddClassModal(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Class</span>
              </button>
            </div>
            <select
              value={targetClass}
              onChange={(e) => handleTargetClassChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              {classes.length > 0 ? (
                classes.map(c => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name} {c.description ? `(${c.description})` : ''}
                  </option>
                ))
              ) : (
                <option value="Class 10">Class 10</option>
              )}
            </select>
          </div>

          {/* 2. Subject Selector */}
          <div className="lg:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Target Subject</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Subject</span>
              </button>
            </div>
            <select
              value={targetSubject}
              onChange={(e) => handleTargetSubjectChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              {availableSubjects.length > 0 ? (
                availableSubjects.map(s => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))
              ) : (
                <option value="General">General</option>
              )}
            </select>
          </div>

          {/* 3. Chapter Selector (NEW) */}
          <div className="lg:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Chapter</span>
              </label>
              <button
                onClick={() => setShowAddChapterModal(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Chapter</span>
              </button>
            </div>
            <select
              value={targetChapter}
              onChange={(e) => {
                setTargetChapter(e.target.value);
                setParsedPreview(null);
                setImportSuccess(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="all">-- All Chapters / As in Sheet --</option>
              {availableChapters.length > 0 ? (
                availableChapters.map(ch => (
                  <option key={ch.id || ch.name} value={ch.name}>
                    {ch.chapter_number ? `${ch.chapter_number}: ` : ''}{ch.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No chapters found for {targetSubject}</option>
              )}
            </select>
          </div>

          {/* 4. Auto-Apply Rule Toggle */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <label className="flex items-start gap-2.5 p-2 bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={autoApplyTarget}
                onChange={(e) => setAutoApplyTarget(e.target.checked)}
                className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-200">Auto-apply to all questions</span>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Applies <strong className="text-amber-400">{targetClass}</strong>, <strong className="text-amber-400">{targetSubject}</strong>
                  {targetChapter && targetChapter !== 'all' ? <> and <strong className="text-amber-400">{targetChapter}</strong></> : null} automatically.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* MODE 1: Built-in Receiver Table (Ctrl+V paste & inline edit) */}
      {importMode === 'paste-excel' && (
        <ReceiverTable
          targetClass={targetClass}
          targetSubject={targetSubject}
          targetChapter={targetChapter}
          autoApplyTarget={autoApplyTarget}
          classes={classes}
          subjects={subjects}
          onSaveBulkQuestions={onSaveBulkQuestions}
          setActiveTab={setActiveTab}
        />
      )}

      {/* MODE 2: File Upload Area (.xlsx / .csv) */}
      {importMode === 'upload-file' && (
        <div className="space-y-6">
          {/* Success Banner */}
          {importSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Successfully imported {importSuccess.count} questions!
                  </h4>
                  <p className="text-[11px] text-emerald-300">
                    Imported from <strong className="text-white">{importSuccess.fileName}</strong> into <strong className="text-amber-400">{importSuccess.targetClass} → {importSuccess.targetSubject}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('add-question')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  View in Question Manager
                </button>
                <button
                  onClick={() => setImportSuccess(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  Upload More
                </button>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          {!parsedPreview && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed p-10 text-center transition flex flex-col items-center justify-center bg-slate-900 ${
                  dragOver ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                  <Upload className="w-7 h-7" />
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  Upload Excel or CSV for {targetClass} ({targetSubject})
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
                  Drag & drop your question spreadsheet here, or click to browse. Supports .xlsx, .xls, and .csv files. Columns for question text, options, and answer will be intelligently recognized.
                </p>

                <label className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition">
                  <span>{uploadLoading ? 'Parsing spreadsheet...' : 'Browse Computer'}</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                </label>

                {uploadError && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Template Download Prompt */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Need the recommended format?</h4>
                  <p className="text-[11px] text-slate-400">Download the {targetClass} {targetSubject} {targetChapter && targetChapter !== 'all' ? `(${targetChapter}) ` : ''}template pre-loaded with sample questions.</p>
                </div>
                <button
                  onClick={() => downloadSampleExcel(targetClass, targetSubject, targetChapter)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          )}

          {/* Parsed Questions Preview Table & Confirmation */}
          {parsedPreview && (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      Step 2: Review Parsed Questions ({parsedPreview.length} found)
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      File: {uploadedFile?.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                      Destination: {targetClass} → {targetSubject}{targetChapter && targetChapter !== 'all' ? ` → ${targetChapter}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-slate-400">
                    <span>Detected Types:</span>
                    {Object.entries(previewTypeCounts).map(([type, count]) => (
                      <span key={type} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                        {type}: <strong className="text-amber-400">{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confirm Import Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setParsedPreview(null);
                      setUploadedFile(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    Cancel / Choose Another
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={uploadLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Import {parsedPreview.length} Questions into {targetSubject}</span>
                  </button>
                </div>
              </div>

              {/* Preview Grid */}
              <div className="bg-slate-900 border border-slate-800 overflow-x-auto max-h-[500px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-300 sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 w-10 text-center font-bold text-slate-500">#</th>
                      <th className="p-2.5 font-bold min-w-[90px] text-slate-300">Class</th>
                      <th className="p-2.5 font-bold min-w-[110px] text-slate-300">Subject</th>
                      <th className="p-2.5 font-bold min-w-[130px] text-slate-300">Chapter</th>
                      <th className="p-2.5 font-bold min-w-[110px] text-slate-300">Type</th>
                      <th className="p-2.5 font-bold min-w-[280px] text-slate-300">Question Statement</th>
                      <th className="p-2.5 font-bold min-w-[180px] text-slate-300">Options / Answer</th>
                      <th className="p-2.5 w-16 text-center font-bold text-slate-300">Marks</th>
                      <th className="p-2.5 w-20 font-bold text-slate-300">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parsedPreview.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-center text-slate-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-mono text-slate-300 text-[11px]">
                          Class {q.class_level}
                        </td>
                        <td className="p-2.5 text-amber-400 font-semibold text-[11px]">
                          {q.subject}
                        </td>
                        <td className="p-2.5 text-slate-300 text-[11px] font-medium">
                          {q.chapter || <span className="text-slate-600 italic">General</span>}
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300">
                            {q.question_type}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-200 leading-relaxed max-w-md">
                          <div className="line-clamp-2">{q.question_text}</div>
                        </td>
                        <td className="p-2.5 text-slate-400 text-[11px]">
                          {q.question_type === 'MCQ' ? (
                            <div className="space-y-0.5">
                              <div>A: {q.option_a} | B: {q.option_b}</div>
                              <div className="text-emerald-400 font-bold">Key: ({q.correct_option})</div>
                            </div>
                          ) : (
                            <div className="line-clamp-2 text-slate-300">{q.answer_text || 'Subjective Answer'}</div>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-bold text-amber-400">
                          {q.marks}M
                        </td>
                        <td className="p-2.5 text-slate-400 text-[11px]">
                          {q.difficulty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK ADD CLASS MODAL */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Add New Class
              </span>
              <button onClick={() => setShowAddClassModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Class 8 or Class 5"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SUBJECT MODAL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Add Subject to {targetClass}
              </span>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Social Science or Computer Science"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD CHAPTER MODAL */}
      {showAddChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" />
                Add Chapter to {targetSubject}
              </span>
              <button onClick={() => setShowAddChapterModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateChapter} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Chapter Number / Code</label>
                <input
                  type="text"
                  placeholder={`e.g. Chapter ${availableChapters.length + 1}`}
                  value={newChapterNumber}
                  onChange={(e) => setNewChapterNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  Chapter Title / Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carbon and its Compounds"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chemical bonding, hydrocarbons"
                  value={newChapterDesc}
                  onChange={(e) => setNewChapterDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChapterModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

