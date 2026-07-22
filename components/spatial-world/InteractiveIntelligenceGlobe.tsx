"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type * as THREE from "three";
import { buildWorldIntelligenceMap } from "@/lib/world-map";
import {
  getGlobeCountryPoints,
  latLngToUnitVector,
  type GlobeCountryPoint,
} from "@/lib/spatial-world/globe-geography";
import {
  buildNaturalEarthGlobeCanvas,
  NATURAL_EARTH_ATTRIBUTION,
} from "@/lib/spatial-world/globe-natural-earth-texture";

export type IntelligenceGlobeLabels = {
  title: string;
  hint: string;
  reset: string;
  fallbackTitle: string;
  fallbackHint: string;
  keyboardHint: string;
};

type InteractiveIntelligenceGlobeProps = {
  labels: IntelligenceGlobeLabels;
  selectedCountryId: string | null;
  onSelectCountry: (point: GlobeCountryPoint | null) => void;
};

const GLOBE_RADIUS = 1;
const CAMERA_FOV = 36;
const FIT_PADDING = 1.22;

function computeFitDistance(aspect: number, padding = FIT_PADDING): number {
  const vFov = (CAMERA_FOV * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const limitingFov = Math.min(vFov, hFov);
  return (GLOBE_RADIUS / Math.sin(limitingFov / 2)) * padding;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export default function InteractiveIntelligenceGlobe({
  labels,
  selectedCountryId,
  onSelectCountry,
}: InteractiveIntelligenceGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallbackReason, setFallbackReason] = useState<"none" | "environment" | "webgl">(() => {
    if (typeof window === "undefined") return "none";
    if (isMobileViewport() || prefersReducedMotion()) return "environment";
    return "none";
  });
  const useFallback = fallbackReason !== "none";
  const hoveredIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const selectedCountryIdRef = useRef(selectedCountryId);
  const countryPoints = getGlobeCountryPoints();

  useEffect(() => {
    selectedCountryIdRef.current = selectedCountryId;
  }, [selectedCountryId]);

  const handleFallbackSelect = useCallback(
    (countryId: string) => {
      const point = countryPoints.find((p) => p.country.id === countryId) ?? null;
      onSelectCountry(point);
    },
    [countryPoints, onSelectCountry],
  );

  useEffect(() => {
    if (useFallback) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let animationId = 0;
    let defaultDistance = computeFitDistance(1);

    void (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 20);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x07101f, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene.add(new THREE.AmbientLight(0xe8f5f2, 0.72));
        const key = new THREE.DirectionalLight(0xf8fffe, 0.95);
        key.position.set(3.2, 1.8, 2.8);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x7dd3c0, 0.38);
        fill.position.set(-2.8, -0.2, -1.6);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0x5eead4, 0.22);
        rim.position.set(0, 0.5, -3.5);
        scene.add(rim);

        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        const textureCanvas = buildNaturalEarthGlobeCanvas();
        const earthTexture = new THREE.CanvasTexture(textureCanvas);
        earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        earthTexture.colorSpace = THREE.SRGBColorSpace;

        const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96);
        const sphereMaterial = new THREE.MeshStandardMaterial({
          map: earthTexture,
          color: 0xffffff,
          roughness: 0.82,
          metalness: 0.04,
          emissive: 0x0a1628,
          emissiveIntensity: 0.04,
        });
        globeGroup.add(new THREE.Mesh(sphereGeometry, sphereMaterial));

        const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          color: 0x5eead4,
          transparent: true,
          opacity: 0.06,
          side: THREE.BackSide,
        });
        globeGroup.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

        const rimGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 72, 72);
        const rimMaterial = new THREE.MeshBasicMaterial({
          color: 0xa7f3d0,
          transparent: true,
          opacity: 0.035,
          side: THREE.FrontSide,
        });
        globeGroup.add(new THREE.Mesh(rimGeometry, rimMaterial));

        const markerGroup = new THREE.Group();
        globeGroup.add(markerGroup);

        const markerGeometry = new THREE.SphereGeometry(0.038, 16, 16);
        const markerMeshes = new Map<string, THREE.Mesh>();

        for (const point of countryPoints) {
          const vector = latLngToUnitVector(point.lat, point.lng);
          const material = new THREE.MeshStandardMaterial({
            color: 0x5eead4,
            emissive: 0x14b8a6,
            emissiveIntensity: 0.75,
          });
          const mesh = new THREE.Mesh(markerGeometry, material);
          const surface = GLOBE_RADIUS * 1.018;
          mesh.position.set(vector.x * surface, vector.y * surface, vector.z * surface);
          mesh.userData = { countryId: point.country.id };
          markerGroup.add(mesh);
          markerMeshes.set(point.country.id, mesh);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.rotateSpeed = 0.45;

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let idleRotation = !prefersReducedMotion();
        let flyTarget: THREE.Vector3 | null = null;
        let flyProgress = 0;
        let activeCountryId = selectedCountryIdRef.current;

        const applyDefaultCamera = () => {
          defaultDistance = computeFitDistance(camera.aspect);
          controls.minDistance = defaultDistance * 0.72;
          controls.maxDistance = defaultDistance * 1.45;
          if (!flyTarget) {
            camera.position.set(0, 0, defaultDistance);
            controls.target.set(0, 0, 0);
            controls.update();
          }
        };

        const resize = () => {
          const { clientWidth, clientHeight } = container;
          if (clientWidth === 0 || clientHeight === 0) return;
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(clientWidth, clientHeight, false);
          applyDefaultCamera();
        };

        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        const updatePointer = (clientX: number, clientY: number) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        };

        const pickCountry = (): string | null => {
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects([...markerMeshes.values()], false);
          if (hits.length === 0) return null;
          return (hits[0].object.userData.countryId as string) ?? null;
        };

        const highlightCountry = (countryId: string | null) => {
          for (const [id, mesh] of markerMeshes) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            const selected = id === countryId;
            mat.color.setHex(selected ? 0x99f6e4 : 0x2dd4bf);
            mat.emissiveIntensity = selected ? 1.1 : 0.6;
            mesh.scale.setScalar(selected ? 1.35 : 1);
          }
        };

        const onPointerMove = (event: PointerEvent) => {
          updatePointer(event.clientX, event.clientY);
          const id = pickCountry();
          hoveredIdRef.current = id;
          renderer.domElement.style.cursor = id ? "pointer" : "grab";
        };

        const onPointerDown = () => {
          idleRotation = false;
        };

        const onPointerUp = (event: PointerEvent) => {
          if (event.button !== 0) return;
          updatePointer(event.clientX, event.clientY);
          const id = pickCountry();
          if (!id) return;
          const point = countryPoints.find((p) => p.country.id === id) ?? null;
          activeCountryId = id;
          onSelectCountry(point);
          if (point) {
            const vector = latLngToUnitVector(point.lat, point.lng);
            flyTarget = new THREE.Vector3(vector.x, vector.y, vector.z).normalize();
            flyProgress = 0;
          }
        };

        const onWheel = () => {
          idleRotation = false;
        };

        const resetView = () => {
          controls.reset();
          flyTarget = null;
          applyDefaultCamera();
          idleRotation = !prefersReducedMotion();
          activeCountryId = null;
          onSelectCountry(null);
        };

        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            resetView();
            return;
          }
          if (event.key === "Enter" && activeCountryId) {
            const point = countryPoints.find((p) => p.country.id === activeCountryId);
            if (point) onSelectCountry(point);
            return;
          }
          if (event.key === "+" || event.key === "=") {
            camera.position.multiplyScalar(0.92);
            idleRotation = false;
            return;
          }
          if (event.key === "-" || event.key === "_") {
            camera.position.multiplyScalar(1.08);
            idleRotation = false;
            return;
          }
          const step = 0.04;
          if (event.key === "ArrowLeft") {
            globeGroup.rotation.y -= step;
            idleRotation = false;
          }
          if (event.key === "ArrowRight") {
            globeGroup.rotation.y += step;
            idleRotation = false;
          }
          if (event.key === "ArrowUp") {
            globeGroup.rotation.x = Math.max(globeGroup.rotation.x - step, -0.6);
            idleRotation = false;
          }
          if (event.key === "ArrowDown") {
            globeGroup.rotation.x = Math.min(globeGroup.rotation.x + step, 0.6);
            idleRotation = false;
          }
        };

        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        renderer.domElement.addEventListener("pointerup", onPointerUp);
        renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
        container.addEventListener("keydown", onKeyDown);

        const resetButton = container.querySelector<HTMLButtonElement>("[data-globe-reset]");
        resetButton?.addEventListener("click", resetView);

        const animate = () => {
          if (disposed) return;
          animationId = window.requestAnimationFrame(animate);

          if (idleRotation) {
            globeGroup.rotation.y += 0.0012;
          }

          if (flyTarget && flyProgress < 1) {
            flyProgress = Math.min(flyProgress + 0.03, 1);
            controls.target.lerp(flyTarget.clone().multiplyScalar(0.15), 0.08);
            camera.position.lerp(flyTarget.clone().multiplyScalar(defaultDistance), 0.06);
          }

          highlightCountry(activeCountryId ?? hoveredIdRef.current);
          if (selectedCountryIdRef.current !== activeCountryId && !flyTarget) {
            activeCountryId = selectedCountryIdRef.current;
          }
          controls.update();
          renderer.render(scene, camera);
        };

        animate();

        cleanupRef.current = () => {
          disposed = true;
          window.cancelAnimationFrame(animationId);
          resizeObserver.disconnect();
          renderer.domElement.removeEventListener("pointermove", onPointerMove);
          renderer.domElement.removeEventListener("pointerdown", onPointerDown);
          renderer.domElement.removeEventListener("pointerup", onPointerUp);
          renderer.domElement.removeEventListener("wheel", onWheel);
          container.removeEventListener("keydown", onKeyDown);
          resetButton?.removeEventListener("click", resetView);
          controls.dispose();
          earthTexture.dispose();
          sphereGeometry.dispose();
          sphereMaterial.dispose();
          atmosphereGeometry.dispose();
          atmosphereMaterial.dispose();
          rimGeometry.dispose();
          rimMaterial.dispose();
          markerGeometry.dispose();
          for (const mesh of markerMeshes.values()) {
            (mesh.material as THREE.Material).dispose();
          }
          renderer.dispose();
        };
      } catch {
        setFallbackReason("webgl");
      }
    })();

    return () => {
      disposed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [countryPoints, onSelectCountry, useFallback]);

  if (useFallback) {
    const groups = buildWorldIntelligenceMap();
    return (
      <div className="cbai-globe-fallback flex h-full min-h-[280px] flex-col gap-3 rounded-xl border border-teal-500/15 bg-[#07101f] p-4">
        <div>
          <p className="text-sm font-medium text-teal-50">{labels.fallbackTitle}</p>
          <p className="mt-1 text-xs text-slate-300">{labels.fallbackHint}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {groups.flatMap((group) =>
            group.countries.map((entry) => (
              <Link
                key={entry.country.id}
                href={entry.href}
                onClick={() => handleFallbackSelect(entry.country.id)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedCountryId === entry.country.id
                    ? "border-teal-400/35 bg-teal-500/12 text-teal-50"
                    : "border-teal-500/15 bg-[#0a1528]/80 text-slate-200 hover:border-teal-400/25"
                }`}
              >
                {entry.country.name}
              </Link>
            )),
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="cbai-intelligence-globe cbai-spatial-globe-stage relative flex h-[min(52vh,540px)] min-h-[400px] max-h-[540px] flex-col overflow-hidden rounded-2xl border border-teal-500/25 bg-[#07101f]"
      tabIndex={0}
      role="application"
      aria-label={labels.title}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none bg-[#07101f]" aria-hidden="true" />
      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-2 p-3 sm:p-4">
        <div>
          <p className="text-sm font-medium text-teal-50">{labels.title}</p>
          <p className="mt-0.5 max-w-md text-[11px] leading-relaxed text-slate-300">{labels.hint}</p>
        </div>
        <button
          type="button"
          data-globe-reset
          className="pointer-events-auto rounded-md border border-teal-500/30 bg-[#0a1528]/80 px-2.5 py-1 text-[11px] text-teal-100 hover:border-teal-400/40 hover:bg-[#0d1a30]"
        >
          {labels.reset}
        </button>
      </div>
      <p className="pointer-events-none relative z-10 mt-auto px-3 pb-3 text-[10px] text-slate-400 sm:px-4">{labels.keyboardHint}</p>
      <p className="sr-only">{NATURAL_EARTH_ATTRIBUTION}</p>
    </div>
  );
}
