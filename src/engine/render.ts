import { FidelFont, RenderOptions } from "../types.js";

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
    // Trim each line of the glyph to remove unnecessary trailing whitespace
    const glyphLines = rawGlyph.slice(0, height).map(line => line.trimEnd());
    
    while (glyphLines.length < height) {
      glyphLines.push("");
    }

    const glyphWidth = Math.max(...glyphLines.map(line => line.length));
    const kerning = 1; // Reduced from 2 for tighter feel
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
    allBlocks = allBlocks.map(block => applyDirectionalShadow(block, options.lightSource || "top-left"));
  }

  // Post-process blocks for border
  if (options.border) {
    allBlocks = allBlocks.map(block => applyBorder(block, options));
  }

  // Combine blocks into a single string
  return allBlocks.map(block => block.join("\n")).join("\n\n");
}

/**
 * Applies a border around a block of ASCII text.
 */
function applyBorder(block: string[], options: RenderOptions): string[] {
  const thickness = options.borderThickness || 1;
  const style = options.borderStyle || "solid";
  
  const chars = {
    solid: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
    double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
    dotted: { tl: "•", tr: "•", bl: "•", br: "•", h: "·", v: "·" },
    bold: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" }
  }[style] || { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" };

  const contentWidth = Math.max(...block.map(l => l.length));
  const totalWidth = contentWidth + 2 + (thickness - 1) * 2;
  
  const result: string[] = [];

  // Top border
  for (let t = 0; t < thickness; t++) {
    if (t === 0) {
      result.push(chars.tl + chars.h.repeat(totalWidth - 2) + chars.tr);
    } else {
      result.push(chars.v + " ".repeat(totalWidth - 2) + chars.v);
    }
  }

  // Content with side borders
  for (const line of block) {
    const paddedLine = line.padEnd(contentWidth, " ");
    result.push(chars.v + " ".repeat(thickness - 1) + paddedLine + " ".repeat(thickness - 1) + chars.v);
  }

  // Bottom border
  for (let t = 0; t < thickness; t++) {
    if (t === thickness - 1) {
      result.push(chars.bl + chars.h.repeat(totalWidth - 2) + chars.br);
    } else {
      result.push(chars.v + " ".repeat(totalWidth - 2) + chars.v);
    }
  }

  return result;
}

/**
 * Applies a directional shadow effect based on light source.
 */
function applyDirectionalShadow(block: string[], light: string): string[] {
  const shadowChar = "░";
  const height = block.length;
  const width = Math.max(...block.map(l => l.length));
  
  // Create a grid for easier manipulation
  const grid = block.map(line => line.padEnd(width, " ").split(""));
  const shadowGrid: string[][] = Array.from({ length: height + 1 }, () => Array(width + 1).fill(" "));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === "█") {
        // Project shadow based on light direction
        let sx = x, sy = y;
        if (light.includes("top")) sy++;
        if (light.includes("bottom")) sy--;
        if (light.includes("left")) sx++;
        if (light.includes("right")) sx--;

        if (sx >= 0 && sx < width + 1 && sy >= 0 && sy < height + 1) {
          if (sy < height && sx < width) {
            if (grid[sy][sx] !== "█") {
              shadowGrid[sy][sx] = shadowChar;
            }
          } else {
            shadowGrid[sy][sx] = shadowChar;
          }
        }
      }
    }
  }

  // Merge grid and shadowGrid
  const result = grid.map((line, y) => {
    return line.map((char, x) => (char === "█" ? "█" : shadowGrid[y][x] || " ")).join("");
  });

  // Add the extra shadow line if it exists and contains shadow characters
  const lastShadowLine = shadowGrid[height].join("").trimEnd();
  if (lastShadowLine) {
    result.push(lastShadowLine);
  }

  return result;
}
