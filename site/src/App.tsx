import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Github,
  ExternalLink,
  Cpu,
  Palette,
  Layers,
  Box,
  Info,
  Copy,
  Check,
  X,
  ShieldAlert,
  Monitor,
  Settings,
  Languages,
} from "lucide-react";
import { renderFidel } from "./engine/render";
import standardFont from "./assets/standard.fidel.json";
import { RenderOptions } from "./engine/types";

const FIDEL_RAIN_CHARS = "ሀለሐመሠረሰሸቀበተቸኀነኘአከኸወዐዘዠየደጀገጠጨጰጸፀፈፐ";

const GRADIENTS = [
  { name: "PHOSPHOR", colors: ["#33ff00", "#33ff00"], label: "PHOSPHOR_GREEN" },
  { name: "AMBER", colors: ["#ffb000", "#ffb000"], label: "TERMINAL_AMBER" },
  {
    name: "ABYSSINIA",
    colors: ["#00ff2a", "#ffe600", "#ff2a2a"],
    label: "ETHIOPIAN_FLAG",
  },
  {
    name: "CYBER",
    colors: ["#00ffff", "#0000ff", "#ff00ff"],
    label: "CYBER_PUNK",
  },
  {
    name: "VOLCANIC",
    colors: ["#ff4d00", "#ff0000", "#550000"],
    label: "ERTA_ALE",
  },
];

const TRANSLATIONS = {
  am: {
    navTerminal: "ተርሚናል",
    navSource: "ምንጭ_ኮድ",
    navSupport: "ጉርሻ_አጉርሱኝ",
    navBuilder: "ፊደል_ሰሪ",
    heroTitle: "የኢትዮጵያ",
    heroSubtitle: "ፊደል_ASCII_ሞተር",
    heroDesc:
      "ከ ሀ እስከ ፐ — የGe'ez ፊደላትን ወደ ከፍተኛ-ተፅዕኖ ASCII ባነሮች በሲኒማቲክ ቅጥ ይለውጡ።",
    heroBtnDeploy: "ሞተሩን_አሰማራ",
    heroBtnRepo: "ማከማቻ",
    statusLabel: "ሁኔታ: መስመር ላይ",
    authLevel: "ፍቃድ: ደረጃ 4",
    playgroundTitle: "የሙከራ_ቦታ://FIDEL_LABS",
    inputLabel: "ጽሑፍ ያስገቡ",
    inputPlaceholder: "እባክዎ ጽሑፍ ያስገቡ...",
    engineParams: "የሞተር መለኪያዎች",
    optShadow: "የ3D_ጥላ",
    optBorder: "የASCII_ፍሬም",
    optGradient: "ቀለም_ቀይር",
    optVertical: "ቁም_አቀማመጥ",
    optInverse: "ግልብጥ_ቀለም",
    diagnosticTitle: "የስርዓት ምርመራ",
    diagnosticText: "ሥራ ላይ ነው:: የፊደል መደበኛነት ተጠናቅቋል:: ምንም የፓኬት መጥፋት አልተገኘም::",
    installTitle: "የአሰማራ_ፕሮቶኮል // STABLE_v1.1.0",
    step1: "ደረጃ 01: ዓለም አቀፍ ተደራሽነት",
    step2: "ደረጃ 02: የላይብረሪ ውህደት",
    copy: "ቅዳ",
    copied: "ተቀድቷል",
    footerCopyright: "© 2026 ፊደል-ASCII",
    footerRights:
      "በ 🔥 በስሎ በ EyuReaper የቀረበ ። የኢትዮጵያ ASCII ኢንኮዲንግ ፕሮቶኮል 1.1.0።",
    feature1Title: "ጥልቅ ጥላዎች",
    feature1Desc:
      "በASCII ጥላ አማካኝነት ጥልቀት ይጨምሩ:: የብርሃን ምንጮችን በማስተካከል ድንቅ ባነሮችን ይፍጠሩ::",
    feature1Idx: "፩",
    feature2Title: "ተለዋዋጭ ቀለሞች",
    feature2Desc:
      "ለስላሳ የቀለም ሽግግሮችን ይተግብሩ:: በኢትዮጵያ የቀለም ስፔክትረም ውስጥ ያሉ ሽግግሮችን ይጠቀሙ::",
    feature2Idx: "፪",
    feature3Title: "የፊደል ሞተር",
    feature3Desc: "ሙሉውን የGe'ez ፊደላት ስብስብ የያዘ ሞተር:: ለተርሚናል ተነባቢነት የተመቻቸ::",
    feature3Idx: "፫",
  },
  en: {
    navTerminal: "TERMINAL",
    navSource: "SOURCE_CODE",
    navSupport: "SUPPORT_PROJECT",
    navBuilder: "GLYPH_BUILDER",
    heroTitle: "THE ETHIOPIC",
    heroSubtitle: "ASCII_ENGINE",
    heroDesc:
      "From ሀ to ፐ — Transform Ge'ez script into high-impact ASCII banners with cinematic styling.",
    heroBtnDeploy: "DEPLOY_ENGINE",
    heroBtnRepo: "REPOSITORY",
    statusLabel: "Status: Online",
    authLevel: "Authorization: Level 4",
    playgroundTitle: "SESSION://FIDEL_LABS/PLAYGROUND",
    inputLabel: "Input Data",
    inputPlaceholder: "Enter Ge'ez text...",
    engineParams: "Engine Parameters",
    optShadow: "3D_SHADOW_MAP",
    optBorder: "ASCII_FRAME_PROTOCOL",
    optGradient: "CYCLE_GRADIENT",
    optVertical: "VERTICAL_ORIENT",
    optInverse: "INVERSE_VIDEO",
    diagnosticTitle: "System Diagnostic",
    diagnosticText:
      "Stateless rendering active. Character normalization complete. No packet loss detected.",
    installTitle: "DEPLOYMENT_PROTOCOL // STABLE_v1.1.0",
    step1: "STEP_01 // Global Terminal Access",
    step2: "STEP_02 // Library Architecture Integration",
    copy: "COPY",
    copied: "COPIED",
    footerCopyright: "© 2026 NEO-ABYSSINIA DIGITAL SYSTEMS",
    footerRights:
      "COOKED WITH 🔥 & SERVED BY EyuReaper. ETHIOPIC ASCII ENCODING PROTOCOL 1.1.0-STABLE.",
    feature1Title: "Sovereign Shadows",
    feature1Desc:
      "Directional lighting effects with true 3D ASCII shading. Project depth based on virtual light sources.",
    feature2Title: "Digital Gradients",
    feature2Desc:
      "Smooth color interpolation systems. Apply harmonious transitions across the entire Ethiopic spectrum.",
    feature3Title: "Syllabic Engine",
    feature3Desc:
      "Masterfully mapped glyphs for the complete Ge'ez syllabary, optimized for terminal readability.",
  },
};

export default function App() {
  const [lang, setLang] = useState<"am" | "en">("am");
  const [text, setText] = useState("ሰላም");
  const [gradientIdx, setGradientIdx] = useState(0);
  const [options, setOptions] = useState<RenderOptions>({
    shadow: true,
    lightSource: "top-left",
    border: true,
    borderStyle: "double",
  });
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showInstall, setShowInstall] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [stars, setStars] = useState<number | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    fetch("https://api.github.com/repos/EyuReaper/fidel-ascii")
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  const renderedASCII = useMemo(() => {
    return renderFidel(text || " ", standardFont as any, options);
  }, [text, options]);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentGradient = GRADIENTS[gradientIdx];

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-terminal-green selection:text-terminal-black bg-[#050505] text-[#33ff00] font-mono">
      {/* CRT Overlay Effects */}
      <div className="crt-overlay" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(51,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(51,255,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
      <div className="fixed top-0 left-0 w-full h-[100px] bg-[linear-gradient(to_bottom,transparent,rgba(51,255,0,0.05),transparent)] animate-scanline pointer-events-none z-50" />

      {/* Fidel Rain Background */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none overflow-hidden -z-10">
        <FidelRain />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4 border-b border-terminal-green/30 pb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-terminal-green flex items-center justify-center glow shadow-[0_0:15px_rgba(51,255,0,0.3)]"
            >
              <Cpu size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter glow flex items-center gap-2">
                FIDEL_OS{" "}
                <span className="text-xs bg-terminal-green text-terminal-black px-1">
                  v1.1.0
                </span>
              </h1>
              <p className="text-[10px] opacity-60 uppercase tracking-[0.4em] font-bold">
                Neo-Abyssinia Digital Systems
              </p>
            </div>
          </div>

          <nav className="flex gap-4 md:gap-8 text-[11px] font-bold uppercase tracking-widest items-center">
            <button
              onClick={() => setLang((l) => (l === "am" ? "en" : "am"))}
              className="flex items-center gap-2 text-terminal-amber hover:bg-terminal-amber/10 px-2 py-1 border border-terminal-amber/30 transition-all"
            >
              <Languages size={14} />
              {lang === "am" ? "EN" : "አማ"}
            </button>
            <a
              href="#playground"
              className="hover:text-terminal-amber transition-all flex items-center gap-2 group border-b border-transparent hover:border-terminal-amber"
            >
              <Monitor size={14} />
              {t.navTerminal}
            </a>
            <a
              href="https://github.com/EyuReaper/fidel-ascii"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terminal-amber transition-all flex items-center gap-2 group border-b border-transparent hover:border-terminal-amber"
            >
              <Github size={14} />
              {t.navSource}
              {stars !== null && (
                <span className="ml-1 px-1.5 py-0.5 bg-terminal-green/10 border border-terminal-green/30 text-[9px] text-terminal-green group-hover:text-terminal-amber group-hover:border-terminal-amber/50 transition-all flex items-center gap-1 shadow-[0_0_5px_rgba(51,255,0,0.2)] group-hover:shadow-[0_0_5px_rgba(255,176,0,0.2)]">
                  ★ {stars}
                </span>
              )}
            </a>
            <a
              href="https://gurshaplus.com/EyuReaper"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terminal-amber transition-all flex items-center gap-2 group border-b border-transparent hover:border-terminal-amber"
            >
              <Box size={14} /> {/* Using Box icon as a placeholder for now */}
              {t.navSupport}
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="mb-24">
          <div className="h-[2px] w-full bg-gradient-to-r from-ethiopian-green via-ethiopian-yellow to-ethiopian-red mb-12 shadow-[0_0_15px_rgba(0,255,42,0.4)]" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert
                  size={14}
                  className="text-terminal-amber animate-pulse"
                />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">
                  {t.statusLabel} // {t.authLevel}
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[0.9] glow">
                {t.heroTitle} <br />
                <span className="text-terminal-amber glow-amber">
                  {t.heroSubtitle}
                </span>
              </h2>

              <p className="text-lg md:text-2xl text-terminal-green/80 max-w-xl mb-12 leading-relaxed font-ethiopic">
                {t.heroDesc}
              </p>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <button
                  onClick={() => setShowInstall(true)}
                  className="bg-terminal-green text-terminal-black px-10 py-5 font-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3 uppercase tracking-tighter text-lg"
                >
                  {t.heroBtnDeploy}
                  <span
                    className={`w-3 h-5 bg-terminal-black ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                  />
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/EyuReaper/fidel-ascii",
                      "_blank",
                    )
                  }
                  className="border-2 border-terminal-green/40 px-10 py-5 font-black hover:bg-terminal-green/10 hover:border-terminal-green transition-all flex items-center gap-3 text-lg uppercase tracking-tighter"
                >
                  <Github size={20} />
                  {t.heroBtnRepo}
                </button>
              </div>
            </motion.div>

            <div className="hidden lg:block relative group overflow-hidden">
              <div className="absolute -inset-4 border border-terminal-green/20 pointer-events-none group-hover:border-terminal-green/40 transition-colors" />
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-terminal-green" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-terminal-green" />

              {/* Animated Hero ASCII Title */}
              <motion.div
                animate={{
                  textShadow: [
                    "0 0 5px #ffb000",
                    "0 0 20px #ffb000",
                    "0 0 5px #ffb000",
                    "0 0 2px #ffb000",
                  ],
                  opacity: [0.9, 1, 0.8, 1, 0.95],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="p-8 bg-terminal-green/5 relative"
              >
                <motion.div
                  animate={{
                    filter: [
                      "hue-rotate(0deg)",
                      "hue-rotate(15deg)",
                      "hue-rotate(0deg)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <pre className="text-[9px] leading-[1.05] text-terminal-amber font-bold">
                    {`
 ███████╗██╗██████╗ ███████╗██╗          █████╗ ███████╗ ██████╗██╗██╗
 ██╔════╝██║██╔══██╗██╔════╝██║         ██╔══██╗██╔════╝██╔════╝██║██║
 █████╗  ██║██║  ██║█████╗  ██║         ███████║███████╗██║     ██║██║
 ██╔══╝  ██║██║  ██║██╔══╝  ██║         ██╔══██║╚════██║██║     ██║██║
 ██║     ██║██████╔╝███████╗███████╗    ██║  ██║███████║╚██████╗██║██║
 ╚═╝     ╚═╝╚═════╝ ╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝
                    `}
                  </pre>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-amber/5 to-transparent pointer-events-none animate-scanline h-full" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Playground Section */}
        <section id="playground" className="mb-32 scroll-mt-24">
          <div className="ascii-border p-1 bg-terminal-green/10">
            <div className="absolute top-[-0.85rem] left-8 bg-terminal-black px-4 py-1 flex items-center gap-3 border border-terminal-green text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(51,255,0,0.2)]">
              <Terminal
                size={14}
                className="text-terminal-green animate-pulse"
              />
              {t.playgroundTitle}
            </div>

            <div className="flex flex-col lg:flex-row gap-1 border border-terminal-green/30 bg-terminal-black p-6">
              {/* Controls */}
              <div className="w-full lg:w-80 space-y-8 shrink-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-terminal-green/60">
                      {t.inputLabel}
                    </label>
                    <span className="text-[9px] opacity-40 uppercase">
                      UTF-8 Encoded
                    </span>
                  </div>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-terminal-green/5 border-b-2 border-terminal-green/30 p-4 outline-none focus:border-terminal-green font-ethiopic text-xl transition-all focus:bg-terminal-green/10"
                    placeholder={t.inputPlaceholder}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-terminal-green/60">
                    <Settings size={14} />
                    {t.engineParams}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <ControlButton
                      active={options.shadow}
                      onClick={() =>
                        setOptions((o) => ({ ...o, shadow: !o.shadow }))
                      }
                      icon={<Layers size={14} />}
                      label={t.optShadow}
                    />
                    <ControlButton
                      active={options.border}
                      onClick={() =>
                        setOptions((o) => ({ ...o, border: !o.border }))
                      }
                      icon={<Box size={14} />}
                      label={t.optBorder}
                    />
                    <ControlButton
                      active={options.vertical}
                      onClick={() =>
                        setOptions((o) => ({ ...o, vertical: !o.vertical }))
                      }
                      icon={<Monitor size={14} />}
                      label={t.optVertical}
                    />
                    <ControlButton
                      active={options.inverse}
                      onClick={() =>
                        setOptions((o) => ({ ...o, inverse: !o.inverse }))
                      }
                      icon={<Layers size={14} />}
                      label={t.optInverse}
                    />
                    <button
                      onClick={() =>
                        setGradientIdx((prev) => (prev + 1) % GRADIENTS.length)
                      }
                      className="flex items-center justify-between p-4 border border-terminal-amber/30 text-terminal-amber hover:bg-terminal-amber/10 transition-all group"
                    >
                      <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest">
                        <Palette size={14} />
                        {t.optGradient}
                      </div>
                      <div className="text-[9px] opacity-50 font-mono">
                        {currentGradient.name}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-terminal-amber/5 border-l-4 border-terminal-amber text-[11px] leading-relaxed text-terminal-amber/80 uppercase">
                  <div className="flex items-center gap-2 mb-2 font-bold">
                    <Info size={14} />
                    {t.diagnosticTitle}
                  </div>
                  {t.diagnosticText}
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-grow min-h-[450px] flex flex-col bg-[#020202] border border-terminal-green/10 shadow-inner">
                <div className="flex-grow p-10 flex items-center justify-center overflow-auto scrollbar-hide">
                  <motion.pre
                    key={renderedASCII + gradientIdx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      backgroundImage:
                        currentGradient.colors.length > 1
                          ? `linear-gradient(45deg, ${currentGradient.colors.join(", ")})`
                          : "none",
                      backgroundColor:
                        currentGradient.colors.length === 1
                          ? currentGradient.colors[0]
                          : "transparent",
                      WebkitBackgroundClip:
                        currentGradient.colors.length > 1 ? "text" : "none",
                      WebkitTextFillColor:
                        currentGradient.colors.length > 1
                          ? "transparent"
                          : "inherit",
                      color:
                        currentGradient.colors.length === 1
                          ? currentGradient.colors[0]
                          : "inherit",
                      textShadow:
                        currentGradient.colors.length === 1
                          ? `0 0 10px ${currentGradient.colors[0]}44`
                          : "none", // Remove the overpowering green glow
                    }}
                    className="text-sm md:text-xl font-bold leading-none whitespace-pre select-all"
                  >
                    {renderedASCII}
                  </motion.pre>
                </div>

                <div className="flex justify-between items-center px-6 py-4 bg-terminal-green/5 border-t border-terminal-green/10 text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">
                  <div className="flex gap-6">
                    <span>
                      Width:{" "}
                      {Math.max(
                        ...renderedASCII.split("\n").map((l) => l.length),
                      )}
                      px
                    </span>
                    <span>Buffer: {text.length}ch</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
                    Live Render System
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          <FeatureCard
            icon={<Layers className="text-terminal-amber" size={32} />}
            title={t.feature1Title}
            description={t.feature1Desc}
            index="I"
          />
          <FeatureCard
            icon={<Palette className="text-ethiopian-green" size={32} />}
            title={t.feature2Title}
            description={t.feature2Desc}
            index="II"
          />
          <FeatureCard
            icon={<Cpu className="text-ethiopian-red" size={32} />}
            title={t.feature3Title}
            description={t.feature3Desc}
            index="III"
          />
        </section>

        {/* Footer */}
        <footer className="border-t border-terminal-green/20 pt-16 pb-32">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4 text-terminal-green">
                <Terminal size={18} />
                <span className="font-bold tracking-widest text-sm">
                  FIDEL_ASCII // 2026
                </span>
              </div>
              <p className="text-xs opacity-40 leading-relaxed uppercase tracking-widest mb-6">
                {t.footerRights}
              </p>
              <div className="flex gap-8 text-[11px] font-bold opacity-60">
                <a
                  href="https://www.npmjs.com/package/fidel-ascii"
                  className="hover:text-terminal-green transition-colors"
                >
                  [ NPM_REGISTRY ]
                </a>
              </div>
            </div>

            <div className="flex flex-col items-end gap-6 w-full md:w-auto">
              <div className="flex gap-6">
                <SocialLink
                  href="https://github.com/EyuReaper/fidel-ascii"
                  icon={<Github size={24} />}
                />
                <SocialLink href="#" icon={<ExternalLink size={24} />} />
              </div>
              <p className="text-[9px] opacity-20 uppercase tracking-[0.6em] text-right">
                {t.footerCopyright} <br />
                {lang === "am"
                  ? "ያልተፈቀደ ኮፒ ማድረግ በዲጂታል መበስበስ ያስቀጣል::"
                  : "Unauthorized reproduction results in digital decay."}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Installation Modal */}
      <AnimatePresence>
        {showInstall && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstall(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.95, opacity: 0, rotateX: -10 }}
              className="relative w-full max-w-3xl bg-[#0a0a0a] border-2 border-terminal-green overflow-hidden shadow-[0_0_100px_rgba(51,255,0,0.15)]"
            >
              <div className="bg-terminal-green text-terminal-black px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 font-black text-sm uppercase tracking-[0.2em]">
                  <Terminal size={18} />
                  {t.installTitle}
                </div>
                <button
                  onClick={() => setShowInstall(false)}
                  className="hover:bg-black hover:text-terminal-green p-1 transition-all rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-10">
                <InstallStep
                  num="01"
                  title={t.step1}
                  cmd="npm install -g fidel-ascii"
                  copied={copied === "npm install -g fidel-ascii"}
                  onCopy={handleCopy}
                  copyLabel={t.copy}
                  copiedLabel={t.copied}
                />

                <InstallStep
                  num="02"
                  title={t.step2}
                  cmd="npm install fidel-ascii"
                  copied={copied === "npm install fidel-ascii"}
                  onCopy={handleCopy}
                  copyLabel={t.copy}
                  copiedLabel={t.copied}
                />

                <div className="pt-8 border-t border-terminal-green/10 flex items-start gap-4">
                  <div className="mt-1">
                    <Info size={16} className="text-terminal-amber" />
                  </div>
                  <p className="text-xs text-terminal-green/50 leading-relaxed uppercase tracking-wider">
                    {lang === "am"
                      ? "መጫኑ በUnix እና POSIX-ተገዢ ስርዓቶች ላይ ተረጋግጧል። ስራ ከመጀመርዎ በፊት በስርዓትዎ ውስጥ Node.js v18.0 ወይም ከዚያ በላይ መኖሩን ያረጋግጡ።"
                      : "Installation verified across Unix and POSIX-compliant systems. Ensure Node.js v18.0 or higher is active in your environment before initiating deployment."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InstallStep({
  num,
  title,
  cmd,
  copied,
  onCopy,
  copyLabel,
  copiedLabel,
}: {
  num: string;
  title: string;
  cmd: string;
  copied: boolean;
  onCopy: (c: string) => void;
  copyLabel: string;
  copiedLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h4 className="text-[11px] font-bold text-terminal-green/50 uppercase tracking-[0.3em]">
          {title}
        </h4>
      </div>
      <div className="bg-terminal-green/5 border border-terminal-green/30 p-5 flex justify-between items-center group hover:border-terminal-green transition-colors">
        <code className="text-terminal-amber text-lg font-bold tracking-tight">
          {cmd}
        </code>
        <button
          onClick={() => onCopy(cmd)}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black border transition-all uppercase tracking-widest ${copied ? "bg-terminal-green text-terminal-black border-terminal-green" : "border-terminal-green/50 text-terminal-green hover:bg-terminal-green hover:text-terminal-black"}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between p-4 border transition-all ${active ? "bg-terminal-green text-terminal-black border-terminal-green shadow-[0_0_15px_rgba(51,255,0,0.3)]" : "border-terminal-green/30 text-terminal-green/60 hover:border-terminal-green/60"}`}
    >
      <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div
        className={`w-2 h-2 rounded-full ${active ? "bg-terminal-black shadow-[0_0_5px_rgba(0,0,0,0.5)]" : "bg-terminal-green/20"}`}
      />
    </button>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  index: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="ascii-card p-10 group relative"
    >
      <div className="absolute top-0 right-0 p-6 text-[60px] font-black text-terminal-green/5 group-hover:text-terminal-green/10 transition-colors italic">
        {index}
      </div>
      <div className="mb-8">{icon}</div>
      <h3 className="text-2xl font-black mb-4 glow tracking-tight uppercase">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-terminal-green/50 uppercase tracking-widest">
        {description}
      </p>
      <div className="mt-8 w-12 h-1 bg-terminal-green opacity-20 group-hover:w-full group-hover:opacity-100 transition-all duration-500" />
    </motion.div>
  );
}

function SocialLink({ href, icon }: { href: string; icon: any }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 border border-terminal-green/30 flex items-center justify-center text-terminal-green hover:bg-terminal-green hover:text-terminal-black hover:border-terminal-green transition-all shadow-[0_0_10px_rgba(51,255,0,0.1)] hover:shadow-[0_0_20px_rgba(51,255,0,0.4)]"
    >
      {icon}
    </a>
  );
}

function FidelRain() {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    const cols = Math.floor(window.innerWidth / 30);
    const newDrops = Array.from({ length: cols }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * -100,
      duration: Math.random() * 15 + 10,
      char: FIDEL_RAIN_CHARS[
        Math.floor(Math.random() * FIDEL_RAIN_CHARS.length)
      ],
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setDrops(newDrops);
  }, []);

  return (
    <>
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          initial={{ y: `${drop.top}vh` }}
          animate={{ y: "110vh" }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute font-ethiopic text-xl font-bold"
          style={{ left: `${drop.left}%`, opacity: drop.opacity }}
        >
          {drop.char}
        </motion.div>
      ))}
    </>
  );
}
