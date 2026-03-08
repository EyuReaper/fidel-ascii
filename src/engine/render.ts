import { FidelFont } from "../types.js";

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
 * Renders a string of Ethiopic text into an ASCII banner.
 * @param text - The Ethiopic string to render.
 * @param font - The font object containing glyph maps.
 */
export function renderFidel(text: string, font: FidelFont): string {
  const height = font.metadata.height;
  const lines = Array(height).fill("");

  const chars = Array.from(text);

  for (const char of chars) {
    const rawGlyph = font.glyphs[char] || getFallback(font);
    
    // Ensure glyph has correct height
    const glyphLines = rawGlyph.slice(0, height);
    while (glyphLines.length < height) {
      glyphLines.push("");
    }

    // Normalize width for this specific glyph
    const maxWidth = Math.max(...glyphLines.map(line => line.length));
    
    for (let i = 0; i < height; i++) {
      const line = glyphLines[i] || "";
      const paddedLine = line.padEnd(maxWidth, " ");
      lines[i] += paddedLine + "  "; // 2 spaces for kerning
    }
  }

  return lines.join("\n");
}
