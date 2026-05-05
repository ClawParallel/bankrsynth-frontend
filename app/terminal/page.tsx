"use client";

import { useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import Nav from "@/components/Nav";

type Trade = { entry: number; stopLoss: number; takeProfit: number };

type Message =
  | { role: "user"; content: string }
  | { role: "ai"; content: string; prediction?: "UP" | "DOWN"; trade?: Trade }
  | { role: "loading" };

const ANALYZE_LINES = [
  "> scanning on-chain data...",
  "> loading market metrics...",
  "> querying liquidity pools...",
  "> generating signal...",
];

function pct(a: number, b: number) {
  return ((b - a) / a * 100).toFixed(1);
}

export default function TerminalPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzeLines, setAnalyzeLines] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lineTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollDown = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);

  const startLoadingLines = () => {
    setAnalyzeLines([]);
    let i = 0;
    lineTimer.current = setInterval(() => {
      if (i < ANALYZE_LINES.length) {
        setAnalyzeLines((p) => [...p, ANALYZE_LINES[i]]);
        i++;
      } else {
        if (lineTimer.current) clearInterval(lineTimer.current);
      }
    }, 700);
  };

  const stopLoadingLines = () => {
    if (lineTimer.current) clearInterval(lineTimer.current);
    setAnalyzeLines([]);
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const token = input.trim();
    setMessages((p) => [...p, { role: "user", content: token }]);
    setLoading(true);
    setInput("");
    startLoadingLines();
    scrollDown();

    try {
      const res = await fetch(
        "https://x402.bankr.bot/0xa8682fc423b9aa04bd11e76ab01fba5bd2d5c91a/synth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) throw new Error("server");
      const data = await res.json();

      setMessages((p) => [
        ...p,
        {
          role: "ai",
          content: data.aiSummary || "No analysis available.",
          trade: data.trade,
          prediction: data.prediction,
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "ai", content: "✖ Connection failed. Check network or try again." },
      ]);
    }

    stopLoadingLines();
    setLoading(false);
    scrollDown();
  };

  return (
    <div
      className="h-screen flex flex-col font-mono relative overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Matrix rain — very dim, behind everything */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.12 }}>
        <MatrixRain />
      </div>

      <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
        <Nav />

        {/* PAGE HEADER */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
          style={{
            marginTop: 48,
            borderBottom: "1px solid rgba(0,255,156,0.15)",
            background: "rgba(0,0,0,0.85)",
          }}
        >
          <h1
            className="text-sm tracking-widest"
            style={{ color: "var(--green)", textShadow: "0 0 8px var(--green)" }}
          >
            ◉ AI MARKET TERMINAL
          </h1>
          <span className="text-xs hidden sm:block" style={{ color: "rgba(0,255,156,0.35)" }}>
            POWERED BY BANKR LLM GATEWAY
          </span>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div
              className="text-xs space-y-1 mt-4"
              style={{ color: "rgba(0,255,156,0.35)" }}
            >
              <p>&gt; AI MARKET TERMINAL v2.0</p>
              <p>&gt; Paste a Base token address to begin analysis.</p>
              <p className="blink-cursor">&gt;</p>
            </div>
          )}

          {messages.map((m, i) => {
            /* USER */
            if (m.role === "user") {
              return (
                <div key={i} className="animate-slide-in">
                  <div
                    className="text-xs mb-1 tracking-widest"
                    style={{ color: "rgba(0,255,156,0.45)" }}
                  >
                    YOU
                  </div>
                  <div
                    className="px-4 py-3 text-sm break-all"
                    style={{
                      border: "1px solid rgba(0,255,156,0.2)",
                      borderLeft: "3px solid rgba(0,255,156,0.5)",
                      background: "rgba(0,255,156,0.02)",
                      color: "rgba(0,255,156,0.8)",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            }

            /* AI */
            if (m.role === "ai") {
              const isError = m.content.startsWith("✖");
              return (
                <div key={i} className="animate-slide-in">
                  <div
                    className="text-xs mb-1 tracking-widest"
                    style={{ color: "rgba(0,255,156,0.45)" }}
                  >
                    ANALYSIS
                  </div>
                  <div
                    className="px-4 py-4 text-sm space-y-3"
                    style={{
                      border: `1px solid ${isError ? "rgba(255,51,102,0.25)" : "rgba(0,255,156,0.2)"}`,
                      borderLeft: `3px solid ${isError ? "var(--red)" : "var(--green)"}`,
                      background: "rgba(0,255,156,0.02)",
                    }}
                  >
                    <pre
                      className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed"
                      style={{ color: isError ? "var(--red)" : "rgba(0,255,156,0.85)" }}
                    >
                      {m.content}
                    </pre>

                    {m.prediction && (
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 text-xs tracking-widest font-bold"
                        style={{
                          border: `1px solid ${m.prediction === "UP" ? "rgba(0,255,156,0.5)" : "rgba(255,51,102,0.5)"}`,
                          color: m.prediction === "UP" ? "var(--green)" : "var(--red)",
                          background:
                            m.prediction === "UP"
                              ? "rgba(0,255,156,0.05)"
                              : "rgba(255,51,102,0.05)",
                          textShadow: `0 0 8px ${m.prediction === "UP" ? "var(--green)" : "var(--red)"}`,
                        }}
                      >
                        {m.prediction === "UP" ? "▲" : "▼"} SIGNAL: {m.prediction}
                      </div>
                    )}

                    {m.trade && (
                      <div
                        className="text-xs space-y-1 p-3"
                        style={{ border: "1px solid rgba(0,255,156,0.15)", background: "rgba(0,0,0,0.3)" }}
                      >
                        <p className="section-label mb-2">TRADE PARAMETERS</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span style={{ color: "rgba(0,255,156,0.5)" }}>ENTRY</span>
                            <p style={{ color: "var(--green)" }}>
                              ${m.trade.entry.toFixed(6)}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: "rgba(0,255,156,0.5)" }}>STOP LOSS</span>
                            <p style={{ color: "var(--red)" }}>
                              ${m.trade.stopLoss.toFixed(6)}{" "}
                              <span style={{ color: "rgba(255,51,102,0.6)", fontSize: "0.65rem" }}>
                                ({pct(m.trade.entry, m.trade.stopLoss)}%)
                              </span>
                            </p>
                          </div>
                          <div>
                            <span style={{ color: "rgba(0,255,156,0.5)" }}>TAKE PROFIT</span>
                            <p style={{ color: "var(--green)" }}>
                              ${m.trade.takeProfit.toFixed(6)}{" "}
                              <span style={{ color: "rgba(0,255,156,0.6)", fontSize: "0.65rem" }}>
                                (+{pct(m.trade.entry, m.trade.takeProfit)}%)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* LOADING CARD */}
          {loading && (
            <div className="animate-slide-in">
              <div
                className="text-xs mb-1 tracking-widest"
                style={{ color: "rgba(0,255,156,0.45)" }}
              >
                ANALYZING
              </div>
              <div
                className="px-4 py-4 text-xs space-y-1"
                style={{
                  border: "1px solid rgba(0,255,156,0.2)",
                  borderLeft: "3px solid rgba(0,255,156,0.4)",
                  background: "rgba(0,255,156,0.02)",
                }}
              >
                {analyzeLines.map((line, i) => (
                  <p
                    key={i}
                    className="animate-slide-in"
                    style={{ color: "rgba(0,255,156,0.65)" }}
                  >
                    {line}
                  </p>
                ))}
                <span
                  className="inline-block"
                  style={{ animation: "blink 1s step-end infinite", color: "var(--green)" }}
                >
                  █
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <div
          className="flex-shrink-0 px-4 sm:px-6 py-3"
          style={{
            borderTop: "1px solid rgba(0,255,156,0.15)",
            background: "rgba(0,0,0,0.92)",
          }}
        >
          <div
            className="flex items-stretch"
            style={{ border: "1px solid rgba(0,255,156,0.3)" }}
          >
            <span
              className="flex items-center px-3 text-sm flex-shrink-0"
              style={{
                color: "rgba(0,255,156,0.5)",
                borderRight: "1px solid rgba(0,255,156,0.2)",
              }}
            >
              &gt;
            </span>
            <input
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
              style={{ color: "var(--green)", caretColor: "var(--green)" }}
              placeholder="Paste token address..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-5 text-xs tracking-widest transition-all duration-200 flex-shrink-0"
              style={{
                color:
                  loading || !input.trim() ? "rgba(0,255,156,0.3)" : "var(--green)",
                borderLeft: "1px solid rgba(0,255,156,0.2)",
                background:
                  loading || !input.trim() ? "transparent" : "rgba(0,255,156,0.06)",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              ANALYZE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
