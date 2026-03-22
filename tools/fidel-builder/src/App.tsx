import { useState, useEffect, useRef } from "react";
import opentype from "opentype.js";
import "./App.css";

const ROWS = 5;
const INITIAL_COLS = 6;
const LOCAL_STORAGE_KEY = "fidel-builder-session";

interface Segment {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
}

function App() {
  const [cols, setCols] = useState(INITIAL_COLS);
  const [grid, setGrid] = useState<boolean[][]>(
    Array(ROWS).fill(null).map(() => Array(INITIAL_COLS).fill(false))
  );
  const [ghostGrid, setGhostGrid] = useState<boolean[][] | null>(null);
  const [char, setChar] = useState("");
  const [loadInput, setLoadInput] = useState("");
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [loadedFont, setLoadedFont] = useState<opentype.Font | null>(null);
  const autoSaveTimeout = useRef<number | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const { cols: savedCols, grid: savedGrid, char: savedChar } = JSON.parse(saved);
        setCols(savedCols);
        setGrid(savedGrid);
        setChar(savedChar);
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = window.setTimeout(() => {
      setIsAutoSaving(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ cols, grid, char }));
      setTimeout(() => setIsAutoSaving(false), 500);
    }, 1000);
  }, [cols, grid, char]);

  // Resize grid when cols change
  useEffect(() => {
    setGrid(prev => 
      Array(ROWS).fill(null).map((_, r) => 
        Array(cols).fill(null).map((_, c) => prev[r]?.[c] || false)
      )
    );
  }, [cols]);

  const toggleCell = (r: number, c: number) => {
    const newGrid = grid.map((row, rowIdx) => 
      rowIdx === r ? row.map((cell, colIdx) => colIdx === c ? !cell : cell) : row
    );
    setGrid(newGrid);
  };

  const clearGrid = () => {
    if (confirm("Clear current grid?")) {
      setGrid(Array(ROWS).fill(null).map(() => Array(cols).fill(false)));
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    try {
      const font = opentype.parse(buffer);
      setLoadedFont(font);
      alert(`Font loaded: ${font.names.fontFamily.en}`);
    } catch (err) {
      alert("Error loading font: " + err);
    }
  };

  const renderFromFont = () => {
    if (!loadedFont || !char) return;
    const glyph = loadedFont.charToGlyph(char);
    if (!glyph) return alert("Glyph not found in font");

    const fontSize = ROWS * 100;
    const scale = fontSize / loadedFont.unitsPerEm;
    const path = glyph.getPath(0, 0, fontSize);
    
    // Flatten path and rasterize
    const segments: Segment[] = [];
    let curX = 0, curY = 0, startX = 0, startY = 0;
    
    path.commands.forEach(cmd => {
      if (cmd.type === 'M') {
        curX = cmd.x; curY = cmd.y;
        startX = cmd.x; startY = cmd.y;
      } else if (cmd.type === 'L') {
        segments.push({ p1: { x: curX, y: curY }, p2: { x: cmd.x, y: cmd.y } });
        curX = cmd.x; curY = cmd.y;
      } else if (cmd.type === 'Z') {
        segments.push({ p1: { x: curX, y: curY }, p2: { x: startX, y: startY } });
      }
    });

    const { x1, y1, x2, y2 } = glyph.getBoundingBox();
    const glyphWidth = (x2 - x1) * scale;
    const glyphHeight = (y2 - y1) * scale;
    const width = Math.max(1, Math.round((glyphWidth / glyphHeight) * ROWS));
    
    setCols(width);
    const newGrid = Array(ROWS).fill(null).map((_, r) => {
      return Array(width).fill(null).map((_, c) => {
        const testX = x1 * scale + ((c + 0.5) / width) * glyphWidth;
        const testY = -(y2 * scale - ((r + 0.5) / ROWS) * glyphHeight);
        
        let count = 0;
        for (const seg of segments) {
          if (((seg.p1.y <= testY && testY < seg.p2.y) || (seg.p2.y <= testY && testY < seg.p1.y)) &&
              (testX < (seg.p2.x - seg.p1.x) * (testY - seg.p1.y) / (seg.p2.y - seg.p1.y + 0.000001) + seg.p1.x)) {
            count++;
          }
        }
        return count % 2 !== 0;
      });
    });
    setGrid(newGrid);
  };

  const loadFromJSON = (input: string, target: "main" | "ghost") => {
    try {
      const lines = JSON.parse(input);
      if (!Array.isArray(lines)) throw new Error("Invalid format");
      
      const width = Math.max(...lines.map(l => l.length));
      if (target === "main") setCols(width);
      
      const newGrid = Array(ROWS).fill(null).map((_, r) => {
        const line = lines[r] || "";
        return Array(target === "main" ? width : Math.max(width, cols)).fill(null).map((_, c) => line[c] === "█");
      });
      
      if (target === "main") setGrid(newGrid);
      else setGhostGrid(newGrid);
    } catch (e) {
      alert("Error loading JSON: " + (e as any).message);
    }
  };

  const generateJSON = () => {
    const lines = grid.map(row => 
      row.map(cell => (cell ? "█" : " ")).join("")
    );
    return JSON.stringify(lines, null, 2);
  };

  const downloadJSON = () => {
    const data = {
      char: char || "?",
      glyphs: grid.map(row => row.map(cell => (cell ? "█" : " ")).join(""))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fidel-${char || "unknown"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="builder-container">
      <header>
        <h1>Fidel Builder 🎨</h1>
        <div className={`save-indicator ${isAutoSaving ? "visible" : ""}`}>Saving...</div>
      </header>
      <p>Draw your character and export for JSON font maps.</p>

      <div className="main-layout">
        <div className="left-panel">
          <div className="controls">
            <div className="control-group">
              <label>Character: </label>
              <input 
                type="text" 
                value={char} 
                onChange={(e) => setChar(e.target.value)} 
                placeholder="e.g. ሁ"
                maxLength={1}
              />
            </div>
            <div className="control-group">
              <label>Width: </label>
              <input 
                type="number" 
                value={cols} 
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))} 
              />
            </div>
            <button onClick={clearGrid} className="btn-danger">Reset</button>
          </div>

          <div className="grid-container" style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
            {grid.map((row, r) => 
              row.map((cell, c) => {
                const isGhost = ghostGrid?.[r]?.[c];
                return (
                  <div 
                    key={`${r}-${c}`} 
                    className={`cell ${cell ? "active" : ""} ${isGhost ? "ghost" : ""}`} 
                    onClick={() => toggleCell(r, c)}
                    onMouseEnter={(e) => e.buttons === 1 && toggleCell(r, c)}
                  />
                );
              })
            )}
          </div>

          <div className="load-ghost-controls">
            <h3>Font Import & Layers</h3>
            <div className="control-group font-upload">
              <label>Font File (.ttf/.otf): </label>
              <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} />
              <button 
                onClick={renderFromFont} 
                className="btn-primary" 
                disabled={!loadedFont || !char}
              >
                Render '{char || "?"}' from Font
              </button>
            </div>
            <div className="control-group row">
              <input 
                type="text" 
                placeholder="Paste glyph JSON array here..." 
                value={loadInput}
                onChange={(e) => setLoadInput(e.target.value)}
              />
              <button onClick={() => loadFromJSON(loadInput, "main")}>Import</button>
              <button onClick={() => loadFromJSON(loadInput, "ghost")} className="btn-secondary">Ghost Layer</button>
              <button onClick={() => setGhostGrid(null)} className="btn-danger-outline">Clear Ghost</button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="preview-section">
            <h3>Live ASCII Preview</h3>
            <div className="ascii-preview">
              {grid.map((row, r) => (
                <div key={r} className="preview-line">
                  {row.map(cell => (cell ? "█" : " ")).join("")}
                </div>
              ))}
            </div>
          </div>

          <div className="output-section">
            <h3>JSON Code Fragment</h3>
            <pre>
              {`"${char || "?"}": ${generateJSON()},`}
            </pre>
            <div className="button-group">
              <button 
                onClick={() => navigator.clipboard.writeText(`"${char || "?"}": ${generateJSON()},`)}
                className="btn-primary"
              >
                Copy Code
              </button>
              <button onClick={downloadJSON} className="btn-secondary">
                Download .json
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
