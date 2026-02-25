"use client";
import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "BANKRSYNTH0123456789";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#00ff9f";
      ctx.font = fontSize + "px monospace";

      drops.forEach((y,i)=>{
        const text = letters[Math.floor(Math.random()*letters.length)];
        ctx.fillText(text, i*fontSize, y*fontSize);

        if (y*fontSize > canvas.height && Math.random()>0.975)
          drops[i]=0;
        drops[i]++;
      });
    }

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={ref} className="fixed inset-0 -z-10"/>;
}