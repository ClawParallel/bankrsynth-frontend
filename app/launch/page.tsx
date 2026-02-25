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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          symbol,
          description,
          wallet
        })
      }
    );

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-green-400 p-6 font-mono">

      <h1 className="text-5xl text-center mb-10">
        BANKRSYNTH LAUNCH TERMINAL
      </h1>

      <div className="max-w-2xl mx-auto border border-green-400 p-6">

        <p>{">"} Deploy token on Base</p>

        <input
          placeholder="Token Name"
          className="w-full mt-4 bg-black border border-green-400 p-3"
          onChange={e => setName(e.target.value)}
        />

        <input
          placeholder="Symbol (optional)"
          className="w-full mt-4 bg-black border border-green-400 p-3"
          onChange={e => setSymbol(e.target.value)}
        />

        <input
          placeholder="Description"
          className="w-full mt-4 bg-black border border-green-400 p-3"
          onChange={e => setDescription(e.target.value)}
        />

        <input
          placeholder="Creator Wallet (receives fees)"
          className="w-full mt-4 bg-black border border-green-400 p-3"
          onChange={e => setWallet(e.target.value)}
        />

        <button
          onClick={deploy}
          className="mt-6 border border-green-400 px-8 py-3 hover:bg-green-400 hover:text-black transition"
        >
          {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
        </button>

        {result?.success && (
          <div className="mt-8">

            <p>{">"} DEPLOY SUCCESS</p>

            <a
              href={`https://basescan.org/token/${result.tokenAddress}`}
              target="_blank"
              className="block underline mt-4"
            >
              View on BaseScan
            </a>

            <a
              href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
              target="_blank"
              className="block underline mt-2"
            >
              View on GeckoTerminal
            </a>

            <a
              href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`}
              target="_blank"
              className="block underline mt-2"
            >
              Trade on Bankr Swap
            </a>

          </div>
        )}

      </div>
    </main>
  );
}