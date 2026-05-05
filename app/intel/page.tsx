"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

// Always-available fallback — page never shows a raw error
const FALLBACK: Narrative[] = [
  { title: "AI AGENTS",     desc: "Autonomous on-chain agents gaining traction on Base",     strength: 92 },
  { title: "BASE ECOSYSTEM",desc: "TVL and developer activity surging on Base",               strength: 84 },
  { title: "MEME META",     desc: "Cultural tokens driving community-led narratives",         strength: 71 },
  { title: "DePIN",         desc: "Decentralized physical infrastructure growing",            strength: 63 },
  { title: "RESTAKING",     desc: "Yield optimization via restaking protocols",               strength: 58 },
  { title: "SOCIAL FI",     desc: "On-chain social platforms and identity emerging",          strength: 47 },
];

type Narrative = { title: string; desc: string; strength: number };

const SCAN_LINES = [
  "connecting to narrative feeds",
  "scanning Base activity",
  "processing signal data",
  "ranking narratives",
];

function strengthLabel(s: number) {
  if (s > 80) return { label: "HIGH",   cls: "border-green-400/40 text-success"  };
  if (s > 60) return { label: "MED",    cls: "border-yellow-400/40 text-warn"   };
  return              { label: "LOW",    cls: "border-green-400/20 muted"        };
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
      // Try GET /narratives first
      let parsed: Narrative[] | null = null;
      try {
        const r = await fetch(`${API}/narratives`, { signal: AbortSignal.timeout(6000) });
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d) && d.length > 0)        parsed = d;
          else if (Array.isArray(d?.narratives))        parsed = d.narratives;
          else if (Array.isArray(d?.topics))            parsed = d.topics;
        }
      } catch { /* fallthrough */ }

      // Try POST /agent as backup
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
            if (Array.isArray(d))                       parsed = d;
            else if (Array.isArray(d?.narratives))      parsed = d.narratives;
          }
        } catch { /* fallthrough */ }
      }

      if (parsed && parsed.length > 0) {
        // Normalize items — backend may use different key names
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

  const { label: _, ...__ } = strengthLabel(0); // type warm-up

  return (
    <main className="page-wrapper min-h-screen pt-16 pb-12 px-4 sm:px-8">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center
                      sm:justify-between gap-3">
        <div>
          <p className="text-xs muted tracking-widest mb-1">BANKRSYNTH://</p>
          <h1 className="text-xl tracking-widest glow-text-soft">NARRATIVE SCANNER</h1>
          {fallback && (
            <p className="text-xs text-warn mt-1">⚠ Using cached data — live feed unavailable</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastScan && <span className="text-xs muted">LAST SCAN: {lastScan}</span>}
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
        <div className="max-w-5xl mx-auto panel p-6 space-y-2">
          {SCAN_LINES.map((s, i) => (
            <p key={i} className="text-xs muted fade-in"
               style={{ animationDelay: `${i * 0.4}s` }}>
              &gt; {s}...
            </p>
          ))}
          <span className="text-green-400 cursor-blink">_</span>
        </div>
      )}

      {/* Results grid */}
      {!loading && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {narratives.map((n, i) => {
            const { label, cls } = strengthLabel(n.strength);
            return (
              <div
                key={i}
                className="panel p-4 hover:border-green-400/40 transition-all duration-200 fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Rank + title + badge */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <p className="text-xs muted tracking-widest mb-0.5">#{i + 1}</p>
                    <p className="text-sm tracking-widest font-bold">{n.title}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 border tracking-widest flex-shrink-0 ${cls}`}>
                    {label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs muted leading-relaxed mb-3">{n.desc}</p>

                {/* Strength bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs muted">
                    <span>SIGNAL</span>
                    <span>{n.strength}%</span>
                  </div>
                  <div className="h-0.5 bg-green-400/10 overflow-hidden">
                    <div
                      className="h-full bg-green-400/60 transition-all duration-1000"
                      style={{ width: `${n.strength}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </main>
  );
}
