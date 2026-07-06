# ADR-009: Estrategia de Certificación Verificable Básica

## Estado
Aceptado

## Contexto
El sistema requiere emitir una constancia de validación para los proyectos inmobiliarios. Esta constancia debe ser verificable públicamente mediante un código único y un código QR. Sin embargo, en esta fase del proyecto (MVP), no se cuenta con integración a una Autoridad de Certificación (CA) ni a un Proveedor de Servicios de Certificación (PSC) habilitado por el INDOTEL en República Dominicana para emitir firmas digitales con validez jurídica plena (Ley 126-02).

## Decisión
1.  **Certificación Informativa:** Se implementa una certificación verificable **básica e informativa**. Esta certificación vincula el resultado de la validación (score y semáforo de integridad) con un código único generado por el sistema.
2.  **Código Único:** Se utilizará un generador de códigos criptográficamente seguros (CSPRNG) para crear códigos alfanuméricos únicos y no predecibles con el formato `VF-YYYY-XXXXXXXX`.
3.  **Generación de QR:** La generación del código QR se delega al **frontend** (client-side) utilizando una librería estándar de React. El backend proveerá la URL de verificación. Esto simplifica la arquitectura del backend al no requerir librerías de manipulación de imágenes (como `System.Drawing.Common`, que tiene limitaciones multiplataforma en .NET).
4.  **Constancia Descargable:** Se generará una vista imprimible en el frontend (HTML a PDF vía navegador) para la constancia básica, evitando dependencias pesadas de generación de PDF en el servidor por el momento.
5.  **Aviso Legal:** Toda constancia emitida incluirá obligatoriamente el aviso: *"Constancia informativa. No sustituye documentación legal oficial."*

## Consecuencias
*   **Positivas:** Implementación rápida, arquitectura ligera, cumple con el requisito de transparencia y verificabilidad del MVP sin incurrir en costos o complejidades legales prematuras.
*   **Negativas:** El documento generado no tiene fuerza probatoria legal por sí mismo.
*   **Acción Futura Obligatoria:** Antes de lanzar el portal público completo (Bloque 10) o de comercializar el sistema como fuente de verdad legal, se debe tomar una **DECISIÓN HUMANA OBLIGATORIA** con asesoría legal para implementar firma electrónica simple (Art. 8 Ley 126-02) o contratar un PSC para firma digital avanzada.
