$exe = "C:\Users\Admin\AppData\Local\Programs\codebase-memory-mcp\codebase-memory-mcp.exe"
$query = @{
    project = "C-Users-Admin-Desktop-Anteproyecto-Verify"
    query = "MATCH (f:Function) WHERE NOT EXISTS { (f)<-[:CALLS]-() } AND f.is_entry_point = false AND NOT f.name =~ '^use[A-Z].*' AND NOT f.name =~ '^handle[A-Z].*' AND NOT f.name =~ '^on[A-Z].*' RETURN f.name, f.file, f.in_degree ORDER BY f.file LIMIT 100"
}
$json = $query | ConvertTo-Json -Depth 10 -Compress
$json = $json -replace '\"', '\""'
cmd /c "$exe cli query_graph `"$json`""
