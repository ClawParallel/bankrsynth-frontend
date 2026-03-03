"use client";
import { useState, useEffect, useRef } from "react";

export default function AgentPage() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // MATRIX RAIN (SUBTLE)
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

      ctx.fillStyle = "#00ff41";
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

  useEffect(() => {
    if (logRef.current)
      logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const execute = async () => {
    if (!message) return;

    setLoading(true);
    setTokenAddress(null);

    setLogs(prev => [
      ...prev,
      `> ${message}`,
      "> parsing intent...",
      "> generating deployment payload...",
      "> broadcasting to base..."
    ]);

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
        setLogs(prev => [...prev, "> execution failed"]);
        setLoading(false);
        return;
      }

      setLogs(prev => [
        ...prev,
        "> confirmed",
        `> contract: ${ca}`,
        "> market live"
      ]);

      setTokenAddress(ca);
    } catch {
      setLogs(prev => [...prev, "> agent failure"]);
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-black text-green-400 font-mono flex items-center justify-center px-6">

      {/* MATRIX BACKGROUND */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-10 pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-3xl">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl tracking-widest">
            BANKRSYNTH
          </h1>
          <p className="text-sm opacity-60 mt-2">
            Execution Node — Base
          </p>
        </div>

        {/* TERMINAL BOX */}
        <div className="border border-green-500 bg-black/80 p-8 shadow-[0_0_40px_#00ff9c33]">

          <div
            ref={logRef}
            className="h-64 overflow-y-auto text-sm space-y-1 mb-6"
          >
            {logs.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {loading && <p> awaiting confirmation...</p>}
          </div>

          {/* INPUT */}
          <div className="flex items-center border-t border-green-500 pt-4">
            <span className="mr-2">&gt;</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-black outline-none"
              placeholder="enter command..."
            />
          </div>

          <button
            onClick={execute}
            className="mt-4 w-full border border-green-500 py-2 hover:bg-green-500 hover:text-black transition"
          >
            EXECUTE
          </button>

          {/* LINKS */}
          {tokenAddress && (
            <div className="mt-6 border-t border-green-500 pt-4 space-y-3 text-xs">

              <a
                href={`https://basescan.org/token/${tokenAddress}`}
                target="_blank"
                className="block border border-green-500 py-2 text-center hover:bg-green-500 hover:text-black"
              >
                VIEW ON BASESCAN
              </a>

              <a
                href={`https://www.geckoterminal.com/base/tokens/${tokenAddress}`}
                target="_blank"
                className="block border border-green-500 py-2 text-center hover:bg-green-500 hover:text-black"
              >
                VIEW ON GECKOTERMINAL
              </a>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}