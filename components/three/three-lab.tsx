"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PartName, SceneSettings } from "@/components/three/scene-canvas";
import { DEFAULT_SETTINGS, PART_LABELS } from "@/components/three/scene-canvas";

/** Lazy body: Three.js, R3F and drei are only downloaded after the user asks
 *  for the 3D studio, so the page shell stays light. SSR stays off — the scene
 *  is client-only WebGL. */
const SceneCanvas = dynamic(() => import("@/components/three/scene-canvas"), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-slate-200" />,
});

const SWATCHES: { value: string; className: string }[] = [
  { value: "#4f46e5", className: "bg-brand-600" },
  { value: "#f59e0b", className: "bg-amber-500" },
  { value: "#e11d48", className: "bg-rose-600" },
  { value: "#10b981", className: "bg-emerald-500" },
  { value: "#0f172a", className: "bg-slate-900" },
];

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ThreeLab() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [settings, setSettings] = useState<SceneSettings>(DEFAULT_SETTINGS);
  const [selectedPart, setSelectedPart] = useState<PartName | null>(null);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    setSupported(webglAvailable());
  }, []);

  const blocked = reducedMotion || supported === false;

  if (blocked) {
    return (
      <div
        role="status"
        className="flex h-96 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 via-paper to-slate-100 text-center"
      >
        <p className="text-2xl" aria-hidden="true">
          ◭
        </p>
        <p className="text-sm text-slate-600">
          {reducedMotion
            ? "3D studio paused — your device prefers reduced motion."
            : "3D studio is unavailable — WebGL isn't supported here."}
        </p>
        <p className="max-w-sm text-xs text-slate-500">
          The product still works in the chat at <strong>/stream</strong>, and
          everything in this studio controls motion, so you would lose the point
          of it. We kept a quiet fallback instead.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-[#eef2ff]">
        {launched ? (
          <div className="h-96">
            <SceneCanvas
              settings={settings}
              selectedPart={selectedPart}
              onSelectPart={setSelectedPart}
            />
          </div>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="max-w-sm text-center text-sm text-slate-600">
              Stage a small product: rotate, zoom, select a part below, and
              change its material. The scene loads only when you ask for it.
            </p>
            <button
              type="button"
              onClick={() => setLaunched(true)}
              className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Launch 3D studio
            </button>
          </div>
        )}
      </div>

      {launched && (
        <fieldset className="mt-4 rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">
            Configurator
            {selectedPart !== null && (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                Selected: {PART_LABELS[selectedPart]}
              </span>
            )}
          </legend>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">Color</p>
              <div className="flex gap-2">
                {SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    aria-label={`Color ${swatch.value}`}
                    aria-pressed={settings.color === swatch.value}
                    onClick={() => setSettings((s) => ({ ...s, color: swatch.value }))}
                    className={`size-7 rounded-full border border-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${swatch.className}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="metalness"
                className="mb-2 block text-xs font-medium text-slate-600"
              >
                Metalness: <output htmlFor="metalness">{settings.metalness.toFixed(2)}</output>
              </label>
              <input
                id="metalness"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.metalness}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, metalness: Number(event.target.value) }))
                }
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="roughness"
                className="mb-2 block text-xs font-medium text-slate-600"
              >
                Roughness: <output htmlFor="roughness">{settings.roughness.toFixed(2)}</output>
              </label>
              <input
                id="roughness"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.roughness}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, roughness: Number(event.target.value) }))
                }
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="rotate"
                className="mb-2 block text-xs font-medium text-slate-600"
              >
                Auto-rotate: <output htmlFor="rotate">{settings.autoRotateSpeed}</output>
              </label>
              <input
                id="rotate"
                type="range"
                min={0}
                max={4}
                step={0.2}
                value={settings.autoRotateSpeed}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, autoRotateSpeed: Number(event.target.value) }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.wireframe}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, wireframe: event.target.checked }))
                }
                className="size-4 rounded border-slate-300 text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
              Wireframe
            </label>
            <button
              type="button"
              onClick={() => {
                setSettings(DEFAULT_SETTINGS);
                setSelectedPart(null);
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Reset studio
            </button>
          </div>
        </fieldset>
      )}
    </div>
  );
}