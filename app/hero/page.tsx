import type { Metadata } from "next";
import SignatureHero from "@/components/signature-hero";

export const metadata: Metadata = {
  title: "Signature hero",
  description:
    "A fullscreen fragment shader — aurora field in the CraftUI palette, behind a thin headline.",
};

export default function HeroPage() {
  return (
    <SignatureHero
      title="CraftUI."
      intro="A field of light, painted by hand — one fragment at a time."
    />
  );
}