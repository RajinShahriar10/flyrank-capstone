import type { Metadata } from "next";
import Chat from "@/components/chat";

export const metadata: Metadata = {
  title: "AI chat — CraftUI",
};

export default function StreamPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">AI chat</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        A streaming conversation powered by Gemini through the Vercel AI SDK.
        Responses stream token by token; Stop interrupts without breaking the
        conversation. The API key lives server-side only.
        Ask it to score a feature, or to clear the conversation.
      </p>
      <div className="mt-6">
        <Chat />
      </div>
    </div>
  );
}