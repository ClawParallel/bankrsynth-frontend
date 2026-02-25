"use client";
import { useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import TypingText from "@/components/TypingText";

export default function IntelPage() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch("https://bankrsynth-backend-production.up.railway.app/intel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address })
    });

    setData(await res.json());
  };

  return (
    <main className="min-h-screen p-6 text-green-400">

      {/* MATRIX BACKGROUND */}
      <MatrixRain />

      <h1 className="text-5xl text-center mb-8">
        INTEL TERMINAL
      </h1>

      <div className="max-w-2xl mx-auto">

        <div className="border p-6 bg-black/80">

          <TypingText text="> Enter address to analyze:" />

          <input
            className="w-full mt-4 bg-black border p-3 outline-none"
            placeholder="0x..."
            onChange={e => setAddress(e.target.value)}
          />

          <button
            onClick={analyze}
            className="mt-4 border px-6 py-3 hover:bg-green-400 hover:text-black"
          >
            EXECUTE SCAN
          </button>

          {data && (
            <div className="mt-6 text-green-400">

              <TypingText text="> Scan complete" />
              <TypingText text="> Parsing intelligence data..." />
              <TypingText text="> Output:" />

              <pre className="mt-4 overflow-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>

              <TypingText text="> END OF TRANSMISSION" />

            </div>
          )}

        </div>

      </div>

    </main>
  );
}