"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const deploy = async () => {
    setLoading(true);

    const res = await fetch(
      "https://bankrsynth-backend-production.up.railway.app/launch",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, symbol, description, wallet })
      }
    );

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-6">

      {/* PANEL */}
      <div className="
        w-full max-w-3xl
        border border-green-500
        p-8
        shadow-[0_0_40px_#00ff9c]
        bg-black/90
      ">

        {/* TITLE */}
        <h1 className="text-4xl md:text-5xl text-center mb-6 tracking-widest">
          BANKRSYNTH LAUNCH TERMINAL
        </h1>

        {/* TERMINAL PROMPT */}
        <p className="mb-6 text-green-300">
          {">"} bankrsynth launch --chain base
        </p>

        {/* FORM */}
        <div className="space-y-4">

          <input
            placeholder="Token Name"
            className="terminal-input"
            onChange={e => setName(e.target.value)}
          />

          <input
            placeholder="Symbol (optional)"
            className="terminal-input"
            onChange={e => setSymbol(e.target.value)}
          />

          <input
            placeholder="Description"
            className="terminal-input"
            onChange={e => setDescription(e.target.value)}
          />

          <input
            placeholder="Creator Wallet (receives fees)"
            className="terminal-input"
            onChange={e => setWallet(e.target.value)}
          />

          {/* BUTTON */}
          <button
            onClick={deploy}
            className="
              w-full
              border border-green-400
              py-3
              mt-4
              tracking-widest
              hover:bg-green-400 hover:text-black
              hover:shadow-[0_0_25px_#00ff9c]
              transition
            "
          >
            {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
          </button>
        </div>

        {/* RESULT */}
        {result?.success && (
          <div className="mt-8 border-t border-green-800 pt-6">

            <p className="mb-4">{">"} DEPLOY SUCCESS</p>

            <a
              href={`https://basescan.org/token/${result.tokenAddress}`}
              target="_blank"
              className="block underline mb-2"
            >
              View on BaseScan
            </a>

            <a
              href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
              target="_blank"
              className="block underline mb-2"
            >
              View on GeckoTerminal
            </a>

            <a
              href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`}
              target="_blank"
              className="block underline"
            >
              Trade on Bankr Swap
            </a>

          </div>
        )}

      </div>
    </main>
  );
}