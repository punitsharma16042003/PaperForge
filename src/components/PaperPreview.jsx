import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  KeyRound,
  Edit2,
  Trash2,
  RefreshCw,
  CopyCheck,
  CheckCircle2,
  Save,
  ArrowLeft,
  X,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { RenderMathText } from '../utils/mathRenderer';

export default function PaperPreview({
  paper,
  questions = [],
  onUpdatePaper,
  onSavePaper,
  setActiveTab
}) {
  if (!paper) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-dashed border-slate-800">
        <h2 className="text-base font-bold text-white mb-2">No Active Exam Paper</h2>
        <p className="text-xs text-slate-400 mb-4">Generate an exam paper first to view its preview.</p>
        <button
          onClick={() => setActiveTab('paper-generator')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
        >
          Go to Paper Generator
        </button>
      </div>
    );
  }

  // Multi-set support: detect sets
  const setKeys = paper.sets && Object.keys(paper.sets).length > 0
    ? Object.keys(paper.sets)
    : ['Set A'];
  const hasMultiSet = setKeys.length > 1;

  // View mode: 'all' to show all sets simultaneously, or 'single' to view a specific set
  const [viewMode, setViewMode] = useState(hasMultiSet ? 'all' : 'single');
  const [activeSetName, setActiveSetName] = useState(setKeys[0] || 'Set A');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Active set data for single set mode
  const currentSet = (paper.sets && paper.sets[activeSetName])
    ? paper.sets[activeSetName]
    : { sections: paper.sections || [], paper_code: '041/1/A' };

  // Browser Native Print: handles both printing current set or all sets
  const handlePrint = (mode = viewMode) => {
    const originalTitle = document.title;
    // Set a clean document title so browser header doesn't print "localhost" or "Vite App"
    document.title = `${paper.school_name || 'Exam'} - ${paper.subject || 'Paper'}`;

    if (mode === 'all') {
      setViewMode('all');
    } else if (mode === 'single') {
      setViewMode('single');
    }

    // Small timeout to allow DOM to synchronize
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }, 150);
  };

  // Export to Real Word (.docx) via backend API
  const handleExportWord = async (setName = activeSetName, includeAnswerKey = false) => {
    setIsExportingDocx(true);
    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper,
          setName,
          includeAnswerKey
        })
      });

      if (!response.ok) throw new Error('Failed to generate Word document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.title || 'Exam_Paper'}_${setName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Error exporting Word file: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Inline Question Edit Save
  const handleSaveEditedQuestion = (updatedQ) => {
    const targetSetName = editingQuestion?.targetSetName || activeSetName;
    const targetSetData = (paper.sets && paper.sets[targetSetName]) || currentSet;

    const updatedSections = targetSetData.sections.map(sec => ({
      ...sec,
      questions: sec.questions.map(q => q.id === updatedQ.id ? updatedQ : q)
    }));

    const updatedPaper = {
      ...paper,
      sets: {
        ...(paper.sets || {}),
        [targetSetName]: {
          ...targetSetData,
          sections: updatedSections
        }
      }
    };

    if (onUpdatePaper) onUpdatePaper(updatedPaper);
    setEditingQuestion(null);
  };

  // Question Swap
  const handleSwapQuestion = (targetQ, replacementQ) => {
    const targetSetName = showSwapModal?.targetSetName || activeSetName;
    const targetSetData = (paper.sets && paper.sets[targetSetName]) || currentSet;

    const updatedSections = targetSetData.sections.map(sec => ({
      ...sec,
      questions: sec.questions.map(q => q.id === targetQ.id ? { ...replacementQ, display_number: targetQ.display_number } : q)
    }));

    const updatedPaper = {
      ...paper,
      sets: {
        ...(paper.sets || {}),
        [targetSetName]: {
          ...targetSetData,
          sections: updatedSections
        }
      }
    };

    if (onUpdatePaper) onUpdatePaper(updatedPaper);
    setShowSwapModal(null);
  };

  // Delete Question
  const handleDeleteQuestion = (qId, targetSetName = activeSetName) => {
    if (!window.confirm('Remove this question from the exam paper?')) return;
    const targetSetData = (paper.sets && paper.sets[targetSetName]) || currentSet;

    const updatedSections = targetSetData.sections.map(sec => ({
      ...sec,
      questions: sec.questions.filter(q => q.id !== qId)
    }));

    const updatedPaper = {
      ...paper,
      sets: {
        ...(paper.sets || {}),
        [targetSetName]: {
          ...targetSetData,
          sections: updatedSections
        }
      }
    };

    if (onUpdatePaper) onUpdatePaper(updatedPaper);
  };

  // Render a Single Set Paper Sheet
  const renderPaperSheet = (setName, isSingle = false, isLast = false) => {
    const setData = (paper.sets && paper.sets[setName])
      ? paper.sets[setName]
      : { sections: paper.sections || [], paper_code: `041/1/${setName.slice(-1)}` };

    return (
      <div key={setName} className="w-full">
        <div
          className={`paper-sheet max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl p-8 sm:p-14 border border-slate-300 font-serif-exam print:p-0 print:border-none print:shadow-none ${
            !isLast && !isSingle ? 'paper-sheet-break mb-8' : ''
          } ${isSingle ? 'single-set-sheet' : ''}`}
        >
          {/* Paper Header (School, Session, Exam Name) */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <img
                src={paper.school_logo || "/logo.png"}
                alt="School Logo"
                className="w-12 h-12 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-950">
                {paper.school_name || "DELHI PUBLIC SCHOOL"}
              </h1>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mt-1">
              Academic Session: {paper.academic_session || "2026-27"}
            </div>

            <div className="text-sm font-black text-slate-900 mt-0.5 uppercase tracking-wide">
              {paper.exam_name || "Annual Examination"}
            </div>

            {/* Set Badge & Code */}
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-extrabold">
              <span className="px-3.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-400 font-bold text-sm tracking-wider">
                {setName.toUpperCase()}
              </span>
              <span className="text-slate-700 font-mono">
                Paper Code: <strong>{setData.paper_code || `041/1/${setName.slice(-1)}`}</strong>
              </span>
            </div>
          </div>

          {/* Paper Metadata Table: Class, Subject, Time, Max Marks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold border-b border-slate-300 pb-3 mb-4 text-slate-800">
            <div>Class: <span className="font-normal text-slate-950">{paper.class_level}</span></div>
            <div>Subject: <span className="font-normal text-slate-950">{paper.subject}</span></div>
            <div>Time Allowed: <span className="font-normal text-slate-950">{paper.time_allowed || '3 Hours'}</span></div>
            <div className="text-right">Maximum Marks: <span className="font-bold text-slate-950">{paper.total_marks || '80'}</span></div>
          </div>

          {/* Student Fill-in Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-300 pb-3 mb-5 text-slate-700">
            <div>Name: <span className="border-b border-dotted border-slate-400 inline-block w-24"></span></div>
            <div>Roll No: <span className="border-b border-dotted border-slate-400 inline-block w-20"></span></div>
            <div>Section: <span className="border-b border-dotted border-slate-400 inline-block w-16"></span></div>
            <div className="text-right">Date: <span className="border-b border-dotted border-slate-400 inline-block w-20">{paper.date_of_exam}</span></div>
          </div>

          {/* General Instructions Box */}
          {paper.instructions && paper.instructions.length > 0 && (
            <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 text-xs leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-[11px]">
                General Instructions:
              </h4>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                {paper.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Sections and Questions */}
          <div className="space-y-6">
            {(setData.sections || []).map((sec, sIdx) => (
              <div key={sIdx} className="space-y-4 page-break-inside-avoid">
                {/* Section Header */}
                <div className="section-header text-center border-y border-slate-400 py-1.5 my-3 bg-slate-50/70">
                  <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-900">
                    {sec.section_name}
                  </h3>
                  <p className="text-[11px] text-slate-600 italic">
                    ({sec.questions?.length || 0} Questions × {sec.marks_each || ''} Marks = {sec.total_marks || ''} Marks)
                  </p>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {(sec.questions || []).map((q) => {
                    const qNum = q.display_number || 1;

                    return (
                      <div
                        key={q.id}
                        className="question-item group relative text-[13px] leading-relaxed text-slate-900 page-break-inside-avoid"
                      >
                        {/* Floating Inline Action Tools (Visible on Hover in Browser, Hidden in Print) */}
                        <div className="no-print absolute -top-2 right-0 hidden group-hover:flex items-center gap-1 bg-slate-900 text-white px-2 py-1 shadow-lg text-[10px] z-10">
                          <button
                            onClick={() => setEditingQuestion({ ...q, targetSetName: setName })}
                            className="hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                            title="Edit Question Text"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            onClick={() => setShowSwapModal({ ...q, targetSetName: setName })}
                            className="hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                            title="Swap with Alternative Question"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Swap</span>
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            onClick={() => handleDeleteQuestion(q.id, setName)}
                            className="hover:text-rose-400 cursor-pointer"
                            title="Remove from Paper"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Question Statement & Marks */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <strong className="font-bold mr-1.5">Q{qNum}.</strong>
                            <RenderMathText text={q.question_text} />
                          </div>
                          <span className="font-bold text-slate-800 text-xs shrink-0 whitespace-nowrap ml-2">
                            [{q.marks}]
                          </span>
                        </div>

                        {/* Diagram Image */}
                        {q.diagram_url && (
                          <div className="my-2.5 text-center">
                            <img
                              src={q.diagram_url}
                              alt="Question Figure"
                              className="max-h-44 mx-auto border border-slate-300"
                            />
                            {q.diagram_caption && (
                              <p className="text-[11px] text-slate-600 italic mt-1">
                                Fig: {q.diagram_caption}
                              </p>
                            )}
                          </div>
                        )}

                        {/* MCQ Options Display (Grid) */}
                        {q.question_type === 'MCQ' && q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-800 pl-4">
                            {q.options.map(opt => (
                              <div key={opt.id} className="flex items-start gap-1">
                                <span className="font-bold">({opt.id})</span>
                                <span><RenderMathText text={opt.text} /></span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Paper Footer */}
          <div className="text-center border-t border-slate-300 pt-6 mt-10 text-xs text-slate-500 font-sans">
            <p>*** END OF QUESTION PAPER ({setName.toUpperCase()}) ***</p>
            <p className="text-[10px] mt-0.5">Paper Code: {setData.paper_code || '041/1/A'} • Generated via PaperForge</p>
          </div>
        </div>

        {/* In-Browser Divider between multiple sets */}
        {!isLast && !isSingle && (
          <div className="no-print my-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-xs text-amber-400 font-bold">
              <span>End of {setName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Next Set Below ↓</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-slate-900 p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky -top-4 sm:-top-6 lg:-top-8 z-20 shadow-xl backdrop-blur-md">
        {/* Set Switcher & View All Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <CopyCheck className="w-4 h-4 text-amber-400" />
            Sets View:
          </span>

          {/* Button to view all sets together on screen */}
          {hasMultiSet && (
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-xs font-extrabold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View All Sets ({setKeys.length})</span>
            </button>
          )}

          {/* Individual Set Buttons */}
          {setKeys.map(setName => (
            <button
              key={setName}
              onClick={() => {
                setActiveSetName(setName);
                setViewMode('single');
              }}
              className={`px-3 py-1.5 text-xs font-extrabold transition shrink-0 cursor-pointer ${
                viewMode === 'single' && activeSetName === setName
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {setName}
            </button>
          ))}
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('answer-key')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Answer Key</span>
          </button>

          <button
            onClick={() => handleExportWord(activeSetName, false)}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>{isExportingDocx ? 'Exporting...' : 'Export Word'}</span>
          </button>

          {/* Print Buttons: Offer both Print All Sets and Print Single Set */}
          {hasMultiSet ? (
            <>
              <button
                onClick={() => handlePrint('all')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-md"
                title="Print all sets in sequence with page breaks between sets"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print All {setKeys.length} Sets</span>
              </button>

              <button
                onClick={() => handlePrint('single')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                title={`Print only ${activeSetName}`}
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print {activeSetName} Only</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handlePrint('single')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print / PDF</span>
            </button>
          )}

          <button
            onClick={() => onSavePaper && onSavePaper(paper)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Screen Status Banner & Print Clean Tip */}
      <div className="no-print bg-slate-900 border border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>
            {viewMode === 'all'
              ? `Displaying all ${setKeys.length} sets (${setKeys.join(', ')}) simultaneously on screen`
              : `Displaying ${activeSetName} on screen`}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Clean Print Guarantee: In the print dialog, uncheck <strong>"Headers and footers"</strong> to remove any date, time, or URL.
          </span>
        </div>
      </div>

      {/* PAPER CANVAS SHEETS CONTAINER */}
      <div className="space-y-8">
        {viewMode === 'all' ? (
          // View All Sets Mode: Renders Set A, Set B, Set C, Set D sequentially
          setKeys.map((setName, idx) =>
            renderPaperSheet(setName, false, idx === setKeys.length - 1)
          )
        ) : (
          // Single Set Mode: Renders only the selected set
          renderPaperSheet(activeSetName, true, true)
        )}
      </div>

      {/* Modal: Inline Question Editor */}
      {editingQuestion && (
        <div className="no-print fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Edit Question in Paper</span>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question Text</label>
                <textarea
                  rows={4}
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Marks</label>
                <input
                  type="number"
                  value={editingQuestion.marks}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })}
                  className="w-24 bg-slate-950 border border-slate-700 p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEditedQuestion(editingQuestion)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Swap Question with Alternative from Question Bank */}
      {showSwapModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Swap Question with Alternative</span>
                <p className="text-xs text-slate-400">Select a replacement question with the same marks ({showSwapModal.marks}M)</p>
              </div>
              <button onClick={() => setShowSwapModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 p-1">
              {questions
                .filter(q => q.id !== showSwapModal.id && q.marks === showSwapModal.marks)
                .map(altQ => (
                  <div
                    key={altQ.id}
                    onClick={() => handleSwapQuestion(showSwapModal, altQ)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{altQ.chapter} • {altQ.question_type}</span>
                      <span className="font-bold text-amber-400 group-hover:text-amber-300">Click to Select →</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      <RenderMathText text={altQ.question_text} />
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

