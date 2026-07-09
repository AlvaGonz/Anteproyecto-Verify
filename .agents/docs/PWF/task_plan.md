# Debug Session: /#/dashboard crash

## SÍNTOMA
Luego de un checkout de Stripe exitoso, la aplicación redirige a `/#/dashboard` pero presenta una pantalla de "Error en la aplicacion" (ErrorBoundary) sin mostrar un stack trace claro en la consola del navegador.

## PLAN

1. **Investigar el ErrorBoundary**: Localizar dónde se renderiza "Error en la aplicacion" para entender qué capa está atrapando el error (Global o por Ruta).
2. **Investigar la ruta `/dashboard`**: Identificar el componente que se renderiza en `/dashboard`.
3. **Analizar el componente Dashboard**: Ver qué queries, hooks o estado podría estar fallando al regresar de Stripe (posiblemente falta de datos, estado inconsistente, o error al leer parámetros de la URL).
4. **Fix**: Aplicar el arreglo con enfoque "Ponytail" (el cambio más pequeño posible que resuelva el root cause).
5. **Verificación**: Asegurar que pase `npm run lint` y los tests.

- [x] Phase 1 - RED (Failing Tests)
- [x] Phase 2 - GREEN (Implementation)
- [x] Phase 3 - Portal & Refactor
- [x] Verification
