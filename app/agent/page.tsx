"use client";
import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  tokenAddress?: string;
};

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🤖 BankrSynth: SYSTEM ONLINE. AWAITING COMMAND."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
      const ca =
        data?.deployResult?.tokenAddress ||
        data?.deployResult?.address ||
        null;

      if (!ca) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Deployment failed." }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Deployment successful.",
            tokenAddress: ca
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Agent error occurred." }
      ]);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050b1a] text-white flex flex-col items-center px-6 py-16">

      <div className="w-full max-w-3xl">

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            BANKRSYNTH
          </h1>
          <p className="mt-4 text-gray-400 tracking-widest text-sm">
            AUTONOMOUS AGENT — BASE DEPLOYMENT NODE
          </p>
        </div>

        {/* CHAT CONTAINER */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0b1225]/80 p-6 shadow-[0_0_60px_rgba(0,255,255,0.15)] h-[500px] flex flex-col">

          {/* CHAT MESSAGES */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                      : "bg-[#111827] border border-cyan-400/20"
                  }`}
                >
                  <p>{msg.content}</p>

                  {msg.tokenAddress && (
                    <div className="mt-3 space-y-2 text-xs">
                      <p className="break-all text-gray-400">
                        {msg.tokenAddress}
                      </p>

                      <a
                        href={`https://basescan.org/token/${msg.tokenAddress}`}
                        target="_blank"
                        className="block border border-cyan-400/30 py-1 text-center rounded-lg hover:bg-cyan-500/10"
                      >
                        View on BaseScan
                      </a>

                      <a
                        href={`https://www.geckoterminal.com/base/tokens/${msg.tokenAddress}`}
                        target="_blank"
                        className="block border border-purple-400/30 py-1 text-center rounded-lg hover:bg-purple-500/10"
                      >
                        View on GeckoTerminal
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="mt-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak to the agent..."
              className="flex-1 rounded-xl bg-black/60 border border-cyan-400/20 p-3 text-white outline-none"
            />
            <button
              onClick={sendMessage}
              className="px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}