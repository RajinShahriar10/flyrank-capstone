import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { google } from "@ai-sdk/google";
import {
  CHAT_MAX_TOKENS,
  CHAT_MODEL,
  CHAT_SYSTEM_PROMPT,
  CHAT_TEMPERATURE,
} from "@/lib/ai/chat";
import { chatTools } from "@/lib/ai/tools";
import { isIPRateLimited, rateLimitedResponse } from "@/lib/security/rate-limit";
import { enforceInputCaps, extractMessages } from "@/lib/security/chat-guard";

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingMessages = Parameters<typeof convertToModelMessages>[0];

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "Server: GOOGLE_GENERATIVE_AI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  // Best-effort rate limit: 20 requests per IP per 60 s (in-memory, per warm
  // instance). The hard caps below ensure per-request cost is bounded even if
  // the limiter is bypassed, so abuse can never drain API credits unboundedly.
  if (isIPRateLimited(request, { limit: 20, windowMs: 60_000 })) {
    return rateLimitedResponse();
  }

  const body: unknown = await request.json();

  // Input caps: reject oversized or malformed payloads before prompt build.
  const guarded = enforceInputCaps(extractMessages(body));
  if ("error" in guarded) {
    return NextResponse.json(
      { error: guarded.error.error },
      { status: guarded.error.status },
    );
  }

  const result = streamText({
    model: google(CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: (await convertToModelMessages(
      guarded.messages as IncomingMessages,
    )),
    temperature: CHAT_TEMPERATURE,
    maxOutputTokens: CHAT_MAX_TOKENS,
    tools: chatTools,
  });

  const uiStream = toUIMessageStream({
    stream: result.stream,
    tools: chatTools,
    onError: () => "The stream ended with an unexpected error.",
  });

  return createUIMessageStreamResponse({ stream: uiStream });
}