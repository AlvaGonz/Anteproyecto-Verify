SET QUOTED_IDENTIFIER ON;
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
    IdUsuario UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    NombreCompleto AS (Nombre + ' ' + Apellido) PERSISTED,
    CorreoElectronico VARCHAR(200) NOT NULL UNIQUE CONSTRAINT CK_Usuario_CorreoElectronico CHECK (CorreoElectronico LIKE '%_@__%.__%'),
    ContrasenaHash VARCHAR(500) NOT NULL,
    Telefono VARCHAR(15) NOT NULL,
    Cedula VARCHAR(15) NOT NULL,
    Rol INT NOT NULL DEFAULT 2,
    Activo BIT NOT NULL DEFAULT 1,
    EmailVerificado BIT NOT NULL DEFAULT 0,
    TokenVerificacion VARCHAR(MAX) NULL,
    TokenVerificacionExpiraUtc DATETIME2 NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc DATETIME2 NULL
);
GO

-- Vista para compatibilidad con entidades Legacy
CREATE VIEW UsuarioLegacy AS
SELECT 
    IdUsuario,
    Nombre,
    Apellido,
    NombreCompleto,
    CorreoElectronico AS Email,
    ContrasenaHash,
    Telefono,
    Cedula
FROM Usuario;
GO



-- Tabla TipoDocumento
CREATE TABLE TipoDocumento (
    IdTipoDcumento UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Descripcion VARCHAR(100)
);
GO

-- Tabla Permisos
CREATE TABLE Permisos (
    IdPermiso UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Descripcion VARCHAR(100)
);
GO

-- Tabla Perfiles
CREATE TABLE Perfiles (
    IdPerfil UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombrePerfil VARCHAR(100)
);
GO

-- Tabla Acceso
CREATE TABLE Acceso (
    IdAcceso UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdPerfil UNIQUEIDENTIFIER,
    IdUsuario UNIQUEIDENTIFIER,
    FOREIGN KEY (IdPerfil) REFERENCES Perfiles(IdPerfil),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla PerfilPermiso (relación muchos a muchos entre Perfiles y Permisos)
CREATE TABLE PerfilPermiso (
    IdPerfil UNIQUEIDENTIFIER,
    IdPermiso UNIQUEIDENTIFIER,
    PRIMARY KEY (IdPerfil, IdPermiso),
    FOREIGN KEY (IdPerfil) REFERENCES Perfiles(IdPerfil),
    FOREIGN KEY (IdPermiso) REFERENCES Permisos(IdPermiso)
);
GO

-- Tabla Provincia
CREATE TABLE Provincia (
    IdProvincia UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombreProvincia VARCHAR(100)
);
GO

-- Tabla Municipio
CREATE TABLE Municipio (
    IdMunicipio UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProvincia UNIQUEIDENTIFIER,
    NombreMunicipio VARCHAR(100),
    FOREIGN KEY (IdProvincia) REFERENCES Provincia(IdProvincia)
);
GO

-- Tabla PlanSuscripcion
CREATE TABLE PlanSuscripcion (
    Idsuscripcion UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombrePlan VARCHAR(100),
    Precio DECIMAL(10,2)
);
GO

-- Tabla PlanCaracteristica
CREATE TABLE PlanCaracteristica (
    IdPlan UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Idsuscripcion UNIQUEIDENTIFIER,
    Caracteristica VARCHAR(255),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

-- Tabla ProyectosInmoviliarios
CREATE TABLE ProyectosInmoviliarios (
    IdProyecto UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER,
    IdMunicipio UNIQUEIDENTIFIER,
    NombreProyecto VARCHAR(200),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla TipoInmoviliario
CREATE TABLE TipoInmoviliario (
    IdMoviliario UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Tipo VARCHAR(100)
);
GO

-- Tabla Documento
CREATE TABLE Documento (
    IdDocumento UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    IdTipoDcumento UNIQUEIDENTIFIER,
    RutaDocumento VARCHAR(255),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto),
    FOREIGN KEY (IdTipoDcumento) REFERENCES TipoDocumento(IdTipoDcumento)
);
GO

-- Tabla SelloIntegridad
CREATE TABLE SelloIntegridad (
    IdSello UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdDocumento UNIQUEIDENTIFIER,
    HashSello VARCHAR(255),
    FOREIGN KEY (IdDocumento) REFERENCES Documento(IdDocumento)
);
GO

-- Tabla LogProyectos
CREATE TABLE LogProyectos (
    IdLog UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER,
    IdProyecto UNIQUEIDENTIFIER,
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
    IdESuelo UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    FechaEstudio DATE,
    Resultado TEXT,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla PermisoSuelo
CREATE TABLE PermisoSuelo (
    IdPSuelo UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    NumeroPermiso VARCHAR(50),
    FechaEmision DATE,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla CertiMivhed
CREATE TABLE CertiMivhed (
    IdMivhed UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    Certificado VARCHAR(100),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla CatastroTitulo
CREATE TABLE CatastroTitulo (
    IdCatastroTitulo UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    NumeroTitulo VARCHAR(50),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto)
);
GO

-- Tabla TarifaSueloAyuntamiento
CREATE TABLE TarifaSueloAyuntamiento (
    IdTarifaAyuntamiento UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdMunicipio UNIQUEIDENTIFIER,
    Monto DECIMAL(10,2),
    Anio INT,
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla AyuntamientoTarifa (relación, según el diagrama)
CREATE TABLE AyuntamientoTarifa (
    IdAyuntamiento UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdTarifaAyuntamiento UNIQUEIDENTIFIER,
    IdMunicipio UNIQUEIDENTIFIER,
    FOREIGN KEY (IdTarifaAyuntamiento) REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla SolvenciaFinanciera
CREATE TABLE SolvenciaFinanciera (
    IdSolvencia UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdMoviliario UNIQUEIDENTIFIER,
    FechaEmision DATE,
    Monto DECIMAL(10,2),
    FOREIGN KEY (IdMoviliario) REFERENCES TipoInmoviliario(IdMoviliario)
);
GO

-- Tabla ApiGobernanza
CREATE TABLE ApiGobernanza (
    IdApiGobernanza UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombreApi VARCHAR(100),
    Endpoint VARCHAR(255)
);
GO

-- =============================================
-- Tablas de pagos y recibos
-- =============================================

-- Tabla Recibo (pagos)
CREATE TABLE Recibo (
    IdPago UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER,
    Monto DECIMAL(10,2),
    FechaPago DATE,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla Pagos
CREATE TABLE Pagos (
    IdPago UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER,
    IdApiGobernanza UNIQUEIDENTIFIER,
    Idsuscripcion UNIQUEIDENTIFIER,
    Monto DECIMAL(10,2),
    FechaPago DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdApiGobernanza) REFERENCES ApiGobernanza(IdApiGobernanza),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

-- Tabla LogPagos
CREATE TABLE LogPagos (
    IdLog UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Idpago UNIQUEIDENTIFIER,
    IdUsuario UNIQUEIDENTIFIER,
    Idsuscripcion UNIQUEIDENTIFIER,
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
    IdConsulta UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Descripcion VARCHAR(255)
);
GO

-- Tabla FremiunConsultas_Log
CREATE TABLE FremiunConsultas_Log (
    IdConsultaLog UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    IdConsulta UNIQUEIDENTIFIER,
    IdUsuario UNIQUEIDENTIFIER,
    FechaConsulta DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto),
    FOREIGN KEY (IdConsulta) REFERENCES Consultas(IdConsulta),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla FremiunProyectos_Log
CREATE TABLE FremiunProyectos_Log (
    IdProyectoLog UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    IdUsuario UNIQUEIDENTIFIER,
    FechaAcceso DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- Tabla LogConsultas
CREATE TABLE LogConsultas (
    IdLog UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER,
    IdResultado UNIQUEIDENTIFIER,
    FechaConsulta DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

-- =============================================
-- Relaciones adicionales detectadas
-- =============================================

-- Relación entre TipoInmoviliario y ProyectosInmoviliarios (poseen)
ALTER TABLE TipoInmoviliario ADD IdProyecto UNIQUEIDENTIFIER;
GO
ALTER TABLE TipoInmoviliario ADD FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmoviliarios(IdProyecto);
GO

-- Relación Recibo con SelloIntegridad
ALTER TABLE Recibo ADD IdSello UNIQUEIDENTIFIER;
GO
ALTER TABLE Recibo ADD FOREIGN KEY (IdSello) REFERENCES SelloIntegridad(IdSello);
GO

-- Relación ProyectosInmoviliarios con CertiMivhed
ALTER TABLE ProyectosInmoviliarios ADD IdMivhed UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdMivhed) REFERENCES CertiMivhed(IdMivhed);
GO

-- Relación ProyectosInmoviliarios con CatastroTitulo
ALTER TABLE ProyectosInmoviliarios ADD IdCatastroTitulo UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdCatastroTitulo) REFERENCES CatastroTitulo(IdCatastroTitulo);
GO

-- Relación ProyectosInmoviliarios con TarifaSueloAyuntamiento
ALTER TABLE ProyectosInmoviliarios ADD IdTarifaAyuntamiento UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdTarifaAyuntamiento) REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento);
GO

-- Relación Adicional: ProyectosInmoviliarios con PermisoSuelo
ALTER TABLE ProyectosInmoviliarios ADD IdPSuelo UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdPSuelo) REFERENCES PermisoSuelo(IdPSuelo);
GO

-- Relación Adicional: ProyectosInmoviliarios con EstudioSuelo
ALTER TABLE ProyectosInmoviliarios ADD IdESuelo UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmoviliarios ADD FOREIGN KEY (IdESuelo) REFERENCES EstudioSuelo(IdESuelo);
GO