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

  it("filterPublishedProjects filters by dateFrom and dateTo correctly (including time boundary issues)", () => {
    const today = new Date("2026-08-26T12:00:00Z");
    
    // Create dates for projects with times in the middle of the day
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); // 2026-08-25T12:00:00Z
    const oneWeekAgo = new Date(today); oneWeekAgo.setDate(today.getDate() - 7); // 2026-08-19T12:00:00Z
    const tenDaysAgo = new Date(today); tenDaysAgo.setDate(today.getDate() - 10); // 2026-08-16T12:00:00Z
    const fifteenDaysAgo = new Date(today); fifteenDaysAgo.setDate(today.getDate() - 15); // 2026-08-11T12:00:00Z

    // HTML5 date input format (YYYY-MM-DD)
    const formatToYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

    const mockProjects = [
      { id: "1", nombreProyecto: "Yesterday Project", createdAtUtc: yesterday.toISOString(), estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, integridadValidada: 100 },
      { id: "2", nombreProyecto: "1 Week Ago Project", createdAtUtc: oneWeekAgo.toISOString(), estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, integridadValidada: 100 },
      { id: "3", nombreProyecto: "10 Days Ago Project", createdAtUtc: tenDaysAgo.toISOString(), estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, integridadValidada: 100 },
      { id: "4", nombreProyecto: "15 Days Ago Project", createdAtUtc: fifteenDaysAgo.toISOString(), estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, integridadValidada: 100 },
      { id: "5", nombreProyecto: "No Date Project", createdAtUtc: undefined, estadoValidacion: "A", estadoJuridico: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 1, completionRate: 100, integridadValidada: 100 }
    ] as PublicProjectSearchResultDto[];

    // 1. Filter from 10 days ago -> Should return yesterday, 1 week, and 10 days (3 projects)
    const result1 = filterPublishedProjects(mockProjects, {
      searchQuery: "", projectTypes: [], priceRange: [0, 15000000], province: "",
      dateFrom: formatToYYYYMMDD(tenDaysAgo)
    });
    expect(result1.map(r => r.nombreProyecto)).toEqual([
      "Yesterday Project",
      "1 Week Ago Project",
      "10 Days Ago Project"
    ]);
    
    // 2. Filter until 1 week ago -> Should return 1 week, 10 days, 15 days (3 projects)
    const result2 = filterPublishedProjects(mockProjects, {
      searchQuery: "", projectTypes: [], priceRange: [0, 15000000], province: "",
      dateTo: formatToYYYYMMDD(oneWeekAgo)
    });
    expect(result2.map(r => r.nombreProyecto)).toEqual([
      "1 Week Ago Project",
      "10 Days Ago Project",
      "15 Days Ago Project"
    ]);

    // 3. Filter between 10 days ago and yesterday -> Should return yesterday, 1 week, and 10 days (3 projects)
    const result3 = filterPublishedProjects(mockProjects, {
      searchQuery: "", projectTypes: [], priceRange: [0, 15000000], province: "",
      dateFrom: formatToYYYYMMDD(tenDaysAgo),
      dateTo: formatToYYYYMMDD(yesterday)
    });
    expect(result3.map(r => r.nombreProyecto)).toEqual([
      "Yesterday Project",
      "1 Week Ago Project",
      "10 Days Ago Project"
    ]);
  });
});
