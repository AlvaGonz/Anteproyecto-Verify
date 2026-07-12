import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FeaturedProjectsSection } from "./FeaturedProjectsSection";
import { MemoryRouter } from "react-router-dom";
import { useProjects } from "../../projects/api/useProjects";

vi.mock("../../projects/api/useProjects", () => ({
  useProjects: vi.fn(),
}));

// Mock IntersectionObserver for JSDOM / Framer Motion
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() { }
  observe() { }
  takeRecords() { return []; }
  unobserve() { }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});


import { ProjectStatus } from "../../projects/types";

describe("FeaturedProjectsSection Component", () => {
  let scrollByMock: any;

  beforeEach(() => {
    // Mock the HTMLDivElement prototype scrollBy method
    scrollByMock = vi.fn();
    HTMLDivElement.prototype.scrollBy = scrollByMock;

    vi.mocked(useProjects).mockReturnValue({
      data: [
        { id: "1", nombre: "Blue Forest Residences", ubicacionTexto: "Location 1", imagenUrl: "img1", estadoProyecto: ProjectStatus.Validated, completionRate: 0.85 }, // 8.5/10 => ~85%
        { id: "2", nombre: "Marina Reef", ubicacionTexto: "Location 2", imagenUrl: "img2", estadoProyecto: ProjectStatus.Validated, completionRate: 1.0 }, // 10/10 => 100%
        { id: "3", nombre: "Vista Playa", ubicacionTexto: "Location 3", imagenUrl: "img3", estadoProyecto: ProjectStatus.Validated, completionRate: 0.9 }, // 9/10 => 90%
        { id: "4", nombre: "Central Park SD", ubicacionTexto: "Location 4", imagenUrl: "img4", estadoProyecto: ProjectStatus.Validated, completionRate: 0.9 }, // 9/10 => 90%
        { id: "5", nombre: "Sky Tower SD", ubicacionTexto: "Location 5", imagenUrl: "img5", estadoProyecto: ProjectStatus.Validated, completionRate: 0.5 }, // 5/10 => 50%
      ],
      isLoading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render successfully with heading and filter projects", () => {
    render(
      <MemoryRouter>
        <FeaturedProjectsSection />
      </MemoryRouter>
    );

    // Verify title and eyebrow are present
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
    expect(screen.getByText("Verificados")).toBeInTheDocument();

    // Verify "Ver todos los proyectos" link exists
    expect(screen.getByText("Ver todos los proyectos")).toBeInTheDocument();

    // Verify filtered projects are rendered in the carousel track (only projects with delivery >= 80% should appear)
    // E.g. "Blue Forest Residences" (10/12 = 83%), "Marina Reef" (15/15 = 100%), "Vista Playa" (90%), "Central Park SD" (90%), etc.
    expect(screen.getAllByText("Blue Forest Residences")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Marina Reef")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Vista Playa")[0]).toBeInTheDocument();

    // "Sky Tower SD" (5/10 = 50%) should be excluded
    expect(screen.queryByText("Sky Tower SD")).not.toBeInTheDocument();
  });

  it("should smooth scroll left and right when clicking navigation buttons", () => {
    render(
      <MemoryRouter>
        <FeaturedProjectsSection />
      </MemoryRouter>
    );

    const prevButton = screen.getByLabelText("Proyectos anteriores");
    const nextButton = screen.getByLabelText("Siguientes proyectos");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Click next button
    fireEvent.click(nextButton);
    expect(scrollByMock).toHaveBeenCalledWith({
      left: 432,
      behavior: "smooth",
    });

    // Click prev button
    fireEvent.click(prevButton);
    expect(scrollByMock).toHaveBeenCalledWith({
      left: -432,
      behavior: "smooth",
    });
  });

  it("should handle mouse dragging and update scroll position", () => {
    render(
      <MemoryRouter>
        <FeaturedProjectsSection />
      </MemoryRouter>
    );

    // Get the carousel scroll track container (with class overflow-x-auto)
    const track = screen.getAllByText("Blue Forest Residences")[0].closest(".overflow-x-auto");
    expect(track).toBeInTheDocument();

    if (track) {
      // Mock client properties with reactive getter/setters for JSDOM consistency
      let scrollLeft = 1200;
      Object.defineProperty(track, "scrollLeft", {
        get: () => scrollLeft,
        set: (v) => { scrollLeft = v; },
        configurable: true,
      });
      Object.defineProperty(track, "offsetLeft", {
        writable: true,
        value: 10,
        configurable: true,
      });
      Object.defineProperty(track, "scrollWidth", {
        writable: true,
        value: 3600,
        configurable: true,
      });

      // Simulate drag: mousedown
      fireEvent.mouseDown(track, { clientX: 200 });

      // Simulate drag: mousemove (dragging left)
      fireEvent.mouseMove(track, { clientX: 100 });

      // scrollLeftVal (1200) - walk ((100 - 10 - (200 - 10)) * 1.5 = -150) = 1350
      expect(track.scrollLeft).toBe(1350);

      // Simulate mouseup
      fireEvent.mouseUp(track);
    }
  });

  it("should prevent link clicks when a drag has occurred", () => {
    render(
      <MemoryRouter>
        <FeaturedProjectsSection />
      </MemoryRouter>
    );

    const track = screen.getAllByText("Blue Forest Residences")[0].closest(".overflow-x-auto");
    expect(track).toBeInTheDocument();

    if (track) {
      // Find one of the card action buttons/links
      const link = screen.getAllByRole("link").find(el => el.getAttribute("href") === "/projects");
      expect(link).toBeInTheDocument();

      if (link) {
        // Drag active
        fireEvent.mouseDown(track, { clientX: 200 });
        fireEvent.mouseMove(track, { clientX: 100 }); // Walk is 150px (> 5px threshold)

        const clickEvent = fireEvent.click(link);
        // Assert click was prevented
        expect(clickEvent).toBe(false);

        fireEvent.mouseUp(track);
      }
    }
  });
});
