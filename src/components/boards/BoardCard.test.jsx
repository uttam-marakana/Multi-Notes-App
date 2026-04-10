import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BoardCard from "./BoardCard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      primary: "#3b82f6",
      border: "#e5e7eb",
      surface: "#ffffff",
      text: "#111827",
      textMuted: "#6b7280",
      danger: "#ef4444",
    },
  }),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    currentUser: {
      uid: "user-1",
    },
  }),
}));

describe("BoardCard", () => {
  const mockBoard = {
    id: "board-1",
    name: "Test Board",
    description: "A test board description",
    color: "#3b82f6",
    isProtected: false,
    pin: "",
    pinnedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    ownerId: "user-1",
  };

  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders board information correctly", () => {
    render(
      <BoardCard
        board={mockBoard}
        onDelete={vi.fn()}
        onPin={vi.fn()}
      />,
    );

    expect(screen.getByText("Test Board")).toBeInTheDocument();
    expect(screen.getByText("A test board description")).toBeInTheDocument();
  });

  it("navigates to the board notes when view button is clicked", () => {
    render(
      <BoardCard
        board={mockBoard}
        onDelete={vi.fn()}
        onPin={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("View Notes"));
    expect(mockNavigate).toHaveBeenCalledWith("/notes?boardId=board-1");
  });
});
