"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "SYSTEM ONLINE. AWAITING COMMAND."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ca, setCa] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================= MATRIX ================= */
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
      ctx.fillStyle = "rgba(0,0,0,0.07)";
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

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://bankrsynth-backend-production.up.railway.app/agent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg })
        }
      );

      const data = await res.json();
      const deployedCA =
        data?.deployResult?.tokenAddress ||
        data?.deployResult?.address ||
        null;

      if (!deployedCA) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Deployment failed." }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Deployment successful." }
        ]);
        setCa(deployedCA);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Agent offline." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen font-mono text-white">

      {/* MATRIX */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 opacity-15"
      />

      <div className="min-h-screen flex flex-col items-center px-6 py-12 bg-black/90 backdrop-blur-md">

        {/* LOGO */}
        <div className="w-24 h-24 rounded-full mb-4 shadow-[0_0_40px_#00e0ff] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-2xl">
          🤖
        </div>

        {/* TITLE */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          BANKRSYNTH
        </h1>

        <p className="opacity-70 mt-3 mb-10 text-center max-w-xl">
          AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
        </p>

        {/* CHATBOX */}
        <div className="w-full max-w-3xl bg-black/50 backdrop-blur-xl p-6 rounded-3xl border border-cyan-400/30 shadow-[0_0_50px_rgba(0,224,255,0.12)] flex flex-col">

          {/* MESSAGES */}
          <div className="h-72 overflow-y-auto space-y-4 mb-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-5 py-3 rounded-2xl max-w-[70%] text-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold"
                      : "bg-[#0b0f1a] border border-cyan-400/20"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="opacity-60 text-xs block mb-1">
                      BankrSynth
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-5 py-3 rounded-2xl bg-[#0b0f1a] border border-cyan-400/20 text-sm">
                  BankrSynth is deploying<span className="animate-pulse">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deploy a token..."
              className="flex-1 p-4 rounded-xl bg-[#0b0f1a] outline-none text-sm"
            />

            <button
              onClick={sendMessage}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold transition hover:opacity-90"
            >
              Deploy
            </button>
          </div>
        </div>

        {/* TOKEN PANEL */}
        {ca && (
          <div className="w-full max-w-3xl mt-10 bg-black/50 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/40">

            <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              DEPLOYED TOKEN
            </h2>

            <div className="bg-[#0b0f1a] p-3 rounded text-xs break-all mb-6">
              {ca}
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={`https://basescan.org/token/${ca}`}
                target="_blank"
                className="text-center py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold"
              >
                VIEW ON BASESCAN
              </a>

              <a
                href={`https://www.geckoterminal.com/base/tokens/${ca}`}
                target="_blank"
                className="text-center py-3 rounded-xl border border-cyan-400/30"
              >
                VIEW ON GECKOTERMINAL
              </a>
            </div>
          </div>
        )}

        <div className="mt-12 opacity-50 text-xs text-center">
          Powered by Bankr • Base • Autonomous Agent Infrastructure
        </div>
      </div>
    </div>
  );
}