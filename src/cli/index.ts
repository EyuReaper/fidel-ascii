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
	  --text, -t     The text to render (required)
	  --font, -f     Path to a custom font file (optional)
	  --color, -c    Color for the output (optional: red, green, yellow, blue, magenta, cyan, white)
	  --shadow, -s   Add a pronounced 3D shadow effect
	  --gradient, -g Apply a harmonious color gradient. Optionally provide a comma-separated list of colors.
	  --wrap, -w     Enable line wrapping based on terminal width

	Examples
	  $ fidel-ascii --text "ሀለ" --color cyan --shadow
	  $ fidel-ascii --text "ሰላም" --gradient --shadow
	  $ fidel-ascii --text "ኢትዮጵያ" --gradient "red,yellow,green" --shadow
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
      wrap: {
        type: "boolean",
        shortFlag: "w",
        default: false,
      },
    },
  }
);

async function main() {
  const { text, font, color, shadow, wrap, gradient } = cli.flags;

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
    const defaultPalette = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];
    const userColors = gradient ? gradient.split(",").map(c => c.trim()) : defaultPalette;
    
    // Apply smooth gradient to the entire output
    const g = (gradientString as any)(userColors);
    console.log(g(rawOutput));
  } else {
    const coloredOutput = (chalk as any)[color] ? (chalk as any)[color](rawOutput) : rawOutput;
    console.log(coloredOutput);
  }
}


main();
