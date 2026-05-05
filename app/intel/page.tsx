"use client";

import { useEffect, useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL;

type Narrative = {
  topic?: string;
  title?: string;
  description?: string;
  summary?: string;
  score?: number;
  trend?: string;
};

const BOOT_LINES = [
  "> connecting to narrative feed...",
  "> scanning Base chain activity...",
  "> indexing trending topics...",
  "> feed ready.",
];

export default function IntelPage() {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const scan = async () => {
    setLoading(true);
    setError(null);
    setNarratives([]);
    setBootLines([]);

    let i = 0;
    const bootId = setInterval(() => {
      if (i < BOOT_LINES.length - 1) {
        setBootLines(prev => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(bootId);
      }
    }, 600);

    try {
      let data: any;

      const narrativesRes = await fetch(`${API}/narratives`);
      if (narrativesRes.ok) {
        data = await narrativesRes.json();
      } else {
        const agentRes = await fetch(`${API}/agent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "scan narratives" }),
        });
        if (!agentRes.ok) throw new Error("server");
        data = await agentRes.json();
      }

      clearInterval(bootId);
      setBootLines(BOOT_LINES);

      const items: Narrative[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.narratives)
        ? data.narratives
        : Array.isArray(data?.topics)
        ? data.topics
        : data?.message
        ? [{ topic: "FEED RESPONSE", description: data.message }]
        : [];

      setNarratives(items);
      setLastScanned(new Date().toLocaleTimeString());
    } catch {
      clearInterval(bootId);
      setError("✖ Connection failed. Check network or try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    scan();
  }, []);

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono">
      <MatrixRain />
      <Nav />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="border border-green-400 mb-6 shadow-[0_0_30px_#00ff9c55]">
          <div className="flex items-center gap-2 border-b border-green-400 p-2">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <div className="w-3 h-3 border border-green-400 rounded-full" />
            <div className="w-3 h-3 border border-green-400 rounded-full" />
            <span className="ml-4 text-xs opacity-60">bankrsynth://intel</span>
          </div>

          <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl glow-text tracking-widest">NARRATIVE SCANNER</h1>
              <p className="text-xs opacity-50 mt-1">
                {lastScanned ? `Last scanned: ${lastScanned}` : "Scanning Base chain activity..."}
              </p>
            </div>
            <button
              onClick={scan}
              disabled={loading}
              className="border border-green-400 px-5 py-2 text-sm hover:bg-green-400 hover:text-black transition-colors tracking-widest disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "SCANNING..." : "RESCAN"}
            </button>
          </div>
        </div>

        {/* BOOT OUTPUT */}
        {loading && bootLines.length > 0 && (
          <div className="terminal-panel mb-6 text-sm space-y-1">
            {bootLines.map((line, i) => (
              <p key={i} className="opacity-80">{line}</p>
            ))}
            {loading && (
              <p className="opacity-50 animate-pulse">&gt; █</p>
            )}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="terminal-panel mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* NARRATIVE FEED */}
        {!loading && narratives.length > 0 && (
          <div className="space-y-3">
            {narratives.map((n, i) => {
              const title = n.topic || n.title || `NARRATIVE_${String(i + 1).padStart(2, "0")}`;
              const body = n.description || n.summary || "";
              const score = n.score;
              const trend = n.trend;

              return (
                <div key={i} className="terminal-panel text-sm group">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="opacity-40 text-xs">{String(i + 1).padStart(2, "0")}.</span>
                      <span className="glow-text tracking-wide text-base">{title.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {trend && (
                        <span
                          className={`text-xs px-2 py-0.5 border ${
                            trend === "UP"
                              ? "border-green-400 text-green-400"
                              : "border-red-400 text-red-400"
                          }`}
                        >
                          {trend}
                        </span>
                      )}
                      {score !== undefined && (
                        <span className="text-xs opacity-50 border border-green-400/30 px-2 py-0.5">
                          score: {score}
                        </span>
                      )}
                    </div>
                  </div>
                  {body && (
                    <p className="mt-2 opacity-70 leading-relaxed text-xs sm:text-sm">{body}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && narratives.length === 0 && (
          <div className="terminal-panel text-center">
            <p className="opacity-50 text-sm">&gt; No narratives found. Try rescanning.</p>
          </div>
        )}

      </div>
    </main>
  );
}
