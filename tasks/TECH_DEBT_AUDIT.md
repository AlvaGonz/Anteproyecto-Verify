# 🛠️ Auditoría de Deuda Técnica - VeriFinca

Este documento actúa como una auditoría viva para identificar componentes huérfanos, rutas redundantes y áreas de mejora en la arquitectura del frontend.

## 🚩 Componentes Huérfanos / Código Muerto
| Archivo | Estado | Hallazgo | Acción Recomendada |
|---------|--------|----------|-------------------|
| `src/frontend/web/src/pages/projects/ProjectValidationResultsPage.tsx` | 🗑️ Huérfano | No se encontraron referencias en el router ni en otros componentes vía `navigate` o `Link`. | **Eliminar** en la próxima limpieza de código. |
| `src/frontend/web/src/pages/public/ProjectDetail.tsx` | 🗑️ Redundante | El router utiliza `ProjectPublicDetailPage.tsx` para la ruta `/projects/:id`. Este archivo parece ser una versión antigua u olvidada. | **Eliminar** para evitar confusión con el detalle público oficial. |

## 🔄 Consolidación de Navegación
| Origen | Ruta Anterior | Ruta Canonical | Motivo |
|--------|---------------|----------------|--------|
| `LandingFooter.tsx` | `/consulta-publica` | `/portal` | Evitar el redirect (301-style) definido en el router para una navegación más limpia. |
| `PublicVerifySearchPage.tsx` | `/projects` | `/portal` | El portal es la fuente de verdad para el listado público. |
| `PublicVerifySearchPage.tsx` | `/consulta-publica` | `/portal` | Consolidación de rutas públicas. |

## ✅ Verificación de Rutas Críticas
- **Dashboard:** Se confirmó su existencia en `src/frontend/web/src/features/dashboard/pages/DashboardPage.tsx` y su registro en el router.
- **Validaciones:** `ProjectValidationPage.tsx` navega a `/validations/:id`, el cual está registrado correctamente.

---
*Última actualización: 14 de Abril de 2026*
