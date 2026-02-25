import MatrixRain from "@/components/MatrixRain";
import SystemLogs from "@/components/SystemLogs";
import TypingText from "@/components/TypingText";
import AccessGranted from "@/components/AccessGranted";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">

      <MatrixRain />
      <AccessGranted />

      <h1 className="text-6xl font-bold">
        <TypingText text="BANKRSYNTH TERMINAL" />
      </h1>

      <SystemLogs />

      <div className="flex gap-6 mt-10">
        <Link href="/launch">
          <button className="border px-6 py-3 hover:bg-green-400 hover:text-black">
            LAUNCH MODULE
          </button>
        </Link>

        <Link href="/intel">
          <button className="border px-6 py-3 hover:bg-green-400 hover:text-black">
            INTEL MODULE
          </button>
        </Link>
      </div>

    </main>
  );
}