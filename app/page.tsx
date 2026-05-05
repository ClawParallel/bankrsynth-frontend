import MatrixRain from "@/components/MatrixRain";
import SystemLogs from "@/components/SystemLogs";
import TypingText from "@/components/TypingText";
import AccessGranted from "@/components/AccessGranted";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative">
      <MatrixRain />
      <AccessGranted />

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold glow-text">
        <TypingText text="BANKRSYNTH TERMINAL" />
      </h1>

      <SystemLogs />

      <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link href="/launch" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors text-sm tracking-widest">
            LAUNCH MODULE
          </button>
        </Link>

        <Link href="/agent" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors text-sm tracking-widest">
            AGENT MODULE
          </button>
        </Link>

        <Link href="/terminal" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors text-sm tracking-widest">
            AI TERMINAL
          </button>
        </Link>

        <Link href="/intel" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors text-sm tracking-widest">
            INTEL FEED
          </button>
        </Link>
      </div>
    </main>
  );
}
