DECLARE @ConsultorId UNIQUEIDENTIFIER = '8EECEFD7-2474-4E86-A01F-BB8E80322610';
DECLARE @ProfesionalId UNIQUEIDENTIFIER = '0545DAAD-6B46-4AE9-8FCD-5D6F87846F55';
DECLARE @EmpresaId UNIQUEIDENTIFIER = '4DE35F9B-4E94-4C6B-A704-DC496B98997F';
DECLARE @CorporativoId UNIQUEIDENTIFIER = 'F853C4F0-EF4A-4AB1-8065-2E3EB1092865';
DECLARE @AdminId UNIQUEIDENTIFIER = '2EA184A5-70ED-49D6-AC20-9DA492A711FA';

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
