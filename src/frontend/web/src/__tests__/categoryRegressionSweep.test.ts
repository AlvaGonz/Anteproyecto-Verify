import { describe, it, expect } from "vitest";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "bin",
  "obj",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".nx",
  ".pnpm-store",
  "playwright-report",
  "test-results",
  "testapp",
  "scratch",
  "RegexTest",
  "evals",
  "Bots",
  ".venv",
  "venv",
  ".opencode",
  ".vscode",
  ".idea",
  "generated-images",
  "OcrViewer",
]);

const TEXT_EXTENSIONS = new Set([
  "cs", "ts", "tsx", "js", "jsx", "sql", "md", "yml", "yaml", "json",
  "html", "css", "sh", "ps1", "py", "txt", "config", "props", "csproj",
  "sln", "editorconfig", "dockerfile", "graphql", "mjs", "cjs", "xml",
]);

const SKIP_FILES = (file: string) =>
  file.endsWith(".Designer.cs") ||
  file.endsWith("\\Build-Database-Sql.sql") ||
  file.endsWith("/Build-Database-Sql.sql") ||
  file.endsWith("\\14_Proyectos_Realistas.sql") ||
  file.endsWith("/14_Proyectos_Realistas.sql") ||
  file.endsWith("\\categoryRegressionSweep.test.ts") ||
  file.endsWith("/categoryRegressionSweep.test.ts") ||
  file.endsWith("\\impact-map-categoria-proyecto-cutover.md") ||
  file.endsWith("/impact-map-categoria-proyecto-cutover.md") ||
  file.endsWith("\\progress.md") ||
  file.endsWith("/progress.md");

interface Match {
  file: string;
  line: number;
  column: number;
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIRS.has(entry)) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function findMatches(pattern: RegExp): Match[] {
  const hits: Match[] = [];
  for (const file of walk(repoRoot)) {
    if (SKIP_FILES(file)) continue;
    const ext = file.split(".").pop()?.toLowerCase() ?? "";
    if (!TEXT_EXTENSIONS.has(ext) && !/\.(gitignore|dockerignore|npmrc|nvmrc|prettierrc|eslintrc)$/.test(file)) continue;
    let content: string;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    pattern.lastIndex = 0;
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const match = pattern.exec(lines[i]);
      if (match) {
        hits.push({ file, line: i + 1, column: (match.index ?? 0) + 1 });
      }
    }
  }
  return hits;
}

const formatHits = (hits: Match[]) =>
  hits.map((h) => `${h.file}:${h.line}:${h.column}`).join("\n");

describe("regression: no hardcoded project categories", () => {
  it("does not reference the ProjectCategory token anywhere", () => {
    const hits = findMatches(/\bProjectCategory\b/);
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it("does not send the legacy 'categoria:' payload field", () => {
    const hits = findMatches(/\bcategoria:\s*\d/);
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it("does not use legacy category display names as values", () => {
    const hits = findMatches(/categoriaNombre\s*:\s*["'](?:Residencial|Comercial|Turistico|Mixto|Otro)["']/i);
    expect(hits, formatHits(hits)).toEqual([]);
  });
});
