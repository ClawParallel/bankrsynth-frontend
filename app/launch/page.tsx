"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [result, setResult] = useState<any>(null);

  const launch = async () => {
    const res = await fetch(
      "https://bankrsynth-backend-production.up.railway.app/launch",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol,
          description,
          recipient
        })
      }
    );

    const data = await res.json();
    setResult(data);
  };

  return (
    <main className="min-h-screen p-6 text-green-400 font-mono bg-black">

      <h1 className="text-5xl text-center mb-8">
        BANKRSYNTH TERMINAL
      </h1>

      <div className="max-w-xl mx-auto border p-6">

        <input
          placeholder="Token Name"
          className="w-full border p-3 mb-4 bg-black"
          onChange={e => setName(e.target.value)}
        />

        <input
          placeholder="Symbol"
          className="w-full border p-3 mb-4 bg-black"
          onChange={e => setSymbol(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 mb-4 bg-black"
          onChange={e => setDescription(e.target.value)}
        />

        <input
          placeholder="Creator Wallet or @X Username"
          className="w-full border p-3 mb-4 bg-black"
          onChange={e => setRecipient(e.target.value)}
        />

        <button
          onClick={launch}
          className="border px-6 py-3 hover:bg-green-900"
        >
          EXECUTE DEPLOY
        </button>

      </div>

      {result && (
        <div className="max-w-3xl mx-auto mt-10 border p-6">

          <p> DEPLOYMENT SUCCESS</p>
          <p> TOKEN ADDRESS: {result.tokenAddress}</p>
          <p> TX HASH: {result.txHash}</p>

          <div className="mt-6 space-y-3">

            {/* Basescan */}
            <a
              href={`https://basescan.org/address/${result.tokenAddress}`}
              target="_blank"
              className="block underline"
            >
              🔗 View on Basescan
            </a>

            {/* GeckoTerminal */}
            <a
              href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
              target="_blank"
              className="block underline"
            >
              📈 View on GeckoTerminal
            </a>

            {/* Bankr Swap */}
            <a
              href={`https://swap.bankr.bot/?inputToken=ETH&outputToken=${result.tokenAddress}`}
              target="_blank"
              className="block underline"
            >
              💱 Trade on Bankr Swap
            </a>

          </div>

          <p className="mt-6 text-green-600">
             END OF TRANSMISSION
          </p>

        </div>
      )}

    </main>
  );
}