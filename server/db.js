import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'paperforge.json');

// Default initial state
const defaultSettings = {
  school_name: "DELHI PUBLIC SCHOOL, R.K. PURAM",
  school_logo: "/logo.png",
  address: "Sector XII, R.K. Puram, New Delhi - 110022",
  academic_session: "2026-27",
  board_format: "CBSE",
  default_time_allowed: "3 Hours",
  default_instructions: [
    "This question paper contains 5 sections: Section A, B, C, D, and E.",
    "Section A consists of 1-mark Multiple Choice Questions (MCQs).",
    "Section B consists of Very Short Answer type questions carrying 2 marks each.",
    "Section C consists of Short Answer type questions carrying 3 marks each.",
    "Section D consists of Long Answer type questions carrying 5 marks each.",
    "Section E consists of Case-Based integrated units of assessment carrying 4 marks each.",
    "All questions are compulsory. Internal choices are provided in some questions.",
    "Use of calculators and electronic gadgets is strictly prohibited.",
    "Draw neat, clean, and properly labelled diagrams wherever necessary."
  ]
};

// Initial Diagram Library
const defaultDiagrams = [
  {
    id: "diag-1",
    title: "Simple Electric Circuit (Ohm's Law)",
    category: "Physics",
    tags: ["electricity", "circuits", "ohms law", "resistors"],
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "diag-2",
    title: "Ray Optics - Convex Lens Refraction",
    category: "Physics",
    tags: ["optics", "light", "lenses", "refraction"],
    url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "diag-3",
    title: "Electrolysis of Water Apparatus",
    category: "Chemistry",
    tags: ["chemical reactions", "electrolysis", "apparatus"],
    url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "diag-4",
    title: "Human Digestive System / Nutrition",
    category: "Biology",
    tags: ["life processes", "biology", "human body", "digestive system"],
    url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "diag-5",
    title: "Cartesian Coordinate Plane Graph",
    category: "Mathematics",
    tags: ["graphs", "coordinate geometry", "parabola", "linear equations"],
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    created_at: new Date().toISOString()
  }
];

// Rich Seed Questions across Classes 9-12 and all 12 Question Types
const seedQuestions = [
  // Class 10 Science
  {
    id: "q-10-sci-01",
    class_level: "10",
    subject: "Science",
    chapter: "Chemical Reactions and Equations",
    topic: "Types of Chemical Reactions",
    question_type: "MCQ",
    question_text: "When aqueous solutions of potassium iodide and lead nitrate are mixed, a precipitate is formed. What is the color of the precipitate and the compound formed?",
    options: [
      { id: "A", text: "White precipitate of potassium nitrate", is_correct: false },
      { id: "B", text: "Yellow precipitate of lead iodide", is_correct: true },
      { id: "C", text: "Brown precipitate of lead oxide", is_correct: false },
      { id: "D", text: "Black precipitate of lead sulfide", is_correct: false }
    ],
    answer_text: "Option B: Yellow precipitate of lead iodide (PbI₂). Reaction: Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃.",
    explanation: "Lead nitrate reacts with potassium iodide to form insoluble lead iodide which is brilliant yellow in color.",
    marks: 1,
    difficulty: "Easy",
    tags: ["important", "board question", "conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "q-10-sci-02",
    class_level: "10",
    subject: "Science",
    chapter: "Light - Reflection and Refraction",
    topic: "Spherical Mirrors",
    question_type: "MCQ",
    question_text: "An object is placed at a distance of 15 cm in front of a concave mirror of focal length 10 cm. The nature and position of the image formed is:",
    options: [
      { id: "A", text: "Virtual and erect, formed behind the mirror", is_correct: false },
      { id: "B", text: "Real, inverted and magnified, at 30 cm in front of the mirror", is_correct: true },
      { id: "C", text: "Real, inverted and diminished, at 20 cm in front of the mirror", is_correct: false },
      { id: "D", text: "Virtual and diminished, at 5 cm behind the mirror", is_correct: false }
    ],
    answer_text: "Option B: Real, inverted and magnified, formed at -30 cm (in front of mirror). Using mirror formula: 1/f = 1/v + 1/u => 1/-10 = 1/v + 1/-15 => 1/v = 1/15 - 1/10 = -1/30 => v = -30 cm.",
    explanation: "When an object is placed between C and F of a concave mirror, a real, inverted and enlarged image is formed beyond C.",
    marks: 1,
    difficulty: "Medium",
    tags: ["numerical", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:05:00.000Z"
  },
  {
    id: "q-10-sci-03",
    class_level: "10",
    subject: "Science",
    chapter: "Life Processes",
    topic: "Respiration in Organisms",
    question_type: "MCQ",
    question_text: "During cellular respiration, which of the following is the common three-carbon intermediate molecule produced in the cytoplasm from glucose breakdown?",
    options: [
      { id: "A", text: "Lactic Acid", is_correct: false },
      { id: "B", text: "Ethanol", is_correct: false },
      { id: "C", text: "Pyruvate", is_correct: true },
      { id: "D", text: "Carbon Dioxide", is_correct: false }
    ],
    answer_text: "Option C: Pyruvate (Pyruvic acid). 1 molecule of 6-carbon Glucose splits into 2 molecules of 3-carbon Pyruvate.",
    explanation: "Glycolysis takes place in the cytoplasm where glucose is broken down into pyruvate without requiring oxygen.",
    marks: 1,
    difficulty: "Easy",
    tags: ["conceptual", "important"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:10:00.000Z"
  },
  {
    id: "q-10-sci-04",
    class_level: "10",
    subject: "Science",
    chapter: "Electricity",
    topic: "Ohm's Law & Resistance",
    question_type: "MCQ",
    question_text: "If a uniform cylindrical copper wire of resistance R is stretched uniformly such that its length doubles, what will be its new resistance?",
    options: [
      { id: "A", text: "2 R", is_correct: false },
      { id: "B", text: "4 R", is_correct: true },
      { id: "C", text: "R / 2", is_correct: false },
      { id: "D", text: "R / 4", is_correct: false }
    ],
    answer_text: "Option B: 4 R. Since volume is constant (V = A × L), doubling length halves cross-sectional area (A' = A/2). Therefore R' = ρ(2L)/(A/2) = 4(ρL/A) = 4R.",
    explanation: "Resistance is directly proportional to length and inversely proportional to area of cross-section.",
    marks: 1,
    difficulty: "Hard",
    tags: ["numerical", "repeated", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:15:00.000Z"
  },
  {
    id: "q-10-sci-05",
    class_level: "10",
    subject: "Science",
    chapter: "Chemical Reactions and Equations",
    topic: "Redox Reactions",
    question_type: "Assertion and Reason",
    question_text: "Given below are two statements labeled as Assertion (A) and Reason (R).\nAssertion (A): Exposure of silver chloride to sunlight for a long duration turns grey.\nReason (R): Formation of silver by decomposition of silver chloride takes place in presence of light.\nSelect the correct option from the following:",
    options: [
      { id: "A", text: "Both (A) and (R) are true and (R) is the correct explanation of (A).", is_correct: true },
      { id: "B", text: "Both (A) and (R) are true but (R) is not the correct explanation of (A).", is_correct: false },
      { id: "C", text: "(A) is true but (R) is false.", is_correct: false },
      { id: "D", text: "(A) is false but (R) is true.", is_correct: false }
    ],
    answer_text: "Option A: Both Assertion and Reason are true and Reason is the correct explanation of Assertion. Reaction: 2AgCl (s) --sunlight--> 2Ag (s) [grey] + Cl₂ (g).",
    explanation: "This is a photo-decomposition reaction commonly used in black and white photography.",
    marks: 1,
    difficulty: "Medium",
    tags: ["important", "board question", "conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:20:00.000Z"
  },
  {
    id: "q-10-sci-06",
    class_level: "10",
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    topic: "Indicators and Neutralization",
    question_type: "Fill in the Blanks",
    question_text: "Phenolphthalein indicator turns ____________ in an acidic solution and ____________ in a basic solution.",
    options: [],
    answer_text: "Colorless, Pink (or Magenta).",
    explanation: "Phenolphthalein is a synthetic pH indicator which remains colorless in neutral and acidic mediums but turns pink at pH > 8.2.",
    marks: 1,
    difficulty: "Easy",
    tags: ["conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:25:00.000Z"
  },
  {
    id: "q-10-sci-07",
    class_level: "10",
    subject: "Science",
    chapter: "Magnetic Effects of Electric Current",
    topic: "Right Hand Thumb Rule",
    question_type: "True / False",
    question_text: "State whether the following statement is True or False: Inside a current-carrying solenoid, the magnetic field lines are in the form of parallel straight lines, indicating that the field is non-uniform.",
    options: [],
    answer_text: "False. Inside a long solenoid, the magnetic field is uniform, represented by parallel and equidistant field lines.",
    explanation: "Parallel straight lines indicate a uniform magnetic field.",
    marks: 1,
    difficulty: "Easy",
    tags: ["conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:30:00.000Z"
  },
  {
    id: "q-10-sci-08",
    class_level: "10",
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    topic: "Baking Soda & Washing Soda",
    question_type: "Very Short Answer",
    question_text: "Write the chemical formula and one major industrial use of Plaster of Paris.",
    options: [],
    answer_text: "1. Chemical Formula: CaSO₄·½H₂O (Calcium Sulphate Hemihydrate).\n2. Major Use: Used by doctors for supporting fractured bones in the right position, and for making casts, statues, and decorative ceiling molds.",
    explanation: "Prepared by heating gypsum (CaSO₄·2H₂O) at 373 K.",
    marks: 2,
    difficulty: "Easy",
    tags: ["board question", "important"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:35:00.000Z"
  },
  {
    id: "q-10-sci-09",
    class_level: "10",
    subject: "Science",
    chapter: "Life Processes",
    topic: "Transportation in Humans",
    question_type: "Very Short Answer",
    question_text: "Why is double circulation necessary in human beings? Explain briefly.",
    options: [],
    answer_text: "Double circulation ensures that oxygenated blood and deoxygenated blood remain strictly separated. This allows a highly efficient supply of oxygen to body cells, which is essential to meet the high energy demands needed for maintaining constant warm-blooded body temperature.",
    explanation: "Comprises pulmonary circulation and systemic circulation.",
    marks: 2,
    difficulty: "Medium",
    tags: ["important", "conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:40:00.000Z"
  },
  {
    id: "q-10-sci-10",
    class_level: "10",
    subject: "Science",
    chapter: "Electricity",
    topic: "Joule's Law of Heating",
    question_type: "Short Answer",
    question_text: "An electric heater rated 1000 W operates 2 hours daily. Calculate:\n(a) The energy consumed by it in 30 days in kilowatt-hours (kWh).\n(b) The total cost of energy consumed if the rate is ₹ 6.50 per unit (kWh).",
    options: [],
    answer_text: "(a) Power P = 1000 W = 1 kW. Daily time t = 2 h. Total hours in 30 days = 2 × 30 = 60 h.\nEnergy = P × t = 1 kW × 60 h = 60 kWh (units).\n(b) Total Cost = 60 kWh × ₹ 6.50 = ₹ 390.00.",
    explanation: "Energy in kWh = (Power in Watts × hours) / 1000.",
    marks: 3,
    difficulty: "Medium",
    tags: ["numerical", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:45:00.000Z"
  },
  {
    id: "q-10-sci-11",
    class_level: "10",
    subject: "Science",
    chapter: "Metals and Non-metals",
    topic: "Reactivity Series & Extraction",
    question_type: "Short Answer",
    question_text: "Differentiate between Roasting and Calcination with one balanced chemical equation for each process.",
    options: [],
    answer_text: "1. Roasting: Process of heating sulfide ores strongly in the presence of excess air to convert them into metal oxides.\nExample: 2ZnS + 3O₂ --heat--> 2ZnO + 2SO₂↑\n\n2. Calcination: Process of heating carbonate or hydrated ores strongly in limited or absence of air to convert them into metal oxides.\nExample: ZnCO₃ --heat--> ZnO + CO₂↑",
    explanation: "Roasting produces sulfur dioxide gas, whereas calcination yields carbon dioxide gas.",
    marks: 3,
    difficulty: "Medium",
    tags: ["important", "board question", "repeated"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T10:50:00.000Z"
  },
  {
    id: "q-10-sci-12",
    class_level: "10",
    subject: "Science",
    chapter: "Light - Reflection and Refraction",
    topic: "Refraction through Glass Prism",
    question_type: "Diagram Based",
    question_text: "Draw a ray diagram showing the refraction of a narrow beam of white light through a triangular glass prism. Label the angle of incidence, angle of emergence, angle of deviation, and show the dispersion into constituent colors from Red to Violet.",
    options: [],
    answer_text: "1. Ray diagram showing incident ray entering prism at first surface, bending towards normal.\n2. Emergent ray bending away from normal at second surface.\n3. Labels required: Angle of prism (A), Angle of incidence (i), Angle of refraction (r), Angle of emergence (e), Angle of deviation (δ).\n4. Dispersion spectrum labeled: Red (deviates least) at top, Violet (deviates most) at bottom (VIBGYOR).",
    explanation: "Different wavelengths travel with different speeds in glass; violet has the shortest wavelength and bends the most.",
    marks: 3,
    difficulty: "Medium",
    tags: ["diagram-based", "board question", "important"],
    diagram_url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80",
    diagram_caption: "Dispersion of light through triangular prism",
    created_at: "2026-09-01T10:55:00.000Z"
  },
  {
    id: "q-10-sci-13",
    class_level: "10",
    subject: "Science",
    chapter: "Life Processes",
    topic: "Human Excretory System",
    question_type: "Long Answer",
    question_text: "(a) Draw a neat diagram of the human excretory system and label:\n    (i) Kidney, (ii) Ureter, (iii) Urinary Bladder, (iv) Urethra.\n(b) Describe the structural and functional unit of kidney (Nephron) and explain how urine is formed in the human body.",
    options: [],
    answer_text: "(a) Well-labelled diagram showing bilateral kidneys, paired ureters connecting to urinary bladder and terminating at urethra.\n(b) Structural & Functional Unit: Nephron.\nUrine formation steps:\n1. Ultrafiltration: Blood enters glomerulus under pressure through afferent arteriole. Glucose, amino acids, salts, urea and excess water filter into Bowman's capsule.\n2. Selective Reabsorption: As filtrate passes along renal tubule, essential substances (all glucose, amino acids, major portion of salts and water) are reabsorbed back into peritubular capillaries.\n3. Tubular Secretion: Extra potassium and hydrogen ions are secreted into tubule to maintain ionic balance.\nThe remaining fluid is urine, collected in collecting duct.",
    explanation: "Diagram carries 2 marks, mechanism of nephron and urine formation carries 3 marks.",
    marks: 5,
    difficulty: "Hard",
    tags: ["diagram-based", "board question", "important"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:00:00.000Z"
  },
  {
    id: "q-10-sci-14",
    class_level: "10",
    subject: "Science",
    chapter: "Carbon and its Compounds",
    topic: "Hydrocarbons & Functional Groups",
    question_type: "Long Answer",
    question_text: "(a) What are homologous series of carbon compounds? State any two characteristics.\n(b) An organic compound 'A' (C₂H₆O) on oxidation with alkaline KMnO₄ gives compound 'B'. Compound 'A' and 'B' react in presence of concentrated H₂SO₄ to form a sweet-smelling compound 'C'.\n    (i) Identify compounds A, B, and C.\n    (ii) Write the chemical equation for the formation of compound C and name the reaction.",
    options: [],
    answer_text: "(a) Homologous Series: A group or family of organic compounds having the same functional group and similar chemical properties in which successive members differ by -CH₂- unit and 14 u in molecular mass.\nCharacteristics: (i) Common general formula. (ii) Gradual gradation in physical properties (boiling point increases with mass).\n\n(b) Identification:\n(i) Compound A: Ethanol (CH₃CH₂OH)\n    Compound B: Ethanoic acid (CH₃COOH)\n    Compound C: Ethyl ethanoate (CH₃COOCH₂CH₃ - sweet smelling ester)\n(ii) Chemical Equation:\n    CH₃COOH + C₂H₅OH --(conc. H₂SO₄)--> CH₃COOC₂H₅ + H₂O\n    Reaction Name: Esterification reaction.",
    explanation: "Standard 5-mark organic chemistry question frequently appearing in Class 10 board exams.",
    marks: 5,
    difficulty: "Hard",
    tags: ["important", "board question", "conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:05:00.000Z"
  },
  {
    id: "q-10-sci-15",
    class_level: "10",
    subject: "Science",
    chapter: "Heredity and Evolution",
    topic: "Mendelian Genetics",
    question_type: "Case Study / Passage Based",
    question_text: "Read the following passage and answer the questions that follow:\nGregor Johann Mendel conducted hybridization experiments on garden peas (Pisum sativum) between 1856 and 1863. He studied seven pairs of contrasting traits. When he crossed pure breeding tall pea plants (TT) with pure breeding dwarf pea plants (tt), all F1 offspring were tall. Upon self-pollination of F1 plants, both tall and dwarf plants were obtained in F2 generation.\n\nQuestions:\n1. What is the phenotypic ratio obtained in the F2 generation of a monohybrid cross? [1 Mark]\n2. State the law of inheritance proposed by Mendel based on this monohybrid cross. [1 Mark]\n3. (a) Work out the cross showing genotypes of parents, gametes, and F1 and F2 generations with Punnett square. [2 Marks]\n   OR\n   (b) If 800 pea plants are produced in the F2 generation, how many plants are expected to be pure homozygous tall? [2 Marks]",
    options: [],
    answer_text: "1. Phenotypic ratio is 3 : 1 (3 Tall : 1 Dwarf).\n2. Law of Segregation (Purity of gametes): Allele pairs separate or segregate during gamete formation, and randomly unite at fertilization.\n3. (a) Parents: TT × tt -> Gametes: T, t -> F1: Tt (All Tall). F1 self cross: Tt × Tt -> F2 Genotypes: TT (1), Tt (2), tt (1) -> Genotypic ratio 1:2:1.\n   OR\n   (b) Pure homozygous tall plants (TT) constitute 1/4 (25%) of the F2 generation.\n   Expected plants = 1/4 × 800 = 200 plants.",
    explanation: "Passage-based case study question carrying 4 marks as per latest CBSE pattern.",
    marks: 4,
    difficulty: "Medium",
    tags: ["board question", "conceptual", "important"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:10:00.000Z"
  },
  {
    id: "q-10-sci-16",
    class_level: "10",
    subject: "Science",
    chapter: "Our Environment",
    topic: "Ecosystem and Food Web",
    question_type: "Match the Following",
    question_text: "Match the ecological terms in Column I with their corresponding descriptions in Column II:\n\nColumn I:\n(A) Producers\n(B) Biomagnification\n(C) 10 Percent Law\n(D) Ozone Layer\n\nColumn II:\n(i) Stratospheric shield against UV rays\n(ii) Autotrophs synthesizing organic food using sunlight\n(iii) Progressive accumulation of toxic chemicals across trophic levels\n(iv) Energy transfer efficiency between successive trophic levels",
    options: [],
    answer_text: "Correct Matching:\n(A) -> (ii) Autotrophs synthesizing organic food using sunlight\n(B) -> (iii) Progressive accumulation of toxic chemicals across trophic levels\n(C) -> (iv) Energy transfer efficiency between successive trophic levels\n(D) -> (i) Stratospheric shield against UV rays",
    explanation: "Match each term with its primary ecological function.",
    marks: 2,
    difficulty: "Easy",
    tags: ["conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:15:00.000Z"
  },

  // Class 10 Mathematics
  {
    id: "q-10-math-01",
    class_level: "10",
    subject: "Mathematics",
    chapter: "Real Numbers",
    topic: "Fundamental Theorem of Arithmetic",
    question_type: "MCQ",
    question_text: "If two positive integers a and b are written as a = x³y² and b = xy³, where x, y are prime numbers, then HCF(a, b) is:",
    options: [
      { id: "A", text: "xy", is_correct: false },
      { id: "B", text: "xy²", is_correct: true },
      { id: "C", text: "x³y³", is_correct: false },
      { id: "D", text: "x²y²", is_correct: false }
    ],
    answer_text: "Option B: xy². HCF is the product of the smallest power of each common prime factor involved in the numbers: min power of x is 1, min power of y is 2.",
    explanation: "HCF(a,b) = x^min(3,1) * y^min(2,3) = xy^2.",
    marks: 1,
    difficulty: "Easy",
    tags: ["important", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:20:00.000Z"
  },
  {
    id: "q-10-math-02",
    class_level: "10",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    topic: "Nature of Roots",
    question_type: "MCQ",
    question_text: "For what value of k does the quadratic equation 2x² + kx + 3 = 0 have two equal real roots?",
    options: [
      { id: "A", text: "± 2√6", is_correct: true },
      { id: "B", text: "± 4√3", is_correct: false },
      { id: "C", text: "± 6", is_correct: false },
      { id: "D", text: "± √24 / 2", is_correct: false }
    ],
    answer_text: "Option A: ± 2√6. For equal roots, discriminant D = b² - 4ac = 0. Here k² - 4(2)(3) = 0 => k² - 24 = 0 => k = ±√24 = ±2√6.",
    explanation: "Standard discriminant condition D = 0.",
    marks: 1,
    difficulty: "Medium",
    tags: ["numerical", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:25:00.000Z"
  },
  {
    id: "q-10-math-03",
    class_level: "10",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    topic: "Trigonometric Identities",
    question_type: "Short Answer",
    question_text: "Prove the trigonometric identity: (sin θ / (1 + cos θ)) + ((1 + cos θ) / sin θ) = 2 cosec θ.",
    options: [],
    answer_text: "LHS = [sin²θ + (1 + cosθ)²] / [sinθ(1 + cosθ)]\n    = [sin²θ + 1 + 2cosθ + cos²θ] / [sinθ(1 + cosθ)]\n    = [(sin²θ + cos²θ) + 1 + 2cosθ] / [sinθ(1 + cosθ)]\n    = [1 + 1 + 2cosθ] / [sinθ(1 + cosθ)]\n    = [2 + 2cosθ] / [sinθ(1 + cosθ)]\n    = 2(1 + cosθ) / [sinθ(1 + cosθ)]\n    = 2 / sinθ = 2 cosecθ = RHS. Hence Proved.",
    explanation: "Using fundamental identity sin²θ + cos²θ = 1.",
    marks: 3,
    difficulty: "Medium",
    tags: ["important", "repeated", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:30:00.000Z"
  },
  {
    id: "q-10-math-04",
    class_level: "10",
    subject: "Mathematics",
    chapter: "Triangles",
    topic: "Basic Proportionality Theorem",
    question_type: "Long Answer",
    question_text: "State and prove Basic Proportionality Theorem (Thales Theorem).",
    options: [],
    answer_text: "Statement: If a line is drawn parallel to one side of a triangle to intersect the other two sides in distinct points, the other two sides are divided in the same ratio.\n\nProof:\nLet ABC be a triangle and line DE || BC intersecting AB at D and AC at E.\nJoin BE and CD. Draw DM ⊥ AC and EN ⊥ AB.\nArea(ΔADE) = 1/2 × AD × EN\nArea(ΔBDE) = 1/2 × DB × EN\n=> Area(ΔADE) / Area(ΔBDE) = AD / DB   --- (1)\nSimilarly,\nArea(ΔADE) = 1/2 × AE × DM\nArea(ΔDEC) = 1/2 × EC × DM\n=> Area(ΔADE) / Area(ΔDEC) = AE / EC   --- (2)\nSince ΔBDE and ΔDEC are on the same base DE and between the same parallels DE and BC:\nArea(ΔBDE) = Area(ΔDEC)   --- (3)\nFrom (1), (2), and (3):\nAD / DB = AE / EC. Hence Proved.",
    explanation: "Compulsory theorem in CBSE Class 10 mathematics board examinations.",
    marks: 5,
    difficulty: "Hard",
    tags: ["important", "board question", "repeated"],
    diagram_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    diagram_caption: "Triangle ABC with parallel line DE to base BC",
    created_at: "2026-09-01T11:35:00.000Z"
  },

  // Class 12 Physics
  {
    id: "q-12-phy-01",
    class_level: "12",
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Electric Dipole & Flux",
    question_type: "MCQ",
    question_text: "An electric dipole of dipole moment p is placed in a uniform electric field E. The torque τ acting on it and the potential energy U of the dipole are:",
    options: [
      { id: "A", text: "τ = p × E, U = -p · E", is_correct: true },
      { id: "B", text: "τ = p · E, U = p × E", is_correct: false },
      { id: "C", text: "τ = -p × E, U = p · E", is_correct: false },
      { id: "D", text: "τ = 0, U = -p · E", is_correct: false }
    ],
    answer_text: "Option A: Torque τ = p × E and Potential Energy U = -p · E = -p E cos θ.",
    explanation: "Torque is a vector product producing rotational effect while electrostatic potential energy is a scalar product.",
    marks: 1,
    difficulty: "Easy",
    tags: ["board question", "conceptual"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:40:00.000Z"
  },
  {
    id: "q-12-phy-02",
    class_level: "12",
    subject: "Physics",
    chapter: "Current Electricity",
    topic: "Drift Velocity & Mobility",
    question_type: "Very Short Answer",
    question_text: "Define the term 'Mobility' of charge carriers in a metallic conductor. Write its SI unit.",
    options: [],
    answer_text: "Mobility (μ) is defined as the magnitude of the drift velocity of charge carriers per unit applied electric field.\nFormula: μ = |v_d| / E = qτ / m.\nSI Unit: m² V⁻¹ s⁻¹ (or m²/(V·s)).",
    explanation: "Charge carrier mobility is independent of electric field for moderate fields.",
    marks: 2,
    difficulty: "Easy",
    tags: ["important", "board question"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:45:00.000Z"
  },
  {
    id: "q-12-phy-03",
    class_level: "12",
    subject: "Physics",
    chapter: "Optics",
    topic: "Wave Optics - Interference",
    question_type: "Long Answer",
    question_text: "(a) State Huygens' principle of secondary wavelets.\n(b) Using Huygens' wave theory, derive Snell's law of refraction for a plane wavefront incident on a plane refracting surface separating two media of refractive indices n₁ and n₂.",
    options: [],
    answer_text: "(a) Huygens' Principle: (i) Every point on a given wavefront acts as a fresh source of new disturbance, called secondary wavelets, which spread out in all directions with the speed of the wave in that medium.\n(ii) The forward envelope or tangential surface to these secondary wavelets at any subsequent instant gives the new wavefront.\n\n(b) Derivation of Snell's Law:\nLet AB be a plane wavefront incident at angle i on a plane refracting interface XY separating medium 1 (speed v₁) and medium 2 (speed v₂).\nIn the time τ taken by point B to reach C (BC = v₁τ), secondary wavelets from A travel distance v₂τ in medium 2 (AD = v₂τ).\nFrom right-angled ΔABC: sin i = BC / AC = v₁τ / AC\nFrom right-angled ΔADC: sin r = AD / AC = v₂τ / AC\nDividing both: sin i / sin r = (v₁τ) / (v₂τ) = v₁ / v₂\nBy definition, n₁ = c/v₁ and n₂ = c/v₂, so v₁/v₂ = n₂/n₁.\nTherefore: n₁ sin i = n₂ sin r (Snell's Law of Refraction).",
    explanation: "Derivation carries 3 marks, principle carries 2 marks.",
    marks: 5,
    difficulty: "Hard",
    tags: ["important", "board question", "repeated"],
    diagram_url: "",
    diagram_caption: "",
    created_at: "2026-09-01T11:50:00.000Z"
  }
];

// Default Blueprints
const defaultPatterns = [
  {
    id: "pat-cbse-10-sci",
    pattern_name: "CBSE Class 10 Science (Board Pattern - 80 Marks)",
    class_level: "10",
    subject: "Science",
    exam_name: "Annual Board Examination",
    total_marks: 80,
    total_questions: 39,
    rows: [
      { section_name: "Section A", question_type: "MCQ", number_of_questions: 16, marks_each: 1, total_marks: 16 },
      { section_name: "Section A", question_type: "Assertion and Reason", number_of_questions: 4, marks_each: 1, total_marks: 4 },
      { section_name: "Section B", question_type: "Very Short Answer", number_of_questions: 6, marks_each: 2, total_marks: 12 },
      { section_name: "Section C", question_type: "Short Answer", number_of_questions: 7, marks_each: 3, total_marks: 21 },
      { section_name: "Section D", question_type: "Long Answer", number_of_questions: 3, marks_each: 5, total_marks: 15 },
      { section_name: "Section E", question_type: "Case Study / Passage Based", number_of_questions: 3, marks_each: 4, total_marks: 12 }
    ],
    created_at: "2026-09-01T12:00:00.000Z"
  },
  {
    id: "pat-unit-test-40",
    pattern_name: "Class 10 Science Unit Test (40 Marks)",
    class_level: "10",
    subject: "Science",
    exam_name: "Mid-Term Examination",
    total_marks: 40,
    total_questions: 18,
    rows: [
      { section_name: "Section A", question_type: "MCQ", number_of_questions: 8, marks_each: 1, total_marks: 8 },
      { section_name: "Section B", question_type: "Very Short Answer", number_of_questions: 4, marks_each: 2, total_marks: 8 },
      { section_name: "Section C", question_type: "Short Answer", number_of_questions: 4, marks_each: 3, total_marks: 12 },
      { section_name: "Section D", question_type: "Long Answer", number_of_questions: 2, marks_each: 5, total_marks: 10 },
      { section_name: "Section E", question_type: "Case Study / Passage Based", number_of_questions: 1, marks_each: 2, total_marks: 2 }
    ],
    created_at: "2026-09-01T12:00:00.000Z"
  }
];

const defaultClasses = [
  { id: "cls-6", name: "Class 6", description: "Middle School (Class VI)" },
  { id: "cls-7", name: "Class 7", description: "Middle School (Class VII)" },
  { id: "cls-8", name: "Class 8", description: "Middle School (Class VIII)" },
  { id: "cls-9", name: "Class 9", description: "Secondary School Level (Class IX)" },
  { id: "cls-10", name: "Class 10", description: "Secondary Board Level (Class X)" },
  { id: "cls-11", name: "Class 11", description: "Higher Secondary Level (Class XI)" },
  { id: "cls-12", name: "Class 12", description: "Senior Secondary Board Level (Class XII)" }
];

const defaultSubjects = [
  { id: "sub-10-sci", class_name: "Class 10", name: "Science", description: "Physics, Chemistry, Biology" },
  { id: "sub-10-math", class_name: "Class 10", name: "Mathematics", description: "Standard & Basic Mathematics" },
  { id: "sub-10-sst", class_name: "Class 10", name: "Social Science", description: "History, Civics, Geography, Economics" },
  { id: "sub-10-eng", class_name: "Class 10", name: "English", description: "Language and Literature" },
  { id: "sub-9-sci", class_name: "Class 9", name: "Science", description: "General Science" },
  { id: "sub-9-math", class_name: "Class 9", name: "Mathematics", description: "Foundation Mathematics" },
  { id: "sub-11-phy", class_name: "Class 11", name: "Physics", description: "Mechanics, Waves, Thermodynamics" },
  { id: "sub-11-chem", class_name: "Class 11", name: "Chemistry", description: "Inorganic, Organic, Physical" },
  { id: "sub-12-phy", class_name: "Class 12", name: "Physics", description: "Senior Secondary Physics" },
  { id: "sub-12-chem", class_name: "Class 12", name: "Chemistry", description: "Senior Secondary Chemistry" },
  { id: "sub-12-bio", class_name: "Class 12", name: "Biology", description: "Senior Secondary Biology" },
  { id: "sub-12-math", class_name: "Class 12", name: "Mathematics", description: "Calculus, Vectors, Algebra" }
];

const defaultChapters = [
  // Class 10 Science
  { id: "chap-10-sci-1", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 1", name: "Chemical Reactions and Equations", description: "Chemical equations, types of chemical reactions, corrosion, rancidity" },
  { id: "chap-10-sci-2", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 2", name: "Acids, Bases and Salts", description: "Indicators, reactions of acids/bases, pH scale, salts" },
  { id: "chap-10-sci-3", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 3", name: "Metals and Non-metals", description: "Physical and chemical properties, reactivity series, metallurgy" },
  { id: "chap-10-sci-4", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 4", name: "Carbon and its Compounds", description: "Covalent bonding, homologous series, functional groups" },
  { id: "chap-10-sci-5", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 5", name: "Life Processes", description: "Nutrition, respiration, transportation, excretion" },
  { id: "chap-10-sci-6", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 6", name: "Control and Coordination", description: "Nervous system, reflex action, plant hormones, endocrine system" },
  { id: "chap-10-sci-7", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 7", name: "How do Organisms Reproduce?", description: "Asexual and sexual reproduction, reproductive health" },
  { id: "chap-10-sci-8", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 8", name: "Heredity", description: "Mendel's experiments, sex determination" },
  { id: "chap-10-sci-9", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 9", name: "Light - Reflection and Refraction", description: "Spherical mirrors, refraction, lens formula, power" },
  { id: "chap-10-sci-10", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 10", name: "The Human Eye and the Colourful World", description: "Defects of vision, dispersion of light, atmospheric refraction" },
  { id: "chap-10-sci-11", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 11", name: "Electricity", description: "Ohm's law, resistance, series and parallel circuits, Joule's law" },
  { id: "chap-10-sci-12", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 12", name: "Magnetic Effects of Electric Current", description: "Magnetic field lines, solenoid, Fleming's left hand rule" },
  { id: "chap-10-sci-13", class_name: "Class 10", subject_name: "Science", chapter_number: "Chapter 13", name: "Our Environment", description: "Ecosystem, food chains, ozone depletion, waste management" },

  // Class 10 Mathematics
  { id: "chap-10-math-1", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 1", name: "Real Numbers", description: "Fundamental Theorem of Arithmetic, irrational numbers" },
  { id: "chap-10-math-2", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 2", name: "Polynomials", description: "Geometrical meaning of zeroes, quadratic polynomials" },
  { id: "chap-10-math-3", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 3", name: "Pair of Linear Equations in Two Variables", description: "Graphical and algebraic methods, substitution, elimination" },
  { id: "chap-10-math-4", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 4", name: "Quadratic Equations", description: "Factorization, quadratic formula, nature of roots" },
  { id: "chap-10-math-5", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 5", name: "Arithmetic Progressions", description: "nth term of AP, sum of first n terms" },
  { id: "chap-10-math-6", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 6", name: "Triangles", description: "Similarity of triangles, basic proportionality theorem" },
  { id: "chap-10-math-7", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 7", name: "Coordinate Geometry", description: "Distance formula, section formula" },
  { id: "chap-10-math-8", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 8", name: "Introduction to Trigonometry", description: "Trigonometric ratios, trigonometric identities" },
  { id: "chap-10-math-9", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 9", name: "Some Applications of Trigonometry", description: "Heights and distances, angles of elevation and depression" },
  { id: "chap-10-math-10", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 10", name: "Circles", description: "Tangent to a circle, properties" },
  { id: "chap-10-math-11", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 11", name: "Areas Related to Circles", description: "Sector and segment of a circle" },
  { id: "chap-10-math-12", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 12", name: "Surface Areas and Volumes", description: "Combinations of solids" },
  { id: "chap-10-math-13", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 13", name: "Statistics", description: "Mean, median, mode of grouped data" },
  { id: "chap-10-math-14", class_name: "Class 10", subject_name: "Mathematics", chapter_number: "Chapter 14", name: "Probability", description: "Classical definition of probability" },

  // Class 9 Science
  { id: "chap-9-sci-1", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 1", name: "Matter in Our Surroundings", description: "Physical nature of matter, states of matter" },
  { id: "chap-9-sci-2", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 2", name: "Is Matter Around Us Pure?", description: "Mixtures, solutions, colloids, suspensions" },
  { id: "chap-9-sci-3", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 3", name: "Atoms and Molecules", description: "Laws of chemical combination, atomic mass, mole concept" },
  { id: "chap-9-sci-4", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 4", name: "Structure of the Atom", description: "Electrons, protons, neutrons, atomic models, valency" },
  { id: "chap-9-sci-5", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 5", name: "The Fundamental Unit of Life", description: "Cell structure, organelles, mitosis and meiosis" },
  { id: "chap-9-sci-6", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 6", name: "Tissues", description: "Plant and animal tissues" },
  { id: "chap-9-sci-7", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 7", name: "Motion", description: "Distance, displacement, velocity, equations of motion" },
  { id: "chap-9-sci-8", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 8", name: "Force and Laws of Motion", description: "Newton's laws of motion, momentum, inertia" },
  { id: "chap-9-sci-9", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 9", name: "Gravitation", description: "Universal law of gravitation, free fall, mass vs weight" },
  { id: "chap-9-sci-10", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 10", name: "Work and Energy", description: "Work done, kinetic and potential energy, law of conservation" },
  { id: "chap-9-sci-11", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 11", name: "Sound", description: "Production and propagation of sound, reflection of sound" },
  { id: "chap-9-sci-12", class_name: "Class 9", subject_name: "Science", chapter_number: "Chapter 12", name: "Improvement in Food Resources", description: "Crop production management, animal husbandry" },

  // Class 12 Physics
  { id: "chap-12-phy-1", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 1", name: "Electric Charges and Fields", description: "Coulomb's Law, Gauss's Theorem" },
  { id: "chap-12-phy-2", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 2", name: "Electrostatic Potential and Capacitance", description: "Potential, capacitors in series and parallel" },
  { id: "chap-12-phy-3", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 3", name: "Current Electricity", description: "Ohm's Law, Kirchhoff's Laws, Wheatstone bridge" },
  { id: "chap-12-phy-4", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 4", name: "Moving Charges and Magnetism", description: "Biot-Savart law, Ampere's circuital law, cyclotron" },
  { id: "chap-12-phy-5", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 5", name: "Magnetism and Matter", description: "Magnetic dipoles, earth magnetism" },
  { id: "chap-12-phy-6", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 6", name: "Electromagnetic Induction", description: "Faraday's laws, Lenz's law, self and mutual induction" },
  { id: "chap-12-phy-7", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 7", name: "Alternating Current", description: "LCR circuits, resonance, transformer" },
  { id: "chap-12-phy-8", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 8", name: "Electromagnetic Waves", description: "Displacement current, EM spectrum" },
  { id: "chap-12-phy-9", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 9", name: "Ray Optics and Optical Instruments", description: "Reflection, refraction, total internal reflection, lens, telescope" },
  { id: "chap-12-phy-10", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 10", name: "Wave Optics", description: "Huygens' principle, interference, Young's double slit" },
  { id: "chap-12-phy-11", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 11", name: "Dual Nature of Radiation and Matter", description: "Photoelectric effect, de Broglie relation" },
  { id: "chap-12-phy-12", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 12", name: "Atoms", description: "Rutherford's and Bohr's models" },
  { id: "chap-12-phy-13", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 13", name: "Nuclei", description: "Mass defect, binding energy, radioactivity" },
  { id: "chap-12-phy-14", class_name: "Class 12", subject_name: "Physics", chapter_number: "Chapter 14", name: "Semiconductor Electronics", description: "p-n junction diodes, rectification, logic gates" }
];

// Initialize Database from File or Defaults
export function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(content);

      let modified = false;
      if (!db.classes || db.classes.length === 0) {
        db.classes = defaultClasses;
        modified = true;
      }
      if (!db.subjects || db.subjects.length === 0) {
        db.subjects = defaultSubjects;
        modified = true;
      }
      if (!db.chapters || db.chapters.length === 0) {
        db.chapters = defaultChapters;
        modified = true;
      }

      // Map any existing question class, subject and chapter into database if not present
      (db.questions || []).forEach(q => {
        const rawCls = q.class_level ? (String(q.class_level).startsWith('Class') ? String(q.class_level) : `Class ${q.class_level}`) : 'Class 10';
        if (!db.classes.some(c => c.name.toLowerCase() === rawCls.toLowerCase())) {
          db.classes.push({ id: `cls-${Date.now()}-${Math.floor(Math.random()*1000)}`, name: rawCls, description: '' });
          modified = true;
        }
        if (q.subject && !db.subjects.some(s => s.class_name.toLowerCase() === rawCls.toLowerCase() && s.name.toLowerCase() === q.subject.toLowerCase())) {
          db.subjects.push({ id: `sub-${Date.now()}-${Math.floor(Math.random()*1000)}`, class_name: rawCls, name: q.subject, description: '' });
          modified = true;
        }
        if (q.chapter && q.chapter.trim()) {
          const chapName = q.chapter.trim();
          const exists = (db.chapters || []).some(c =>
            c.class_name.toLowerCase() === rawCls.toLowerCase() &&
            c.subject_name.toLowerCase() === (q.subject || 'General').toLowerCase() &&
            c.name.toLowerCase() === chapName.toLowerCase()
          );
          if (!exists) {
            const chapNumMatch = chapName.match(/^(Chapter\s*\d+|Unit\s*\d+)/i);
            const chapNum = chapNumMatch ? chapNumMatch[0] : `Chapter ${(db.chapters || []).length + 1}`;
            db.chapters = db.chapters || [];
            db.chapters.push({
              id: `chap-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              class_name: rawCls,
              subject_name: q.subject || 'General',
              chapter_number: chapNum,
              name: chapName,
              description: ''
            });
            modified = true;
          }
        }
      });

      if (modified) {
        saveDatabase(db);
      }

      return db;
    } catch (e) {
      console.error("Error reading database file, reinitializing defaults", e);
    }
  }

  const initialData = {
    settings: defaultSettings,
    classes: defaultClasses,
    subjects: defaultSubjects,
    chapters: defaultChapters,
    diagrams: defaultDiagrams,
    questions: seedQuestions,
    patterns: defaultPatterns,
    papers: []
  };
  saveDatabase(initialData);
  return initialData;
}

export function saveDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}


