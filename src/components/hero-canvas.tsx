"use client";

import { useEffect, useRef } from "react";

// 多色光流 hero 背景：若干条平滑流动的丝带，多色渐变 + 加色混合发光。
// 性能：DPR≤2、requestAnimationFrame、离屏暂停；prefers-reduced-motion 时只画一帧静态光带。

const PALETTE = [
  [46, 155, 255], // blue
  [124, 92, 255], // indigo
  [196, 76, 255], // purple
  [255, 92, 168], // pink
  [255, 138, 76], // orange
];

type Ribbon = {
  baseY: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  width: number;
  c1: number[];
  c2: number[];
};

function rgba(c: number[], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

export function HeroCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // 别名为显式非空类型，便于在闭包中使用（TS 不跨闭包传递收窄）
    const cvs = canvas;
    const c2d = ctx;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;

    const ribbons: Ribbon[] = Array.from({ length: 6 }, (_, i) => ({
      baseY: 0.28 + i * 0.09,
      amp: 0.06 + (i % 3) * 0.03,
      freq: 1.1 + (i % 4) * 0.35,
      speed: 0.00018 + (i % 3) * 0.00006,
      phase: i * 1.7,
      width: 2 + (i % 3),
      c1: PALETTE[i % PALETTE.length],
      c2: PALETTE[(i + 2) % PALETTE.length],
    }));

    function resize() {
      const rect = cvs.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      cvs.width = Math.max(1, Math.floor(width * dpr));
      cvs.height = Math.max(1, Math.floor(height * dpr));
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawRibbon(r: Ribbon, t: number) {
      const yBase = r.baseY * height;
      const amp = r.amp * height;
      const step = Math.max(6, width / 120);

      const grad = c2d.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, rgba(r.c1, 0));
      grad.addColorStop(0.2, rgba(r.c1, 0.9));
      grad.addColorStop(0.5, rgba(r.c2, 0.95));
      grad.addColorStop(0.8, rgba(r.c1, 0.9));
      grad.addColorStop(1, rgba(r.c2, 0));

      c2d.beginPath();
      for (let x = 0; x <= width; x += step) {
        const u = x / width;
        const y =
          yBase +
          Math.sin(u * Math.PI * r.freq + t * r.speed + r.phase) * amp +
          Math.sin(u * Math.PI * (r.freq * 2.3) - t * r.speed * 1.6 + r.phase) *
            amp *
            0.35;
        if (x === 0) c2d.moveTo(x, y);
        else c2d.lineTo(x, y);
      }
      c2d.strokeStyle = grad;
      c2d.lineWidth = r.width;
      c2d.lineCap = "round";
      c2d.shadowColor = rgba(r.c2, 0.7);
      c2d.shadowBlur = 28;
      c2d.stroke();
    }

    function frame(now: number) {
      c2d.clearRect(0, 0, width, height);
      c2d.globalCompositeOperation = "lighter";
      for (const r of ribbons) drawRibbon(r, now);
      c2d.globalCompositeOperation = "source-over";
      if (running && !reduceMotion) raf = requestAnimationFrame(frame);
    }

    resize();
    frame(0);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
