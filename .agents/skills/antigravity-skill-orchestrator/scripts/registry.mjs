#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────
// DynamicSkillRegistry — Transforms scanner output into Tool Calling schema
//
// Reads the JSON output from scanner.mjs (via stdin or --file) and produces
// a structured Tool Calling manifest with constrained enum values.
//
// Usage:
//   node scanner.mjs --pretty | node registry.mjs
//   node registry.mjs --file scan-results.json
//   node registry.mjs --inline  (runs scanner.mjs internally)
//
// No external dependencies. Node.js >= 18 required.
// ─────────────────────────────────────────────────────────────────────

import { readFile } from "node:fs/promises";
import { argv, stdin, stdout, stderr } from "node:process";
import { execFile } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── CLI Argument Parsing ──────────────────────────────────────────────

function parseArgs() {
  const args = argv.slice(2);
  const opts = { filePath: null, inline: false, localPath: null, globalPath: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && args[i + 1]) {
      opts.filePath = args[++i];
    } else if (args[i] === "--inline") {
      opts.inline = true;
    } else if (args[i] === "--local" && args[i + 1]) {
      opts.localPath = args[++i];
    } else if (args[i] === "--global" && args[i + 1]) {
      opts.globalPath = args[++i];
    }
  }

  return opts;
}

// ── Input Sources ─────────────────────────────────────────────────────

/**
 * Reads skill scan data from the appropriate source.
 */
async function readSkillData(opts) {
  if (opts.filePath) {
    const raw = await readFile(opts.filePath, "utf-8");
    return JSON.parse(raw);
  }

  if (opts.inline) {
    return await runScannerInline(opts);
  }

  // Default: read from stdin
  return await readFromStdin();
}

/**
 * Runs scanner.mjs as a subprocess and captures its output.
 */
async function runScannerInline(opts) {
  const scannerPath = join(__dirname, "scanner.mjs");
  const args = [];

  if (opts.localPath) {
    args.push("--local", opts.localPath);
  }
  if (opts.globalPath) {
    args.push("--global", opts.globalPath);
  }

  const { stdout: scanOutput } = await execFileAsync("node", [scannerPath, ...args], {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024, // 10MB for large registries
  });

  return JSON.parse(scanOutput.trim());
}

/**
 * Reads all data from stdin.
 */
function readFromStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    stdin.setEncoding("utf-8");
    stdin.on("data", (chunk) => {
      data += chunk;
    });
    stdin.on("end", () => {
      try {
        resolve(JSON.parse(data.trim()));
      } catch (err) {
        reject(new Error(`Invalid JSON from stdin: ${err.message}`));
      }
    });
    stdin.on("error", reject);
  });
}

// ── Registry Builder ──────────────────────────────────────────────────

/**
 * Builds a Tool Calling schema from the scanned skill data.
 *
 * The schema follows the OpenAI/Anthropic function calling format:
 * - A single `invoke_skill` tool with a constrained `skill_name` enum
 * - A parallel `skill_descriptions` lookup for the LLM to reason over
 *
 * @param {Array} skills - Array of skill metadata from scanner
 * @returns {object} Tool Calling manifest
 */
function buildRegistry(skills) {
  const skillNames = [];
  const skillDescriptions = {};
  const skillSources = {};

  for (const skill of skills) {
    if (!skill.name || !skill.description) continue;

    skillNames.push(skill.name);
    skillDescriptions[skill.name] = truncateDescription(skill.description, 200);
    skillSources[skill.name] = skill.source || "unknown";
  }

  // Sort alphabetically for stable output
  skillNames.sort();

  return {
    tool_schema: {
      name: "invoke_skill",
      description:
        "Select the most appropriate skill to handle the current task. " +
        "Only invoke a skill if the task is complex enough to warrant it. " +
        "For simple tasks, respond directly without invoking any skill.",
      parameters: {
        type: "object",
        properties: {
          skill_name: {
            type: "string",
            enum: skillNames,
            description:
              "The name of the skill to invoke. Must be one of the available skills.",
          },
          reason: {
            type: "string",
            description:
              "A brief explanation of why this skill is the best match for the current task.",
          },
        },
        required: ["skill_name", "reason"],
      },
    },
    skill_descriptions: skillDescriptions,
    skill_sources: skillSources,
    metadata: {
      total_skills: skillNames.length,
      local_count: skills.filter((s) => s.source === "local").length,
      global_count: skills.filter((s) => s.source === "global").length,
      generated_at: new Date().toISOString(),
    },
  };
}

/**
 * Truncates a description to a max character length at word boundaries.
 */
function truncateDescription(desc, maxLength) {
  if (desc.length <= maxLength) return desc;
  const truncated = desc.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

// ── Logging ───────────────────────────────────────────────────────────

function log(msg) {
  stderr.write(`[registry] ${msg}\n`);
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  log("Building dynamic skill registry...");

  const skills = await readSkillData(opts);
  log(`Received ${skills.length} skills from scanner`);

  const registry = buildRegistry(skills);

  log(
    `Registry built: ${registry.metadata.total_skills} skills ` +
      `(${registry.metadata.local_count} local, ${registry.metadata.global_count} global)`
  );

  stdout.write(JSON.stringify(registry, null, 2) + "\n");
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
