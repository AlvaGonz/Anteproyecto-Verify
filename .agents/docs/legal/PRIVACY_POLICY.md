# Política de Privacidad (Privacy Policy)
v1.1.0 — Updated: 2026-06-22

## 1. Datos que Recopilamos (Data We Collect)

| Categoría | Datos Específicos | Base Legal |
|---|---|---|
| **Identidad** | Cédula Nacional / RNC (Tax ID) | Ley 172-13 Art. 13, consentimiento informado |
| **Ubicación** | Coordenadas GPS, dirección del proyecto | Contrato de servicios |
| **Financieros** | Historial crediticio del desarrollador (consulta a TransUnion con consentimiento expreso) | Ley 172-13 Art. 8 |
| **Documental** | PDFs subidos: títulos de propiedad, planos, permisos, cartas de ventas | Ejecución del contrato |
| **Firma Digital**| Certificados emitidos bajo el Sello de Integridad QR | Ley 126-02 |
| **Biometría (Proxy)** | Documento de identidad gubernamental subido para validación | Consentimiento explícito |
| **Uso/Analíticas**| Páginas vistas, duración de sesión, registros de errores | Interés legítimo |
| **Pagos** | Últimos 4 dígitos de tarjeta, dirección de facturación (Stripe tokeniza los datos completos) | Contrato (PCI-DSS Stripe Level 1) |

## 2. Cookies que Utilizamos (Cookies We Use)

| Nombre de Cookie | Tipo | Propósito | Duración |
|---|---|---|---|
| `vf_session` | Estrictamente Necesaria | Token de sesión de autenticación (HttpOnly, Secure, SameSite=Strict) | Sesión |
| `vf_csrf` | Estrictamente Necesaria | Protección contra falsificación de peticiones en sitios cruzados (CSRF) | Sesión |
| `vf_consent` | Estrictamente Necesaria | Registro de consentimiento de cookies | 12 meses |
| `vf_lang` | Funcional | Preferencia de idioma (es/en) | 12 meses |
| `_analytics_id` | Analíticas (opt-in) | Seguimiento agregado de uso (sin información de identificación personal PII) | 6 meses |
| `stripe_mid` | De terceros (Stripe) | Prevención de fraude en pagos | 12 meses |

## 3. Divulgación sobre Inteligencia Artificial / OCR (AI/OCR Disclosure)

- VeriFinca utiliza un **Motor de Reconocimiento Óptico de Caracteres (OCR)** para extraer texto de los documentos PDF subidos (títulos de propiedad, permisos, declaraciones legales).
- Un **modelo de clasificación de IA/Machine Learning** analiza el texto extraído para detectar: campos obligatorios faltantes, fechas inconsistentes, firmas sospechosas e indicadores de alteración documental.
- **Ningún documento subido se comparte con proveedores de IA de terceros.** El procesamiento ocurre exclusivamente en la infraestructura propia de VeriFinca (entorno de nube Microsoft Azure).
- El análisis de IA genera un puntaje de confianza y alertas. **La decisión final de verificación es siempre supervisada por un ser humano** (validador certificado de VeriFinca) antes de la emisión del Sello de Integridad.
- Los usuarios tienen derecho a solicitar la revisión humana de cualquier decisión impulsada por IA, conforme a la Ley 172-13 y el Art. 22 del GDPR.

## 4. Notificación de Brechas de Seguridad (Breach Notification)

- Bajo la normativa **FTC Safeguards Rule 16 CFR Part 314.4(j)**: VeriFinca notificará a la FTC de forma electrónica en un plazo **no mayor a 30 días** tras descubrir una brecha que involucre la información no encriptada de 500 o más consumidores.
- Los usuarios afectados serán notificados en un plazo máximo de **72 horas**, de conformidad con el Art. 33 del GDPR y las mejores prácticas internacionales.
