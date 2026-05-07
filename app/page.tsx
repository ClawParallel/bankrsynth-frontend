import MatrixRain from "@/components/MatrixRain";
import SystemLogs from "@/components/SystemLogs";
import TypingText from "@/components/TypingText";
import Link from "next/link";

const modules = [
  {
    href: "/launch",
    icon: "◈",
    title: "LAUNCH",
    desc: "Deploy tokens on Base",
    tag: "DEPLOY",
  },
  {
    href: "/agent",
    icon: "⬡",
    title: "AGENT",
    desc: "Autonomous execution",
    tag: "AI",
  },
  {
    href: "/terminal",
    icon: "◉",
    title: "TERMINAL",
    desc: "Market intelligence",
    tag: "ANALYSIS",
  },
  {
    href: "/intel",
    icon: "◎",
    title: "INTEL FEED",
    desc: "Narrative scanner",
    tag: "SIGNAL",
  },
];

export default function Home() {
  return (
    <main className="page-wrapper min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-12">
      <MatrixRain />

      <div className="flex flex-col items-center gap-7 max-w-2xl w-full">

        {/* Eyebrow */}
        <p
          className="text-xs tracking-[0.35em] uppercase"
          style={{ color: "rgba(0,255,156,0.4)" }}
        >
          AUTONOMOUS EXECUTION LAYER · BASE MAINNET
        </p>

        {/* Title block */}
        <div className="text-center relative">
          {/* Top corner accents */}
          <div
            className="absolute -top-4 -left-4 w-6 h-6 border-l-2 border-t-2"
            style={{ borderColor: "rgba(0,255,156,0.35)" }}
          />
          <div
            className="absolute -top-4 -right-4 w-6 h-6 border-r-2 border-t-2"
            style={{ borderColor: "rgba(0,255,156,0.35)" }}
          />

          <h1
            className="text-5xl sm:text-7xl font-bold tracking-[0.2em] glow-text flicker"
            style={{ color: "#00ff9c" }}
          >
            <TypingText text="BANKRSYNTH" />
          </h1>
          <p
            className="text-xs tracking-[0.25em] mt-3"
            style={{ color: "rgba(0,255,156,0.35)" }}
          >
            v2.0 // NEURAL DEPLOYMENT NODE
          </p>

          {/* Bottom corner accents */}
          <div
            className="absolute -bottom-4 -left-4 w-6 h-6 border-l-2 border-b-2"
            style={{ borderColor: "rgba(0,255,156,0.35)" }}
          />
          <div
            className="absolute -bottom-4 -right-4 w-6 h-6 border-r-2 border-b-2"
            style={{ borderColor: "rgba(0,255,156,0.35)" }}
          />
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,156,0.3))" }}
          />
          <span
            className="text-xs tracking-[0.25em] px-2"
            style={{ color: "rgba(0,255,156,0.3)" }}
          >
            SYS
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(90deg, rgba(0,255,156,0.3), transparent)" }}
          />
        </div>

        {/* Boot log panel */}
        <div className="w-full panel panel-scan">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">SYSTEM BOOT LOG</span>
            <span
              className="ml-auto text-xs"
              style={{ color: "rgba(0,255,156,0.3)" }}
            >
              NODE_0x1A
            </span>
          </div>
          <div className="p-4 relative z-10">
            <SystemLogs />
          </div>
        </div>

        {/* Module cards — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {modules.map((m) => (
            <Link key={m.href} href={m.href} className="no-underline">
              <div
                className="panel panel-card p-4 cursor-pointer relative overflow-hidden"
                style={{ minHeight: "100px" }}
              >
                {/* Tag */}
                <span
                  className="absolute top-3 right-3 text-[9px] tracking-[0.15em] px-1.5 py-0.5 border"
                  style={{
                    color: "rgba(0,255,156,0.4)",
                    borderColor: "rgba(0,255,156,0.2)",
                  }}
                >
                  {m.tag}
                </span>

                {/* Icon */}
                <div
                  className="text-2xl mb-2 glow-text-soft transition-all"
                  style={{ color: "#00ff9c" }}
                >
                  {m.icon}
                </div>

                {/* Title */}
                <div
                  className="text-xs tracking-[0.2em] font-bold mb-1"
                  style={{ color: "#00ff9c", textShadow: "0 0 6px rgba(0,255,156,0.4)" }}
                >
                  {m.title}
                </div>

                {/* Desc */}
                <div
                  className="text-xs"
                  style={{ color: "rgba(0,255,156,0.4)" }}
                >
                  {m.desc}
                </div>

                {/* Bottom arrow */}
                <div
                  className="absolute bottom-3 right-3 text-xs transition-all"
                  style={{ color: "rgba(0,255,156,0.2)" }}
                >
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p
          className="text-xs tracking-[0.25em]"
          style={{ color: "rgba(0,255,156,0.25)" }}
        >
          BUILT ON BASE · POWERED BY BANKR
        </p>

      </div>
    </main>
  );
}
