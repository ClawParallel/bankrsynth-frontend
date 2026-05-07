"use client";

import { useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";

type Trade = { entry: number; stopLoss: number; takeProfit: number };
type Msg =
  | { role: "user";    content: string }
  | { role: "ai";      content: string; prediction?: "UP" | "DOWN"; trade?: Trade };

export default function TerminalPage() {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const send = async () => {
    if (!input.trim() || loading) return;
    const token = input.trim();
    setMessages((p) => [...p, { role: "user", content: token }]);
    setLoading(true);
    setInput("");
    scroll();

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

    setLoading(false);
    scroll();
  };

  return (
    <main className="page-wrapper min-h-screen pt-12">
      <MatrixRain />

      <div className="relative z-10 h-screen flex flex-col max-w-4xl mx-auto px-4 pt-4 pb-0">

        {/* Header */}
        <div className="flex justify-between items-end mb-4 px-1 flex-shrink-0">
          <div>
            <p
              className="text-xs tracking-[0.25em] mb-0.5"
              style={{ color: "rgba(0,255,156,0.3)" }}
            >
              BANKRSYNTH://
            </p>
            <h1
              className="text-lg tracking-[0.2em] glow-text-soft font-mono uppercase"
              style={{ color: "#00ff9c" }}
            >
              AI MARKET TERMINAL
            </h1>
          </div>
          <span
            className="text-xs tracking-widest hidden sm:block font-mono"
            style={{ color: "rgba(0,255,156,0.3)" }}
          >
            BANKR LLM GATEWAY
          </span>
        </div>

        {/* Messages panel */}
        <div className="flex-1 panel overflow-hidden flex flex-col min-h-0">
          <div className="panel-header flex-shrink-0">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">ANALYSIS OUTPUT</span>
            <span
              className="ml-auto text-xs tracking-widest"
              style={{ color: "rgba(0,255,156,0.3)" }}
            >
              BASE_MAINNET
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.length === 0 && (
              <div className="space-y-1 text-xs muted">
                <p>&gt; AI MARKET TERMINAL v2.0</p>
                <p>&gt; Paste a Base token address to begin analysis.</p>
                <p>&gt; Returns: AI summary, signal, trade parameters.</p>
                <span style={{ color: "#00ff9c" }} className="cursor-blink">_</span>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="space-y-2 fade-in">
                <div
                  className="text-xs tracking-widest"
                  style={{ color: "rgba(0,255,156,0.4)" }}
                >
                  {m.role === "user" ? "YOU ▸" : "▸ AI ANALYSIS"}
                </div>

                <div
                  className="panel p-3"
                  style={
                    m.role === "user"
                      ? { borderColor: "rgba(0,255,156,0.1)" }
                      : { borderColor: "rgba(0,255,156,0.3)" }
                  }
                >
                  {/* AI signal badge — shown above content for AI messages */}
                  {m.role === "ai" && m.prediction && (
                    <div className="flex items-center gap-3 mb-3 pb-3"
                         style={{ borderBottom: "1px solid rgba(0,255,156,0.1)" }}>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 text-xs tracking-[0.15em] font-bold border"
                        style={
                          m.prediction === "UP"
                            ? {
                                borderColor: "rgba(0,255,156,0.5)",
                                color: "#00ff9c",
                                textShadow: "0 0 8px rgba(0,255,156,0.7)",
                                background: "rgba(0,255,156,0.06)",
                              }
                            : {
                                borderColor: "rgba(255,51,102,0.5)",
                                color: "#ff3366",
                                textShadow: "0 0 8px rgba(255,51,102,0.7)",
                                background: "rgba(255,51,102,0.06)",
                              }
                        }
                      >
                        SIGNAL: {m.prediction === "UP" ? "▲" : "▼"} {m.prediction}
                      </div>
                    </div>
                  )}

                  <pre
                    className={`text-xs whitespace-pre-wrap font-mono leading-relaxed ${
                      m.role === "ai" && m.content.startsWith("✖")
                        ? "text-error"
                        : ""
                    }`}
                    style={
                      m.role === "ai" && !m.content.startsWith("✖")
                        ? { color: "#00ff9c" }
                        : {}
                    }
                  >
                    {m.content}
                  </pre>

                  {m.role === "ai" && m.trade && (
                    <div
                      className="mt-4 p-3 space-y-2"
                      style={{ border: "1px solid rgba(0,255,156,0.15)", background: "rgba(0,255,156,0.02)" }}
                    >
                      <p
                        className="text-xs tracking-widest mb-3"
                        style={{ color: "rgba(0,255,156,0.5)" }}
                      >
                        TRADE PARAMETERS
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        {[
                          { label: "ENTRY",     value: `$${m.trade.entry.toFixed(6)}`,      color: "#00ff9c" },
                          { label: "STOP LOSS", value: `$${m.trade.stopLoss.toFixed(6)}`,   color: "#ff3366" },
                          { label: "TARGET",    value: `$${m.trade.takeProfit.toFixed(6)}`, color: "#00ff9c" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="space-y-1">
                            <p className="muted tracking-widest text-[10px]">{label}</p>
                            <p className="font-bold" style={{ color, textShadow: `0 0 6px ${color}66` }}>
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="fade-in space-y-1">
                <p className="text-xs muted tracking-widest">▸ AI ANALYSIS</p>
                <div className="panel p-3 text-xs muted space-y-1">
                  <p>&gt; scanning on-chain data...</p>
                  <p>&gt; loading market metrics...</p>
                  <p>&gt; generating signal<span className="cursor-blink">_</span></p>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="p-4 flex gap-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(0,255,156,0.15)" }}
          >
            <span
              className="text-xs self-center flex-shrink-0"
              style={{ color: "rgba(0,255,156,0.35)" }}
            >
              &gt;
            </span>
            <input
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm"
              style={{ color: "#00ff9c" }}
              placeholder="Paste token address..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="btn-primary text-xs"
              style={{ width: "auto", padding: "8px 20px" }}
            >
              ANALYZE
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
