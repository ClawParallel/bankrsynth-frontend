"use client";

import { useEffect, useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ── Fallback narratives shown when API is unreachable ── */
const FALLBACK_NARRATIVES = [
  {
    topic: "AI AGENTS",
    description: "Autonomous on-chain agents dominating Base deployment activity. Projects launching agent-to-agent coordination layers.",
    trend: "UP",
    score: 94,
    tags: ["defi", "base", "agents"],
  },
  {
    topic: "MEME SUPERCYCLE",
    description: "Meme coin velocity accelerating across Base and Solana. Community-driven launches outpacing VC-backed projects.",
    trend: "UP",
    score: 88,
    tags: ["meme", "community", "base"],
  },
  {
    topic: "REAL YIELD",
    description: "Protocols offering sustainable on-chain yield seeing renewed interest. Revenue-backed tokens outperforming.",
    trend: "UP",
    score: 76,
    tags: ["defi", "yield", "revenue"],
  },
  {
    topic: "L2 WARS",
    description: "Base, Arbitrum, and zkSync competing for TVL and developer mindshare. Cross-chain bridging narrative heating up.",
    trend: "UP",
    score: 71,
    tags: ["l2", "base", "zk"],
  },
  {
    topic: "TOKEN LAUNCHES",
    description: "Fair launch and bonding curve models trending. Anti-VC sentiment driving demand for community-first distributions.",
    trend: "UP",
    score: 68,
    tags: ["launch", "fair", "defi"],
  },
  {
    topic: "SENTIMENT SHIFT",
    description: "Macro uncertainty dampening speculative appetite short-term. Smart money rotating to higher-conviction positions.",
    trend: "DOWN",
    score: 42,
    tags: ["macro", "sentiment", "risk"],
  },
];

const SCAN_LINES = [
  "> Connecting to Base chain feeds...",
  "> Scanning protocol activity...",
  "> Indexing narrative signals...",
  "> Processing sentiment data...",
  "> Feed ready.",
];

type Narrative = {
  topic?: string;
  title?: string;
  description?: string;
  summary?: string;
  score?: number;
  trend?: string;
  tags?: string[];
};

function StrengthBar({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 10);
  const color = score >= 70 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
  const label = score >= 70 ? "HIGH" : score >= 50 ? "MED" : "LOW";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span style={{ color: "rgba(0,255,156,0.45)", letterSpacing: "0.1em" }}>STRENGTH</span>
      <span style={{ color, letterSpacing: "0.05em" }}>
        {"█".repeat(filled)}{"░".repeat(10 - filled)}
      </span>
      <span style={{ color, letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );
}

export default function IntelPage() {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanLines, setScanLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [offline, setOffline] = useState(false);

  const scan = async () => {
    setLoading(true);
    setOffline(false);
    setUsingFallback(false);
    setNarratives([]);
    setScanLines([]);
    setProgress(0);

    /* Animate scan lines */
    let li = 0;
    const lineTimer = setInterval(() => {
      if (li < SCAN_LINES.length) {
        setScanLines((p) => [...p, SCAN_LINES[li]]);
        li++;
      } else {
        clearInterval(lineTimer);
      }
    }, 550);

    /* Animate progress bar over 3s */
    const startTime = Date.now();
    const progTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, (elapsed / 3000) * 100);
      setProgress(pct);
      if (pct >= 95) clearInterval(progTimer);
    }, 50);

    try {
      let data: unknown = null;
      let ok = false;

      /* Try GET /narratives first */
      try {
        const r1 = await fetch(`${API}/narratives`, { signal: AbortSignal.timeout(6000) });
        if (r1.ok) { data = await r1.json(); ok = true; }
      } catch { /* fallthrough */ }

      /* Try POST /agent with scan prompt */
      if (!ok) {
        try {
          const r2 = await fetch(`${API}/agent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "scan crypto narratives trending now" }),
            signal: AbortSignal.timeout(8000),
          });
          if (r2.ok) { data = await r2.json(); ok = true; }
        } catch { /* fallthrough */ }
      }

      clearInterval(lineTimer);
      clearInterval(progTimer);
      setProgress(100);

      if (ok && data) {
        const items: Narrative[] = Array.isArray(data)
          ? (data as Narrative[])
          : Array.isArray((data as any)?.narratives)
          ? (data as any).narratives
          : Array.isArray((data as any)?.topics)
          ? (data as any).topics
          : (data as any)?.message
          ? [{ topic: "AGENT RESPONSE", description: (data as any).message }]
          : [];

        if (items.length > 0) {
          setNarratives(items);
        } else {
          setNarratives(FALLBACK_NARRATIVES);
          setUsingFallback(true);
        }
      } else {
        setNarratives(FALLBACK_NARRATIVES);
        setUsingFallback(true);
      }
    } catch {
      clearInterval(lineTimer);
      clearInterval(progTimer);
      setProgress(100);
      setNarratives(FALLBACK_NARRATIVES);
      setUsingFallback(true);
    }

    setLastScanned(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => { scan(); }, []); // eslint-disable-line

  return (
    <div className="min-h-screen bg-black font-mono relative">
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.07 }}>
        <MatrixRain />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Nav />

        <div className="pt-16 pb-10 px-4 max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1
                className="text-lg sm:text-xl tracking-widest"
                style={{ color: "var(--green)", textShadow: "0 0 10px var(--green)" }}
              >
                ◎ NARRATIVE SCANNER
              </h1>
              <p className="text-xs mt-1" style={{ color: "rgba(0,255,156,0.4)" }}>
                {lastScanned ? `Last scanned: ${lastScanned}` : "Initializing feed..."}
                {usingFallback && (
                  <span style={{ color: "rgba(255,204,0,0.7)" }}> • CACHED DATA</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {offline && (
                <span className="badge-red">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--red)" }} />
                  SCANNER OFFLINE
                </span>
              )}
              <button
                onClick={scan}
                disabled={loading}
                className="terminal-btn-sm"
                style={{
                  padding: "8px 20px",
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "SCANNING..." : "↺ RESCAN"}
              </button>
            </div>
          </div>

          {/* SCAN ANIMATION */}
          {loading && (
            <div className="panel p-5 mb-6 space-y-2">
              <div className="space-y-1 text-xs mb-4">
                {scanLines.map((line, i) => (
                  <p
                    key={i}
                    className="animate-slide-in"
                    style={{ color: "rgba(0,255,156,0.7)" }}
                  >
                    {line}
                  </p>
                ))}
                {scanLines.length < SCAN_LINES.length && (
                  <span
                    className="inline-block"
                    style={{ animation: "blink 1s step-end infinite", color: "var(--green)" }}
                  >
                    █
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div
                className="h-px w-full relative overflow-hidden"
                style={{ background: "rgba(0,255,156,0.1)" }}
              >
                <div
                  className="h-full absolute left-0 top-0 transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    background: "var(--green)",
                    boxShadow: "0 0 8px var(--green)",
                  }}
                />
              </div>
            </div>
          )}

          {/* NARRATIVE GRID */}
          {!loading && narratives.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {narratives.map((n, i) => {
                const title = n.topic || n.title || `NARRATIVE_${String(i + 1).padStart(2, "0")}`;
                const body  = n.description || n.summary || "";
                const score = n.score ?? null;
                const trend = n.trend;
                const tags  = n.tags ?? [];

                return (
                  <div
                    key={i}
                    className="panel p-4 space-y-3 flex flex-col animate-slide-in"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs"
                          style={{ color: "rgba(0,255,156,0.35)" }}
                        >
                          #{String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="text-sm tracking-widest font-bold"
                          style={{
                            color: "var(--green)",
                            textShadow: "0 0 8px rgba(0,255,156,0.4)",
                          }}
                        >
                          {String(title).toUpperCase()}
                        </span>
                      </div>

                      {trend && (
                        <span
                          className="text-xs px-2 py-0.5 flex-shrink-0"
                          style={{
                            border: `1px solid ${trend === "UP" ? "rgba(0,255,156,0.4)" : "rgba(255,51,102,0.4)"}`,
                            color: trend === "UP" ? "var(--green)" : "var(--red)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {trend === "UP" ? "▲" : "▼"} {trend}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1px solid rgba(0,255,156,0.1)" }} />

                    {/* Body */}
                    {body && (
                      <p
                        className="text-xs leading-relaxed flex-1"
                        style={{ color: "rgba(0,255,156,0.65)" }}
                      >
                        {body}
                      </p>
                    )}

                    {/* Strength bar */}
                    {score !== null && score !== undefined && (
                      <StrengthBar score={score} />
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5"
                            style={{
                              border: "1px solid rgba(0,255,156,0.12)",
                              color: "rgba(0,255,156,0.4)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && narratives.length === 0 && !offline && (
            <div className="panel p-8 text-center">
              <p className="text-sm" style={{ color: "rgba(0,255,156,0.4)" }}>
                &gt; No narratives found. Try rescanning.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
