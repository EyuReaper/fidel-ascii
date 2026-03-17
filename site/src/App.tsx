import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Github, ExternalLink, Cpu, Palette, Layers, Box, Info } from 'lucide-react';
import { renderFidel } from './engine/render';
import standardFont from './assets/standard.fidel.json';
import { RenderOptions } from './engine/types';

const FIDEL_RAIN_CHARS = 'ሀለሐመሠረሰሸቀበተቸኀነኘአከኸወዐዘዠየደጀገጠጨጰጸፀፈፐ';

export default function App() {
  const [text, setText] = useState('ሰላም');
  const [options, setOptions] = useState<RenderOptions>({
    shadow: true,
    lightSource: 'top-left',
    border: true,
    borderStyle: 'double',
  });
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);

  const renderedASCII = useMemo(() => {
    return renderFidel(text || ' ', standardFont as any, options);
  }, [text, options]);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-terminal-green selection:text-terminal-black">
      {/* Installation Modal */}
      <AnimatePresence>
        {showInstall && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstall(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-terminal-black border-2 border-terminal-green p-1 shadow-[0_0_50px_rgba(51,255,0,0.2)]"
            >
              <div className="bg-terminal-green text-terminal-black px-4 py-2 flex justify-between items-center font-bold text-xs uppercase tracking-widest">
                <span>[ TERMINAL_INSTALL_PROTOCOL ]</span>
                <button onClick={() => setShowInstall(false)} className="hover:bg-black hover:text-terminal-green px-2 transition-colors">X</button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-terminal-green/40 uppercase font-bold">Step 01: Global Installation</p>
                  <div className="bg-black/50 border border-terminal-green/30 p-4 flex justify-between items-center group">
                    <code className="text-terminal-amber">npm install -g fidel-ascii</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('npm install -g fidel-ascii')}
                      className="text-[10px] font-bold border border-terminal-green/50 px-2 py-1 hover:bg-terminal-green hover:text-terminal-black transition-all"
                    >
                      COPY
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-terminal-green/40 uppercase font-bold">Step 02: Library Integration</p>
                  <div className="bg-black/50 border border-terminal-green/30 p-4 flex justify-between items-center group">
                    <code className="text-terminal-amber">npm install fidel-ascii</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('npm install fidel-ascii')}
                      className="text-[10px] font-bold border border-terminal-green/50 px-2 py-1 hover:bg-terminal-green hover:text-terminal-black transition-all"
                    >
                      COPY
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-terminal-green/20">
                  <p className="text-xs text-terminal-green/60 leading-relaxed italic">
                    "Deployment successful. Access the engine via the 'fidel-ascii' command or import it directly into your TypeScript modules."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRT Overlay */}
      <div className="crt-overlay" />
      <div className="fixed inset-0 bg-terminal-black pointer-events-none -z-20" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(51,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(51,255,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
      
      {/* Animated Scanline */}
      <div className="fixed top-0 left-0 w-full h-[100px] bg-[linear-gradient(to_bottom,transparent,rgba(51,255,0,0.05),transparent)] animate-scanline pointer-events-none z-50" />

      {/* Fidel Rain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none overflow-hidden -z-10">
        <FidelRain />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4 border-b border-terminal-green/30 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-terminal-green flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(51,255,0,0.5)]">
              <span className="font-bold text-lg">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter glow">FIDEL_OS v1.0.0</h1>
              <p className="text-[10px] opacity-60 uppercase tracking-widest">Neo-Abyssinia Digital Systems</p>
            </div>
          </div>
          
          <nav className="flex gap-4 md:gap-8 text-xs font-bold uppercase tracking-wider">
            <a href="#playground" className="hover:text-terminal-amber transition-colors flex items-center gap-1 group">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">[{' '}</span>
              TERMINAL
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">{' '}]</span>
            </a>
            <a href="https://github.com/eyug/fidel-ascii" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-amber transition-colors flex items-center gap-1 group">
              <Github size={14} />
              SOURCE
            </a>
            <a href="/builder" className="hover:text-terminal-amber transition-colors flex items-center gap-1 group">
              <Palette size={14} />
              BUILDER
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="mb-24 text-center md:text-left">
          <div className="w-full h-1 bg-gradient-to-right from-ethiopian-green via-ethiopian-yellow to-ethiopian-red mb-8 shadow-[0_0_10px_rgba(0,255,42,0.3)]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block border border-terminal-green/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] mb-6 bg-terminal-green/5"
              >
                Access: Authorized
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] glow">
                THE ETHIOPIC <br />
                <span className="text-terminal-amber glow-amber">ASCII ENGINE</span>
              </h2>
              
              <p className="text-lg md:text-xl text-terminal-green/80 max-w-xl mb-10 leading-relaxed font-ethiopic">
                ሀለሐመሠረሰሸቀበ — Bridging the gap between ancient Ge'ez script and modern terminal aesthetics.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => setShowInstall(true)}
                  className="bg-terminal-green text-terminal-black px-8 py-4 font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(51,255,0,0.3)] flex items-center gap-2"
                >
                  INITIATE_INSTALLATION
                  <span className={cursorVisible ? 'opacity-100' : 'opacity-0'}>_</span>
                </button>
                <button 
                  onClick={() => window.open('https://github.com/eyug/fidel-ascii', '_blank')}
                  className="border border-terminal-green/50 px-8 py-4 font-bold hover:bg-terminal-green/10 transition-all flex items-center gap-2"
                >
                  <Github size={18} />
                  VIEW_CODE
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <pre className="text-[7px] leading-[1.1] opacity-90 glow-amber text-terminal-amber font-bold">
                {`
 ███████╗██╗██████╗ ███████╗██╗          █████╗ ███████╗ ██████╗██╗██╗
 ██╔════╝██║██╔══██╗██╔════╝██║         ██╔══██╗██╔════╝██╔════╝██║██║
 █████╗  ██║██║  ██║█████╗  ██║         ███████║███████╗██║     ██║██║
 ██╔══╝  ██║██║  ██║██╔══╝  ██║         ██╔══██║╚════██║██║     ██║██║
 ██║     ██║██████╔╝███████╗███████╗    ██║  ██║███████║╚██████╗██║██║
 ╚═╝     ╚═╝╚═════╝ ╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝
                `}
              </pre>
            </div>
          </div>
        </section>

        {/* Playground Section */}
        <section id="playground" className="mb-24 scroll-mt-24">
          <div className="ascii-border group">
            <div className="absolute top-[-0.75rem] left-6 bg-terminal-black px-3 py-1 flex items-center gap-2 border border-terminal-green/50 text-[10px] font-bold tracking-widest uppercase">
              <Terminal size={12} className="text-terminal-green animate-pulse" />
              ~/fidel-ascii/playground
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 mt-4">
              {/* Controls */}
              <div className="w-full lg:w-72 space-y-6 shrink-0">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Input Text</label>
                  <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-terminal-black/50 border border-terminal-green/30 p-3 outline-none focus:border-terminal-green font-ethiopic transition-colors"
                    placeholder="Enter Ge'ez text..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Visual Config</label>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setOptions(o => ({ ...o, shadow: !o.shadow }))}
                      className={`w-full flex items-center justify-between p-3 border transition-all ${options.shadow ? 'bg-terminal-green/20 border-terminal-green text-terminal-green' : 'border-terminal-green/30 opacity-60'}`}
                    >
                      <span className="text-xs font-bold flex items-center gap-2"><Layers size={14} /> 3D SHADOW</span>
                      <span className="text-[10px]">{options.shadow ? 'ENABLED' : 'DISABLED'}</span>
                    </button>

                    <button 
                      onClick={() => setOptions(o => ({ ...o, border: !o.border }))}
                      className={`w-full flex items-center justify-between p-3 border transition-all ${options.border ? 'bg-terminal-green/20 border-terminal-green text-terminal-green' : 'border-terminal-green/30 opacity-60'}`}
                    >
                      <span className="text-xs font-bold flex items-center gap-2"><Box size={14} /> ASCII BORDER</span>
                      <span className="text-[10px]">{options.border ? 'ENABLED' : 'DISABLED'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-terminal-green/5 border border-terminal-green/20 text-[10px] opacity-60 leading-relaxed uppercase">
                  <Info size={12} className="mb-2" />
                  Stateless rendering engine. No server-side processing required. UTF-8 normalization active.
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-grow min-h-[400px] flex flex-col">
                <div className="flex-grow bg-black/80 border border-terminal-green/30 p-8 flex items-center justify-center overflow-auto relative">
                  <pre className="text-sm md:text-base glow font-bold leading-none whitespace-pre">
                    {renderedASCII}
                  </pre>
                </div>
                
                <div className="flex justify-between items-center mt-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  <span>Buffer: {text.length * 512} bits</span>
                  <div className="flex gap-4">
                    <span>Rendering: Optimized</span>
                    <span>Charset: UTF-8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <FeatureCard 
            icon={<Layers className="text-terminal-amber" />}
            title="Directional Shadows"
            description="Pronounced 3D depth using ASCII shading. Supports custom light sources for dramatic terminal banners."
            index="01"
          />
          <FeatureCard 
            icon={<Palette className="text-ethiopian-green" />}
            title="Dynamic Gradients"
            description="Full support for linear color interpolation. Apply vertical, horizontal, or angled gradients to your text."
            index="02"
          />
          <FeatureCard 
            icon={<Cpu className="text-ethiopian-red" />}
            title="Syllabic Engine"
            description="High-fidelity character map covering the complete Ge'ez syllabary, including complex combined forms."
            index="03"
          />
        </section>

        {/* Footer */}
        <footer className="border-t border-terminal-green/20 pt-12 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-2">© 2026 NEO-ABYSSINIA DIGITAL SYSTEMS</p>
              <p className="text-[10px] opacity-30">ALL RIGHTS RESERVED. ETHIOPIC ASCII ENCODING PROTOCOL 1.0.0-STABLE.</p>
            </div>
            
            <div className="flex gap-6 opacity-60">
              <a href="https://github.com/eyug/fidel-ascii" className="hover:text-terminal-green transition-colors"><Github size={20} /></a>
              <a href="#" className="hover:text-terminal-green transition-colors"><ExternalLink size={20} /></a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, index }: { icon: any, title: string, description: string, index: string }) {
  return (
    <div className="ascii-card p-8 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-[40px] font-bold opacity-5 group-hover:opacity-10 transition-opacity">
        {index}
      </div>
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4 glow">{title}</h3>
      <p className="text-sm leading-relaxed text-terminal-green/60">
        {description}
      </p>
    </div>
  );
}

function FidelRain() {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    const cols = Math.floor(window.innerWidth / 30);
    const newDrops = Array.from({ length: cols }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * -100,
      duration: Math.random() * 20 + 10,
      char: FIDEL_RAIN_CHARS[Math.floor(Math.random() * FIDEL_RAIN_CHARS.length)],
    }));
    setDrops(newDrops);
  }, []);

  return (
    <>
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          initial={{ y: `${drop.top}vh` }}
          animate={{ y: '110vh' }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute font-ethiopic text-xl"
          style={{ left: `${drop.left}%` }}
        >
          {drop.char}
        </motion.div>
      ))}
    </>
  );
}
