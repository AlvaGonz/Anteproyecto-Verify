DECLARE @ConsultorId UNIQUEIDENTIFIER = '88B87C33-F6CF-4894-B3EB-CB8CC9E77117';
DECLARE @ProfesionalId UNIQUEIDENTIFIER = '25E985B6-BC37-4066-8B1E-BEC65B24CA31';
DECLARE @EmpresaId UNIQUEIDENTIFIER = 'F76776F8-D006-4602-A1DC-66D8A668F123';
DECLARE @CorporativoId UNIQUEIDENTIFIER = '72B0AB9C-2949-4EC6-8F23-B88AE52E5305';
DECLARE @FreemiumId UNIQUEIDENTIFIER = '326FAF88-E748-4F08-80EC-98BF3A475766';
DECLARE @AdminId UNIQUEIDENTIFIER = 'B970D5A8-2B17-499B-AA7C-5E27501D47AF';

DECLARE @PublicadoId UNIQUEIDENTIFIER = (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = 'PUBLICADO');

-- 1. Consultor: Keep 1 (prioritize Publicado), move rest to Corporativo
WITH RankedConsultor AS (
    SELECT IdProyecto,
           ROW_NUMBER() OVER(ORDER BY CASE WHEN EstadoId = @PublicadoId THEN 0 ELSE 1 END, CreatedAtUtc DESC) as rn
    FROM ProyectosInmobiliarios
    WHERE IdUsuario = @ConsultorId
)
UPDATE ProyectosInmobiliarios
SET IdUsuario = @CorporativoId
WHERE IdProyecto IN (SELECT IdProyecto FROM RankedConsultor WHERE rn > 1);

-- 2. Profesional: Keep 5 (try to get 1 of each status), move rest to Corporativo
WITH RankedProfesional AS (
    SELECT IdProyecto,
           ROW_NUMBER() OVER(PARTITION BY EstadoId ORDER BY CreatedAtUtc DESC) as rn_status,
           ROW_NUMBER() OVER(ORDER BY CreatedAtUtc DESC) as rn_global
    FROM ProyectosInmobiliarios
    WHERE IdUsuario = @ProfesionalId
),
SelectedProfesional AS (
    SELECT IdProyecto,
           ROW_NUMBER() OVER(ORDER BY rn_status, rn_global) as final_rn
    FROM RankedProfesional
)
UPDATE ProyectosInmobiliarios
SET IdUsuario = @CorporativoId
WHERE IdProyecto IN (SELECT IdProyecto FROM SelectedProfesional WHERE final_rn > 5)
  AND IdUsuario = @ProfesionalId;

-- 3. Empresa: Keep 10 (prioritize INTERES), move rest to Corporativo
WITH RankedEmpresa AS (
    SELECT p.IdProyecto,
           ROW_NUMBER() OVER(
               ORDER BY CASE WHEN pi.Id IS NOT NULL THEN 0 ELSE 1 END, p.CreatedAtUtc DESC
           ) as rn
    FROM ProyectosInmobiliarios p
    LEFT JOIN ProyectoInteres pi ON p.IdProyecto = pi.ProjectId AND pi.InterestedUserId = @AdminId
    WHERE p.IdUsuario = @EmpresaId
)
UPDATE ProyectosInmobiliarios
SET IdUsuario = @CorporativoId
WHERE IdProyecto IN (SELECT IdProyecto FROM RankedEmpresa WHERE rn > 10);

-- 4. Move 30 projects from Corporativo to Freemium
WITH CorporativoProjects AS (
    SELECT TOP (30) IdProyecto
    FROM ProyectosInmobiliarios
    WHERE IdUsuario = @CorporativoId
    ORDER BY CreatedAtUtc DESC
)
UPDATE ProyectosInmobiliarios
SET IdUsuario = @FreemiumId
WHERE IdProyecto IN (SELECT IdProyecto FROM CorporativoProjects);
