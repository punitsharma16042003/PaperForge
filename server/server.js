import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadDatabase, saveDatabase } from './db.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for file/diagram uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `diagram_${Date.now()}_${Math.round(Math.random() * 1E6)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Multi-Set Anti-Cheating Helper Functions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function permuteMcqOptions(question) {
  if (question.question_type !== 'MCQ' || !question.options || question.options.length < 2) {
    return question;
  }
  
  // Find correct option text
  const originalCorrect = question.options.find(o => o.is_correct);
  const correctText = originalCorrect ? originalCorrect.text : '';

  // Shuffle options
  const shuffledTexts = shuffleArray(question.options.map(o => o.text));
  const newOptionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const newOptions = shuffledTexts.map((text, idx) => ({
    id: newOptionLabels[idx] || `${idx + 1}`,
    text: text,
    is_correct: text === correctText
  }));

  const correctNew = newOptions.find(o => o.is_correct);
  const correctLabel = correctNew ? correctNew.id : 'A';

  return {
    ...question,
    options: newOptions,
    answer_text: `Option ${correctLabel}: ${correctText}. ${question.explanation || ''}`.trim()
  };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// --- Settings ---
app.get('/api/settings', (req, res) => {
  const db = loadDatabase();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = loadDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// --- Upload School Logo / Diagram ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// --- Diagram Library ---
app.get('/api/diagrams', (req, res) => {
  const db = loadDatabase();
  res.json(db.diagrams || []);
});

app.post('/api/diagrams', upload.single('image'), (req, res) => {
  const db = loadDatabase();
  const { title, category, tags } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.url;

  if (!fileUrl) {
    return res.status(400).json({ error: 'Image file or URL is required' });
  }

  const parsedTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);

  const newDiagram = {
    id: `diag-${Date.now()}`,
    title: title || 'Untitled Diagram',
    category: category || 'General',
    tags: parsedTags,
    url: fileUrl,
    created_at: new Date().toISOString()
  };

  db.diagrams = db.diagrams || [];
  db.diagrams.unshift(newDiagram);
  saveDatabase(db);
  res.json(newDiagram);
});

// --- Classes & Subjects Management ---
app.get('/api/classes', (req, res) => {
  const db = loadDatabase();
  res.json(db.classes || []);
});

app.post('/api/classes', (req, res) => {
  const db = loadDatabase();
  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Class name is required' });

  const cleanName = name.trim();
  const exists = (db.classes || []).some(c => c.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) return res.status(400).json({ error: `Class "${cleanName}" already exists.` });

  const newClass = {
    id: `cls-${Date.now()}`,
    name: cleanName,
    description: description || ''
  };
  db.classes = db.classes || [];
  db.classes.push(newClass);
  saveDatabase(db);
  res.json(newClass);
});

app.put('/api/classes/:id', (req, res) => {
  const db = loadDatabase();
  const { name, description } = req.body;
  const idx = (db.classes || []).findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Class not found' });

  const oldName = db.classes[idx].name;
  const cleanName = (name || oldName).trim();

  // Check duplicate
  const duplicate = (db.classes || []).some(c => c.id !== req.params.id && c.name.toLowerCase() === cleanName.toLowerCase());
  if (duplicate) return res.status(400).json({ error: `Class "${cleanName}" already exists.` });

  db.classes[idx].name = cleanName;
  if (description !== undefined) db.classes[idx].description = description;

  // Update associated subjects and questions
  (db.subjects || []).forEach(s => {
    if (s.class_name.toLowerCase() === oldName.toLowerCase()) {
      s.class_name = cleanName;
    }
  });
  (db.questions || []).forEach(q => {
    const rawCls = q.class_level ? (String(q.class_level).startsWith('Class') ? String(q.class_level) : `Class ${q.class_level}`) : '';
    if (rawCls.toLowerCase() === oldName.toLowerCase()) {
      q.class_level = cleanName.replace(/class\s*/i, '');
    }
  });

  saveDatabase(db);
  res.json(db.classes[idx]);
});

app.delete('/api/classes/:id', (req, res) => {
  const db = loadDatabase();
  const target = (db.classes || []).find(c => c.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Class not found' });

  db.classes = (db.classes || []).filter(c => c.id !== req.params.id);
  // Delete associated subjects
  db.subjects = (db.subjects || []).filter(s => s.class_name.toLowerCase() !== target.name.toLowerCase());
  // Delete associated chapters
  db.chapters = (db.chapters || []).filter(ch => ch.class_name.toLowerCase() !== target.name.toLowerCase());
  // Delete associated questions
  db.questions = (db.questions || []).filter(q => {
    const rawCls = q.class_level ? (String(q.class_level).startsWith('Class') ? String(q.class_level) : `Class ${q.class_level}`) : '';
    return rawCls.toLowerCase() !== target.name.toLowerCase();
  });

  saveDatabase(db);
  res.json({ success: true });
});

// --- Subjects ---
app.get('/api/subjects', (req, res) => {
  const db = loadDatabase();
  let list = db.subjects || [];
  const { class_name } = req.query;
  if (class_name) {
    list = list.filter(s => s.class_name.toLowerCase() === class_name.toLowerCase());
  }
  res.json(list);
});

app.post('/api/subjects', (req, res) => {
  const db = loadDatabase();
  const { class_name, name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Subject name is required' });
  if (!class_name || !class_name.trim()) return res.status(400).json({ error: 'Class name is required' });

  const cleanName = name.trim();
  const cleanClass = class_name.trim();

  // Check duplicate within same class
  const exists = (db.subjects || []).some(s => s.class_name.toLowerCase() === cleanClass.toLowerCase() && s.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) return res.status(400).json({ error: `Subject "${cleanName}" already exists in ${cleanClass}.` });

  const newSubject = {
    id: `sub-${Date.now()}`,
    class_name: cleanClass,
    name: cleanName,
    description: description || ''
  };

  db.subjects = db.subjects || [];
  db.subjects.push(newSubject);
  saveDatabase(db);
  res.json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const db = loadDatabase();
  const { name, description } = req.body;
  const idx = (db.subjects || []).findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });

  const oldSubject = db.subjects[idx];
  const cleanName = (name || oldSubject.name).trim();

  const duplicate = (db.subjects || []).some(s => s.id !== req.params.id && s.class_name.toLowerCase() === oldSubject.class_name.toLowerCase() && s.name.toLowerCase() === cleanName.toLowerCase());
  if (duplicate) return res.status(400).json({ error: `Subject "${cleanName}" already exists in ${oldSubject.class_name}.` });

  const oldName = oldSubject.name;
  db.subjects[idx].name = cleanName;
  if (description !== undefined) db.subjects[idx].description = description;

  // Update associated chapters
  (db.chapters || []).forEach(ch => {
    if (ch.class_name.toLowerCase() === oldSubject.class_name.toLowerCase() && ch.subject_name.toLowerCase() === oldName.toLowerCase()) {
      ch.subject_name = cleanName;
    }
  });

  // Update questions
  (db.questions || []).forEach(q => {
    const rawCls = q.class_level ? (String(q.class_level).startsWith('Class') ? String(q.class_level) : `Class ${q.class_level}`) : '';
    if (rawCls.toLowerCase() === oldSubject.class_name.toLowerCase() && q.subject.toLowerCase() === oldName.toLowerCase()) {
      q.subject = cleanName;
    }
  });

  saveDatabase(db);
  res.json(db.subjects[idx]);
});

app.delete('/api/subjects/:id', (req, res) => {
  const db = loadDatabase();
  const target = (db.subjects || []).find(s => s.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Subject not found' });

  db.subjects = (db.subjects || []).filter(s => s.id !== req.params.id);
  // Delete associated chapters
  db.chapters = (db.chapters || []).filter(ch => !(ch.class_name.toLowerCase() === target.class_name.toLowerCase() && ch.subject_name.toLowerCase() === target.name.toLowerCase()));
  // Delete associated questions
  db.questions = (db.questions || []).filter(q => {
    const rawCls = q.class_level ? (String(q.class_level).startsWith('Class') ? String(q.class_level) : `Class ${q.class_level}`) : '';
    const matchClass = rawCls.toLowerCase() === target.class_name.toLowerCase();
    const matchSubject = q.subject.toLowerCase() === target.name.toLowerCase();
    return !(matchClass && matchSubject);
  });

  saveDatabase(db);
  res.json({ success: true });
});

// --- Chapters Management ---
app.get('/api/chapters', (req, res) => {
  const db = loadDatabase();
  let list = db.chapters || [];
  const { class_name, subject_name } = req.query;

  if (class_name) {
    list = list.filter(ch => ch.class_name.toLowerCase() === class_name.toLowerCase());
  }
  if (subject_name) {
    list = list.filter(ch => ch.subject_name.toLowerCase() === subject_name.toLowerCase());
  }
  res.json(list);
});

app.post('/api/chapters', (req, res) => {
  const db = loadDatabase();
  const { class_name, subject_name, chapter_number, name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Chapter title/name is required' });
  if (!class_name || !class_name.trim()) return res.status(400).json({ error: 'Class name is required' });
  if (!subject_name || !subject_name.trim()) return res.status(400).json({ error: 'Subject name is required' });

  const cleanName = name.trim();
  const cleanClass = class_name.trim();
  const cleanSubject = subject_name.trim();
  const cleanNum = (chapter_number || `Chapter ${(db.chapters || []).length + 1}`).trim();

  const exists = (db.chapters || []).some(ch =>
    ch.class_name.toLowerCase() === cleanClass.toLowerCase() &&
    ch.subject_name.toLowerCase() === cleanSubject.toLowerCase() &&
    ch.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (exists) return res.status(400).json({ error: `Chapter "${cleanName}" already exists in ${cleanClass} - ${cleanSubject}.` });

  const newChapter = {
    id: `chap-${Date.now()}`,
    class_name: cleanClass,
    subject_name: cleanSubject,
    chapter_number: cleanNum,
    name: cleanName,
    description: description || ''
  };

  db.chapters = db.chapters || [];
  db.chapters.push(newChapter);
  saveDatabase(db);
  res.json(newChapter);
});

app.put('/api/chapters/:id', (req, res) => {
  const db = loadDatabase();
  const { chapter_number, name, description } = req.body;
  const idx = (db.chapters || []).findIndex(ch => ch.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Chapter not found' });

  const oldChapter = db.chapters[idx];
  const cleanName = (name || oldChapter.name).trim();

  // Check duplicate
  const duplicate = (db.chapters || []).some(ch =>
    ch.id !== req.params.id &&
    ch.class_name.toLowerCase() === oldChapter.class_name.toLowerCase() &&
    ch.subject_name.toLowerCase() === oldChapter.subject_name.toLowerCase() &&
    ch.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (duplicate) return res.status(400).json({ error: `Chapter "${cleanName}" already exists in this subject.` });

  const oldName = oldChapter.name;
  db.chapters[idx].name = cleanName;
  if (chapter_number !== undefined) db.chapters[idx].chapter_number = chapter_number.trim();
  if (description !== undefined) db.chapters[idx].description = description;

  // Cascade rename in questions if chapter name changed
  if (oldName !== cleanName) {
    (db.questions || []).forEach(q => {
      const rawCls = q.class_level ? (String(q.class_level).startsWith('Class') ? String(q.class_level) : `Class ${q.class_level}`) : '';
      if (
        rawCls.toLowerCase() === oldChapter.class_name.toLowerCase() &&
        (q.subject || '').toLowerCase() === oldChapter.subject_name.toLowerCase() &&
        (q.chapter || '').toLowerCase() === oldName.toLowerCase()
      ) {
        q.chapter = cleanName;
      }
    });
  }

  saveDatabase(db);
  res.json(db.chapters[idx]);
});

app.delete('/api/chapters/:id', (req, res) => {
  const db = loadDatabase();
  const target = (db.chapters || []).find(ch => ch.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Chapter not found' });

  db.chapters = (db.chapters || []).filter(ch => ch.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Questions ---
app.get('/api/questions', (req, res) => {
  const db = loadDatabase();
  let list = db.questions || [];

  const { class_level, subject, chapter, question_type, difficulty, tag, search } = req.query;

  if (class_level) {
    list = list.filter(q => String(q.class_level) === String(class_level));
  }
  if (subject) {
    list = list.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
  }
  if (chapter) {
    list = list.filter(q => q.chapter.toLowerCase() === chapter.toLowerCase());
  }
  if (question_type) {
    list = list.filter(q => q.question_type === question_type);
  }
  if (difficulty) {
    list = list.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (tag) {
    list = list.filter(q => q.tags && q.tags.includes(tag));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(q =>
      (q.question_text && q.question_text.toLowerCase().includes(s)) ||
      (q.topic && q.topic.toLowerCase().includes(s)) ||
      (q.chapter && q.chapter.toLowerCase().includes(s))
    );
  }

  res.json(list);
});

app.post('/api/questions', (req, res) => {
  const db = loadDatabase();
  const q = req.body;

  const newQuestion = {
    id: q.id || `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    class_level: String(q.class_level || '10'),
    subject: q.subject || 'General',
    chapter: q.chapter || '',
    topic: q.topic || '',
    question_type: q.question_type || 'Short Answer',
    question_text: q.question_text || '',
    options: q.options || [],
    answer_text: q.answer_text || '',
    explanation: q.explanation || '',
    marks: Number(q.marks) || 1,
    difficulty: q.difficulty || 'Medium',
    tags: Array.isArray(q.tags) ? q.tags : (q.tags ? q.tags.split(',').map(t => t.trim()) : []),
    diagram_url: q.diagram_url || '',
    diagram_caption: q.diagram_caption || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.questions = db.questions || [];
  db.questions.unshift(newQuestion);
  saveDatabase(db);
  res.json(newQuestion);
});

app.put('/api/questions/:id', (req, res) => {
  const db = loadDatabase();
  const idx = db.questions.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });

  db.questions[idx] = {
    ...db.questions[idx],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  saveDatabase(db);
  res.json(db.questions[idx]);
});

app.delete('/api/questions/:id', (req, res) => {
  const db = loadDatabase();
  db.questions = db.questions.filter(q => q.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// Bulk Insert (from Question Receiver Table or Excel upload)
app.post('/api/questions/bulk', (req, res) => {
  const db = loadDatabase();
  const rawRows = req.body.rows || [];

  let savedCount = 0;
  const savedQuestions = [];

  rawRows.forEach(row => {
    if (!row.question_text || !row.question_text.trim()) return;

    let options = [];
    if (row.question_type === 'MCQ') {
      const correctOpt = (row.correct_option || 'A').toUpperCase().trim();
      options = [
        { id: 'A', text: row.option_a || 'Option A', is_correct: correctOpt === 'A' },
        { id: 'B', text: row.option_b || 'Option B', is_correct: correctOpt === 'B' },
        { id: 'C', text: row.option_c || 'Option C', is_correct: correctOpt === 'C' },
        { id: 'D', text: row.option_d || 'Option D', is_correct: correctOpt === 'D' }
      ];
    }

    const tags = Array.isArray(row.tags)
      ? row.tags
      : (row.tags ? String(row.tags).split(',').map(t => t.trim()) : []);

    const newQ = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      class_level: String(row.class_level || '10'),
      subject: row.subject || 'General',
      chapter: row.chapter || '',
      topic: row.topic || '',
      question_type: row.question_type || 'Short Answer',
      question_text: row.question_text,
      options,
      answer_text: row.answer_text || (row.question_type === 'MCQ' ? `Option ${row.correct_option}` : ''),
      explanation: row.explanation || '',
      marks: Number(row.marks) || 1,
      difficulty: row.difficulty || 'Medium',
      tags,
      diagram_url: row.diagram_url || '',
      diagram_caption: row.diagram_caption || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.questions.unshift(newQ);
    savedQuestions.push(newQ);
    savedCount++;
  });

  saveDatabase(db);
  res.json({ success: true, saved_count: savedCount, saved: savedQuestions });
});

// --- Blueprints / Patterns ---
app.get('/api/patterns', (req, res) => {
  const db = loadDatabase();
  res.json(db.patterns || []);
});

app.post('/api/patterns', (req, res) => {
  const db = loadDatabase();
  const pat = req.body;

  const newPattern = {
    id: pat.id || `pat-${Date.now()}`,
    pattern_name: pat.pattern_name || 'Custom Pattern',
    class_level: String(pat.class_level || '10'),
    subject: pat.subject || 'Science',
    exam_name: pat.exam_name || 'Unit Test',
    total_marks: Number(pat.total_marks) || 0,
    total_questions: Number(pat.total_questions) || 0,
    rows: pat.rows || [],
    created_at: new Date().toISOString()
  };

  db.patterns = db.patterns || [];
  const existingIdx = db.patterns.findIndex(p => p.id === newPattern.id);
  if (existingIdx >= 0) {
    db.patterns[existingIdx] = newPattern;
  } else {
    db.patterns.unshift(newPattern);
  }

  saveDatabase(db);
  res.json(newPattern);
});

app.delete('/api/patterns/:id', (req, res) => {
  const db = loadDatabase();
  db.patterns = (db.patterns || []).filter(p => p.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Papers & Multi-Set Generation ---
app.get('/api/papers', (req, res) => {
  const db = loadDatabase();
  res.json(db.papers || []);
});

app.get('/api/papers/:id', (req, res) => {
  const db = loadDatabase();
  const paper = (db.papers || []).find(p => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: 'Paper not found' });
  res.json(paper);
});

app.post('/api/papers', (req, res) => {
  const db = loadDatabase();
  const payload = req.body;

  const paperId = payload.id || `paper-${Date.now()}`;
  
  // Base paper setup
  const basePaper = {
    id: paperId,
    title: payload.title || `${payload.subject} ${payload.exam_name}`,
    class_level: String(payload.class_level || '10'),
    section: payload.section || 'All Sections',
    subject: payload.subject || 'Science',
    exam_name: payload.exam_name || 'Examination',
    academic_session: payload.academic_session || db.settings.academic_session,
    school_name: payload.school_name || db.settings.school_name,
    school_logo: payload.school_logo || db.settings.school_logo,
    date_of_exam: payload.date_of_exam || new Date().toISOString().split('T')[0],
    time_allowed: payload.time_allowed || '3 Hours',
    total_marks: Number(payload.total_marks) || 80,
    total_questions: Number(payload.total_questions) || 0,
    instructions: payload.instructions || db.settings.default_instructions,
    teacher_name: payload.teacher_name || '',
    sections: payload.sections || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // MULTIPLE SETS GENERATION LOGIC (Anti-Cheating Feature)
  const antiCheating = payload.anti_cheating || {};
  const isMultiSet = payload.generate_multiple_sets === true || antiCheating.enabled === true || payload.is_multi_set === true;
  const numSetsCount = Number(payload.num_sets || antiCheating.num_sets || (isMultiSet ? 4 : 1));
  const defaultSetLabels = ['Set A', 'Set B', 'Set C', 'Set D'].slice(0, Math.min(4, Math.max(1, numSetsCount)));
  const setNames = payload.set_names || (isMultiSet ? defaultSetLabels : ['Set A']);
  const shuffleOptions = payload.shuffle_options !== false && antiCheating.shuffle_options !== false; // default true
  const shuffleQuestions = payload.shuffle_questions !== false && antiCheating.shuffle_questions !== false; // default true
  const swapEquivalent = payload.swap_equivalent === true || antiCheating.swap_equivalent === true; // alternative bank swap

  const generatedSets = {};

  setNames.forEach((setName, setIndex) => {
    // Generate each set based on the base sections
    const setSections = basePaper.sections.map(section => {
      let questionsCopy = section.questions.map(q => ({ ...q }));

      // 1. Swap with equivalent questions from bank if requested
      if (swapEquivalent && setIndex > 0) {
        questionsCopy = questionsCopy.map(q => {
          const equivalents = (db.questions || []).filter(bankQ => 
            bankQ.id !== q.id &&
            bankQ.class_level === q.class_level &&
            bankQ.subject === q.subject &&
            bankQ.question_type === q.question_type &&
            bankQ.marks === q.marks
          );
          if (equivalents.length > 0) {
            const randomEquiv = equivalents[Math.floor(Math.random() * equivalents.length)];
            return { ...randomEquiv };
          }
          return q;
        });
      }

      // 2. Shuffle Question Order within section (for Set B, C, D)
      if (shuffleQuestions && setIndex > 0) {
        questionsCopy = shuffleArray(questionsCopy);
      }

      // 3. Permute MCQ options per set and update answer key
      if (shuffleOptions && setIndex > 0) {
        questionsCopy = questionsCopy.map(q => permuteMcqOptions(q));
      }

      return {
        ...section,
        questions: questionsCopy
      };
    });

    // Re-number questions consecutively across sections
    let currentQNum = 1;
    const numberedSections = setSections.map(sec => {
      const renumberedQuestions = sec.questions.map(q => {
        const qNum = currentQNum++;
        return {
          ...q,
          display_number: qNum
        };
      });
      return {
        ...sec,
        questions: renumberedQuestions
      };
    });

    // Generate Answer Key for this Set
    const answerKey = [];
    numberedSections.forEach(sec => {
      sec.questions.forEach(q => {
        answerKey.push({
          question_number: q.display_number,
          section_name: sec.section_name,
          question_text: q.question_text,
          question_type: q.question_type,
          marks: q.marks,
          answer: q.answer_text,
          explanation: q.explanation || ''
        });
      });
    });

    generatedSets[setName] = {
      set_name: setName,
      paper_code: `${basePaper.subject.slice(0, 3).toUpperCase()}-${basePaper.class_level}/${setIndex + 1}/${setName.slice(-1)}`,
      sections: numberedSections,
      answer_key: answerKey
    };
  });

  basePaper.is_multi_set = isMultiSet;
  basePaper.sets = generatedSets;
  basePaper.active_set = setNames[0] || 'Set A';

  db.papers = db.papers || [];
  const existingPaperIdx = db.papers.findIndex(p => p.id === basePaper.id);
  if (existingPaperIdx >= 0) {
    db.papers[existingPaperIdx] = basePaper;
  } else {
    db.papers.unshift(basePaper);
  }

  saveDatabase(db);
  res.json(basePaper);
});

app.delete('/api/papers/:id', (req, res) => {
  const db = loadDatabase();
  db.papers = (db.papers || []).filter(p => p.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Word (.docx) Document Generator ---
app.post('/api/export/docx', async (req, res) => {
  try {
    const { paper, setName = 'Set A', includeAnswerKey = false } = req.body;
    if (!paper) return res.status(400).json({ error: 'Paper data is required' });

    const activeSet = (paper.sets && paper.sets[setName]) ? paper.sets[setName] : { sections: paper.sections || [] };

    const docChildren = [];

    // Header: School Name
    docChildren.push(
      new Paragraph({
        text: (paper.school_name || "SCHOOL NAME").toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );

    // Exam & Session Info
    docChildren.push(
      new Paragraph({
        text: `${paper.exam_name || "EXAMINATION"} (${paper.academic_session || "2026-27"})`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );

    // Set & Paper Code
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `SET: ${setName.toUpperCase()}`, bold: true, size: 24, color: "D97706" }),
          new TextRun({ text: `     CODE: ${activeSet.paper_code || "041/1/A"}`, bold: true, size: 20 })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    // Class, Subject, Time, Max Marks Table
    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`Class: ${paper.class_level}`)] }),
            new TableCell({ children: [new Paragraph(`Subject: ${paper.subject}`)] }),
            new TableCell({ children: [new Paragraph(`Time: ${paper.time_allowed || '3 Hours'}`)] }),
            new TableCell({ children: [new Paragraph(`Max Marks: ${paper.total_marks || '80'}`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Name: ____________________")] }),
            new TableCell({ children: [new Paragraph("Roll No.: ________________")] }),
            new TableCell({ children: [new Paragraph("Section: _________________")] }),
            new TableCell({ children: [new Paragraph("Date: ___________________")] })
          ]
        })
      ]
    });
    docChildren.push(infoTable);

    docChildren.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // General Instructions
    if (paper.instructions && paper.instructions.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "General Instructions:",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 100, after: 100 }
        })
      );
      paper.instructions.forEach((inst, idx) => {
        docChildren.push(
          new Paragraph({
            text: `${idx + 1}. ${inst}`,
            spacing: { after: 60 }
          })
        );
      });
    }

    docChildren.push(new Paragraph({ text: "—".repeat(40), alignment: AlignmentType.CENTER, spacing: { before: 100, after: 200 } }));

    // Questions by Section
    (activeSet.sections || []).forEach(sec => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${sec.section_name.toUpperCase()}`, bold: true, size: 24, underline: {} }),
            new TextRun({ text: `  (${sec.questions.length} Questions × ${sec.marks_each || ''} Marks = ${sec.total_marks || ''} Marks)`, italics: true })
          ],
          spacing: { before: 200, after: 150 }
        })
      );

      (sec.questions || []).forEach(q => {
        const qNum = q.display_number || q.question_number || '';
        const markBadge = q.marks ? ` [${q.marks}]` : '';

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Q${qNum}. `, bold: true }),
              new TextRun({ text: `${q.question_text}` }),
              new TextRun({ text: markBadge, bold: true, color: "4B5563" })
            ],
            spacing: { before: 100, after: 60 }
          })
        );

        // Render MCQ options if any
        if (q.question_type === 'MCQ' && q.options && q.options.length > 0) {
          const optCells = q.options.map(opt => 
            new TableCell({
              children: [new Paragraph(`(${opt.id}) ${opt.text}`)]
            })
          );
          
          const optTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: optCells.slice(0, 2) }),
              optCells.length > 2 ? new TableRow({ children: optCells.slice(2, 4) }) : new TableRow({ children: [] })
            ]
          });
          docChildren.push(optTable);
        }
      });
    });

    // Answer Key Appendix if requested
    if (includeAnswerKey && activeSet.answer_key) {
      docChildren.push(
        new Paragraph({
          text: `ANSWER KEY & MARKING SCHEME - ${setName.toUpperCase()}`,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 }
        })
      );

      activeSet.answer_key.forEach(ans => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Q${ans.question_number} (${ans.section_name}) [${ans.marks}M]: `, bold: true }),
              new TextRun({ text: ans.answer || 'Answer details', color: "1E3A8A" })
            ],
            spacing: { before: 80, after: 40 }
          })
        );
      });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Disposition', `attachment; filename="${paper.title || 'Paper'}_${setName}.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);

  } catch (err) {
    console.error("Error generating DOCX:", err);
    res.status(500).json({ error: 'Failed to generate Word document', details: err.message });
  }
});

// Serve production build if exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`PaperForge API & Web server running on http://localhost:${PORT}`);
});

