---
id: debug-session
description: /debug-session
requires_mcps:
  - mcp-context7-mcp
---

WORKFLOW: /debug-session
TRIGGER: Cuando encuentras un error o comportamiento inesperado

ERROR / SÍNTOMA: [PEGA EL ERROR COMPLETO O DESCRIBE EL COMPORTAMIENTO]
ARCHIVO DONDE OCURRE: [PATH]
QUÉ INTENTASTE: [SI ALGO]

PASO 0 → Inicializar archivos de planificación (@planning-with-files):
  - Crea o actualiza `.agents/sessions/<id_sesion>/task_plan.md` con el ID `debug-session`, la descripción del síntoma y la lista de pasos a seguir.
  - GATE: El archivo `.agents/sessions/<id_sesion>/task_plan.md` existe y está completo antes de continuar. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

PASO 1 → Ejecuta /consult-brain para verificar si este bug tiene un ADR o fue
         previamente documentado en Fuente 5 (BUG log).
  - GATE: /consult-brain ha sido ejecutado y se han extraído los ADRs y bugs previos relevantes. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

PASO 2 → Analiza el stack trace siguiendo el Protocolo ARQ (ARQ.txt):
  - Lee el trace completo — no adivines
  - Identifica el punto exacto de fallo (archivo + línea)
  - Clasifica: ¿Error de tipo? ¿Lógica de negocio? ¿Violación de dominio Delphi?
  - Responde: ¿Violó alguna regla de types.ts o del ciclo de estados?
  - GATE: Stack trace analizado, fallo localizado exactamente en archivo + línea, y clasificado. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

PASO 3 → Genera el AGENT PROMPT quirúrgico para AGENT:
  - Context: @[archivo exacto donde falla] @types.ts
  - Objetivo: fix específico sin tocar código adyacente
  - Constraint: No refactorices más allá del fix. Un cambio atómico.
  - Verification: npm run lint debe pasar. Describe el comportamiento esperado.
  - GATE: AGENT PROMPT generado con éxito y `npm run lint` pasa tras el fix sin errores. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

PASO 4 → Después del fix, ejecuta /update-brain con:
  → BUG-[N]: síntoma, root cause, fix, commit hash
  - GATE: BUG-[N] registrado en el cerebro (/update-brain) correctamente. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.
