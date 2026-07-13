# debug-session

## Symptom
`GET http://localhost:5000/api/projects/{id}/reports/public` returns 404 Not Found when accessed from the public project detail page via `usePublicReport` hook.

## Arch/Root Cause Analysis
The frontend hook `usePublicReport` calls `/api/projects/{projectId}/reports/public` but this endpoint was missing in the backend controllers. `ReportsController.cs` and `ProjectReportsController.cs` defined `/api/projects/{projectId}/reports` and related POST actions, but no GET for `public`. The backend had the handler `GetPublicProjectReportQueryHandler` but it wasn't exposed via an endpoint.

## Steps
- [x] Analizar el stack trace y ubicar controlador.
- [x] Revisar `api/projects/{id}/reports/public` (faltaba el endpoint completo en el controlador).
- [x] Fix específico en el archivo backend (`ReportsController.cs`).
- [x] Ejecutar lint/build (Backend build succeeded).
- [ ] Reiniciar contenedor de la API (en proceso).
- [ ] Actualizar BUG log en `progress.md`.
