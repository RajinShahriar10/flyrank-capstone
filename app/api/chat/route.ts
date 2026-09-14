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

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingMessages = Parameters<typeof convertToModelMessages>[0];

function readMessages(body: unknown): IncomingMessages {
  if (typeof body !== "object" || body === null) {
    return [];
  }
  const messages = (body as { messages?: unknown }).messages;
  return (Array.isArray(messages) ? messages : []) as IncomingMessages;
}

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Server: GOOGLE_GENERATIVE_AI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const body: unknown = await request.json();
  const messages = await convertToModelMessages(readMessages(body));

  const result = streamText({
    model: google(CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages,
    temperature: CHAT_TEMPERATURE,
    maxOutputTokens: CHAT_MAX_TOKENS,
    tools: chatTools,
  });

  // Convert the model text stream into a UI message stream the client's
  // useChat understands, without leaking server-side error details.
  const uiStream = toUIMessageStream({
    stream: result.stream,
    tools: chatTools,
    onError: () => "The stream ended with an unexpected error.",
  });

  return createUIMessageStreamResponse({ stream: uiStream });
}