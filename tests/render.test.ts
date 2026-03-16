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
    "ለ": [" █", " █"],
    "?": ["??", "??"]
  }
};

describe("renderFidel Engine", () => {
  test("should render a single character", () => {
    const result = renderFidel("ሀ", mockFont);
    const lines = result.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("██");
  });

  test("should render multiple characters with kerning", () => {
    const result = renderFidel("ሀለ", mockFont);
    const lines = result.split("\n");
    // "██" + 1 space + " █" = "██  █"
    expect(lines[0]).toBe("██  █");
  });

  test("should use fallback for unknown characters", () => {
    const result = renderFidel("!", mockFont);
    expect(result).toContain("??");
  });

  test("should wrap text based on maxWidth", () => {
    // Each char + kerning is 3 wide. maxWidth 5 should allow 'ሀ' and maybe more?
    // "██" (2) + " " (1) + " █" (2) = 5
    // maxWidth 5 should allow BOTH 'ሀ' and 'ለ' on one line now.
    // Let's set maxWidth to 2 to force wrap after 1st char.
    const result = renderFidel("ሀለ", mockFont, { maxWidth: 2 });
    const blocks = result.split("\n\n");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain("██"); // 'ሀ'
    expect(blocks[1]).toContain(" █");  // 'ለ'
  });

  test("should apply shadow effect", () => {
    const result = renderFidel("ሀ", mockFont, { shadow: true });
    // Should have height + 1 (shadow line)
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain("░");
  });

  test("should apply border around the text", () => {
    const result = renderFidel("ሀ", mockFont, { border: true });
    const lines = result.split("\n");
    // Original height 2 + 2 for top and bottom borders = 4
    expect(lines).toHaveLength(4);
    // Top border
    expect(lines[0]).toMatch(/^[┌─┐]+$/);
    // Content with side borders
    expect(lines[1]).toMatch(/^│.*│$/);
    // Bottom border
    expect(lines[3]).toMatch(/^[└─┘]+$/);
  });

  test("should apply border to each wrapped block", () => {
    // Each char is 2 wide + 1 kerning = 3. maxWidth 2 forces wrap.
    const result = renderFidel("ሀለ", mockFont, { border: true, maxWidth: 2 });
    const blocks = result.split("\n\n");
    expect(blocks).toHaveLength(2);
    
    // Each block should have a border
    for (const block of blocks) {
      const lines = block.split("\n");
      expect(lines).toHaveLength(4);
      expect(lines[0]).toMatch(/^[┌─┐]+$/);
      expect(lines[3]).toMatch(/^[└─┘]+$/);
    }
  });
});
