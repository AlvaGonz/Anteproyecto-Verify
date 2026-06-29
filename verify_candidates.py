import subprocess
import json
import os

exe = r"C:\Users\Admin\AppData\Local\Programs\codebase-memory-mcp\codebase-memory-mcp.exe"

candidates = [
    ["blockNonDigits","src/frontend/web/src/features/auth/components/RegisterForm.tsx"],
    ["closeModal","src/frontend/web/src/features/auth/components/RegisterForm.tsx"],
    ["acceptAndCloseModal","src/frontend/web/src/features/auth/components/RegisterForm.tsx"],
    ["removeFile","src/frontend/web/src/features/documents/components/DocumentUploadForm.tsx"],
    ["setValueAs","src/frontend/web/src/features/documents/components/UploadDocumentForm.tsx"],
    ["removePortrait","src/frontend/web/src/features/projects/components/ProjectForm.tsx"],
    ["autoScroll","src/frontend/web/src/features/public/components/FeaturedProjectsSection.tsx"],
    ["initScroll","src/frontend/web/src/features/public/components/FeaturedProjectsSection.tsx"],
    ["togglePasswordSection","src/frontend/web/src/features/settings/components/MyProfileForm.tsx"],
    ["toggle","src/frontend/web/src/features/settings/components/MyProfileForm.tsx"],
    ["startValidation","src/frontend/web/src/features/validations/pages/ValidationExecutionPage.tsx"],
    ["list","src/frontend/web/src/infrastructure/api/projects.api.ts"],
    ["getById","src/frontend/web/src/infrastructure/api/projects.api.ts"],
    ["loadData","src/frontend/web/src/pages/admin/SettingsPage.tsx"],
    ["confirmDelete","src/frontend/web/src/pages/admin/SettingsPage.tsx"],
    ["ProfessionalLayout","src/frontend/web/src/pages/projects/ProjectDocumentUploadPage.test.tsx"],
    ["stripNonDigits","src/frontend/web/src/schemas/registerSchema.ts"],
    ["changeLanguage","src/frontend/web/src/setupTests.ts"],
    ["handler","src/frontend/web/src/shared/components/layout/LandingNav.tsx"],
    ["handler","src/frontend/web/src/shared/context/AuthContext.tsx"]
]

results = []

def count_occurrences(word, root_dir):
    count = 0
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if not f.endswith(('.ts', '.tsx', '.js', '.jsx')):
                continue
            path = os.path.join(dirpath, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                count += content.count(word)
    return count

for name, path in candidates:
    query_obj = {
        "project": "C-Users-Admin-Desktop-Anteproyecto-Verify",
        "function_name": name,
        "direction": "inbound"
    }
    try:
        res = subprocess.run(
            [exe, "cli", "trace_path", json.dumps(query_obj)],
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            data = json.loads(res.stdout)
            callers = data.get("callers", [])
            if len(callers) == 0:
                occurrences = count_occurrences(name, "src/frontend/web/src")
                results.append({"name": name, "path": path, "occurrences": occurrences})
            else:
                pass
    except Exception as e:
        print(f"Error checking {name}: {e}")

print(json.dumps(results, indent=2))
