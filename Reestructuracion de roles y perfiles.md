# Documento de Arquitectura de Permisos y Funcionalidades por Rol

## Bloque 0: Introducción y Conceptos Generales

El sistema opera bajo un modelo de suscripciones con cuatro niveles: **Consulta (Free)**, **Profesional**, **Empresa** y **Enterprise**.  
Todos los usuarios comparten una base funcional común (gestión de perfil, carga de documentos, dashboards personalizados).  
Los límites de uso, la complejidad de las herramientas y el acceso a módulos avanzados varían según el plan contratado.

Este documento detalla, con precisión técnica, qué puede hacer cada tipo de usuario en cada módulo, así como las estructuras de datos, flujos de interacción y reglas de negocio que lo sustentan.

---

## Bloque 1: Rol Super Administrador (Owner)

El **Owner** es la máxima autoridad. No está sujeto a límites de suscripción y posee control total sobre la plataforma, usuarios y datos.  
Su interfaz se organiza en pestañas: **Configuración**, **Dashboard**, **Expedientes** y **Búsquedas**.

### 1.1 Pestañas de Configuración (Settings)

Exclusivas del admin. Se dividen en tres subpestañas.

#### 1.1.1 Perfil del Usuario (Propietario)

El superadmin puede editar su información personal de manera idéntica a cualquier usuario.

- **Campos editables**: Nombre, Apellido, Correo electrónico, Número de teléfono.
- **Foto de perfil**:
  - Se muestra un círculo con la imagen actual o un placeholder genérico.
  - **Hover**: aparece una franja translúcida que ocupa el 20% inferior del círculo, deslizándose desde abajo (transición `0.3s ease`). Sobre ella, el texto “Editar” con un icono de lápiz.
  - **Click**: dispara `<input type="file" accept="image/png, image/jpeg" style="display:none">` vía JavaScript.
    - Validaciones frontend:
      - Formatos permitidos: PNG, JPG, JPEG.
      - Tamaño máximo: **5 MB**.
    - Archivo seleccionado: previsualización inmediata usando `URL.createObjectURL()`.
  - **Guardado**: al enviar el formulario, el archivo se manda al backend como `multipart/form-data`.
  - **Proceso backend**:
    1. Validar nuevamente formato y tamaño.
    2. Generar nombre único: `{user_id}_{timestamp}.{ext}`.
    3. Redimensionar la imagen a **300x300 px** (lado máximo) manteniendo proporción (ej. con Intervention Image).
    4. Almacenar en `storage/avatars/` (disco local o S3).
    5. Guardar la URL pública en el campo `avatar_url` de la tabla `users`.
    6. Eliminar el archivo anterior si existía (opcional).
- **Estructura SQL necesaria**: agregar columna `avatar_url VARCHAR(500) NULL` en la tabla `users`.

#### 1.1.2 Usuarios y Accesos

El administrador visualiza y gestiona todos los usuarios del sistema, agrupados por tipo de suscripción.

- **Vista de nivel superior**: Cuatro bloques colapsables: **Enterprise, Empresa, Profesional, Consulta**.
  - Cada bloque muestra:
    - Resumen con el número total de usuarios en ese plan.
    - Botón “Agregar usuario” que abre un modal específico para ese plan.
  - **Lista interna desplegable**:
    - Al expandir un bloque, se muestra una barra de búsqueda/filtro que actúa sobre los usuarios de ese grupo.
    - Cada usuario se presenta en una **tarjeta compacta** con:
      - Foto de perfil miniatura.
      - Nombre, correo electrónico, teléfono.
      - **Etiquetas informativas**:
        - `Consultas restantes: X / Y` (Y = límite mensual del plan).
        - `Proyectos restantes: A / B` (límite asignado por plan).
        - `Usuarios en su grupo: 2/5` (si el plan permite multiusuario; si no, muestra `1/1`).
      - **Rol del sistema**: dropdown con etiqueta de color (Admin, Usuario normal, Consultor, según lo permitido).
      - **Plan actual**: dropdown para cambiar manualmente la suscripción (recalcula límites).
      - **Contratante**: si el usuario pertenece a un plan multiusuario (Empresa/Enterprise), se muestra nombre y correo del titular de la cuenta.
      - **Botones de acción**: Editar, Eliminar, Reenviar invitación.
- **Agregar usuario**: formulario donde el admin define nombre, correo, contraseña temporal, plan, y (si es multiusuario) lo asocia a un “grupo” bajo un titular existente. Se envían credenciales por correo.

#### 1.1.3 Perfiles y Permisos

Pestaña que permanece como está actualmente. Solo el admin puede definir y modificar los permisos granulares de cada rol del sistema (ej. publicar expedientes, gestionar documentos, etc.). No se detalla porque el alcance actual es replantear los roles por suscripción, pero sigue existiendo.

### 1.2 Dashboard Administrativo

Dividido en dos subpestañas:

1. **Dashboard de Suscripciones**
   - Tarjetas de resumen: usuarios por plan, suscripciones activas, ingresos mensuales estimados (si se integra facturación).
   - Lista de las últimas 10 suscripciones (fecha, plan, correo, estado).
2. **Dashboard de Proyectos**
   - Tarjetas con totales de proyectos en cada estado (Borrador, En revisión, Publicado, Rechazado).
   - Lista de proyectos recientes, igual al módulo de Expedientes pero en modo resumen, con enlace directo para ver/editar.

Ambas listas comparten estilo y funcionalidad, solo cambia el contenido.

### 1.3 Módulo de Expedientes (Proyectos)

Control absoluto sobre cualquier expediente.

- **Creación de expedientes**: desde cero o a partir de una búsqueda de inmueble.
- **Flujo de estados**:
  - Borrador → Pendiente de revisión → Publicado / Rechazado.
  - Solo el admin puede cambiar manualmente el estado de cualquier proyecto.
  - Transiciones controladas (ej. de Borrador a Pendiente de revisión).
- **Gestión de documentos por proyecto**:
  - Subir, visualizar, descargar y eliminar documentos **sin límite de cantidad ni almacenamiento**.
  - Tipos de documento predefinidos en `tipos_documento`:
    - `TÍTULO`: Título de Propiedad (obligatorio)
    - `ESTADO_J`: Certificación de estado jurídico (obligatorio)
    - `MENSURA`: Plano catastral aprobado
    - `CÉDULA`: Documento de identidad del titular
    - `PODER_NOTARIAL`: Poder notarial (si aplica)
    - `OTROS`
  - Cada registro en `documentos` almacena: tipo, nombre original, ruta, tamaño, tipo MIME, fecha de subida, usuario que cargó.
- **Proceso de subida de documentos (detallado)**:
  1. Usuario arrastra o selecciona archivo.
  2. Validación cliente: extensiones `.pdf, .jpg, .jpeg, .png`; tamaño ≤ **10 MB**.
  3. Confirmación: envío por AJAX con indicador de progreso.
  4. Servidor:
     - Verificar tipo MIME real y extensión.
     - Si el tipo es obligatorio y ya existe uno para ese expediente, se sobrescribe o se bloquea (regla configurable).
     - Almacenar en `storage/documentos/{expediente_id}/` con nombre único.
     - Insertar registro en tabla `documentos`.
  5. Si el plan del usuario incluye modelo LM (Enterprise/Empresa), se encola un trabajo de análisis automático (ver sección 3.5).
- **Modelo LM jurídico**: el admin activa/desactiva el servicio, entrena o ajusta el modelo pequeño basado en datos jurídicos de tierra. Ve los resultados de validación de todos los expedientes.

### 1.4 Capacidad de Búsqueda

- Consultas **ilimitadas** sin restricción de frecuencia.
- Acceso a todo el historial de títulos, reportes detallados y alertas.
- Exportación a PDF y Excel sin límite.
- Acceso completo a la API (todas las rutas).

---

## Bloque 2: Tabla Comparativa de Cuotas y Funcionalidades por Plan

| Funcionalidad / Límite               | Consulta (Free)          | Profesional (RD$3,500)        | Empresa (RD$10,000)              | Enterprise (RD$30,000)                       |
|--------------------------------------|--------------------------|-------------------------------|----------------------------------|----------------------------------------------|
| **Consultas/mes**                    | 1                        | 25                            | 100                              | Ilimitadas                                   |
| **Proyectos activos simultáneos**    | 0 (no permitido)         | 5                             | 20                               | Ilimitados                                   |
| **Usuarios secundarios (multiusuario)** | 1 (solo titular)       | 1 (solo titular)              | Hasta 5                          | Ilimitados (o 50)                            |
| **Histórico de títulos**             | No                       | Sí                            | Sí                               | Sí                                           |
| **Alertas de gravámenes**            | No                       | Sí (alertas por correo)       | Sí                               | Sí (alertas en tiempo real)                  |
| **Exportación PDF**                  | No                       | Sí                            | Sí                               | Sí                                           |
| **Exportación Excel**                | No                       | No                            | No                               | Sí                                           |
| **Acceso a API**                     | No                       | No                            | Básica (límite 500 req/día)      | Full Access (ilimitado)                      |
| **Integración CRM**                  | No                       | No                            | Sí (vía API básica)              | Sí (conectores nativos)                      |
| **Validación en lote**               | No                       | No                            | No                               | Sí                                           |
| **Modelo LM (análisis docs)**        | No                       | No                            | Sí (análisis individual)         | Sí (análisis individual + lote)              |
| **Soporte**                          | Comunidad (foro)         | Email (respuesta en 24h)      | Prioritario (respuesta 8h)       | Account Manager 24/7 + SLA 99.9%             |
| **Almacenamiento documentos**        | N/A                      | 200 MB totales                | 1 GB                             | 10 GB                                        |
| **Dashboard personalizado**          | Solo consultas           | Básico (consultas + proyectos)| Completo con métricas de equipo  | Completo + reportes avanzados                |
| **Edición de perfil y foto**         | Sí                       | Sí                            | Sí                               | Sí                                           |

---

## Bloque 3: Usuario Enterprise (Plan Superior)

### 3.1 Perfil y Configuración Personal

Exactamente igual que el superadmin en su propia vista de perfil: editar nombre, apellido, correo, teléfono y foto con la misma interacción hover + overlay del 20%.  
No tiene acceso a las pestañas de “Usuarios y Accesos” ni “Perfiles y Permisos”. En su lugar, si es titular, ve la sección **“Mi equipo”**.

### 3.2 Gestión de Usuarios (Equipo)

- Ruta: **Configuración → Mi equipo**.
- Puede agregar usuarios (hasta ilimitado), editarlos y desactivarlos.
- Los nuevos usuarios heredan el plan Enterprise; sus consultas y proyectos se descuentan del pool común del titular (o se definen sublímites configurables por el admin).
- Cada miembro ve sus propias consultas/proyectos restantes según reparto.
- La vista del titular es una lista similar a la del admin pero filtrada solo a su grupo, con etiquetas de consumo.

### 3.3 Dashboard

- Resumen personal: consultas realizadas/restantes (“ilimitado”), proyectos activos, documentos almacenados, alertas nuevas.
- Métricas de equipo: gráficos de actividad por miembro.
- Lista de últimos proyectos propios y del equipo.

### 3.4 Búsquedas

- Consultas ilimitadas.
- Reportes detallados en PDF con personalización (logo, comentarios).
- Historial completo de títulos con posibilidad de reconsultar actualizaciones.
- Alertas de gravámenes en tiempo real (push/email).
- Integración con API completa para automatizar flujos desde sus propios sistemas.

### 3.5 Expedientes y Documentos

- Número ilimitado de proyectos.
- Flujo de estados: Borrador → Pendiente revisión → Publicado. Puede requerir aprobación de un revisor interno (configurable por admin).
- Subida de documentos: mismo proceso detallado (formatos, 10 MB máx., tipos obligatorios).
- **Modelo LM de análisis jurídico** (automático al subir documentos):
  1. Extrae texto (OCR para PDF/imágenes escaneados).
  2. Cruza datos con modelo entrenado para identificar incongruencias, datos faltantes, firmas.
  3. Genera reporte de “Conformidad Documental” con semáforos (verde, amarillo, rojo) y observaciones.
  4. El reporte se muestra en la vista del expediente.
- Validación en lote: interfaz especial para cargar CSV con múltiples folios reales; el sistema ejecuta validaciones en segundo plano y notifica al finalizar.
- Almacenamiento total hasta **10 GB** (aviso al acercarse al límite).

### 3.6 API y Exportación

- Acceso completo a API REST (todas las rutas documentadas).
- Clave API única con límite de tasa alto (ej. 1000 req/min).
- Soporte para webhooks de eventos (nueva alerta, cambio de estado de expediente).
- Exportación de resultados a PDF y Excel.

### 3.7 Soporte

- Account Manager asignado 24/7 vía chat y teléfono.
- SLA garantizado del 99.9% de disponibilidad.
- Tiempo de respuesta para incidencias críticas < 1 hora.

---

## Bloque 4: Usuario Empresa

### 4.1 Perfil y Configuración

Ídem: edición de perfil completa, foto con hover y overlay.

### 4.2 Gestión de Equipo

- Hasta **5 usuarios secundarios**.
- Administración desde **“Mi equipo”**. No puede exceder el límite.
- Consumo compartido de recursos (100 consultas/mes y 20 proyectos totales entre todos).
- El titular define si se reparten equitativamente o asigna límites manuales por usuario.
- Cada miembro ve sus propias consultas restantes según el reparto.

### 4.3 Dashboard

- Gráficas de consumo: consultas usadas (ej. 45/100), proyectos activos (8/20).
- Actividad reciente del equipo.
- Exportación de resumen mensual en PDF.

### 4.4 Búsquedas

- 100 consultas mensuales.
- Historial de títulos y reportes detallados.
- Alertas de gravámenes (solo por correo, no en tiempo real).
- Exportación a PDF de cada ficha.

### 4.5 Expedientes y Documentos

- Límite: **20 proyectos activos** simultáneos.
- Flujo de estados igual que Enterprise (envío a revisión posible).
- Carga de documentos con tipos obligatorios y 10 MB por archivo.
- **Modelo LM** disponible solo para análisis individual por proyecto (sin validación en lote). Puede tener menor prioridad en la cola de procesamiento.
- Almacenamiento total: **1 GB**.
- Reporte de conformidad documental idéntico al de Enterprise.

### 4.6 API y CRM

- Acceso API Básico: endpoints de búsqueda, histórico y expedientes propios.
- Límite de **500 solicitudes por día**.
- Integración CRM vía API (conectar herramientas externas para sincronizar contactos/proyectos).
- Sin webhooks.

### 4.7 Soporte

- Soporte prioritario: email y chat en plataforma, respuesta en 8 horas laborables.

---

## Bloque 5: Usuario Profesional

### 5.1 Perfil

Igual capacidad de edición de perfil y foto.

### 5.2 Gestión de Usuarios

Plan monousuario. No existe la sección “Mi equipo”.

### 5.3 Dashboard

- Resumen sencillo: consultas usadas/quedan (x/25), proyectos activos (y/5), almacenamiento usado.
- Lista de últimos proyectos propios.

### 5.4 Búsquedas

- **25 consultas mensuales**.
- Acceso a historial de títulos.
- Alertas de gravámenes por correo.
- Reportes PDF disponibles por consulta.
- Sin acceso a API.

### 5.5 Expedientes y Documentos

- Máximo **5 proyectos activos**.
- Flujo de estados igual, **sin acceso al modelo LM**. Los documentos solo se almacenan; no hay validación automática.
- Subida de documentos: mismos formatos y límite de 10 MB.
- Almacenamiento máximo: **200 MB**.
- En la vista del expediente: lista de documentos y posibilidad de adjuntar comentarios manuales.

### 5.6 Soporte

- Soporte por email, respuesta en 24 horas (días hábiles).

---

## Bloque 6: Usuario Consulta (Free)

### 6.1 Perfil

Registro obligatorio. Puede editar nombre, correo, teléfono y foto con hover del 20%.  
Su foto se muestra en miniatura en partes públicas del sistema si está habilitado.

### 6.2 Restricciones

- **Consultas**: 1 búsqueda mensual, contador visible.
- Solo accede a datos públicos básicos (ubicación, propietario registral público, sin historial).
- **No tiene acceso a expedientes**: no puede crear proyectos, subir documentos, ni usar modelo LM.
- **No puede exportar** a PDF, ni recibir alertas.
- Dashboard minimalista: solo contador de consultas restantes.
- Sin acceso a API.
- Soporte únicamente a través de la comunidad (foro integrado).

### 6.3 Vista Post-Consulta

Tras consumir su consulta mensual, se muestra un resumen en pantalla (sin PDF).  
Hasta el siguiente ciclo de facturación, el botón de buscar estará deshabilitado con un mensaje que invita a actualizar el plan.

---

## Bloque 7: Consideraciones Técnicas Transversales

### 7.1 Componente de Foto de Perfil (Todos los roles)

- Lógica centralizada en un servicio `AvatarService`.
- El frontend usa un componente (Vue/React) que:
  - Muestra el círculo.
  - Maneja evento `mouseenter`/`mouseleave` para el overlay.
  - Abre el selector de archivos y previsualiza con `URL.createObjectURL()`.
- Backend: validación, redimensionamiento (300x300 px), almacenamiento en `storage/avatars/`, actualización de `users.avatar_url`.

### 7.2 Estructura de Base de Datos para Documentos

```sql
-- Tabla de tipos de documento
CREATE TABLE tipos_documento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,  -- ej: 'TITULO', 'ESTADO_J'
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    requerido BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0
);

-- Tabla de documentos
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    tipo_documento_id INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    tamano_bytes BIGINT,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id),
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento(id),
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);




Índices sugeridos: (expediente_id, tipo_documento_id), (usuario_id).

7.3 Modelo LM y Validación Documental
Implementado como job asíncrono.

Al subir un documento (planes Enterprise/Empresa) se dispara el evento DocumentUploaded.

Se encola ProcessDocumentJob que:

Extrae texto (OCR si es necesario).
Invoca un microservicio de ML con el texto y los metadatos.
Guarda resultado en la tabla validaciones_documento:
sql
CREATE TABLE validaciones_documento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    documento_id INT,
    resultado JSON,  -- semáforos, observaciones, datos extraídos
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, procesando, completado, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
La vista del expediente consulta el último resultado WHERE estado = 'completado' para mostrar el reporte de conformidad.

7.4 Gestión de Límites y Contadores
Tabla planes:

sql
CREATE TABLE planes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(50) UNIQUE NOT NULL, -- 'consulta', 'profesional', 'empresa', 'enterprise'
    nombre VARCHAR(100),
    consultas_max INT,
    proyectos_max INT,
    usuarios_max INT,
    api_rate_limit INT,          -- req/día o req/min
    almacenamiento_max_mb BIGINT,
    -- otras columnas de precio, etc.
);
Usuarios tienen plan_id y grupo_id (para multiusuario, donde grupo_id apunta al id del titular).

Contadores mensuales:

consultas_realizadas y proyectos_creados por usuario/grupo, reiniciados por un job el día 1 de cada mes.

Histórico guardado en consumo_mensual para auditoría.

Middleware de autorización verifica en cada petición:

Plan del usuario.

Recursos disponibles: consultas restantes, número de proyectos activos, almacenamiento, etc.

Para subida de documentos: se comprueba que el proyecto pertenezca al usuario o a su grupo.

7.5 Seguridad y Control de Acceso
Middleware CheckPlanLimit que:

Carga el plan del usuario autenticado.

Verifica contadores en Redis o base de datos para peticiones en tiempo real.

Bloquea acciones que excedan los límites (retorna 403 con mensaje descriptivo).

Las rutas de API están protegidas por middlewares de autenticación y, opcionalmente, de alcance (scope: enterprise, empresa, profesional).

Las claves de API se generan por usuario con un límite de tasa configurable por plan.