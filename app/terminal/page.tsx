"use client";

import { useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import Nav from "@/components/Nav";

type Message = {
  role: "user" | "ai";
  content: string;
  prediction?: "UP" | "DOWN";
  trade?: { entry: number; stopLoss: number; takeProfit: number };
};

export default function TerminalPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    if (!input.trim() || loading) return;

    const token = input.trim();
    const userMsg: Message = { role: "user", content: token };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput("");

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
      const aiMsg: Message = {
        role: "ai",
        content: data.aiSummary || "No analysis available.",
        trade: data.trade,
        prediction: data.prediction,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "✖ Connection failed. Check network or try again." },
      ]);
    }

    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono flex flex-col">
      <MatrixRain />
      <Nav />

      <div className="relative z-10 flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 py-4">

        <h1 className="text-2xl sm:text-4xl mb-4 text-center glow-text tracking-widest">
          AI MARKET TERMINAL
        </h1>

        {/* MESSAGE AREA */}
        <div className="flex-1 border border-green-400 p-3 sm:p-4 overflow-y-auto mb-4 bg-black/60 backdrop-blur min-h-[50vh] max-h-[60vh]">
          {messages.length === 0 && (
            <p className="opacity-40 text-sm">
              &gt; Paste a token address to begin analysis...
            </p>
          )}

          {messages.map((m, i) => (
            <div key={i} className="mb-6">
              <div className="text-xs opacity-50 mb-1 tracking-widest">
                {m.role === "user" ? "USER" : "AI"}
              </div>

              <pre
                className={`whitespace-pre-wrap text-sm break-words ${
                  m.content.startsWith("✖") ? "text-red-400" : ""
                }`}
              >
                {m.content}
              </pre>

              {m.prediction && (
                <div
                  className={`mt-2 text-sm font-bold tracking-widest ${
                    m.prediction === "UP" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  SIGNAL: {m.prediction}
                </div>
              )}

              {m.trade && (
                <div className="mt-3 border border-green-400 p-3 text-sm space-y-1">
                  <div>ENTRY: {m.trade.entry.toFixed(6)}</div>
                  <div>STOP LOSS: {m.trade.stopLoss.toFixed(6)}</div>
                  <div>TAKE PROFIT: {m.trade.takeProfit.toFixed(6)}</div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="animate-pulse opacity-60 text-sm">
              &gt; Analyzing market conditions<span className="animate-ping">█</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="terminal-input flex-1 mt-0"
            placeholder="Paste token address..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading}
            className="border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-0 sm:mt-3"
          >
            ANALYZE
          </button>
        </div>

      </div>
    </main>
  );
}
