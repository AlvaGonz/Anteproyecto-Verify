# Matriz de Verificación y Cumplimiento (Verification Matrix)

## Objetivo
Documentar los requisitos de verificación y la matriz de cumplimiento aplicable a los diferentes tipos de proyectos inmobiliarios manejados por **VeriFinca**, garantizando la alineación con los objetivos específicos (OE-1 a OE-7) del proyecto de grado.

---

## 1. Categorías de Proyectos (tabla `CategoriaProyecto`)
El sistema clasifica los proyectos según la tabla `CategoriaProyecto` (16 categorías, `CategoriaId` 1-16):
- **1 ALBERGUES**
- **2 ALMACENES**
- **3 APARTAMENTOS**
- **4 CENTROS DE RECREACIÓN Y DEPORTES**
- **5 CENTROS DE SALUD**
- **6 COLEGIOS Y CENTROS EDUCATIVOS**
- **7 COMBINADOS**
- **8 COMERCIAL Y OFICINAS**
- **9 DEPÓSITOS**
- **10 ESTACIÓN DE COMBUSTIBLE**
- **11 ESTRUCTURAS ESPECIALES**
- **12 HOSPEDAJE**
- **13 OBRAS DE ORDEN SOCIAL**
- **14 PARQUEOS**
- **15 SERVICIOS DE TRANSPORTE**
- **16 VIVIENDAS**

## 2. Documentación Requerida por Categoría (OE-1)

| Documento (DocumentType) | Residencial | Comercial | Turístico | Mixto | Industrial |
|:---|:---:|:---:|:---:|:---:|:---:|
| `CertificadoTitulo` | **Req** | **Req** | **Req** | **Req** | **Req** |
| `CertificacionEstadoJuridico` | **Req** | **Req** | **Req** | **Req** | **Req** |
| `PlanoMensuraCatastral` | **Req** | **Req** | **Req** | **Req** | **Req** |
| `PlanosArquitectonicos` | **Req** | **Req** | **Req** | **Req** | **Req** |
| `PermisoConstruccion` | **Req** | **Req** | **Req** | **Req** | **Req** |
| `CertificadoUsoSuelo` | **Req** | **Req** | **Req** | **Req** | **Req** |
| `CertificacionIPI` (DGII) | **Req** | **Req** | **Req** | **Req** | **Req** |
| `RegistroMercantil` / `RNC` | Opc | **Req** | **Req** | **Req** | **Req** |
| `CertificadoEIA` (Medio Ambiente)| Opc | Opc | **Req** | **Req** | **Req** |
| `NoObjecionINAPACAASD` | Opc | **Req** | **Req** | **Req** | **Req** |
| `EstadosFinancieros` | Opc | Opc | **Req** | Opc | **Req** |

*(Req = Requerido, Opc = Opcional)*

---

## 3. Matriz de Validación de Sistemas Externos (OE-2)

La plataforma VeriFinca automatiza la verificación contra entidades externas basándose en los datos provistos.

| Tipo de Validación | Fuente / Integración | Entidad de Dominio / Datos | Regla de Negocio (StitchMCP) |
|:---|:---|:---|:---|
| **Identidad Comercial** | DGII | `RncDesarrollador`, `CedulaRncPropietario` | El RNC debe estar activo y coincidir con el Propietario/Desarrollador. |
| **Propiedad / Titulación** | Registro Inmobiliario (RI) | `Matricula` | La matrícula debe ser válida, sin cargas u oposiciones ocultas. |
| **Territorial / Catastral** | Catastro Nacional | `DesignacionCatastral`, `UbicacionGps` | La designación debe existir y las coordenadas deben corresponder (OE-5). |
| **Impuestos (IPI)** | DGII | `Ipi` | La propiedad debe estar al día con el Impuesto al Patrimonio Inmobiliario. |
| **Historial Crediticio** | TransUnion | `CedulaRncPropietario` | Requiere consentimiento explícito (Ley 172-13). Purga a los 30 días post-sello (OE-6). |

---

## 4. Reglas de Prevención de Estafas (Guards)

1. **Detección de Duplicidades (OE-3)**
   - El sistema debe bloquear el registro de un proyecto si la `Matricula` o la `DesignacionCatastral` ya existe en otro proyecto en estado `Draft` o superior.
2. **Alertas de Inconsistencia (OE-4)**
   - Si el `Propietario` extraído del OCR (Document Intelligence) no coincide con el registrado en el formulario (o RNC en DGII), se genera un flag/alerta.
3. **Bloqueo Legal (OE-6)**
   - **Absoluto:** Nunca procesar datos crediticios de TransUnion sin validación de la firma en `ConsentRecord.ConsentVersion` (Plantilla Actual).
4. **Emisión de Sello de Integridad (OE-7)**
   - El Sello (QR y Firma Digital) solo puede ser emitido (Estado de Integridad = `Valid`) si **todas** las validaciones requeridas según la categoría alcanzan el estado `PASS` y no hay alertas críticas pendientes.

---

## 5. Control de Cambios
- Las reglas documentadas aquí deben mapearse a validadores en `VeriFinca.Application/Validators`.
- Cualquier modificación en la lista de documentos obligatorios o requerimientos API se considera un "Type 1 Decision" (Ver `AGENTS.md`).
