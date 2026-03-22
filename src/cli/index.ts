#!/usr/bin/env node
import meow from "meow";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import gradientString from "gradient-string";
import readline from "readline";
import { renderFidel } from "../engine/render.js";
import { importFont } from "../importer/font-to-fidel.js";
import { FidelFont } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cli = meow(
  `
	Usage
	  $ fidel-ascii --text "ሰላም"
	  $ fidel-ascii import --font "nyala.ttf" --output "nyala.fidel.json" --height 5 --style braille

	Options
	  --text, -t       The text to render (required for rendering)
	  --font, -f       Path to a font file (.ttf/.otf for import, .json for rendering)
	  --output, -o     Path to save the imported font (required for import)
	  --height, -h     The target ASCII height for import (default: 5)
	  --style          ASCII style: blocks, braille, dot-matrix, sketch, matrix, halftone, solid (default: blocks)
	  --color, -c      Color for the output (optional: red, green, yellow, blue, magenta, cyan, white)
	  --shadow, -s     Add a 3D shadow effect
	  --light, -l      Light source for shadow: top-left, top-right, top, bottom, left, right (default: top-left)
	  --gradient, -g   Apply a harmonious color gradient. Optionally provide a comma-separated list of colors.
	  --direction, -d  Direction of the gradient: "horizontal", "vertical", or a degree (e.g., "45")
	  --animate, -a    Animate the colors or light source
	  --wrap, -w       Enable line wrapping based on terminal width
	  --vertical, -v   Render characters vertically (top-to-bottom)
	  --inverse, -i    Invert glyph foreground and background
	  --bg             Custom background character (default: space)
	  --border, -b     Add a border around the output
	  --border-thickness  Thickness of the border (default: 1)
	  --border-style      Style of the border: solid, double, dotted, bold (default: solid)
	  --border-color      Color of the border (optional)

	Examples
	  $ fidel-ascii --text "ሀለ" --color cyan --shadow
	  $ fidel-ascii --text "ሰላም" --gradient --shadow --animate
	  $ fidel-ascii --text "ኢትዮጵያ" --gradient "red,yellow,green" --direction 45 --shadow
`,
  {
    importMeta: import.meta,
    flags: {
      text: {
        type: "string",
        shortFlag: "t",
      },
      font: {
        type: "string",
        shortFlag: "f",
      },
      output: {
        type: "string",
        shortFlag: "o",
      },
      height: {
        type: "number",
        shortFlag: "h",
        default: 5,
      },
      style: {
        type: "string",
        default: "blocks",
      },
      color: {
        type: "string",
        shortFlag: "c",
        default: "white",
      },
      shadow: {
        type: "boolean",
        shortFlag: "s",
        default: false,
      },
      light: {
        type: "string",
        shortFlag: "l",
        default: "top-left",
      },
      gradient: {
        type: "string",
        shortFlag: "g",
      },
      direction: {
        type: "string",
        shortFlag: "d",
        default: "horizontal",
      },
      animate: {
        type: "boolean",
        shortFlag: "a",
        default: false,
      },
      wrap: {
        type: "boolean",
        shortFlag: "w",
        default: false,
      },
      vertical: {
        type: "boolean",
        shortFlag: "v",
        default: false,
      },
      inverse: {
        type: "boolean",
        shortFlag: "i",
        default: false,
      },
      bg: {
        type: "string",
      },
      border: {
        type: "boolean",
        shortFlag: "b",
        default: false,
      },
      borderThickness: {
        type: "number",
        default: 1,
      },
      borderStyle: {
        type: "string",
        default: "solid",
      },
      borderColor: {
        type: "string",
      },
    },
  }
);

/**
 * Basic color name to Hex map for interpolation.
 */
const COLOR_MAP: Record<string, string> = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  yellow: "#ffff00",
  magenta: "#ff00ff",
  cyan: "#00ffff",
  white: "#ffffff",
  black: "#000000",
  orange: "#ffa500",
  purple: "#800080",
};

function parseColor(c: string): { r: number; g: number; b: number } {
  const hex = COLOR_MAP[c.toLowerCase()] || c;
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (m) {
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16),
    };
  }
  return { r: 255, g: 255, b: 255 };
}

function lerp(a: number, b: number, t: number) {
  return Math.floor(a + (b - a) * t);
}

function getInterpolatedColor(colors: string[], t: number): { r: number; g: number; b: number } {
  const clampedT = Math.max(0, Math.min(0.999, t));
  const segment = 1 / (colors.length - 1);
  const index = Math.floor(clampedT / segment);
  const localT = (clampedT % segment) / segment;

  const c1 = parseColor(colors[index]);
  const c2 = parseColor(colors[index + 1]);

  return {
    r: lerp(c1.r, c2.r, localT),
    g: lerp(c1.g, c2.g, localT),
    b: lerp(c1.b, c2.b, localT),
  };
}

async function main() {
  const { 
    text, font, color, shadow, wrap, gradient, direction, animate, light,
    border, borderThickness, borderStyle, borderColor,
    vertical, inverse, bg, output, height, style
  } = cli.flags;

  if (cli.input[0] === "import") {
    if (!font || !output) {
      console.error("Error: --font and --output are required for import.");
      process.exit(1);
    }
    console.log(`Importing font from ${font} in ${style || "blocks"} style...`);
    try {
      const imported = await importFont(font, { 
        height: height || 5,
        style: style as any
      });
      fs.writeFileSync(output, JSON.stringify(imported, null, 2));
      console.log(`Successfully saved imported font to ${output}`);
    } catch (err: any) {
      console.error(`Import failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (!text) {
    console.error("Error: --text is required for rendering.");
    cli.showHelp();
    return;
  }

  let fontData: FidelFont;

  if (font) {
    const fontPath = path.resolve(process.cwd(), font);
    if (!fs.existsSync(fontPath)) {
      console.error(`Error: Font file not found at ${fontPath}`);
      process.exit(1);
    }
    fontData = JSON.parse(fs.readFileSync(fontPath, "utf-8"));
  } else {
    const defaultFontPath = path.join(__dirname, "../fonts/standard.fidel.json");
    const devFontPath = path.resolve(__dirname, "../../src/fonts/standard.fidel.json");

    if (fs.existsSync(defaultFontPath)) {
      fontData = JSON.parse(fs.readFileSync(defaultFontPath, "utf-8"));
    } else if (fs.existsSync(devFontPath)) {
      fontData = JSON.parse(fs.readFileSync(devFontPath, "utf-8"));
    } else {
      console.error("Error: Default font file not found.");
      process.exit(1);
    }
  }

  // Detect terminal width
  const terminalWidth = process.stdout.columns || 80;
  
  const renderLoop = (offset = 0) => {
    const renderOptions: any = {
      maxWidth: wrap ? terminalWidth - 5 : Infinity,
      shadow,
      lightSource: light,
      border,
      borderThickness,
      borderStyle: borderStyle as any,
      vertical,
      inverse,
      backgroundChar: bg,
      style,
    };

    const rawOutput = renderFidel(text, fontData, renderOptions);
    let finalOutput = "";

    // Apply border color if specified and no gradient is active
    let coloredOutput = rawOutput;
    if (border && borderColor && gradient === undefined) {
      const blocks = rawOutput.split("\n\n");
      const coloredBlocks = blocks.map(block => {
        const borderLines = block.split("\n");
        const topBorderHeight = borderThickness || 1;
        const bottomBorderHeight = borderThickness || 1;
        
        const coloredLines = borderLines.map((line, i) => {
          const isTopBorder = i < topBorderHeight;
          const isBottomBorder = i >= borderLines.length - bottomBorderHeight;
          const isSideBorder = !isTopBorder && !isBottomBorder;
          
          if (isTopBorder || isBottomBorder) {
            return (chalk as any)[borderColor] ? (chalk as any)[borderColor](line) : line;
          } else if (isSideBorder) {
            // Color only the first and last characters (vertical borders)
            const left = line.slice(0, 1);
            const right = line.slice(-1);
            const middle = line.slice(1, -1);
            const coloredLeft = (chalk as any)[borderColor] ? (chalk as any)[borderColor](left) : left;
            const coloredRight = (chalk as any)[borderColor] ? (chalk as any)[borderColor](right) : right;
            return coloredLeft + middle + coloredRight;
          }
          return line;
        });
        return coloredLines.join("\n");
      });
      coloredOutput = coloredBlocks.join("\n\n");
    }

    if (gradient !== undefined) {
      const defaultPalette = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"];
      const userColors = gradient ? gradient.split(",").map(c => c.trim()) : defaultPalette;
      
      // Shift colors for animation
      const shiftedColors = [...userColors];
      if (animate) {
        const shift = Math.floor(offset) % shiftedColors.length;
        for (let i = 0; i < shift; i++) {
          shiftedColors.push(shiftedColors.shift()!);
        }
      }

      const isDegree = !isNaN(parseFloat(direction));
      
      if (isDegree) {
        const angle = (parseFloat(direction) * Math.PI) / 180;
        const lines = rawOutput.split("\n");
        const height = lines.length;
        const width = Math.max(...lines.map(l => l.length));
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        let minP = Infinity;
        let maxP = -Infinity;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const p = x * cos + y * sin;
            if (p < minP) minP = p;
            if (p > maxP) maxP = p;
          }
        }

        finalOutput = lines.map((line, y) => {
          return Array.from(line).map((char, x) => {
            // Skip empty characters for coloring to keep the background clean
            if (char === " " || char === "\n" || char === "\u2800") return char;
            
            const p = x * cos + y * sin;
            const t = (p - minP) / (maxP - minP || 1);
            const rgb = getInterpolatedColor(shiftedColors, t);
            return chalk.rgb(rgb.r, rgb.g, rgb.b)(char);
          }).join("");
        }).join("\n");
      } else if (direction === "vertical") {
        // For vertical gradients in Braille, we avoid gradient-string's multiline
        // and use our own more precise row-based interpolation
        const lines = rawOutput.split("\n");
        finalOutput = lines.map((line, y) => {
          const t = y / (lines.length - 1 || 1);
          const rgb = getInterpolatedColor(shiftedColors, t);
          return Array.from(line).map(char => {
             if (char === " " || char === "\u2800") return char;
             return chalk.rgb(rgb.r, rgb.g, rgb.b)(char);
          }).join("");
        }).join("\n");
      } else {
        // Horizontal gradient
        const lines = rawOutput.split("\n");
        finalOutput = lines.map(line => {
          const chars = Array.from(line);
          return chars.map((char, x) => {
            if (char === " " || char === "\u2800") return char;
            const t = x / (line.length - 1 || 1);
            const rgb = getInterpolatedColor(shiftedColors, t);
            return chalk.rgb(rgb.r, rgb.g, rgb.b)(char);
          }).join("");
        }).join("\n");
      }
    } else {
      finalOutput = (chalk as any)[color] ? (chalk as any)[color](coloredOutput) : coloredOutput;
    }

    if (animate) {
      process.stdout.write("\x1b[?25l"); // Hide cursor
      process.stdout.write("\x1b[H"); // Home
      console.log(finalOutput);
      setTimeout(() => renderLoop(offset + 0.2), 50);
    } else {
      console.log(finalOutput);
    }
  };

  if (animate) {
    process.stdout.write("\x1b[2J"); // Clear screen
    renderLoop();
  } else {
    renderLoop();
  }
}


main();
