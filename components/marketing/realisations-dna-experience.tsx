"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, CSSProperties, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Dumbbell,
  Film,
  GraduationCap,
  Hammer,
  HeartPulse,
  Monitor,
  ShoppingBag,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";
import type * as Three from "three";
import type { Project } from "@/data/projects";
import { normalizeImageUrl, shouldBypassImageOptimization } from "@/lib/parse";
import { cn } from "@/lib/utils";

type SectorTheme = {
  key: string;
  label: string;
  cssPrimary: string;
  cssSecondary: string;
  cssAccent: string;
  cssGlow: string;
  radius: number;
  twist: number;
  speed: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type SceneStyle = CSSProperties & {
  "--scene-primary": string;
  "--scene-secondary": string;
  "--scene-accent": string;
  "--scene-glow": string;
};

const DEFAULT_THEME: SectorTheme = {
  key: "digital",
  label: "Digital",
  cssPrimary: "#7c3aed",
  cssSecondary: "#38bdf8",
  cssAccent: "#f6c86e",
  cssGlow: "rgba(124, 58, 237, 0.24)",
  radius: 1.04,
  twist: 3.2,
  speed: 0.48,
  icon: Briefcase,
};

const THEME_MATCHERS: Array<{ test: (sector: string) => boolean; theme: SectorTheme }> = [
  {
    test: (sector) => sector.includes("immo"),
    theme: {
      key: "real-estate",
      label: "Immobilier",
      cssPrimary: "#f6c86e",
      cssSecondary: "#38bdf8",
      cssAccent: "#ffffff",
      cssGlow: "rgba(246, 200, 110, 0.24)",
      radius: 1.18,
      twist: 2.65,
      speed: 0.34,
      icon: Building2,
    },
  },
  {
    test: (sector) => sector.includes("sport") || sector.includes("loisir") || sector.includes("formation sportive"),
    theme: {
      key: "sport",
      label: "Sport",
      cssPrimary: "#a3e635",
      cssSecondary: "#22d3ee",
      cssAccent: "#ffffff",
      cssGlow: "rgba(163, 230, 53, 0.2)",
      radius: 0.98,
      twist: 3.75,
      speed: 0.72,
      icon: Dumbbell,
    },
  },
  {
    test: (sector) => sector.includes("video") || sector.includes("animation") || sector.includes("contenu"),
    theme: {
      key: "video",
      label: "Video",
      cssPrimary: "#38bdf8",
      cssSecondary: "#f0abfc",
      cssAccent: "#ffffff",
      cssGlow: "rgba(56, 189, 248, 0.22)",
      radius: 1,
      twist: 4.05,
      speed: 0.66,
      icon: Film,
    },
  },
  {
    test: (sector) => sector.includes("btp") || sector.includes("materiau") || sector.includes("construction"),
    theme: {
      key: "build",
      label: "BTP",
      cssPrimary: "#f97316",
      cssSecondary: "#facc15",
      cssAccent: "#d6d3d1",
      cssGlow: "rgba(249, 115, 22, 0.2)",
      radius: 1.1,
      twist: 2.85,
      speed: 0.4,
      icon: Hammer,
    },
  },
  {
    test: (sector) => sector.includes("restauration") || sector.includes("food") || sector.includes("restaurant"),
    theme: {
      key: "food",
      label: "Restauration",
      cssPrimary: "#fb7185",
      cssSecondary: "#fbbf24",
      cssAccent: "#fef3c7",
      cssGlow: "rgba(251, 113, 133, 0.22)",
      radius: 1.02,
      twist: 3.1,
      speed: 0.52,
      icon: Utensils,
    },
  },
  {
    test: (sector) => sector.includes("sante") || sector.includes("medical"),
    theme: {
      key: "health",
      label: "Sante",
      cssPrimary: "#34d399",
      cssSecondary: "#67e8f9",
      cssAccent: "#ecfeff",
      cssGlow: "rgba(52, 211, 153, 0.2)",
      radius: 1.06,
      twist: 3.35,
      speed: 0.38,
      icon: HeartPulse,
    },
  },
  {
    test: (sector) => sector.includes("mode") || sector.includes("luxe") || sector.includes("brand"),
    theme: {
      key: "luxury",
      label: "Luxe",
      cssPrimary: "#f0abfc",
      cssSecondary: "#f6c86e",
      cssAccent: "#ffffff",
      cssGlow: "rgba(240, 171, 252, 0.2)",
      radius: 1.14,
      twist: 2.95,
      speed: 0.32,
      icon: Sparkles,
    },
  },
  {
    test: (sector) => sector.includes("tech") || sector.includes("saas") || sector.includes("web"),
    theme: {
      key: "tech",
      label: "Tech",
      cssPrimary: "#60a5fa",
      cssSecondary: "#a78bfa",
      cssAccent: "#22d3ee",
      cssGlow: "rgba(96, 165, 250, 0.22)",
      radius: 0.96,
      twist: 3.65,
      speed: 0.62,
      icon: Monitor,
    },
  },
  {
    test: (sector) => sector.includes("commerce") || sector.includes("retail"),
    theme: {
      key: "commerce",
      label: "E-commerce",
      cssPrimary: "#ff8a3d",
      cssSecondary: "#ec4899",
      cssAccent: "#ffedd5",
      cssGlow: "rgba(255, 138, 61, 0.2)",
      radius: 1.02,
      twist: 3.45,
      speed: 0.58,
      icon: ShoppingBag,
    },
  },
  {
    test: (sector) => sector.includes("education") || sector.includes("ecole") || sector.includes("academy"),
    theme: {
      key: "education",
      label: "Education",
      cssPrimary: "#2dd4bf",
      cssSecondary: "#fde047",
      cssAccent: "#e0f2fe",
      cssGlow: "rgba(45, 212, 191, 0.2)",
      radius: 1.08,
      twist: 3.25,
      speed: 0.45,
      icon: GraduationCap,
    },
  },
];

function normalizeSector(sector: string) {
  return sector
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSectorTheme(sector: string): SectorTheme {
  const normalized = normalizeSector(sector);
  return THEME_MATCHERS.find((entry) => entry.test(normalized))?.theme ?? DEFAULT_THEME;
}

function createSceneStyle(theme: SectorTheme): SceneStyle {
  return {
    "--scene-primary": theme.cssPrimary,
    "--scene-secondary": theme.cssSecondary,
    "--scene-accent": theme.cssAccent,
    "--scene-glow": theme.cssGlow,
  };
}

function getCanvasProfile() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallestSide = Math.min(window.innerWidth, window.innerHeight);
  const isMobile = coarsePointer || smallestSide < 720;
  const highDensityMobile = isMobile && (window.devicePixelRatio || 1) > 2;

  return {
    helixHeight: isMobile ? 8.2 : 9.8,
    markerCount: isMobile ? 8 : 10,
    nodeCount: isMobile ? 76 : 88,
    pixelRatioCap: isMobile ? (highDensityMobile ? 2.35 : 2) : 1.4,
    renderScale: isMobile ? 1.06 : 0.68,
    targetFPS: reducedMotion ? 0 : highDensityMobile ? 18 : isMobile ? 22 : 24,
    staticOnly: reducedMotion,
  };
}

const STATIC_DNA_POINTS = Array.from({ length: 26 }, (_, index) => {
  const progress = index / 25;
  const y = 6 + progress * 88;
  const angle = progress * Math.PI * 7.5;
  const spread = 18 + Math.sin(progress * Math.PI * 2) * 3;

  return {
    leftX: 50 - Math.cos(angle) * spread,
    rightX: 50 + Math.cos(angle) * spread,
    y,
  };
});

function DnaStaticPreview({ activeSector, hidden }: { activeSector: string; hidden: boolean }) {
  const theme = getSectorTheme(activeSector);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
        hidden ? "opacity-0" : "opacity-90",
      )}
      style={createSceneStyle(theme)}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-[76svh] max-h-[760px] w-[min(74vw,620px)] overflow-visible"
        role="img"
      >
        <defs>
          <filter id="dna-static-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polyline
          fill="none"
          points={STATIC_DNA_POINTS.map((point) => `${point.leftX},${point.y}`).join(" ")}
          stroke="var(--scene-primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.65"
          filter="url(#dna-static-glow)"
        />
        <polyline
          fill="none"
          points={STATIC_DNA_POINTS.map((point) => `${point.rightX},${point.y}`).join(" ")}
          stroke="var(--scene-secondary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.65"
          filter="url(#dna-static-glow)"
        />
        {STATIC_DNA_POINTS.map((point, index) => (
          <g key={index} opacity={index % 2 === 0 ? 0.88 : 0.64}>
            <line
              x1={point.leftX}
              x2={point.rightX}
              y1={point.y}
              y2={point.y}
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="0.22"
            />
            <rect
              x={point.leftX - 0.72}
              y={point.y - 0.72}
              width="1.44"
              height="1.44"
              rx="0.2"
              fill="var(--scene-primary)"
              transform={`rotate(45 ${point.leftX} ${point.y})`}
            />
            <rect
              x={point.rightX - 0.72}
              y={point.y - 0.72}
              width="1.44"
              height="1.44"
              rx="0.2"
              fill="var(--scene-secondary)"
              transform={`rotate(45 ${point.rightX} ${point.y})`}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function DnaCanvas({
  activeIndex,
  activeSector,
  totalProjects,
}: {
  activeIndex: number;
  activeSector: string;
  totalProjects: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(getSectorTheme(activeSector));
  const activeIndexRef = useRef(activeIndex);
  const renderStaticRef = useRef<(() => void) | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [shouldInit, setShouldInit] = useState(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const theme = getSectorTheme(activeSector);
    themeRef.current = theme;
    if (canvasRef.current) {
      canvasRef.current.dataset.activeSector = theme.key;
    }
    renderStaticRef.current?.();
  }, [activeSector]);

  useEffect(() => {
    const start = () => setShouldInit(true);
    const idleTimer = window.setTimeout(start, 6500);

    window.addEventListener("scroll", start, { passive: true, once: true });
    window.addEventListener("wheel", start, { passive: true, once: true });
    window.addEventListener("touchstart", start, { passive: true, once: true });
    window.addEventListener("pointerdown", start, { passive: true, once: true });
    window.addEventListener("keydown", start, { once: true });

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", start);
      window.removeEventListener("wheel", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  useEffect(() => {
    if (!shouldInit) return;

    let mounted = true;
    let rafId = 0;
    let timeoutHandle = 0;
    let scrollRafId = 0;
    let lastFrame = 0;
    let scrollProgress = 0;
    let stageTravel = 1;
    let portrait = false;
    let reportedReady = false;
    let cleanupScene: (() => void) | null = null;

    async function init() {
      const targetCanvas = canvasRef.current;
      if (!targetCanvas || !mounted) return;
      const canvas: HTMLCanvasElement = targetCanvas;

      canvas.dataset.dnaScene = "loading";
      const THREE = await import("three");
      if (!mounted) return;

      const profile = getCanvasProfile();
      const activeTheme = themeRef.current;
      const disposables: Array<{ dispose: () => void }> = [];
      const orbitControllers: Array<{ object: Three.Object3D; speed: number }> = [];
      const current = {
        primary: new THREE.Color(activeTheme.cssPrimary),
        secondary: new THREE.Color(activeTheme.cssSecondary),
        accent: new THREE.Color(activeTheme.cssAccent),
        radius: activeTheme.radius,
        twist: activeTheme.twist,
        speed: activeTheme.speed,
      };
      const targetPrimary = new THREE.Color();
      const targetSecondary = new THREE.Color();
      const targetAccent = new THREE.Color();

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          canvas,
          powerPreference: "low-power",
        });
      } catch {
        canvas.dataset.dnaScene = "webgl-unavailable";
        return;
      }

      canvas.dataset.dnaScene = "webgl-ready";
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.05, 12.1);

      const rig = new THREE.Group();
      rig.rotation.set(-0.16, 0.25, -0.08);
      scene.add(rig);

      scene.add(new THREE.HemisphereLight(0xe7ddff, 0x070912, 1.7));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.25);
      keyLight.position.set(-2.6, 4.5, 6.2);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0x38bdf8, 3.8, 14);
      rimLight.position.set(3.8, -2.5, 3.4);
      scene.add(rimLight);

      const strandA = new Float32Array(profile.nodeCount * 3);
      const strandB = new Float32Array(profile.nodeCount * 3);
      const rungs = new Float32Array(profile.nodeCount * 2 * 3);

      const strandGeometryA = new THREE.BufferGeometry();
      const strandGeometryB = new THREE.BufferGeometry();
      const rungGeometry = new THREE.BufferGeometry();
      const strandAttributeA = new THREE.BufferAttribute(strandA, 3);
      const strandAttributeB = new THREE.BufferAttribute(strandB, 3);
      const rungAttribute = new THREE.BufferAttribute(rungs, 3);
      strandAttributeA.setUsage(THREE.DynamicDrawUsage);
      strandAttributeB.setUsage(THREE.DynamicDrawUsage);
      rungAttribute.setUsage(THREE.DynamicDrawUsage);
      strandGeometryA.setAttribute("position", strandAttributeA);
      strandGeometryB.setAttribute("position", strandAttributeB);
      rungGeometry.setAttribute("position", rungAttribute);

      const strandMaterialA = new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: current.primary,
        depthWrite: false,
        opacity: 0.82,
        transparent: true,
      });
      const strandMaterialB = new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: current.secondary,
        depthWrite: false,
        opacity: 0.82,
        transparent: true,
      });
      const rungMaterial = new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: current.accent,
        depthWrite: false,
        opacity: 0.36,
        transparent: true,
      });

      rig.add(new THREE.Line(strandGeometryA, strandMaterialA));
      rig.add(new THREE.Line(strandGeometryB, strandMaterialB));
      rig.add(new THREE.LineSegments(rungGeometry, rungMaterial));

      const nodeGeometry = new THREE.OctahedronGeometry(0.075, 0);
      const nodeMaterialA = new THREE.MeshStandardMaterial({
        color: current.primary,
        emissive: current.primary,
        emissiveIntensity: 0.82,
        metalness: 0.18,
        roughness: 0.45,
      });
      const nodeMaterialB = new THREE.MeshStandardMaterial({
        color: current.secondary,
        emissive: current.secondary,
        emissiveIntensity: 0.82,
        metalness: 0.18,
        roughness: 0.45,
      });
      const nodeMeshA = new THREE.InstancedMesh(nodeGeometry, nodeMaterialA, profile.nodeCount);
      const nodeMeshB = new THREE.InstancedMesh(nodeGeometry, nodeMaterialB, profile.nodeCount);
      nodeMeshA.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      nodeMeshB.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      rig.add(nodeMeshA, nodeMeshB);

      const markerGeometry = new THREE.TetrahedronGeometry(0.13, 0);
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: current.accent,
        emissive: current.accent,
        emissiveIntensity: 1.05,
        metalness: 0.28,
        roughness: 0.38,
      });
      const markers = new THREE.InstancedMesh(markerGeometry, markerMaterial, profile.markerCount);
      rig.add(markers);

      const orbitGeometry = new THREE.TorusGeometry(2.42, 0.006, 5, 72);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: current.accent,
        depthWrite: false,
        opacity: 0.16,
        transparent: true,
      });
      for (let index = 0; index < 3; index += 1) {
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.set(0.8 + index * 0.28, index * 0.7, index * 0.42);
        rig.add(orbit);
        orbitControllers.push({ object: orbit, speed: index % 2 ? -0.01 : 0.012 });
      }

      const signalGeometry = new THREE.BufferGeometry();
      const signalPositions = new Float32Array(32 * 3);
      for (let index = 0; index < 32; index += 1) {
        const base = index * 3;
        const seed = Math.sin(index * 53.17) * 10000;
        const offset = seed - Math.floor(seed);
        signalPositions[base] = -3.4 + ((index % 4) / 3) * 6.8 + offset * 0.24;
        signalPositions[base + 1] = -2.9 + (index / 31) * 5.8;
        signalPositions[base + 2] = -1.6 + ((index * 7) % 11) * 0.3;
      }
      signalGeometry.setAttribute("position", new THREE.BufferAttribute(signalPositions, 3));
      const signalMaterial = new THREE.PointsMaterial({
        blending: THREE.AdditiveBlending,
        color: current.accent,
        depthWrite: false,
        opacity: 0.36,
        size: 0.026,
        transparent: true,
      });
      const signals = new THREE.Points(signalGeometry, signalMaterial);
      rig.add(signals);

      disposables.push(
        strandGeometryA,
        strandGeometryB,
        rungGeometry,
        strandMaterialA,
        strandMaterialB,
        rungMaterial,
        nodeGeometry,
        nodeMaterialA,
        nodeMaterialB,
        markerGeometry,
        markerMaterial,
        orbitGeometry,
        orbitMaterial,
        signalGeometry,
        signalMaterial,
      );

      const dummy = new THREE.Object3D();
      const stage = canvas.closest<HTMLElement>("[data-dna-stage]");

      function refreshScrollProgress() {
        if (stage) {
          const rect = stage.getBoundingClientRect();
          scrollProgress = Math.max(0, Math.min(1, -rect.top / stageTravel));
          return;
        }

        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      }

      function scheduleScrollRefresh() {
        if (scrollRafId) return;
        scrollRafId = requestAnimationFrame(() => {
          scrollRafId = 0;
          refreshScrollProgress();
          if (profile.staticOnly) draw();
        });
      }

      function resize() {
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        if (!width || !height) return;

        renderer.setSize(
          Math.max(1, Math.floor(width * profile.renderScale)),
          Math.max(1, Math.floor(height * profile.renderScale)),
          false,
        );
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        stageTravel = Math.max(1, (stage?.offsetHeight ?? document.documentElement.scrollHeight) - window.innerHeight);
        portrait = width < height;
        rig.scale.setScalar(portrait ? 0.78 : 1.04);
        rig.position.set(portrait ? 0 : 0.16, portrait ? -0.08 : 0, 0);
        refreshScrollProgress();
      }

      function lerpNumber(value: number, target: number, amount: number) {
        return value + (target - value) * amount;
      }

      function updateGeometry(time: number) {
        const theme = themeRef.current;
        const projectProgress = totalProjects > 1 ? activeIndexRef.current / (totalProjects - 1) : scrollProgress;

        targetPrimary.set(theme.cssPrimary);
        targetSecondary.set(theme.cssSecondary);
        targetAccent.set(theme.cssAccent);
        current.primary.lerp(targetPrimary, 0.045);
        current.secondary.lerp(targetSecondary, 0.045);
        current.accent.lerp(targetAccent, 0.045);
        current.radius = lerpNumber(current.radius, theme.radius, 0.04);
        current.twist = lerpNumber(current.twist, theme.twist, 0.04);
        current.speed = lerpNumber(current.speed, theme.speed, 0.04);

        strandMaterialA.color.copy(current.primary);
        strandMaterialB.color.copy(current.secondary);
        rungMaterial.color.copy(current.accent);
        nodeMaterialA.color.copy(current.primary);
        nodeMaterialA.emissive.copy(current.primary);
        nodeMaterialB.color.copy(current.secondary);
        nodeMaterialB.emissive.copy(current.secondary);
        markerMaterial.color.copy(current.accent);
        markerMaterial.emissive.copy(current.accent);
        orbitMaterial.color.copy(current.accent);
        signalMaterial.color.copy(current.accent);

        rig.rotation.y = 0.28 + time * 0.12 + scrollProgress * Math.PI * 1.25 + projectProgress * 0.36;
        rig.rotation.x = -0.16 + Math.sin(time * 0.24) * 0.08;
        rig.rotation.z = -0.08 + Math.sin(time * 0.18 + projectProgress * Math.PI) * 0.08;
        rig.position.y = (portrait ? -0.26 : -0.12) + (scrollProgress - 0.5) * 1.45;
        signals.rotation.y = time * 0.06;
        orbitControllers.forEach((orbit, index) => {
          orbit.object.rotation.z += orbit.speed;
          orbit.object.rotation.x += Math.sin(time * 0.18 + index) * 0.0005;
        });

        for (let index = 0; index < profile.nodeCount; index += 1) {
          const t = index / (profile.nodeCount - 1);
          const y = (t - 0.5) * profile.helixHeight;
          const angle = t * Math.PI * 2 * current.twist + time * current.speed + scrollProgress * 2.2;
          const pulse = Math.sin(t * Math.PI * 8 + time * 0.9) * 0.035;
          const radius = current.radius + pulse;
          const aX = Math.cos(angle) * radius;
          const aZ = Math.sin(angle) * radius;
          const bX = Math.cos(angle + Math.PI) * radius;
          const bZ = Math.sin(angle + Math.PI) * radius;
          const base = index * 3;
          const rungBase = index * 6;

          strandA[base] = aX;
          strandA[base + 1] = y;
          strandA[base + 2] = aZ;
          strandB[base] = bX;
          strandB[base + 1] = y;
          strandB[base + 2] = bZ;
          rungs[rungBase] = aX;
          rungs[rungBase + 1] = y;
          rungs[rungBase + 2] = aZ;
          rungs[rungBase + 3] = bX;
          rungs[rungBase + 4] = y;
          rungs[rungBase + 5] = bZ;

          const scale = 0.78 + Math.sin(time * 1.2 + index * 0.42) * 0.08;
          dummy.position.set(aX, y, aZ);
          dummy.rotation.set(angle, angle * 0.25, time * 0.2);
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          nodeMeshA.setMatrixAt(index, dummy.matrix);

          dummy.position.set(bX, y, bZ);
          dummy.rotation.set(angle + Math.PI, -angle * 0.2, -time * 0.18);
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          nodeMeshB.setMatrixAt(index, dummy.matrix);
        }

        for (let index = 0; index < profile.markerCount; index += 1) {
          const t = profile.markerCount === 1 ? 0.5 : index / (profile.markerCount - 1);
          const y = (t - 0.5) * profile.helixHeight;
          const angle = t * Math.PI * 2 * current.twist + time * current.speed + scrollProgress * 2.2 + index * 0.5;
          const radius = current.radius + 0.42 + Math.sin(time + index) * 0.08;
          dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
          dummy.rotation.set(time * 0.32 + index, angle, -time * 0.24);
          dummy.scale.setScalar(0.65 + Math.sin(time * 1.5 + index) * 0.08);
          dummy.updateMatrix();
          markers.setMatrixAt(index, dummy.matrix);
        }

        strandAttributeA.needsUpdate = true;
        strandAttributeB.needsUpdate = true;
        rungAttribute.needsUpdate = true;
        nodeMeshA.instanceMatrix.needsUpdate = true;
        nodeMeshB.instanceMatrix.needsUpdate = true;
        markers.instanceMatrix.needsUpdate = true;
      }

      function draw(now = performance.now()) {
        updateGeometry(now * 0.001);
        renderer.render(scene, camera);
        canvas.dataset.dnaScene = "rendered";
        if (!reportedReady && mounted) {
          reportedReady = true;
          setCanvasReady(true);
        }
      }

      function startLoop() {
        if (profile.staticOnly) {
          draw();
          renderStaticRef.current = draw;
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

      function render(now: number) {
        if (!mounted) return;
        rafId = requestAnimationFrame(render);
        const frameInterval = profile.targetFPS > 0 ? 1000 / profile.targetFPS : Number.POSITIVE_INFINITY;
        if (now - lastFrame < frameInterval) return;
        lastFrame = now;
        draw(now);
      }

      function handleVisibility() {
        if (document.hidden) stopLoop();
        else startLoop();
      }

      function handleScroll() {
        scheduleScrollRefresh();
      }

      const resizeObserver = new ResizeObserver(() => {
        resize();
        draw();
      });
      const sceneObserver = new IntersectionObserver(
        (entries) => {
          const inView = entries.some((entry) => entry.isIntersecting);
          if (inView && !document.hidden) startLoop();
          else stopLoop();
        },
        { rootMargin: "160px 0px" },
      );
      resizeObserver.observe(canvas);
      sceneObserver.observe(stage ?? canvas);
      resize();
      draw();
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("scroll", handleScroll, { passive: true });
      startLoop();

      cleanupScene = () => {
        renderStaticRef.current = null;
        stopLoop();
        if (scrollRafId) cancelAnimationFrame(scrollRafId);
        resizeObserver.disconnect();
        sceneObserver.disconnect();
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("scroll", handleScroll);
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      };
    }

    timeoutHandle = window.setTimeout(() => {
      void init();
    }, 80);

    return () => {
      mounted = false;
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
      cleanupScene?.();
    };
  }, [shouldInit, totalProjects]);

  return (
    <>
      <DnaStaticPreview activeSector={activeSector} hidden={canvasReady} />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full transition-opacity duration-500", canvasReady ? "opacity-100" : "opacity-0")}
        data-dna-canvas="true"
      />
    </>
  );
}

function SectorIcon({ sector, className }: { sector: string; className?: string }) {
  const Icon = getSectorTheme(sector).icon;
  return <Icon aria-hidden="true" className={className} />;
}

function ProjectVisual({ project, theme }: { project: Project; theme: SectorTheme }) {
  if (project.cover_image) {
    return (
      <Image
        src={normalizeImageUrl(project.cover_image)}
        alt={project.title}
        fill
        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 220px, 250px"
        quality={62}
        unoptimized={shouldBypassImageOptimization(project.cover_image)}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  const initials = (project.client_name || project.title)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(3, 4, 10, 0.18), rgba(3, 4, 10, 0.82)), linear-gradient(135deg, ${theme.cssPrimary}33, ${theme.cssSecondary}22), url('/space-background.webp')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-x-6 top-6 h-px bg-white/20" />
      <div className="absolute inset-y-6 right-8 w-px bg-white/15" />
      <div className="absolute bottom-7 left-7 flex items-end gap-4">
        <span className="font-serif text-6xl leading-none text-white/90">{initials || "PA"}</span>
        <SectorIcon sector={project.sector} className="mb-2 size-9 text-white/75" />
      </div>
      <div className="absolute right-8 top-8 h-24 w-24 border border-white/15" />
      <div className="absolute right-14 top-14 h-24 w-24 border border-white/10" />
    </div>
  );
}

function ProjectDnaTile({
  alignRight,
  index,
  isActive,
  isVisible,
  project,
  theme,
}: {
  alignRight: boolean;
  index: number;
  isActive: boolean;
  isVisible: boolean;
  project: Project;
  theme: SectorTheme;
}) {
  const hiddenMotion = alignRight
    ? "-translate-x-[18vw] translate-y-7 scale-[0.34] sm:-translate-x-[42vw]"
    : "translate-x-[18vw] translate-y-7 scale-[0.34] sm:translate-x-[42vw]";

  return (
    <article
      data-dna-project-index={index}
      className={cn(
        "pointer-events-none relative flex min-h-[52svh] scroll-mt-24 items-center px-4 py-6 sm:min-h-[56svh] sm:px-10 sm:py-10 lg:min-h-[58svh] lg:px-8",
        alignRight ? "justify-end" : "justify-start",
      )}
      style={{
        ...createSceneStyle(theme),
        contentVisibility: "auto",
        containIntrinsicSize: "56svh",
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border bg-black/60 transition-all duration-500 sm:h-5 sm:w-5",
          isVisible
            ? "scale-100 border-[var(--scene-primary)] opacity-100 shadow-[0_0_22px_var(--scene-primary)]"
            : "scale-50 border-white/10 opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-[var(--scene-primary)] opacity-0 sm:h-5 sm:w-5",
          isVisible && isActive && "motion-safe:animate-ping",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 h-px w-[34vw] max-w-[430px] transition-all duration-700",
          alignRight
            ? "left-1/2 origin-left bg-gradient-to-r from-[var(--scene-primary)] via-[var(--scene-primary)] to-transparent"
            : "right-1/2 origin-right bg-gradient-to-l from-[var(--scene-primary)] via-[var(--scene-primary)] to-transparent",
          isVisible ? "scale-x-100 opacity-80" : "scale-x-0 opacity-0",
        )}
      />
      <Link
        href={`/realisations/${project.slug}`}
        aria-label={`Voir le projet ${project.title}`}
        data-dna-tile="true"
        className={cn(
          "pointer-events-auto group relative block aspect-square w-[min(34vw,132px)] transform-gpu overflow-hidden rounded-lg border bg-black/[0.42] shadow-2xl backdrop-blur-xl transition-all duration-[850ms] ease-out sm:w-[184px] lg:w-[216px]",
          isVisible ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0" : `${hiddenMotion} opacity-0 blur-sm`,
          isActive ? "border-[var(--scene-primary)]" : "border-white/[0.14] hover:border-white/[0.34]",
        )}
        style={{
          boxShadow: isActive && isVisible ? `0 0 42px ${theme.cssGlow}` : undefined,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute -inset-10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-70"
          style={{ background: `radial-gradient(circle, ${theme.cssGlow}, transparent 62%)` }}
        />
        <ProjectVisual project={project} theme={theme} />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <span className="absolute inset-0 border border-white/10" />
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.16] bg-black/[0.42] backdrop-blur-md sm:left-3 sm:top-3 sm:h-8 sm:w-8">
          <SectorIcon sector={project.sector} className="size-3 text-[var(--scene-primary)] sm:size-4" />
        </span>
        {project.featured && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--scene-accent)] bg-black/[0.38] sm:right-3 sm:top-3 sm:h-8 sm:w-8">
            <Trophy aria-hidden="true" className="size-3 text-[var(--scene-accent)] sm:size-4" />
          </span>
        )}
        <span className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-4 sm:bottom-4">
          <span className="block text-[8px] uppercase tracking-[0.18em] text-[var(--scene-secondary)] sm:text-[10px] sm:tracking-[0.26em]">
            {project.category || project.sector || "Projet"}
          </span>
          <span className="mt-1 line-clamp-2 block font-serif text-lg leading-none text-white sm:text-2xl">{project.title}</span>
          <span className="mt-1.5 flex items-center justify-between text-[10px] text-white/60 sm:mt-3 sm:text-xs">
            <span className="truncate pr-2">{project.client_name || "Prestigia Agency"}</span>
            <ArrowUpRight aria-hidden="true" className="size-3 shrink-0 text-[var(--scene-primary)] sm:size-4" />
          </span>
        </span>
        <span className="absolute inset-x-4 bottom-0 h-px bg-[var(--scene-primary)]" />
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-[2px] bg-[var(--scene-primary)] shadow-[0_0_18px_var(--scene-primary)] transition-transform duration-500",
            alignRight ? "-left-1.5" : "-right-1.5",
            isVisible ? "scale-100" : "scale-0",
          )}
        />
      </Link>
    </article>
  );
}

export function RealisationsDnaExperience({
  heroSubtitle,
  heroTitle,
  projects,
  sectors,
}: {
  heroSubtitle: string;
  heroTitle: string;
  projects: Project[];
  sectors: string[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState<Set<number>>(() => new Set());

  const activeProject = projects[activeIndex] ?? projects[0];
  const projectThemes = useMemo(() => projects.map((project) => getSectorTheme(project.sector)), [projects]);
  const activeTheme = projectThemes[activeIndex] ?? getSectorTheme(activeProject?.sector ?? "");
  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      if (!project.sector) return;
      counts.set(project.sector, (counts.get(project.sector) ?? 0) + 1);
    });
    return counts;
  }, [projects]);
  const shownSectors = useMemo(
    () => (sectors.length ? sectors : Array.from(sectorCounts.keys())),
    [sectorCounts, sectors],
  );
  const sectorItems = useMemo(
    () =>
      shownSectors.map((sector) => ({
        count: sectorCounts.get(sector) ?? 0,
        sector,
        theme: getSectorTheme(sector),
      })),
    [sectorCounts, shownSectors],
  );
  const stageMinHeight = Math.max(156, projects.length * 54 + 86);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-dna-project-index]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.dnaProjectIndex);
          if (!Number.isFinite(index)) return;

          if (entry.intersectionRatio >= 0.16) {
            setVisibleProjects((current) => {
              if (current.has(index)) return current;
              const next = new Set(current);
              next.add(index);
              return next;
            });
          }

          if (entry.intersectionRatio >= 0.34) {
            setActiveIndex(index);
          }
        });
      },
      { rootMargin: "-18% 0px -30% 0px", threshold: [0, 0.16, 0.34, 0.62] },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [projects.length]);

  function scrollToSector(sector: string) {
    const targetIndex = projects.findIndex((project) => project.sector === sector);
    if (targetIndex < 0) return;
    const target = rootRef.current?.querySelector<HTMLElement>(`[data-dna-project-index="${targetIndex}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (!activeProject) {
    return (
      <section className="relative -mt-20 min-h-screen overflow-hidden bg-[#03040a] pt-32">
        <div className="container-px mx-auto max-w-4xl py-24 text-center">
          <p className="font-serif text-5xl text-white">Réalisations</p>
          <p className="mt-4 text-[var(--muted-foreground)]">Aucun projet publié pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className="relative -mt-20 bg-[#03040a] pt-28 text-white"
      style={createSceneStyle(activeTheme)}
      aria-label="Réalisations Prestigia Agency"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(3, 4, 10, 0.18), #03040a 88%), linear-gradient(115deg, rgba(8, 13, 32, 0.92), rgba(3, 4, 10, 0.88)), url('/space-background.webp')",
          backgroundPosition: "center top",
          backgroundSize: "cover",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(90deg, rgba(3, 4, 10, 0.95) 0%, rgba(3, 4, 10, 0.72) 44%, rgba(3, 4, 10, 0.18) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(180deg, transparent 0%, black 16%, black 82%, transparent 100%)",
        }}
      />

      <div className="container-px relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-6">
          <div className="flex min-h-[calc(78svh-5rem)] flex-col justify-end py-10 lg:min-h-[calc(72svh-5rem)] lg:justify-center lg:py-14">
            <p className="text-sm uppercase text-[var(--scene-secondary)]">Réalisations</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/[0.72] sm:text-lg">{heroSubtitle}</p>

            <div className="mt-8 grid max-w-2xl grid-cols-3 border-y border-white/[0.12] py-5">
              <div>
                <p className="font-serif text-4xl text-white">{projects.length}</p>
                <p className="mt-1 text-sm text-white/[0.56]">projets</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-white">{shownSectors.length}</p>
                <p className="mt-1 text-sm text-white/[0.56]">categories</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-white">ADN</p>
                <p className="mt-1 text-sm text-white/[0.56]">plein ecran</p>
              </div>
            </div>

            <p className="mt-6 max-w-lg text-sm leading-6 text-white/[0.48]">
              Faites défiler : chaque projet s&apos;active depuis l&apos;ADN et la navigation par catégorie reste disponible pendant l&apos;expérience.
            </p>
          </div>

          <div
            data-dna-stage="true"
            className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen pb-14 lg:pb-28"
            style={{ minHeight: `${stageMinHeight}svh` }}
          >
            <div className="pointer-events-none sticky top-0 z-0 h-svh overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 46%, var(--scene-glow), transparent 36%), radial-gradient(ellipse at center, transparent 0%, rgba(3, 4, 10, 0.18) 58%, rgba(3, 4, 10, 0.92) 100%)",
                }}
              />
              <DnaCanvas activeIndex={activeIndex} activeSector={activeProject.sector} totalProjects={projects.length} />
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#03040a] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#03040a] to-transparent" />
              {shownSectors.length > 0 && (
                <nav
                  aria-label="Catégories projets"
                  className="no-scrollbar pointer-events-auto absolute left-4 right-4 top-20 z-30 flex gap-2 overflow-x-auto pb-2 pr-24 sm:left-8 sm:right-8 sm:pr-0 lg:right-auto lg:max-h-[calc(100svh-8rem)] lg:w-64 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0"
                >
                  {sectorItems.map(({ count, sector, theme }) => {
                    const Icon = theme.icon;
                    const selected = activeProject.sector === sector;

                    return (
                      <button
                        key={sector}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => scrollToSector(sector)}
                        className={cn(
                          "group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-left text-sm backdrop-blur-md transition-colors lg:w-full",
                          selected
                            ? "border-[var(--scene-primary)] bg-black/60 text-white shadow-[0_0_22px_var(--scene-glow)]"
                            : "border-white/[0.12] bg-black/[0.26] text-white/[0.64] hover:border-white/[0.28] hover:text-white",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" style={{ color: theme.cssPrimary }} />
                        <span className="truncate">{sector}</span>
                        <span className="ml-auto text-xs text-white/[0.44]">{count}</span>
                      </button>
                    );
                  })}
                </nav>
              )}
              <div className="absolute inset-x-4 bottom-5 rounded-lg border border-white/[0.1] bg-black/[0.24] p-3 backdrop-blur-md sm:inset-x-auto sm:left-8 sm:w-[320px] sm:p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase text-white/[0.48]">{activeTheme.label}</p>
                    <p className="mt-1 truncate font-serif text-xl text-white">{activeProject.client_name || activeProject.title}</p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.08]">
                    <SectorIcon sector={activeProject.sector} className="size-4 text-[var(--scene-primary)]" />
                  </div>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--scene-primary)] transition-all duration-500"
                    style={{ width: `${((activeIndex + 1) / projects.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pointer-events-none relative z-10 -mt-[100svh]">
              {projects.map((project, index) => {
                const theme = projectThemes[index] ?? DEFAULT_THEME;
                const isActive = index === activeIndex;
                const isVisible = visibleProjects.has(index);
                const alignRight = index % 2 === 0;

                return (
                  <ProjectDnaTile
                    key={project.slug}
                    alignRight={alignRight}
                    index={index}
                    isActive={isActive}
                    isVisible={isVisible}
                    project={project}
                    theme={theme}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container-px relative z-10 mx-auto max-w-7xl pb-24">
        <div className="grid gap-8 border-y border-white/[0.12] py-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm uppercase text-[var(--scene-secondary)]">Projet suivant</p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-none text-white sm:text-5xl">
              Construisons une signature digitale qui évolue avec votre marché.
            </h2>
          </div>
          <Link
            href="/devis"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#03040a] transition-transform hover:-translate-y-0.5"
          >
            Demander un devis
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
