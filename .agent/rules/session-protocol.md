---
trigger: always_on
---

## Planning with Files & Session Memory Protocol (Mandatory)

**AL INICIAR cualquier objetivo nuevo o recuperar contexto:**
utilizar la skill /planning-with-files
1. Los archivos de planificación (`task_plan.md`, `findings.md`, `progress.md`) residen SIEMPRE en la carpeta `.agents/docs/PWF/`.
2. Leer `.agents/docs/PWF/task_plan.md` y `.agents/docs/PWF/progress.md` antes de cualquier acción.
3. Actualizar estos archivos en `.agents/docs/PWF/` después de cada fase completada o error encontrado.

**Reglas de Planning-with-Files Integradas:**
- **Create Plan First:** Nunca inicies una tarea compleja sin definirla en `task_plan.md`.
- **Read Before Decide:** Relee el plan antes de tomar decisiones mayores.
- **Update After Act:** Marca el estado de las fases (`in_progress` → `complete`), registra errores descubiertos y decisiones arquitectónicas.
- **Log ALL Errors:** Todos los errores encontrados y los intentos de solución deben registrarse para evitar repetir fallos.

**PROHIBIDO:**
- Escribir en `tasks/task_plan.md`, `tasks/findings.md`, `tasks/progress.md` o cualquier otro directorio de sesiones (`.agents/sessions/`).
- Ejecutar `pnpm run agent:session` (ha sido deprecado en favor de `.agents/docs/PWF/`).
- Usar `.agents/loop-run-counter.txt` para controlar bucles — eso lo hace `CircuitBreaker`.