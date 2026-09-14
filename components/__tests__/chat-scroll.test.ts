import { describe, expect, it } from "vitest";
import { isNearBottom } from "@/components/chat-scroll";

describe("isNearBottom", () => {
  it("returns true when the viewport is within the threshold of the bottom", () => {
    expect(isNearBottom(900, 1000, 100, 64)).toBe(true);
    expect(isNearBottom(936, 1000, 100, 64)).toBe(true);
  });

  it("returns false once the user scrolls up past the threshold", () => {
    expect(isNearBottom(800, 1000, 100, 64)).toBe(false);
    expect(isNearBottom(0, 1000, 100, 64)).toBe(false);
  });

  it("treats a short conversation as pinned (always at the bottom)", () => {
    expect(isNearBottom(0, 0, 100, 64)).toBe(true);
  });
});