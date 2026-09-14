import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatefulButton } from "@/components/stateful-button";

function setup(action: () => Promise<void> = vi.fn().mockResolvedValue(undefined)) {
  render(<StatefulButton action={action} defaultLabel="Send message" />);
  return screen.getByRole("button", { name: /send message/i });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("StatefulButton", () => {
  it("starts idle with the default label", () => {
    const button = setup();
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).toHaveAttribute("aria-label", "Send message");
    expect(button).toBeEnabled();
  });

  it("moves to loading on click and is immune to spam clicks", async () => {
    let release: () => void = () => undefined;
    const action = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            release = resolve;
          }),
      );
    const button = setup(action);

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(action).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    await act(async () => {
      release();
    });
  });

  it("reports success for a readable beat, then returns to idle", async () => {
    vi.useFakeTimers();
    const button = setup();

    act(() => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute("aria-label", "Sending…");

    await act(async () => {
      await Promise.resolve();
    });
    expect(button).toHaveAttribute("data-state", "success");
    expect(button).toHaveAttribute("aria-label", "Sent");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).toBeEnabled();
  });

  it("falls to an error state and a retry re-runs the action", async () => {
    const action = vi.fn().mockRejectedValue(new Error("boom"));
    const button = setup(action);

    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(button).toHaveAttribute("data-state", "error");
    expect(button).toHaveAttribute("aria-label", "Try again");

    act(() => {
      fireEvent.click(button);
    });
    expect(action).toHaveBeenCalledTimes(2);
    expect(button).toHaveAttribute("data-state", "loading");
  });

  it("never calls the action while disabled", () => {
    const action = vi.fn();
    render(<StatefulButton action={action} defaultLabel="Send message" disabled />);
    const button = screen.getByRole("button", { name: /send message/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(action).not.toHaveBeenCalled();
  });

  it("shares the motion language across labels and variants", () => {
    render(
      <StatefulButton
        action={vi.fn().mockResolvedValue(undefined)}
        defaultLabel="Save changes"
        loadingLabel="Saving…"
        successLabel="Saved"
        errorLabel="Try again"
        variant="ink"
      />,
    );
    expect(screen.getByRole("button", { name: /save changes/i })).toHaveAttribute(
      "data-state",
      "idle",
    );
  });
});