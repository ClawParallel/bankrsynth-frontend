"use client";
import { useState, useEffect, useRef } from "react";

export default function AgentPage() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // AUTO SCROLL
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // BOOT SEQUENCE
  useEffect(() => {
    const boot = async () => {
      const lines = [
        "[BOOT] Initializing blacksite node...",
        "[AUTH] Partner API handshake complete",
        "[NETWORK] Base mainnet locked",
        "[LLM] Agent cognition online",
        "[ACCESS] Level: PARTNER",
        "[STATUS] Awaiting intent..."
      ];

      for (let line of lines) {
        await new Promise(r => setTimeout(r, 600));
        setLogs(prev => [...prev, line]);
      }

      setBooted(true);
    };

    boot();
  }, []);

  // MATRIX RAIN
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
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
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

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  const execute = async () => {
    if (!message) return;

    setLoading(true);
    setTokenAddress(null);

    setLogs(prev => [
      ...prev,
      `[INTENT] ${message}`,
      "[PARSE] Extracting parameters...",
      "[COGNITION] Generating metadata...",
      "[PAYLOAD] Constructing deploy payload...",
      "[EXECUTION] Broadcasting transaction..."
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
        setLogs(prev => [...prev, "[ERROR] Execution failed"]);
        setLoading(false);
        return;
      }

      setLogs(prev => [
        ...prev,
        "[CONFIRMATION] Block confirmed",
        `[ASSET] ${ca}`,
        "[MARKET] Live on Base"
      ]);

      setTokenAddress(ca);
    } catch {
      setLogs(prev => [...prev, "[ERROR] Agent failure"]);
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-black text-emerald-500 font-mono p-6 overflow-hidden">

      {/* MATRIX CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-10 pointer-events-none"
      />

      {/* CRT SCANLINES */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.08)_50%)] bg-[size:100%_4px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl tracking-widest text-emerald-400 animate-pulse">
            BANKRSYNTH NODE_01
          </h1>
          <p className="text-xs text-emerald-700 mt-2">
            Autonomous Market Execution Layer — BASE
          </p>
          <p className="text-xs text-emerald-800 mt-1">
            ACCESS LEVEL: PARTNER
          </p>
        </div>

        {/* TERMINAL */}
        <div className="border border-emerald-900 p-6 bg-black/80 shadow-[0_0_40px_rgba(0,255,100,0.15)]">

          <div
            ref={logRef}
            className="h-80 overflow-y-auto text-sm space-y-1 mb-6"
          >
            {logs.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {loading && <p>[PENDING] Awaiting confirmation...</p>}
          </div>

          {booted && (
            <>
              <div className="flex items-center">
                <span className="mr-2 text-emerald-600">&gt;</span>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-black outline-none text-emerald-400"
                  placeholder="Enter intent..."
                />
                <span className="animate-pulse ml-1">█</span>
              </div>

              <button
                onClick={execute}
                className="mt-4 w-full border border-emerald-800 py-2 hover:bg-emerald-900/20 transition"
              >
                EXECUTE
              </button>
            </>
          )}

          {tokenAddress && (
            <div className="mt-6 border border-emerald-800 p-4 text-xs space-y-3">
              <p>[ASSET ACCESS]</p>

              <a
                href={`https://basescan.org/token/${tokenAddress}`}
                target="_blank"
                className="block border border-emerald-900 py-2 text-center hover:bg-emerald-900/20"
              >
                OPEN BASESCAN
              </a>

              <a
                href={`https://www.geckoterminal.com/base/tokens/${tokenAddress}`}
                target="_blank"
                className="block border border-emerald-900 py-2 text-center hover:bg-emerald-900/20"
              >
                OPEN GECKOTERMINAL
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}