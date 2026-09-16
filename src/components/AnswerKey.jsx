import React, { useState } from 'react';
import {
  KeyRound,
  Printer,
  FileDown,
  CopyCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Layers,
  Info
} from 'lucide-react';
import { RenderMathText } from '../utils/mathRenderer';

export default function AnswerKey({ paper, setActiveTab }) {
  if (!paper) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-dashed border-slate-800">
        <h2 className="text-base font-bold text-white mb-2">No Active Exam Paper</h2>
        <p className="text-xs text-slate-400 mb-4">Generate an exam paper first to view its answer key.</p>
        <button
          onClick={() => setActiveTab('paper-generator')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
        >
          Go to Paper Generator
        </button>
      </div>
    );
  }

  const setKeys = paper.sets && Object.keys(paper.sets).length > 0
    ? Object.keys(paper.sets)
    : ['Set A'];
  const hasMultiSet = setKeys.length > 1;

  const [viewMode, setViewMode] = useState(hasMultiSet ? 'all' : 'single');
  const [activeSetName, setActiveSetName] = useState(setKeys[0] || 'Set A');
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = (mode = viewMode) => {
    const originalTitle = document.title;
    document.title = `Answer_Key_${paper.school_name || 'Exam'}_${paper.subject || 'Paper'}`;

    if (mode === 'all') {
      setViewMode('all');
    } else if (mode === 'single') {
      setViewMode('single');
    }

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }, 150);
  };

  const handleExportWord = async (setName = activeSetName) => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper,
          setName,
          includeAnswerKey: true
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Answer_Key_${paper.title || 'Paper'}_${setName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error exporting: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const renderSingleAnswerSheet = (setName, isSingle = false, isLast = false) => {
    const setData = (paper.sets && paper.sets[setName])
      ? paper.sets[setName]
      : { sections: paper.sections || [], answer_key: [], paper_code: `041/1/${setName.slice(-1)}` };

    const answerList = setData.answer_key || [];

    return (
      <div key={setName} className="w-full">
        <div
          className={`paper-sheet max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl p-8 sm:p-14 border border-slate-300 font-serif-exam print:p-0 print:border-none print:shadow-none ${
            !isLast && !isSingle ? 'paper-sheet-break mb-8' : ''
          } ${isSingle ? 'single-set-sheet' : ''}`}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-950">
              {paper.school_name || "DELHI PUBLIC SCHOOL"}
            </h1>
            <div className="text-sm font-extrabold text-amber-800 mt-1 uppercase tracking-wider">
              OFFICIAL ANSWER KEY & MARKING SCHEME
            </div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">
              {paper.exam_name} ({paper.academic_session}) • Class {paper.class_level} • {paper.subject}
            </div>
            <div className="mt-2 inline-block px-4 py-1 bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black">
              {setName.toUpperCase()} • CODE: {setData.paper_code || `041/1/${setName.slice(-1)}`}
            </div>
          </div>

          {/* Answer Table / Items */}
          <div className="space-y-4">
            {answerList.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No answer key entries generated for this set.</p>
            ) : (
              answerList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 space-y-1.5 text-xs leading-relaxed page-break-inside-avoid"
                >
                  <div className="flex items-center justify-between text-slate-700 font-sans border-b border-slate-200 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                        Q{item.question_number}
                      </span>
                      <span className="font-bold text-slate-900">{item.section_name}</span>
                      <span className="text-slate-500">• {item.question_type}</span>
                    </div>
                    <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 border border-amber-200">
                      [{item.marks} {item.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </div>

                  <div className="pt-1">
                    <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Question:</div>
                    <div className="text-slate-800 italic">
                      <RenderMathText text={item.question_text} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                      Expected Answer & Marking Points:
                    </div>
                    <div className="text-slate-950 whitespace-pre-line font-medium">
                      <RenderMathText text={item.answer || 'Answer not provided.'} />
                    </div>
                    {item.explanation && (
                      <div className="mt-1 text-[11px] text-slate-600 italic">
                        <strong>Explanation: </strong> <RenderMathText text={item.explanation} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center border-t border-slate-300 pt-6 mt-10 text-xs text-slate-500 font-sans">
            <p>*** END OF ANSWER KEY ({setName.toUpperCase()}) ***</p>
            <p className="text-[10px] mt-0.5">CONFIDENTIAL • FOR TEACHER & EVALUATOR USE ONLY</p>
          </div>
        </div>

        {!isLast && !isSingle && (
          <div className="no-print my-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-xs text-amber-400 font-bold">
              <span>End of Answer Key: {setName}</span>
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
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print bg-slate-900 p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky -top-4 sm:-top-6 lg:-top-8 z-20 shadow-xl backdrop-blur-md">
        {/* Set Switcher & View All */}
        <div className="flex items-center gap-2 overflow-x-auto flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <CopyCheck className="w-4 h-4 text-amber-400" />
            Answer Key For:
          </span>

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
              <span>All Sets ({setKeys.length})</span>
            </button>
          )}

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

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('paper-preview')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exam Paper</span>
          </button>

          <button
            onClick={() => handleExportWord(activeSetName)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>{isExporting ? 'Exporting...' : 'Export Key Word'}</span>
          </button>

          {hasMultiSet ? (
            <>
              <button
                onClick={() => handlePrint('all')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print All Keys ({setKeys.length})</span>
              </button>
              <button
                onClick={() => handlePrint('single')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print {activeSetName} Key</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handlePrint('single')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print Key / PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Screen Tip Banner */}
      <div className="no-print bg-slate-900 border border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>
            {viewMode === 'all'
              ? `Displaying Answer Keys for all ${setKeys.length} sets (${setKeys.join(', ')}) simultaneously`
              : `Displaying Answer Key for ${activeSetName}`}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Uncheck "Headers and footers" in the print dialog to prevent date and URL from printing.</span>
        </div>
      </div>

      {/* ANSWER KEY CANVAS SHEETS */}
      <div className="space-y-8">
        {viewMode === 'all' ? (
          setKeys.map((setName, idx) =>
            renderSingleAnswerSheet(setName, false, idx === setKeys.length - 1)
          )
        ) : (
          renderSingleAnswerSheet(activeSetName, true, true)
        )}
      </div>
    </div>
  );
}
