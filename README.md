# Fidel-ASCII 🇪🇹🎨

**Fidel-ASCII** is the first open-source Ethiopic character map and ASCII rendering engine for terminal interfaces. It provides a modular engine and a comprehensive character map for Ethiopic (Fidel) characters, bridging the gap in terminal aesthetics for non-Latin scripts.

![Fidel-ASCII Gradient Demo](https://raw.githubusercontent.com/eyug/fidel-ascii/main/assets/demo.png) *(Placeholder for a real image)*

---

## 🚀 Features

- **Multi-Form Syllabary:** Supports the 7 forms of the Ge'ez syllabary (ሀ-ፑ, ሂ-ቪ, ዮ, etc.).
- **Symbol Support:** Full mapping for common punctuation and logic symbols (`!`, `.`, `,`, `:`, `>`, `<`, `(`, `)`, etc.).
- **Tight Rendering:** Optimized engine with variable-width kerning and trailing space removal for compact, legible banners.
- **Smooth Gradients:** Beautiful, harmonious vertical and horizontal color transitions using `gradient-string`.
- **Dynamic Borders:** Add professional ASCII borders with customizable styles (solid, double, dotted, bold) and colors.
- **3D Shadows:** Pronounced, stylized shadow effects for high-impact terminal banners.
- **Auto-Wrapping:** Smart line wrapping based on terminal width to prevent layout breaking.
- **Library Mode:** Use the rendering engine directly in your own Node.js/TypeScript projects.

## 🎨 High-Impact Visuals

Fidel-ASCII isn't just a character map; it's a rendering engine designed for maximum terminal impact.

### "Tight" Rendering with Shadows & Double Borders
```text
╔═══════════════════════════════════════════════════════════════════════════╗
║  ██ █       ██   ███     █    ███   █   ██    ██       ██     ██   ███████║
║ █ ░░██       █░  █░███  █ ██  █░█░  █░   ░█    ░██     ██░     ██  █░█░█░█║
║ █░   ███   █████  █ ░░░  █ ░░ ██ ░  █░    █░     ░█  ██████   █ ██ ███░███║
║ █░   █░█░   ░█░░░  █    █ ██   ░█    ░    █░    ██ ░ █░░░░█░ █ ░██░ █░░ ░░║
║  ██  █░██    █░     █  █ ░██░ ███░  █   ██ ░  ██ ░░  █░   █░  ░ ██░█ ░    ║
║   ░░  ░ ░░    ░      ░  ░  ░░  ░░░   ░   ░░    ░░     ░    ░     ░░ ░     ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🛠️ Installation

```bash
npm install -g fidel-ascii
```

---

## 📖 CLI Usage

Render Ethiopic text as large ASCII banners with various styles and effects.

> **Note:** Always wrap multi-word strings or text with spaces in **double quotes** (e.g., `--text "ጃኖ ፊደል"`) to ensure the shell parses them correctly.

### Basic Rendering
```bash
fidel-ascii --text "ሰላም"
```

### Mixed Content & Symbols
```bash
fidel-ascii --text "(ኢትዮጵያ!) > ሰላም" --border --shadow
```

### Dynamic Borders
Wrap your banners in stylized borders:
```bash
# Double border with thickness (padding)
fidel-ascii --text "ሀለ" --border --border-style double --border-thickness 2 --border-color yellow
```

### Options
| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--text` | `-t` | The Ethiopic text to render (Required) | - |
| `--color` | `-c` | Basic chalk color (red, green, blue, etc.) | `white` |
| `--gradient` | `-g` | Apply a vertical gradient (comma-separated colors) | `rainbow` |
| `--direction`| `-d` | Direction of gradient: `horizontal`, `vertical`, or degrees | `horizontal` |
| `--shadow` | `-s` | Add a 3D-style pronounced shadow | `false` |
| `--light` | `-l` | Light source for shadow (top-left, top-right, etc.) | `top-left` |
| `--animate` | `-a` | Animate the colors or light source | `false` |
| `--wrap` | `-w` | Enable line wrapping based on terminal width | `false` |
| `--border` | `-b` | Add a stylized border around the output | `false` |
| `--border-style` | - | Style: `solid`, `double`, `dotted`, `bold` | `solid` |
| `--font` | `-f` | Path to a custom `.fidel.json` font file | `standard` |

---

## 🧩 Programmatic API

Use the rendering engine in your own TypeScript/JavaScript projects. See [API.md](API.md) for full documentation.

```typescript
import { renderFidel } from 'fidel-ascii';
import fontData from 'fidel-ascii/fonts/standard.fidel.json';

const ascii = renderFidel("ሰላም", fontData, {
  shadow: true,
  border: true,
  borderStyle: 'double'
});

console.log(ascii);
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
