// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { BackToTopButton } from "./BackToTopButton";

describe("BackToTopButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is hidden when the page is at the top", () => {
    render(<BackToTopButton />);
    expect(screen.queryByRole("button", { name: "Volver arriba" })).not.toBeInTheDocument();
  });

  it("appears after scrolling past the threshold", () => {
    Object.defineProperty(window, "scrollY", { value: 500, writable: true, configurable: true });
    render(<BackToTopButton />);
    fireEvent.scroll(window);
    expect(screen.getByRole("button", { name: "Volver arriba" })).toBeInTheDocument();
  });

  it("scrolls smoothly to top on click", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, "scrollY", { value: 800, writable: true, configurable: true });
    window.scrollTo = scrollTo;
    render(<BackToTopButton />);
    fireEvent.scroll(window);

    fireEvent.click(screen.getByRole("button", { name: "Volver arriba" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
