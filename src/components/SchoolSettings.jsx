import React, { useState } from 'react';
import {
  Building2,
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

const BOARD_FORMATS = ['CBSE', 'ICSE', 'State Board', 'Custom School Format'];

export default function SchoolSettings({ settings = {}, onSaveSettings }) {
  const [formData, setFormData] = useState({
    school_name: settings?.school_name || 'DELHI PUBLIC SCHOOL',
    school_logo: settings?.school_logo || '/logo.png',
    address: settings?.address || 'Sector XII, R.K. Puram, New Delhi - 110022',
    academic_session: settings?.academic_session || '2026-27',
    board_format: settings?.board_format || 'CBSE',
    default_time_allowed: settings?.default_time_allowed || '3 Hours',
    default_instructions: settings?.default_instructions || [
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
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInstructionChange = (index, val) => {
    const updated = [...formData.default_instructions];
    updated[index] = val;
    setFormData(prev => ({ ...prev, default_instructions: updated }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      default_instructions: [...prev.default_instructions, 'New exam instruction...']
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      default_instructions: prev.default_instructions.filter((_, idx) => idx !== index)
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const json = await res.json();
      if (json.url) {
        setFormData(prev => ({ ...prev, school_logo: json.url }));
      }
    } catch (err) {
      console.error("Logo upload error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSaveSettings) {
      await onSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-amber-400" />
          <span>School & Examination Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default header details, school crest, academic session, board format, and general instructions.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>School settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 space-y-6">
        {/* Logo & School Name */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950 border border-slate-800">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src={formData.school_logo}
              alt="School Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="text-xs font-bold text-slate-200">School Crest / App Logo</div>
            <p className="text-[11px] text-slate-400">
              This logo is placed prominently on the top header of all generated exam papers and Word/PDF documents.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Change Crest Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* School Name & Session */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">School / Institute Name *</label>
            <input
              type="text"
              value={formData.school_name}
              onChange={(e) => setFormData(prev => ({ ...prev, school_name: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Current Academic Session *</label>
            <input
              type="text"
              value={formData.academic_session}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_session: e.target.value }))}
              placeholder="e.g. 2026-27"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">School Address / Location</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Board Format & Default Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Board Format Template *</label>
            <select
              value={formData.board_format}
              onChange={(e) => setFormData(prev => ({ ...prev, board_format: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              {BOARD_FORMATS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Default Time Allowed</label>
            <input
              type="text"
              value={formData.default_time_allowed}
              onChange={(e) => setFormData(prev => ({ ...prev, default_time_allowed: e.target.value }))}
              placeholder="e.g. 3 Hours"
              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Default General Instructions */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Default General Instructions</span>
              <span className="text-[10px] text-slate-400">These instructions appear on every generated paper header</span>
            </div>

            <button
              type="button"
              onClick={addInstruction}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.default_instructions.map((inst, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={inst}
                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Save School Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
