#!/usr/bin/env node
import meow from "meow";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import gradientString from "gradient-string";
import { renderFidel } from "../engine/render.js";
import { FidelFont } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cli = meow(
  `
	Usage
	  $ fidel-ascii --text "ሰላም"

	Options
	  --text, -t       The text to render (required)
	  --font, -f       Path to a custom font file (optional)
	  --color, -c      Color for the output (optional: red, green, yellow, blue, magenta, cyan, white)
	  --shadow, -s     Add a pronounced 3D shadow effect
	  --gradient, -g   Apply a harmonious color gradient. Optionally provide a comma-separated list of colors.
	  --direction, -d  Direction of the gradient: "horizontal", "vertical", or a degree (e.g., "45")
	  --wrap, -w       Enable line wrapping based on terminal width

	Examples
	  $ fidel-ascii --text "ሀለ" --color cyan --shadow
	  $ fidel-ascii --text "ሰላም" --gradient --shadow
	  $ fidel-ascii --text "ኢትዮጵያ" --gradient "red,yellow,green" --direction 45 --shadow
`,
  {
    importMeta: import.meta,
    flags: {
      text: {
        type: "string",
        shortFlag: "t",
        isRequired: true,
      },
      font: {
        type: "string",
        shortFlag: "f",
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
      gradient: {
        type: "string",
        shortFlag: "g",
      },
      direction: {
        type: "string",
        shortFlag: "d",
        default: "horizontal",
      },
      wrap: {
        type: "boolean",
        shortFlag: "w",
        default: false,
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
  const { text, font, color, shadow, wrap, gradient, direction } = cli.flags;

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
  const renderOptions = {
    maxWidth: wrap ? terminalWidth - 5 : Infinity,
    shadow,
  };

  const rawOutput = renderFidel(text, fontData, renderOptions);

  if (gradient !== undefined) {
    const defaultPalette = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"];
    const userColors = gradient ? gradient.split(",").map(c => c.trim()) : defaultPalette;
    
    const isDegree = !isNaN(parseFloat(direction));
    
    if (isDegree) {
      const angle = (parseFloat(direction) * Math.PI) / 180;
      const lines = rawOutput.split("\n");
      const height = lines.length;
      const width = Math.max(...lines.map(l => l.length));
      
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Calculate min and max projections to normalize t
      let minP = Infinity;
      let maxP = -Infinity;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const p = x * cos + y * sin;
          if (p < minP) minP = p;
          if (p > maxP) maxP = p;
        }
      }

      const coloredOutput = lines.map((line, y) => {
        return Array.from(line).map((char, x) => {
          if (char === " " || char === "\n") return char;
          const p = x * cos + y * sin;
          const t = (p - minP) / (maxP - minP || 1);
          const rgb = getInterpolatedColor(userColors, t);
          return chalk.rgb(rgb.r, rgb.g, rgb.b)(char);
        }).join("");
      }).join("\n");
      
      console.log(coloredOutput);
    } else if (direction === "vertical") {
      const g = (gradientString as any)(userColors);
      console.log(g.multiline(rawOutput));
    } else {
      const g = (gradientString as any)(userColors);
      console.log(g(rawOutput));
    }
  } else {
    const coloredOutput = (chalk as any)[color] ? (chalk as any)[color](rawOutput) : rawOutput;
    console.log(coloredOutput);
  }
}


main();
