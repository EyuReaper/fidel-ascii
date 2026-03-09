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
    // "██" + 2 spaces + " █" = "██   █"
    expect(lines[0]).toBe("██   █");
  });

  test("should use fallback for unknown characters", () => {
    const result = renderFidel("!", mockFont);
    expect(result).toContain("??");
  });

  test("should wrap text based on maxWidth", () => {
    // Each char + kerning is 4 wide. maxWidth 5 should wrap after 1st char.
    const result = renderFidel("ሀለ", mockFont, { maxWidth: 5 });
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
});
