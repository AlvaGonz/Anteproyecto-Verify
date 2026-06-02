-- Crear la base de datos
CREATE DATABASE [verifinca-spm-uce-2026];
GO

USE [verifinca-spm-uce-2026];
GO

-- =============================================
-- Tablas principales (sin dependencias)
-- =============================================

-- Tabla Usuario
CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    NombreCompleto AS (Nombre + ' ' + Apellido) PERSISTED,
    Email VARCHAR(100) NOT NULL UNIQUE CONSTRAINT CK_Usuario_Email CHECK (Email LIKE '%_@__%.__%'),
    ContrasenaHash VARCHAR(255) NOT NULL,
    Telefono VARCHAR(15) NOT NULL,
    Cedula VARCHAR(15) NOT NULL
);
GO


-- Tabla TipoDocumento
CREATE TABLE TipoDocumento (
    IdTipoDcumento INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(100)
);
GO

-- Tabla Permisos
CREATE TABLE Permisos (
    IdPermiso INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(100)
);
GO

-- Tabla Perfiles
CREATE TABLE Perfiles (
    IdPerfil INT IDENTITY(1,1) PRIMARY KEY,
    NombrePerfil VARCHAR(100)
);
GO

-- Tabla Acceso
CREATE TABLE Acceso (
    IdAcceso INT IDENTITY(1,1) PRIMARY KEY,
    IdPerfil INT,
    IdUsuario INT,
    FOREIGN KEY (IdPerfil) REFERENCES Perfiles(IdPerfil),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla PerfilPermiso (relación muchos a muchos entre Perfiles y Permisos)
CREATE TABLE PerfilPermiso (
    IdPerfil INT,
    IdPermiso INT,
    PRIMARY KEY (IdPerfil, IdPermiso),
    FOREIGN KEY (IdPerfil) REFERENCES Perfiles(IdPerfil),
    FOREIGN KEY (IdPermiso) REFERENCES Permisos(IdPermiso)
);
GO

-- Tabla Provincia
CREATE TABLE Proviencia ( -- Nota: el diagrama tiene "Proviencia", probablemente "Provincia"
    IdProvincia INT IDENTITY(1,1) PRIMARY KEY,
    NombreProvincia VARCHAR(100)
);
GO

-- Tabla Municipio
CREATE TABLE Municipio (
    IdMunicipio INT IDENTITY(1,1) PRIMARY KEY,
    IdProvincia INT,
    NombreMunicipio VARCHAR(100),
    FOREIGN KEY (IdProvincia) REFERENCES Proviencia(IdProvincia)
);
GO

-- Tabla PlanSuscripcion
CREATE TABLE PlanSuscripcion (
    Idsuscripcion INT IDENTITY(1,1) PRIMARY KEY,
    NombrePlan VARCHAR(100),
    Precio DECIMAL(10,2)
);
GO

-- Tabla PlanCaracteristica
CREATE TABLE PlanCaracteristica (
    IdPlan INT IDENTITY(1,1) PRIMARY KEY,
    Idsuscripcion INT,
    Caracteristica VARCHAR(255),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

-- Tabla ProyectosInmoviliarios
CREATE TABLE ProyectosInmoviliarios (
    IdProyecto INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT,
    IdMunicipio INT,
    NombreProyecto VARCHAR(200),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla TipoInmoviliario
CREATE TABLE TipoInmoviliario (
    IdMoviliario INT IDENTITY(1,1) PRIMARY KEY,
    Tipo VARCHAR(100)
);
GO

-- Tabla Documento
CREATE TABLE Documento (
    IdDocumento INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    IdTipoDcumento INT,
    RutaDocumento VARCHAR(255),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto),
    FOREIGN KEY (IdTipoDcumento) REFERENCES TipoDocumento(IdTipoDcumento)
);
GO

-- Tabla SelloIntegridad
CREATE TABLE SelloIntegridad (
    IdSello INT IDENTITY(1,1) PRIMARY KEY,
    IdDocumento INT,
    HashSello VARCHAR(255),
    FOREIGN KEY (IdDocumento) REFERENCES Documento(IdDocumento)
);
GO

-- Tabla LogProyectos
CREATE TABLE LogProyectos (
    IdLog INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT,
    IdProyecto INT,
    FechaHora DATETIME DEFAULT GETDATE(),
    Accion VARCHAR(100),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- =============================================
-- Tablas de certificados y permisos
-- =============================================

-- Tabla EstudioSuelo
CREATE TABLE EstudioSuelo (
    IdESuelo INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    FechaEstudio DATE,
    Resultado TEXT,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla PermisoSuelo
CREATE TABLE PermisoSuelo (
    IdPSuelo INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    NumeroPermiso VARCHAR(50),
    FechaEmision DATE,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla CertiMivhed
CREATE TABLE CertiMivhed (
    IdMivhed INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    Certificado VARCHAR(100),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla CatastroTitulo
CREATE TABLE CatastroTitulo (
    IdCatastroTitulo INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    NumeroTitulo VARCHAR(50),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla TarifaSueloAyuntamiento
CREATE TABLE TarifaSueloAyuntamiento (
    IdTarifaAyuntamiento INT IDENTITY(1,1) PRIMARY KEY,
    IdMunicipio INT,
    Monto DECIMAL(10,2),
    Anio INT,
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla AyuntamientoTarifa (relación, según el diagrama)
CREATE TABLE AyuntamientoTarifa (
    IdAyuntamiento INT IDENTITY(1,1) PRIMARY KEY,
    IdTarifaAyuntamiento INT,
    IdMunicipio INT,
    FOREIGN KEY (IdTarifaAyuntamiento) REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla SolvenciaFinanciera
CREATE TABLE SolvenciaFinanciera (
    IdSolvencia INT IDENTITY(1,1) PRIMARY KEY,
    IdMoviliario INT,
    FechaEmision DATE,
    Monto DECIMAL(10,2),
    FOREIGN KEY (IdMoviliario) REFERENCES TipoInmoviliario(IdMoviliario)
);
GO

-- Tabla ApiGobernanza
CREATE TABLE ApiGobernanza (
    IdApiGobernanza INT IDENTITY(1,1) PRIMARY KEY,
    NombreApi VARCHAR(100),
    Endpoint VARCHAR(255)
);
GO

-- =============================================
-- Tablas de pagos y recibos
-- =============================================

-- Tabla Recibo (pagos)
CREATE TABLE Recibo (
    IdPago INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT,
    Monto DECIMAL(10,2),
    FechaPago DATE,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla Pagos
CREATE TABLE Pagos (
    IdPago INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT,
    IdApiGobernanza INT,
    Idsuscripcion INT,
    Monto DECIMAL(10,2),
    FechaPago DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdApiGobernanza) REFERENCES ApiGobernanza(IdApiGobernanza),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

-- Tabla LogPagos
CREATE TABLE LogPagos (
    IdLog INT IDENTITY(1,1) PRIMARY KEY,
    Idpago INT,
    IdUsuario INT,
    Idsuscripcion INT,
    FechaLog DATETIME DEFAULT GETDATE(),
    Estado VARCHAR(50),
    FOREIGN KEY (Idpago) REFERENCES Pagos(IdPago),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

-- =============================================
-- Tablas de logs de consultas y proyectos premium
-- =============================================

-- Tabla Consultas (base para logs de consultas)
CREATE TABLE Consultas (
    IdConsulta INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(255)
);
GO

-- Tabla FremiunConsultas_Log
CREATE TABLE FremiunConsultas_Log (
    IdConsultaLog INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    IdConsulta INT,
    IdUsuario INT,
    FechaConsulta DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto),
    FOREIGN KEY (IdConsulta) REFERENCES Consultas(IdConsulta),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla FremiunProyectos_Log
CREATE TABLE FremiunProyectos_Log (
    IdProyectoLog INT IDENTITY(1,1) PRIMARY KEY,
    IdProyecto INT,
    IdUsuario INT,
    FechaAcceso DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla LogConsultas
CREATE TABLE LogConsultas (
    IdLog INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT,
    IdResultado INT,
    FechaConsulta DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- =============================================
-- Relaciones adicionales detectadas
-- =============================================

-- Relación entre TipoInmoviliario y ProyectosInmoviliarios (poseen)
ALTER TABLE TipoInmoviliario ADD IdProyecto INT;
GO
ALTER TABLE TipoInmoviliario ADD FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto);
GO

-- Relación Recibo con SelloIntegridad
ALTER TABLE Recibo ADD IdSello INT;
GO
ALTER TABLE Recibo ADD FOREIGN KEY (IdSello) REFERENCES SelloIntegridad(IdSello);
GO

-- Relación ProyectosInmoviliarios con CertiMivhed
ALTER TABLE ProyectosInmoviliarios ADD IdMivhed INT;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdMivhed) REFERENCES CertiMivhed(IdMivhed);
GO

-- Relación ProyectosInmoviliarios con CatastroTitulo
ALTER TABLE ProyectosInmoviliarios ADD IdCatastroTitulo INT;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdCatastroTitulo) REFERENCES CatastroTitulo(IdCatastroTitulo);
GO

-- Relación ProyectosInmoviliarios con TarifaSueloAyuntamiento
ALTER TABLE ProyectosInmoviliarios ADD IdTarifaAyuntamiento INT;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdTarifaAyuntamiento) REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento);
GO

-- Relación Adicional: ProyectosInmoviliarios con PermisoSuelo
ALTER TABLE ProyectosInmoviliarios ADD IdPSuelo INT;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdPSuelo) REFERENCES PermisoSuelo(IdPSuelo);
GO

-- Relación Adicional: ProyectosInmoviliarios con EstudioSuelo
ALTER TABLE ProyectosInmoviliarios ADD IdESuelo INT;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdESuelo) REFERENCES EstudioSuelo(IdESuelo);
GO