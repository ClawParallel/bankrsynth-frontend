"use client";
import { useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import TypingText from "@/components/TypingText";

export default function AgentPage() {
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);

    setLog(prev => [
      ...prev,
      `> ${message}`,
      "> sending to agent...",
      "> agent reasoning..."
    ]);

    const res = await fetch(
      "https://bankrsynth-backend-production.up.railway.app/agent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      }
    );

    const data = await res.json();

    setLog(prev => [
      ...prev,
      "> TOKEN IDEA GENERATED",
      `> Name: ${data.agentIdea.name}`,
      `> Symbol: ${data.agentIdea.symbol}`,
      "> Deploying...",
      `> TOKEN ADDRESS: ${data.deployResult.tokenAddress}`
    ]);

    setLoading(false);
  };

  return (
    <main className="min-h-screen p-6 text-green-400 font-mono">

      <MatrixRain />

      <h1 className="text-5xl text-center mb-8">
        AGENT TERMINAL
      </h1>

      <div className="max-w-3xl mx-auto">

        <div className="border border-green-400 bg-black/80 p-6">

          <TypingText text="> Autonomous agent online" />
          <TypingText text="> Ask anything:" />

          <input
            className="w-full mt-4 bg-black border border-green-400 p-3 outline-none"
            placeholder="Hey BankrSynth, deploy a token you think is good"
            onChange={e => setMessage(e.target.value)}
          />

          <button
            onClick={execute}
            className="mt-4 border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black"
          >
            EXECUTE
          </button>

          <div className="mt-6 space-y-1 text-sm">
            {log.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {loading && <p> processing...</p>}
          </div>

        </div>

      </div>

    </main>
  );
}