import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { QUESTION_TYPES } from '../utils/excelHelper';

export default function QuestionPatternMarks({
  patterns = [],
  questions = [],
  onSavePattern,
  onApplyPatternToGenerator,
  setActiveTab
}) {
  const [selectedPatternId, setSelectedPatternId] = useState(patterns[0]?.id || 'custom');
  const [patternName, setPatternName] = useState('CBSE Class 10 Science (Board Pattern - 80 Marks)');
  const [classLevel, setClassLevel] = useState('10');
  const [subject, setSubject] = useState('Science');
  const [examName, setExamName] = useState('Annual Board Examination');
  const [targetMaxMarks, setTargetMaxMarks] = useState(80);

  // Pattern rows state
  const [rows, setRows] = useState([
    { id: 1, section_name: 'Section A', question_type: 'MCQ', number_of_questions: 16, marks_each: 1, internal_choice: false },
    { id: 2, section_name: 'Section A', question_type: 'Assertion and Reason', number_of_questions: 4, marks_each: 1, internal_choice: false },
    { id: 3, section_name: 'Section B', question_type: 'Very Short Answer', number_of_questions: 6, marks_each: 2, internal_choice: true },
    { id: 4, section_name: 'Section C', question_type: 'Short Answer', number_of_questions: 7, marks_each: 3, internal_choice: true },
    { id: 5, section_name: 'Section D', question_type: 'Long Answer', number_of_questions: 3, marks_each: 5, internal_choice: true },
    { id: 6, section_name: 'Section E', question_type: 'Case Study / Passage Based', number_of_questions: 3, marks_each: 4, internal_choice: true },
  ]);

  // Load an existing blueprint template
  const handleSelectPattern = (patId) => {
    setSelectedPatternId(patId);
    const found = patterns.find(p => p.id === patId);
    if (found) {
      setPatternName(found.pattern_name);
      setClassLevel(found.class_level);
      setSubject(found.subject);
      setExamName(found.exam_name);
      setTargetMaxMarks(found.total_marks);
      setRows(found.rows.map((r, idx) => ({ ...r, id: idx + 1 })));
    }
  };

  // Row operations
  const handleRowChange = (index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRow = () => {
    const nextSec = rows.length > 0 ? rows[rows.length - 1].section_name : 'Section A';
    setRows(prev => [
      ...prev,
      {
        id: Date.now(),
        section_name: nextSec,
        question_type: 'Short Answer',
        number_of_questions: 2,
        marks_each: 3,
        internal_choice: false
      }
    ]);
  };

  const deleteRow = (index) => {
    setRows(prev => prev.filter((_, idx) => idx !== index));
  };

  // Live Calculations
  const totalQuestionsCalculated = rows.reduce((sum, r) => sum + (Number(r.number_of_questions) || 0), 0);
  const totalMarksCalculated = rows.reduce((sum, r) => sum + ((Number(r.number_of_questions) || 0) * (Number(r.marks_each) || 0)), 0);

  // Check if calculated marks match target marks
  const marksMismatch = totalMarksCalculated !== Number(targetMaxMarks);

  // QUESTION BANK INVENTORY CHECK:
  const inventoryWarnings = [];
  rows.forEach((r, idx) => {
    const needed = Number(r.number_of_questions) || 0;
    const available = questions.filter(q =>
      String(q.class_level) === String(classLevel) &&
      q.question_type === r.question_type &&
      (!subject || q.subject.toLowerCase() === subject.toLowerCase())
    ).length;

    if (available < needed) {
      inventoryWarnings.push({
        section: r.section_name,
        question_type: r.question_type,
        needed,
        available,
        shortage: needed - available
      });
    }
  });

  // Save Blueprint
  const handleSave = () => {
    if (!patternName.trim()) {
      alert('Please provide a pattern name.');
      return;
    }

    const payload = {
      id: selectedPatternId !== 'custom' ? selectedPatternId : undefined,
      pattern_name: patternName,
      class_level: classLevel,
      subject,
      exam_name: examName,
      total_marks: totalMarksCalculated,
      total_questions: totalQuestionsCalculated,
      rows
    };

    if (onSavePattern) {
      onSavePattern(payload);
      alert(`Blueprint "${patternName}" saved successfully!`);
    }
  };

  // Apply to Paper Generator
  const handleGenerateFromBlueprint = () => {
    if (onApplyPatternToGenerator) {
      onApplyPatternToGenerator({
        class_level: classLevel,
        subject,
        exam_name: examName,
        total_marks: totalMarksCalculated,
        total_questions: totalQuestionsCalculated,
        rows
      });
      setActiveTab('paper-generator');
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
            <span>Question Pattern & Marks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define exam structure, question types per section, marks per question, and live inventory validation.
          </p>
        </div>

        {/* Saved Templates Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Load Blueprint:</label>
          <select
            value={selectedPatternId}
            onChange={(e) => handleSelectPattern(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="custom">-- Custom Blueprint --</option>
            {patterns.map(p => (
              <option key={p.id} value={p.id}>{p.pattern_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Blueprint Header Settings Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="lg:col-span-2">
            <label className="block font-bold text-slate-300 mb-1">Blueprint / Pattern Name *</label>
            <input
              type="text"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Class Level</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Target Max Marks</label>
            <input
              type="number"
              value={targetMaxMarks}
              onChange={(e) => setTargetMaxMarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Real-time Validation Warnings */}
      {marksMismatch && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Total Marks Mismatch: </span>
              Your pattern totals <strong>{totalMarksCalculated} marks</strong>, but target is <strong>{targetMaxMarks} marks</strong> ({Math.abs(totalMarksCalculated - Number(targetMaxMarks))} marks {totalMarksCalculated > Number(targetMaxMarks) ? 'excess' : 'short'}).
            </div>
          </div>
        </div>
      )}

      {inventoryWarnings.length > 0 && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Question Bank Inventory Warning: Some question types have fewer questions in the bank than needed!</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300">
            {inventoryWarnings.map((w, idx) => (
              <li key={idx}>
                {w.section} ({w.question_type}): Requires <strong>{w.needed}</strong>, but Question Bank only has <strong>{w.available}</strong> (Shortage of {w.shortage}).
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pattern Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
            <tr>
              <th className="p-3 font-bold w-12 text-center text-slate-500">#</th>
              <th className="p-3 font-bold text-slate-300">Section Name</th>
              <th className="p-3 font-bold text-slate-300">Question Type</th>
              <th className="p-3 font-bold text-center text-slate-300">No. of Questions</th>
              <th className="p-3 font-bold text-center text-slate-300">Marks Each</th>
              <th className="p-3 font-bold text-center text-slate-300">Total Marks</th>
              <th className="p-3 font-bold text-center text-slate-300">Internal Choice?</th>
              <th className="p-3 font-bold text-center text-slate-500 w-16">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.map((r, idx) => {
              const rowTotal = (Number(r.number_of_questions) || 0) * (Number(r.marks_each) || 0);

              return (
                <tr key={r.id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                    {idx + 1}
                  </td>

                  {/* Section Name */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.section_name}
                      onChange={(e) => handleRowChange(idx, 'section_name', e.target.value)}
                      placeholder="e.g. Section A"
                      className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </td>

                  {/* Question Type */}
                  <td className="p-2">
                    <select
                      value={r.question_type}
                      onChange={(e) => handleRowChange(idx, 'question_type', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>

                  {/* No. of Questions */}
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={r.number_of_questions}
                      onChange={(e) => handleRowChange(idx, 'number_of_questions', e.target.value)}
                      className="w-20 mx-auto bg-slate-950 border border-slate-800 px-2 py-1.5 text-center text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </td>

                  {/* Marks Each */}
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={r.marks_each}
                      onChange={(e) => handleRowChange(idx, 'marks_each', e.target.value)}
                      className="w-20 mx-auto bg-slate-950 border border-slate-800 px-2 py-1.5 text-center text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </td>

                  {/* Total Marks for this Row */}
                  <td className="p-2 text-center font-bold text-amber-400 text-sm font-mono">
                    {rowTotal}
                  </td>

                  {/* Internal Choice Checkbox */}
                  <td className="p-2 text-center">
                    <label className="cursor-pointer inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!r.internal_choice}
                        onChange={(e) => handleRowChange(idx, 'internal_choice', e.target.checked)}
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400">OR Choice</span>
                    </label>
                  </td>

                  {/* Delete Row */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Summary Footer */}
          <tfoot className="bg-slate-950 border-t-2 border-slate-800 text-slate-200">
            <tr>
              <td colSpan={3} className="p-3 text-right font-black uppercase tracking-wider text-xs text-amber-400">
                Calculated Totals:
              </td>
              <td className="p-3 text-center font-black text-white text-sm">
                {totalQuestionsCalculated} Questions
              </td>
              <td className="p-3 text-center text-xs text-slate-500">
                —
              </td>
              <td className="p-3 text-center font-black text-amber-400 text-base font-mono">
                {totalMarksCalculated} Marks
              </td>
              <td colSpan={2} className="p-3 text-center text-xs">
                {marksMismatch ? (
                  <span className="text-amber-400 font-bold">Target: {targetMaxMarks}M</span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matches Target
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Question Type Row</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save as Template</span>
          </button>

          <button
            onClick={handleGenerateFromBlueprint}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Paper from this Blueprint →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
