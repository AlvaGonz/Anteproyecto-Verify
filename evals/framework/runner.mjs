// evals/framework/runner.mjs
// Waza eval runner wrapper — discovers and executes eval suites
// Usage: node runner.mjs [--all] [--agent=<name>] [--pattern=<glob>] [--coverage] [--list]

import { spawnSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');
const WAZA_BIN = join(__dirname, 'waza.exe');

function runWaza(args) {
  if (!existsSync(WAZA_BIN)) {
    console.error('❌ waza.exe not found in evals/framework/');
    console.error('   Run: node runner.mjs --install');
    process.exit(1);
  }

  const result = spawnSync(WAZA_BIN, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: true,
  });

  return result.status;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = { all: false, coverage: false, list: false, discover: false, install: false, agent: null, pattern: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--all':
      case '--discover':
        flags.discover = true;
        break;
      case '--coverage':
        flags.coverage = true;
        break;
      case '--list':
        flags.list = true;
        break;
      case '--install':
        flags.install = true;
        break;
      case '--agent':
        flags.agent = args[++i];
        break;
      case '--pattern':
        flags.pattern = args[++i];
        break;
      default:
        if (args[i].startsWith('--agent=')) flags.agent = args[i].split('=')[1];
        else if (args[i].startsWith('--pattern=')) flags.pattern = args[i].split('=')[1];
    }
  }

  return flags;
}

function main() {
  const flags = parseArgs();
  const wazaArgs = [];

  if (flags.list) {
    console.log('\n📋 Available eval suites:');
    const evalsDir = join(PROJECT_ROOT, 'evals');
    const entries = readdirSync(evalsDir, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'framework' && entry.name !== 'schemas' && entry.name !== 'results') {
        const evalYaml = join(evalsDir, entry.name, 'eval.yaml');
        if (existsSync(evalYaml)) {
          const tasksDir = join(evalsDir, entry.name, 'tasks');
          let taskCount = 0;
          if (existsSync(tasksDir)) {
            taskCount = readdirSync(tasksDir).filter(f => f.endsWith('.yaml')).length;
          }
          console.log(`   ${entry.name.padEnd(35)} ${taskCount} tasks`);
          count++;
        }
      }
    }
    console.log(`\n   Total: ${count} eval suites\n`);
    process.exit(0);
  }

  if (flags.coverage) {
    console.log('\n📊 Generating coverage report...\n');
    wazaArgs.push('coverage', '--format', 'markdown');
  } else if (flags.discover) {
    console.log('\n🔍 Running all eval suites (discover mode)...\n');
    wazaArgs.push('run', '--discover', '--verbose');
  } else {
    // Default: targeted run
    console.log('\n🧪 Running targeted eval suite...\n');
    wazaArgs.push('run', '--verbose');

    if (flags.agent) {
      // Map agent name to eval directory pattern:
      // --agent=core/openagent → evals/openagent/
      // --agent=core/opencoder → evals/opencoder/
      const parts = flags.agent.split('/');
      const agentName = parts[parts.length - 1];
      wazaArgs.push('--filter', agentName);
    }

    if (flags.pattern) {
      wazaArgs.push('--pattern', flags.pattern);
    }
  }

  console.log(`> waza ${wazaArgs.join(' ')}\n`);
  const exitCode = runWaza(wazaArgs);

  if (exitCode === 0) {
    console.log('\n✅ All checks passed\n');
  } else {
    console.log(`\n⚠️  waza exited with code ${exitCode}\n`);
  }

  process.exit(exitCode);
}

main();