import * as XLSX from 'xlsx';

export const RECEIVER_TABLE_COLUMNS = [
  { key: 'class_level', label: 'Class', placeholder: '10' },
  { key: 'subject', label: 'Subject', placeholder: 'Science' },
  { key: 'chapter', label: 'Chapter', placeholder: 'Chemical Reactions' },
  { key: 'topic', label: 'Topic', placeholder: 'Types of Reactions' },
  { key: 'question_type', label: 'Question Type', placeholder: 'MCQ' },
  { key: 'question_text', label: 'Question', placeholder: 'What is the color of lead iodide precipitate?' },
  { key: 'option_a', label: 'Option A', placeholder: 'White' },
  { key: 'option_b', label: 'Option B', placeholder: 'Yellow' },
  { key: 'option_c', label: 'Option C', placeholder: 'Brown' },
  { key: 'option_d', label: 'Option D', placeholder: 'Black' },
  { key: 'correct_option', label: 'Correct Option', placeholder: 'B' },
  { key: 'answer_text', label: 'Answer / Solution', placeholder: 'Option B: Yellow precipitate of lead iodide.' },
  { key: 'marks', label: 'Marks', placeholder: '1' },
  { key: 'difficulty', label: 'Difficulty', placeholder: 'Easy' },
  { key: 'diagram_file_name', label: 'Diagram File Name', placeholder: 'circuit1.png' }
];

export const QUESTION_TYPES = [
  'MCQ',
  'Fill in the Blanks',
  'True / False',
  'Very Short Answer',
  'Short Answer',
  'Long Answer',
  'Case Study / Passage Based',
  'Diagram Based',
  'Numerical Questions',
  'Match the Following',
  'Assertion and Reason',
  'Essay Type Questions'
];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export const CORRECT_OPTIONS = ['A', 'B', 'C', 'D'];

// Helper to extract clean class string
export const formatClassLevel = (cls) => {
  if (!cls) return '10';
  const str = String(cls).trim();
  const match = str.match(/^class\s*(.+)$/i);
  return match ? match[1] : str;
};

// Generate customized template pre-filled for the chosen Class, Subject, and Chapter
export const downloadSampleExcel = (targetClass = '10', targetSubject = 'Science', targetChapterOrFormat = '', maybeFormat = 'xlsx') => {
  let targetChapter = '';
  let format = 'xlsx';
  if (targetChapterOrFormat === 'xlsx' || targetChapterOrFormat === 'csv') {
    format = targetChapterOrFormat;
    targetChapter = '';
  } else {
    targetChapter = targetChapterOrFormat || '';
    format = maybeFormat || 'xlsx';
  }

  const cleanClass = formatClassLevel(targetClass);
  const cleanSubject = String(targetSubject || 'General').trim();
  const headers = RECEIVER_TABLE_COLUMNS.map(c => c.label);

  // Subject-adaptive sample questions
  let sampleData = [];
  const lowerSub = cleanSubject.toLowerCase();

  if (lowerSub.includes('math')) {
    sampleData = [
      [
        cleanClass, cleanSubject, 'Quadratic Equations', 'Discriminant', 'MCQ',
        'If the discriminant b^2 - 4ac > 0 and is a perfect square, the roots are:',
        'Real and rational', 'Real and irrational', 'Complex conjugates', 'Equal and real', 'A',
        'Option A: Real, distinct and rational.',
        '1', 'Easy', ''
      ],
      [
        cleanClass, cleanSubject, 'Trigonometry', 'Heights and Distances', 'Short Answer',
        'A ladder 15 m long just reaches the top of a vertical wall. If the ladder makes an angle of 60° with the wall, find the height of the wall.',
        '', '', '', '', '',
        'Height = 15 * cos(60°) = 7.5 m.',
        '3', 'Medium', ''
      ],
      [
        cleanClass, cleanSubject, 'Triangles', 'Similarity Criteria', 'Long Answer',
        'State and prove Basic Proportionality Theorem (Thales Theorem) for a triangle.',
        '', '', '', '', '',
        'Proof involves constructing perpendiculars and comparing ratio of areas of triangles with equal heights.',
        '5', 'Hard', ''
      ]
    ];
  } else if (lowerSub.includes('phys')) {
    sampleData = [
      [
        cleanClass, cleanSubject, 'Electricity', "Ohm's Law", 'MCQ',
        'What is the SI unit of electric resistance?',
        'Volt', 'Ohm', 'Ampere', 'Watt', 'B',
        'Option B: Ohm (Ω) is the SI unit of electrical resistance.',
        '1', 'Easy', ''
      ],
      [
        cleanClass, cleanSubject, 'Light', 'Refraction & Lenses', 'Short Answer',
        'State Snell’s law of refraction and define refractive index of a medium.',
        '', '', '', '', '',
        'sin(i) / sin(r) = constant = n21. It is the ratio of speed of light in vacuum to speed in medium.',
        '3', 'Medium', ''
      ],
      [
        cleanClass, cleanSubject, 'Magnetic Effects', 'Electromagnetic Induction', 'Assertion and Reason',
        'Assertion: When a bar magnet is moved towards a coil, an emf is induced in the coil. Reason: Change in magnetic flux induces an emf.',
        'Both A and R are true and R is correct explanation of A',
        'Both A and R are true but R is not correct explanation',
        'A is true but R is false',
        'A is false but R is true',
        'A',
        'Option A: Both assertion and reason are true according to Faraday’s law of induction.',
        '1', 'Medium', ''
      ]
    ];
  } else {
    // Default Science / General Template
    sampleData = [
      [
        cleanClass, cleanSubject, 'Chemical Reactions', 'Types of Reactions', 'MCQ',
        'What is the color of lead iodide precipitate?',
        'White', 'Yellow', 'Brown', 'Black', 'B',
        'Option B: Yellow precipitate of lead iodide PbI2.',
        '1', 'Easy', ''
      ],
      [
        cleanClass, cleanSubject, 'Electricity', "Ohm's Law", 'Short Answer',
        'State Ohm’s law and write its mathematical equation with SI units.',
        '', '', '', '', '',
        'V = I * R. Current is directly proportional to potential difference across conductor ends at constant temperature.',
        '3', 'Medium', ''
      ],
      [
        cleanClass, cleanSubject, 'Life Processes', 'Cellular Respiration', 'Assertion and Reason',
        'Assertion: Anaerobic respiration in yeast produces ethanol and CO2. Reason: Glycolysis breaks glucose into pyruvate in the cytoplasm.',
        'Both A and R are true and R is correct explanation of A',
        'Both A and R are true but R is not correct explanation',
        'A is true but R is false',
        'A is false but R is true',
        'B',
        'Option B: Both statements are true, but glycolysis does not solely explain ethanol production.',
        '1', 'Medium', ''
      ]
    ];
  }

  // If specific targetChapter is selected, apply to sample rows
  if (targetChapter && targetChapter !== 'all') {
    sampleData = sampleData.map(row => {
      const updated = [...row];
      updated[2] = targetChapter; // column index 2 is Chapter
      return updated;
    });
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  const sheetName = `${cleanSubject.substring(0, 15)}_Class${cleanClass}`.replace(/[^a-zA-Z0-9_]/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeClassName = cleanClass.replace(/[^a-zA-Z0-9]/g, '_');
  const safeSubName = cleanSubject.replace(/[^a-zA-Z0-9]/g, '_');
  const safeChapName = (targetChapter && targetChapter !== 'all') ? `_${targetChapter.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  const fileName = `PaperForge_${safeSubName}_Class_${safeClassName}${safeChapName}_Template.${format}`;

  if (format === 'csv') {
    XLSX.writeFile(wb, fileName, { bookType: 'csv' });
  } else {
    XLSX.writeFile(wb, fileName);
  }
};

// Flexible column aliases for intelligent parsing of spreadsheets
const COLUMN_ALIASES = {
  class_level: ['class', 'class_level', 'class level', 'grade', 'standard', 'cls'],
  subject: ['subject', 'subject_name', 'course', 'subj'],
  chapter: ['chapter', 'unit', 'lesson', 'chapter name', 'chapter_name'],
  topic: ['topic', 'subtopic', 'sub-topic', 'section'],
  question_type: ['question_type', 'question type', 'type', 'q_type', 'category', 'item type'],
  question_text: ['question', 'question_text', 'question text', 'problem', 'statement', 'q_text', 'q text', 'questions', 'prompt'],
  option_a: ['option_a', 'option a', 'opt a', 'option 1', 'opt 1', 'a', '(a)', 'option_1', 'choice a'],
  option_b: ['option_b', 'option b', 'opt b', 'option 2', 'opt 2', 'b', '(b)', 'option_2', 'choice b'],
  option_c: ['option_c', 'option c', 'opt c', 'option 3', 'opt 3', 'c', '(c)', 'option_3', 'choice c'],
  option_d: ['option_d', 'option d', 'opt d', 'option 4', 'opt 4', 'd', '(d)', 'option_4', 'choice d'],
  correct_option: ['correct_option', 'correct option', 'correct', 'correct answer', 'answer', 'ans', 'key', 'answer key', 'correct ans'],
  answer_text: ['answer_text', 'answer text', 'solution', 'explanation', 'marking scheme', 'model answer', 'ans explanation'],
  marks: ['marks', 'mark', 'points', 'max marks', 'score', 'weightage'],
  difficulty: ['difficulty', 'diff', 'level', 'difficulty level'],
  diagram_file_name: ['diagram_file_name', 'diagram', 'image', 'diagram name', 'diagram file']
};

export const parseExcelFile = async (file, options = {}) => {
  const {
    defaultClass = '10',
    defaultSubject = 'Science',
    defaultChapter = '',
    autoApplyTarget = true
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonRows || jsonRows.length < 2) {
          resolve([]);
          return;
        }

        const rawHeaders = jsonRows[0].map(h => String(h || '').trim().toLowerCase());
        const dataRows = jsonRows.slice(1);

        // Find index for each field using fuzzy aliases
        const keyToIndex = {};
        Object.keys(COLUMN_ALIASES).forEach(key => {
          const aliases = COLUMN_ALIASES[key];
          const foundIdx = rawHeaders.findIndex(h => {
            const cleanH = h.replace(/[^a-z0-9]/g, '');
            return aliases.some(alias => cleanH === alias.replace(/[^a-z0-9]/g, ''));
          });
          keyToIndex[key] = foundIdx;
        });

        const parsedRows = dataRows.map((row, rowIdx) => {
          if (!row || row.length === 0) return null;

          const mapped = {};
          Object.keys(COLUMN_ALIASES).forEach(key => {
            const idx = keyToIndex[key];
            mapped[key] = idx !== -1 && row[idx] !== undefined ? String(row[idx]).trim() : '';
          });

          // If question text is empty, skip this row
          if (!mapped.question_text || mapped.question_text.trim() === '') {
            return null;
          }

          // Target Class & Subject Override
          if (autoApplyTarget || !mapped.class_level) {
            mapped.class_level = formatClassLevel(defaultClass);
          } else {
            mapped.class_level = formatClassLevel(mapped.class_level);
          }

          if (autoApplyTarget || !mapped.subject) {
            mapped.subject = defaultSubject;
          }

          // Target Chapter Override
          if (autoApplyTarget && defaultChapter && defaultChapter !== 'all') {
            mapped.chapter = defaultChapter;
          } else if (!mapped.chapter && defaultChapter && defaultChapter !== 'all') {
            mapped.chapter = defaultChapter;
          }

          // Question Type Detection
          const hasOptions = !!(mapped.option_a || mapped.option_b);
          if (!mapped.question_type) {
            if (hasOptions) {
              mapped.question_type = 'MCQ';
            } else {
              const m = Number(mapped.marks) || 1;
              if (m === 1) mapped.question_type = 'Very Short Answer';
              else if (m <= 3) mapped.question_type = 'Short Answer';
              else mapped.question_type = 'Long Answer';
            }
          }

          // Normalize Correct Option
          let corr = String(mapped.correct_option || '').trim().toUpperCase();
          if (corr.startsWith('OPTION ') || corr.startsWith('OPT ')) {
            corr = corr.replace(/^OPT(ION)?\s*/i, '').trim();
          }
          if (corr.startsWith('(') && corr.endsWith(')')) {
            corr = corr.replace(/[()]/g, '').trim();
          }
          // If correct option matched full option text, find its letter
          if (mapped.option_a && corr.toLowerCase() === mapped.option_a.toLowerCase()) corr = 'A';
          else if (mapped.option_b && corr.toLowerCase() === mapped.option_b.toLowerCase()) corr = 'B';
          else if (mapped.option_c && corr.toLowerCase() === mapped.option_c.toLowerCase()) corr = 'C';
          else if (mapped.option_d && corr.toLowerCase() === mapped.option_d.toLowerCase()) corr = 'D';

          mapped.correct_option = ['A', 'B', 'C', 'D'].includes(corr) ? corr : (hasOptions ? 'A' : '');

          // Marks normalizer
          const parsedMarks = Number(mapped.marks);
          if (isNaN(parsedMarks) || parsedMarks <= 0) {
            mapped.marks = mapped.question_type === 'MCQ' ? 1 : 2;
          } else {
            mapped.marks = parsedMarks;
          }

          // Difficulty normalizer
          if (!['Easy', 'Medium', 'Hard'].includes(mapped.difficulty)) {
            mapped.difficulty = 'Medium';
          }

          mapped.id = Date.now() + rowIdx;
          return mapped;
        }).filter(Boolean);

        resolve(parsedRows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
