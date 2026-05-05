"use client";
import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

const LOADING_LINES = [
  "> connecting to bankr infra...",
  "> generating deployment wallet...",
  "> broadcasting transaction...",
  "> waiting for Base confirmation...",
];

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [image, setImage] = useState("");
  const [tweet, setTweet] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    setLogLines([]);
    let i = 0;
    const id = setInterval(() => {
      if (i < LOADING_LINES.length) {
        setLogLines(prev => [...prev, LOADING_LINES[i]]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 700);
    return () => clearInterval(id);
  }, [loading]);

  const deploy = async () => {
    if (!name.trim() || !wallet.trim()) {
      setError("✖ Token Name and Creator Wallet are required.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, symbol, description, wallet, image, tweet, website }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError("✖ Connection failed. Check network or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono overflow-x-hidden">
      <Nav />

      <div className="flex justify-center p-4 pt-6">
        <div className="w-full max-w-2xl space-y-6">

          {/* TERMINAL WINDOW */}
          <div className="border border-green-400 bg-black shadow-[0_0_30px_#00ff9c55]">

            {/* TITLE BAR */}
            <div className="flex items-center gap-2 border-b border-green-400 p-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <div className="w-3 h-3 border border-green-400 rounded-full" />
              <div className="w-3 h-3 border border-green-400 rounded-full" />
              <span className="ml-4 text-xs opacity-60 truncate">bankrsynth://launch</span>
            </div>

            {/* TITLE */}
            <div className="text-center py-6 px-4">
              <h1 className="text-xl sm:text-2xl glow-text tracking-widest">BANKRSYNTH LAUNCH TERMINAL</h1>
              <p className="opacity-60 mt-2 text-xs sm:text-sm">Deploy tokens on Base via Partner API</p>
            </div>

            {/* FORM */}
            <div className="p-4 sm:p-6 space-y-2">
              <input
                placeholder="Token Name (required)"
                className="terminal-input"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                placeholder="Creator Wallet (required)"
                className="terminal-input"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
              />
              <input
                placeholder="Symbol (optional)"
                className="terminal-input"
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
              />
              <input
                placeholder="Description (optional)"
                className="terminal-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <input
                placeholder="Token Image URL (optional)"
                className="terminal-input"
                value={image}
                onChange={e => setImage(e.target.value)}
              />
              <input
                placeholder="Tweet URL (optional)"
                className="terminal-input"
                value={tweet}
                onChange={e => setTweet(e.target.value)}
              />
              <input
                placeholder="Website URL (optional)"
                className="terminal-input"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
              <button
                onClick={deploy}
                disabled={loading}
                className="terminal-btn disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
              >
                {loading ? "DEPLOYING..." : "EXECUTE DEPLOY"}
              </button>
            </div>

            {/* OUTPUT */}
            <div className="border-t border-green-400 p-4 sm:p-6 min-h-[160px] text-sm space-y-1">

              {loading && logLines.map((line, i) => (
                <p key={i} className="opacity-80">{line}</p>
              ))}

              {loading && (
                <p className="opacity-60 animate-pulse">
                  {">"} <span className="inline-block animate-pulse">█</span>
                </p>
              )}

              {error && (
                <p className="text-red-400">{error}</p>
              )}

              {result?.success && (
                <div className="space-y-2">
                  <p className="text-green-400 glow-text text-base tracking-widest animate-pulse">
                    &gt; TRANSACTION CONFIRMED
                  </p>
                  {result.blockNumber && (
                    <p className="opacity-60 text-xs">&gt; Block #{result.blockNumber}</p>
                  )}
                  <p>&gt; Token Address: <span className="break-all">{result.tokenAddress}</span></p>

                  <div className="pt-2 space-y-1">
                    <a
                      href={`https://basescan.org/token/${result.tokenAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block underline hover:text-white transition-colors"
                    >
                      &gt; View on BaseScan
                    </a>
                    <a
                      href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block underline hover:text-white transition-colors"
                    >
                      &gt; View on GeckoTerminal
                    </a>
                    <a
                      href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block underline hover:text-white transition-colors"
                    >
                      &gt; Trade on Bankr Swap
                    </a>
                  </div>

                  <p className="opacity-50 pt-2 text-xs">&gt; END OF TRANSMISSION</p>
                </div>
              )}

              {result && !result.success && !error && (
                <p className="text-red-400">✖ Deploy failed. {result.error || "Unknown error."}</p>
              )}
            </div>
          </div>

          {/* GUIDE */}
          <div className="terminal-panel text-sm">
            <h2 className="text-base sm:text-lg mb-4 tracking-widest">HOW TO DEPLOY A TOKEN</h2>
            <p className="mb-3 opacity-80">Only token name and creator wallet are required.</p>
            <div className="space-y-1 opacity-70">
              <p>&gt; Token Name — name of your token</p>
              <p>&gt; Creator Wallet — receives trading fees</p>
              <p>&gt; Symbol auto-generated if empty</p>
              <p>&gt; Image must be a public URL</p>
            </div>
            <div className="mt-4">
              <p className="mb-1">&gt; Upload image at:</p>
              <a
                href="https://imgbb.com/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white transition-colors"
              >
                imgbb.com
              </a>
            </div>
            <p className="mt-4 text-xs opacity-50">Deployment is permanent on Base chain.</p>
          </div>

        </div>
      </div>
    </main>
  );
}
