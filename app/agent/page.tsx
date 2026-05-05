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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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

      <div className="relative z-10 min-h-screen pt-16 pb-0
                      flex flex-col max-w-3xl mx-auto px-4">

        {/* Page header */}
        <div className="py-5 text-center flex-shrink-0">
          <h1 className="text-2xl tracking-widest glow-text-soft">BANKRSYNTH</h1>
          <p className="text-xs muted tracking-widest mt-1">
            AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
          </p>
        </div>

        {/* Quick commands */}
        <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
          {QUICK_CMDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => send(cmd)}
              disabled={typing}
              className="text-xs px-3 py-1.5 border border-green-400/20
                         text-green-400/50 hover:text-green-400 hover:border-green-400/50
                         transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
              onClick={() => setMessages([{ type: "agent", text: "Session cleared." }])}
              className="ml-auto text-xs muted hover:text-green-400 transition-colors"
            >
              [CLEAR]
            </button>
          </div>

          {/* Messages */}
          <div
            ref={(el) => { if (el) endRef.current && el.scrollTo({ top: el.scrollHeight }); }}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ maxHeight: "calc(100vh - 340px)", minHeight: 280 }}
          >
            {messages.map((msg, i) => {
              if (msg.type === "user") {
                return (
                  <div key={i} className="flex justify-end fade-in">
                    <div className="max-w-[85%]">
                      <p className="text-xs muted text-right mb-1">YOU ▸</p>
                      <div className="panel p-3 border-r-2 border-r-green-400/60 text-sm">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.type === "deploy") {
                return (
                  <div key={i} className="fade-in">
                    <p className="text-xs muted mb-1">▸ AGENT</p>
                    <div className="panel-bright p-4 space-y-3">
                      <p className="text-success tracking-widest text-sm">✔ DEPLOYMENT RESULT</p>
                      <div className="border-t border-green-400/15 pt-3 space-y-1 text-xs">
                        {msg.name && (
                          <p><span className="muted">NAME:    </span>{msg.name}</p>
                        )}
                        <p><span className="muted">NETWORK: </span>Base Mainnet</p>
                        <p className="break-all">
                          <span className="muted">CA:      </span>
                          <span className="text-green-400">{msg.ca}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => copyCA(msg.ca)} className="btn-primary py-1.5 text-xs"
                                style={{ width: "auto", padding: "6px 14px" }}>
                          {copied === msg.ca ? "COPIED!" : "COPY CA"}
                        </button>
                        <a href={`https://basescan.org/token/${msg.ca}`}
                           target="_blank" rel="noreferrer"
                           className="btn-primary py-1.5 text-xs no-underline"
                           style={{ width: "auto", padding: "6px 14px" }}>
                          BASESCAN
                        </a>
                        <a href={`https://swap.bankr.bot/?outputToken=${msg.ca}`}
                           target="_blank" rel="noreferrer"
                           className="btn-primary py-1.5 text-xs no-underline"
                           style={{ width: "auto", padding: "6px 14px" }}>
                          TRADE
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              /* agent */
              return (
                <div key={i} className="fade-in">
                  <p className="text-xs muted mb-1">▸ AGENT</p>
                  <div className={`panel p-3 text-sm leading-relaxed ${
                    msg.text.startsWith("✖") ? "text-error" : "text-green-400"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="fade-in">
                <p className="text-xs muted mb-1">▸ AGENT</p>
                <div className="panel p-3 text-sm muted">
                  processing<span className="cursor-blink">_</span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-green-400/15 p-4 flex gap-3 flex-shrink-0">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-green-400/40 text-xs flex-shrink-0">&gt;</span>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none
                           text-green-400 font-mono text-sm placeholder:text-green-400/25"
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
