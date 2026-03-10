import { FidelFont } from "../types.js";

/**
 * Options for rendering Fidel ASCII.
 */
export interface RenderOptions {
  /** Maximum width of a single line of ASCII. If exceeded, the text will wrap. */
  maxWidth?: number;
  /** Whether to add a shadow effect. */
  shadow?: boolean;
  /** Direction of the light source for the shadow. */
  lightSource?: "top-left" | "top-right" | "top" | "bottom" | "left" | "right";
  /** An array of colors for a vertical gradient. */
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
    allBlocks = allBlocks.map(block => applyDirectionalShadow(block, options.lightSource || "top-left"));
  }

  // Combine blocks into a single string
  return allBlocks.map(block => block.join("\n")).join("\n\n");
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
  const shadowGrid = Array(height).fill(null).map(() => Array(width).fill(" "));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === "█") {
        // Project shadow based on light direction
        let sx = x, sy = y;
        if (light.includes("top")) sy++;
        if (light.includes("bottom")) sy--;
        if (light.includes("left")) sx++;
        if (light.includes("right")) sx--;

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          if (grid[sy][sx] !== "█") {
            shadowGrid[sy][sx] = shadowChar;
          }
        } else if (sy === height && light.includes("top")) {
          // Allow one extra line for bottom shadow if light is from top
          if (!shadowGrid[sy]) shadowGrid[sy] = Array(width).fill(" ");
          shadowGrid[sy][sx] = shadowChar;
        }
      }
    }
  }

  // Merge grid and shadowGrid
  const result = grid.map((line, y) => {
    return line.map((char, x) => (char === "█" ? "█" : shadowGrid[y][x] || " ")).join("");
  });

  // Add the extra shadow line if it exists
  if (shadowGrid[height]) {
    result.push(shadowGrid[height].join(""));
  }

  return result;
}
