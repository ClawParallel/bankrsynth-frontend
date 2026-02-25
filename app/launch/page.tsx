"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");

  const deploy = async () => {
    await fetch("https://bankrsynth-backend-production.up.railway.app/launch", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name, symbol, description })
    });

    alert("Token launching 🚀");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">

      <h1 className="text-5xl font-bold mb-8">Launch Token</h1>

      <div className="w-full max-w-lg space-y-4">

        <input
          placeholder="Token Name"
          className="w-full p-4 bg-black border"
          onChange={e=>setName(e.target.value)}
        />

        <input
          placeholder="Symbol"
          className="w-full p-4 bg-black border"
          onChange={e=>setSymbol(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-4 bg-black border"
          onChange={e=>setDescription(e.target.value)}
        />

        <button
          onClick={deploy}
          className="w-full border py-4 hover:bg-green-400 hover:text-black"
        >
          LAUNCH
        </button>

      </div>

    </main>
  );
}