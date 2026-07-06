#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────
// Test: SkillScanner & DynamicSkillRegistry verification
//
// 1. Creates a temp dummy skill with valid SKILL.md frontmatter
// 2. Runs the scanner against the temp directory
// 3. Asserts the dummy skill is discovered with correct metadata
// 4. Runs the scanner against the real local .agents/skills directory
// 5. Validates known skills like test-driven-development are found
// 6. Runs the full registry pipeline and validates schema
// 7. Cleans up temp directories
//
// Exit 0 = all pass, Exit 1 = failure
// No external dependencies. Node.js >= 18 required.
// ─────────────────────────────────────────────────────────────────────

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCANNER_PATH = join(__dirname, "scanner.mjs");
const REGISTRY_PATH = join(__dirname, "registry.mjs");

let tempDir = null;
let passed = 0;
let failed = 0;

// ── Assertions ────────────────────────────────────────────────────────

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// ── Temp Dummy Skill Setup ────────────────────────────────────────────

async function createDummySkillDir() {
  tempDir = join(tmpdir(), `skill-scanner-test-${Date.now()}`);
  const dummySkillDir = join(tempDir, "dummy-test-skill");

  await mkdir(dummySkillDir, { recursive: true });

  const skillContent = `---
name: dummy-test-skill
description: A temporary skill created for scanner verification testing
category: testing
tags: "[test, dummy, verification]"
---

# Dummy Test Skill

This is a dummy skill used exclusively for automated testing.
It should be discovered by the scanner and then deleted.
`;

  await writeFile(join(dummySkillDir, "SKILL.md"), skillContent, "utf-8");

  // Also create a skill WITHOUT frontmatter to test graceful skip
  const noFrontmatterDir = join(tempDir, "no-frontmatter-skill");
  await mkdir(noFrontmatterDir, { recursive: true });
  await writeFile(
    join(noFrontmatterDir, "SKILL.md"),
    "# Just a heading\n\nNo frontmatter here.\n",
    "utf-8"
  );

  // Also create a directory WITHOUT SKILL.md to test graceful skip
  const emptyDir = join(tempDir, "empty-skill-dir");
  await mkdir(emptyDir, { recursive: true });

  return tempDir;
}

// ── Cleanup ───────────────────────────────────────────────────────────

async function cleanup() {
  if (tempDir) {
    try {
      await rm(tempDir, { recursive: true, force: true });
      console.log(`\n🧹 Cleaned up temp directory: ${tempDir}`);
    } catch (err) {
      console.warn(`⚠️  Failed to clean up ${tempDir}: ${err.message}`);
    }
  }
}

// ── Test 1: Dummy Skill Discovery ─────────────────────────────────────

async function testDummySkillDiscovery() {
  console.log("\n── Test 1: Dummy Skill Discovery ──");

  const { stdout } = await execFileAsync(
    "node",
    [SCANNER_PATH, "--local", tempDir, "--global", tempDir],
    { encoding: "utf-8" }
  );

  const skills = JSON.parse(stdout.trim());

  assert(Array.isArray(skills), "Scanner output is a JSON array");
  assert(skills.length >= 1, `Found at least 1 skill (found ${skills.length})`);

  const dummy = skills.find((s) => s.name === "dummy-test-skill");
  assert(dummy !== undefined, "Dummy skill 'dummy-test-skill' was discovered");
  assert(
    dummy?.description?.includes("temporary skill"),
    "Dummy skill has correct description"
  );
  assert(dummy?.source === "local", "Dummy skill marked as 'local' source");
  assert(dummy?.category === "testing", "Dummy skill has correct category");

  // Verify the no-frontmatter skill was NOT included
  const noFm = skills.find((s) => s.dirName === "no-frontmatter-skill");
  assert(noFm === undefined, "Skill without frontmatter was correctly skipped");

  // Verify the empty directory was NOT included
  const empty = skills.find((s) => s.dirName === "empty-skill-dir");
  assert(empty === undefined, "Empty directory was correctly skipped");
}

// ── Test 2: Real Local Directory Scan ─────────────────────────────────

async function testRealLocalScan() {
  console.log("\n── Test 2: Real Local Directory Scan ──");

  const localDir = join(
    process.env.USERPROFILE || process.env.HOME || "",
    "Desktop",
    "Anteproyecto-Verify",
    ".agents",
    "skills"
  );

  const { stdout } = await execFileAsync(
    "node",
    [SCANNER_PATH, "--local", localDir, "--global", localDir],
    { encoding: "utf-8" }
  );

  const skills = JSON.parse(stdout.trim());

  assert(Array.isArray(skills), "Scanner output is a JSON array");
  assert(skills.length > 5, `Found more than 5 local skills (found ${skills.length})`);

  const tdd = skills.find((s) => s.name === "test-driven-development");
  assert(tdd !== undefined, "Known skill 'test-driven-development' was found");

  const dotnet = skills.find((s) => s.name === "dotnet-best-practices");
  assert(dotnet !== undefined, "Known skill 'dotnet-best-practices' was found");
}

// ── Test 3: Registry Schema Validation ────────────────────────────────

async function testRegistrySchema() {
  console.log("\n── Test 3: Registry Schema Validation ──");

  const { stdout } = await execFileAsync(
    "node",
    [REGISTRY_PATH, "--inline", "--local", tempDir, "--global", tempDir],
    { encoding: "utf-8" }
  );

  const registry = JSON.parse(stdout.trim());

  assert(registry.tool_schema !== undefined, "Registry has tool_schema");
  assert(
    registry.tool_schema.name === "invoke_skill",
    "Tool schema name is 'invoke_skill'"
  );
  assert(
    registry.tool_schema.parameters?.properties?.skill_name?.type === "string",
    "skill_name parameter is type string"
  );
  assert(
    Array.isArray(registry.tool_schema.parameters?.properties?.skill_name?.enum),
    "skill_name has enum array"
  );

  const enumValues = registry.tool_schema.parameters.properties.skill_name.enum;
  assert(
    enumValues.includes("dummy-test-skill"),
    "Enum includes 'dummy-test-skill'"
  );

  assert(
    registry.skill_descriptions !== undefined,
    "Registry has skill_descriptions map"
  );
  assert(
    registry.skill_descriptions["dummy-test-skill"]?.includes("temporary"),
    "Descriptions map contains correct dummy description"
  );

  assert(registry.metadata !== undefined, "Registry has metadata");
  assert(
    typeof registry.metadata.total_skills === "number",
    "Metadata includes total_skills count"
  );
  assert(
    registry.metadata.generated_at !== undefined,
    "Metadata includes generated_at timestamp"
  );
}

// ── Test 4: Deduplication (local overrides global) ────────────────────

async function testDeduplication() {
  console.log("\n── Test 4: Deduplication (local overrides global) ──");

  // Create a second temp dir simulating "global" with a conflicting skill name
  const globalTempDir = join(tmpdir(), `skill-scanner-global-test-${Date.now()}`);
  const conflictDir = join(globalTempDir, "dummy-test-skill");
  await mkdir(conflictDir, { recursive: true });

  await writeFile(
    join(conflictDir, "SKILL.md"),
    `---
name: dummy-test-skill
description: GLOBAL version of dummy — this should be overridden
category: global-testing
---

# Global Dummy
`,
    "utf-8"
  );

  try {
    const { stdout } = await execFileAsync(
      "node",
      [SCANNER_PATH, "--local", tempDir, "--global", globalTempDir],
      { encoding: "utf-8" }
    );

    const skills = JSON.parse(stdout.trim());
    const dummy = skills.find((s) => s.name === "dummy-test-skill");

    assert(dummy !== undefined, "Dummy skill found after deduplication");
    assert(
      dummy?.source === "local",
      "Local version takes priority over global"
    );
    assert(
      dummy?.description?.includes("temporary skill"),
      "Description comes from local version, not global"
    );

  // Count: should have exactly 1 dummy-test-skill
    const dummyCount = skills.filter(
      (s) => s.name === "dummy-test-skill"
    ).length;
    assert(dummyCount === 1, `Exactly 1 'dummy-test-skill' after dedup (got ${dummyCount})`);
  } finally {
    await rm(globalTempDir, { recursive: true, force: true });
  }
}

// ── Test 5: Dynamic MCP Discovery & Schema Integration ──

async function testMCPDiscovery() {
  console.log("\n── Test 5: Dynamic MCP Discovery & Schema Integration ──");

  // Create global gemini folder and dummy mcp.json
  const globalGeminiDir = join(tempDir, ".gemini");
  await mkdir(globalGeminiDir, { recursive: true });

  const mcpGlobalContent = {
    mcpServers: {
      "postgres-dev": {
        command: "npx",
        args: ["postgres-mcp-server"]
      },
      "conflict-server": {
        command: "node",
        args: ["global-version"]
      }
    }
  };

  await writeFile(
    join(globalGeminiDir, "mcp.json"),
    JSON.stringify(mcpGlobalContent),
    "utf-8"
  );

  // Create local .cursor folder and dummy mcp.json (for deduplication / local overrides global test)
  const localCursorDir = join(tempDir, ".cursor");
  await mkdir(localCursorDir, { recursive: true });

  const mcpLocalContent = {
    mcpServers: {
      "sqlite-dev": {
        command: "npx",
        args: ["sqlite-mcp-server"]
      },
      "conflict-server": {
        command: "node",
        args: ["local-version"]
      }
    }
  };

  await writeFile(
    join(localCursorDir, "mcp.json"),
    JSON.stringify(mcpLocalContent),
    "utf-8"
  );

  // Create a corrupted JSON file to test defensive parsing / crash prevention
  const localAntigravityDir = join(tempDir, ".antigravity");
  await mkdir(localAntigravityDir, { recursive: true });
  await writeFile(
    join(localAntigravityDir, "mcp.json"),
    "{ corrupted JSON",
    "utf-8"
  );

  // Execute Scanner
  const { stdout: scanOut } = await execFileAsync(
    "node",
    [SCANNER_PATH, "--local", tempDir, "--global", tempDir],
    { encoding: "utf-8" }
  );

  const items = JSON.parse(scanOut.trim());
  assert(Array.isArray(items), "Scanner output with MCP is a JSON array");

  const postgresDev = items.find((i) => i.name === "mcp-postgres-dev");
  assert(postgresDev !== undefined, "MCP 'postgres-dev' was discovered");
  assert(postgresDev?.type === "mcp_server", "postgres-dev is marked as mcp_server type");
  assert(postgresDev?.source === "global", "postgres-dev source is global");

  const sqliteDev = items.find((i) => i.name === "mcp-sqlite-dev");
  assert(sqliteDev !== undefined, "MCP 'sqlite-dev' was discovered");
  assert(sqliteDev?.type === "mcp_server", "sqlite-dev is marked as mcp_server type");
  assert(sqliteDev?.source === "local", "sqlite-dev source is local");

  // Conflict server should be deduplicated and overridden by local
  const conflicts = items.filter((i) => i.name === "mcp-conflict-server");
  assert(conflicts.length === 1, "Conflict server is deduplicated to a single entry");
  assert(conflicts[0]?.source === "local", "Conflict server is overridden by local definition");

  // Execute Registry Pipeline inline
  const { stdout: regOut } = await execFileAsync(
    "node",
    [REGISTRY_PATH, "--inline", "--local", tempDir, "--global", tempDir],
    { encoding: "utf-8" }
  );

  const registry = JSON.parse(regOut.trim());

  assert(registry.active_mcp_servers !== undefined, "Registry exposes active_mcp_servers array");
  assert(Array.isArray(registry.active_mcp_servers), "active_mcp_servers is an array");
  
  const pgMcp = registry.active_mcp_servers.find(m => m.name === "mcp-postgres-dev");
  assert(pgMcp !== undefined, "active_mcp_servers contains 'mcp-postgres-dev'");
  assert(pgMcp?.status === "active", "postgres-dev has 'active' status");

  const sqliteMcp = registry.active_mcp_servers.find(m => m.name === "mcp-sqlite-dev");
  assert(sqliteMcp !== undefined, "active_mcp_servers contains 'mcp-sqlite-dev'");

  assert(registry.metadata !== undefined, "Registry contains metadata");
  assert(registry.metadata.mcp_count === 3, `metadata contains correct mcp_count (expected 3, got ${registry.metadata.mcp_count})`);

  // Ensure standard skills in the same payload are not corrupted
  const dummySkill = registry.tool_schema.parameters.properties.skill_name.enum.find(e => e === "dummy-test-skill");
  assert(dummySkill !== undefined, "Standard skill 'dummy-test-skill' is preserved in tool_schema enum");
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  SkillScanner & Registry — Verification Suite");
  console.log("═══════════════════════════════════════════════════");

  try {
    await createDummySkillDir();
    console.log(`📁 Created temp skills at: ${tempDir}`);

    await testDummySkillDiscovery();
    await testRealLocalScan();
    await testRegistrySchema();
    await testDeduplication();
    await testMCPDiscovery();

  } finally {
    await cleanup();
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }
}


main().catch((err) => {
  console.error(`\n💥 FATAL: ${err.message}\n${err.stack}`);
  cleanup().finally(() => process.exit(1));
});
