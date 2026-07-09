import subprocess
import json

exe = r"C:\Users\Alva\AppData\Local\Programs\codebase-memory-mcp\codebase-memory-mcp.exe"
query_obj = {
    "project": "C-Users-Admin-Desktop-Anteproyecto-Verify",
    "query": """MATCH (f:Function)
                WHERE NOT EXISTS { (f)<-[:CALLS]-() }
                  AND f.is_entry_point = false
                  AND NOT f.name =~ '^use[A-Z].*'
                  AND NOT f.name =~ '^handle[A-Z].*'
                  AND NOT f.name =~ '^on[A-Z].*'
                  AND NOT f.name IN ['mutationFn', 'queryFn', 'errorMap', 't', 'div', 'section', 'h1', 'p', 'button', 'observerCallback', 'AnimatePresence', 'ProjectForm', 'ToastProvider']
                RETURN f.name, f.file_path, f.in_degree
                ORDER BY f.file_path
                LIMIT 100"""
}

try:
    result = subprocess.run(
        [exe, "cli", "query_graph", json.dumps(query_obj)],
        capture_output=True,
        text=True,
        check=True
    )
    print("STDOUT:", result.stdout)
except subprocess.CalledProcessError as e:
    print("FAILED with exit code:", e.returncode)
