import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskForm from "@/components/task-form";

function setup() {
  const onAdd = vi.fn();
  const user = userEvent.setup();
  render(<TaskForm onAdd={onAdd} />);
  return { user, onAdd };
}

describe("TaskForm", () => {
  it("renders the title, deadline and add controls", () => {
    setup();
    expect(screen.getByLabelText("Task title")).toBeInTheDocument();
    expect(screen.getByLabelText("Deadline (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add task" })).toBeInTheDocument();
  });

  it("rejects a title shorter than 3 characters", async () => {
    const { user, onAdd } = setup();

    await user.type(screen.getByLabelText("Task title"), "ab");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(
      await screen.findByText("Task title must be at least 3 characters."),
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Task title")).toHaveAttribute("aria-invalid", "true");
  });

  it("rejects a title longer than 120 characters", async () => {
    const { user, onAdd } = setup();

    await user.type(screen.getByLabelText("Task title"), "a".repeat(121));
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(
      await screen.findByText("Task title must be 120 characters or fewer."),
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("trims the title and resets the form on a valid submit", async () => {
    const { user, onAdd } = setup();
    const title = screen.getByLabelText("Task title");

    await user.type(title, "  Ship auth flow  ");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(onAdd).toHaveBeenCalledWith({ title: "Ship auth flow", deadline: "" });
    expect(title).toHaveValue("");
  });
});