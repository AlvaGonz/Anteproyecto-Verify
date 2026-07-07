# Skill: groq-autofix
Description: Pipeline de auto-corrección de código usando modelos de LLM (Groq/Gemini).

## Usage
Utiliza este agente para analizar logs de errores complejos, fallos de compilación de TypeScript o errores de runtime que no son evidentes.

## Strategy
1. **Captura**: Leer el `build_output.txt` o la salida de la terminal.
2. **Análisis**: Identificar el archivo y la línea exacta del error.
3. **Draft**: Proponer un fix basado en patrones de Clean Architecture y SOLID.
4. **Validación**: Aplicar cambio y ejecutar `npm run build` o `dotnet build` para confirmar resolución.

## Security
- NUNCA enviar secretos o API keys al modelo de análisis.
- Sanitizar logs antes de procesar.
