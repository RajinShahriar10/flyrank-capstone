import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { usePathname } from "next/navigation";
import SiteNav from "@/components/site-nav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

describe("SiteNav", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("renders every destination as an accessible link", () => {
    render(<SiteNav />);

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    for (const label of [
      "Home",
      "Tasks",
      "Settings",
      "Profile",
      "Health",
      "Chat",
      "Playground",
      "3D",
      "Hero",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the current route with aria-current=\"page\"", () => {
    vi.mocked(usePathname).mockReturnValue("/tasks");
    render(<SiteNav />);

    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});