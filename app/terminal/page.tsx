"use client";

import { useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import TypingText from "@/components/TypingText";

export default function TerminalPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("https://x402.bankr.bot/0xa8682fc423b9aa04bd11e76ab01fba5bd2d5c91a/synth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: input })
      });

      const data = await res.json();

      const aiMsg = {
        role: "assistant",
        content: data.aiSummary || "No analysis available",
        trade: data.trade,
        prediction: data.prediction
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error fetching analysis"
        }
      ]);
    }

    setLoading(false);
    setInput("");
  };

  return (
    <main className="min-h-screen p-6 text-green-400 font-mono">
      <MatrixRain />

      <div className="relative z-10 max-w-4xl mx-auto">

        <h1 className="text-4xl mb-6 text-center">
          <TypingText text="AI TRADING TERMINAL" />
        </h1>

        <div className="border border-green-400 p-4 h-[60vh] overflow-y-auto mb-4 bg-black/40 backdrop-blur">
          {messages.map((m, i) => (
            <div key={i} className="mb-6">
              <div className="text-xs opacity-60 mb-1">
                {m.role === "user" ? "USER" : "AI"}
              </div>

              <pre className="whitespace-pre-wrap">{m.content}</pre>

              {m.prediction && (
                <div
                  className={`mt-2 font-bold ${
                    m.prediction === "UP"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  SIGNAL: {m.prediction}
                </div>
              )}

              {m.trade && (
                <div className="mt-3 border border-green-400 p-3 text-sm">
                  <div>ENTRY: {m.trade.entry.toFixed(6)}</div>
                  <div>STOP LOSS: {m.trade.stopLoss.toFixed(6)}</div>
                  <div>TAKE PROFIT: {m.trade.takeProfit.toFixed(6)}</div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="animate-pulse opacity-70">
              Analyzing market conditions...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 p-3 bg-black border border-green-400 text-green-400 outline-none"
            placeholder="Paste token address..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={send}
            className="px-6 border border-green-400 hover:bg-green-400 hover:text-black transition"
          >
            ANALYZE
          </button>
        </div>

      </div>
    </main>
  );
}