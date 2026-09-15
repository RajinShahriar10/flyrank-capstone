"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SignatureHeroScene = lazy(() => import("@/components/signature-hero-scene"));

interface SignatureHeroProps {
  title: string;
  intro: string;
}

/** Detects whether the environment can actually run the shader. `true` only
 *  when WebGL is present and the user hasn't asked for reduced motion (or
 *  low-power — same signal in practice, so one check covers both). */
function canRunShader(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const reducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const WebGLContext =
    window.WebGLRenderingContext ?? window.WebGL2RenderingContext;
  const canvas = document.createElement("canvas");
  const webgl =
    Boolean(WebGLContext) &&
    Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  return webgl && !reducedMotion;
}

/** Static fallback: the same indigo → violet field as a CSS gradient, so
 *  reduced-motion and no-WebGL visitors still get the hero's palette with the
 *  headline on top. No animation, no pointer wiring, no canvas at all. */
function ShaderFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(160deg,var(--color-brand-900)_0%,var(--color-brand-600)_45%,var(--color-brand-700)_75%,var(--color-brand-600)_100%)]"
    />
  );
}

export default function SignatureHero({ title, intro }: SignatureHeroProps) {
  const [enabled, setEnabled] = useState(false);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const moved = useRef(false);

  useEffect(() => {
    setEnabled(canRunShader());
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {enabled ? (
        <Suspense fallback={<ShaderFallback />}>
          <SignatureHeroScene mouse={mouse} moved={moved} />
        </Suspense>
      ) : (
        <ShaderFallback />
      )}

      <div className="container relative px-4 py-24 text-center sm:px-6">
        <h1 className="text-5xl font-semibold tracking-tight text-paper sm:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl font-medium text-brand-100 sm:text-2xl">
          {intro}
        </p>
      </div>
    </section>
  );
}