import { describe, it, expect } from "vitest";
import { PROJECT_CATEGORIES, getDefaultProjectImage, filterPublishedProjects, PublicProjectSearchResultDto } from "../usePublishedProjects";

describe("usePublishedProjects filter", () => {
  it("has exactly 16 PROJECT_CATEGORIES according to the CategoriaProyecto table", () => {
    expect(PROJECT_CATEGORIES).toHaveLength(16);
    expect(PROJECT_CATEGORIES.map(c => c.label)).toContain("ALBERGUES");
    expect(PROJECT_CATEGORIES.map(c => c.label)).toContain("VIVIENDAS");
    
    // Verify specific ID mapping
    const albergues = PROJECT_CATEGORIES.find(c => c.value === 1);
    expect(albergues?.label).toBe("ALBERGUES");
  });

  it("getDefaultProjectImage handles all 16 categories", () => {
    const images = new Set<string>();
    for (let i = 1; i <= 16; i++) {
      const url = getDefaultProjectImage(i);
      expect(url).toBeDefined();
      expect(url.length).toBeGreaterThan(0);
      images.add(url);
    }
    // Should have some variety in images, not just fallback
    expect(images.size).toBeGreaterThan(1);
  });

  it("filterPublishedProjects filters by category correctly", () => {
    const mockProjects = [
      { id: "1", nombreProyecto: "Test 1", estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, categoriaId: 1 },
      { id: "2", nombreProyecto: "Test 2", estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, categoriaId: 16 }
    ] as PublicProjectSearchResultDto[];

    const result = filterPublishedProjects(mockProjects, {
      searchQuery: "",
      projectTypes: [16], // Filter by VIVIENDAS
      priceRange: [0, 1000000],
      province: ""
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
