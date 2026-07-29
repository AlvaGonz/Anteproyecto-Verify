const fs = require('fs');
const path = require('path');

function countTokensInFile(filePath) {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, 'utf-8');
    return Math.ceil(content.length / 4);
}

function countTokensInDirectory(dirPath) {
    let totalTokens = 0;
    if (!fs.existsSync(dirPath)) return totalTokens;

    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && fullPath.endsWith('.md')) {
            const tokens = countTokensInFile(fullPath);
            console.log(`- ${item}: ~${tokens} tokens`);
            totalTokens += tokens;
        }
    }
    return totalTokens;
}

const workspaceRoot = path.join(__dirname, '..', '..');

console.log('=== Token Optimization Report ===\n');

// 1. Rules
console.log('--- Rules Budget (Target: <= 10,000) ---');
const agentsMdTokens = countTokensInFile(path.join(workspaceRoot, 'AGENTS.md'));
console.log(`- AGENTS.md: ~${agentsMdTokens} tokens`);

const rulesDirTokens = countTokensInDirectory(path.join(workspaceRoot, '.agents', 'rules'));
const totalRulesTokens = agentsMdTokens + rulesDirTokens;
console.log(`=> Total Rules Tokens: ~${totalRulesTokens}\n`);

// 2. Skills
console.log('--- Skills Budget (Target: <= 5,000) ---');
const skillsDir = path.join(workspaceRoot, '.agents', 'skills');
let totalSkillsTokens = 0;

if (fs.existsSync(skillsDir)) {
    const skillDirs = fs.readdirSync(skillsDir);
    for (const s of skillDirs) {
        const fullPath = path.join(skillsDir, s);
        if (fs.statSync(fullPath).isDirectory() && s !== 'archive') {
            const skillFile = path.join(fullPath, 'SKILL.md');
            const tokens = countTokensInFile(skillFile);
            if (tokens > 0) {
                totalSkillsTokens += tokens;
            }
        }
    }
    // Also count SKILL_SELECTION.md
    totalSkillsTokens += countTokensInFile(path.join(skillsDir, 'SKILL_SELECTION.md'));
}
console.log(`=> Total Active Skills Tokens: ~${totalSkillsTokens}\n`);

// 3. Workflows
console.log('--- Workflows Budget (Target: <= 2,000) ---');
let totalWorkflowsTokens = countTokensInDirectory(path.join(workspaceRoot, '.agents', 'workflows'));
console.log(`=> Total Active Workflows Tokens: ~${totalWorkflowsTokens}\n`);

console.log('=================================');
