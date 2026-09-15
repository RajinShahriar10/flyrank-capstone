"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SignatureHeroSceneProps {
  mouse: { current: THREE.Vector2 };
  moved: { current: boolean };
}

/** Vertex shader: pass uv through; the plane is sized to the viewport so uv
 *  already covers (0,0)-(1,1) across the whole visible screen. */
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Fragment shader — a personalised aurora flow field in the CraftUI palette.
 *
 *  Top-to-bottom structure a mentor can walk through:
 *  1. uniforms — u_time (frozen while the tab is hidden), u_resolution (canvas
 *     size, for aspect correction), u_mouse (normalised, 0..1).
 *  2. palette()    — the brand ramp: deep indigo → indigo → violet. This is
 *     where the "your own colours" requirement lives.
 *  3. hash/noise/fbm — layered value noise; fbm is what turns a flat gradient
 *     into flowing, ribbon-like sheets.
 *  4. main()       — aspect correction → seasonal scroll → two noise sheets
 *     mixed with a mouse "lean" → palette → brightness lift → cursor glow →
 *     film grain → vignette. Readability of overlaid text is handled by the
 *     brightness lift + vignette keeping edges and lower area calm.
 */
const FRAGMENT_SHADER = /* glsl */ `
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;

  varying vec2 vUv;

  // Brand-remixed ramp: interpolate between the CraftUI tokens' hue family.
  vec3 palette(float t) {
    return mix(
      vec3(0.19, 0.22, 0.35),   // brand-900 deep indigo
      mix(
        vec3(0.40, 0.48, 0.95), // brand-500 indigo
        vec3(0.72, 0.36, 0.85), // violet accent
        smoothstep(0.0, 0.5, t)
      ),
      smoothstep(0.0, 1.0, t)
    );
  }

  // Cheap pseudo-random hash from a 2D coordinate.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Value noise: bilinear blend of four hashed lattice corners.
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);        // smoothstep easing, no seams
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Four octaves of noise folded over themselves: fbm gives the smooth,
  // organic "aurora sheets" look instead of static blobs.
  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * noise(p);
      p = p * 2.03 + vec2(17.3, 9.1);   // rescale + reseed each octave
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    // Aspect-correct uv so the aurora keeps round proportions on any screen.
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 uv = (vUv - 0.5) * aspect;

    // Mouse, mapped into the same space as uv (0..1 → center origin).
    vec2 mouse = (u_mouse - 0.5) * aspect;

    // Two fbm sheets scroll slowly in different directions and speeds.
    vec2 scrollA = vec2(u_time * 0.05, u_time * 0.018);
    vec2 scrollB = vec2(-u_time * 0.03, u_time * 0.012);

    // Sheets are sheared: thin in y (so bands hang across the screen), long
    // in x (so they read as flowing strokes rather than froth).
    float sheetA = fbm(vec2(uv.x * 1.6, uv.y * 3.2) + scrollA);
    float sheetB = fbm(vec2(uv.x * 1.9, uv.y * 3.6) + scrollB + vec2(2.4, 5.1));

    // Mouse "lean": tilt the field mix toward the cursor. Small amplitude so
    // it reads as the aurora drifting your way, never as a hard warp.
    float lean = dot(mouse, uv) * 0.55;

    // Field = the two sheets plus the lean, mapped back into 0..1 for palette.
    float field = sheetA * 0.65 + sheetB * 0.45 + lean;
    vec3 col = palette(field * 0.5 + 0.5);

    // Brightness lift: upper half glows so the headline sits on light, the
    // lower half stays deeper for contrast under the intro line.
    col *= mix(0.72, 1.0, smoothstep(-0.5, 1.2, uv.y));

    // Cursor glow — multiplicative so it brightens existing hue, not flat paint.
    col *= 1.0 + 0.35 * exp(-3.2 * length(uv - mouse));

    // Film grain: one hash per pixel, time-stepped. Hides banding in the
    // gradient and gives the piece an analogue, film-like texture.
    col += (hash(uv * u_resolution + vec2(u_time * 0.7, -u_time * 0.5)) - 0.5) * 0.06;

    // Gentle vignette keeps frame edge calm for overlaid text.
    col *= 1.0 - 0.35 * smoothstep(0.8, 1.9, length(uv));

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** The single fullscreen plane. All the "scene" lives in the fragment shader,
 *  so there are no lights, materials to light, or camera moves. */
function ShaderSurface({
  mouse,
  moved,
}: SignatureHeroSceneProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) {
      return;
    }

    // Timeline pauses when the tab is hidden, resumes where it left off.
    if (!document.hidden) {
      mat.uniforms.u_time.value += delta;
    }
    mat.uniforms.u_resolution.value.set(size.width, size.height);

    // Only feed the cursor once it has actually moved; until then the shader
    // keeps its centred (0.5, 0.5) default so nothing glows in a corner.
    if (moved.current) {
      mat.uniforms.u_mouse.value.set(
        mouse.current.x / size.width,
        mouse.current.y / size.height,
      );
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{
          u_time: { value: 0 },
          u_resolution: {
            value: new THREE.Vector2(size.width, size.height),
          },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        }}
        transparent={false}
        toneMapped={false}
      />
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

export default function SignatureHeroScene({
  mouse,
  moved,
}: SignatureHeroSceneProps) {
  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      mouse.current.set(event.clientX, event.clientY);
      moved.current = true;
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [mouse, moved]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-brand-900"
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 2], fov: 40, near: 0.1, far: 10 }}
      >
        <ShaderSurface mouse={mouse} moved={moved} />
      </Canvas>
    </div>
  );
}