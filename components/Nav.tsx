"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MODULES = [
  { href: "/launch", label: "launch" },
  { href: "/agent", label: "agent" },
  { href: "/terminal", label: "terminal" },
  { href: "/intel", label: "intel" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-green-400/40 px-4 py-2 flex flex-wrap items-center gap-1 text-xs font-mono bg-black/80 backdrop-blur sticky top-0 z-40">
      <Link href="/" className="text-green-400 hover:text-white transition-colors">
        bankrsynth:~$
      </Link>
      <span className="text-green-400/40 mx-1">/</span>
      {MODULES.map((m, i) => (
        <span key={m.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-green-400/40">/</span>}
          <Link
            href={m.href}
            className={`px-1 transition-colors ${
              pathname === m.href
                ? "text-black bg-green-400 px-1"
                : "text-green-400 hover:text-white"
            }`}
          >
            [{m.label}]
          </Link>
        </span>
      ))}
    </nav>
  );
}
