import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Save,
  HelpCircle,
  Eye,
  FileSpreadsheet,
  X
} from 'lucide-react';
import {
  RECEIVER_TABLE_COLUMNS,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  CORRECT_OPTIONS,
  downloadSampleExcel,
  formatClassLevel
} from '../utils/excelHelper';

const RECEIVER_STORAGE_KEY = 'paperforge_receiver_table_rows';

// Helper to generate sample demo rows when explicitly requested
const getSampleDemoRows = (cls, subj, chap) => [
  {
    id: 1,
    class_level: formatClassLevel(cls),
    subject: subj || 'Science',
    chapter: (chap && chap !== 'all') ? chap : 'Chemical Reactions',
    topic: 'Types of Reactions',
    question_type: 'MCQ',
    question_text: 'What is the color of lead iodide precipitate?',
    option_a: 'White',
    option_b: 'Yellow',
    option_c: 'Brown',
    option_d: 'Black',
    correct_option: 'B',
    answer_text: 'Option B: Yellow precipitate of lead iodide.',
    marks: '1',
    difficulty: 'Easy',
    diagram_file_name: ''
  },
  {
    id: 2,
    class_level: formatClassLevel(cls),
    subject: subj || 'Science',
    chapter: (chap && chap !== 'all') ? chap : 'Electricity',
    topic: "Ohm's Law",
    question_type: 'Short Answer',
    question_text: 'State Ohm’s law and write its mathematical equation with SI units.',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: '',
    answer_text: 'V = I * R. Current is directly proportional to potential difference.',
    marks: '3',
    difficulty: 'Medium',
    diagram_file_name: ''
  },
  {
    id: 3,
    class_level: formatClassLevel(cls),
    subject: subj || 'Science',
    chapter: (chap && chap !== 'all') ? chap : 'Life Processes',
    topic: 'Respiration',
    question_type: 'MCQ',
    question_text: 'Which three-carbon molecule is formed during glycolysis in cytoplasm?',
    option_a: 'Pyruvate',
    option_b: 'Lactic Acid',
    option_c: 'Ethanol',
    option_d: 'Glucose',
    correct_option: 'A',
    answer_text: 'Option A: Pyruvate',
    marks: '1',
    difficulty: 'Easy',
    diagram_file_name: ''
  }
];

export default function ReceiverTable({
  targetClass = 'Class 10',
  targetSubject = 'Science',
  targetChapter = 'all',
  autoApplyTarget = true,
  classes = [],
  subjects = [],
  onSaveBulkQuestions,
  setActiveTab
}) {
  const cleanClass = formatClassLevel(targetClass);

  // Persistent rows from localStorage so tab-switching or clearing preserves user's exact state
  const [rows, setRows] = useState(() => {
    try {
      const stored = localStorage.getItem(RECEIVER_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse receiver table cache:', e);
    }
    // Default is clean empty table ready for receiving pasted questions
    return [];
  });

  // Save changes to localStorage immediately whenever rows change
  React.useEffect(() => {
    try {
      localStorage.setItem(RECEIVER_STORAGE_KEY, JSON.stringify(rows));
    } catch (e) {
      console.error('Failed to save receiver table cache:', e);
    }
  }, [rows]);

  // Load demo sample rows on explicit user click
  const handleLoadSampleQuestions = () => {
    const demo = getSampleDemoRows(targetClass, targetSubject, targetChapter);
    setRows(demo);
  };

  // Synchronize targetClass, targetSubject, and targetChapter if autoApplyTarget is enabled
  React.useEffect(() => {
    if (autoApplyTarget && rows.length > 0) {
      setRows(prev => prev.map(r => ({
        ...r,
        class_level: targetClass ? formatClassLevel(targetClass) : r.class_level,
        subject: targetSubject || r.subject,
        chapter: (targetChapter && targetChapter !== 'all') ? targetChapter : r.chapter
      })));
    }
  }, [targetClass, targetSubject, targetChapter, autoApplyTarget]);

  const [summaryModal, setSummaryModal] = useState(null);
  const [previewRow, setPreviewRow] = useState(null);
  const tableContainerRef = useRef(null);

  // Validate a single row
  const validateRow = (r) => {
    const errors = [];
    if (!r.question_text || !r.question_text.trim()) {
      errors.push('Question statement is empty');
    }
    if (!r.marks || isNaN(Number(r.marks)) || Number(r.marks) <= 0) {
      errors.push('Valid marks required');
    }
    if (r.question_type === 'MCQ') {
      if (!r.option_a || !r.option_a.trim()) errors.push('Option A missing');
      if (!r.option_b || !r.option_b.trim()) errors.push('Option B missing');
      if (!r.option_c || !r.option_c.trim()) errors.push('Option C missing');
      if (!r.option_d || !r.option_d.trim()) errors.push('Option D missing');
      if (!['A', 'B', 'C', 'D'].includes(String(r.correct_option || '').toUpperCase())) {
        errors.push('Correct option must be A, B, C, or D');
      }
    }
    return errors;
  };

  // Add a blank row
  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now(),
        class_level: formatClassLevel(targetClass),
        subject: targetSubject,
        chapter: (autoApplyTarget && targetChapter && targetChapter !== 'all') ? targetChapter : '',
        topic: '',
        question_type: 'MCQ',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        answer_text: '',
        marks: '1',
        difficulty: 'Medium',
        diagram_file_name: ''
      }
    ]);
  };

  // Duplicate a row
  const duplicateRow = (index) => {
    const rowToCopy = { ...rows[index], id: Date.now() };
    const updated = [...rows];
    updated.splice(index + 1, 0, rowToCopy);
    setRows(updated);
  };

  // Delete row
  const deleteRow = (index) => {
    setRows(prev => prev.filter((_, idx) => idx !== index));
  };

  // Clear all rows immediately without dialog blocking
  const clearAllRows = () => {
    setRows([]);
    try {
      localStorage.setItem(RECEIVER_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle cell edit
  const handleCellChange = (rowIndex, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
  };

  // =========================================================================
  // POWERFUL DIRECT CLIPBOARD / EXCEL TAB-SEPARATED PASTE ENGINE
  // =========================================================================
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('Text');
    if (!pastedText || !pastedText.includes('\t')) {
      // If it's single line without tabs, let default browser input paste handle it
      return;
    }

    e.preventDefault();

    const rawLines = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (rawLines.length === 0) return;

    // Check if first line contains header text
    let startIndex = 0;
    const firstLineLower = rawLines[0].toLowerCase();
    if (firstLineLower.includes('question') || firstLineLower.includes('marks') || firstLineLower.includes('subject')) {
      startIndex = 1;
    }

    const newRows = [];
    const defaultCls = formatClassLevel(targetClass);

    for (let i = startIndex; i < rawLines.length; i++) {
      const cols = rawLines[i].split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

      let rowObj;
      if (cols.length >= 14) {
        // Full format with Class and Subject
        rowObj = {
          id: Date.now() + i,
          class_level: autoApplyTarget ? defaultCls : formatClassLevel(cols[0] || defaultCls),
          subject: autoApplyTarget ? targetSubject : (cols[1] || targetSubject),
          chapter: (autoApplyTarget && targetChapter && targetChapter !== 'all') ? targetChapter : (cols[2] || ''),
          topic: cols[3] || '',
          question_type: cols[4] || 'MCQ',
          question_text: cols[5] || '',
          option_a: cols[6] || '',
          option_b: cols[7] || '',
          option_c: cols[8] || '',
          option_d: cols[9] || '',
          correct_option: (cols[10] || 'A').toUpperCase(),
          answer_text: cols[11] || '',
          marks: cols[12] || '1',
          difficulty: cols[13] || 'Medium',
          diagram_file_name: cols[14] || ''
        };
      } else if (cols.length >= 10) {
        // Format without class & subject (e.g. Chapter, Topic, Type, Question, Opt A-D...)
        rowObj = {
          id: Date.now() + i,
          class_level: defaultCls,
          subject: targetSubject,
          chapter: (autoApplyTarget && targetChapter && targetChapter !== 'all') ? targetChapter : (cols[0] || ''),
          topic: cols[1] || '',
          question_type: cols[2] || 'MCQ',
          question_text: cols[3] || '',
          option_a: cols[4] || '',
          option_b: cols[5] || '',
          option_c: cols[6] || '',
          option_d: cols[7] || '',
          correct_option: (cols[8] || 'A').toUpperCase(),
          answer_text: cols[9] || '',
          marks: cols[10] || '1',
          difficulty: cols[11] || 'Medium',
          diagram_file_name: cols[12] || ''
        };
      } else {
        // Simple 6-8 column MCQ paste: Question, Option A, Option B, Option C, Option D, Correct, Marks
        rowObj = {
          id: Date.now() + i,
          class_level: defaultCls,
          subject: targetSubject,
          chapter: (autoApplyTarget && targetChapter && targetChapter !== 'all') ? targetChapter : '',
          topic: '',
          question_type: cols[1] ? 'MCQ' : 'Short Answer',
          question_text: cols[0] || '',
          option_a: cols[1] || '',
          option_b: cols[2] || '',
          option_c: cols[3] || '',
          option_d: cols[4] || '',
          correct_option: (cols[5] || 'A').toUpperCase(),
          answer_text: cols[6] || '',
          marks: cols[7] || (cols[1] ? '1' : '2'),
          difficulty: 'Medium',
          diagram_file_name: ''
        };
      }

      newRows.push(rowObj);
    }

    if (newRows.length > 0) {
      setRows(prev => [...prev, ...newRows]);
    }
  };

  // Save valid rows to question bank
  const handleSaveValidRows = async () => {
    const validRows = [];
    const errorRows = [];

    rows.forEach((r, idx) => {
      const errs = validateRow(r);
      if (errs.length === 0) {
        validRows.push({
          ...r,
          marks: Number(r.marks) || 1,
          options: r.question_type === 'MCQ' ? [
            { id: 'A', text: r.option_a, is_correct: r.correct_option === 'A' },
            { id: 'B', text: r.option_b, is_correct: r.correct_option === 'B' },
            { id: 'C', text: r.option_c, is_correct: r.correct_option === 'C' },
            { id: 'D', text: r.option_d, is_correct: r.correct_option === 'D' },
          ] : [],
          tags: r.diagram_file_name ? ['diagram-based'] : []
        });
      } else {
        errorRows.push({ rowIndex: idx + 1, errors: errs });
      }
    });

    if (validRows.length > 0 && onSaveBulkQuestions) {
      await onSaveBulkQuestions(validRows);
      // Remove saved rows from table, leaving only error rows (or clearing completely)
      if (errorRows.length === 0) {
        setRows([]);
        try {
          localStorage.setItem(RECEIVER_STORAGE_KEY, JSON.stringify([]));
        } catch (e) {
          console.error(e);
        }
      } else {
        const errorRowIndices = new Set(errorRows.map(e => e.rowIndex - 1));
        setRows(prev => prev.filter((_, idx) => errorRowIndices.has(idx)));
      }
    }

    setSummaryModal({
      total: rows.length,
      saved: validRows.length,
      errors: errorRows.length,
      errorDetails: errorRows
    });
  };

  const validCount = rows.filter(r => validateRow(r).length === 0).length;

  return (
    <div className="space-y-4 pb-12" onPaste={handlePaste}>
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Question Receiver Table
            </span>
            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30">
              {rows.length} {rows.length === 1 ? 'Row' : 'Rows'}
            </span>
            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
              Target: Class {formatClassLevel(targetClass)} → {targetSubject}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Copy rows directly from Excel or Google Sheets and press <kbd className="bg-slate-950 px-1.5 py-0.5 border border-slate-800 text-amber-300 font-mono">Ctrl + V</kbd> anywhere on this page to paste!
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => downloadSampleExcel(targetClass, targetSubject, targetChapter)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title={`Download sample Excel template pre-filled for ${targetClass} ${targetSubject}${targetChapter && targetChapter !== 'all' ? ` - ${targetChapter}` : ''}`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Template ({formatClassLevel(targetClass)} - {targetSubject}{targetChapter && targetChapter !== 'all' ? ` - ${targetChapter}` : ''})</span>
          </button>

          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Blank Row</span>
          </button>

          {rows.length === 0 && (
            <button
              onClick={handleLoadSampleQuestions}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Load 3 sample demo questions to test receiver functionality"
            >
              <span>Load Demo Rows</span>
            </button>
          )}

          <button
            onClick={clearAllRows}
            disabled={rows.length === 0}
            className={`px-3 py-1.5 text-xs font-semibold border transition ${
              rows.length > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border-slate-700 cursor-pointer'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
            }`}
          >
            Clear All
          </button>

          <button
            onClick={handleSaveValidRows}
            disabled={validCount === 0}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition active:scale-95 ${
              validCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save {validCount} {validCount === 1 ? 'Question' : 'Questions'} to {targetSubject}{targetChapter && targetChapter !== 'all' ? ` (${targetChapter})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div 
        ref={tableContainerRef}
        className="bg-slate-900 border border-slate-800 overflow-x-auto max-h-[650px]"
      >
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead className="bg-slate-950 text-slate-300 sticky top-0 z-20 border-b border-slate-800">
            <tr>
              <th className="p-2.5 w-10 text-center font-bold text-slate-500">#</th>
              <th className="p-2.5 w-16 text-center font-bold text-slate-500">Status</th>
              {RECEIVER_TABLE_COLUMNS.map(col => (
                <th key={col.key} className="p-2.5 font-bold min-w-[130px] whitespace-nowrap text-slate-300 border-r border-slate-800">
                  {col.label}
                  {['Class', 'Subject', 'Question', 'Marks'].includes(col.label) && <span className="text-rose-400 ml-0.5">*</span>}
                </th>
              ))}
              <th className="p-2.5 w-24 text-center font-bold text-slate-500">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={RECEIVER_TABLE_COLUMNS.length + 3} className="py-20 text-center text-slate-400 bg-slate-950/40">
                  <div className="max-w-md mx-auto space-y-3 p-6">
                    <div className="w-12 h-12 mx-auto bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Receiver Table is Empty</div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Copy rows from Excel or Google Sheets and press <kbd className="bg-slate-950 px-1.5 py-0.5 border border-slate-800 text-amber-300 font-mono">Ctrl + V</kbd> to paste questions, or add blank rows manually.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={addRow}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Row</span>
                      </button>
                      <button
                        onClick={handleLoadSampleQuestions}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                      >
                        Load 3 Demo Questions
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => {
              const errors = validateRow(row);
              const hasErrors = errors.length > 0;
              const isMcq = row.question_type === 'MCQ';

              return (
                <tr
                  key={row.id || rIdx}
                  className={`hover:bg-slate-800/50 transition ${
                    hasErrors ? 'bg-rose-950/20' : 'bg-transparent'
                  }`}
                >
                  {/* Row Number */}
                  <td className="p-2 text-center text-slate-500 font-mono text-[11px]">
                    {rIdx + 1}
                  </td>

                  {/* Validation Icon & Tooltip */}
                  <td className="p-2 text-center">
                    {hasErrors ? (
                      <div className="group relative inline-block">
                        <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto cursor-pointer" />
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-30 bg-slate-950 border border-rose-500 text-rose-200 text-[10px] p-2 w-48 shadow-xl">
                          <p className="font-bold mb-1">Errors in Row {rIdx + 1}:</p>
                          <ul className="list-disc pl-3 space-y-0.5">
                            {errors.map((e, eIdx) => <li key={eIdx}>{e}</li>)}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    )}
                  </td>

                  {/* Class */}
                  <td className="p-1 border-r border-slate-800">
                    {autoApplyTarget ? (
                      <div className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-bold text-center">
                        {formatClassLevel(targetClass)}
                      </div>
                    ) : (
                      <select
                        value={row.class_level || formatClassLevel(targetClass)}
                        onChange={(e) => handleCellChange(rIdx, 'class_level', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-1 focus:bg-slate-800 focus:outline-none"
                      >
                        {classes && classes.length > 0 ? (
                          classes.map(c => (
                            <option key={c.id || c.name} value={formatClassLevel(c.name)}>
                              {formatClassLevel(c.name)}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                          </>
                        )}
                      </select>
                    )}
                  </td>

                  {/* Subject */}
                  <td className="p-1 border-r border-slate-800">
                    {autoApplyTarget ? (
                      <div className="px-2 py-1 bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold truncate">
                        {targetSubject}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={row.subject || targetSubject}
                        onChange={(e) => handleCellChange(rIdx, 'subject', e.target.value)}
                        placeholder="Subject"
                        className="w-full bg-transparent border-none text-slate-200 p-1 focus:bg-slate-800 focus:outline-none"
                      />
                    )}
                  </td>

                  {/* Chapter */}
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.chapter || ''}
                      onChange={(e) => handleCellChange(rIdx, 'chapter', e.target.value)}
                      placeholder="Chapter"
                      className="w-full bg-transparent border-none text-slate-200 p-1 focus:bg-slate-800 focus:outline-none"
                    />
                  </td>

                  {/* Topic */}
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.topic || ''}
                      onChange={(e) => handleCellChange(rIdx, 'topic', e.target.value)}
                      placeholder="Topic"
                      className="w-full bg-transparent border-none text-slate-200 p-1 focus:bg-slate-800 focus:outline-none"
                    />
                  </td>

                  {/* Question Type (Dropdown) */}
                  <td className="p-1 border-r border-slate-800">
                    <select
                      value={row.question_type || 'MCQ'}
                      onChange={(e) => handleCellChange(rIdx, 'question_type', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-300 p-1 font-semibold focus:outline-none"
                    >
                      {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>

                  {/* Question Text */}
                  <td className="p-1 border-r border-slate-800 min-w-[220px]">
                    <textarea
                      rows={2}
                      value={row.question_text || ''}
                      onChange={(e) => handleCellChange(rIdx, 'question_text', e.target.value)}
                      placeholder="Type question..."
                      className={`w-full bg-transparent border p-1 text-slate-100 focus:bg-slate-800 focus:outline-none ${
                        !row.question_text?.trim() ? 'border-rose-500/80 bg-rose-500/10' : 'border-transparent'
                      }`}
                    />
                  </td>

                  {/* Option A */}
                  <td className="p-1 border-r border-slate-800 min-w-[120px]">
                    <input
                      type="text"
                      disabled={!isMcq}
                      value={row.option_a || ''}
                      onChange={(e) => handleCellChange(rIdx, 'option_a', e.target.value)}
                      placeholder={isMcq ? "Option A" : "N/A"}
                      className={`w-full bg-transparent border p-1 text-slate-200 focus:bg-slate-800 focus:outline-none ${
                        isMcq && !row.option_a?.trim() ? 'border-rose-500/80 bg-rose-500/10' : 'border-transparent'
                      } ${!isMcq ? 'opacity-40' : ''}`}
                    />
                  </td>

                  {/* Option B */}
                  <td className="p-1 border-r border-slate-800 min-w-[120px]">
                    <input
                      type="text"
                      disabled={!isMcq}
                      value={row.option_b || ''}
                      onChange={(e) => handleCellChange(rIdx, 'option_b', e.target.value)}
                      placeholder={isMcq ? "Option B" : "N/A"}
                      className={`w-full bg-transparent border p-1 text-slate-200 focus:bg-slate-800 focus:outline-none ${
                        isMcq && !row.option_b?.trim() ? 'border-rose-500/80 bg-rose-500/10' : 'border-transparent'
                      } ${!isMcq ? 'opacity-40' : ''}`}
                    />
                  </td>

                  {/* Option C */}
                  <td className="p-1 border-r border-slate-800 min-w-[120px]">
                    <input
                      type="text"
                      disabled={!isMcq}
                      value={row.option_c || ''}
                      onChange={(e) => handleCellChange(rIdx, 'option_c', e.target.value)}
                      placeholder={isMcq ? "Option C" : "N/A"}
                      className={`w-full bg-transparent border p-1 text-slate-200 focus:bg-slate-800 focus:outline-none ${
                        isMcq && !row.option_c?.trim() ? 'border-rose-500/80 bg-rose-500/10' : 'border-transparent'
                      } ${!isMcq ? 'opacity-40' : ''}`}
                    />
                  </td>

                  {/* Option D */}
                  <td className="p-1 border-r border-slate-800 min-w-[120px]">
                    <input
                      type="text"
                      disabled={!isMcq}
                      value={row.option_d || ''}
                      onChange={(e) => handleCellChange(rIdx, 'option_d', e.target.value)}
                      placeholder={isMcq ? "Option D" : "N/A"}
                      className={`w-full bg-transparent border p-1 text-slate-200 focus:bg-slate-800 focus:outline-none ${
                        isMcq && !row.option_d?.trim() ? 'border-rose-500/80 bg-rose-500/10' : 'border-transparent'
                      } ${!isMcq ? 'opacity-40' : ''}`}
                    />
                  </td>

                  {/* Correct Option (Dropdown A, B, C, D) */}
                  <td className="p-1 border-r border-slate-800">
                    <select
                      disabled={!isMcq}
                      value={row.correct_option || 'A'}
                      onChange={(e) => handleCellChange(rIdx, 'correct_option', e.target.value)}
                      className={`w-full bg-slate-950 border border-slate-800 text-emerald-300 p-1 font-bold focus:outline-none ${
                        !isMcq ? 'opacity-40' : ''
                      }`}
                    >
                      {CORRECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>

                  {/* Answer */}
                  <td className="p-1 border-r border-slate-800 min-w-[160px]">
                    <input
                      type="text"
                      value={row.answer_text || ''}
                      onChange={(e) => handleCellChange(rIdx, 'answer_text', e.target.value)}
                      placeholder="Answer text"
                      className="w-full bg-transparent border-none text-slate-200 p-1 focus:bg-slate-800 focus:outline-none"
                    />
                  </td>

                  {/* Marks */}
                  <td className="p-1 border-r border-slate-800 w-16">
                    <input
                      type="number"
                      min="1"
                      value={row.marks || '1'}
                      onChange={(e) => handleCellChange(rIdx, 'marks', e.target.value)}
                      className={`w-full bg-transparent border p-1 text-amber-300 font-bold focus:bg-slate-800 focus:outline-none ${
                        !row.marks || Number(row.marks) <= 0 ? 'border-rose-500 bg-rose-500/10' : 'border-transparent'
                      }`}
                    />
                  </td>

                  {/* Difficulty (Dropdown) */}
                  <td className="p-1 border-r border-slate-800">
                    <select
                      value={row.difficulty || 'Medium'}
                      onChange={(e) => handleCellChange(rIdx, 'difficulty', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-1 focus:outline-none text-[11px]"
                    >
                      {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </td>

                  {/* Diagram File Name */}
                  <td className="p-1 border-r border-slate-800 min-w-[120px]">
                    <input
                      type="text"
                      value={row.diagram_file_name || ''}
                      onChange={(e) => handleCellChange(rIdx, 'diagram_file_name', e.target.value)}
                      placeholder="e.g. fig1.png"
                      className="w-full bg-transparent border-none text-slate-400 p-1 focus:bg-slate-800 focus:outline-none"
                    />
                  </td>

                  {/* Row Action Buttons */}
                  <td className="p-1 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setPreviewRow(row)}
                        className="p-1 text-slate-400 hover:text-amber-400"
                        title="Preview this question"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateRow(rIdx)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Duplicate Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteRow(rIdx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Summary Modal */}
      {summaryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Import Summary Report
              </span>
              <button
                onClick={() => setSummaryModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-3 border border-slate-800">
                <div className="text-xl font-black text-white">{summaryModal.total}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Rows</div>
              </div>
              <div className="bg-emerald-500/10 p-3 border border-emerald-500/30">
                <div className="text-xl font-black text-emerald-400">{summaryModal.saved}</div>
                <div className="text-[10px] text-emerald-300 font-semibold uppercase">Saved Rows</div>
              </div>
              <div className="bg-rose-500/10 p-3 border border-rose-500/30">
                <div className="text-xl font-black text-rose-400">{summaryModal.errors}</div>
                <div className="text-[10px] text-rose-300 font-semibold uppercase">Error Rows</div>
              </div>
            </div>

            {summaryModal.errorDetails.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950 border border-slate-800 text-xs">
                <p className="text-[11px] font-bold text-rose-400">Rows with errors (not saved):</p>
                {summaryModal.errorDetails.map((err, idx) => (
                  <div key={idx} className="text-[11px] text-slate-300">
                    Row {err.rowIndex}: <span className="text-rose-300">{err.errors.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSummaryModal(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
              >
                Add More Questions
              </button>
              <button
                onClick={() => {
                  setSummaryModal(null);
                  setActiveTab('add-question');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                Go to Question Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row Preview Modal */}
      {previewRow && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Row Preview</span>
              <button onClick={() => setPreviewRow(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">Class {previewRow.class_level} • {previewRow.subject} • [{previewRow.marks}M]</div>
              <div className="font-semibold text-white">{previewRow.question_text || 'No question text'}</div>
              {previewRow.question_type === 'MCQ' && (
                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  <div className={`p-1.5 ${previewRow.correct_option === 'A' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900'}`}>
                    (A) {previewRow.option_a}
                  </div>
                  <div className={`p-1.5 ${previewRow.correct_option === 'B' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900'}`}>
                    (B) {previewRow.option_b}
                  </div>
                  <div className={`p-1.5 ${previewRow.correct_option === 'C' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900'}`}>
                    (C) {previewRow.option_c}
                  </div>
                  <div className={`p-1.5 ${previewRow.correct_option === 'D' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900'}`}>
                    (D) {previewRow.option_d}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
