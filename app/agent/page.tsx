"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./agent.module.css";

export default function AgentPage() {
  const [messages, setMessages] = useState<string[]>([
    "▸ BankrSynth node initialized.",
    "▸ Connected to Base execution layer.",
    "▸ Awaiting deployment command."
  ]);

  const [input, setInput] = useState("");
  const [ca, setCa] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);

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
  }, [messages, agentTyping]);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    setMessages(prev => [...prev, `👤 YOU: ${userMsg}`]);
    setInput("");
    setAgentTyping(true);

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
        data?.deployResult?.address;

      setTimeout(() => {
        setAgentTyping(false);

        if (!deployedCA) {
          setMessages(prev => [...prev, "✖ Deployment failed."]);
        } else {
          setMessages(prev => [
            ...prev,
            "✔ Deployment successful. Asset live on Base."
          ]);
          setCa(deployedCA);
        }
      }, 1800);

    } catch {
      setAgentTyping(false);
      setMessages(prev => [...prev, "✖ Agent offline."]);
    }
  };

  const copyCA = () => {
    if (!ca) return;
    navigator.clipboard.writeText(ca);
    alert("CA copied");
  };

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.overlay}>
        <h1 className={styles.title}>BANKRSYNTH</h1>
        <p className={styles.subtitle}>
          AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
        </p>

        <div className={styles.chatbox}>
          <div ref={messagesRef} className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}

            {agentTyping && (
              <div className={styles.typing}>
                BankrSynth executing
                <span className={styles.dots}></span>
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deploy a token..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>EXECUTE</button>
          </div>
        </div>

        {ca && (
          <div className={styles.tokenPanel}>
            <div className={styles.tokenTitle}>DEPLOYED TOKEN</div>

            <div className={styles.ca}>{ca}</div>

            <button className={styles.copyBtn} onClick={copyCA}>
              COPY CA
            </button>

            <div className={styles.links}>
              <a
                href={`https://basescan.org/token/${ca}`}
                target="_blank"
                className={styles.primaryBtn}
              >
                VIEW ON BASESCAN
              </a>

              <a
                href={`https://www.geckoterminal.com/base/tokens/${ca}`}
                target="_blank"
                className={styles.secondaryBtn}
              >
                VIEW ON GECKOTERMINAL
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