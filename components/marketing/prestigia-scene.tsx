"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type * as Three from "three";

type SceneProfile = {
  antialias: boolean;
  particleCount: number;
  pixelRatioCap: number;
  renderScale: number;
  ringSegments: number;
  sceneScale: number;
  targetFPS: number;
  xOffset: number;
  yOffset: number;
  staticOnly: boolean;
};

const VIOLET = 0x7c3aed;
const LILAC = 0xb39dfa;
const GOLD = 0xf6c86e;
const BLUE = 0x3b82f6;
const DEEP = 0x130824;

function getSceneProfile(): SceneProfile {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallestSide = Math.min(window.innerWidth, window.innerHeight);
  const isMobile = coarsePointer || smallestSide < 720;
  const wide = window.innerWidth >= 1280;

  if (reducedMotion) {
    return {
      antialias: false,
      particleCount: 0,
      pixelRatioCap: 1,
      renderScale: 0.5,
      ringSegments: 48,
      sceneScale: isMobile ? 0.62 : 0.92,
      targetFPS: 0,
      xOffset: isMobile ? 0.5 : 2.25,
      yOffset: isMobile ? -0.3 : 0.05,
      staticOnly: true,
    };
  }

  if (isMobile) {
    return {
      antialias: false,
      particleCount: 34,
      pixelRatioCap: 1.15,
      renderScale: 0.48,
      ringSegments: 56,
      sceneScale: 0.62,
      targetFPS: 22,
      xOffset: 0.58,
      yOffset: -0.25,
      staticOnly: false,
    };
  }

  return {
    antialias: wide,
    particleCount: wide ? 82 : 58,
    pixelRatioCap: wide ? 1.45 : 1.25,
    renderScale: wide ? 0.66 : 0.58,
    ringSegments: wide ? 96 : 72,
    sceneScale: wide ? 1.08 : 0.96,
    targetFPS: wide ? 30 : 26,
    xOffset: wide ? 2.65 : 2.1,
    yOffset: wide ? 0.05 : -0.05,
    staticOnly: false,
  };
}

export function PrestigiaScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const hideOnRoute = pathname?.startsWith("/realisations") ?? false;

  useEffect(() => {
    if (hideOnRoute) return;

    let mounted = true;
    let rafId = 0;
    let timeoutHandle = 0;
    let cleanupScene: (() => void) | null = null;

    async function init() {
      const targetCanvas = canvasRef.current;
      if (!targetCanvas || !mounted) return;
      const canvas: HTMLCanvasElement = targetCanvas;
      canvas.dataset.prestigiaScene = "loading";

      const THREE = await import("three");
      if (!mounted) return;
      canvas.dataset.prestigiaScene = "three-loaded";

      const profile = getSceneProfile();
      const disposables: Array<{ dispose: () => void }> = [];
      const orbitControllers: Array<{ group: Three.Group; speed: number }> = [];

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: profile.antialias,
          canvas,
          powerPreference: "low-power",
        });
      } catch {
        canvas.dataset.prestigiaScene = "webgl-unavailable";
        return;
      }
      canvas.dataset.prestigiaScene = "webgl-ready";

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 8.5);

      scene.add(new THREE.HemisphereLight(0xcab8ff, DEEP, 1.7));

      const keyLight = new THREE.DirectionalLight(0xffedd0, 2.3);
      keyLight.position.set(-2.8, 3.2, 5.2);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(BLUE, 4.5, 12);
      rimLight.position.set(3.2, -1.8, 2.5);
      scene.add(rimLight);

      const rig = new THREE.Group();
      rig.position.set(profile.xOffset, profile.yOffset, 0);
      rig.scale.setScalar(profile.sceneScale);
      scene.add(rig);

      const coreGeometry = new THREE.IcosahedronGeometry(1.08, 1);
      const coreMaterial = new THREE.MeshStandardMaterial({
        color: VIOLET,
        emissive: 0x2a1457,
        emissiveIntensity: 0.38,
        metalness: 0.36,
        roughness: 0.42,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      rig.add(core);
      disposables.push(coreGeometry, coreMaterial);

      const innerGeometry = new THREE.IcosahedronGeometry(0.58, 0);
      const innerMaterial = new THREE.MeshStandardMaterial({
        color: GOLD,
        emissive: 0x9a5b12,
        emissiveIntensity: 0.45,
        metalness: 0.22,
        roughness: 0.32,
        transparent: true,
        opacity: 0.86,
      });
      const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
      rig.add(innerCore);
      disposables.push(innerGeometry, innerMaterial);

      const wireGeometry = new THREE.IcosahedronGeometry(1.32, 1);
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: LILAC,
        opacity: 0.18,
        transparent: true,
        wireframe: true,
      });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      rig.add(wire);
      disposables.push(wireGeometry, wireMaterial);

      const nodeGeometry = new THREE.SphereGeometry(0.055, profile.antialias ? 14 : 10, 8);
      disposables.push(nodeGeometry);

      function addOrbit(radius: number, color: number, tilt: [number, number, number], speed: number, nodes: number) {
        const orbitGroup = new THREE.Group();
        orbitGroup.rotation.set(tilt[0], tilt[1], tilt[2]);

        const ringGeometry = new THREE.TorusGeometry(radius, 0.008, 6, profile.ringSegments);
        const ringMaterial = new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color,
          depthWrite: false,
          opacity: 0.42,
          transparent: true,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        orbitGroup.add(ring);
        disposables.push(ringGeometry, ringMaterial);

        const nodeMaterial = new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color,
          depthWrite: false,
          transparent: true,
          opacity: 0.88,
        });
        disposables.push(nodeMaterial);

        for (let i = 0; i < nodes; i += 1) {
          const angle = (i / nodes) * Math.PI * 2;
          const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
          node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
          orbitGroup.add(node);
        }

        rig.add(orbitGroup);
        orbitControllers.push({ group: orbitGroup, speed });
      }

      addOrbit(1.52, GOLD, [0.92, 0.1, 0.18], 0.22, 5);
      addOrbit(1.88, LILAC, [1.18, 0.64, -0.16], -0.16, 6);
      addOrbit(2.22, BLUE, [0.64, -0.52, 0.36], 0.12, profile.particleCount > 40 ? 7 : 4);

      const pathCurve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-1.9, -0.7, -0.16),
          new THREE.Vector3(-1.12, 0.62, 0.28),
          new THREE.Vector3(0.22, 0.92, -0.12),
          new THREE.Vector3(1.28, 0.08, 0.18),
          new THREE.Vector3(1.92, -0.84, -0.08),
        ],
        false,
      );
      const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(72));
      const pathMaterial = new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: GOLD,
        depthWrite: false,
        opacity: 0.34,
        transparent: true,
      });
      const path = new THREE.Line(pathGeometry, pathMaterial);
      rig.add(path);
      disposables.push(pathGeometry, pathMaterial);

      let particles: Three.Points | null = null;
      if (profile.particleCount > 0) {
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(profile.particleCount * 3);
        for (let i = 0; i < profile.particleCount; i += 1) {
          const ix = i * 3;
          positions[ix] = (Math.random() - 0.5) * 8;
          positions[ix + 1] = (Math.random() - 0.5) * 5.2;
          positions[ix + 2] = (Math.random() - 0.5) * 3.8;
        }
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
          blending: THREE.AdditiveBlending,
          color: LILAC,
          depthWrite: false,
          opacity: 0.48,
          size: 0.028,
          transparent: true,
        });
        particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.position.set(profile.xOffset * 0.24, profile.yOffset * 0.2, -0.8);
        scene.add(particles);
        disposables.push(particleGeometry, particleMaterial);
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

        const portrait = width < height;
        rig.position.x = portrait ? 0.58 : profile.xOffset;
        rig.position.y = portrait ? -0.3 : profile.yOffset;
        rig.scale.setScalar(portrait ? Math.min(profile.sceneScale, 0.66) : profile.sceneScale);
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const start = performance.now();
      const frameInterval = profile.targetFPS > 0 ? 1000 / profile.targetFPS : Number.POSITIVE_INFINITY;
      let lastFrame = 0;

      function render(now: number) {
        if (!mounted) return;

        if (!profile.staticOnly) {
          rafId = requestAnimationFrame(render);
          if (now - lastFrame < frameInterval) return;
          lastFrame = now;
        }

        const time = (now - start) * 0.001;
        rig.rotation.y = Math.sin(time * 0.18) * 0.16 + time * 0.055;
        rig.rotation.x = Math.sin(time * 0.11) * 0.055;
        core.rotation.set(time * 0.13, time * 0.24, time * 0.08);
        innerCore.rotation.set(-time * 0.16, time * 0.18, -time * 0.1);
        wire.rotation.set(time * 0.09, -time * 0.12, time * 0.07);
        path.rotation.z = Math.sin(time * 0.2) * 0.08;

        orbitControllers.forEach((orbit, index) => {
          orbit.group.rotation.z += orbit.speed * 0.015;
          orbit.group.rotation.x += Math.sin(time * 0.18 + index) * 0.0006;
        });

        if (particles) {
          particles.rotation.y = time * 0.018;
          particles.rotation.x = Math.sin(time * 0.12) * 0.04;
        }

        renderer.render(scene, camera);
        canvas.dataset.prestigiaScene = "rendered";
      }

      function startLoop() {
        if (profile.staticOnly) {
          render(performance.now());
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

      document.addEventListener("visibilitychange", handleVisibility);
      startLoop();

      cleanupScene = () => {
        stopLoop();
        document.removeEventListener("visibilitychange", handleVisibility);
        resizeObserver.disconnect();
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      };
    }

    const startInit = () => {
      void init();
    };

    timeoutHandle = window.setTimeout(startInit, 320);

    return () => {
      mounted = false;
      cleanupScene?.();
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
  }, [hideOnRoute]);

  if (hideOnRoute) return null;

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
