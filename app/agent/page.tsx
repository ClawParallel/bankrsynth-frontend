"use client";

import { useEffect, useRef, useState } from "react";

export default function AgentPage() {
  const [messages, setMessages] = useState<string[]>([
    "🤖 BankrSynth: SYSTEM ONLINE. AWAITING COMMAND."
  ]);
  const [input, setInput] = useState("");
  const [ca, setCa] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  /* ================= MATRIX RAIN ================= */
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

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, `👤 YOU: ${input}`]);

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
        setMessages(prev => [...prev, "❌ Deployment failed"]);
      } else {
        setMessages(prev => [
          ...prev,
          "🤖 BankrSynth: Deployment successful."
        ]);
        setCa(deployedCA);
      }
    } catch {
      setMessages(prev => [...prev, "❌ Agent offline"]);
    }

    setInput("");
  };

  const copyCA = () => {
    if (!ca) return;
    navigator.clipboard.writeText(ca);
    alert("CA copied");
  };

  return (
    <div style={{ fontFamily: "'Share Tech Mono', monospace" }}>
      {/* MATRIX CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1
        }}
      />

      <div
        style={{
          background: "rgba(5,7,15,0.92)",
          minHeight: "100vh",
          padding: "30px 20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white"
        }}
      >
        {/* LOGO */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            marginBottom: 16,
            boxShadow: "0 0 40px #00e0ff",
            background:
              "linear-gradient(90deg,#00e0ff,#7a5cff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28
          }}
        >
          🤖
        </div>

        {/* TITLE */}
        <div
          style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: 46,
            letterSpacing: 3,
            background:
              "linear-gradient(90deg,#00e0ff,#7a5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          BANKRSYNTH
        </div>

        <div style={{ opacity: 0.7, marginBottom: 28 }}>
          AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
        </div>

        {/* CHATBOX */}
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(18px)",
            padding: 20,
            borderRadius: 18,
            border: "1px solid rgba(0,224,255,0.25)",
            boxShadow: "0 0 40px rgba(0,224,255,0.15)"
          }}
        >
          <div
            ref={messagesRef}
            style={{
              height: 260,
              overflowY: "auto",
              textAlign: "left",
              marginBottom: 14,
              fontSize: 14
            }}
          >
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deploy a token..."
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                border: "none",
                background: "#0b0f1a",
                color: "white",
                outline: "none"
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "14px 22px",
                border: "none",
                borderRadius: 10,
                background:
                  "linear-gradient(90deg,#00e0ff,#7a5cff)",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "Orbitron, sans-serif"
              }}
            >
              Deploy
            </button>
          </div>
        </div>

        {/* TOKEN PANEL */}
        {ca && (
          <div
            style={{
              marginTop: 24,
              width: "100%",
              maxWidth: 720,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(18px)",
              padding: 18,
              borderRadius: 16,
              border:
                "1px solid rgba(122,92,255,0.4)"
            }}
          >
            <div
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: 20,
                marginBottom: 6,
                background:
                  "linear-gradient(90deg,#7a5cff,#00e0ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              DEPLOYED TOKEN
            </div>

            <div
              style={{
                background: "#0b0f1a",
                padding: 10,
                borderRadius: 8,
                fontSize: 12,
                wordBreak: "break-all",
                marginBottom: 10
              }}
            >
              {ca}
            </div>

            <button onClick={copyCA} style={{ marginBottom: 12 }}>
              COPY CA
            </button>

            <div>
              <a
                href={`https://basescan.org/token/${ca}`}
                target="_blank"
              >
                VIEW ON BASESCAN
              </a>
            </div>

            <br />

            <div>
              <a
                href={`https://www.geckoterminal.com/base/tokens/${ca}`}
                target="_blank"
              >
                VIEW ON GECKOTERMINAL
              </a>
            </div>
          </div>
        )}

        <div style={{ marginTop: 36, opacity: 0.5, fontSize: 12 }}>
          Powered by Bankr • Base • Autonomous Agent Infrastructure
        </div>
      </div>
    </div>
  );
}