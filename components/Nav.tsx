"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MODULES = [
  { href: "/launch",   label: "LAUNCH"   },
  { href: "/agent",    label: "AGENT"    },
  { href: "/terminal", label: "TERMINAL" },
  { href: "/intel",    label: "INTEL"    },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-4 sm:px-6 font-mono"
        style={{
          background: "rgba(0,0,0,0.9)",
          borderBottom: "1px solid rgba(0,255,156,0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span
            className="text-sm tracking-widest flicker"
            style={{ color: "var(--green)", textShadow: "0 0 10px var(--green)" }}
          >
            ◈ BANKRSYNTH
          </span>
        </Link>

        {/* DESKTOP TABS */}
        <div className="hidden sm:flex items-center">
          {MODULES.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="relative px-4 py-3 text-xs tracking-widest transition-all duration-150 no-underline"
                style={{
                  color: active ? "var(--green)" : "rgba(0,255,156,0.45)",
                  textShadow: active ? "0 0 8px var(--green)" : "none",
                  borderBottom: active ? "2px solid var(--green)" : "2px solid transparent",
                }}
              >
                {m.label}
              </Link>
            );
          })}
        </div>

        {/* STATUS + MOBILE TOGGLE */}
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-2 text-xs tracking-widest"
            style={{ color: "rgba(0,255,156,0.5)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green)" }}
            />
            BASE LIVE
          </div>

          {/* hamburger */}
          <button
            className="sm:hidden flex flex-col gap-1 p-1"
            style={{ color: "var(--green)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-px transition-all duration-200"
              style={{
                background: "var(--green)",
                transform: mobileOpen ? "rotate(45deg) translate(2px, 2px)" : "none",
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-200"
              style={{
                background: "var(--green)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-200"
              style={{
                background: "var(--green)",
                transform: mobileOpen ? "rotate(-45deg) translate(2px, -2px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <div
          className="fixed top-12 left-0 right-0 z-40 flex flex-col font-mono"
          style={{
            background: "rgba(0,0,0,0.97)",
            borderBottom: "1px solid rgba(0,255,156,0.2)",
          }}
        >
          {MODULES.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setMobileOpen(false)}
                className="px-6 py-4 text-sm tracking-widest no-underline transition-colors"
                style={{
                  color: active ? "var(--green)" : "rgba(0,255,156,0.5)",
                  borderLeft: active ? "3px solid var(--green)" : "3px solid transparent",
                  background: active ? "rgba(0,255,156,0.04)" : "transparent",
                }}
              >
                {active ? "▸ " : "  "}{m.label}
              </Link>
            );
          })}
          <div
            className="px-6 py-3 text-xs flex items-center gap-2"
            style={{ color: "rgba(0,255,156,0.4)", borderTop: "1px solid rgba(0,255,156,0.1)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--green)" }}
            />
            BASE LIVE
          </div>
        </div>
      )}
    </>
  );
}
