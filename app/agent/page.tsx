"use client";

import { useEffect, useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";

const API = process.env.NEXT_PUBLIC_API_URL;

const QUICK_CMDS = [
  "deploy a meme coin",
  "deploy a utility token",
  "generate a token idea",
  "scan narratives",
];

type Msg =
  | { type: "user"; text: string }
  | { type: "agent"; text: string }
  | { type: "deploy"; ca: string; name?: string };

export default function AgentPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { type: "agent", text: "BankrSynth node initialized. Connected to Base. Awaiting command." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput("");
    setMessages((p) => [...p, { type: "user", text: msg }]);
    setTyping(true);

    try {
      const res = await fetch(`${API}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error("server");
      const data = await res.json();

      const agentText = data?.message || data?.reply || data?.response || data?.content;
      const ca = data?.deployResult?.tokenAddress || data?.deployResult?.address;

      setTimeout(() => {
        setTyping(false);
        if (agentText) setMessages((p) => [...p, { type: "agent", text: agentText }]);
        if (ca)         setMessages((p) => [...p, { type: "deploy", ca, name: data?.deployResult?.name }]);
        if (!agentText && !ca)
          setMessages((p) => [...p, { type: "agent", text: "✖ No response from agent. Try again." }]);
      }, 1500);
    } catch {
      setTyping(false);
      setMessages((p) => [
        ...p,
        { type: "agent", text: "✖ Connection failed. Check network or try again." },
      ]);
    }
  };

  const copyCA = (ca: string) => {
    navigator.clipboard.writeText(ca);
    setCopied(ca);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="page-wrapper">
      <MatrixRain />

      <div className="relative z-10 min-h-screen pt-16 pb-0 flex flex-col max-w-3xl mx-auto px-4">

        {/* Page header */}
        <div className="py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p
              className="text-xs tracking-[0.25em] mb-0.5"
              style={{ color: "rgba(0,255,156,0.3)" }}
            >
              BANKRSYNTH:// AGENT_NODE
            </p>
            <h1
              className="text-lg tracking-[0.2em] glow-text-soft font-mono uppercase"
              style={{ color: "#00ff9c" }}
            >
              AUTONOMOUS AGENT
            </h1>
          </div>
          <div
            className="panel flex items-center gap-2 px-3 py-1.5"
            style={{ fontSize: "11px" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00ff9c", boxShadow: "0 0 6px #00ff9c" }}
            />
            <span className="tracking-widest" style={{ color: "rgba(0,255,156,0.55)" }}>
              BASE LIVE
            </span>
          </div>
        </div>

        {/* Quick commands */}
        <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
          {QUICK_CMDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => send(cmd)}
              disabled={typing}
              className="quick-cmd font-mono"
            >
              &gt; {cmd}
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className="flex-1 panel flex flex-col min-h-0 mb-0">
          <div className="panel-header flex-shrink-0">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">AGENT TERMINAL</span>
            <button
              onClick={() => setMessages([{ type: "agent", text: "Session cleared. Ready." }])}
              className="ml-auto text-xs muted hover:text-green-400 transition-colors tracking-widest"
            >
              [CLEAR]
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: "calc(100vh - 320px)", minHeight: 280 }}
          >
            {messages.map((msg, i) => {
              if (msg.type === "user") {
                return (
                  <div key={i} className="flex justify-end slide-right">
                    <div className="max-w-[85%]">
                      <p
                        className="text-xs text-right mb-1 tracking-widest"
                        style={{ color: "rgba(0,255,156,0.4)" }}
                      >
                        YOU ▸
                      </p>
                      <div
                        className="panel p-3 text-sm"
                        style={{ borderRight: "2px solid rgba(0,255,156,0.5)" }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.type === "deploy") {
                return (
                  <div key={i} className="slide-left">
                    <p
                      className="text-xs mb-1 tracking-widest"
                      style={{ color: "rgba(0,255,156,0.4)" }}
                    >
                      ▸ AGENT
                    </p>
                    <div className="panel-bright p-4 space-y-3">
                      <p
                        className="tracking-[0.2em] text-sm text-success"
                        style={{ textShadow: "0 0 10px rgba(0,255,156,0.7)" }}
                      >
                        ✔ DEPLOYMENT RESULT
                      </p>
                      <div
                        className="pt-3 space-y-1 text-xs"
                        style={{ borderTop: "1px solid rgba(0,255,156,0.15)" }}
                      >
                        {msg.name && (
                          <p>
                            <span className="muted">NAME:    </span>
                            {msg.name}
                          </p>
                        )}
                        <p>
                          <span className="muted">NETWORK: </span>Base Mainnet
                        </p>
                        <p className="break-all">
                          <span className="muted">CA:      </span>
                          <span style={{ color: "#00ff9c" }}>{msg.ca}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: copied === msg.ca ? "✔ COPIED" : "COPY CA", action: () => copyCA(msg.ca), href: undefined },
                          { label: "BASESCAN", href: `https://basescan.org/token/${msg.ca}`, action: undefined },
                          { label: "TRADE",    href: `https://swap.bankr.bot/?outputToken=${msg.ca}`, action: undefined },
                        ].map(({ label, action, href }) =>
                          href ? (
                            <a
                              key={label}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary no-underline text-xs text-center"
                              style={{ width: "auto", padding: "6px 14px" }}
                            >
                              {label}
                            </a>
                          ) : (
                            <button
                              key={label}
                              onClick={action!}
                              className="btn-primary text-xs"
                              style={{ width: "auto", padding: "6px 14px" }}
                            >
                              {label}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="slide-left">
                  <p
                    className="text-xs mb-1 tracking-widest"
                    style={{ color: "rgba(0,255,156,0.4)" }}
                  >
                    ▸ AGENT
                  </p>
                  <div
                    className={`panel p-3 text-sm leading-relaxed ${
                      msg.text.startsWith("✖") ? "text-error" : ""
                    }`}
                    style={msg.text.startsWith("✖") ? {} : { color: "#00ff9c" }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="slide-left">
                <p
                  className="text-xs mb-1 tracking-widest"
                  style={{ color: "rgba(0,255,156,0.4)" }}
                >
                  ▸ AGENT
                </p>
                <div className="panel p-3 text-sm muted">
                  processing<span className="cursor-blink">_</span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div
            className="p-4 flex gap-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(0,255,156,0.15)" }}
          >
            <div className="flex-1 flex items-center gap-2">
              <span
                className="text-xs flex-shrink-0"
                style={{ color: "rgba(0,255,156,0.35)" }}
              >
                &gt;
              </span>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none font-mono text-sm"
                style={{
                  color: "#00ff9c",
                }}
                placeholder="deploy a meme coin about..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={typing}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={typing || !input.trim()}
              className="btn-primary text-xs"
              style={{ width: "auto", padding: "8px 20px" }}
            >
              EXECUTE
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
