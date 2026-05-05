import MatrixRain from "@/components/MatrixRain";
import SystemLogs from "@/components/SystemLogs";
import TypingText from "@/components/TypingText";
import Link from "next/link";

export default function Home() {
  return (
    <main className="page-wrapper min-h-screen flex flex-col items-center
                     justify-center px-6 pt-12 pb-12">
      <MatrixRain />

      <div className="flex flex-col items-center gap-6 max-w-2xl w-full">

        {/* Eyebrow label */}
        <p className="text-xs tracking-[0.3em] muted uppercase">
          AUTONOMOUS EXECUTION LAYER
        </p>

        {/* Main title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-widest text-center glow-text">
          <TypingText text="BANKRSYNTH" />
        </h1>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent
                        via-green-400/40 to-transparent" />

        {/* System boot log panel */}
        <div className="w-full panel">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot-dim" />
            <span className="panel-dot-dim" />
            <span className="ml-2">SYSTEM BOOT LOG</span>
          </div>
          <div className="p-4">
            <SystemLogs />
          </div>
        </div>

        {/* Module cards — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { href: "/launch",   icon: "◈", title: "LAUNCH",    desc: "Deploy tokens on Base"  },
            { href: "/agent",    icon: "⬡", title: "AGENT",     desc: "Autonomous execution"   },
            { href: "/terminal", icon: "◉", title: "TERMINAL",  desc: "Market intelligence"    },
            { href: "/intel",    icon: "◎", title: "INTEL FEED",desc: "Narrative scanner"      },
          ].map((m) => (
            <Link key={m.href} href={m.href} className="no-underline">
              <div className="panel p-4 cursor-pointer
                              hover:border-green-400/60
                              hover:bg-green-400/5
                              transition-all duration-200 group">
                <div className="text-xl mb-2 transition-all group-hover:glow-text">
                  {m.icon}
                </div>
                <div className="text-sm tracking-widest font-bold mb-1">
                  {m.title}
                </div>
                <div className="text-xs muted">{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs muted tracking-widest">
          BUILT ON BASE · POWERED BY BANKR
        </p>

      </div>
    </main>
  );
}
