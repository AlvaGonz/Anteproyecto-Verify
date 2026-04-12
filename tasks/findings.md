# Discovery Findings - VeriFinca

## 1. Stack Oficial
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: ASP.NET Core 8 Web API
- **Arquitectura**: Clean Architecture (Backend), SPA (Frontend)
- **Base de Datos**: Azure SQL (Relational data)
- **Almacenamiento**: Azure Blob Storage (Document storage)
- **Seguridad**: AES-256 (at rest), TLS 1.2+ (in transit), MFA, RBAC

## 2. Reglas de Negocio del Sistema VeriFinca
- Validación de proyectos inmobiliarios en República Dominicana para prevención de fraudes.
- **Diagnóstico Documental**: Identificar y exigir documentación basada en normativas del Registro Inmobiliario (RI).
- **Validación de Integridad**: OCR para firma, fecha, etc.
- **Interoperabilidad/Contraste**: RI (títulos/cargas), Catastro (linderos, área), DGII (estatus fiscal).
- **Mapeo Territorial**: Georreferenciación.
- **Verificación Crediticia y de Consentimiento**: Aplicación de Ley 172-13.
- **Sello de Integridad**: Emisión de QR firmado digitalmente (Ley 126-02) al cumplir validaciones.

## 3. Estructura Actual de Carpetas Frontend (`src/frontend/web/src/`)
- `app/`
- `features/`
- `infrastructure/`
- `pages/` (admin, projects, public)
- `router/`
- `shared/` (components, security, layouts)
- `styles/`

## 4. Rutas Existentes
- **Públicas**: `/`, `/consulta-publica`, `/verify`, `/verify/:code`, `/health`, `/projects`, `/projects/:id`
- **Administración (Protegidas por AuthGuard)**: 
  - `/admin/dashboard`
  - `/admin/projects`
  - `/admin/projects/new`, `/admin/projects/:id/edit`
  - `/admin/projects/:id/documents`
  - `/admin/projects/:id/validations`
  - `/admin/projects/:id/audit`
  - `/admin/projects/:id/reports`
  - `/admin/rules`
