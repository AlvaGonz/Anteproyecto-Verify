SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF OBJECT_ID('tempdb..#ToDelete') IS NOT NULL DROP TABLE #ToDelete;
CREATE TABLE #ToDelete (IdProyecto UNIQUEIDENTIFIER, IdUsuario UNIQUEIDENTIFIER);

-- Insert projects to delete
INSERT INTO #ToDelete
SELECT IdProyecto, IdUsuario FROM (
  SELECT p.IdProyecto, p.IdUsuario, ROW_NUMBER() OVER(PARTITION BY p.IdUsuario ORDER BY p.CreatedAtUtc DESC) as rn
  FROM ProyectosInmobiliarios p
  JOIN Usuario u ON p.IdUsuario = u.IdUsuario
  WHERE u.Email = 'consultor@verifinca.do'
) t WHERE rn > 5;

INSERT INTO #ToDelete
SELECT IdProyecto, IdUsuario FROM (
  SELECT p.IdProyecto, p.IdUsuario, ROW_NUMBER() OVER(PARTITION BY p.IdUsuario ORDER BY p.CreatedAtUtc DESC) as rn
  FROM ProyectosInmobiliarios p
  JOIN Usuario u ON p.IdUsuario = u.IdUsuario
  WHERE u.Email = 'profesional@verifinca.do'
) t WHERE rn > 15;

INSERT INTO #ToDelete
SELECT IdProyecto, IdUsuario FROM (
  SELECT p.IdProyecto, p.IdUsuario, ROW_NUMBER() OVER(PARTITION BY p.IdUsuario ORDER BY p.CreatedAtUtc DESC) as rn
  FROM ProyectosInmobiliarios p
  JOIN Usuario u ON p.IdUsuario = u.IdUsuario
  WHERE u.Email = 'empresa@verifinca.do'
) t WHERE rn > 40;

INSERT INTO #ToDelete
SELECT IdProyecto, IdUsuario FROM (
  SELECT p.IdProyecto, p.IdUsuario, ROW_NUMBER() OVER(PARTITION BY p.IdUsuario ORDER BY p.CreatedAtUtc DESC) as rn
  FROM ProyectosInmobiliarios p
  JOIN Usuario u ON p.IdUsuario = u.IdUsuario
  WHERE u.Email = 'corporativo@verifinca.do'
) t WHERE rn > 60;

-- Delete from all dependent tables
DELETE FROM Certificaciones WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM Validaciones WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM Hallazgos WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM LogProyectos WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM ProyectoGuardado WHERE ProjectId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM ProyectoInteres WHERE ProjectId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM Auditorias WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM DeteccionesDuplicidad WHERE ProyectoDuplicadoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM DeteccionesDuplicidad WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM Documentos WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM Reportes WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM ProyectoValidacionDescargo WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM ResultadosCrediticios WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM SellosIntegridad WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM ValidacionesAyuntamiento WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM DatoValidado WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM ValidacionesDgii WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);
DELETE FROM AlertasValidacion WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDelete);

-- Delete projects
DELETE FROM ProyectosInmobiliarios WHERE IdProyecto IN (SELECT IdProyecto FROM #ToDelete);

-- Delete projects from extra users not in the main 4 accounts
IF OBJECT_ID('tempdb..#ToDeleteExt') IS NOT NULL DROP TABLE #ToDeleteExt;
CREATE TABLE #ToDeleteExt (IdProyecto UNIQUEIDENTIFIER);
INSERT INTO #ToDeleteExt
SELECT p.IdProyecto 
FROM ProyectosInmobiliarios p 
JOIN Usuario u ON p.IdUsuario = u.IdUsuario 
WHERE u.Email NOT IN ('consultor@verifinca.do', 'profesional@verifinca.do', 'empresa@verifinca.do', 'corporativo@verifinca.do');

DELETE FROM Certificaciones WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM Validaciones WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM Hallazgos WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM LogProyectos WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ProyectoGuardado WHERE ProjectId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ProyectoInteres WHERE ProjectId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM Auditorias WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM DeteccionesDuplicidad WHERE ProyectoDuplicadoId IN (SELECT IdProyecto FROM #ToDeleteExt) OR ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM Documentos WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM Reportes WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ProyectoValidacionDescargo WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ResultadosCrediticios WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM SellosIntegridad WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ValidacionesAyuntamiento WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM DatoValidado WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ValidacionesDgii WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM AlertasValidacion WHERE ProyectoId IN (SELECT IdProyecto FROM #ToDeleteExt);
DELETE FROM ProyectosInmobiliarios WHERE IdProyecto IN (SELECT IdProyecto FROM #ToDeleteExt);

-- Update user counts
UPDATE u SET ProyectosCreados = 5 FROM Usuario u WHERE Email = 'consultor@verifinca.do';
UPDATE u SET ProyectosCreados = 15 FROM Usuario u WHERE Email = 'profesional@verifinca.do';
UPDATE u SET ProyectosCreados = 40 FROM Usuario u WHERE Email = 'empresa@verifinca.do';
UPDATE u SET ProyectosCreados = 60 FROM Usuario u WHERE Email = 'corporativo@verifinca.do';

SELECT 'Cleanup completed.' as Status;
GO
