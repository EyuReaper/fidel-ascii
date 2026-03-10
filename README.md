# Fidel-ASCII 🇪🇹🎨

**Fidel-ASCII** is the first open-source Ethiopic character map and ASCII rendering engine for terminal interfaces. It provides a modular engine and a comprehensive character map for Ethiopic (Fidel) characters, bridging the gap in terminal aesthetics for non-Latin scripts.

![Fidel-ASCII Gradient Demo](https://raw.githubusercontent.com/eyug/fidel-ascii/main/assets/demo.png) *(Placeholder for a real image)*

---

## 🚀 Features

- **Multi-Form Syllabary:** Supports the 7 forms of the Ge'ez syllabary (currently expanding).
- **Smooth Gradients:** Beautiful, harmonious vertical and horizontal color transitions using `gradient-string`.
- **3D Shadows:** Pronounced, stylized shadow effects for high-impact terminal banners.
- **Auto-Wrapping:** Smart line wrapping based on terminal width to prevent layout breaking.
- **Custom Palettes:** Support for user-defined color gradients via simple CLI flags.
- **Library Mode:** Use the rendering engine directly in your own Node.js/TypeScript projects.

---

## 🛠️ Installation

```bash
npm install -g fidel-ascii
```

---

## 📖 CLI Usage

Render Ethiopic text as large ASCII banners with various styles and effects.

### Basic Rendering
```bash
fidel-ascii --text "ሰላም"
```

### With Color and Shadow
```bash
fidel-ascii --text "ሀለ" --color cyan --shadow
```

### Harmonious Gradients
Apply a smooth horizontal gradient (default):
```bash
fidel-ascii --text "ኢትዮጵያ" --gradient --shadow
```

### Vertical & Diagonal Gradients
Control the flow of color using the `--direction` flag:
```bash
# Vertical transition
fidel-ascii --text "ሰላም" --gradient "red,yellow,green" --direction vertical

# Diagonal transition (45 degrees)
fidel-ascii --text "ሀለሑ" --gradient "blue,magenta" --direction 45
```

### Options
| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--text` | `-t` | The Ethiopic text to render (Required) | - |
| `--color` | `-c` | Basic chalk color (red, green, blue, etc.) | `white` |
| `--gradient` | `-g` | Apply a vertical gradient (comma-separated colors) | `rainbow` |
| `--direction`| `-d` | Direction of gradient: `horizontal`, `vertical`, or degrees (e.g. `45`) | `horizontal` |
| `--shadow` | `-s` | Add a 3D-style pronounced shadow | `false` |
| `--wrap` | `-w` | Enable line wrapping based on terminal width | `false` |
| `--font` | `-f` | Path to a custom `.fidel.json` font file | `standard` |

---

## 🧩 Programmatic API

You can also use the engine in your own TypeScript/JavaScript projects:

```typescript
import { renderFidel } from 'fidel-ascii';
import fontData from 'fidel-ascii/fonts/standard.fidel.json';

const ascii = renderFidel("ሰላም", fontData, {
  shadow: true,
  maxWidth: 80
});

console.log(ascii);
```

---

## 🎨 Tooling: Fidel Builder

The project includes a React-based web tool for drawing and exporting custom glyphs.

- **Load Existing:** Paste character JSON to edit existing glyphs.
- **Ghosting:** Overlay a reference character to maintain visual consistency across forms.

To run the builder locally:
```bash
cd tools/fidel-builder
npm install
npm run dev
```

---

## 🤝 Contributing

We are currently expanding the character map! If you'd like to contribute new glyphs or improve the engine, please check out our [Contribution Guide](CONTRIBUTING.md).

1.  Fork the repository.
2.  Use the **Fidel Builder** to create new glyphs.
3.  Submit a Pull Request.

---

## 📄 License

MIT © [EyuReaper](https://github.com/eyug)
