# DB Audit Report — verifinca-spm-uce-2026
**Fecha:** 2026-07-28
**Branch:** develop
**Auditado por:** codebase-memory-mcp + mssql MCP

## Resumen Ejecutivo
- Total tablas: 56
- Tablas ACTIVAS: 19
- Tablas EN RIESGO: 21
- Tablas HUÉRFANAS: 16

## Detalle por Tabla

### ✅ ACTIVAS
| Tabla | Filas | DbContext | Repo | Servicio/Handler | Score | Función |
|---|---|---|---|---|---|---|
| DGII | 780396 | ✅ | ❌ | ✅ | 5 | Activa y referenciada |
| Usuario | 249 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| Notificaciones | 215 | ✅ | ✅ | ❌ | 5 | Activa y referenciada |
| Documentos | 144 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| Validaciones | 143 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| LogProyectos | 98 | ✅ | ✅ | ❌ | 5 | Activa y referenciada |
| Auditorias | 87 | ✅ | ✅ | ❌ | 5 | Activa y referenciada |
| __EFMigrationsHistory | 30 | ❌ | ❌ | ❌ | 0 | Activa e interna de EF Core |
| ProyectoGuardado | 11 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| PlanSuscripcion | 5 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| Certificaciones | 1 | ✅ | ✅ | ❌ | 5 | Activa y referenciada |
| Hallazgos | 1 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| Reportes | 1 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| SellosIntegridad | 1 | ✅ | ✅ | ❌ | 5 | Activa y referenciada |
| Documento | 0 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| ReglasValidacion | 0 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| ResultadosCrediticios | 0 | ✅ | ✅ | ❌ | 5 | Activa y referenciada |
| ResultadosRegla | 0 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |
| SelloIntegridad | 0 | ✅ | ✅ | ✅ | 7 | Activa y referenciada |

### ⚠️ EN RIESGO (Uso parcial)
| Tabla | Filas | DbContext | Repo | Servicio/Handler | Problema | Recomendación |
|---|---|---|---|---|---|---|
| CatastroTitulo | 1600000 | ❌ | ✅ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| PagoIPI | 780396 | ❌ | ✅ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| SesionUsuario | 254 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| UsuarioLegacy | 215 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| Acceso | 135 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| Municipio | 122 | ❌ | ❌ | ✅ | Faltan capas | Validar si se puede remover o integrar |
| Invitaciones | 70 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| LogConsultas | 67 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| Provincia | 32 | ❌ | ✅ | ✅ | Faltan capas | Validar si se puede remover o integrar |
| PerfilPermiso | 18 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| ProyectoInteres | 12 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| Perfiles | 5 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| ProyectosEstados | 5 | ❌ | ❌ | ✅ | Faltan capas | Validar si se puede remover o integrar |
| Permisos | 4 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| AlertasValidacion | 0 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| ConsentimientosFinancieros | 0 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| Consultas | 0 | ❌ | ❌ | ✅ | Faltan capas | Validar si se puede remover o integrar |
| DeteccionesDuplicidad | 0 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| TipoDocumento | 0 | ❌ | ✅ | ✅ | Faltan capas | Validar si se puede remover o integrar |
| ValidacionesAyuntamiento | 0 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |
| ValidacionesDgii | 0 | ✅ | ❌ | ❌ | Faltan capas | Validar si se puede remover o integrar |

### ❌ HUÉRFANAS (candidatas a DROP)
| Tabla | Filas | Última migration ref | Riesgo DROP |
|---|---|---|---|
| PermisoSuelo | 780125 | Sí | Alto (Requiere revisión humana) |
| ProyectosInmobiliarios | 144 | Sí | Alto (Requiere revisión humana) |
| Pagos | 79 | Sí | Alto (Requiere revisión humana) |
| LogPagos | 75 | No | Alto (Requiere revisión humana) |
| Recibo | 75 | Sí | Alto (Requiere revisión humana) |
| ApiGobernanza | 1 | No | Alto (Requiere revisión humana) |
| FremiunProyectos_Log | 1 | Sí | Alto (Requiere revisión humana) |
| AyuntamientoTarifa | 0 | No | Alto (Requiere revisión humana) |
| CertiMivhed | 0 | No | Alto (Requiere revisión humana) |
| DatoValidado | 0 | No | Alto (Requiere revisión humana) |
| EstudioSuelo | 0 | No | Alto (Requiere revisión humana) |
| FremiunConsultas_Log | 0 | No | Alto (Requiere revisión humana) |
| PlanCaracteristica | 0 | No | Alto (Requiere revisión humana) |
| SolvenciaFinanciera | 0 | No | Alto (Requiere revisión humana) |
| TarifaSueloAyuntamiento | 0 | No | Alto (Requiere revisión humana) |
| TipoInmoviliario | 0 | No | Alto (Requiere revisión humana) |

## Recomendaciones
- [ ] Tablas a mantener sin cambios: 19
- [ ] Tablas que requieren refactor (en riesgo): 21
- [ ] Tablas candidatas a deprecar (requiere HUMAN GATE antes de DROP): 16
