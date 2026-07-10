# Debug Session: Google Login 500 Error - Invalid column name CancelAt

## SÍNTOMA
Cuando se intenta iniciar sesión con Google OAuth, el backend arroja un error 500 Internal Server Error.
Los logs del backend indican: `SqlException: Invalid column name 'CancelAt'. Invalid column name 'CancelAtPeriodEnd'.` en `UsuarioRepository.GetByEmailAsync`.

## PLAN
1. **Verificar el Modelo vs Base de Datos**: Identificar por qué `CancelAt` y `CancelAtPeriodEnd` están en la entidad `Usuario.cs` pero no en la base de datos local.
2. **Crear / Aplicar Migración**: Generar la migración de EF Core para agregar estas dos columnas (y cualquier otra de Stripe que falte y esté mapeada) a la tabla `Usuario`.
3. **Validación de la Base de Datos**: Ejecutar las migraciones y confirmar con el MCP (o herramienta similar) que las columnas existen.
4. **Verificación**: Intentar de nuevo el login y comprobar que ya no ocurre el error 500.

- [x] Paso 1: Verificar el modelo
- [x] Paso 2: Generar y aplicar migración EF Core
- [x] Paso 3: Validar
