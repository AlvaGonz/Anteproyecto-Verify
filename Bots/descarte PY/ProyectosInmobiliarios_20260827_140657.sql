-- ============================================================================
-- ProyectosInmobiliarios - Reasignacion de proyectos a cuentas de prueba
-- Generado: 2026-08-27 14:06:57
-- Reparto objetivo (120 proyectos):
--   Consultor   (2BC69554-6440-4B0E-A9B5-18757599EE1C) :  1 (PUBLICADO)
--   Profesional (EE7DAFEA-A030-4959-A55E-4C40DBBE91A7) :  5 (1 por cada estatus)
--   Empresa     (09E58353-1699-45B6-8275-EBE259250170) : 10 (al azar)
--   Corporativo (8B5288AF-FF7B-41C1-9E6A-FCE656831EAA) : 73 (resto despues de Freemium)
--   Freemium    (FBC9BA82-5E4C-4EBF-98A1-FCA54900E106) : 31 (los que quedan)
-- ============================================================================
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRAN;

-- IDs de usuario
DECLARE @ConsultorId   UNIQUEIDENTIFIER = '2BC69554-6440-4B0E-A9B5-18757599EE1C';
DECLARE @ProfesionalId UNIQUEIDENTIFIER = 'EE7DAFEA-A030-4959-A55E-4C40DBBE91A7';
DECLARE @EmpresaId     UNIQUEIDENTIFIER = '09E58353-1699-45B6-8275-EBE259250170';
DECLARE @CorporativoId UNIQUEIDENTIFIER = '8B5288AF-FF7B-41C1-9E6A-FCE656831EAA';
DECLARE @FreemiumId    UNIQUEIDENTIFIER = 'FBC9BA82-5E4C-4EBF-98A1-FCA54900E106';

-- IDs de estatus
DECLARE @EstCreado      UNIQUEIDENTIFIER = (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = 'CREADO');
DECLARE @EstEditado     UNIQUEIDENTIFIER = (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = 'EDITADO');
DECLARE @EstRevision    UNIQUEIDENTIFIER = (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = 'REVISION');
DECLARE @EstPublicado   UNIQUEIDENTIFIER = (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = 'PUBLICADO');
DECLARE @EstObservacion UNIQUEIDENTIFIER = (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = 'OBSERVACION');

IF OBJECT_ID('tempdb..#Target') IS NOT NULL DROP TABLE #Target;
CREATE TABLE #Target (
    IdProyecto UNIQUEIDENTIFIER PRIMARY KEY,
    IdUsuario  UNIQUEIDENTIFIER NOT NULL,
    SetStatus  UNIQUEIDENTIFIER NULL          -- nuevo EstadoId (NULL = no cambiar)
);

-- ---------------------------------------------------------------
-- 1) Profesional: 1 proyecto por cada estatus existente
--    (CREADO, EDITADO, REVISION, PUBLICADO)
-- ---------------------------------------------------------------
INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 1 IdProyecto, @ProfesionalId
FROM ProyectosInmobiliarios
WHERE EstadoId = @EstCreado
ORDER BY CreatedAtUtc DESC;

INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 1 IdProyecto, @ProfesionalId
FROM ProyectosInmobiliarios
WHERE EstadoId = @EstEditado
ORDER BY CreatedAtUtc DESC;

INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 1 IdProyecto, @ProfesionalId
FROM ProyectosInmobiliarios
WHERE EstadoId = @EstRevision
ORDER BY CreatedAtUtc DESC;

INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 1 IdProyecto, @ProfesionalId
FROM ProyectosInmobiliarios
WHERE EstadoId = @EstPublicado
ORDER BY CreatedAtUtc DESC;

-- 5to proyecto del Profesional: se convierte a OBSERVACION
INSERT INTO #Target (IdProyecto, IdUsuario, SetStatus)
SELECT TOP 1 IdProyecto, @ProfesionalId, @EstObservacion
FROM ProyectosInmobiliarios
WHERE IdProyecto NOT IN (SELECT IdProyecto FROM #Target)
ORDER BY CreatedAtUtc DESC;

-- ---------------------------------------------------------------
-- 2) Consultor: 1 proyecto PUBLICADO
-- ---------------------------------------------------------------
INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 1 IdProyecto, @ConsultorId
FROM ProyectosInmobiliarios
WHERE EstadoId = @EstPublicado
  AND IdProyecto NOT IN (SELECT IdProyecto FROM #Target)
ORDER BY CreatedAtUtc DESC;

-- ---------------------------------------------------------------
-- 3) Empresa: 10 proyectos al azar
-- ---------------------------------------------------------------
INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 10 IdProyecto, @EmpresaId
FROM ProyectosInmobiliarios
WHERE IdProyecto NOT IN (SELECT IdProyecto FROM #Target)
ORDER BY NEWID();

-- ---------------------------------------------------------------
-- 4) Freemium: 31 proyectos (los que quedan despues del reparto)
-- ---------------------------------------------------------------
INSERT INTO #Target (IdProyecto, IdUsuario)
SELECT TOP 31 IdProyecto, @FreemiumId
FROM ProyectosInmobiliarios
WHERE IdProyecto NOT IN (SELECT IdProyecto FROM #Target)
ORDER BY CreatedAtUtc DESC;

-- ---------------------------------------------------------------
-- 5) Aplicar la reasignacion
--    (Corporativo conserva automaticamente los 73 restantes)
-- ---------------------------------------------------------------
UPDATE p
SET p.IdUsuario = t.IdUsuario,
    p.EstadoId  = ISNULL(t.SetStatus, p.EstadoId)
FROM ProyectosInmobiliarios p
JOIN #Target t ON p.IdProyecto = t.IdProyecto;

-- ---------------------------------------------------------------
-- 6) Sincronizar contador de proyectos creados por usuario
-- ---------------------------------------------------------------
UPDATE Usuario SET ProyectosCreados = (SELECT COUNT(*) FROM ProyectosInmobiliarios WHERE IdUsuario = @ConsultorId)   WHERE IdUsuario = @ConsultorId;
UPDATE Usuario SET ProyectosCreados = (SELECT COUNT(*) FROM ProyectosInmobiliarios WHERE IdUsuario = @ProfesionalId) WHERE IdUsuario = @ProfesionalId;
UPDATE Usuario SET ProyectosCreados = (SELECT COUNT(*) FROM ProyectosInmobiliarios WHERE IdUsuario = @EmpresaId)     WHERE IdUsuario = @EmpresaId;
UPDATE Usuario SET ProyectosCreados = (SELECT COUNT(*) FROM ProyectosInmobiliarios WHERE IdUsuario = @CorporativoId) WHERE IdUsuario = @CorporativoId;
UPDATE Usuario SET ProyectosCreados = (SELECT COUNT(*) FROM ProyectosInmobiliarios WHERE IdUsuario = @FreemiumId)    WHERE IdUsuario = @FreemiumId;

-- ---------------------------------------------------------------
-- Verificacion
-- ---------------------------------------------------------------
SELECT 'Reparto por usuario' AS Titulo;
SELECT u.Email,
       COUNT(p.IdProyecto) AS Proyectos
FROM Usuario u
LEFT JOIN ProyectosInmobiliarios p ON p.IdUsuario = u.IdUsuario
WHERE u.Email IN ('consultor@verifinca.do','profesional@verifinca.do','empresa@verifinca.do','corporativo@verifinca.do','freemium@verifinca.do')
GROUP BY u.Email
ORDER BY u.Email;

SELECT 'Estatus del profesional' AS Titulo;
SELECT e.CodigoUnico, e.Nombre, COUNT(*) AS N
FROM ProyectosInmobiliarios p
JOIN ProyectosEstados e ON p.EstadoId = e.Id
WHERE p.IdUsuario = @ProfesionalId
GROUP BY e.CodigoUnico, e.Nombre
ORDER BY e.Nombre;

COMMIT TRAN;
