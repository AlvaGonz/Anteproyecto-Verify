---
id: new-feature
description: /new-feature
requires_mcps:
  - mcp-context7-mcp
---

WORKFLOW: /new-feature
TRIGGER: Cuando vas a implementar una nueva funcionalidad

NOMBRE DE LA FEATURE: [NOMBRE]
DESCRIPCIÓN: [QUÉ DEBE HACER]

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

=== PASO 0: INICIALIZAR ARCHIVOS DE PLANIFICACIÓN (@planning-with-files) ===
Crea el directorio aislado de sesión `.agents/sessions/<id_sesion>/` y sus archivos base (`task_plan.md`, `findings.md`, `progress.md`) con:
  - ID y nombre del flujo de trabajo (new-feature)
  - Objetivo de la feature o tarea
  - Lista de fases o pasos
GATE: El directorio de sesión `.agents/sessions/<id_sesion>/` y los archivos de planificación existen y están completos antes de continuar. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

=== FASE A: CONSULTA AL CEREBRO ===
Ejecuta /consult-brain internamente con el contexto de esta feature.
Espera el reporte de restricciones antes de continuar.
GATE: El reporte de restricciones existe y ha sido analizado. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

=== FASE B: GENERACIÓN DE SPEC ===
Con el contexto del brain, genera un SPEC.md con:
1. Objetivo de la feature en 1 oración
2. Archivos impactados (solo los del Mapa Crítico relevantes)
3. Tipos nuevos o modificados en types.ts (si aplica)
4. Schema Zod si hay inputs de usuario o respuestas de AI
5. Diagrama de flujo en Mermaid (máximo 10 nodos)
6. Pasos de implementación numerados y atómicos
7. Criterios de verificación (cómo sé que funcionó)

ESPERA MI APROBACIÓN DEL SPEC ANTES DE CONTINUAR.
GATE: SPEC.md aprobado por el usuario. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

=== FASE C: AGENT PROMPT PARA AGENT ===
Una vez aprobado el spec, genera el bloque "Copy/Paste into IDE":

---AGENT PROMPT---
Context: Lee @types.ts @App.tsx @[archivos relevantes del spec]
Objective: [objetivo del spec en 1 oración]
Constraints:
  - NO modifiques types.ts sin confirmar primero
  - NO añadas lógica de negocio en componentes
  - Stats y cálculos SOLO en utils/
  - Llamadas AI SOLO en services/
  - Usa Zod para validar cualquier input o respuesta AI
  - Tipado estricto — cero `any`
Steps:
  1. [Paso 1 del spec]
  2. [Paso 2 del spec]
  3. [...]
Verification: Ejecuta `npm run lint`. Si pasa sin errores, haz git commit con el tag feat([scope]):
---FIN AGENT PROMPT---
GATE: `npm run lint` pasa sin errores y el commit ha sido realizado con éxito. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.

=== FASE D: POST-IMPLEMENTACIÓN ===
Después del commit, ejecuta /update-brain automáticamente.
GATE: El cerebro (/update-brain) ha sido actualizado con éxito. Si falla → detenerse y reportar. NO proceder. MAX_RETRIES: 3.
