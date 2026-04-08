import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const renderWithTheme = (component) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("ThemeToggle", () => {
  it("renders theme toggle button", () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has correct initial styling", () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("theme-toggle");
  });
});
