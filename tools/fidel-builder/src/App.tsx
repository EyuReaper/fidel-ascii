import { useState, useEffect } from "react";
import "./App.css";

const ROWS = 5;
const INITIAL_COLS = 6;

function App() {
  const [cols, setCols] = useState(INITIAL_COLS);
  const [grid, setGrid] = useState<boolean[][]>(
    Array(ROWS).fill(null).map(() => Array(INITIAL_COLS).fill(false))
  );
  const [ghostGrid, setGhostGrid] = useState<boolean[][] | null>(null);
  const [char, setChar] = useState("");
  const [loadInput, setLoadInput] = useState("");

  // Resize grid when cols change
  useEffect(() => {
    setGrid(prev => 
      Array(ROWS).fill(null).map((_, r) => 
        Array(cols).fill(null).map((_, c) => prev[r]?.[c] || false)
      )
    );
  }, [cols]);

  const toggleCell = (r: number, c: number) => {
    const newGrid = [...grid];
    newGrid[r][c] = !newGrid[r][c];
    setGrid(newGrid);
  };

  const clearGrid = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(cols).fill(false)));
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

  return (
    <div className="builder-container">
      <h1>Fidel Builder 🎨</h1>
      <p>Draw your character and copy the JSON below.</p>

      <div className="controls">
        <div className="control-group">
          <label>Target Char: </label>
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
        <button onClick={clearGrid} className="btn-clear">Clear</button>
      </div>

      <div className="load-ghost-controls">
        <div className="control-group">
          <input 
            type="text" 
            placeholder="Paste JSON here..." 
            value={loadInput}
            onChange={(e) => setLoadInput(e.target.value)}
          />
          <button onClick={() => loadFromJSON(loadInput, "main")}>Load Main</button>
          <button onClick={() => loadFromJSON(loadInput, "ghost")}>Set Ghost</button>
          <button onClick={() => setGhostGrid(null)} className="btn-clear">Clear Ghost</button>
        </div>
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
              />
            );
          })
        )}
      </div>

      <div className="output-section">
        <h3>Export for {char || "?"}:</h3>
        <pre>
          {`"${char || "?"}": ${generateJSON()},`}
        </pre>
        <button 
          onClick={() => navigator.clipboard.writeText(`"${char || "?"}": ${generateJSON()},`)}
          className="btn-copy"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}

export default App;
