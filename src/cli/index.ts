#!/usr/bin/env node
import meow from "meow";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { renderFidel } from "../engine/render.js";
import { FidelFont } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cli = meow(
  `
	Usage
	  $ fidel-ascii --text "ሰላም"

	Options
	  --text, -t   The text to render (required)
	  --font, -f   Path to a custom font file (optional)
	  --color, -c  Color for the output (optional: red, green, yellow, blue, magenta, cyan, white)

	Examples
	  $ fidel-ascii --text "ሀለ" --color cyan
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
    },
  }
);

async function main() {
  const { text, font, color } = cli.flags;

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

  const result = renderFidel(text, fontData);

  // Apply color
  const coloredOutput = (chalk as any)[color] ? (chalk as any)[color](result) : result;
  console.log(coloredOutput);
}

main();
