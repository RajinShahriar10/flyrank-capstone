import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import TasksPage from "@/app/tasks/page";

async function addTask(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByLabelText("Task title"), title);
  await user.click(screen.getByRole("button", { name: "Add task" }));
}

function doneCheckbox(title: string) {
  return `Mark "${title}" as done`;
}

describe("TasksPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an empty state when there are no tasks", async () => {
    render(<TasksPage />);
    expect(await screen.findByText("All caught up.")).toBeInTheDocument();
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
  });

  it("adds a task and exposes it with an accessible name", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Write FE-03 reflection");

    expect(
      await screen.findByRole("checkbox", { name: doneCheckbox("Write FE-03 reflection") }),
    ).toBeInTheDocument();
  });

  it("toggles a task between done and not done", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Review draft");
    const checkbox = await screen.findByRole("checkbox", {
      name: doneCheckbox("Review draft"),
    });

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("deletes a task", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Delete me");
    await user.click(
      await screen.findByRole("button", { name: 'Delete "Delete me"' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("checkbox", { name: doneCheckbox("Delete me") }),
      ).not.toBeInTheDocument(),
    );
  });

  it("persists tasks across remounts via localStorage", async () => {
    const user = userEvent.setup();
    const first = render(<TasksPage />);

    await addTask(user, "Persist me");
    await screen.findByRole("checkbox", { name: doneCheckbox("Persist me") });
    first.unmount();

    render(<TasksPage />);
    expect(
      await screen.findByRole("checkbox", { name: doneCheckbox("Persist me") }),
    ).toBeInTheDocument();
  });

  it("filters between all, active and completed tasks", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Alpha");
    await addTask(user, "Beta");
    const alpha = await screen.findByRole("checkbox", { name: doneCheckbox("Alpha") });
    await user.click(alpha);

    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(
      screen.queryByRole("checkbox", { name: doneCheckbox("Alpha") }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: doneCheckbox("Beta") }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(
      screen.getByRole("checkbox", { name: 'Mark "Alpha" as not done' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: doneCheckbox("Beta") }),
    ).not.toBeInTheDocument();
  });

  it("announces how many tasks remain", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "One");
    expect(await screen.findByText("1 remaining")).toBeInTheDocument();

    await addTask(user, "Two");
    expect(screen.getByText("2 remaining")).toBeInTheDocument();
  });
});