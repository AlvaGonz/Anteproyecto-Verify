# PWF Progress — VeriFinca

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
