import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  PlusCircle,
  Tag,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = ['All', 'Science', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Geography', 'General'];

export default function DiagramLibrary({ diagrams = [], onAddDiagram, setActiveTab }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New diagram form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Science');
  const [newTags, setNewTags] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewLocal, setPreviewLocal] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredDiagrams = diagrams.filter(d => {
    if (selectedCategory !== 'All' && d.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const inTitle = d.title && d.title.toLowerCase().includes(s);
      const inTags = d.tags && d.tags.some(t => t.toLowerCase().includes(s));
      if (!inTitle && !inTags) return false;
    }
    return true;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewLocal(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please provide a diagram title.');
      return;
    }
    if (!selectedFile && !newUrl.trim()) {
      alert('Please upload an image file or provide an image URL.');
      return;
    }

    setIsUploading(true);
    let finalUrl = newUrl;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) finalUrl = data.url;
      } catch (err) {
        console.error(err);
        finalUrl = previewLocal;
      }
    }

    const payload = {
      title: newTitle,
      category: newCategory,
      tags: newTags ? newTags.split(',').map(t => t.trim()) : [],
      url: finalUrl
    };

    if (onAddDiagram) {
      await onAddDiagram(payload);
    }

    setIsUploading(false);
    setShowUploadModal(false);
    setNewTitle('');
    setNewTags('');
    setNewUrl('');
    setSelectedFile(null);
    setPreviewLocal('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-emerald-400" />
            <span>Diagram Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central repository of Science diagrams, maths figures, circuit diagrams, apparatus, and maps.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95"
        >
          <Upload className="w-4 h-4 text-white" />
          <span>Upload New Diagram</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search diagrams by title, tag, topic (e.g. circuit, prism, heart, graph)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Diagrams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDiagrams.map(diag => (
          <div
            key={diag.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/70 p-3 space-y-2.5 transition flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="relative w-full h-44 bg-slate-950 border border-slate-800 flex items-center justify-center mb-2 overflow-hidden">
                <img
                  src={diag.url}
                  alt={diag.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 bg-slate-900/90 text-amber-300 border border-slate-700">
                  {diag.category}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                {diag.title}
              </h4>

              {/* Tags */}
              {diag.tags && diag.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1">
                  {diag.tags.map((t, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-950 text-slate-400 border border-slate-850">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('add-question')}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-bold border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <span>Attach to New Question →</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Upload New Diagram */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload Diagram to Library
              </span>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Diagram Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Human Heart Diagram with Chambers"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. heart, biology, circulation"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* File Upload / Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Upload File (JPG, PNG, WEBP, SVG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 cursor-pointer"
              />
            </div>

            {previewLocal && (
              <div className="text-center p-2 bg-slate-950 border border-slate-800">
                <img src={previewLocal} alt="Preview" className="max-h-32 mx-auto" />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                {isUploading ? 'Uploading...' : 'Save to Library'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
