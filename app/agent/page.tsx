"use client";
import { useState, useEffect, useRef } from "react";

export default function AgentPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle Matrix Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "01";
    const fontSize = 14;
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

  const execute = async () => {
    if (!message) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(
        "https://bankrsynth-backend-production.up.railway.app/agent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        }
      );

      const data = await res.json();
      const ca =
        data?.deployResult?.tokenAddress ||
        data?.deployResult?.address ||
        null;

      if (!ca) {
        setResponse("Deployment failed.");
      } else {
        setResponse(ca);
      }
    } catch {
      setResponse("Agent error.");
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-[#050b1a] text-white flex flex-col items-center px-6 py-16">

      {/* Matrix Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-10 pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-3xl">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,255,0.4)]">
            🤖
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            BANKRSYNTH
          </h1>
          <p className="mt-4 text-gray-400 tracking-widest text-sm">
            AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
          </p>
        </div>

        {/* AGENT PANEL */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0b1225]/80 p-8 shadow-[0_0_60px_rgba(0,255,255,0.2)]">

          <p className="text-gray-300 mb-6">
            🤖 BankrSynth: SYSTEM ONLINE. AWAITING COMMAND.
          </p>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Speak to the agent..."
            className="w-full rounded-xl bg-black/60 border border-cyan-400/20 p-4 text-white outline-none mb-4"
          />

          <button
            onClick={execute}
            className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90"
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>

        {/* RESULT PANEL */}
        {response && (
          <div className="mt-10 rounded-2xl border border-purple-500/30 bg-[#0b1225]/80 p-8 shadow-[0_0_60px_rgba(168,85,247,0.2)]">

            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
              DEPLOYED TOKEN
            </h2>

            <p className="text-gray-300 break-all mb-6">{response}</p>

            <div className="space-y-3 text-sm">
              <a
                href={`https://basescan.org/token/${response}`}
                target="_blank"
                className="block border border-cyan-400/30 py-2 text-center rounded-xl hover:bg-cyan-500/10"
              >
                View on BaseScan
              </a>

              <a
                href={`https://www.geckoterminal.com/base/tokens/${response}`}
                target="_blank"
                className="block border border-purple-400/30 py-2 text-center rounded-xl hover:bg-purple-500/10"
              >
                View on GeckoTerminal
              </a>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}