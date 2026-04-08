import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { BoardProvider } from "../../contexts/BoardContext";
import BoardCard from "./BoardCard";

const mockBoard = {
  id: "board-1",
  name: "Test Board",
  description: "A test board description",
  color: "#3b82f6",
  isProtected: false,
  pin: "",
  pinnedBy: [],
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-1",
};

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <BoardProvider>{component}</BoardProvider>
    </ThemeProvider>,
  );
};

describe("BoardCard", () => {
  it("renders board information correctly", () => {
    renderWithProviders(
      <BoardCard
        board={mockBoard}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onPin={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Test Board")).toBeInTheDocument();
    expect(screen.getByText("A test board description")).toBeInTheDocument();
  });

  it("calls onView when view button is clicked", () => {
    const mockOnView = vi.fn();
    renderWithProviders(
      <BoardCard
        board={mockBoard}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onPin={vi.fn()}
        onView={mockOnView}
      />,
    );

    const viewButton = screen.getByText("View Notes");
    fireEvent.click(viewButton);
    expect(mockOnView).toHaveBeenCalledWith(mockBoard.id);
  });
});
