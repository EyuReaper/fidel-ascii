import { renderFidel } from "../src/engine/render.js";
import { FidelFont } from "../src/types.js";

const mockFont: FidelFont = {
  metadata: {
    name: "Mock Font",
    height: 2,
    author: "Test"
  },
  glyphs: {
    "ሀ": ["██", "██"],
    " ": ["  ", "  "],
    "?": ["??", "??"]
  }
};

describe("renderFidel Engine - Advanced Rendering", () => {
  test("should render vertically", () => {
    // Two characters "ሀሀ" should result in two separate blocks (4 lines total, with a block separator)
    const result = renderFidel("ሀሀ", mockFont, { vertical: true });
    const blocks = result.split("\n\n");
    expect(blocks).toHaveLength(2);
    expect(blocks[0].split("\n")).toHaveLength(2);
    expect(blocks[1].split("\n")).toHaveLength(2);
  });

  test("should render inverse video", () => {
    // Original: "██", Inverse: "  " (since █ -> bg and bg is " " by default)
    // Kerning: 1 space. Inverted kerning: 1 "█"
    // Total expected: "  █"
    const result = renderFidel("ሀ", mockFont, { inverse: true });
    const lines = result.split("\n");
    expect(lines[0]).toBe("  █"); 
  });

  test("should use custom background character", () => {
    // Character "ሀ" has no internal spaces in mock, so we need a character with spaces.
    const customFont: FidelFont = {
        metadata: { name: "test", height: 1, author: "me" },
        glyphs: { "A": ["█ █"] }
    };
    const result = renderFidel("A", customFont, { backgroundChar: "." });
    expect(result).toContain("█.█.");
  });

  test("should combine inverse and backgroundChar", () => {
    const customFont: FidelFont = {
        metadata: { name: "test", height: 1, author: "me" },
        glyphs: { "A": ["█ █"] }
    };
    // Inverse: █ -> . and space -> █
    // Result: .█.
    // Plus inverted kerning (█)
    const result = renderFidel("A", customFont, { inverse: true, backgroundChar: "." });
    expect(result).toBe(".█.█");
  });
});
