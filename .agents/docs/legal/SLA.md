# Acuerdo de Nivel de Servicio (Service Level Agreement - SLA)
v1.1.0 — Updated: 2026-06-22

## 1. Compromiso de Disponibilidad (Uptime Target)
VeriFinca se compromete a mantener una disponibilidad operativa (uptime) del **99.2% mensual**, lo que equivale a un máximo de 5.8 horas de inactividad planificada o imprevista por mes (RNF-3).

## 2. Tiempos de Respuesta de Validación (Response Time SLA)
- Para validaciones de proyectos simples: **≤ 2 minutos**.
- Para proyectos complejos (múltiples documentos): **≤ 5 minutos** (RNF-2).

## 3. Capacidad Concurrente (Concurrent Load)
La plataforma está diseñada y garantizada para soportar un mínimo de **500 usuarios concurrentes** realizando consultas o validaciones simultáneas (RNF-4).

## 4. Mantenimiento Planificado (Planned Maintenance)
Cualquier ventana de mantenimiento planificado que pueda afectar la disponibilidad del sistema será notificada a los usuarios con al menos **48 horas de anticipación**, mediante avisos dentro de la aplicación (banners) y correo electrónico.

## 5. Niveles de Respuesta ante Incidentes (Incident Response Levels)

| Severidad | Definición | Tiempo de Respuesta | Resolución Objetivo |
|---|---|---|---|
| **P1 — Crítico** | Caída total de la plataforma / brecha de datos | ≤ 1 hora | ≤ 4 horas |
| **P2 — Alto** | Función principal no disponible (OCR, Sello) | ≤ 4 horas | ≤ 24 horas |
| **P3 — Medio** | Función secundaria degradada | ≤ 8 horas | ≤ 72 horas |
| **P4 — Bajo** | Fallo estético UI / error menor | ≤ 24 horas | ≤ 1 semana |

## 6. Exclusiones
Las siguientes interrupciones **no** contabilizarán en el cálculo del SLA del 99.2% de VeriFinca:
- Eventos de fuerza mayor (desastres naturales, cortes de internet nacionales).
- Interrupciones o caídas de APIs de terceros (Registro Inmobiliario, DGII, TransUnion, servicios de Microsoft Azure a nivel regional).
