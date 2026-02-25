"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const deploy = async () => {
    setLoading(true);
    setResult(null);

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

    if (data.success) {
      setHistory(prev => [data, ...prev]);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4 overflow-x-hidden">

      {/* OUTER CONTAINER (FIX OVERFLOW) */}
      <div className="w-full max-w-3xl">

        {/* TERMINAL WINDOW */}
        <div className="border border-green-400 bg-black shadow-[0_0_30px_#00ff9c33] overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-2 border-b border-green-400 p-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="w-3 h-3 border border-green-400 rounded-full"></div>
            <div className="w-3 h-3 border border-green-400 rounded-full"></div>

            <span className="ml-4 text-sm opacity-70">
              bankrsynth://launch
            </span>
          </div>

          {/* TITLE */}
          <div className="text-center py-6 px-4">
            <h1 className="text-2xl md:text-3xl">
              BANKRSYNTH LAUNCH TERMINAL
            </h1>

            <p className="opacity-70 mt-2 text-sm">
              &gt; bankrsynth launch --chain base
            </p>
          </div>

          {/* FORM */}
          <div className="p-6 space-y-4">

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
              className="terminal-btn"
            >
              {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
            </button>
          </div>

          {/* OUTPUT */}
          <div className="p-6 border-t border-green-400 min-h-[220px]">

            {loading && (
              <div className="space-y-1 opacity-80 text-sm">
                <p>&gt; connecting to bankr infra...</p>
                <p>&gt; generating deployment wallet...</p>
                <p>&gt; signing transaction...</p>
                <p>&gt; broadcasting...</p>
              </div>
            )}

            {result?.success && (
              <div className="space-y-2 text-sm break-words">

                <p>&gt; DEPLOYMENT SUCCESS</p>

                <p>
                  TOKEN ADDRESS: {result.tokenAddress}
                </p>

                <p>
                  TX HASH: {result.txHash}
                </p>

                {/* LINKS */}
                <div className="mt-4 space-y-1">

                  <a
                    href={`https://basescan.org/token/${result.tokenAddress}`}
                    target="_blank"
                    className="block underline"
                  >
                    View on BaseScan
                  </a>

                  <a
                    href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
                    target="_blank"
                    className="block underline"
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

                <p className="mt-4 opacity-70">
                  &gt; END OF TRANSMISSION
                </p>

              </div>
            )}

          </div>

          {/* HISTORY */}
          {history.length > 0 && (
            <div className="border-t border-green-400 p-6">

              <p className="mb-4 text-sm">
                &gt; DEPLOY HISTORY
              </p>

              <div className="space-y-2 text-sm">

                {history.map((h, i) => (
                  <div key={i} className="border border-green-400 p-3 break-words">

                    <p>{h.tokenAddress}</p>

                    <a
                      href={`https://basescan.org/token/${h.tokenAddress}`}
                      target="_blank"
                      className="underline"
                    >
                      View
                    </a>

                  </div>
                ))}

              </div>

            </div>
          )}

        </div>

      </div>

    </main>
  );
}