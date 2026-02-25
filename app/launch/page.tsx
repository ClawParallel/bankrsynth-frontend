"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");

  const launch = async () => {
    if (!name) {
      alert("Token name required");
      return;
    }

    const res = await fetch(
      "https://bankrsynth-backend-production.up.railway.app/launch",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol,
          description
        })
      }
    );

    const data = await res.json();
    console.log(data);

    alert("Launch response received");
  };

  return (
    <main className="min-h-screen p-6 text-center">
      <h1 className="text-5xl mb-8">LAUNCH TOKEN</h1>

      <div className="max-w-xl mx-auto border p-6">

        <input
          placeholder="Token Name"
          className="w-full border p-3 mb-4"
          onChange={e => setName(e.target.value)}
        />

        <input
          placeholder="Symbol"
          className="w-full border p-3 mb-4"
          onChange={e => setSymbol(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 mb-4"
          onChange={e => setDescription(e.target.value)}
        />

        <button
          onClick={launch}
          className="border px-6 py-3"
        >
          EXECUTE LAUNCH
        </button>

      </div>
    </main>
  );
}