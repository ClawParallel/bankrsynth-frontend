"use client";
import { useEffect, useState } from "react";

export default function SystemLogs() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const msgs = [
      "Connecting to Bankr infrastructure...",
      "Loading launch modules...",
      "Tracking whales...",
      "System ready."
    ];

    let i = 0;

    const interval = setInterval(() => {
      if (i < msgs.length) {
        setLogs(prev => [...prev, "> " + msgs[i]]);
        i++;
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-green-400 mt-6 text-left">
      {logs.map((l,i)=><div key={i}>{l}</div>)}
    </div>
  );
}