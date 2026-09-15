import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import SignatureHero from "@/components/signature-hero";

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

function stubWebGL(supported: boolean) {
  if (supported) {
    Object.defineProperty(window, "WebGLRenderingContext", {
      value: {},
      configurable: true,
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as WebGLRenderingContext,
    );
  } else {
    Object.defineProperty(window, "WebGLRenderingContext", {
      value: undefined,
      configurable: true,
    });
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SignatureHero", () => {
  it("always renders the headline", async () => {
    stubMatchMedia(false);
    stubWebGL(false);

    render(<SignatureHero title="CraftUI." intro="A hero." />);

    expect(
      await screen.findByRole("heading", { level: 1 }),
    ).toHaveTextContent("CraftUI.");
  });

  it("falls back to a static gradient when WebGL is missing", async () => {
    stubMatchMedia(false);
    stubWebGL(false);

    render(<SignatureHero title="CraftUI." intro="A hero." />);

    await screen.findByRole("heading", { level: 1 });
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("falls back to a static gradient when reduced motion is preferred", async () => {
    stubMatchMedia(true);
    stubWebGL(true);

    render(<SignatureHero title="CraftUI." intro="A hero." />);

    await screen.findByRole("heading", { level: 1 });
    expect(document.querySelector("canvas")).toBeNull();
  });
});