"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL;

const QUICK_COMMANDS = [
  "deploy token",
  "scan narrative",
  "analyze market",
  "generate idea",
];

type Msg = {
  role: "user" | "agent" | "deploy";
  text: string;
  ca?: string;
  timestamp?: string;
};

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "agent", text: "BankrSynth node initialized. Connected to Base execution layer. Awaiting command.", timestamp: "00:00" },
  ]);
  const [input, setInput] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msgCount, setMsgCount] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Matrix rain (very dim) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 16;
    let drops: number[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      drops = Array(Math.floor(canvas!.width / fontSize)).fill(1);
    }
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "rgba(0,255,136,0.15)";
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", i * fontSize, y * fontSize);
        if (y * fontSize > canvas!.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const id = setInterval(draw, 50);
    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);

  /* ── Auto scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentTyping]);

  /* ── Send ── */
  const sendMessage = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || agentTyping) return;

    setMessages((p) => [...p, { role: "user", text: userMsg, timestamp: now() }]);
    setInput("");
    setAgentTyping(true);
    setMsgCount((c) => c + 1);

    try {
      const res = await fetch(`${API}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("server");
      const data = await res.json();

      const agentText = data?.message || data?.reply || data?.response || data?.content;
      const deployedCA = data?.deployResult?.tokenAddress || data?.deployResult?.address;

      setTimeout(() => {
        setAgentTyping(false);

        if (agentText) {
          setMessages((p) => [...p, { role: "agent", text: agentText, timestamp: now() }]);
          setMsgCount((c) => c + 1);
        }

        if (deployedCA) {
          setMessages((p) => [
            ...p,
            { role: "deploy", text: data?.deployResult?.name || "Token", ca: deployedCA, timestamp: now() },
          ]);
          setMsgCount((c) => c + 1);
        } else if (!agentText) {
          setMessages((p) => [
            ...p,
            { role: "agent", text: "✖ Deployment failed. No contract address returned.", timestamp: now() },
          ]);
          setMsgCount((c) => c + 1);
        }
      }, 1600);
    } catch {
      setAgentTyping(false);
      setMessages((p) => [
        ...p,
        { role: "agent", text: "✖ Connection failed. Check network or try again.", timestamp: now() },
      ]);
      setMsgCount((c) => c + 1);
    }
  };

  const copyCA = (ca: string) => {
    navigator.clipboard.writeText(ca);
    setCopied(ca);
    setTimeout(() => setCopied(null), 1500);
  };

  const clearChat = () => {
    setMessages([{ role: "agent", text: "Session cleared. Ready for new commands.", timestamp: now() }]);
    setMsgCount(1);
  };

  return (
    <div className="h-screen flex flex-col bg-black font-mono overflow-hidden relative">
      {/* dim canvas bg */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.5 }} />

      <Nav />

      {/* LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative z-10" style={{ paddingTop: 48 }}>

        {/* ── SIDEBAR ── */}
        <aside
          className={`
            flex-shrink-0 flex-col border-r font-mono text-xs overflow-y-auto
            ${sidebarOpen ? "flex" : "hidden"} lg:flex
          `}
          style={{
            width: 240,
            borderColor: "rgba(0,255,156,0.15)",
            background: "rgba(0,0,0,0.95)",
          }}
        >
          {/* AGENT STATUS */}
          <div className="p-4 space-y-1" style={{ borderBottom: "1px solid rgba(0,255,156,0.1)" }}>
            <p className="section-label mb-3">◈ AGENT STATUS</p>
            <div className="flex justify-between">
              <span style={{ color: "rgba(0,255,156,0.5)" }}>Node</span>
              <span className="flex items-center gap-1" style={{ color: "var(--green)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--green)" }} />
                ONLINE
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "rgba(0,255,156,0.5)" }}>Network</span>
              <span style={{ color: "var(--green)" }}>Base</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "rgba(0,255,156,0.5)" }}>Tasks</span>
              <span style={{ color: "var(--green)" }}>{agentTyping ? "1 running" : "0 queued"}</span>
            </div>
          </div>

          {/* QUICK COMMANDS */}
          <div className="p-4" style={{ borderBottom: "1px solid rgba(0,255,156,0.1)" }}>
            <p className="section-label mb-3">QUICK COMMANDS</p>
            <div className="space-y-2">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => sendMessage(cmd)}
                  disabled={agentTyping}
                  className="w-full text-left px-3 py-2 text-xs transition-all duration-150 disabled:opacity-40"
                  style={{
                    color: "rgba(0,255,156,0.7)",
                    border: "1px solid rgba(0,255,156,0.15)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--green)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,156,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "rgba(0,255,156,0.7)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,156,0.15)";
                  }}
                >
                  &gt; {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* SESSION LOG */}
          <div className="p-4">
            <p className="section-label mb-3">SESSION LOG</p>
            <p style={{ color: "rgba(0,255,156,0.4)" }}>Messages: {msgCount}</p>
          </div>
        </aside>

        {/* ── MAIN CHAT ── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* CHAT HEADER */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(0,255,156,0.15)", background: "rgba(0,0,0,0.8)" }}
          >
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-xs px-2 py-1 transition-colors"
                style={{ border: "1px solid rgba(0,255,156,0.3)", color: "var(--green)" }}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? "✕" : "☰"}
              </button>
              <div>
                <p
                  className="text-xs tracking-widest"
                  style={{ color: "var(--green)", textShadow: "0 0 8px var(--green)" }}
                >
                  BANKRSYNTH AGENT
                </p>
                <p className="text-xs" style={{ color: "rgba(0,255,156,0.4)" }}>
                  BASE DEPLOYMENT NODE
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-xs transition-colors"
              style={{ color: "rgba(0,255,156,0.4)" }}
              title="Clear chat"
            >
              [CLEAR]
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => {
              if (msg.role === "user") {
                return (
                  <div key={i} className="flex justify-end animate-slide-in">
                    <div className="max-w-[80%]">
                      <div
                        className="text-xs mb-1 text-right"
                        style={{ color: "rgba(0,255,156,0.4)" }}
                      >
                        YOU ▸ {msg.timestamp}
                      </div>
                      <div
                        className="px-4 py-3 text-sm"
                        style={{
                          background: "rgba(0,255,156,0.05)",
                          border: "1px solid rgba(0,255,156,0.25)",
                          borderRight: "3px solid var(--green)",
                          color: "var(--green)",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.role === "deploy") {
                return (
                  <div key={i} className="animate-slide-in">
                    <div
                      className="p-4 text-xs space-y-2"
                      style={{
                        border: "1px solid rgba(0,255,156,0.3)",
                        background: "rgba(0,255,156,0.03)",
                        borderLeft: "3px solid var(--green)",
                      }}
                    >
                      <p
                        className="tracking-widest text-sm"
                        style={{ color: "var(--green)", textShadow: "0 0 8px var(--green)" }}
                      >
                        ✔ DEPLOYMENT RESULT
                      </p>
                      <div
                        className="my-1"
                        style={{ borderTop: "1px solid rgba(0,255,156,0.15)" }}
                      />
                      <p style={{ color: "rgba(0,255,156,0.7)" }}>
                        Token deployed on Base
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ color: "rgba(0,255,156,0.5)" }}>CA:</span>
                        <span
                          className="break-all"
                          style={{ color: "var(--green)" }}
                        >
                          {msg.ca}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => copyCA(msg.ca!)}
                          className="terminal-btn-sm"
                        >
                          {copied === msg.ca ? "COPIED!" : "COPY CA"}
                        </button>
                        <a
                          href={`https://basescan.org/token/${msg.ca}`}
                          target="_blank"
                          rel="noreferrer"
                          className="terminal-btn-sm no-underline"
                        >
                          BASESCAN
                        </a>
                        <a
                          href={`https://www.geckoterminal.com/base/tokens/${msg.ca}`}
                          target="_blank"
                          rel="noreferrer"
                          className="terminal-btn-sm no-underline"
                        >
                          GECKO
                        </a>
                        <a
                          href={`https://swap.bankr.bot/?outputToken=${msg.ca}`}
                          target="_blank"
                          rel="noreferrer"
                          className="terminal-btn-sm no-underline"
                        >
                          TRADE
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              /* agent */
              return (
                <div key={i} className="animate-slide-in max-w-[85%]">
                  <div
                    className="text-xs mb-1"
                    style={{ color: "rgba(0,255,156,0.4)" }}
                  >
                    ▸ AGENT {msg.timestamp}
                  </div>
                  <div
                    className="px-4 py-3 text-sm"
                    style={{
                      background: "rgba(0,255,156,0.03)",
                      border: "1px solid rgba(0,255,156,0.2)",
                      borderLeft: "3px solid rgba(0,255,156,0.5)",
                      color: msg.text.startsWith("✖")
                        ? "var(--red)"
                        : "rgba(0,255,156,0.85)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* TYPING INDICATOR */}
            {agentTyping && (
              <div className="animate-slide-in max-w-[85%]">
                <div className="text-xs mb-1" style={{ color: "rgba(0,255,156,0.4)" }}>
                  ▸ AGENT
                </div>
                <div
                  className="px-4 py-3 text-sm"
                  style={{
                    background: "rgba(0,255,156,0.03)",
                    border: "1px solid rgba(0,255,156,0.2)",
                    borderLeft: "3px solid rgba(0,255,156,0.5)",
                    color: "rgba(0,255,156,0.5)",
                  }}
                >
                  processing
                  <span
                    className="inline-block"
                    style={{ animation: "blink 0.6s step-end infinite" }}
                  >
                    ...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div
            className="flex-shrink-0 px-4 py-3"
            style={{
              borderTop: "1px solid rgba(0,255,156,0.15)",
              background: "rgba(0,0,0,0.9)",
            }}
          >
            <div
              className="flex items-stretch"
              style={{ border: "1px solid rgba(0,255,156,0.3)" }}
            >
              <span
                className="flex items-center px-3 text-sm flex-shrink-0"
                style={{ color: "rgba(0,255,156,0.5)", borderRight: "1px solid rgba(0,255,156,0.2)" }}
              >
                &gt;
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="deploy a meme coin about..."
                disabled={agentTyping}
                className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                style={{
                  color: "var(--green)",
                  caretColor: "var(--green)",
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={agentTyping || !input.trim()}
                className="px-5 text-xs tracking-widest transition-all duration-200 flex-shrink-0"
                style={{
                  color: agentTyping || !input.trim() ? "rgba(0,255,156,0.3)" : "var(--green)",
                  borderLeft: "1px solid rgba(0,255,156,0.2)",
                  background: agentTyping || !input.trim() ? "transparent" : "rgba(0,255,156,0.05)",
                  cursor: agentTyping || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                EXECUTE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
