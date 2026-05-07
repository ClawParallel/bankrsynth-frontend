"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const modules = [
  { href: "/launch",   label: "LAUNCH"   },
  { href: "/agent",    label: "AGENT"    },
  { href: "/terminal", label: "TERMINAL" },
  { href: "/intel",    label: "INTEL"    },
];

export default function Nav() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="nav-bar">
        {/* Logo */}
        <Link href="/" className="no-underline" onClick={() => setMenuOpen(false)}>
          <span
            className="font-mono text-sm tracking-[0.2em] glow-text flicker select-none"
            style={{ color: "#00ff9c" }}
          >
            ◈ BANKRSYNTH
          </span>
        </Link>

        {/* Desktop module links */}
        <div className="hidden sm:flex items-center gap-0">
          {modules.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${path === href ? "nav-link-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side: status + hamburger */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{
                background: "#00ff9c",
                boxShadow: "0 0 6px #00ff9c, 0 0 12px rgba(0,255,156,0.4)",
              }}
            />
            <span className="text-xs muted tracking-[0.15em]">BASE LIVE</span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {[0,1,2].map((i) => (
              <span
                key={i}
                className="block w-5 h-px transition-all"
                style={{ background: "rgba(0,255,156,0.7)" }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="fixed top-12 left-0 right-0 z-50 flex flex-col border-b sm:hidden"
          style={{
            background: "rgba(0,0,0,0.97)",
            borderColor: "rgba(0,255,156,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          {modules.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="no-underline"
            >
              <div
                className="px-6 py-4 text-xs tracking-[0.2em] uppercase transition-colors"
                style={{
                  color: path === href ? "#00ff9c" : "rgba(0,255,156,0.45)",
                  borderLeft: path === href ? "2px solid #00ff9c" : "2px solid transparent",
                  textShadow: path === href ? "0 0 10px rgba(0,255,156,0.8)" : "none",
                }}
              >
                {label}
              </div>
            </Link>
          ))}
          <div className="flex items-center gap-2 px-6 py-3 border-t"
               style={{ borderColor: "rgba(0,255,156,0.1)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00ff9c", boxShadow: "0 0 6px #00ff9c" }}
            />
            <span className="text-xs muted tracking-widest">BASE LIVE</span>
          </div>
        </div>
      )}
    </>
  );
}
