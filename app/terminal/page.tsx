"use client";

import { useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";

type Trade = { entry: number; stopLoss: number; takeProfit: number };
type Msg =
  | { role: "user";    content: string }
  | { role: "ai";      content: string; prediction?: "UP" | "DOWN"; trade?: Trade };

export default function TerminalPage() {
  const [input, setInput]     = useState("");
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

      {/* All content z-index 1, above rain */}
      <div className="relative z-10 h-screen flex flex-col max-w-4xl mx-auto px-4 pt-4 pb-0">

        {/* Header */}
        <div className="flex justify-between items-end mb-4 px-1 flex-shrink-0">
          <div>
            <p className="text-xs muted tracking-widest">BANKRSYNTH://</p>
            <h1 className="text-lg tracking-widest glow-text-soft">AI MARKET TERMINAL</h1>
          </div>
          <span className="text-xs muted tracking-widest hidden sm:block">
            BANKR LLM GATEWAY
          </span>
        </div>

        {/* Messages panel — solid dark bg, flex-1 */}
        <div className="flex-1 panel overflow-hidden flex flex-col min-h-0">
          <div className="panel-header flex-shrink-0">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">ANALYSIS OUTPUT</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.length === 0 && (
              <div className="space-y-1 text-xs muted">
                <p>&gt; AI MARKET TERMINAL v2.0</p>
                <p>&gt; Paste a Base token address to begin analysis.</p>
                <span className="cursor-blink text-green-400">_</span>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="space-y-2 fade-in">
                <div className="text-xs muted tracking-widest">
                  {m.role === "user" ? "YOU ▸" : "▸ AI ANALYSIS"}
                </div>

                <div className={`panel p-3 ${
                  m.role === "user" ? "border-green-400/10" : "border-green-400/25"
                }`}>
                  <pre className={`text-xs whitespace-pre-wrap font-mono leading-relaxed ${
                    m.role === "ai" && m.content.startsWith("✖")
                      ? "text-error"
                      : "text-green-400"
                  }`}>
                    {m.content}
                  </pre>

                  {m.role === "ai" && m.prediction && (
                    <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1
                                     border text-xs tracking-widest ${
                      m.prediction === "UP"
                        ? "border-green-400/40 text-success"
                        : "border-red-400/40 text-error"
                    }`}>
                      SIGNAL: {m.prediction === "UP" ? "▲" : "▼"} {m.prediction}
                    </div>
                  )}

                  {m.role === "ai" && m.trade && (
                    <div className="mt-3 border border-green-400/15 p-3">
                      <p className="text-xs muted tracking-widest mb-2">TRADE PARAMETERS</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="muted">ENTRY</p>
                          <p className="text-success">${m.trade.entry.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="muted">STOP LOSS</p>
                          <p className="text-error">${m.trade.stopLoss.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="muted">TARGET</p>
                          <p className="text-success">${m.trade.takeProfit.toFixed(6)}</p>
                        </div>
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
          <div className="border-t border-green-400/15 p-4 flex gap-3 flex-shrink-0">
            <span className="text-green-400/40 text-xs self-center flex-shrink-0">&gt;</span>
            <input
              className="flex-1 bg-transparent border-none outline-none
                         text-green-400 font-mono text-sm placeholder:text-green-400/25"
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
