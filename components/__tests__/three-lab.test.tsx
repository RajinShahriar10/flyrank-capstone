import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import ThreeLab from "@/components/three/three-lab";

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
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as WebGLRenderingContext);
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

describe("ThreeLab", () => {
  it("shows a quiet fallback instead of a canvas when WebGL is missing", async () => {
    stubMatchMedia(false);
    stubWebGL(false);

    render(<ThreeLab />);

    expect(
      await screen.findByText(/WebGL isn't supported here/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /launch 3d studio/i })).not.toBeInTheDocument();
  });

  it("shows a reduced-motion fallback when the user prefers reduced motion", async () => {
    stubMatchMedia(true);
    stubWebGL(true);

    render(<ThreeLab />);

    expect(
      await screen.findByText(/prefers reduced motion/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /launch 3d studio/i })).not.toBeInTheDocument();
  });

  it("offers a lazy-loaded launch poster when WebGL is available", async () => {
    stubMatchMedia(false);
    stubWebGL(true);

    render(<ThreeLab />);

    expect(
      await screen.findByRole("button", { name: /launch 3d studio/i }),
    ).toBeVisible();
    // Nothing heavy is mounted yet — the scene only loads on demand.
    expect(document.querySelector("canvas")).toBeNull();
  });
});