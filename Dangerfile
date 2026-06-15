# Dangerfile — PR Policy Rules
# Integrado con agent-firewall JSON output

require 'json'

# ── Regla 1: Tamaño del PR ──────────────────────────────────────
warn "PR grande (#{git.lines_of_code} líneas). Considera dividirlo." if git.lines_of_code > 400
fail "PR excesivamente grande (#{git.lines_of_code} líneas). Máximo 800 líneas." if git.lines_of_code > 800

# ── Regla 2: Archivos críticos modificados ──────────────────────
critical_files = ["scripts/post_task_loop.py", ".agents/docs/AGENTS.md", ".env.example"]
critical_modified = git.modified_files.select { |f| critical_files.include?(f) }
if critical_modified.any?
  warn "⚠️ Archivos críticos modificados: #{critical_modified.join(', ')}. Requiere 2 reviewers."
end

# ── Regla 3: Cambios sin tests ───────────────────────────────────
has_source_changes = !git.modified_files.grep(/\.(py|ts|js)$/).empty?
has_test_changes = !git.modified_files.grep(/(test_|\.test\.|\.spec\.)/).empty?
warn "⚠️ Cambios de código sin tests correspondientes detectados." if has_source_changes && !has_test_changes

# ── Regla 4: Leer validation-report.md del CI ────────────────────
if File.exist?(".agents/validation-report.md")
  report = File.read(".agents/validation-report.md")
  fail "🔴 Agent Firewall: FAIL verdict detectado. Ver `.agents/validation-report.md`." if report.include?("❌ FAIL") || report.include?("BLOCK")
  message "✅ Agent Firewall: PASS" if report.include?("✅ PASS")
end

# ── Regla 5: Descripción del PR ──────────────────────────────────
fail "PR sin descripción. Agrega un resumen de los cambios." if github.pr_body.length < 20
