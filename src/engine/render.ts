import { FidelFont } from "../types.js";

/**
 * Options for rendering Fidel ASCII.
 */
export interface RenderOptions {
  /** Maximum width of a single line of ASCII. If exceeded, the text will wrap. */
  maxWidth?: number;
  /** Whether to add a simple shadow effect. */
  shadow?: boolean;
  /** An array of colors for a vertical gradient (one color per line of the font). */
  gradient?: string[];
}

/**
 * Returns a fallback glyph for characters not present in the font map.
 */
function getFallback(font: FidelFont): string[] {
  const fallbackChar = "?";
  if (font.glyphs[fallbackChar]) {
    return font.glyphs[fallbackChar];
  }
  return Array(font.metadata.height).fill(" ".repeat(5));
}

/**
 * Renders a string of Ethiopic text into an ASCII banner with optional wrapping.
 * @param text - The Ethiopic string to render.
 * @param font - The font object containing glyph maps.
 * @param options - Rendering options like maxWidth.
 */
export function renderFidel(text: string, font: FidelFont, options: RenderOptions = {}): string {
  const height = font.metadata.height;
  const chars = Array.from(text);
  const maxWidth = options.maxWidth || Infinity;
  const kerning = 2;

  let allBlocks: string[][] = [];
  let currentBlockLines = Array(height).fill("");
  let currentBlockWidth = 0;

  for (const char of chars) {
    const rawGlyph = font.glyphs[char] || getFallback(font);
    const glyphLines = rawGlyph.slice(0, height);
    
    while (glyphLines.length < height) {
      glyphLines.push("");
    }

    const glyphWidth = Math.max(...glyphLines.map(line => line.length));
    const totalAddedWidth = glyphWidth + kerning;

    if (currentBlockWidth + totalAddedWidth > maxWidth && currentBlockWidth > 0) {
      allBlocks.push(currentBlockLines.map(l => l.trimEnd()));
      currentBlockLines = Array(height).fill("");
      currentBlockWidth = 0;
    }

    for (let i = 0; i < height; i++) {
      const line = glyphLines[i] || "";
      const paddedLine = line.padEnd(glyphWidth, " ");
      currentBlockLines[i] += paddedLine + " ".repeat(kerning);
    }
    currentBlockWidth += totalAddedWidth;
  }

  allBlocks.push(currentBlockLines.map(l => l.trimEnd()));

  // Post-process blocks for shadow
  if (options.shadow) {
    allBlocks = allBlocks.map(block => applyShadow(block));
  }

  // Combine blocks into a single string
  return allBlocks.map(block => block.join("\n")).join("\n\n");
}

/**
 * Applies a 3D-style shadow effect to a block of ASCII lines.
 */
function applyShadow(block: string[]): string[] {
  const shadowChar = "░";
  const result = block.map(line => {
    // Replace trailing spaces with shadow if preceded by a block
    return line.replace(/█( +)/g, (match, spaces) => "█" + shadowChar + " ".repeat(spaces.length - 1)) + shadowChar;
  });

  // Add a shadow line at the bottom
  const lastLine = block[block.length - 1];
  const shadowBottom = lastLine.replace(/█/g, shadowChar).replace(/[^░]/g, " ");
  result.push(shadowBottom);
  
  return result;
}
