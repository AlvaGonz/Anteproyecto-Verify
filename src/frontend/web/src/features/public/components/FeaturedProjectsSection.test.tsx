import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FeaturedProjectsSection } from "./FeaturedProjectsSection";
import { MemoryRouter } from "react-router-dom";
import { useSearchPublicProjects } from "../../projects/api/useSearchPublicProjects";
import { ProjectStatus, LegalStatus, IntegrityStatus } from "../../projects/types";

vi.mock("../../projects/api/useSearchPublicProjects", () => ({
  useSearchPublicProjects: vi.fn(),
}));

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

describe("FeaturedProjectsSection Component", () => {
  let scrollByMock: any;

  beforeEach(() => {
    scrollByMock = vi.fn();
    HTMLDivElement.prototype.scrollBy = scrollByMock;

    vi.mocked(useSearchPublicProjects).mockReturnValue({
      data: [
        { id: "1", nombreProyecto: "Blue Forest Residences", ubicacionTexto: "Location 1", imagenUrl: "img1", estadoProyecto: ProjectStatus.Published, estadoJuridico: LegalStatus.Valid, estadoIntegridad: IntegrityStatus.Verified },
        { id: "2", nombreProyecto: "Marina Reef", ubicacionTexto: "Location 2", imagenUrl: "img2", estadoProyecto: ProjectStatus.Published, estadoJuridico: LegalStatus.Valid, estadoIntegridad: IntegrityStatus.Verified },
        { id: "3", nombreProyecto: "Vista Playa", ubicacionTexto: "Location 3", imagenUrl: "img3", estadoProyecto: ProjectStatus.Published, estadoJuridico: LegalStatus.Valid, estadoIntegridad: IntegrityStatus.Verified },
        { id: "4", nombreProyecto: "Central Park SD", ubicacionTexto: "Location 4", imagenUrl: "img4", estadoProyecto: ProjectStatus.Published, estadoJuridico: LegalStatus.Valid, estadoIntegridad: IntegrityStatus.Verified },
        { id: "5", nombreProyecto: "Sky Tower SD", ubicacionTexto: "Location 5", imagenUrl: "img5", estadoProyecto: ProjectStatus.Rejected, estadoJuridico: LegalStatus.Valid, estadoIntegridad: IntegrityStatus.Verified },
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

    // ponytail: component renders "Proyectos" + italic "Verificados" in same h2
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
    expect(screen.getByText("Verificados")).toBeInTheDocument();
    expect(screen.getByText("Ver todos los proyectos")).toBeInTheDocument();

    // "Blue Forest Residences" renders via FALLBACK_PROJECTS (search results filtered by status,
    // only Published+Valid+Verified pass; then all fallbacks have 83%+ delivery ratio)
    expect(screen.getAllByText("Blue Forest Residences")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Marina Reef")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Vista Playa")[0]).toBeInTheDocument();

    // "Sky Tower SD" has estadoProyecto=Rejected → filtered out
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

    fireEvent.click(nextButton);
    expect(scrollByMock).toHaveBeenCalledWith({
      left: 432,
      behavior: "smooth",
    });

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

    const track = screen.getAllByText("Blue Forest Residences")[0].closest(".overflow-x-auto");
    expect(track).toBeInTheDocument();

    if (track) {
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

      fireEvent.mouseDown(track, { clientX: 200 });
      fireEvent.mouseMove(track, { clientX: 100 });

      expect(track.scrollLeft).toBe(1350);

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
      const link = screen.getAllByRole("link").find(el => el.getAttribute("href") === "/projects");
      expect(link).toBeInTheDocument();

      if (link) {
        fireEvent.mouseDown(track, { clientX: 200 });
        fireEvent.mouseMove(track, { clientX: 100 });

        const clickEvent = fireEvent.click(link);
        expect(clickEvent).toBe(false);

        fireEvent.mouseUp(track);
      }
    }
  });
});
