# debug-session

Síntoma: GET http://localhost:5000/api/projects 500 (Internal Server Error)
Archivo donde ocurre: `useProjects.ts` / `ProjectsController.cs`

## Pasos

- [x] PASO 0: Inicializar archivos de planificación.
- [x] PASO 1: Consult brain (skip no brain service)
- [x] PASO 2: Analizar stack trace.
    - Error: `Microsoft.Data.SqlClient.SqlException (0x80131904): Invalid column name 'ImagenUrl'.`
    - Causa: La migración EF Core `20260629151626_Add_ImagenUrl_To_Proyecto` no fue aplicada en la BD porque `Program.cs` se salta las migraciones si la BD ya fue creada por un script externo y levanta error `2714` al intentar inicializar `__EFMigrationsHistory`.
- [x] PASO 3: Generar fix.
    - Solución: Se inyectó directamente el esquema SQL `ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenUrl] NVARCHAR(2048) NULL;` en el contenedor de SQL Server (`anteproyecto-verify-sqlserver-1`).
- [x] PASO 4: Actualizar cerebro.
    - Se agregará al response de la tarea.
