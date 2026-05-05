"use client";
import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01";
    const fontSize = 13;
    // Fewer columns — less visual density
    const getCols = () => Math.floor(canvas.width / (fontSize * 1.8));
    let drops: number[] = Array(getCols())
      .fill(0)
      .map(() => Math.random() * (-canvas.height / fontSize));

    const draw = () => {
      // Heavy fade = very faint trails
      ctx.fillStyle = "rgba(5, 10, 5, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Very dim green characters
      ctx.fillStyle = "rgba(0, 180, 100, 0.35)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * (fontSize * 1.8);
        const y = drops[i] * fontSize;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.98) drops[i] = -5;
        // Slow drift — 0.4 instead of 1
        drops[i] += 0.4;
      }
    };

    const interval = setInterval(draw, 60);

    const onResize = () => {
      resize();
      drops = Array(getCols())
        .fill(0)
        .map(() => Math.random() * (-canvas.height / fontSize));
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // CSS class sets opacity 0.06 and z-index 0
  return <canvas ref={ref} className="matrix-canvas" />;
}
