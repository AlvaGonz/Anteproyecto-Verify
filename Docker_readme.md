# 🐳 Guía de Configuración Docker para VeriFinca

Este proyecto contiene una configuración robusta de orquestación con Docker Compose para levantar todos los servicios necesarios de **VeriFinca** de forma local. Los contenedores incluyen el Backend de la API, el Frontend Web (React), Azure Azurite y un servidor de base de datos de Microsoft SQL Server personalizado con inicialización dinámica de esquemas.

---

## 🗂️ Arquitectura de Archivos y Contenedores

| Archivo / Directorio | Propósito |
| :--- | :--- |
| `docker-compose.yml` | Archivo principal de orquestación para todos los contenedores. |
| `Build-Database-Sql.sql` | Script SQL original con la estructura de tablas (escrito en dialecto MySQL). |
| `docker/SQL_Server/` | Directorio contenedor de los archivos de personalización del servidor SQL Server. |
| ├── `Dockerfile` | Imagen personalizada basada en SQL Server 2022 que integra Python 3 y configuraciones custom. |
| ├── `translate.py` | Utilidad en Python que traduce en tiempo real la sintaxis MySQL original a T-SQL (SQL Server). |
| └── `entrypoint.sh` | Script de inicialización de Unix que orquesta la traducción, espera a la salud del servidor y ejecuta la siembra. |
| `Docker_readmwe.md` | Este manual técnico explicativo de orquestación Docker. |

---

## ⚡ Inicialización Dinámica y Persistencia de Base de Datos

### 1. Traducción Automática de Sintaxis (MySQL ➡️ T-SQL)
El script original `Build-Database-Sql.sql` está en formato **MySQL** (utiliza `AUTO_INCREMENT`, comillas invertidas, y cláusulas `CREATE DATABASE IF NOT EXISTS`), pero la aplicación principal corre sobre **Microsoft SQL Server**.
Para evitar la tediosa tarea de convertir manualmente el script cada vez que agregues tablas o realices cambios en él, hemos diseñado un **traductor automático en Python (`translate.py`)** dentro del contenedor que:
* Traduce `AUTO_INCREMENT` a `IDENTITY(1,1)`.
* Ajusta la cláusula de creación de base de datos a formato T-SQL condicional.
* Encapsula los nombres de bases de datos especiales y remueve comillas invertidas.
* Corrige sentencias de alteración de tablas eliminando la palabra clave `COLUMN` en `ADD COLUMN`.

### 2. Actualización en Tiempo Real (Hot-Reload de Esquemas)
El script `Build-Database-Sql.sql` está montado como un volumen de solo lectura (`:ro`) en el contenedor. Esto significa que **cualquier cambio que realices en el archivo SQL desde tu editor se verá reflejado inmediatamente en el contenedor**, y se reaplicará en el inicio o reinicio del servicio de base de datos sin necesidad de reconstruir la imagen de Docker.

### 3. Persistencia con Volumen
La base de datos utiliza un volumen persistente nombrado `mssql-data` vinculado a `/var/opt/mssql/data`. Esto garantiza que todos tus datos ingresados persistan de manera segura aunque detengas los contenedores (`docker compose down`).

---

## 🚀 Guía de Inicio Rápido (Quick Start)

### 📌 Requisitos Previos
* Tener **Docker Desktop** instalado y ejecutándose en tu sistema operativo (Windows, macOS o Linux).

---

### A) Levantar el Entorno Completo (Modo Normal)
Para iniciar todos los servicios del ecosistema en segundo plano:
```bash
docker compose up -d
```

### B) Reconstruir y Reiniciar desde Cero (Clean Build & Run)
Si has realizado cambios importantes en los archivos Docker, archivos del sistema o quieres una compilación limpia:
```bash
docker compose up --build --force-recreate -d
```

### C) Detener los Contenedores
Para detener todos los servicios de forma limpia sin perder tus datos de la base de datos:
```bash
docker compose down
```

### D) Reiniciar y Destruir Datos por Completo (Hard Reset)
Si modificaste sustancialmente tus esquemas de bases de datos de forma destructiva y necesitas **borrar todos los datos y tablas guardadas en la base de datos para crearlas de nuevo limpiamente desde `Build-Database-Sql.sql`**:
```bash
docker compose down -v
docker compose up --build -d
```
*(El argumento `-v` elimina los volúmenes persistentes creados por Docker, obligando al contenedor de SQL Server a ejecutar nuevamente la inicialización desde cero en su próximo arranque).*

---

## ⏱️ Ciclo de Vida del Arranque, Tiempos Estimados y Siembra Automática

Para garantizar que el sistema inicie al 100% de manera consistente en cualquier reinicio, reinstalación de Docker o máquina limpia, hemos configurado **políticas de reinicio automático (`restart: unless-stopped`)**, **verificaciones de salud (Healthchecks)** y un **bucle de reintento de conexión con siembra automática**.

A continuación se detalla el paso a paso del flujo del sistema al ejecutar `docker compose up -d`:

| Paso | Descripción | Acción Requerida | Tiempo Estimado | Estado del Sistema / Validación |
| :--- | :--- | :--- | :--- | :--- |
| **1. Variables de Entorno** | Cargar configuraciones del backend, base de datos y llaves de desarrollo. | Asegúrate de tener el archivo `.env` en la raíz del proyecto (puedes copiar de `.env.example`). | 1 minuto | El sistema leerá las variables de base de datos y configuración JWT. |
| **2. docker compose up -d** | Orquestación en segundo plano de los contenedores (`api`, `web`, `sqlserver`, `azurite`). | Ejecutar `docker compose up -d` en tu terminal. | 15 segundos | Todos los contenedores quedan en estado `Up` o `Starting`. |
| **3. Healthcheck de BD** | SQL Server se inicia, compila la base de datos, traduce el script MySQL a T-SQL y crea el esquema. | Ninguna (Automático). El contenedor de la API esperará hasta que SQL Server esté saludable (`service_healthy`). | 30 - 45 segundos | Puedes verificar con `docker compose ps` que `sqlserver-1` tenga status `healthy`. |
| **4. Compilación y Seeding** | El backend se compila en el contenedor con `dotnet watch` y siembra la base de datos. | Ninguna (Automático). La API verifica la conexión con SQL Server (reintenta hasta 30 veces), crea las tablas y **siembra automáticamente los usuarios y planes por defecto**. | 1 - 2 minutos | Verás `dotnet watch 🚀 Started` en los logs de `api` y el puerto `5000` estará activo. |
| **5. Acceso al Frontend** | El frontend web compilado en Vite expone el portal en el puerto `3000`. | Abrir `http://localhost:3000` en tu navegador. | Inmediato | La pantalla de Login estará disponible y podrás entrar inmediatamente. |

### 🔐 Credenciales Sembradas por Defecto (Listas para Usar)
Una vez finalizado el Paso 4, puedes iniciar sesión inmediatamente con:

* **Administrador Principal (Administrator)**:
  * **Usuario:** `admin@verifinca.do`
  * **Contraseña:** `AdminVerifinca2026!`
  * *(Estado: Verificado y Activo)*

* **Desarrollador Premium (Professional)**:
  * **Usuario:** `dev@constructora.do`
  * **Contraseña:** `DevVerifinca2026!`
  * *(Estado: Verificado y Activo)*

* **Usuario Validador (Consultation)**:
  * **Usuario:** `validador@verifinca.do`
  * **Contraseña:** `Validador2026!`
  * *(Estado: Verificado y Activo)*

> [!NOTE]
> Gracias a las políticas de reinicio y al bucle de resiliencia del backend, si reinicias tu PC o tu Docker Desktop, el sistema reordenará el inicio por sí mismo y levantará los servicios listos para iniciar sesión sin requerir ningún comando manual adicional.

---

## 📊 Carga y Siembra Masiva de Datos Gubernamentales (DGII, IPI, Catastro, Suelos)

El ecosistema integra un servicio automatizado en Docker (`python_env`) para cargar y sembrar de manera masiva registros reales de la Dirección General de Impuestos Internos (DGII) y generar semillas coherentes para las validaciones catastrales y de suelo.

### 🗄️ Tablas Involucradas y Volúmenes de Registros
Cuando ejecutas `docker compose up`, el sistema inicializa y puebla las siguientes tablas con **780,396 registros cada una**:
* **DGII**: Datos reales de contribuyentes extraídos y validados del padrón de la DGII (`DGII_RNC.TXT`).
* **PagoIPI**: Historial de pagos simulados (cuota y estatus de pago/no pago) enlazados por RNC.
* **CatastroTitulo**: Títulos de propiedad con coordenadas geográficas reales basadas en las 32 provincias dominicanas y superficies según su categoría (House, Apartment, Residential, Offices).
* **PermisoSuelo**: Permisos de uso de suelo municipales georreferenciados y enlazados por RNC.

### ⏱️ Tiempos de Carga Estimados (Fresh Startup / Primera Vez)
Debido a la magnitud del conjunto de datos (más de 3 millones de filas insertadas en total), el primer arranque en limpio del contenedor tomará un tiempo para poblar los volúmenes de base de datos:
* **Montura DGII (`up_DGII.py`)**: ~3.9 minutos (235 segundos) usando 8 hilos concurrentes y montura por lotes de 150 filas.
* **Generador de Semillas (`generador_entidades_gubernamentales.py`)**: ~7.8 minutos (470 segundos) para calcular superficies, coordinar provincias/municipios e insertar registros.
* **Tiempo Total Inicial**: **~12 minutos** para el aprovisionamiento completo del contenedor de base de datos y sus volúmenes asociados.

> [!TIP]
> **Arranques posteriores rápidos:** Las tareas de montura de datos implementan un mecanismo inteligente de validación en base de datos. Si detectan que las tablas ya contienen la totalidad de los datos (>= 780,000 registros), el proceso de carga se omitirá en milisegundos, permitiendo que Docker Compose levante todo el ecosistema de forma instantánea.

---

## 📊 Información Técnica y Conexiones

### 💾 Base de Datos (SQL Server)
* **Servidor (Host):** `localhost` (Puerto `1433`)
* **Nombre de Base de Datos Creada:** `verifinca-spm-uce-2026`
* **Nombre de Usuario (User):** `sa`
* **Contraseña (Password):** `Your_password123`
* **ConnectionString Recomendada en `.env`:**
  ```env
  ConnectionStrings__DefaultConnection=Server=localhost;Database=verifinca-spm-uce-2026;User Id=sa;Password=Your_password123;TrustServerCertificate=True;
  ```

---

## 🔍 Monitoreo y Debugging

Para examinar qué está ocurriendo internamente en el contenedor de base de datos (por ejemplo, ver el proceso de traducción y ejecución del script SQL):
```bash
docker compose logs -f sqlserver
```

*(Esto imprimirá en consola en tiempo real las fases de traducción, espera de conexión de SQL Server y ejecución del script `Build-Database-Sql.sql`).*
