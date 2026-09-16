<div align="center">

# 📄 PaperForge

**Professional Exam Paper Maker & Hierarchical Question Bank Studio**  
*Engineered for schools, educators, and coaching institutes (Classes 6 to 12)*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](LICENSE)

</div>

---

## 🌟 Overview

**PaperForge** is a modern, enterprise-grade web application built to streamline the end-to-end examination workflow. From managing deep hierarchical question repositories (Class → Subject → Chapter → Questions) to generating randomized anti-cheating multiple sets (Set A, Set B, Set C, Set D) and exporting to Word (`.docx`) or zero-margin clean A4 print sheets, PaperForge empowers educational institutions with speed, accuracy, and professional formatting.

---

## ✨ Key Features

### 🗂️ 1. Hierarchical Question Architecture
- **Class ➔ Subject ➔ Chapter ➔ Question** structure.
- Dedicated management for Classes (Class 6 to 12), Subject catalogs (Science, Mathematics, Social Science, Physics, Chemistry, Biology, etc.), and Chapter breakdowns.
- Real-time question counts and live stats across every level.

### 🎲 2. Anti-Cheating Multi-Set Generator (Set A, B, C, D)
- **Question Order Shuffling:** True Fisher-Yates randomization so students sitting next to each other receive completely different question sequences.
- **MCQ Option Permutation:** Automatically shuffles option texts and dynamically reassigns correct answer labels (e.g., Option A becomes Option C).
- **Synchronized Answer Keys:** Generates matching answer keys and explanations for every single set.
- **Chapter Scope Filters:** Generate full-syllabus board papers or restrict generation to specific chapters for unit tests.

### 📋 3. Direct Excel Paste Receiver Table
- **Spreadsheet Clipboard Integration:** Copy cells directly from Microsoft Excel or Google Sheets and paste (`Ctrl + V`) straight into the interactive grid.
- **Smart Target Mapping:** Choose Target Class, Subject, and Chapter to auto-assign metadata across all pasted rows.
- **Template Generation:** Download dynamically formatted `.xlsx` or `.csv` question templates.
- **State Persistence:** Grid data persists across tab switches so uncommitted work is never lost.

### 📐 4. Mathematical Formula & Diagram Support
- **KaTeX LaTeX Renderer:** Real-time rendering of mathematical and scientific equations, fractions, square roots, matrices, and symbols (e.g., `\(E = mc^2\)`, `\(\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}\)`).
- **In-Question Diagram Uploads:** Directly attach figure images (PNG, JPG, WEBP, SVG) to questions with captions, auto-tagging as `#diagram-based`.

### ✍️ 5. Custom Exam Paper Composer
- Dual-pane drag-and-add exam builder for manual paper composition.
- Filter questions by class, subject, chapter, type (MCQ, Short Answer, Long Answer, Case Study), and difficulty.
- Organize questions into sections (Section A to E) with real-time total mark calculations.

### 🖨️ 6. Zero-Margin Clean A4 Print & Word Export
- **Print Optimization:** Zero-margin browser suppression prevents headers, footers, print dates, and localhost URLs from leaking onto physical sheets.
- **Multi-Set Printing:** Print all sets in one batch with automatic page breaks between sets, or print individual sets.
- **Word (.docx) Export:** Generates formatted Microsoft Word files matching CBSE/ICSE board exam layouts with school headers and instructions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS v4, Lucide Icons, KaTeX |
| **Build Tool** | Vite 6 |
| **Backend** | Node.js, Express 4, Multer |
| **Document Generation** | `docx` (Word Document Packer), `xlsx` (SheetJS) |
| **Storage** | File-based JSON Database with Atomic Writes |

---

## 📁 Project Structure

```text
PaperForge/
├── public/                 # Static assets, favicon, brand logos
│   ├── favicon.png
│   ├── logo.png
│   └── logo_original.png
├── server/                 # Express backend & API
│   ├── data/
│   │   └── paperforge.json # Seeded question bank & database fixtures
│   ├── uploads/            # Uploaded question diagrams & school crests
│   ├── db.js               # JSON file database operations
│   └── server.js           # REST API endpoints & DOCX generation
├── src/                    # React 19 Frontend
│   ├── assets/             # Component-level static media
│   ├── components/         # Application modules & views
│   │   ├── AddQuestion.jsx           # Hierarchical question manager & form
│   │   ├── AnswerKey.jsx             # Synchronized answer key viewer
│   │   ├── CustomExamPaper.jsx       # Manual section-by-section composer
│   │   ├── Dashboard.jsx             # Command center dashboard
│   │   ├── ImportQuestions.jsx       # Excel paste & file import receiver
│   │   ├── Navbar.jsx                # Fixed top navigation header
│   │   ├── PaperGenerator.jsx        # Multi-set randomized generator
│   │   ├── PaperPreview.jsx          # A4 physical sheet preview & print
│   │   ├── QuestionPatternMarks.jsx  # Blueprint & exam schema manager
│   │   ├── SavedPapers.jsx           # Archive of previously generated papers
│   │   ├── SchoolSettings.jsx        # School crest, instructions, & session
│   │   └── Sidebar.jsx               # Fixed left navigation rail
│   ├── utils/              # Math renderers, Word generators, helpers
│   │   ├── docxGenerator.js
│   │   └── mathRenderer.jsx
│   ├── App.jsx             # Main app container & global routing
│   ├── index.css           # Tailwind CSS directives & print media rules
│   └── main.jsx            # Application entry point
├── index.html              # HTML template with KaTeX and Google Fonts
├── package.json            # Scripts & project dependencies
├── vite.config.js          # Vite configuration with proxy to port 3001
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/punitsharma16042003/PaperForge.git
   cd PaperForge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Application

#### 🖥️ Option 1: One-Click Windows Executable (`PaperForge.exe`)
If you are on Windows, simply double-click **`PaperForge.exe`** in the root folder:
- Automatically detects Node.js runtime and dependencies.
- Starts the PaperForge backend server on `http://localhost:3001`.
- Automatically launches your default web browser to the dashboard.
- Press `O` anytime to re-open the browser or `Q` to shut down gracefully.

#### ⚙️ Option 2: Development Mode (Concurrent Vite + Express)
Run both the Vite frontend dev server and the Express API server concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

#### Production Mode
1. Build the production client bundle:
   ```bash
   npm run build
   ```
2. Start the unified production server:
   ```bash
   npm start
   ```
- Open `http://localhost:3001` in your browser.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Engineered by <strong>PANKAJ SHARMA</strong> (<a href="https://github.com/punitsharma16042003">@punitsharma16042003</a>)</sub>
</div>
