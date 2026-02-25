"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [open, setOpen] = useState(false);
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
    <main className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">

      {/* OPEN BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="border border-green-400 px-10 py-4 text-xl hover:bg-green-400 hover:text-black transition shadow-[0_0_25px_#00ff9c]"
        >
          LAUNCH TOKEN
        </button>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="
            w-[95%] max-w-xl
            border border-green-400
            bg-black
            p-8
            shadow-[0_0_40px_#00ff9c]
            relative
          ">

            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-2 text-2xl hover:text-white"
            >
              ×
            </button>

            <h2 className="text-3xl text-center mb-6">
              BANKRSYNTH DEPLOY
            </h2>

            <p className="mb-4">{">"} bankrsynth launch --chain base</p>

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

            <button
              onClick={deploy}
              className="terminal-btn mt-6"
            >
              {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
            </button>

            {result?.success && (
              <div className="mt-6 text-sm">

                <p>{">"} DEPLOY SUCCESS</p>

                <a
                  href={`https://basescan.org/token/${result.tokenAddress}`}
                  target="_blank"
                  className="block underline mt-2"
                >
                  View on BaseScan
                </a>

                <a
                  href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
                  target="_blank"
                  className="block underline mt-1"
                >
                  View on GeckoTerminal
                </a>

                <a
                  href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`}
                  target="_blank"
                  className="block underline mt-1"
                >
                  Trade on Bankr Swap
                </a>

              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}