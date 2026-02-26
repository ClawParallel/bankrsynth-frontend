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
    <main className="min-h-screen bg-black text-green-400 font-mono p-6">

      {/* TITLE */}
      <div className="text-center mb-10">
        <h1 className="text-4xl">BANKRSYNTH LAUNCH TERMINAL</h1>
        <p className="opacity-70 mt-2">
          Deploy tokens on Base via Partner API
        </p>
      </div>

      {/* DEPLOY WINDOW */}
      <div className="max-w-3xl mx-auto border border-green-400 p-6 shadow-[0_0_40px_#00ff9c55]">

        <p>&gt; bankrsynth launch --chain base</p>

        {/* REQUIRED */}
        <input
          placeholder="Token Name (required)"
          className="terminal-input"
          onChange={e => setName(e.target.value)}
        />

        <input
          placeholder="Creator Wallet (required)"
          className="terminal-input"
          onChange={e => setWallet(e.target.value)}
        />

        {/* OPTIONAL */}
        <input
          placeholder="Symbol (optional)"
          className="terminal-input"
          onChange={e => setSymbol(e.target.value)}
        />

        <input
          placeholder="Description (optional)"
          className="terminal-input"
          onChange={e => setDescription(e.target.value)}
        />

        <input
          placeholder="Token Image URL (optional)"
          className="terminal-input"
          onChange={e => setImage(e.target.value)}
        />

        <input
          placeholder="Tweet URL (optional)"
          className="terminal-input"
          onChange={e => setTweet(e.target.value)}
        />

        <input
          placeholder="Website URL (optional)"
          className="terminal-input"
          onChange={e => setWebsite(e.target.value)}
        />

        <button onClick={deploy} className="terminal-btn mt-6">
          {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
        </button>

        {/* OUTPUT */}
        <div className="mt-6 min-h-[180px]">
          {loading && (
            <div>
              <p>&gt; connecting to bankr infra...</p>
              <p>&gt; generating deployment wallet...</p>
              <p>&gt; broadcasting transaction...</p>
            </div>
          )}

          {result?.success && (
            <div className="space-y-2">
              <p>&gt; DEPLOY SUCCESS</p>

              <a
                href={`https://basescan.org/token/${result.tokenAddress}`}
                target="_blank"
                className="underline"
              >
                View on BaseScan
              </a>

              <a
                href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
                target="_blank"
                className="underline"
              >
                View on GeckoTerminal
              </a>

              <a
                href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`}
                target="_blank"
                className="underline"
              >
                Trade on Bankr Swap
              </a>
            </div>
          )}
        </div>
      </div>

      {/* USER GUIDE */}
      <div className="max-w-3xl mx-auto border border-green-400 p-6 mt-10">

        <h2 className="text-2xl mb-4">
          HOW TO DEPLOY A TOKEN
        </h2>

        <p className="mb-4">
          Only token name and creator wallet are required.
          All other fields are optional.
        </p>

        <div className="space-y-2 text-sm">

          <p>&gt; Token Name — Name of your token</p>
          <p>&gt; Creator Wallet — Receives trading fees</p>
          <p>&gt; Symbol — Auto-generated if empty</p>
          <p>&gt; Description — Stored on-chain</p>
          <p>&gt; Image — Public image URL</p>
          <p>&gt; Tweet — Optional announcement link</p>
          <p>&gt; Website — Optional project site</p>

        </div>

        <div className="mt-6 text-sm">

          <p className="mb-2">&gt; Upload token image:</p>

          <a
            href="https://imgbb.com/"
            target="_blank"
            className="underline"
          >
            https://imgbb.com/
          </a>

        </div>

        <p className="mt-6 text-sm opacity-70">
          Deployment is permanent. Tokens launch on Base chain.
        </p>

      </div>

    </main>
  );
}