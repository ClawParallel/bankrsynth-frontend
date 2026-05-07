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
          <p
            className="text-xs tracking-[0.25em] mb-1"
            style={{ color: "rgba(0,255,156,0.3)" }}
          >
            BANKRSYNTH:// BASE_MAINNET
          </p>
          <h1
            className="text-xl tracking-[0.2em] glow-text-soft font-mono uppercase"
            style={{ color: "#00ff9c" }}
          >
            LAUNCH TERMINAL
          </h1>
        </div>
        <div
          className="panel flex items-center gap-2 px-3 py-2"
          style={{ fontSize: "11px" }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{
              background: "#00ff9c",
              boxShadow: "0 0 8px #00ff9c",
            }}
          />
          <span
            className="tracking-[0.15em] font-mono"
            style={{ color: "rgba(0,255,156,0.6)" }}
          >
            BANKR API READY
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — form (3 cols) */}
        <div className="lg:col-span-3 panel panel-scan">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">DEPLOYMENT PARAMETERS</span>
          </div>
          <div className="p-6 relative z-10">
            <div className="space-y-0">
              {FIELDS.map((f) => (
                <div key={f.key} className="input-group">
                  <label className="input-label">
                    {f.label}
                    {f.required && (
                      <span
                        className="ml-1"
                        style={{ color: "#00ff9c" }}
                      >
                        *
                      </span>
                    )}
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
                className={`btn-primary ${loading ? "pulse-glow-anim" : ""}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="cursor-blink">▶</span>
                    {DEPLOY_CYCLE[cycleIdx]}
                  </span>
                ) : (
                  "◈ EXECUTE DEPLOY"
                )}
              </button>
            </div>

            <div
              className="mt-4 pt-4 space-y-1"
              style={{ borderTop: "1px solid rgba(0,255,156,0.08)" }}
            >
              <p className="text-xs muted">&gt; Fields marked * are required</p>
              <p className="text-xs muted">&gt; SYMBOL auto-generated from name if empty</p>
              <p className="text-xs muted">
                &gt; Upload images at{" "}
                <a
                  href="https://imgbb.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "rgba(0,255,156,0.6)" }}
                  className="hover:text-green-400 underline transition-colors"
                >
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
                <p className="muted">&gt; system standing by...</p>
                <p className="muted">&gt; awaiting deploy parameters</p>
                <p className="muted">&gt; BASE_CHAIN: connected</p>
                <p style={{ color: "#00ff9c" }}>
                  <span className="cursor-blink">_</span>
                </p>
              </>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-2">
                {[
                  "connecting to bankr api",
                  "generating deployment wallet",
                  "broadcasting transaction",
                  "waiting for confirmation",
                ].map((s, i) => (
                  <p
                    key={i}
                    className="muted fade-in"
                    style={{ animationDelay: `${i * 0.8}s` }}
                  >
                    <span style={{ color: "rgba(0,255,156,0.5)" }}>[{String(i + 1).padStart(2, "0")}]</span>{" "}
                    {s}...
                  </p>
                ))}
                <span style={{ color: "#00ff9c" }} className="cursor-blink">_</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="space-y-2 fade-in">
                <p className="text-error">✖ DEPLOY FAILED</p>
                <p className="muted">&gt; {error}</p>
                <p className="muted">&gt; check parameters and retry</p>
              </div>
            )}

            {/* Success */}
            {result?.success && !loading && (
              <div className="space-y-3 fade-in">
                <p
                  className="text-success tracking-widest"
                  style={{ textShadow: "0 0 10px rgba(0,255,156,0.8)" }}
                >
                  ✔ DEPLOY SUCCESS
                </p>

                <div
                  className="p-3 space-y-2"
                  style={{ border: "1px solid rgba(0,255,156,0.25)", background: "rgba(0,255,156,0.03)" }}
                >
                  <p className="muted tracking-widest">CONTRACT ADDRESS</p>
                  <p className="break-all leading-relaxed" style={{ color: "#00ff9c" }}>
                    {result.tokenAddress}
                  </p>
                  <button
                    onClick={copyCA}
                    className="btn-primary text-xs"
                    style={{ width: "auto", padding: "6px 16px" }}
                  >
                    {copied ? "✔ COPIED" : "COPY CA"}
                  </button>
                </div>

                {result.blockNumber && (
                  <p className="muted">&gt; BLOCK #{result.blockNumber.toLocaleString()}</p>
                )}

                <div className="space-y-2 pt-1">
                  {[
                    { href: `https://basescan.org/token/${result.tokenAddress}`,             label: "VIEW ON BASESCAN" },
                    { href: `https://www.geckoterminal.com/base/pools/${result.poolId}`,     label: "VIEW ON GECKOTERMINAL" },
                    { href: `https://swap.bankr.bot/?outputToken=${result.tokenAddress}`,    label: "TRADE ON BANKR SWAP" },
                  ].map(({ href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs muted hover:text-green-400 transition-colors"
                    >
                      → {label}
                    </a>
                  ))}
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
