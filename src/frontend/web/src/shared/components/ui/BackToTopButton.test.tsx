// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { animate } from "framer-motion";
import { BackToTopButton } from "./BackToTopButton";

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, animate: vi.fn() };
});

const animateMock = vi.mocked(animate);

describe("BackToTopButton", () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(() => ({ stop: vi.fn() }) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.style.scrollBehavior = "";
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

    expect(animateMock).toHaveBeenCalledWith(800, 0, expect.objectContaining({ duration: 1.2, ease: "easeInOut" }));
    const opts = animateMock.mock.calls[0][2] as { onUpdate: (v: number) => void; onComplete: () => void };
    expect(opts.onUpdate).toBeTypeOf("function");
    expect(opts.onComplete).toBeTypeOf("function");

    opts.onUpdate(400);
    expect(scrollTo).toHaveBeenCalledWith(0, 400);

    expect(document.documentElement.style.scrollBehavior).toBe("auto");
    opts.onUpdate(0);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);

    opts.onComplete();
    expect(document.documentElement.style.scrollBehavior).toBe("");
  });
});
