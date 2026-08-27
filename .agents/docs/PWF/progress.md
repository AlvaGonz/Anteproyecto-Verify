# PWF Progress — VeriFinca

## Sesión 2026-08-27 (III) — Corrección de Seeder de Proyectos Inmobiliarios desde CSV en Docker

**Ciclo:** Backend & Base de Datos / Seeding (`AppDbContextSeeder.cs`, `ProyectosInmobiliarios_20260814_085516.csv`)
**Estado:** ✅ COMPLETO — Se restauraron exitosamente los 120 proyectos desde el archivo CSV con la distribución precisa entre usuarios (Consultor: 1, Profesional: 5, Empresa: 10, Freemium: 31, Corporativo: 73).
- **Problema Abordado:**
  1. Al iniciar la API en Docker, los proyectos inmobiliarios no se poblaban en la base de datos debido a que `AppDbContextSeeder.cs` arrojaba `KeyNotFoundException: The given key 'CodigoInterno' was not present in the dictionary` en la línea 362.
  2. La causa raíz fue que el archivo `ProyectosInmobiliarios_20260814_085516.csv` carecía de fila de cabecera (`headers`), por lo que el método `ParseCsv` tomaba la primera fila de datos como nombres de columnas. Además, los GUIDs de `IdUsuario` y `EstadoId` en el CSV no coincidían con el mapeo hardcodeado previo.
- **Mejoras Implementadas:**
  1. **Detección Automática de Cabecera en `ParseCsv` (`AppDbContextSeeder.cs`):**
     - Se añadió un fallback con `DefaultProyectoCsvHeaders` que auto-detecta si la primera línea contiene cabeceras (`CodigoInterno`, `NombreProyecto`, etc.) o datos directos.
     - Se utilizó `StringComparer.OrdinalIgnoreCase` y extracción segura mediante `.TryGetValue(...)` para evitar excepciones en caso de columnas faltantes.
  2. **Actualización de Mapeos de Usuarios y Estados:**
     - Se integraron los GUIDs actuales del CSV para los usuarios (`2BC69554-6440-4B0E-A9B5-18757599EE1C` -> Consultor, `EE7DAFEA-A030-4959-A55E-4C40DBBE91A7` -> Profesional, `09E58353-1699-45B6-8275-EBE259250170` -> Empresa, `8B5288AF-FF7B-41C1-9E6A-FCE656831EAA` -> Corporativo, `FBC9BA82-5E4C-4EBF-98A1-FCA54900E106` -> Freemium).
     - Se mapearon todos los GUIDs de estado (`EC57F714...` -> Publicado, `7A58C470...` -> Revisión, `1F8F8E74...` -> Creado, `3CD6BB60...` -> Editado, `C97EFC82...` -> Observación).
  3. **Verificación en Docker:**
     - Se reconstruyó la imagen de la API y se confirmó en los logs de Docker `Successfully restored 120 projects from CSV cache.` y la correcta asignación en base de datos.

---

## Sesión 2026-08-27 (II) — Corrección de Error 500 en Landing Page por Clave Foránea en Logs de Auditoría

**Ciclo:** Backend & Base de Datos / Auditorías (`AuditoriaService.cs`, `PublicProjectController.cs`, `SearchPublicProjectsQueryHandler.cs`)
**Estado:** ✅ COMPLETO — Compilación exitosa, contenedor de la API reconstruido, y verificación de landing page y buscador 100% verde en local sin excepciones (HTTP 200 OK).
- **Problema Abordado:**
  1. La Landing Page o búsquedas públicas realizadas por usuarios anónimos retornaban Error 500 (Internal Server Error) debido a una violación de clave foránea `FK_Auditorias_Usuario_UsuarioId` en la tabla `Auditorias` al intentar insertar el log de auditoría con un `UsuarioId` no nulo (procedente de tokens JWT locales antiguos o inválidos del navegador) pero inexistente en la base de datos `Usuario` (ej: tras una limpieza de base de datos local).
- **Mejoras Implementadas:**
  1. **Validación de Existencia de Usuario en `AuditoriaService.cs`:**
     - Se inyectó `IUsuarioRepository` en `AuditoriaService`.
     - En el método `Append`, se realiza una comprobación en la base de datos de la existencia del `UsuarioId` recibido.
     - Si el `UsuarioId` no se encuentra en la base de datos, se reestablece a `null` de forma segura, permitiendo el guardado del log como una acción anónima/pública en lugar de arrojar una violación de clave foránea.
  2. **Compilación y Despliegue en Docker:**
     - Se validó la compilación del proyecto backend y se reconstruyó la imagen de Docker para la API (`api` service).
     - Se verificó mediante un subagente de navegación que la landing page local y las búsquedas públicas ("residencial") cargan y operan con normalidad en `http://localhost:3000` devolviendo código HTTP 200 y sin errores de consola.

---

## Sesión 2026-08-27 — Aislamiento y Corrección del Sello de Integridad ("Certificación Verificable") en Impresión y PDF

**Ciclo:** Frontend / Certificaciones (`CertificationSection.tsx`, `CertificationQr.tsx`, `global.css`, `CertificationSection.test.tsx`, `integrity-seal-print.spec.ts`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (Vitest unit tests 5/5 passed, Playwright E2E 7/7 tests passed con trazas y comprobaciones de aislamiento/bounding box).
- **Problema Abordado:**
  1. Al invocar "Imprimir" / generar PDF en la sección de "Certificación Verificable" del proyecto (`/admin/projects/:id/validations`), el diálogo del navegador y PDF resultante imprimían el layout completo administrativo (`AdminLayout`, barra lateral, encabezados, botones, scrollbars).
  2. Debido a los contenedores con `h-[100dvh] overflow-hidden` y `max-w-7xl` del shell administrativo, el sello de integridad quedaba recortado con scroll horizontal y vertical, perdiendo legibilidad del código QR y metadatos.
- **Mejoras Implementadas:**
  1. **Aislamiento de Raíz de Impresión (`data-testid="integrity-seal-print-root"`):**
     * Se separó la vista de pantalla (`integrity-seal-screen`) de la representación imprimible dedicada (`integrity-seal-print`).
     * Se diseñó un certificado formal con marco perimetral, membrete institucional ("VERIFINCA — Certificación Verificable de Integridad"), metadatos esenciales del proyecto (`project.nombre`, `project.codigoInterno`, código de validación, estado de integridad, fechas formateadas UTC y aviso legal bajo Ley 126-02 y Ley 172-13).
     * Se retiraron del diseño imprimible los subtítulos de texto redundantes debajo del QR (código duplicado y URL local) así como las secciones de "Nivel de Certificación" y "Consultas Recibidas" para mayor limpieza visual.
  2. **Reglas de Impresión CSS (@media print y @page):**
     * Configuración `@page { size: A4 portrait; margin: 12mm; }`.
     * Desactivación de restricciones de altura y overflow en `#root`, `.admin-layout`, `main`, y contenedores.
     * Ocultamiento automático de sidebar, barra de navegación, botones, diálogos y controles interactivos (`display: none !important; visibility: hidden !important;`).
     * Posicionamiento absoluto y expansión al 100% de `.integrity-seal-print` evitando desbordamiento y saltos de página partidos (`break-inside: avoid; page-break-inside: avoid;`).
  3. **Accesibilidad y Atributo de Disponibilidad de Impresión (`data-print-ready="true"`):**
     * Accesibilidad completa en botones (`aria-label="Imprimir certificación"`, `aria-label="Descargar código QR en formato SVG"`).
     * Accesibilidad en QR (`data-testid="integrity-seal-qr"`, `aria-label="Código QR de verificación de integridad"`, `role="img"`).
     * Estado `data-print-ready="true"` habilitado una vez que los activos del sello y el código QR están listos.
  5. **Bypass de Acceso Público Vía Token QR y Conteo de Consultas (TDD + Ponytail):**
     * En `CertificationSection.tsx`, se corrigió la codificación de la URL del QR para utilizar la ruta pública segura con token `/#/q/${qrToken}` en lugar del enlace privado administrativo `/#/p/${projectId}`.
     * En `ProjectPublicDetailPage.tsx`, se normalizaron los campos del DTO de consulta pública (`nombreProyecto` -> `nombre`, `ubicacion` -> `ubicacionTexto`) y se configuró `gcTime: 0` en `qrQuery` para garantizar que cada escaneo/visita consulte y registre el acceso en tiempo real.
     * Se implementaron pruebas unitarias backend (`GetPublicProjectStatusQueryHandlerTests.cs`) y E2E frontend (`integrity-seal-print.spec.ts`) validando que las visitas 1 a 3 a la URL del QR (`/#/q/:qrToken`) incrementan progresivamente el contador `Consultas Recibidas` en la pantalla administrativa de validaciones (`/admin/projects/:id/validations`).
  6. **Detalles del Publicador (Responsable Registral) y Especificaciones Técnicas en Consulta Pública:**
     * En `PublicProjectStatusDto.cs` y `GetPublicProjectStatusQueryHandler.cs`, se extendió la respuesta para incluir `RegistradoPor` (con resolución de identidad pública según `PublicIdentityResolver`), así como las especificaciones completas (`DatosDesarrollador`, `RncDesarrollador`, `CreatedAtUtc`, `CategoriaNombre`, `ValorEstimado`, `SuperficieM2`, `Cercania`, etc.).
     * En `useSettings.ts`, `useDocuments.ts` y `ProjectDocumentStatus.tsx`, se agregó el flag `enabled` para evitar llamadas redundantes no autenticadas a `/api/v1/subscriptions/my-status` y `/api/projects/:id/documents` cuando se visualiza mediante QR anónimo, eliminando por completo los errores 401 en consola.

---
- **Problema Abordado:**
  1. El botón "Exportar Logs" en la pantalla de auditoría (`/admin/audit-log`) descargaba un CSV y forzaba la extensión `.pdf` en el guardado del cliente frontend, generando un PDF corrupto e ilegible.
  2. La columna "Proyecto" en la tabla de logs estaba casi siempre vacía (`N/A`) para eventos que no correspondían a un ID de proyecto específico. El usuario solicitó cambiarla por "Código" para desplegar el código interno del proyecto, o el código/email/nickname del usuario según correspondiera.
- **Mejoras Implementadas:**
  1. **Generación de PDF en Backend (QuestPDF):**
     * Se implementó `GenerateAuditLogPdfAsync` en `ReportGeneratorService.cs` utilizando **QuestPDF** con el logo institucional de "VeriFinca" centrado y los datos del usuario emisor del reporte con la fecha y hora UTC.
     * Se diseñó una tabla estilizada de logs con alternancia de colores e insignias de colores personalizadas para cada tipo de evento (creaciones, cargas de documentos, validaciones, etc.).
     * El endpoint `/api/reports/global-audit` se modificó en `AdminAuditController.cs` para obtener el ID del usuario actual mediante los claims del contexto HTTP y llamar a `HandlePdfAsync` sirviendo el flujo del PDF generado.
  2. **Columna "Código" e Identificadores Reales:**
     * Se actualizó `AuditoriaRepository.cs` para incluir las relaciones de navegación `Proyecto` y `Usuario` (`.Include()`) en los queries filtrados.
     * Se añadió la propiedad `Codigo` al DTO de auditoría (`AuditDto`) y se mapeó dinámicamente en los handlers de consulta (`GetGlobalAuditTrailQueryHandler.cs` y `GetProjectAuditTrailQueryHandler.cs`), resolviendo el código interno del proyecto o nickname/correo del usuario.
     * Se renombró la columna en la interfaz web de "Proyecto" a "Código" y se renderiza `log.codigo` de forma nativa.
     * Se revertieron los cambios accidentales en la lógica de mapeo de las columnas "Usuario" y "Evento" en el frontend para asegurar que se muestre la información descriptiva original sin alteraciones (como las descripciones de las acciones y el indicador de sistema).

---

## Sesión 2026-08-24 — Unificación de Búsqueda Pública, Política de Cuotas y Auto-Scroll en Directorio (TDD + Ponytail)

**Ciclo:** UI & Búsqueda Global / Frontend (`VerifySearchForm.tsx`, `HeroSection.tsx`, `VerifySearchForm.test.tsx`, `HeroSection.test.tsx`, `ProjectsPublicListPage.tsx`, `ProjectsPublicListPage.test.tsx`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (Vitest frontend 21/21 tests passed en `VerifySearchForm.test.tsx`, `HeroSection.test.tsx` y `ProjectsPublicListPage.test.tsx`), `tsc --noEmit` limpio, dotnet tests 43/43 passed.
- **Problema Abordado:**
  1. El buscador público no debe deducir cuotas de consulta en las búsquedas genéricas ni de formularios; el consumo de consulta solo se descuenta de forma estricta cuando el usuario ingresa/accede efectivamente a la vista pública de detalle de un proyecto (`ProjectPublicDetailPage`).
  2. Al realizar una búsqueda por nombre de proyecto desde el Hero o URL, la página debe auto-desplazarse (`scrollIntoView`) de manera suave hacia el recuadro de búsqueda lateral del directorio para que el usuario visualice inmediatamente el campo `● Búsqueda` y los resultados filtrados.
- **Mejoras Implementadas (TDD + Ponytail):**
  1. `VerifySearchForm.tsx`: Se eliminó el consumo prematuro de cuota (`projectsApi.consumeQuota`), haciendo las búsquedas ultraligeras y sin bloqueos de autenticación.
  2. `ProjectsPublicListPage.tsx`: Añadida referencia (`searchContainerRef`) y auto-scroll suave (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) cuando se detecta un parámetro de búsqueda de proyecto, asegurando que el recuadro lateral del filtro quede centrado y visible en pantalla.
  3. Pruebas TDD:
     - `VerifySearchForm.test.tsx`: 11 pruebas unitarias actualizadas y simplificadas.
     - `HeroSection.test.tsx` y `ProjectsPublicListPage.test.tsx`: 10 pruebas unitarias e integración (21/21 tests verdes).

---

**Ciclo:** Autorización & UI / Admin Projects (`AdminProjectContextMenu.tsx`, `AdminProjectList.tsx`, `AdminProjectContextMenu.test.tsx`, `ProjectsController.cs`, `ProjectsControllerTests.cs`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (Vitest frontend 7/7 passed, xUnit backend `ProjectsControllerTests` 6/6 passed), API Docker actualizada e iniciada.
- **Problema Abordado:** Las opciones de menú de cambio de estado ("Cambiar Estado": "Publicar (Aprobado)", "Pasar a En Revisión", "Marcar Observado", "Revertir a Borrador") en la tabla de proyectos del administrador debían estar disponibles y ejecutables **únicamente** para usuarios con rol de administrador.
- **Mejoras Implementadas (TDD + Ponytail):**
  1. `AdminProjectContextMenu.tsx`: Prop `isAdmin` agregada y evaluada condicionalmente para envolver el encabezado y botones de «Cambiar Estado».
  2. `AdminProjectList.tsx`: Pasa la propiedad `isAdmin={isAdmin}` a `<AdminProjectContextMenu />`.
  3. `ProjectsController.cs`: Añadido atributo `[Authorize(Roles = "admin,Administrator")]` al endpoint `PATCH /api/projects/{id}/status`.
  4. Pruebas TDD:
     - `AdminProjectContextMenu.test.tsx`: Tests para validar ocultamiento cuando `isAdmin === false` y renderizado cuando `isAdmin === true`.
     - `ProjectsControllerTests.cs`: Test de reflexión para verificar `AuthorizeAttribute(Roles = "admin,Administrator")`.

---

## Sesión 2026-08-23 — Corrección de Conflicto de Clave Foránea JCE en Google Login (`FK_Usuario_JCE_Ciudadano_Cedula`)

**Ciclo:** Autenticación & Persistencia / Google Auth (`Usuario.cs`, `GoogleLoginUserCommandHandler.cs`, `InviteTeamMemberCommandHandler.cs`, `SettingsController.cs`, `UsuarioConfiguration.cs`, `20260823203645_AllowSocialLoginWithoutCedula.cs`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`GoogleLoginUserCommandHandlerTests.cs` 3/3 passed, `DomainTests.cs` 12/12 passed), Migración de EF Core aplicada en SQL Server dentro de Docker, API reconstruida e iniciada exitosamente.
- **Causa Raíz Diagnosticada:** Cuando un nuevo usuario iniciaba sesión vía Google OAuth (`POST /api/auth/google`), `GoogleLoginUserCommandHandler` instanciaba `Usuario` pasando `"00000000000"` como cédula para satisfacer una verificación rígida en el constructor de `Usuario`. Al guardar en base de datos, SQL Server disparaba `SqlException 547` violando la clave foránea `FK_Usuario_JCE_Ciudadano_Cedula` (puesto que `"00000000000"` no existe en `dbo.JCE_Ciudadano`).
- **Mejoras Implementadas (TDD + Ponytail):**
  1. `Usuario.cs`: Cédula y RNC ahora son opcionales con valor por defecto `null` y normalización limpia de espacios en blanco.
  2. `GoogleLoginUserCommandHandler.cs`: Creación de usuarios de Google con `Cedula = null` y `Rnc = null`.
  3. `InviteTeamMemberCommandHandler.cs` y `SettingsController.cs`: Eliminación de strings de cédula provisionales falsas (`"00000000000"`, `"000-0000000-0"`), pasando `null`.
  4. `UsuarioConfiguration.cs` y Migración EF Core (`AllowSocialLoginWithoutCedula`): Modificación del Check Constraint `CK_Usuario_Cedula_Rnc` para permitir explícitamente `[SocialLogin] = 1` y miembros invitados con `[TitularId] IS NOT NULL`.
  5. Verificación TDD: Pruebas unitarias actualizadas y aprobadas (12/12 verdes).

---

## Sesión 2026-08-22 — Extracción Robusta de Certificación IPI (DGII) con PaddleOCR y Validación de Gobernanza (100% Match)

**Ciclo:** Motor IA OCR / Certificación IPI (`main.py`, `CertificacionIPIRdPaddleMapper.cs`, `CertificacionIPIRdPaddleMapperTests.cs`, `GobernanzaCatastroMatchTests.cs`, `AppDbContextSeeder.cs`, `ocr-certificacion-ipi-extraction.spec.ts`, `Certificacion IPI_0001.pdf`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`CertificacionIPIRdPaddleMapperTests.cs` 14/14 passed, `GobernanzaCatastroMatchTests.cs` 5/5 passed), Playwright E2E (`ocr-certificacion-ipi-extraction.spec.ts` 1/1 passed, 16.1s), Suite OCR completa 3/3 passed (34.6s), Microservicio en Docker y Backend C# API 100% coincidencia en vivo con `Certificacion IPI_0001.pdf`.
- **Problema Abordado:** En `Certificacion IPI_0001.pdf`, el OCR extraía:
  - `No. de Certificación`: `CERT761035JUICI0DEVALOR` (en lugar de `338738592876`).
  - `No. Inmueble`: `0902161199220047` (en lugar de `070223482149:0021`).
  - `Parcela No.`: `090216119922:4-A` (en lugar de `070223482149`).
- **Mejoras Implementadas:**
  1. **Microservicio PaddleOCR (`src/microservices/paddleocr-api/main.py`):**
     - Función `extract_ipi_fields(lines)` con regexes especializadas para `NoCertificacion`, `NoInmueble` (soporta `:0021` y variantes OCR tipográficas `Inmuebie`), y `ParcelaNo` (descartando cláusulas posteriores como `, D.C. No.`).
     - Exposición de `IpiFields` en endpoint `/api/v1/ocr/extract`.
  2. **Mapeador C# (`src/backend/Application/Documents/Extractions/CertificacionIPIRdPaddleMapper.cs`):**
     - Refactorización modular en `ExtractCertificacion`, `ExtractInmueble` y `ExtractParcela`.
     - Filtro para ignorar cláusulas legales de deslinde de responsabilidad (`juicio de valor`, `declaraciones presentadas`).
     - Normalización de parcelas preservando sub-parcelas e identificadores de 12 dígitos.
  3. **Base de Datos & Gobernanza (`AppDbContextSeeder.cs`, `GobernanzaDeDatosService.cs`):**
     - Semillado permanente en `SeedPagosIpiAsync` y en base de datos SQL Server Docker de registro mock (`NoCertificacion: 338738592876`, `NoInmueble: 070223482149:0021`, `ParcelaNo: 070223482149`, `Estatus: Pagado`).
     - Mejora de lookup en `VerificarIpiAsync` para buscar por `NoCertificacion`, `NoInmueble`, `ParcelaNo` y `Rnc`.
  4. **Suite TDD (Playwright & xUnit):**
     - Backend xUnit (`CertificacionIPIRdPaddleMapperTests.cs` 14/14 passed, `GobernanzaCatastroMatchTests.cs` 5/5 passed).
     - Playwright E2E (`ocr-certificacion-ipi-extraction.spec.ts` 1/1 passed, 16.1s) validando en la UI los 3 campos (`338738592876`, `070223482149:0021`, `070223482149`) y logrando **100% Match** con Gobernanza.
     - Suite Playwright OCR global (`ocr-cedula-extraction`, `ocr-certificacion-ipi-extraction`, `ocr-planos-mensura-pm0001`): 3/3 passed (34.6s).

---

## Sesión 2026-08-22 — Extracción Robusta de Cédulas Dominicanas (JCE) con PaddleOCR y TDD (100% Match)

**Ciclo:** Motor IA OCR / Cédula Dominicana (`main.py`, `CedulaExtractionMapper.cs`, `CedulaRdPaddleMapperTests.cs`, `ocr-cedula-extraction.spec.ts`, `Cedula nueva_0001.pdf`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`CedulaRdPaddleMapperTests.cs` 4/4 passed), Playwright E2E (`ocr-cedula-extraction.spec.ts` 1/1 passed, 15.9s), Suite OCR completa 4/4 passed (20.2s), Microservicio en Docker 100% coincidencia en vivo con `Cedula nueva_0001.pdf`.
- **Problema Abordado:** En `Cedula nueva_0001.pdf` y documentos de cédula dominicana (JCE), el OCR extraía:
  - `Nombres`: `MARIA PECIMEX` (debido a que la marca de agua de muestra `BA/ SPECIMEX` se adhería al nombre).
  - `Apellidos`: `NO DETECTADO` (debido a falta de proximidad multilínea y labels variantes como `Apeltida`).
  - `Fecha Nacimiento`: `NO DETECTADO` (debido a mes en texto con error tipográfico de OCR `04 JUNtO 1962`).
  - `Fecha Expiración`: `NO DETECTADO` (debido a prefijo con ruido `: hasta. 03.05:2025` / `Vigrencia Masta 03.05:2025`).
- **Mejoras Implementadas:**
  1. **Microservicio PaddleOCR (`src/microservices/paddleocr-api/main.py`):**
     - Función `extract_cedula_fields(lines)` con filtrado estricto de marcas de agua (`clean_watermark` para `SPECIMEN`, `ESPECIMEN`, `PECIMEX`, `MUESTRA`, etc.).
     - Diccionario de meses en español `SPANISH_MONTHS` con corrección de OCR (`JUNtO` / `JUNTO` / `JUN1O` → `06`, `SEPTIEMBRE` → `09`, `NOVIEMBRE` → `11`, etc.).
     - Extracción de fechas numéricas y con puntuación ruidosa (`Vigrencia Masta 03.05:2025` → `03-05-2025`).
     - Normalización de apellidos (`normalize_name_typos` para `GQMEZ` → `GOMEZ`).
  2. **Mapeador C# (`src/backend/Application/Documents/Extractions/CedulaExtractionMapper.cs`):**
     - Mapeador de 4 capas para Cédulas Dominicanas:
       - Capa 1: Extracción de líneas desde `RawJson`, `Lines` y `ExtractedText`.
       - Capa 2: Detección inteligente de etiquetas (`Número de cédula`, `Nombres`, `Apellidos` con soporte para `Apeltida`, `Apeltido`, `Apelido`).
       - Capa 3: Fusión y saneamiento de nombres multilínea descartando ruido de hologramas (`0`, `M`, `2`, `3`, `<`, `:`, `0)`).
       - Capa 4: Normalización canónica de fechas (`04-06-1962`, `03-05-2025`) y número de cédula (`00010032696`).
  3. **Suite TDD (Playwright & xUnit):**
     - Backend xUnit (`CedulaRdPaddleMapperTests.cs`): 4/4 tests pasados verificando `Cedula nueva_0001.pdf`, `Cedula nueva Adrian.pdf`, `Cedula nueva_002.pdf` y filtrado de `PECIMEX`.
     - Playwright E2E (`ocr-cedula-extraction.spec.ts`): 100% pasado (15.9s) validando visualmente en la UI los 5 campos extraídos (`00010032696`, `MARIA MIGUEL`, `CRUZ GOMEZ`, `04-06-1962`, `03-05-2025`).
     - Suite Playwright OCR global (`ocr-cedula-extraction`, `ocr-planos-mensura-pm0001`, `ocr-planos-mensura`): 4/4 tests pasados (20.2s).

---

## Sesión 2026-08-22 — Ingestión Híbrida 300 DPI, Filtro Anti-UTM y Validación Catastral PM_0001 (100% Match)

**Ciclo:** Motor IA OCR / Planos de Mensura Catastral (`main.py`, `SPEC.md`, `PlanoMensuraCatastralRdPaddleMapper.cs`, `ocr-planos-mensura-pm0001.spec.ts`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`PlanoMensuraCatastralRdPaddleMapperTests.cs` 16/16 passed, `GobernanzaCatastroMatchTests.cs` 4/4 passed), Playwright E2E 8/8 verdes (15.1s), Microservicio en vivo 100% match.
- **Problema Abordado:** En `PM_0001.pdf`, el contenedor de PaddleOCR extraía erróneamente `999643229014` en Posicional (procedente de `FACTOR UTM = 0.9996432290145`), `NO DETECTADO` en Superficie (debido a baja resolución por defecto en PDF rasterizer) y `_ESTE` en Departamento.
- **Mejoras Implementadas:**
  1. **Especificación Técnica (`SPEC.md`):** Formalización de arquitectura híbrida, rasterización a 300 DPI con PyMuPDF, filtro anti-UTM (`0.999...`), pre-procesamiento OpenCV y criterios de match contra DB.
  2. **Microservicio PaddleOCR (`src/microservices/paddleocr-api/main.py`):**
     - Ingestión Híbrida (`extract_hybrid_text`): Fusión de texto vectorial nativo del PDF (`fitz.get_text`) con inferencia OCR en imágenes rasterizadas a 300 DPI (`zoom = 300 / 72`).
     - Pre-procesamiento OpenCV (`preprocess_for_ocr`): Denoising (`fastNlMeansDenoising`) + binarización Otsu + auto-scaling a 1080p+.
     - Filtro Anti-UTM (`filter_false_positives`): Exclusión de factores de escala `0.999...` y palabras clave `FACTOR`, `UTM`, `ESCALA`.
     - Extracción regex de 5 campos y limpieza de `Departamento` (`_ESTE` → `ESTE`).
  3. **Mapeador C# (`PlanoMensuraCatastralRdPaddleMapper.cs`):**
     - Sanitización de `Departamento` (`_ESTE` → `ESTE`).
     - Exclusión de patrones `999...` de la designación posicional de 12 dígitos.
  4. **Suite TDD (Playwright & xUnit):**
     - Playwright E2E: `ocr-planos-mensura-pm0001.spec.ts` (1/1 passed), `ocr-planos-mensura.spec.ts` (2/2 passed), `ocr-plano-extraction.spec.ts` (5/5 passed) — Total: 8/8 passed (15.1s).
     - Backend xUnit: `PlanoMensuraCatastralRdPaddleMapperTests.cs` (16/16 passed), `GobernanzaCatastroMatchTests.cs` (4/4 passed).

---

**Ciclo:** Infraestructura & Seeding de Base de Datos (`AppDbContextSeeder.cs`, `AppDbContextSeederTests.cs`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`AppDbContextSeederTests.cs` 4/4 passed), Api.Tests 43/43 verdes, 12 usuarios y 120 proyectos confirmados en SQL Server dentro de Docker.
- **Causa Raíz Diagnosticada:** Al levantar el stack con `docker compose up`, el contenedor de la API arrancaba inmediatamente mientras el contenedor `python_env` cargaba asíncronamente los 780,396 registros de la DGII en segundo plano. En `AppDbContextSeeder.SeedAsync`, `SeedCatastroTitulosAsync` se ejecutaba antes de la creación de usuarios intentando insertar registros mock con RNCs (`131950213`, `10100074474`, `133725444`). Como la tabla `DGII` aún no contenía dichos RNCs al momento del arranque de la API, SQL Server arrojaba una violación de clave foránea `FK_CatastroTitulo_DGII_Rnc` (`SqlException 547`), interrumpiendo el bloque `try/catch` de `SeedAsync` antes de crear los usuarios (`adminUser`, `freemiumUser`, `consultorUser`, `profesionalUser`, `empresaUser`, `corporativoUser`, `testUser`, etc.).
- **Mejoras Implementadas (TDD + Ponytail):**
  1. Nuevas pruebas unitarias TDD en `AppDbContextSeederTests.cs` (`SeedAsync_ShouldSeedAllDefaultUsers_Successfully`, `SeedAsync_ShouldSeedMockDgiiRecords_WhenDgiiIsEmpty`, `SeedAsync_ShouldSeedCatastroTitulos_Successfully`).
  2. Implementación de `SeedDgiiForDefaultMocksAsync` en `AppDbContextSeeder.cs` para asegurar la existencia preventiva de los registros mock de DGII requeridos por `CatastroTitulo` y usuarios por defecto antes de semillar entidades dependientes.
  3. Envoltura resiliente con try-catch en `SeedCatastroTitulosAsync` para garantizar que fallos aislados en mocks secundarios no aborten el semillado de usuarios y entidades centrales.
  4. Verificación en vivo en Docker: Base de datos SQL Server poblada con éxito con los 12 usuarios del sistema, 120 proyectos y catastro operativo.

---

**Ciclo:** Gobernanza de Datos / Validación Estado Jurídico (`GobernanzaDeDatosService.cs`, `AppDbContextSeeder.cs`, `EstadoJuridicoExtractionCard.tsx`, `EstadoJuridicoRdPaddleMapper.cs`, `mapper.ts`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`GobernanzaCatastroMatchTests.cs`), 100% Verde en unit tests de Estado Jurídico (6/6), 0 errores TypeScript, Docker API actualizado y E2E Playwright verde (19.5s).
- **Causa Raíz Solucionada:** El match en Estado Jurídico se quedaba en 0% porque el registro mock (`IdCatastroTitulo: 31ABE1EA-A002-4D46-83C0-000AAD5D5C61`) no estaba presente en la base de datos `CatastroTitulo`, `getPayload()` en `EstadoJuridicoExtractionCard.tsx` omitía `municipio` y el fallback de `provincia`, y faltaba normalización de `VieneDe` y `Oficina` en `EstadoJuridicoRdPaddleMapper.cs`.
- **Mejoras implementadas:**
  1. Test unitario TDD `VerificarCatastroAsync_ShouldReturn100PercentMatch_ForEstadoJuridicoMock` en `GobernanzaCatastroMatchTests.cs`.
  2. Inserción del registro mock en `AppDbContextSeeder.cs` y en la base de datos activa de SQL Server.
  3. Adición de `municipio` y fallback de `provincia` en `EstadoJuridicoExtractionCard.tsx`.
  4. Normalizaciones canónicas en `EstadoJuridicoRdPaddleMapper.cs` para `VieneDe`, `Oficina` y fechas.
  5. Soporte de `DocumentType.CertificacionEstadoJuridico` en `mapDocumentToVerificationPayload` (`mapper.ts`).

---

## Sesión 2026-08-20 — Corrección TDD Validación Catastro Título (100% Match & Resiliencia)

**Ciclo:** Gobernanza de Datos / Validación Catastro Título (`GobernanzaDeDatosService.cs`, `AppDbContextSeeder.cs`, `SharedFieldNormalizer.cs`, `CertificadoTituloRdPaddleMapper.cs`, `mapper.ts`)
**Estado:** ✅ COMPLETO — 100% Verde en TDD (`GobernanzaCatastroMatchTests.cs`), 100% Verde en E2E Playwright (`ocr-certificado-titulo-extraction.spec.ts` 1 passed, 20.1s).
- **Causa Raíz Solucionada:** El match se quedaba en 0% / 85% debido a falta de normalización de diacríticos (`San Pedro de Macorís` vs `San Pedro de Macoris`), separadores de miles en superficie (`1,183.36`), fechas OCR con palabras concatenadas (`el16/07/2015`), puntuación de `VieneDe` (`F.414, X.85`) y discrepancia de alias en `mapper.ts`.
- **Mejoras implementadas:**
  1. Test unitario TDD en `GobernanzaCatastroMatchTests.cs` cubriendo los datos mock provistos por el usuario y el fixture `TP_0001.pdf`.
  2. Implementación de `NormalizeDiacritics`, `CompareDate` (con lookaround regex y soporte multi-formato), `CompareSuperficie` y `CompareStr` en `GobernanzaDeDatosService.cs`.
  3. Seeder de base de datos `AppDbContextSeeder.cs` (`SeedCatastroTitulosAsync`) con ambos títulos de prueba persistidos.
  4. Robustecimiento de `NormalizeFecha` en `SharedFieldNormalizer.cs` y orden de etiquetas de formulario en `CertificadoTituloRdPaddleMapper.cs`.
  5. Sincronización de `getValidationStatus` en frontend `mapper.ts` con normalización diacrítica y prioridad de `failedFields`.
  6. Prueba E2E en Playwright validando la extracción de los 8 campos y la retroalimentación de UI con *“Validación Exitosa”* y *“100% Match”*.
