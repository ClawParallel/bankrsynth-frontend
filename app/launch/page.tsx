"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [image, setImage] = useState("");
  const [tweet, setTweet] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
          wallet,
          image,
          tweet,
          website
        })
      }
    );

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono flex justify-center p-4 overflow-x-hidden">

      <div className="w-full max-w-2xl">

        {/* TERMINAL WINDOW */}
        <div className="border border-green-400 bg-black shadow-[0_0_30px_#00ff9c55] overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-2 border-b border-green-400 p-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="w-3 h-3 border border-green-400 rounded-full"></div>
            <div className="w-3 h-3 border border-green-400 rounded-full"></div>

            <span className="ml-4 text-xs opacity-70">
              bankrsynth://launch
            </span>
          </div>

          {/* TITLE */}
          <div className="text-center py-6">
            <h1 className="text-2xl">
              BANKRSYNTH LAUNCH TERMINAL
            </h1>
            <p className="opacity-70 mt-2 text-sm">
              Deploy tokens on Base via Partner API
            </p>
          </div>

          {/* FORM */}
          <div className="p-6 space-y-3">

            <input placeholder="Token Name (required)" className="terminal-input" onChange={e => setName(e.target.value)} />
            <input placeholder="Creator Wallet (required)" className="terminal-input" onChange={e => setWallet(e.target.value)} />

            <input placeholder="Symbol (optional)" className="terminal-input" onChange={e => setSymbol(e.target.value)} />
            <input placeholder="Description (optional)" className="terminal-input" onChange={e => setDescription(e.target.value)} />
            <input placeholder="Token Image URL (optional)" className="terminal-input" onChange={e => setImage(e.target.value)} />
            <input placeholder="Tweet URL (optional)" className="terminal-input" onChange={e => setTweet(e.target.value)} />
            <input placeholder="Website URL (optional)" className="terminal-input" onChange={e => setWebsite(e.target.value)} />

            <button onClick={deploy} className="terminal-btn mt-4">
              {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
            </button>
          </div>

          {/* OUTPUT */}
          <div className="border-t border-green-400 p-6 min-h-[180px]">

            {loading && (
              <div className="space-y-1 opacity-80 text-sm">
                <p>&gt; connecting to bankr infra...</p>
                <p>&gt; generating deployment wallet...</p>
                <p>&gt; broadcasting transaction...</p>
              </div>
            )}

            {result?.success && (
              <div className="space-y-2 text-sm">

                <p>&gt; DEPLOY SUCCESS</p>

                <a href={`https://basescan.org/token/${result.tokenAddress}`} target="_blank" className="underline block">
                  View on BaseScan
                </a>

                <a href={`https://www.geckoterminal.com/base/pools/${result.poolId}`} target="_blank" className="underline block">
                  View on GeckoTerminal
                </a>

                <a href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`} target="_blank" className="underline block">
                  Trade on Bankr Swap
                </a>

                <p className="opacity-70 mt-3">
                  &gt; END OF TRANSMISSION
                </p>

              </div>
            )}

          </div>
        </div>

        {/* GUIDE */}
        <div className="border border-green-400 p-6 mt-8 text-sm">
          <h2 className="text-xl mb-4">HOW TO DEPLOY A TOKEN</h2>

          <p className="mb-4">
            Only token name and creator wallet are required.
          </p>

          <div className="space-y-1 opacity-80">
            <p>&gt; Token Name — Name of your token</p>
            <p>&gt; Creator Wallet — Receives trading fees</p>
            <p>&gt; Symbol auto-generated if empty</p>
            <p>&gt; Image must be public URL</p>
          </div>

          <div className="mt-4">
            <p>&gt; Upload image:</p>
            <a href="https://imgbb.com/" target="_blank" className="underline">
              https://imgbb.com/
            </a>
          </div>

          <p className="mt-4 opacity-70">
            Deployment is permanent on Base chain.
          </p>
        </div>

      </div>

    </main>
  );
}