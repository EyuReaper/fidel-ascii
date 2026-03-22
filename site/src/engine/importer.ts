import opentype from 'opentype.js';
import { FidelFont } from './types';

interface ImportOptions {
  height: number;
  style?: 'blocks' | 'braille' | 'solid' | 'halftone' | 'binary' | 'dot-matrix' | 'sketch';
}

interface Point {
  x: number;
  y: number;
}

interface Segment {
  p1: Point;
  p2: Point;
}

function flattenPath(path: opentype.Path, steps = 10): Segment[] {
  const segments: Segment[] = [];
  let currentPos: Point = { x: 0, y: 0 };
  let startPos: Point = { x: 0, y: 0 };

  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'M':
        currentPos = { x: cmd.x, y: cmd.y };
        startPos = { x: cmd.x, y: cmd.y };
        break;
      case 'L':
        segments.push({ p1: { ...currentPos }, p2: { x: cmd.x, y: cmd.y } });
        currentPos = { x: cmd.x, y: cmd.y };
        break;
      case 'Q':
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = (1 - t) * (1 - t) * currentPos.x + 2 * (1 - t) * t * (cmd as any).x1 + t * t * (cmd as any).x;
          const y = (1 - t) * (1 - t) * currentPos.y + 2 * (1 - t) * t * (cmd as any).y1 + t * t * (cmd as any).y;
          segments.push({ p1: { ...currentPos }, p2: { x, y } });
          currentPos = { x, y };
        }
        break;
      case 'C':
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = (1 - t) * (1 - t) * (1 - t) * currentPos.x + 3 * (1 - t) * (1 - t) * t * (cmd as any).x1 + 3 * (1 - t) * t * t * (cmd as any).x2 + t * t * t * (cmd as any).x;
          const y = (1 - t) * (1 - t) * (1 - t) * currentPos.y + 3 * (1 - t) * (1 - t) * t * (cmd as any).y1 + 3 * (1 - t) * t * t * (cmd as any).y2 + t * t * t * (cmd as any).y;
          segments.push({ p1: { ...currentPos }, p2: { x, y } });
          currentPos = { x, y };
        }
        break;
      case 'Z':
        segments.push({ p1: { ...currentPos }, p2: { ...startPos } });
        currentPos = { ...startPos };
        break;
    }
  }
  return segments;
}

function isPointInPolygon(p: Point, segments: Segment[]): boolean {
  let count = 0;
  for (const seg of segments) {
    const { p1, p2 } = seg;
    if (((p1.y <= p.y && p.y < p2.y) || (p2.y <= p.y && p.y < p1.y)) &&
        (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y + 0.000001) + p1.x)) {
      count++;
    }
  }
  return count % 2 !== 0;
}

function getBrailleChar(grid: boolean[][]): string {
  const dots = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 0], [3, 1]];
  let code = 0;
  for (let i = 0; i < 8; i++) {
    const [r, c] = dots[i];
    if (grid[r] && grid[r][c]) code += Math.pow(2, i);
  }
  return String.fromCharCode(0x2800 + code);
}

function getHalftoneChar(coverage: number): string {
  const ramp = "@%#*+=-:. ";
  const index = Math.floor((1 - coverage) * (ramp.length - 1));
  return ramp[index];
}

function rasterize(glyph: opentype.Glyph, height: number, font: opentype.Font, style: ImportOptions['style'] = 'blocks'): string[] {
  const fontSize = height * 100;
  const scale = fontSize / font.unitsPerEm;
  const path = glyph.getPath(0, 0, fontSize);
  const segments = flattenPath(path, 10);
  
  const { x1, y1, x2, y2 } = glyph.getBoundingBox();
  const glyphWidth = Math.max(0.1, (x2 - x1) * scale);
  const glyphHeight = Math.max(0.1, (y2 - y1) * scale);
  const width = Math.max(1, Math.round((glyphWidth / (glyphHeight || 1)) * height));
  
  const lines: string[] = [];

  if (style === 'braille') {
    const subRows = height * 4;
    const subCols = width * 2;
    for (let row = 0; row < height; row++) {
      let line = "";
      for (let col = 0; col < width; col++) {
        const grid: boolean[][] = [];
        for (let dr = 0; dr < 4; dr++) {
          grid[dr] = [];
          for (let dc = 0; dc < 2; dc++) {
            const testX = x1 * scale + ((col * 2 + dc + 0.5) / (subCols || 1)) * glyphWidth;
            const testY = -(y2 * scale - ((row * 4 + dr + 0.5) / (subRows || 1)) * glyphHeight);
            grid[dr][dc] = isPointInPolygon({ x: testX, y: testY }, segments);
          }
        }
        line += getBrailleChar(grid);
      }
      lines.push(line);
    }
  } else {
    const SAMPLES = 4;
    for (let row = 0; row < height; row++) {
      let line = "";
      for (let col = 0; col < width; col++) {
        let hits = 0;
        for (let sy = 0; sy < SAMPLES; sy++) {
          for (let sx = 0; sx < SAMPLES; sx++) {
            const testX = x1 * scale + ((col + (sx + 0.5) / SAMPLES) / width) * glyphWidth;
            const testY = -(y2 * scale - ((row + (sy + 0.5) / SAMPLES) / height) * glyphHeight);
            if (isPointInPolygon({ x: testX, y: testY }, segments)) hits++;
          }
        }
        const coverage = hits / (SAMPLES * SAMPLES);
        
        if (style === 'solid') {
          line += coverage > 0.4 ? "█" : " ";
        } else if (style === 'halftone') {
          line += getHalftoneChar(coverage);
        } else if (style === 'binary') {
          if (coverage > 0.4) line += Math.random() > 0.5 ? "1" : "0";
          else line += " ";
        } else if (style === 'dot-matrix') {
          if (coverage > 0.8) line += "●";
          else if (coverage > 0.4) line += "•";
          else if (coverage > 0.1) line += "·";
          else line += " ";
        } else if (style === 'sketch') {
          if (coverage > 0.7) line += "X";
          else if (coverage > 0.4) line += "/";
          else if (coverage > 0.1) line += "\\";
          else line += " ";
        } else {
          // blocks
          if (coverage > 0.8) line += "█";
          else if (coverage > 0.5) line += "▓";
          else if (coverage > 0.2) line += "▒";
          else if (coverage > 0.05) line += "░";
          else line += " ";
        }
      }
      lines.push(line);
    }
  }
  return lines;
}

export async function importFontFromBuffer(buffer: ArrayBuffer, options: ImportOptions): Promise<FidelFont> {
  const font = opentype.parse(buffer);
  const glyphs: { [key: string]: string[] } = {};
  const style = options.style || 'blocks';
  
  const ranges = [[0x1200, 0x137F]];

  for (const [start, end] of ranges) {
    for (let i = start; i <= end; i++) {
      const char = String.fromCharCode(i);
      const glyph = font.charToGlyph(char);
      if (glyph && (glyph as any).unicode !== undefined && glyph.getPath(0,0,10).commands.length > 0) {
        glyphs[char] = rasterize(glyph, options.height, font, style);
      }
    }
  }
  
  glyphs[" "] = Array(options.height).fill(" ".repeat(Math.round(options.height / 2)));
  glyphs["?"] = Array(options.height).fill("?".repeat(Math.round(options.height / 2)));

  return {
    metadata: {
      name: `${font.names.fontFamily.en || "Imported Font"}`,
      height: options.height,
      author: font.names.designer?.en || "Unknown"
    },
    glyphs
  };
}
