const { execFileSync } = require('child_process');

function runMcp(command, argObj) {
  try {
    const result = execFileSync('codebase-memory-mcp', ['cli', command, JSON.stringify(argObj)], { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 });
    console.log(`--- ${command} ---`);
    console.log(result);
  } catch (e) {
    console.error(`--- ERROR in ${command} ---`);
    console.error(e.stderr || e.message);
  }
}

const repoPath = 'c:/Users/Alva/Desktop/Anteproyecto-Verify';

runMcp('index_repository', { repo_path: repoPath });
runMcp('search_code', { project: 'Anteproyecto-Verify', query: 'redirect_after_verification' });
runMcp('search_code', { project: 'Anteproyecto-Verify', query: 'auth/verify' });
runMcp('search_code', { project: 'Anteproyecto-Verify', query: 'resend' });
runMcp('search_graph', { project: 'Anteproyecto-Verify', name_pattern: '(RegisterForm|EmailVerifiedPage|AuthController|useRegister)', limit: 20 });
