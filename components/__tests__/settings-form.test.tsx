"use client";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import SettingsForm from "@/components/settings-form";
import { settingsSchema } from "@/types/settings";

function setup() {
  const user = userEvent.setup();
  render(<SettingsForm />);
  return { user };
}

async function fillValidSettings(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Rajin Shahriar");
  await user.type(screen.getByLabelText("Email"), "RAJIN@example.com");
  await user.selectOptions(screen.getByLabelText("Timezone"), "Asia/Dhaka");
}

describe("SettingsForm", () => {
  it("renders every settings field", () => {
    setup();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
    expect(screen.getByLabelText("Timezone")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Marketing emails" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("shows required errors and flags fields as invalid on empty submit", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Full name must be at least 2 characters."),
    ).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Select your timezone.")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("moves focus to the first invalid field on failed submit", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByText("Full name must be at least 2 characters.");
    expect(screen.getByLabelText("Full name")).toHaveFocus();
  });

  it("rejects an invalid email format", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Full name"), "Rajin Shahriar");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("caps the bio at 240 characters and shows a live counter", async () => {
    const { user } = setup();
    const bio = screen.getByLabelText("Bio");

    expect(screen.getByText("0/240")).toBeInTheDocument();
    await user.type(bio, "a".repeat(300));

    expect(bio).toHaveValue("a".repeat(240));
    expect(screen.getByText("240/240")).toBeInTheDocument();
  });

  it("saves successfully, disabling the button while pending", async () => {
    const { user } = setup();
    await fillValidSettings(user);
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    await screen.findByText("Profile saved.");
    expect(screen.getByRole("button", { name: "Save changes" })).not.toBeDisabled();
  });

  it("clears the success message once the user edits again", async () => {
    const { user } = setup();
    await fillValidSettings(user);
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Profile saved.");

    await user.type(screen.getByLabelText("Full name"), "x");
    await waitFor(() =>
      expect(screen.queryByText("Profile saved.")).not.toBeInTheDocument(),
    );
  });
});

describe("settingsSchema", () => {
  it("trims input and normalises email to lowercase", () => {
    const result = settingsSchema.parse({
      fullName: "  Rajin  ",
      email: "  RAJIN@Example.com ",
      bio: "",
      timezone: "Asia/Dhaka",
      marketingEmails: false,
    });

    expect(result.fullName).toBe("Rajin");
    expect(result.email).toBe("rajin@example.com");
  });
});