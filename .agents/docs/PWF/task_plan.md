# Debug Session: 404 Not Found on /api/projects/{id}/validations/result

## SÍNTOMA
El frontend reporta un error 404 al intentar obtener los resultados de validación de un proyecto:
`GET http://localhost:5000/api/projects/e0a95362-fd62-4b6c-91e8-6255b16c0fcf/validations/result 404 (Not Found)`
El componente frontend involucrado es `useValidations.ts`.

## LÍMITES DE PONYTAIL (Lazy Senior)
- **YAGNI**: No crear nuevas abstracciones, controladores, ni middlewares si no es necesario.
- **Root Cause**: Buscar por qué la ruta `api/projects/{id}/validations/result` devuelve 404. ¿El nombre del endpoint cambió? ¿La ruta en el frontend está mal? ¿El controlador no tiene el endpoint?
- **Shortest diff**: Arreglar la ruta en el frontend o agregar el atributo de ruta faltante en el controlador del backend.

## PLAN
1. **Buscar la ruta en el Frontend**: Encontrar dónde se hace la petición en el frontend (`useValidations.ts` / `validations.api.ts`).
2. **Buscar el controlador en el Backend**: Buscar en `src/backend/Api/Controllers/` la ruta que maneje resultados de validaciones. Comparar la ruta mapeada con la solicitada.
3. **Corregir**: Alinear el frontend con la ruta real del backend o arreglar el backend si le falta el endpoint, manteniendo la convención de `api-contract.md`.
4. **Verificar**: Construir/testear.

- [x] Buscar la ruta en Frontend
- [x] Buscar la ruta en Backend
- [x] Implementar la corrección
- [x] Verificar
