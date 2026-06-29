const { execSync } = require('child_process');

const queryObj = {
  project: "C-Users-Admin-Desktop-Anteproyecto-Verify",
  query: "MATCH (f:Function) WHERE NOT EXISTS { (f)<-[:CALLS]-() } AND f.is_entry_point = false AND NOT f.name =~ '^use[A-Z].*' AND NOT f.name =~ '^handle[A-Z].*' AND NOT f.name =~ '^on[A-Z].*' RETURN f.name, f.file, f.in_degree ORDER BY f.file LIMIT 100"
};

try {
  const exePath = "C:\\Users\\Admin\\AppData\\Local\\Programs\\codebase-memory-mcp\\codebase-memory-mcp.exe";
  const cmd = `"${exePath}" cli query_graph ${JSON.stringify(JSON.stringify(queryObj))}`;
  const result = execSync(cmd);
  console.log(result.toString());
} catch (e) {
  console.error("STDOUT:", e.stdout?.toString());
  console.error("STDERR:", e.stderr?.toString());
}
