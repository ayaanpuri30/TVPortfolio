"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { House, ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CirclePlay, GripHorizontal } from "lucide-react";

/**
 * TV Portfolio – single-file React component
 * ------------------------------------------------------
 * Features
 * - Home screen that mimics a TV UI with horizontal rows (About, Experience, Projects, Hobbies)
 * - Keyboard navigation (arrow keys + Enter/Backspace)
 * - On-screen Remote that also controls navigation (Home, Back, D-pad, OK)
 * - Channel view that shows a specific item; left/right to "channel surf" items
 * - URL hash sync so back/forward works (#home or #section=itemIndex)
 */


type Item = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string; // /public images or remote URLs
  description?: string;
};

type Section = {
  key: string; // used in URL hash
  label: string;
  color: string; // tailwind bg color accent
  items: Item[];
};

const SECTIONS: Section[] = [
  {
    key: "about",
    label: "About Me",
    color: "from-blue-500 to-cyan-400",
    items: [
      {
        id: "intro",
        title: "Who I Am",
        subtitle: "CS @ UC Davis | SWE/ML",
        image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=1200&auto=format&fit=crop",
        description:
          "I'm Ayaan, a CS major focused on SWE/ML. I build production web apps, AI-powered tools, and data systems. I love turning messy problems into crisp, shippable products.",
      },
      {
        id: "strengths",
        title: "Strengths",
        subtitle: "Systems, ML, Product Sense",
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop",
        description:
          "Strong in full-stack (Next.js, Python), NLP (spaCy, transformers), and distributed/data tooling. I care a lot about DX, reliability, and UX polish.",
      },
    ],
  },
  {
    key: "experience",
    label: "Work Experience",
    color: "from-fuchsia-500 to-pink-400",
    items: [
      {
        id: "kaiser",
        title: "AI/ML SWE Intern – Kaiser",
        subtitle: "SIG parser (NLP)",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
        description:
          "Built a high-accuracy prescription SIG parser using a hybrid pipeline (regex + NER + LLM), hitting 99%+ structured extraction on internal datasets.",
      },
      {
        id: "medusa",
        title: "Medusa Privacy",
        subtitle: "Blockchain privacy analytics",
        image: "https://images.unsplash.com/photo-1649972904349-6b0b4b2f0b98?q=80&w=1200&auto=format&fit=crop",
        description:
          "Contributed to privacy scoring pipelines and E2E encryption flows balancing on-chain analysis with compliance needs.",
      },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    color: "from-emerald-500 to-lime-400",
    items: [
      {
        id: "intern-hub",
        title: "Intern Hub",
        subtitle: "Next.js + RAG Agent",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
        description:
          "Full‑stack onboarding app with checklist, manager posts, and a RAG agent answering real-time onboarding questions.",
      },
      {
        id: "sig-parser",
        title: "SIG Parser",
        subtitle: "spaCy + CRF + LLM",
        image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1200&auto=format&fit=crop",
        description:
          "Chained parsing architecture for complex medication instructions with robust synonym mapping and confidence scoring.",
      },
      {
        id: "advise-me",
      	 title: "Advise.me",
        subtitle: "HackDavis – agent hub",
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1200&auto=format&fit=crop",
        description:
          "AI agents for professional advice with pluggable models and prompt-engineered personas; open source friendly design.",
      },
    ],
  },
  {
    key: "hobbies",
    label: "Hobbies",
    color: "from-orange-500 to-amber-400",
    items: [
      {
        id: "soccer-analytics",
        title: "Soccer Analytics",
        subtitle: "CV + tracking",
        image: "https://images.unsplash.com/photo-1518600506278-4e8ef466b810?q=80&w=1200&auto=format&fit=crop",
        description:
          "Working on player tracking and playstyle classification from overhead video; experimenting with homography and event detection.",
      },
      {
        id: "reading",
        title: "Reading",
        subtitle: "Tech + product",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
        description:
          "Nonfiction on engineering culture, systems, and creative process. Always looking for pragmatic ideas to ship faster.",
      },
    ],
  },
];

// -------------------- Helpers --------------------

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

type Focus = { row: number; col: number };

type ViewState =
  | { mode: "home"; focus: Focus }
  | { mode: "channel"; row: number; col: number };

function hashFromState(state: ViewState) {
  if (state.mode === "home") return "#home";
  const section = SECTIONS[state.row];
  const item = section.items[state.col];
  return `#${section.key}=${item.id}`;
}

function parseHash(): ViewState | null {
  const h = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "");
  if (!h || h === "home") return { mode: "home", focus: { row: 0, col: 0 } };
  const [key, id] = h.split("=");
  const row = SECTIONS.findIndex((s) => s.key === key);
  if (row < 0) return null;
  const col = SECTIONS[row].items.findIndex((i) => i.id === id);
  if (col < 0) return null;
  return { mode: "channel", row, col };
}

// -------------------- Components --------------------

function TvBezel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-6xl aspect-[16/9] rounded-3xl bg-neutral-900 shadow-2xl ring-8 ring-black">
      {/* Screen */}
      <div className="absolute inset-3 rounded-2xl overflow-hidden bg-black">{children}</div>
      {/* Stand */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-40 rounded-b-2xl bg-neutral-800 shadow-xl" />
    </div>
  );
}

function RowRail({
  section,
  active,
  focusedCol,
  onSelect,
}: {
  section: Section;
  active: boolean;
  focusedCol: number;
  onSelect: (col: number) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !railRef.current) return;
    const child = railRef.current.children[focusedCol] as HTMLElement | undefined;
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active, focusedCol]);

  return (
    <div className="px-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`text-sm font-medium text-white/90 px-2 py-1 rounded bg-gradient-to-r ${section.color}`}>{section.label}</div>
      </div>
      <div ref={railRef} className="flex gap-4 overflow-x-auto no-scrollbar pr-6">
        {section.items.map((item, idx) => (
          <motion.button
            key={item.id}
            onClick={() => onSelect(idx)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`relative shrink-0 w-56 h-36 rounded-xl overflow-hidden ring-2 transition-all ${
              active && focusedCol === idx ? "ring-white scale-[1.01]" : "ring-white/10"
            }`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
            <div className="absolute bottom-2 left-2 right-2 text-left">
              <div className="text-white text-sm font-semibold line-clamp-1">{item.title}</div>
              {item.subtitle && (
                <div className="text-white/80 text-xs line-clamp-1">{item.subtitle}</div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ChannelView({ row, col, onExit, setCol }: { row: number; col: number; onExit: () => void; setCol: (c: number) => void }) {
  const section = SECTIONS[row];
  const item = section.items[col];
  const total = section.items.length;

  return (
    <div className="relative h-full w-full">
      <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

      <div className="absolute bottom-0 left-0 right-0 p-6 grid md:grid-cols-[1fr_auto] gap-4 items-end">
        <div>
          <div className="text-white/90 text-xs uppercase tracking-wider">{SECTIONS[row].label}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{item.title}</h1>
          {item.subtitle && <div className="text-white/80">{item.subtitle}</div>}
          {item.description && (
            <p className="mt-3 text-white/90 max-w-2xl leading-relaxed">{item.description}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={onExit} className="px-3 py-2 rounded-lg bg-white text-black text-sm font-medium flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
            <button className="px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium flex items-center gap-2 ring-1 ring-white/20">
              <CirclePlay size={16} /> View Details
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setCol(clamp(col - 1, 0, total - 1))}
            className="p-2 rounded-full bg-white/10 ring-1 ring-white/20 text-white"
            aria-label="Previous"
          >
            <ChevronLeft />
          </button>
          <div className="text-white/80 text-sm">{col + 1} / {total}</div>
          <button
            onClick={() => setCol(clamp(col + 1, 0, total - 1))}
            className="p-2 rounded-full bg-white/10 ring-1 ring-white/20 text-white"
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function Remote({
  visible,
  onToggle,
  onHome,
  onBack,
  onArrow,
  onOk,
  onNumber,
}: {
  visible: boolean;
  onToggle: () => void;
  onHome: () => void;
  onBack: () => void;
  onArrow: (dir: "up" | "down" | "left" | "right") => void;
  onOk: () => void;
  onNumber: (n: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={onToggle}
        className="mb-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 text-white ring-1 ring-white/20 backdrop-blur"
      >
        <GripHorizontal size={16} /> {visible ? "Hide Remote" : "Show Remote"}
      </button>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-56 rounded-2xl bg-neutral-900 text-white p-4 shadow-2xl ring-1 ring-white/10"
          >
            <div className="grid grid-cols-3 gap-2">
              <button onClick={onHome} className="col-span-1 px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center gap-2"><House size={16}/>Home</button>
              <div />
              <button onClick={onBack} className="col-span-1 px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center gap-2"><ArrowLeft size={16}/>Back</button>

              <div />
              <button onClick={() => onArrow("up")} className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center"><ChevronUp/></button>
              <div />

              <button onClick={() => onArrow("left")} className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center"><ChevronLeft/></button>
              <button onClick={onOk} className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 font-semibold">OK</button>
              <button onClick={() => onArrow("right")} className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center"><ChevronRight/></button>

              <div />
              <button onClick={() => onArrow("down")} className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center"><ChevronDown/></button>
              <div />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => onNumber(n)} className="py-2 rounded-lg bg-white/5 ring-1 ring-white/10">{n}</button>
              ))}
              <div />
              <button onClick={() => onNumber(0)} className="py-2 rounded-lg bg-white/5 ring-1 ring-white/10">0</button>
              <div />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------- Main Component --------------------

export default function TVPortfolio() {
  const [state, setState] = useState<ViewState>({ mode: "home", focus: { row: 0, col: 0 } });
  const [remoteOpen, setRemoteOpen] = useState(true);

  // Sync URL hash <-> state
  useEffect(() => {
    const fromHash = parseHash();
    if (fromHash) setState(fromHash);
    const onPop = () => {
      const s = parseHash();
      if (s) setState(s);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const hash = hashFromState(state);
    if (window.location.hash !== hash) {
      history.pushState(null, "", hash);
    }
  }, [state]);

  const setFocus = (f: Focus) => setState({ mode: "home", focus: f });
  const openChannel = (row: number, col: number) => setState({ mode: "channel", row, col });

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.mode === "home") {
        const { row, col } = state.focus;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " ", "Backspace"].includes(e.key)) {
          e.preventDefault();
        }
        if (e.key === "ArrowUp") setFocus({ row: clamp(row - 1, 0, SECTIONS.length - 1), col: 0 });
        if (e.key === "ArrowDown") setFocus({ row: clamp(row + 1, 0, SECTIONS.length - 1), col: 0 });
        if (e.key === "ArrowLeft") setFocus({ row, col: clamp(col - 1, 0, SECTIONS[row].items.length - 1) });
        if (e.key === "ArrowRight") setFocus({ row, col: clamp(col + 1, 0, SECTIONS[row].items.length - 1) });
        if (e.key === "Enter" || e.key === " ") openChannel(row, col);
      } else if (state.mode === "channel") {
        if (["ArrowLeft", "ArrowRight", "Backspace", "Escape"].includes(e.key)) e.preventDefault();
        if (e.key === "ArrowLeft") setState({ ...state, col: clamp(state.col - 1, 0, SECTIONS[state.row].items.length - 1) });
        if (e.key === "ArrowRight") setState({ ...state, col: clamp(state.col + 1, 0, SECTIONS[state.row].items.length - 1) });
        if (e.key === "Backspace" || e.key === "Escape") setState({ mode: "home", focus: { row: state.row, col: state.col } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  // Remote handlers
  const remoteHandlers = useMemo(() => ({
    onHome: () => setState({ mode: "home", focus: { row: 0, col: 0 } }),
    onBack: () => {
      if (state.mode === "channel") setState({ mode: "home", focus: { row: state.row, col: state.col } });
    },
    onArrow: (dir: "up" | "down" | "left" | "right") => {
      if (state.mode === "home") {
        const { row, col } = state.focus;
        if (dir === "up") setFocus({ row: clamp(row - 1, 0, SECTIONS.length - 1), col: 0 });
        if (dir === "down") setFocus({ row: clamp(row + 1, 0, SECTIONS.length - 1), col: 0 });
        if (dir === "left") setFocus({ row, col: clamp(col - 1, 0, SECTIONS[row].items.length - 1) });
        if (dir === "right") setFocus({ row, col: clamp(col + 1, 0, SECTIONS[row].items.length - 1) });
      } else {
        if (dir === "left") setState({ ...state, col: clamp(state.col - 1, 0, SECTIONS[state.row].items.length - 1) });
        if (dir === "right") setState({ ...state, col: clamp(state.col + 1, 0, SECTIONS[state.row].items.length - 1) });
        if (dir === "up") setState({ mode: "home", focus: { row: state.row, col: state.col } });
        if (dir === "down") {/* no-op */}
      }
    },
    onOk: () => {
      if (state.mode === "home") openChannel(state.focus.row, state.focus.col);
    },
    onNumber: (n: number) => {
      // Map 1..4 to sections
      if (n >= 1 && n <= SECTIONS.length) setFocus({ row: n - 1, col: 0 });
    },
  }), [state]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white selection:bg-sky-500/40">
      <div className="py-10 flex justify-center">
        <TvBezel>
          {/* Screen Content */}
          <div className="h-full w-full relative">
            <AnimatePresence mode="wait">
              {state.mode === "home" ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 overflow-hidden"
                >
                  {/* Faux TV header */}
                  <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-gradient-to-b from-black/40 to-transparent">
                    <div className="text-lg font-semibold">Ayaan TV</div>
                    <div className="text-xs text-white/70">Use arrows / remote · Enter to open</div>
                  </div>

                  <div className="space-y-6 pb-8 overflow-y-auto h-full pt-2">
                    {SECTIONS.map((section, rIdx) => (
                      <RowRail
                        key={section.key}
                        section={section}
                        active={state.focus.row === rIdx}
                        focusedCol={state.focus.row === rIdx ? state.focus.col : -1}
                        onSelect={(cIdx) => openChannel(rIdx, cIdx)}
                      />
                    ))}
                    <div className="h-6" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="channel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <ChannelView
                    row={state.row}
                    col={state.col}
                    onExit={() => setState({ mode: "home", focus: { row: state.row, col: state.col } })}
                    setCol={(c) => setState({ ...state, col: c })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TvBezel>
      </div>

      {/* Remote */}
      <Remote
        visible={remoteOpen}
        onToggle={() => setRemoteOpen((v) => !v)}
        onHome={remoteHandlers.onHome}
        onBack={remoteHandlers.onBack}
        onArrow={remoteHandlers.onArrow}
        onOk={remoteHandlers.onOk}
        onNumber={remoteHandlers.onNumber}
      />

      {/* Footer note */}
      <div className="text-center text-white/50 text-xs pb-6">© {new Date().getFullYear()} Ayaan · Built with Next.js</div>
    </div>
  );
}
