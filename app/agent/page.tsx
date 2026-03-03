"use client";

import { useEffect, useRef, useState } from "react";

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "🤖 BankrSynth: SYSTEM ONLINE. AWAITING COMMAND."
  ]);
  const [ca, setCa] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ================= MATRIX ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "01";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) drops[i] = 1;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff88";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
          drops[i] = 0;

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);
    return () => clearInterval(interval);
  }, []);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `👤 YOU: ${input}`]);

    try {
      const res = await fetch(
        "https://bankrsynth-backend-production.up.railway.app/agent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input })
        }
      );

      const data = await res.json();

      const deployedCA =
        data?.deployResult?.tokenAddress ||
        data?.deployResult?.address ||
        null;

      if (!deployedCA) {
        setMessages((prev) => [...prev, "❌ Deployment failed"]);
      } else {
        setMessages((prev) => [
          ...prev,
          "🤖 BankrSynth: Deployment successful."
        ]);
        setCa(deployedCA);
      }
    } catch {
      setMessages((prev) => [...prev, "❌ Agent offline"]);
    }

    setInput("");
  };

  return (
    <div className="relative min-h-screen text-white font-mono">

      {/* MATRIX CANVAS */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 opacity-20"
      />

      <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-black/90 backdrop-blur-md">

        {/* LOGO */}
        <div className="w-24 h-24 rounded-full mb-4 shadow-[0_0_40px_#00e0ff] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-2xl">
          🤖
        </div>

        {/* TITLE */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          BANKRSYNTH
        </h1>

        <p className="opacity-70 mt-3 mb-8 text-center max-w-xl">
          AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
        </p>

        {/* CHATBOX */}
        <div className="w-full max-w-2xl bg-black/50 backdrop-blur-xl p-6 rounded-2xl border border-cyan-400/30 shadow-[0_0_40px_rgba(0,224,255,0.15)]">

          {/* MESSAGES */}
          <div className="h-64 overflow-y-auto text-left mb-4 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>

          {/* INPUT */}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deploy a token..."
              className="flex-1 p-3 rounded-lg bg-[#0b0f1a] outline-none"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold"
            >
              Deploy
            </button>
          </div>
        </div>

        {/* TOKEN PANEL */}
        {ca && (
          <div className="w-full max-w-2xl mt-8 bg-black/50 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/40">

            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              DEPLOYED TOKEN
            </h2>

            <div className="bg-[#0b0f1a] p-3 rounded text-xs break-all mb-4">
              {ca}
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={`https://basescan.org/token/${ca}`}
                target="_blank"
                className="text-center py-2 rounded bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold"
              >
                VIEW ON BASESCAN
              </a>

              <a
                href={`https://www.geckoterminal.com/base/tokens/${ca}`}
                target="_blank"
                className="text-center py-2 rounded border border-cyan-400/30"
              >
                VIEW ON GECKOTERMINAL
              </a>
            </div>
          </div>
        )}

        <div className="mt-10 opacity-50 text-xs text-center">
          Powered by Bankr • Base • Autonomous Agent Infrastructure
        </div>
      </div>
    </div>
  );
}