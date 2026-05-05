"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL;

const DEPLOY_STATES = [
  "CONNECTING...",
  "GENERATING...",
  "BROADCASTING...",
  "CONFIRMING...",
];

const LOG_LINES = [
  "> connecting to bankr infra...",
  "> generating deployment wallet...",
  "> signing and broadcasting transaction...",
  "> waiting for Base confirmation...",
  "> indexing token metadata...",
];

type Field = {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

const FIELDS: Field[] = [
  { key: "name",        label: "TOKEN_NAME",       required: true,  placeholder: "e.g. DegensUnited" },
  { key: "wallet",      label: "CREATOR_WALLET",   required: true,  placeholder: "0x..." },
  { key: "symbol",      label: "SYMBOL",                            placeholder: "auto-generated if empty" },
  { key: "description", label: "DESCRIPTION",                       placeholder: "one-liner about the token" },
  { key: "image",       label: "IMAGE_URL",                         placeholder: "https://..." },
  { key: "tweet",       label: "TWEET_URL",                         placeholder: "https://x.com/..." },
  { key: "website",     label: "WEBSITE_URL",                       placeholder: "https://..." },
];

export default function LaunchPage() {
  const [values, setValues] = useState<Record<string, string>>({
    name: "", wallet: "", symbol: "", description: "", image: "", tweet: "", website: "",
  });

  const [loading, setLoading] = useState(false);
  const [deployStateIdx, setDeployStateIdx] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const deployIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (deployIntervalRef.current) clearInterval(deployIntervalRef.current);
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const startLoadingAnimations = () => {
    setDeployStateIdx(0);
    setLogLines([]);

    let si = 0;
    deployIntervalRef.current = setInterval(() => {
      si = (si + 1) % DEPLOY_STATES.length;
      setDeployStateIdx(si);
    }, 2000);

    let li = 0;
    logIntervalRef.current = setInterval(() => {
      if (li < LOG_LINES.length) {
        setLogLines((prev) => [...prev, LOG_LINES[li]]);
        li++;
      } else {
        if (logIntervalRef.current) clearInterval(logIntervalRef.current);
      }
    }, 900);
  };

  const stopAnimations = () => {
    if (deployIntervalRef.current) clearInterval(deployIntervalRef.current);
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
  };

  const deploy = async () => {
    if (!values.name.trim() || !values.wallet.trim()) {
      setError("TOKEN_NAME and CREATOR_WALLET are required fields.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    startLoadingAnimations();

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
      stopAnimations();
      setLoading(false);
    }
  };

  const copyCA = () => {
    if (!result?.tokenAddress) return;
    navigator.clipboard.writeText(result.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const truncate = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const canDeploy = values.name.trim() && values.wallet.trim() && !loading;

  return (
    <div className="min-h-screen bg-black font-mono">
      <Nav />

      <div className="pt-16 pb-8 px-4 max-w-6xl mx-auto">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1
              className="text-lg sm:text-xl tracking-widest"
              style={{ color: "var(--green)", textShadow: "0 0 10px var(--green)" }}
            >
              ◈ LAUNCH TERMINAL
            </h1>
            <p className="text-xs mt-1" style={{ color: "rgba(0,255,156,0.45)" }}>
              Deploy tokens on Base via Bankr Partner API
            </p>
          </div>
          <div className="badge-green">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--green)" }}
            />
            BANKR API: CONNECTED
          </div>
        </div>

        {/* TWO COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

          {/* ── LEFT: FORM ── */}
          <div className="panel p-5 sm:p-6">
            <p className="section-label">DEPLOYMENT PARAMETERS</p>

            <div className="space-y-5">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <div
                    className="text-xs mb-1 flex items-center gap-1"
                    style={{ color: "rgba(0,255,156,0.55)" }}
                  >
                    <span>&gt; {f.label}:</span>
                    {f.required && (
                      <span style={{ color: "var(--green)" }}>*</span>
                    )}
                  </div>
                  <input
                    className="terminal-input"
                    value={values[f.key]}
                    onChange={set(f.key)}
                    placeholder={f.placeholder}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            {/* DEPLOY BUTTON */}
            <button
              onClick={deploy}
              disabled={!canDeploy}
              className="terminal-btn mt-6"
              style={{ height: 56, fontSize: "0.85rem", letterSpacing: "0.2em" }}
            >
              {loading ? DEPLOY_STATES[deployStateIdx] : "EXECUTE DEPLOY"}
            </button>

            {/* GUIDE */}
            <div
              className="mt-6 pt-4 text-xs space-y-1"
              style={{
                borderTop: "1px solid rgba(0,255,156,0.1)",
                color: "rgba(0,255,156,0.4)",
              }}
            >
              <p>&gt; Fields marked [*] are required</p>
              <p>&gt; SYMBOL auto-generated from name if empty</p>
              <p>&gt; IMAGE_URL must be a public https:// URL</p>
              <p>
                &gt; Upload images at{" "}
                <a
                  href="https://imgbb.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "rgba(0,255,156,0.6)", textDecoration: "underline" }}
                >
                  imgbb.com
                </a>
              </p>
            </div>
          </div>

          {/* ── RIGHT: EXECUTION LOG ── */}
          <div className="panel p-5 sm:p-6 flex flex-col">
            <p className="section-label">EXECUTION LOG</p>

            <div className="flex-1 text-sm space-y-1" style={{ minHeight: 240 }}>

              {/* IDLE */}
              {!loading && !result && !error && (
                <div style={{ color: "rgba(0,255,156,0.45)" }} className="text-xs space-y-1">
                  <p className="blink-cursor">&gt; root@bankrsynth:~$</p>
                  <p>&gt; awaiting deployment parameters...</p>
                  <p>&gt; enter token details to begin execution</p>
                </div>
              )}

              {/* LOADING */}
              {loading && (
                <>
                  {logLines.map((line, i) => (
                    <p
                      key={i}
                      className="animate-slide-in text-xs"
                      style={{ color: "rgba(0,255,156,0.7)" }}
                    >
                      {line}
                    </p>
                  ))}
                  <span
                    className="inline-block text-xs"
                    style={{ animation: "blink 1s step-end infinite", color: "var(--green)" }}
                  >
                    █
                  </span>
                </>
              )}

              {/* ERROR */}
              {error && !loading && (
                <div className="space-y-1 text-xs">
                  <p style={{ color: "var(--red)" }}>✖ STATUS: FAILED</p>
                  <p style={{ color: "rgba(255,51,102,0.7)" }}>&gt; {error}</p>
                  <p style={{ color: "rgba(0,255,156,0.4)" }}>&gt; retry or check parameters</p>
                </div>
              )}

              {/* SUCCESS */}
              {result?.success && !loading && (
                <div className="text-xs space-y-2">
                  <p
                    className="text-sm tracking-widest"
                    style={{ color: "var(--green)", textShadow: "0 0 10px var(--green)" }}
                  >
                    ✔ STATUS: SUCCESS
                  </p>
                  <div
                    className="my-2"
                    style={{ borderTop: "1px solid rgba(0,255,156,0.2)" }}
                  />

                  <div className="space-y-1" style={{ color: "rgba(0,255,156,0.8)" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: "rgba(0,255,156,0.5)" }}>CONTRACT:</span>
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={copyCA}
                        title="Click to copy"
                        style={{ color: "var(--green)" }}
                      >
                        {truncate(result.tokenAddress)}
                      </span>
                      <button
                        onClick={copyCA}
                        className="terminal-btn-sm"
                        style={{ padding: "2px 8px", fontSize: "0.6rem" }}
                      >
                        {copied ? "COPIED!" : "COPY"}
                      </button>
                    </div>
                    <p>
                      <span style={{ color: "rgba(0,255,156,0.5)" }}>NETWORK: </span>
                      Base Mainnet
                    </p>
                    {result.blockNumber && (
                      <p>
                        <span style={{ color: "rgba(0,255,156,0.5)" }}>BLOCK:   </span>
                        #{result.blockNumber.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div
                    className="my-2"
                    style={{ borderTop: "1px solid rgba(0,255,156,0.2)" }}
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      {
                        label: "BASESCAN",
                        href: `https://basescan.org/token/${result.tokenAddress}`,
                      },
                      {
                        label: "GECKO",
                        href: `https://www.geckoterminal.com/base/pools/${result.poolId}`,
                      },
                      {
                        label: "TRADE",
                        href: `https://swap.bankr.bot/?outputToken=${result.tokenAddress}`,
                      },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="terminal-btn-sm no-underline"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
