import PlaygroundDemo from "@/components/playground-demo";

export default function PlaygroundPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Accessible components playground</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Hand-built modal, tabs, and disclosure (W3C ARIA Authoring Practices)
        side by side with the shadcn/ui equivalents. Compare source in
        <code className="font-mono text-xs"> playground/ </code>and
        <code className="font-mono text-xs"> components/ui/ </code>.
      </p>
      <div className="mt-8">
        <PlaygroundDemo />
      </div>
    </div>
  );
}