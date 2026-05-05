"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const modules = [
  { href: "/launch",   label: "LAUNCH"   },
  { href: "/agent",    label: "AGENT"    },
  { href: "/terminal", label: "TERMINAL" },
  { href: "/intel",    label: "INTEL"    },
];

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="nav-bar">
      {/* Logo */}
      <Link href="/" className="no-underline">
        <span className="font-mono text-sm tracking-widest text-green-400 glow-text-soft
                         hover:glow-text transition-all cursor-pointer select-none">
          ◈ BANKRSYNTH
        </span>
      </Link>

      {/* Module links */}
      <div className="flex items-center gap-1">
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

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400
                         shadow-[0_0_6px_#00ff9c] animate-pulse" />
        <span className="text-xs muted tracking-widest hidden sm:block">BASE</span>
      </div>
    </nav>
  );
}
