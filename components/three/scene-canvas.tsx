"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useCursor } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

export type PartName = "base" | "stem" | "head" | "ring";

export interface SceneSettings {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  autoRotateSpeed: number;
}

export const DEFAULT_SETTINGS: SceneSettings = {
  color: "#4f46e5",
  metalness: 0.55,
  roughness: 0.25,
  wireframe: false,
  autoRotateSpeed: 0.6,
};

/** One mesh per part keeps the configurator and material updates trivial —
 *  no geometry is ever rebuilt, only material props change. */
const PARTS: {
  name: PartName;
  position: [number, number, number];
  mesh: React.ReactNode;
}[] = [
  { name: "base", position: [0, 0.09, 0], mesh: <cylinderGeometry args={[1.05, 1.2, 0.18, 48]} /> },
  { name: "stem", position: [0, 0.82, 0], mesh: <cylinderGeometry args={[0.1, 0.13, 1.25, 24]} /> },
  { name: "head", position: [0, 1.75, 0], mesh: <sphereGeometry args={[0.5, 32, 32]} /> },
  { name: "ring", position: [0, 1.75, 0], mesh: <torusGeometry args={[0.85, 0.05, 12, 48]} /> },
];

export const PART_LABELS: Record<PartName, string> = {
  base: "Base",
  stem: "Stem",
  head: "Head",
  ring: "Orbit ring",
};

interface SceneCanvasProps {
  settings: SceneSettings;
  selectedPart: PartName | null;
  onSelectPart: (part: PartName | null) => void;
}

/** The cursor becomes a light source, so the material reacts to where the
 *  pointer is. One extra point light that lerps toward the pointer in world
 *  space — cheap, no layout work. */
function CursorLight() {
  const light = useRef<THREE.PointLight>(null);
  const { pointer } = useThree();

  useFrame(() => {
    light.current?.position.lerp(
      new THREE.Vector3(pointer.x * 3, 2.4, pointer.y * 3 + 1),
      0.12,
    );
  });

  return (
    <pointLight ref={light} position={[0, 2.4, 1]} intensity={18} distance={7} color="#7dd3fc" />
  );
}

export default function SceneCanvas({
  settings,
  selectedPart,
  onSelectPart,
}: SceneCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [3.4, 2.4, 4.4], fov: 42 }}
      gl={{ antialias: true }}
    >
      <SceneContent
        settings={settings}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
      />
    </Canvas>
  );
}

function SceneContent({
  settings,
  selectedPart,
  onSelectPart,
}: SceneCanvasProps) {
  const rig = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<PartName | null>(null);
  useCursor(hovered !== null);

  useFrame((_, delta) => {
    if (!rig.current) {
      return;
    }
    rig.current.rotation.y += delta * settings.autoRotateSpeed * 0.6;
    rig.current.position.y = Math.sin(performance.now() * 0.0008) * 0.05;
  });

  return (
    <>
      <color attach="background" args={["#eef2ff"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <CursorLight />

      <group ref={rig}>
        {PARTS.map((part) => {
          const selected = selectedPart === part.name;
          return (
            <mesh
              key={part.name}
              name={part.name}
              position={part.position}
              castShadow
              receiveShadow
              onClick={(event) => {
                event.stopPropagation();
                onSelectPart(selected ? null : part.name);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(part.name);
              }}
              onPointerOut={() => setHovered(null)}
            >
              {part.mesh}
              <meshStandardMaterial
                color={settings.color}
                metalness={settings.metalness}
                roughness={settings.roughness}
                wireframe={settings.wireframe}
                emissive={selected ? "#f59e0b" : "#000000"}
                emissiveIntensity={selected ? 0.7 : 0}
              />
            </mesh>
          );
        })}
      </group>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={9}
        target={[0, 0.9, 0]}
      />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={6}
        blur={2.4}
        far={3}
        color="#312e81"
      />
    </>
  );
}