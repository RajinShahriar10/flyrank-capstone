import type { Metadata } from "next";
import ThreeLab from "@/components/three/three-lab";

export const metadata: Metadata = {
  title: "3D studio — CraftUI",
};

export default function ThreePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">3D product studio</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        A small WebGL product stage, built with React Three Fiber. Rotate and
        zoom, then click any part to select it and restyle its material from
        the configurator. The scene is lazy-loaded on request and trades a
        static fallback for reduced-motion or no-WebGL contexts.
      </p>
      <div className="mt-6">
        <ThreeLab />
      </div>
    </div>
  );
}