"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const deploy = async () => {
    setLoading(true);

    try {
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
    } catch (err) {
      alert("Backend not responding");
    }

    setLoading(false);
  };

  return (
    <main className="
      min-h-screen 
      bg-black 
      text-green-400 
      font-mono 
      flex 
      items-center 
      justify-center 
      p-4
    ">

      {/* MATRIX PANEL */}
      <div className="
        w-full
        max-w-md
        sm:max-w-xl
        md:max-w-2xl
        lg:max-w-3xl
        xl:max-w-4xl
        border border-green-400
        shadow-[0_0_40px_#00ff9c]
        bg-black/70 backdrop-blur
        p-6 sm:p-8 md:p-10
      ">

        {/* TITLE */}
        <h1 className="
          text-2xl
          sm:text-3xl
          md:text-4xl
          lg:text-5xl
          text-center
          mb-6
        ">
          BANKRSYNTH LAUNCH TERMINAL
        </h1>

        {/* SUBTITLE */}
        <p className="mb-6 opacity-80 text-sm sm:text-base">
          {">"} Deploy token on Base
        </p>

        {/* INPUTS */}

        <input
          placeholder="Token Name"
          className="w-full mb-3 bg-black border border-green-400 p-3"
          onChange={e => setName(e.target.value)}
        />

        <input
          placeholder="Symbol (optional)"
          className="w-full mb-3 bg-black border border-green-400 p-3"
          onChange={e => setSymbol(e.target.value)}
        />

        <input
          placeholder="Description"
          className="w-full mb-3 bg-black border border-green-400 p-3"
          onChange={e => setDescription(e.target.value)}
        />

        <input
          placeholder="Creator Wallet (receives fees)"
          className="w-full mb-5 bg-black border border-green-400 p-3"
          onChange={e => setWallet(e.target.value)}
        />

        {/* BUTTON */}

        <button
          onClick={deploy}
          className="
            w-full
            border border-green-400
            py-3
            hover:bg-green-400 hover:text-black
            transition
          "
        >
          {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
        </button>

        {/* RESULT */}

        {result?.success && (
          <div className="mt-8 text-sm sm:text-base">

            <p>{">"} DEPLOY SUCCESS</p>

            <a
              href={`https://basescan.org/token/${result.tokenAddress}`}
              target="_blank"
              className="block underline mt-3"
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