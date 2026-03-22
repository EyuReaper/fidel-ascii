# Fidel-ASCII 🇪🇹🎨

**Fidel-ASCII** is the first open-source Ethiopic character map and high-impact ASCII rendering engine for terminal interfaces. It provides a modular engine, a comprehensive character map, and a powerful font importer that bridges the gap in terminal aesthetics for non-Latin scripts.

![Fidel-ASCII Gradient Demo](https://raw.githubusercontent.com/eyug/fidel-ascii/main/assets/demo.png) *(Placeholder for a real image)*

---

## 🚀 Features

- **Multi-Style Engine:** 7 unique rendering modes including `braille`, `dot-matrix`, `sketch`, and `matrix`.
- **High-Fidelity Importer:** Import any `.ttf` or `.otf` font directly into ASCII with precision rasterization.
- **Syllabic Support:** Full mapping for the Ge'ez syllabary (ሀ-ፐ) and common punctuation.
- **Smooth Gradients:** Beautiful, harmonious vertical, horizontal, and angular color transitions.
- **3D Shadows:** Pronounced, stylized shadow effects that adapt to any character style.
- **Dynamic Borders:** Professional ASCII borders with customizable styles (solid, double, dotted, bold).
- **Auto-Wrapping:** Smart line wrapping based on terminal width.
- **Library Mode:** Use the rendering engine directly in your own Node.js/TypeScript projects.

---

## 🎨 Rendering Styles

Fidel-ASCII now supports dynamic style translation. You can apply these to the standard font or any custom imported font:

- **Blocks (Default):** The classic shaded ASCII look.
- **Braille:** Ultra-high resolution dots using Unicode Braille patterns.
- **Dot-Matrix:** Retro electronic display style (`●`, `•`, `·`).
- **Sketch:** Hand-drawn pencil draft look (`X`, `/`, `\`).
- **Matrix:** Digital "falling code" effect using binary `0` and `1`.
- **Halftone:** Grayscale newsprint simulation using a character ramp (`@%#*+=-:. `).
- **Solid:** Clean, high-contrast block characters.

---

## 🛠️ Installation

```bash
npm install -g fidel-ascii
```

---

## 📖 CLI Usage

### Basic Rendering
```bash
fidel-ascii --text "ሰላም" --style dot-matrix --color cyan
```

### Advanced Styling
```bash
fidel-ascii --text "ኢትዮጵያ" --style sketch --shadow --gradient "red,yellow,green"
```

### Importing a Custom Font
You can turn any Ethiopic font into a `.fidel.json` map:
```bash
fidel-ascii import --font "nyala.ttf" --output "nyala.json" --height 10 --style blocks
```

### Options
| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--text` | `-t` | The Ethiopic text to render (Required) | - |
| `--style` | - | ASCII style: `blocks`, `braille`, `dot-matrix`, `sketch`, `matrix`, `halftone`, `solid` | `blocks` |
| `--color` | `-c` | Basic chalk color (red, green, blue, etc.) | `white` |
| `--gradient` | `-g` | Apply a gradient (comma-separated colors) | - |
| `--direction`| `-d` | Direction: `horizontal`, `vertical`, or degrees (e.g., `45`) | `horizontal` |
| `--shadow` | `-s` | Add a 3D-style shadow effect | `false` |
| `--light` | `-l` | Light source for shadow (top-left, top-right, etc.) | `top-left` |
| `--animate` | `-a` | Animate the colors or light source | `false` |
| `--wrap` | `-w` | Enable line wrapping based on terminal width | `false` |
| `--border` | `-b` | Add a stylized border around the output | `false` |
| `--border-style` | - | Style: `solid`, `double`, `dotted`, `bold` | `solid` |
| `--font` | `-f` | Path to a custom `.fidel.json` or `.ttf` file | `standard` |
| `--output` | `-o` | Output path for imported font files | - |

---

## 🧩 Programmatic API

```typescript
import { renderFidel } from 'fidel-ascii';
import fontData from 'fidel-ascii/fonts/standard.fidel.json';

const ascii = renderFidel("ሰላም", fontData, {
  style: 'dot-matrix',
  shadow: true,
  gradient: ['#00ffff', '#ff00ff']
});

console.log(ascii);
```

---

## 🤝 Contributing

We are currently expanding the character map! Use our [Fidel Builder](https://fidel-ascii.vercel.app/builder) (or the local tool in `tools/fidel-builder`) to contribute.

1.  Fork the repository.
2.  Create new glyphs or styles.
3.  Submit a Pull Request.

---

## 📄 License

MIT © [EyuReaper](https://github.com/eyug)
