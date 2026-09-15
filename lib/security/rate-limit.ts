import { NextResponse } from "next/server";

export interface RateLimitOptions {
  /** Maximum requests allowed inside one window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Best-effort in-memory fixed-window rate limiter keyed by caller IP.
 *
 *  Runs inside each serverless instance, so the budget is per-instance rather
 *  than global (a cold-start-heavy abuse burst could slip past the edges).
 *  That is acceptable here because the limiter is only the coarse first line
 *  of defence — the input caps in the chat route bound the cost of a single
 *  request, so even a rate-limit breach cannot burn unbounded API credits.
 *  Production teams would layer this with Vercel's WAF rate limiting, which
 *  counts globally. */
export function isRateLimited(key: string, { limit, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return true;
  }
  return false;
}

function clientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** 429 response used by every protected route so clients see one shape. */
export function rateLimitedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: { "Retry-After": "60" },
    },
  );
}

/** Guard helper: returns true (and nothing else to do — the caller returns
 *  the 429) when the key is over its budget. */
export function isIPRateLimited(
  request: Request,
  options: RateLimitOptions,
): boolean {
  return isRateLimited(clientIP(request), options);
}