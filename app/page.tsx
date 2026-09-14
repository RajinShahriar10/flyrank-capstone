import Link from "next/link";

const screens = [
  {
    href: "/tasks",
    title: "Task manager",
    description: "Add, complete, filter and persist tasks in the browser.",
  },
  {
    href: "/settings",
    title: "Settings",
    description: "Profile settings with validated inputs and accessible errors.",
  },
  {
    href: "/profile",
    title: "Profile",
    description: "Placeholder screen — planned for a later milestone.",
  },
  {
    href: "/health",
    title: "Health check",
    description: "Live service status rendered from the API.",
  },
  {
    href: "/playground",
    title: "A11y playground",
    description: "Hand-built modal, tabs and disclosure vs shadcn/ui.",
  },
  {
    href: "/stream",
    title: "AI chat",
    description: "Token-by-token streaming conversation with Claude.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          CraftUI
        </h1>
        <p className="max-w-2xl text-slate-600">
          A full-stack Next.js application — React, TypeScript and Tailwind,
          served from Vercel. This is the skeleton; every screen below is a
          routed destination, live on every push.
        </p>
      </section>

      <section aria-label="Screens" className="grid gap-4 sm:grid-cols-2">
        {screens.map((screen) => (
          <Link
            key={screen.href}
            href={screen.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <h2 className="font-medium text-brand-700 group-hover:underline">
              {screen.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{screen.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}