# Contributing to Fidel-ASCII 🇪🇹

Thank you for your interest in contributing! This project aims to bridge the gap in terminal aesthetics for non-Latin scripts, starting with the Ethiopic (Fidel) syllabary.

## 🎨 Adding New Characters

The most impactful way to contribute is by expanding the **Character Map** (`src/fonts/standard.fidel.json`).

### 1. Use the Fidel Builder
The project includes a specialized web tool for drawing glyphs:
- Navigate to `tools/fidel-builder/`.
- Run `npm run dev` to start the builder.

### 2. Follow Style Guidelines
- **Height:** All glyphs MUST be exactly **5 lines** high.
- **Form Consistency:** Use the **Ghosting** feature in the builder to overlay the 1st form (Ge'ez) while drawing other forms (Sals, Sadis, etc.) to ensure consistent visual weight and proportions.
- **Characters:** Use the full-width block character `█` for the glyph body and spaces ` ` for the background.

### 3. Font Schema
New characters should be added to the `glyphs` object in `src/fonts/standard.fidel.json`:
```json
"ሀ": [
  "█    █",
  "█    █",
  "█    █",
  "█    █",
  "██████"
]
```

## 🛠️ Improving the Engine

If you're interested in the rendering logic:
- Core engine: `src/engine/render.ts`
- CLI logic: `src/cli/index.ts`

### Development Workflow
1.  **Fork and Clone:** Create your own copy of the repository.
2.  **Install:** Run `npm install`.
3.  **Build:** Run `npm run build` to compile TypeScript.
4.  **Test:** Run `npm test` to ensure no regressions in rendering logic.
5.  **Submit PR:** Describe your changes clearly and provide examples of any new features or glyphs.

---

## 🏗️ Project Structure
- `src/engine/`: Core rendering logic.
- `src/fonts/`: JSON font definitions.
- `src/cli/`: Command-line interface.
- `tests/`: Jest unit tests.
- `tools/fidel-builder/`: React-based glyph editor.

---

## 📜 Code of Conduct
Please be respectful and constructive in all interactions. Let's build something beautiful for the Ethiopic community!
