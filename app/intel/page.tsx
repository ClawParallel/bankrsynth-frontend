"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK: Narrative[] = [
  { title: "AI AGENTS",      desc: "Autonomous on-chain agents gaining traction on Base",    strength: 92 },
  { title: "BASE ECOSYSTEM", desc: "TVL and developer activity surging on Base",              strength: 84 },
  { title: "MEME META",      desc: "Cultural tokens driving community-led narratives",        strength: 71 },
  { title: "DePIN",          desc: "Decentralized physical infrastructure growing",           strength: 63 },
  { title: "RESTAKING",      desc: "Yield optimization via restaking protocols",              strength: 58 },
  { title: "SOCIAL FI",      desc: "On-chain social platforms and identity emerging",         strength: 47 },
];

type Narrative = { title: string; desc: string; strength: number };

const SCAN_LINES = [
  "connecting to narrative feeds",
  "scanning Base activity",
  "processing signal data",
  "ranking narratives",
];

function getStrengthConfig(s: number) {
  if (s > 80) return { label: "HIGH",  color: "#00ff9c", borderColor: "rgba(0,255,156,0.45)", bg: "rgba(0,255,156,0.06)" };
  if (s > 60) return { label: "MED",   color: "#ffcc00", borderColor: "rgba(255,204,0,0.45)",  bg: "rgba(255,204,0,0.05)" };
  return             { label: "LOW",   color: "rgba(0,255,156,0.4)", borderColor: "rgba(0,255,156,0.2)", bg: "rgba(0,255,156,0.02)" };
}

function SignalBar({ strength }: { strength: number }) {
  const { color } = getStrengthConfig(strength);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: "rgba(0,255,156,0.4)" }}>
        <span className="tracking-widest">SIGNAL</span>
        <span>{strength}%</span>
      </div>
      <div className="signal-bar">
        <div
          className="signal-bar-fill"
          style={{
            width: `${strength}%`,
            background: `linear-gradient(90deg, ${color}44, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

export default function IntelPage() {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lastScan, setLastScan]     = useState("");
  const [fallback, setFallback]     = useState(false);

  const scan = async () => {
    setLoading(true);
    setFallback(false);

    try {
      let parsed: Narrative[] | null = null;

      try {
        const r = await fetch(`${API}/narratives`, { signal: AbortSignal.timeout(6000) });
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d) && d.length > 0)   parsed = d;
          else if (Array.isArray(d?.narratives))   parsed = d.narratives;
          else if (Array.isArray(d?.topics))       parsed = d.topics;
        }
      } catch { /* fallthrough */ }

      if (!parsed) {
        try {
          const r = await fetch(`${API}/agent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "scan crypto narratives trending on Base now" }),
            signal: AbortSignal.timeout(10000),
          });
          if (r.ok) {
            const d = await r.json();
            if (Array.isArray(d))              parsed = d;
            else if (Array.isArray(d?.narratives)) parsed = d.narratives;
          }
        } catch { /* fallthrough */ }
      }

      if (parsed && parsed.length > 0) {
        setNarratives(
          parsed.map((n: any) => ({
            title:    n.title    ?? n.topic ?? n.name ?? "UNKNOWN",
            desc:     n.desc     ?? n.description ?? n.summary ?? "",
            strength: n.strength ?? n.score ?? Math.floor(Math.random() * 60) + 30,
          }))
        );
      } else {
        setNarratives(FALLBACK);
        setFallback(true);
      }
    } catch {
      setNarratives(FALLBACK);
      setFallback(true);
    }

    setLastScan(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => { scan(); }, []); // eslint-disable-line

  return (
    <main className="page-wrapper min-h-screen pt-16 pb-12 px-4 sm:px-8">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p
            className="text-xs tracking-[0.25em] mb-1"
            style={{ color: "rgba(0,255,156,0.3)" }}
          >
            BANKRSYNTH://
          </p>
          <h1
            className="text-xl tracking-[0.2em] glow-text-soft font-mono uppercase"
            style={{ color: "#00ff9c" }}
          >
            NARRATIVE SCANNER
          </h1>
          {fallback && (
            <p
              className="text-xs mt-1 tracking-widest"
              style={{ color: "#ffcc00", textShadow: "0 0 8px rgba(255,204,0,0.4)" }}
            >
              ⚠ CACHED DATA — live feed unavailable
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span
              className="text-xs tracking-widest font-mono"
              style={{ color: "rgba(0,255,156,0.35)" }}
            >
              LAST SCAN: {lastScan}
            </span>
          )}
          <button
            onClick={scan}
            disabled={loading}
            className="btn-primary text-xs"
            style={{ width: "auto", padding: "8px 20px" }}
          >
            {loading ? "SCANNING..." : "↺ RESCAN"}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="max-w-5xl mx-auto panel panel-scan p-6 space-y-2">
          <div className="panel-header -mx-6 -mt-6 mb-4">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">SCANNING FEEDS</span>
          </div>
          {SCAN_LINES.map((s, i) => (
            <p
              key={i}
              className="text-xs muted fade-in"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span style={{ color: "rgba(0,255,156,0.35)" }}>[{String(i + 1).padStart(2, "0")}]</span>{" "}
              {s}...
            </p>
          ))}
          <span style={{ color: "#00ff9c" }} className="cursor-blink">_</span>
        </div>
      )}

      {/* Results grid */}
      {!loading && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {narratives.map((n, i) => {
            const { label, color, borderColor, bg } = getStrengthConfig(n.strength);
            return (
              <div
                key={i}
                className="panel panel-card p-4 fade-in relative"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Rank + title + badge */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <p
                      className="text-[10px] tracking-widest mb-0.5"
                      style={{ color: "rgba(0,255,156,0.3)" }}
                    >
                      #{String(i + 1).padStart(2, "0")}
                    </p>
                    <p
                      className="text-sm tracking-[0.15em] font-bold"
                      style={{ color: "#00ff9c" }}
                    >
                      {n.title}
                    </p>
                  </div>
                  <span
                    className="text-[10px] px-2 py-1 border tracking-widest flex-shrink-0 font-bold"
                    style={{ color, borderColor, background: bg }}
                  >
                    {label}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: "rgba(0,255,156,0.45)" }}
                >
                  {n.desc}
                </p>

                {/* Signal bar */}
                <SignalBar strength={n.strength} />
              </div>
            );
          })}
        </div>
      )}

    </main>
  );
}
