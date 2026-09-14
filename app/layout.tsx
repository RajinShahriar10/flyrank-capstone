import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/site-nav";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "CraftUI",
  description: "Frontend AI showcase — forms, task state, and accessible components.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="flex min-h-screen flex-col bg-paper text-ink antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
            <Link
              href="/"
              className="order-1 flex items-center gap-2 text-base font-semibold sm:text-lg"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-2.5 rounded-full bg-brand-500"
              />
              CraftUI
            </Link>
            <SiteNav />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <p className="mx-auto w-full max-w-5xl px-4 py-4 text-center text-xs text-slate-500">
            CraftUI · Frontend AI Engineering track
          </p>
        </footer>
      </body>
    </html>
  );
}