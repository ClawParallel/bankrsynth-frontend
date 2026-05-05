"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./agent.module.css";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AgentPage() {
  const [messages, setMessages] = useState<string[]>([
    "▸ BankrSynth node initialized.",
    "▸ Connected to Base execution layer.",
    "▸ Awaiting deployment command.",
  ]);

  const [input, setInput] = useState("");
  const [ca, setCa] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  /* ===== MATRIX RAIN ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 16;
    const letters = "01";
    let drops: number[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const cols = Math.floor(canvas!.width / fontSize);
      drops = Array(cols).fill(1);
    }

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "#00ff88";
      ctx.font = fontSize + "px monospace";

      drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas!.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const interval = setInterval(draw, 40);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ===== AUTO SCROLL ===== */
  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, agentTyping]);

  /* ===== SEND ===== */
  const sendMessage = async () => {
    if (!input.trim() || agentTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, `👤 YOU: ${userMsg}`]);
    setInput("");
    setAgentTyping(true);

    try {
      const res = await fetch(`${API}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("server");

      const data = await res.json();

      const agentReply =
        data?.message || data?.reply || data?.response || data?.content;

      const deployedCA =
        data?.deployResult?.tokenAddress || data?.deployResult?.address;

      setTimeout(() => {
        setAgentTyping(false);

        if (agentReply) {
          setMessages(prev => [...prev, `▸ AGENT: ${agentReply}`]);
        }

        if (deployedCA) {
          setMessages(prev => [
            ...prev,
            "✔ Deployment successful. Asset live on Base.",
          ]);
          setCa(deployedCA);
        } else if (!agentReply) {
          setMessages(prev => [...prev, "✖ Deployment failed. No address returned."]);
        }
      }, 1800);
    } catch {
      setAgentTyping(false);
      setMessages(prev => [
        ...prev,
        "✖ Connection failed. Check network or try again.",
      ]);
    }
  };

  const copyCA = () => {
    if (!ca) return;
    navigator.clipboard.writeText(ca);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.overlay}>
        {/* NAV */}
        <div className="w-full max-w-[900px] mb-4">
          <Nav />
        </div>

        <h1 className={styles.title}>BANKRSYNTH</h1>
        <p className={styles.subtitle}>AUTONOMOUS AGENT — BASE DEPLOYMENT NODE</p>

        <div className={styles.chatbox}>
          <div ref={messagesRef} className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.startsWith("✖")
                    ? "text-red-400"
                    : msg.startsWith("✔")
                    ? "text-green-400"
                    : ""
                }
              >
                {msg}
              </div>
            ))}

            {agentTyping && (
              <div className={styles.typing}>
                ▸ analyzing<span className={styles.dots} />
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Deploy a token..."
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={agentTyping}
            />
            <button onClick={sendMessage} disabled={agentTyping}>
              EXECUTE
            </button>
          </div>
        </div>

        {ca && (
          <div className={styles.tokenPanel}>
            <div className={styles.tokenTitle}>✔ DEPLOYED TOKEN</div>
            <div className={styles.ca}>{ca}</div>
            <button className={styles.copyBtn} onClick={copyCA}>
              {copied ? "COPIED!" : "COPY CA"}
            </button>
            <div className={styles.links}>
              <a
                href={`https://basescan.org/token/${ca}`}
                target="_blank"
                rel="noreferrer"
                className={styles.primaryBtn}
              >
                VIEW ON BASESCAN
              </a>
              <a
                href={`https://www.geckoterminal.com/base/tokens/${ca}`}
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryBtn}
              >
                VIEW ON GECKOTERMINAL
              </a>
              <a
                href={`https://swap.bankr.bot/?outputToken=${ca}`}
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryBtn}
              >
                BANKR SWAP
              </a>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          BankrSynth Autonomous Execution Layer • Base Network
        </div>
      </div>
    </div>
  );
}
