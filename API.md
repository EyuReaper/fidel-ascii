# Fidel-ASCII Engine API Reference

Fidel-ASCII provides a stateless, high-performance rendering engine for Ethiopic characters. This guide covers how to use the engine programmatically in your own TypeScript/JavaScript projects.

## Installation

```bash
npm install fidel-ascii
```

## Basic Usage

```typescript
import { renderFidel } from 'fidel-ascii';
import standardFont from 'fidel-ascii/fonts/standard.fidel.json';

const output = renderFidel("ሰላም", standardFont, {
  shadow: true,
  color: "cyan"
});

console.log(output);
```

## API Reference

### `renderFidel(text, font, options?)`

The primary function for generating ASCII banners.

#### Parameters:
- **`text`** (`string`): The Ethiopic string to render.
- **`font`** (`FidelFont`): A font object containing glyph maps and metadata.
- **`options`** (`RenderOptions`): Optional configuration for styling.

#### `RenderOptions` Interface:
| Option | Type | Description |
| :--- | :--- | :--- |
| `maxWidth` | `number` | Max width before wrapping (default: `Infinity`). |
| `shadow` | `boolean` | Enables 3D shadow effect (default: `false`). |
| `lightSource` | `string` | Shadow direction: `top-left`, `top-right`, `top`, `bottom`, `left`, `right`. |
| `border` | `boolean` | Adds a stylized ASCII border (default: `false`). |
| `borderStyle` | `string` | `solid`, `double`, `dotted`, `bold` (default: `solid`). |
| `borderThickness` | `number` | Thickness of the border in characters (default: `1`). |

## Types

```typescript
export interface FidelFont {
  metadata: {
    name: string;
    height: number;
    author: string;
  };
  glyphs: {
    [key: string]: string[];
  };
}
```

## Visual Examples

### Shadow Effect
```text
  ██  
 █  █ 
 ████ 
 █  █ ░
 █  █ ░
  ░░░░░
```

### Double Border
```text
╔══════════╗
║  ሰላም    ║
╚══════════╝
```
