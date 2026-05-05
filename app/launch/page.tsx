"use client";
import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const DEPLOY_CYCLE = ["CONNECTING...", "GENERATING...", "BROADCASTING...", "CONFIRMING..."];

const FIELDS = [
  { key: "name",        label: "TOKEN_NAME",     required: true,  ph: "e.g. AgentForge"           },
  { key: "wallet",      label: "CREATOR_WALLET", required: true,  ph: "0x..."                      },
  { key: "symbol",      label: "SYMBOL",         required: false, ph: "auto-generated if empty"    },
  { key: "description", label: "DESCRIPTION",    required: false, ph: "one-liner about your token" },
  { key: "image",       label: "IMAGE_URL",      required: false, ph: "https://..."                },
  { key: "tweet",       label: "TWEET_URL",      required: false, ph: "https://x.com/..."          },
  { key: "website",     label: "WEBSITE_URL",    required: false, ph: "https://..."                },
];

export default function LaunchPage() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, ""]))
  );
  const [loading, setLoading] = useState(false);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, []);

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const deploy = async () => {
    if (!values.name.trim() || !values.wallet.trim()) {
      setError("TOKEN_NAME and CREATOR_WALLET are required.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    setCycleIdx(0);

    cycleRef.current = setInterval(() => {
      setCycleIdx((i) => (i + 1) % DEPLOY_CYCLE.length);
    }, 2000);

    try {
      const res = await fetch(`${API}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setResult(data);
      if (!data.success) setError(data.error || "Deployment failed.");
    } catch {
      setError("Connection failed. Check network or try again.");
    } finally {
      if (cycleRef.current) clearInterval(cycleRef.current);
      setLoading(false);
    }
  };

  const copyCA = () => {
    if (!result?.tokenAddress) return;
    navigator.clipboard.writeText(result.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const canDeploy = values.name.trim() && values.wallet.trim() && !loading;

  return (
    <main className="page-wrapper min-h-screen pt-16 pb-12 px-4 sm:px-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
        <div>
          <p className="text-xs muted tracking-widest mb-1">BANKRSYNTH://</p>
          <h1 className="text-xl tracking-widest glow-text-soft">LAUNCH TERMINAL</h1>
        </div>
        <div className="flex items-center gap-2 panel px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="text-xs muted tracking-widest">BANKR API READY</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — form (3 cols) */}
        <div className="lg:col-span-3 panel">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">DEPLOYMENT PARAMETERS</span>
          </div>
          <div className="p-6">
            <div className="space-y-0">
              {FIELDS.map((f) => (
                <div key={f.key} className="input-group">
                  <label className="input-label">
                    {f.label}{f.required && <span className="text-green-400 ml-1">*</span>}
                  </label>
                  <input
                    className="terminal-input"
                    placeholder={f.ph}
                    value={values[f.key]}
                    onChange={set(f.key)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={deploy}
                disabled={!canDeploy}
                className="btn-primary"
              >
                {loading ? DEPLOY_CYCLE[cycleIdx] : "◈ EXECUTE DEPLOY"}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-green-400/10 space-y-1">
              <p className="text-xs muted">&gt; Fields marked * are required</p>
              <p className="text-xs muted">&gt; SYMBOL auto-generated from name if empty</p>
              <p className="text-xs muted">
                &gt; Upload images at{" "}
                <a href="https://imgbb.com/" target="_blank" rel="noreferrer"
                   className="text-green-400/70 hover:text-green-400 underline transition-colors">
                  imgbb.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — execution log (2 cols) */}
        <div className="lg:col-span-2 panel min-h-[400px] flex flex-col">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">EXECUTION LOG</span>
          </div>
          <div className="p-4 flex-1 font-mono text-xs space-y-2">

            {/* Idle */}
            {!loading && !result && !error && (
              <>
                <p className="muted">&gt; awaiting parameters...</p>
                <p className="muted">&gt; fill form to deploy</p>
                <p className="text-green-400"><span className="cursor-blink">_</span></p>
              </>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-2">
                {["connecting to bankr api",
                  "generating deployment wallet",
                  "broadcasting transaction",
                  "waiting for confirmation",
                ].map((s, i) => (
                  <p key={i} className="muted fade-in"
                     style={{ animationDelay: `${i * 0.8}s` }}>
                    &gt; {s}...
                  </p>
                ))}
                <span className="text-green-400 cursor-blink">_</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="space-y-2">
                <p className="text-error">✖ DEPLOY FAILED</p>
                <p className="muted">&gt; {error}</p>
                <p className="muted">&gt; check parameters and retry</p>
              </div>
            )}

            {/* Success */}
            {result?.success && !loading && (
              <div className="space-y-3">
                <p className="text-success">✔ DEPLOY SUCCESS</p>

                <div className="border border-green-400/20 p-3 space-y-2">
                  <p className="muted">CONTRACT ADDRESS</p>
                  <p className="text-green-400 break-all leading-relaxed">
                    {result.tokenAddress}
                  </p>
                  <button
                    onClick={copyCA}
                    className="btn-primary py-1.5 text-xs mt-1"
                    style={{ width: "auto", padding: "6px 16px" }}
                  >
                    {copied ? "COPIED!" : "COPY CA"}
                  </button>
                </div>

                {result.blockNumber && (
                  <p className="muted">&gt; BLOCK #{result.blockNumber.toLocaleString()}</p>
                )}

                <div className="space-y-2 pt-1">
                  <a href={`https://basescan.org/token/${result.tokenAddress}`}
                     target="_blank" rel="noreferrer"
                     className="block text-xs muted hover:text-green-400 transition-colors">
                    → VIEW ON BASESCAN
                  </a>
                  <a href={`https://www.geckoterminal.com/base/pools/${result.poolId}`}
                     target="_blank" rel="noreferrer"
                     className="block text-xs muted hover:text-green-400 transition-colors">
                    → VIEW ON GECKOTERMINAL
                  </a>
                  <a href={`https://swap.bankr.bot/?outputToken=${result.tokenAddress}`}
                     target="_blank" rel="noreferrer"
                     className="block text-xs muted hover:text-green-400 transition-colors">
                    → TRADE ON BANKR SWAP
                  </a>
                </div>

                <p className="muted">&gt; END OF TRANSMISSION</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
