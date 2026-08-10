"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type SceneProfile = {
  pixelRatioCap: number;
  renderScale: number;
  sparkleCount: number;
  targetFPS: number;
  staticOnly: boolean;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Point = {
  x: number;
  y: number;
};

const PALETTES = [
  { primary: "#7c3aed", secondary: "#38bdf8", accent: "#f6c86e", label: "violet" },
  { primary: "#60a5fa", secondary: "#a78bfa", accent: "#22d3ee", label: "blue" },
  { primary: "#f6c86e", secondary: "#fb7185", accent: "#ffffff", label: "gold" },
  { primary: "#34d399", secondary: "#67e8f9", accent: "#ecfeff", label: "green" },
  { primary: "#f0abfc", secondary: "#f6c86e", accent: "#ffffff", label: "luxe" },
];

function getSceneProfile(): SceneProfile {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallestSide = Math.min(window.innerWidth, window.innerHeight);
  const isMobile = coarsePointer || smallestSide < 720;

  return {
    pixelRatioCap: isMobile ? 1.1 : 1.35,
    renderScale: isMobile ? 0.56 : 0.68,
    sparkleCount: isMobile ? 24 : 42,
    targetFPS: reducedMotion ? 0 : isMobile ? 22 : 28,
    staticOnly: reducedMotion,
  };
}

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

function rgba(color: Rgb, alpha: number) {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mixNumber(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function cubicBezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, amount: number): Point {
  const t = clamp(amount, 0, 1);
  const inverse = 1 - t;
  const inverse2 = inverse * inverse;
  const t2 = t * t;

  return {
    x: inverse2 * inverse * p0.x + 3 * inverse2 * t * p1.x + 3 * inverse * t2 * p2.x + t2 * t * p3.x,
    y: inverse2 * inverse * p0.y + 3 * inverse2 * t * p1.y + 3 * inverse * t2 * p2.y + t2 * t * p3.y,
  };
}

function getScrollProgress() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return clamp(window.scrollY / maxScroll, 0, 1);
}

function getPalette(progress: number) {
  const maxIndex = PALETTES.length - 1;
  const scaled = progress * maxIndex;
  const fromIndex = Math.min(maxIndex, Math.floor(scaled));
  const toIndex = Math.min(maxIndex, fromIndex + 1);
  const amount = scaled - fromIndex;
  const from = PALETTES[fromIndex];
  const to = PALETTES[toIndex];

  return {
    label: amount > 0.5 ? to.label : from.label,
    primary: mixRgb(hexToRgb(from.primary), hexToRgb(to.primary), amount),
    secondary: mixRgb(hexToRgb(from.secondary), hexToRgb(to.secondary), amount),
    accent: mixRgb(hexToRgb(from.accent), hexToRgb(to.accent), amount),
  };
}

function getCometPoint(progress: number, width: number, height: number): Point {
  const travel = clamp(progress, 0, 1);

  if (travel < 0.68) {
    const amount = easeInOutCubic(travel / 0.68);
    return cubicBezierPoint(
      { x: width * 0.06, y: height * 0.34 },
      { x: width * 0.18, y: height * 0.16 },
      { x: width * 0.62, y: height * 0.52 },
      { x: width * 0.92, y: height * 0.3 },
      amount,
    );
  }

  const amount = easeInOutCubic((travel - 0.68) / 0.32);
  return cubicBezierPoint(
    { x: width * 0.92, y: height * 0.3 },
    { x: width * 0.98, y: height * 0.56 },
    { x: width * 0.52, y: height * 0.54 },
    { x: width * 0.5, y: height * 0.7 },
    amount,
  );
}

function getCometPosition(progress: number, width: number, height: number, time: number): Point {
  const point = getCometPoint(progress, width, height);
  const drift = Math.sin(time * 1.1 + progress * Math.PI * 8) * height * 0.008;

  return {
    x: point.x,
    y: point.y + drift,
  };
}

function drawCometTrail(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
  time: number,
  radius: number,
  palette: { primary: Rgb; secondary: Rgb; accent: Rgb },
) {
  const layerConfig = [
    { color: palette.primary, width: radius * 1.5, alpha: 0.1, depth: 0.2 },
    { color: palette.secondary, width: radius * 0.82, alpha: 0.22, depth: 0.16 },
    { color: palette.accent, width: radius * 0.28, alpha: 0.58, depth: 0.1 },
  ];

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  layerConfig.forEach((layer) => {
    const samples = 24;
    for (let index = 1; index < samples; index += 1) {
      const fromProgress = clamp(progress - (index / samples) * layer.depth, 0, 1);
      const toProgress = clamp(progress - ((index - 1) / samples) * layer.depth, 0, 1);
      if (Math.abs(fromProgress - toProgress) < 0.0001) continue;

      const from = getCometPosition(fromProgress, width, height, time - index * 0.016);
      const to = getCometPosition(toProgress, width, height, time - (index - 1) * 0.016);
      const fade = Math.pow(1 - index / samples, 1.7);

      ctx.strokeStyle = rgba(layer.color, layer.alpha * fade);
      ctx.lineWidth = Math.max(0.45, layer.width * fade);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawCometParticles(
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
  time: number,
  radius: number,
  palette: { primary: Rgb; secondary: Rgb; accent: Rgb },
  count: number,
) {
  const before = getCometPoint(clamp(progress - 0.015, 0, 1), width, height);
  const after = getCometPoint(clamp(progress + 0.015, 0, 1), width, height);
  const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
  const normalX = -(after.y - before.y) / length;
  const normalY = (after.x - before.x) / length;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let index = 0; index < count; index += 1) {
    const seed = Math.sin(index * 73.91) * 10000;
    const random = seed - Math.floor(seed);
    const trailDepth = mixNumber(0.012, 0.19, index / count);
    const sampleProgress = clamp(progress - trailDepth, 0, 1);
    const base = getCometPosition(sampleProgress, width, height, time - index * 0.03);
    const spread = (random - 0.5) * radius * 9 * (index / count);
    const shimmer = Math.sin(time * 2.8 + index * 1.7) * radius * 0.8;
    const px = base.x + normalX * (spread + shimmer);
    const py = base.y + normalY * (spread + shimmer);
    if (px < -30 || px > width + 30 || py < -30 || py > height + 30) continue;

    const fade = Math.pow(1 - index / count, 1.4);
    const pulse = 0.2 + Math.max(0, Math.sin(time * 4 + index)) * 0.45;
    const particleRadius = Math.max(0.7, radius * (0.08 + random * 0.12) * fade);
    ctx.fillStyle = rgba(index % 3 === 0 ? palette.accent : index % 2 === 0 ? palette.secondary : palette.primary, pulse * fade);
    ctx.beginPath();
    ctx.arc(px, py, particleRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawRealisticStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  palette: { primary: Rgb; secondary: Rgb; accent: Rgb },
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const corona = ctx.createRadialGradient(x, y, 0, x, y, radius * 6.2);
  corona.addColorStop(0, rgba(palette.accent, 0.9));
  corona.addColorStop(0.2, rgba(palette.primary, 0.34));
  corona.addColorStop(0.62, rgba(palette.secondary, 0.09));
  corona.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(x, y, radius * 6.2, 0, Math.PI * 2);
  ctx.fill();

  const pulse = 0.88 + Math.sin(time * 5.4) * 0.08;
  ctx.translate(x, y);
  ctx.rotate(time * 0.12);

  for (let ray = 0; ray < 8; ray += 1) {
    const angle = (ray / 8) * Math.PI * 2;
    const longRay = ray % 2 === 0;
    const rayLength = radius * (longRay ? 4.6 : 2.35) * pulse;
    const rayWidth = radius * (longRay ? 0.12 : 0.07);
    const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
    gradient.addColorStop(0, rgba(palette.accent, longRay ? 0.92 : 0.64));
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = rayWidth;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
    ctx.stroke();
  }

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.22);
  core.addColorStop(0, "rgba(255, 255, 255, 1)");
  core.addColorStop(0.32, rgba(palette.accent, 0.96));
  core.addColorStop(1, rgba(palette.primary, 0.04));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function PrestigiaScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const hiddenForDnaPage = pathname?.startsWith("/realisations") ?? false;

  useEffect(() => {
    if (hiddenForDnaPage) return;

    const targetCanvas = canvasRef.current;
    if (!targetCanvas) return;
    const canvas: HTMLCanvasElement = targetCanvas;
    const targetContext = canvas.getContext("2d", { alpha: true });
    if (!targetContext) {
      canvas.dataset.prestigiaStarScene = "canvas-unavailable";
      return;
    }

    const ctx: CanvasRenderingContext2D = targetContext;
    const profile = getSceneProfile();
    let mounted = true;
    let rafId = 0;
    let lastFrame = 0;
    let logicalWidth = 1;
    let logicalHeight = 1;
    let transformScale = 1;
    canvas.dataset.prestigiaStarScene = "ready";

    function resize() {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      logicalWidth = Math.max(1, Math.floor(width));
      logicalHeight = Math.max(1, Math.floor(height));
      transformScale = Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap) * profile.renderScale;
      canvas.width = Math.max(1, Math.floor(logicalWidth * transformScale));
      canvas.height = Math.max(1, Math.floor(logicalHeight * transformScale));
      ctx.setTransform(transformScale, 0, 0, transformScale, 0, 0);
    }

    function draw(now = performance.now()) {
      const time = now * 0.001;
      const scrollProgress = getScrollProgress();
      const palette = getPalette(scrollProgress);
      const starPoint = getCometPosition(scrollProgress, logicalWidth, logicalHeight, time);
      const visibleX = clamp(starPoint.x, 0, logicalWidth);
      const visibleY = clamp(starPoint.y, 0, logicalHeight);
      const starRadius = Math.max(10, Math.min(logicalWidth, logicalHeight) * 0.021);

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const glow = ctx.createRadialGradient(
        visibleX,
        visibleY,
        0,
        visibleX,
        visibleY,
        Math.min(logicalWidth, logicalHeight) * 0.36,
      );
      glow.addColorStop(0, rgba(palette.accent, 0.13));
      glow.addColorStop(0.34, rgba(palette.primary, 0.09));
      glow.addColorStop(0.68, rgba(palette.secondary, 0.035));
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      drawCometTrail(ctx, scrollProgress, logicalWidth, logicalHeight, time, starRadius, palette);
      drawCometParticles(
        ctx,
        scrollProgress,
        logicalWidth,
        logicalHeight,
        time,
        starRadius,
        palette,
        profile.sparkleCount,
      );
      drawRealisticStar(ctx, starPoint.x, starPoint.y, starRadius, time, palette);

      canvas.dataset.prestigiaStarScene = "rendered";
      canvas.dataset.stage = palette.label;
    }

    function render(now: number) {
      if (!mounted) return;
      rafId = requestAnimationFrame(render);
      const frameInterval = profile.targetFPS > 0 ? 1000 / profile.targetFPS : Number.POSITIVE_INFINITY;
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      draw(now);
    }

    function startLoop() {
      if (profile.staticOnly) {
        draw();
        return;
      }

      if (!rafId && !document.hidden) {
        lastFrame = 0;
        rafId = requestAnimationFrame(render);
      }
    }

    function stopLoop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function handleVisibility() {
      if (document.hidden) stopLoop();
      else startLoop();
    }

    function handleScroll() {
      if (profile.staticOnly) draw();
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);
    resize();
    draw();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("scroll", handleScroll, { passive: true });
    startLoop();

    return () => {
      mounted = false;
      stopLoop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hiddenForDnaPage]);

  if (hiddenForDnaPage) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        height: "100vh",
        inset: 0,
        opacity: 0.78,
        pointerEvents: "none",
        position: "fixed",
        width: "100vw",
        zIndex: 2,
      }}
    />
  );
}
