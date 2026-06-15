#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────
// SkillScanner — Dynamic skill discovery for antigravity-skill-orchestrator
//
// Scans two directory sources for SKILL.md files, extracts YAML frontmatter
// metadata (name, description, category, tags), and outputs a deduplicated
// JSON manifest to stdout.
//
// Usage:
//   node scanner.mjs [--local <path>] [--global <path>] [--pretty]
//
// Sources:
//   Local:  <workspace>/.agents/skills/  (highest priority)
//   Global: <USERPROFILE>/.gemini/config/skills/
//
// No external dependencies. Node.js >= 18 required.
// ─────────────────────────────────────────────────────────────────────

import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, basename } from "node:path";
import { argv, env, cwd, stdout, stderr } from "node:process";

// ── CLI Argument Parsing ──────────────────────────────────────────────

function parseArgs() {
  const args = argv.slice(2);
  const opts = { pretty: false, localPath: null, globalPath: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--pretty") {
      opts.pretty = true;
    } else if (args[i] === "--local" && args[i + 1]) {
      opts.localPath = args[++i];
    } else if (args[i] === "--global" && args[i + 1]) {
      opts.globalPath = args[++i];
    }
  }

  return opts;
}

// ── Path Resolution ───────────────────────────────────────────────────

/**
 * Resolves the local workspace skills directory.
 * Priority: CLI arg > cwd()/.agents/skills > known workspace fallback
 */
function resolveLocalSkillsDir(cliPath) {
  if (cliPath) return resolve(cliPath);

  const cwdAgents = join(cwd(), ".agents", "skills");
  const fallback = join(
    env.USERPROFILE || env.HOME || "",
    "Desktop",
    "Anteproyecto-Verify",
    ".agents",
    "skills"
  );

  return cwdAgents || fallback;
}

/**
 * Resolves the global Antigravity IDE skills directory.
 */
function resolveGlobalSkillsDir(cliPath) {
  if (cliPath) return resolve(cliPath);

  return join(
    env.USERPROFILE || env.HOME || "",
    ".gemini",
    "config",
    "skills"
  );
}

// ── YAML Frontmatter Parser ───────────────────────────────────────────

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Parses YAML frontmatter from a SKILL.md string.
 * Only extracts: name, description, category, tags, license, metadata.
 * Does NOT use a YAML library — handles the simple key: value format
 * found in skill frontmatter blocks.
 *
 * @param {string} content - Raw file content (only first ~1KB needed)
 * @returns {object|null} Parsed metadata or null if no frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) return null;

  const block = match[1];
  const result = {};

  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Only extract fields we care about
    if (["name", "description", "category", "tags", "license"].includes(key)) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// ── Directory Scanner ─────────────────────────────────────────────────

/**
 * Checks if a path exists and is a directory.
 */
async function isDirectory(dirPath) {
  try {
    const s = await stat(dirPath);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Scans a skills directory and extracts metadata from each skill's SKILL.md.
 *
 * @param {string} skillsDir - Absolute path to a skills directory
 * @param {string} source - Source label ("local" or "global")
 * @returns {Promise<Array>} Array of skill metadata objects
 */
async function scanDirectory(skillsDir, source) {
  const skills = [];

  if (!(await isDirectory(skillsDir))) {
    log(`WARN: Directory does not exist or is not accessible: ${skillsDir}`);
    return skills;
  }

  let entries;
  try {
    entries = await readdir(skillsDir, { withFileTypes: true });
  } catch (err) {
    log(`ERROR: Failed to read directory ${skillsDir}: ${err.message}`);
    return skills;
  }

  const dirs = entries.filter((e) => e.isDirectory());

  // Process in parallel with individual error handling
  const results = await Promise.allSettled(
    dirs.map(async (entry) => {
      const skillDir = join(skillsDir, entry.name);
      const skillMdPath = join(skillDir, "SKILL.md");

      try {
        // Read only the first 2KB — frontmatter is always at the top
        const fd = await readFile(skillMdPath, { encoding: "utf-8" });
        const head = fd.slice(0, 2048);

        const meta = parseFrontmatter(head);
        if (!meta) {
          return null; // No frontmatter — skip silently
        }

        return {
          name: meta.name || entry.name,
          description: meta.description || "",
          category: meta.category || null,
          tags: meta.tags || null,
          source,
          path: skillMdPath,
          dirName: entry.name,
        };
      } catch (err) {
        if (err.code === "ENOENT") {
          // No SKILL.md — not a valid skill directory, skip silently
          return null;
        }
        log(
          `WARN: Failed to read ${skillMdPath}: ${err.code || err.message}`
        );
        return null;
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value !== null) {
      skills.push(result.value);
    }
  }

  return skills;
}

// ── Deduplication ─────────────────────────────────────────────────────

/**
 * Merges local and global skill lists.
 * Local skills take priority over global skills with the same name.
 *
 * @param {Array} localSkills
 * @param {Array} globalSkills
 * @returns {Array} Deduplicated skill list
 */
function deduplicateSkills(localSkills, globalSkills) {
  const registry = new Map();

  // Global first (lower priority)
  for (const skill of globalSkills) {
    registry.set(skill.name, skill);
  }

  // Local overwrites global (higher priority)
  for (const skill of localSkills) {
    registry.set(skill.name, skill);
  }

  return Array.from(registry.values());
}

// ── Logging ───────────────────────────────────────────────────────────

function log(msg) {
  stderr.write(`[scanner] ${msg}\n`);
}

// ── MCP Discovery ─────────────────────────────────────────────────────

/**
 * Scans MCP configuration files and extracts active server metadata.
 */
async function scanMCPConfigs(paths, source) {
  const mcpServers = [];
  for (const p of paths) {
    try {
      let raw;
      try {
        raw = await readFile(p, "utf-8");
      } catch (err) {
        if (err.code === "ENOENT") continue;
        throw err;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.mcpServers && typeof parsed.mcpServers === "object") {
        for (const serverName of Object.keys(parsed.mcpServers)) {
          mcpServers.push({
            name: `mcp-${serverName}`,
            type: "mcp_server",
            source,
            path: p
          });
        }
      }
    } catch (err) {
      log(`WARN: Failed to parse MCP config at ${p}: ${err.message}`);
    }
  }
  return mcpServers;
}

function deduplicateMCPServers(mcpServers) {
  const registry = new Map();
  const globalMcp = mcpServers.filter(s => s.source === "global");
  const localMcp = mcpServers.filter(s => s.source === "local");

  for (const s of globalMcp) {
    registry.set(s.name, s);
  }
  for (const s of localMcp) {
    registry.set(s.name, s);
  }
  return Array.from(registry.values());
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  const localDir = resolveLocalSkillsDir(opts.localPath);
  const globalDir = resolveGlobalSkillsDir(opts.globalPath);

  log(`Scanning local skills: ${localDir}`);
  log(`Scanning global skills: ${globalDir}`);

  const [localSkills, globalSkills] = await Promise.all([
    scanDirectory(localDir, "local"),
    scanDirectory(globalDir, "global"),
  ]);

  log(`Found ${localSkills.length} local skills`);
  log(`Found ${globalSkills.length} global skills`);

  const mergedSkills = deduplicateSkills(localSkills, globalSkills);
  log(`Total unique skills after deduplication: ${mergedSkills.length}`);

  // Build local MCP config targets
  const localMcpPaths = [
    join(cwd(), ".cursor", "mcp.json"),
    join(cwd(), ".antigravity", "mcp.json"),
  ];
  if (opts.localPath) {
    localMcpPaths.push(
      join(opts.localPath, "mcp.json"),
      join(opts.localPath, ".cursor", "mcp.json"),
      join(opts.localPath, ".antigravity", "mcp.json")
    );
  }

  // Build global MCP config targets
  const userHome = env.USERPROFILE || env.HOME || "";
  const globalMcpPaths = [
    join(userHome, ".cursor", "mcp.json"),
    join(userHome, ".antigravity", "mcp.json"),
    join(userHome, ".gemini", "mcp.json"),
  ];
  if (opts.globalPath) {
    globalMcpPaths.push(
      join(opts.globalPath, "mcp.json"),
      join(opts.globalPath, ".cursor", "mcp.json"),
      join(opts.globalPath, ".antigravity", "mcp.json"),
      join(opts.globalPath, ".gemini", "mcp.json")
    );
  }

  log(`Scanning MCP configs...`);
  const [localMcpServers, globalMcpServers] = await Promise.all([
    scanMCPConfigs(localMcpPaths, "local"),
    scanMCPConfigs(globalMcpPaths, "global"),
  ]);

  const rawMcpServers = [...localMcpServers, ...globalMcpServers];
  const deduppedMcpServers = deduplicateMCPServers(rawMcpServers);
  log(`Found ${deduppedMcpServers.length} active MCP servers`);

  // Combine both standard skills and discovered MCP servers
  const merged = [...mergedSkills, ...deduppedMcpServers];

  const output = opts.pretty
    ? JSON.stringify(merged, null, 2)
    : JSON.stringify(merged);

  stdout.write(output + "\n");
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});


