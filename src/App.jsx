import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddQuestion from './components/AddQuestion';
import ImportQuestions from './components/ImportQuestions';
import QuestionPatternMarks from './components/QuestionPatternMarks';
import PaperGenerator from './components/PaperGenerator';
import CustomExamPaper from './components/CustomExamPaper';
import PaperPreview from './components/PaperPreview';
import AnswerKey from './components/AnswerKey';
import SavedPapers from './components/SavedPapers';
import SchoolSettings from './components/SchoolSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [diagrams, setDiagrams] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activePaper, setActivePaper] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [initialBlueprint, setInitialBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Fetch of all stores
  useEffect(() => {
    async function fetchData() {
      try {
        const [qRes, pRes, patRes, dRes, sRes] = await Promise.all([
          fetch('/api/questions').then(r => r.json()).catch(() => []),
          fetch('/api/papers').then(r => r.json()).catch(() => []),
          fetch('/api/patterns').then(r => r.json()).catch(() => []),
          fetch('/api/diagrams').then(r => r.json()).catch(() => []),
          fetch('/api/settings').then(r => r.json()).catch(() => ({}))
        ]);

        setQuestions(Array.isArray(qRes) ? qRes : []);
        setPapers(Array.isArray(pRes) ? pRes : []);
        setPatterns(Array.isArray(patRes) ? patRes : []);
        setDiagrams(Array.isArray(dRes) ? dRes : []);
        setSettings(sRes || {});

        // If papers exist, set the most recent paper as active preview
        if (Array.isArray(pRes) && pRes.length > 0) {
          setActivePaper(pRes[0]);
        }
      } catch (err) {
        console.error("Error loading PaperForge data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 1. Question Operations
  const handleSaveQuestion = async (qData) => {
    try {
      const method = qData.id && questions.some(q => q.id === qData.id) ? 'PUT' : 'POST';
      const endpoint = method === 'PUT' ? `/api/questions/${qData.id}` : '/api/questions';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qData)
      });
      const saved = await res.json();

      setQuestions(prev => {
        const filtered = prev.filter(q => q.id !== saved.id);
        return [saved, ...filtered];
      });

      setEditingQuestion(null);
      return saved;
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateQuestion = (q) => {
    setEditingQuestion({
      ...q,
      id: undefined,
      question_text: `${q.question_text} (Copy)`
    });
    setActiveTab('add-question');
  };

  const handleSaveBulkQuestions = async (rows) => {
    try {
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });
      const data = await res.json();
      if (data.saved) {
        setQuestions(prev => [...data.saved, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Blueprint / Pattern Operations
  const handleSavePattern = async (patternData) => {
    try {
      const res = await fetch('/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patternData)
      });
      const saved = await res.json();
      setPatterns(prev => {
        const filtered = prev.filter(p => p.id !== saved.id);
        return [saved, ...filtered];
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyPatternToGenerator = (blueprintData) => {
    setInitialBlueprint(blueprintData);
    setActiveTab('paper-generator');
  };

  // 3. Paper & Multi-Set Operations
  const handleGeneratePaper = async (paperData) => {
    try {
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paperData)
      });
      const generated = await res.json();
      setPapers(prev => [generated, ...prev.filter(p => p.id !== generated.id)]);
      setActivePaper(generated);
      return generated;
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Delete this exam paper permanently?')) return;
    try {
      await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      setPapers(prev => prev.filter(p => p.id !== id));
      if (activePaper?.id === id) {
        setActivePaper(papers.find(p => p.id !== id) || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicatePaper = async (paper) => {
    const copy = {
      ...paper,
      id: undefined,
      title: `${paper.title || paper.subject} (Copy)`,
      created_at: new Date().toISOString()
    };
    await handleGeneratePaper(copy);
    setActiveTab('saved-papers');
  };

  // 4. Settings Operations
  const handleSaveSettings = async (settingsData) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      const saved = await res.json();
      setSettings(saved);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Top Navbar - Fixed at top, never scrolls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        stats={{
          totalQuestions: questions.length,
          totalPapers: papers.length
        }}
        onQuickGenerate={() => setActiveTab('paper-generator')}
      />

      {/* Main Layout: Fixed Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full overflow-hidden min-h-0 print:h-auto print:overflow-visible print:block">
        {/* Left Sidebar - Fixed permanently on the left */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'add-question') setEditingQuestion(null);
            setActiveTab(tab);
          }}
        />

        {/* Center Content View Area - Scrollable */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 w-full print:h-auto print:overflow-visible print:p-0 print:block">
          {activeTab === 'dashboard' && (
            <Dashboard
              questions={questions}
              papers={papers}
              patterns={patterns}
              diagrams={diagrams}
              settings={settings}
              setActiveTab={setActiveTab}
              onSelectPaper={(p) => {
                setActivePaper(p);
                setActiveTab('paper-preview');
              }}
            />
          )}

          {activeTab === 'add-question' && (
            <AddQuestion
              questions={questions}
              editingQuestion={editingQuestion}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              setActiveTab={setActiveTab}
            />
          )}

          <div className={activeTab === 'import-questions' ? 'block' : 'hidden'}>
            <ImportQuestions
              onSaveBulkQuestions={handleSaveBulkQuestions}
              setActiveTab={setActiveTab}
            />
          </div>

          {activeTab === 'pattern-marks' && (
            <QuestionPatternMarks
              patterns={patterns}
              questions={questions}
              onSavePattern={handleSavePattern}
              onApplyPatternToGenerator={handleApplyPatternToGenerator}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'paper-generator' && (
            <PaperGenerator
              questions={questions}
              patterns={patterns}
              settings={settings}
              initialBlueprint={initialBlueprint}
              onGeneratePaper={handleGeneratePaper}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'custom-exam' && (
            <CustomExamPaper
              questions={questions}
              settings={settings}
              onGeneratePaper={handleGeneratePaper}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'paper-preview' && (
            <PaperPreview
              paper={activePaper}
              questions={questions}
              onUpdatePaper={(updated) => {
                setActivePaper(updated);
                setPapers(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              onSavePaper={(saved) => {
                alert('Exam paper saved to library!');
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'answer-key' && (
            <AnswerKey
              paper={activePaper}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'saved-papers' && (
            <SavedPapers
              papers={papers}
              onSelectPaper={(p) => {
                setActivePaper(p);
                setActiveTab('paper-preview');
              }}
              onDeletePaper={handleDeletePaper}
              onDuplicatePaper={handleDuplicatePaper}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'school-settings' && (
            <SchoolSettings
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
