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
    Email VARCHAR(200) NOT NULL UNIQUE CONSTRAINT CK_Usuario_Email CHECK (Email LIKE '%_@__%.__%'),
    ContrasenaHash VARCHAR(500) NOT NULL,
    Telefono VARCHAR(15) NOT NULL,
    Cedula VARCHAR(15) NOT NULL,
    Rol INT NOT NULL DEFAULT 2,
    Activo BIT NOT NULL DEFAULT 1,
    EmailVerificado BIT NOT NULL DEFAULT 0,
    TokenVerificacion VARCHAR(MAX) NULL,
    TokenVerificacionExpiraUtc DATETIME2 NULL,
    PlanSuscripcionId UNIQUEIDENTIFIER NULL,
    ConsultasUsadas INT NOT NULL DEFAULT 0,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc DATETIME2 NULL,
    RowVersion TIMESTAMP
);
GO

-- Vista para compatibilidad con entidades Legacy
CREATE VIEW UsuarioLegacy AS
SELECT 
    IdUsuario,
    Nombre,
    Apellido,
    NombreCompleto,
    Email,
    ContrasenaHash,
    Telefono,
    Cedula,
    Rnc,
    PlanSuscripcionId,
    ConsultasUsadas
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
    NombreProvincia VARCHAR(100) NOT NULL,
    Latitud DECIMAL(18,10) NULL,
    Longitud DECIMAL(18,10) NULL
);
GO

-- Seeding Provincia table with Dominican Republic provinces and centroids
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Distrito Nacional', 18.47186, -69.93988);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Azua', 18.45320, -70.73490);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Baoruco', 18.50000, -71.30000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Barahona', 18.20850, -71.10080);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Dajabón', 19.54000, -71.70000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Duarte', 19.30000, -70.25000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('El Seibo', 18.76000, -69.04000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Elías Piña', 18.88000, -71.68000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Espaillat', 19.50000, -70.50000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Hato Mayor', 18.76000, -69.25000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Hermanas Mirabal', 19.38000, -70.35000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Independencia', 18.40000, -71.60000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('La Altagracia', 18.61890, -68.70830);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('La Romana', 18.42730, -68.97280);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('La Vega', 19.22000, -70.53000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('María Trinidad Sánchez', 19.38000, -69.95000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Monseñor Nouel', 18.91000, -70.43000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Monte Cristi', 19.72000, -71.58000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Monte Plata', 18.80700, -69.78900);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Pedernales', 18.03000, -71.74000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Peravia', 18.28000, -70.33000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Puerto Plata', 19.79340, -70.68840);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Samaná', 19.20000, -69.33000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('San Cristóbal', 18.41667, -70.10000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('San José de Ocoa', 18.55000, -70.50000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('San Juan', 18.80580, -71.22990);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('San Pedro de Macorís', 18.45390, -69.30820);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Sánchez Ramírez', 19.00160, -70.14920);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Santiago', 19.45170, -70.69703);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Santiago Rodríguez', 19.48000, -71.34000);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Santo Domingo', 18.54118, -69.83988);
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES ('Valverde', 19.58000, -71.07000);
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
    Precio DECIMAL(10,2),
    AccesoApi BIT NOT NULL DEFAULT 0,
    MaxConsultas INT NOT NULL DEFAULT 0,
    MaxProyectos INT NOT NULL DEFAULT 0,
    MultiUsuario BIT NOT NULL DEFAULT 0,
    PresentacionPublica BIT NOT NULL DEFAULT 0,
    QrIncluido BIT NOT NULL DEFAULT 0
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

-- Tabla ProyectosInmobiliarios
CREATE TABLE ProyectosInmobiliarios (
    IdProyecto UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER NOT NULL,
    IdMunicipio UNIQUEIDENTIFIER NULL,
    NombreProyecto VARCHAR(200) NOT NULL,
    CodigoInterno VARCHAR(50) NOT NULL UNIQUE,
    UbicacionTexto VARCHAR(500) NOT NULL,
    UbicacionGps VARCHAR(100) NULL,
    ValorEstimado DECIMAL(18,2) NULL,
    DatosDesarrollador VARCHAR(500) NULL,
    RncDesarrollador VARCHAR(50) NULL,
    Matricula VARCHAR(100) NULL,
    Categoria INT NOT NULL,
    DesignacionCatastral VARCHAR(200) NULL,
    Status INT NOT NULL,
    EstadoIntegridad INT NOT NULL,
    EstadoJuridico INT NOT NULL DEFAULT 0,
    SelladoBloqueado BIT NOT NULL DEFAULT 0,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc DATETIME2 NULL,
    RowVersion TIMESTAMP,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla DGII
CREATE TABLE DGII (
    Rnc VARCHAR(20) PRIMARY KEY,
    NombreRazonSocial VARCHAR(250) NOT NULL,
    NombreComercial VARCHAR(250) NULL,
    Categoria VARCHAR(100) NULL,
    RegimenPagos VARCHAR(100) NULL,
    Estado VARCHAR(50) NULL,
    ActividadEconomica VARCHAR(250) NULL,
    AdministracionLocal VARCHAR(100) NULL,
    FacturadorElectronico VARCHAR(50) NULL,
    LicenciasVhm VARCHAR(100) NULL,
    FechaModificacion DATETIME2 NULL
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
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto),
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
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
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
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

-- Tabla PermisoSuelo
CREATE TABLE PermisoSuelo (
    IdPSuelo UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER NULL,
    NumeroPermiso VARCHAR(50) NULL,
    FechaEmision DATE NULL,
    Rnc VARCHAR(20) NULL,
    Provincia VARCHAR(100) NULL,
    Municipio VARCHAR(100) NULL,
    Latitud DECIMAL(9,6) NULL,
    Longitud DECIMAL(9,6) NULL,
    Superficie DECIMAL(18,2) NULL,
    TienePermiso VARCHAR(10) NULL,
    Documento VARCHAR(250) NULL,
    FechaEmision DATE,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

-- Tabla CertiMivhed
CREATE TABLE CertiMivhed (
    IdMivhed UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    Certificado VARCHAR(100),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

-- Tabla CatastroTitulo
CREATE TABLE CatastroTitulo (
    IdCatastroTitulo UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER NULL,
    NumeroTitulo VARCHAR(50) NULL,
    Rnc VARCHAR(20) NULL,
    Provincia VARCHAR(100) NULL,
    Municipio VARCHAR(100) NULL,
    Latitud DECIMAL(9,6) NULL,
    Longitud DECIMAL(9,6) NULL,
    Superficie DECIMAL(18,2) NULL,
    Matricula VARCHAR(50) NULL,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

-- Tabla PagoIPI
CREATE TABLE PagoIPI (
    Rnc VARCHAR(20) PRIMARY KEY,
    Cuota_ipi DECIMAL(18,2) NOT NULL,
    Estatus VARCHAR(20) NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE()
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
    Detalle VARCHAR(500) NULL,
    Categoria VARCHAR(100) NULL,
    Desglose VARCHAR(MAX) NULL,
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
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto),
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
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto),
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

-- Relación entre TipoInmoviliario y ProyectosInmobiliarios (poseen)
ALTER TABLE TipoInmoviliario ADD IdProyecto UNIQUEIDENTIFIER;
GO
ALTER TABLE TipoInmoviliario ADD FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto);
GO

-- Relación Recibo con SelloIntegridad
ALTER TABLE Recibo ADD IdSello UNIQUEIDENTIFIER;
GO
ALTER TABLE Recibo ADD FOREIGN KEY (IdSello) REFERENCES SelloIntegridad(IdSello);
GO

-- Relación ProyectosInmobiliarios con CertiMivhed
ALTER TABLE ProyectosInmobiliarios ADD IdMivhed UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdMivhed) REFERENCES CertiMivhed(IdMivhed);
GO

-- Relación ProyectosInmobiliarios con CatastroTitulo
ALTER TABLE ProyectosInmobiliarios ADD IdCatastroTitulo UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdCatastroTitulo) REFERENCES CatastroTitulo(IdCatastroTitulo);
GO

-- Relación ProyectosInmobiliarios con TarifaSueloAyuntamiento
ALTER TABLE ProyectosInmobiliarios ADD IdTarifaAyuntamiento UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdTarifaAyuntamiento) REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento);
GO

-- Relación Adicional: ProyectosInmobiliarios con PermisoSuelo
ALTER TABLE ProyectosInmobiliarios ADD IdPSuelo UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdPSuelo) REFERENCES PermisoSuelo(IdPSuelo);
GO

-- Relación Adicional: ProyectosInmobiliarios con EstudioSuelo
ALTER TABLE ProyectosInmobiliarios ADD IdESuelo UNIQUEIDENTIFIER;
GO
ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdESuelo) REFERENCES EstudioSuelo(IdESuelo);
GO
-- Relacion Adicional: Usuario con PlanSuscripcion
ALTER TABLE Usuario ADD FOREIGN KEY (PlanSuscripcionId) REFERENCES PlanSuscripcion(Idsuscripcion);
GO

-- Tabla Notificaciones (Requerida para el sistema de alertas de usuario)
CREATE TABLE Notificaciones (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    UsuarioId UNIQUEIDENTIFIER NOT NULL,
    Mensaje NVARCHAR(MAX) NOT NULL,
    Tipo NVARCHAR(50) NOT NULL,
    Leida BIT NOT NULL DEFAULT 0,
    FechaUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    EnlaceRelacionado NVARCHAR(MAX) NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc DATETIME2 NULL
);
GO

-- =============================================
-- Tablas y Objetos de EF Core (Migracion InitialCreate)
-- =============================================
-- Build started...

-- Build succeeded.

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL

BEGIN

    CREATE TABLE [__EFMigrationsHistory] (

        [MigrationId] nvarchar(150) NOT NULL,

        [ProductVersion] nvarchar(32) NOT NULL,

        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])

    );

END;
GO

CREATE TABLE [Auditorias] (

    [Id] uniqueidentifier NOT NULL,

    [UsuarioId] uniqueidentifier NULL,

    [ProyectoId] uniqueidentifier NULL,

    [TipoEvento] nvarchar(max) NOT NULL,

    [Accion] nvarchar(200) NOT NULL,

    [Entidad] nvarchar(max) NULL,

    [EntidadId] nvarchar(max) NULL,

    [Detalle] nvarchar(2000) NULL,

    [IpOrigen] nvarchar(50) NULL,

    [UserAgent] nvarchar(max) NULL,

    [FechaEventoUtc] datetime2 NOT NULL,

    [TipoOperacion] int NOT NULL,

    [Resultado] nvarchar(2000) NULL,

    [ReferenciaExpedienteId] uniqueidentifier NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_Auditorias] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_Auditorias_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,

    CONSTRAINT [FK_Auditorias_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION

);
GO

CREATE TABLE [ConsentimientosFinancieros] (

    [Id] uniqueidentifier NOT NULL,

    [UsuarioId] uniqueidentifier NOT NULL,

    [FechaHoraUtc] datetime2 NOT NULL,

    [IpOrigen] nvarchar(50) NOT NULL,

    [VersionPolitica] nvarchar(20) NOT NULL,

    [Estado] int NOT NULL,

    [FechaExpiracionUtc] datetime2 NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_ConsentimientosFinancieros] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_ConsentimientosFinancieros_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION

);
GO

CREATE TABLE [DeteccionesDuplicidad] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [ProyectoDuplicadoId] uniqueidentifier NULL,

    [NivelRiesgo] int NOT NULL,

    [DescripcionCoincidencia] nvarchar(max) NOT NULL,

    [FechaDeteccion] datetime2 NOT NULL,

    [Bloqueante] bit NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_DeteccionesDuplicidad] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId] FOREIGN KEY ([ProyectoDuplicadoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]),

    CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE

);
GO

CREATE TABLE [Documentos] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [TipoDocumento] int NOT NULL,

    [NombreArchivoOriginal] nvarchar(500) NOT NULL,

    [NombreArchivoAlmacenado] nvarchar(500) NOT NULL,

    [RutaArchivo] nvarchar(1000) NOT NULL,

    [ContentType] nvarchar(100) NOT NULL,

    [Extension] nvarchar(10) NOT NULL,

    [TamanoBytes] bigint NOT NULL,

    [EstadoDocumento] int NOT NULL,

    [Activo] bit NOT NULL,

    [Version] int NOT NULL,

    [FechaEmision] datetime2 NULL,

    [InstitucionEmisora] nvarchar(200) NULL,

    [UsuarioCargaId] uniqueidentifier NOT NULL,

    [Observaciones] nvarchar(1000) NULL,

    [FormalStatus] int NULL,

    [FechaVencimiento] datetime2 NULL,

    [VersionReglaAplicada] nvarchar(max) NULL,

    [FechaEvaluacion] datetime2 NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_Documentos] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_Documentos_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE

);
GO

CREATE TABLE [ReglasValidacion] (

    [Id] uniqueidentifier NOT NULL,

    [Nombre] nvarchar(200) NOT NULL,

    [Descripcion] nvarchar(1000) NOT NULL,

    [CondicionLogica] nvarchar(2000) NOT NULL,

    [TipoDocumentoAplicable] int NOT NULL,

    [NivelAlerta] int NOT NULL,

    [TipoProyecto] int NOT NULL,

    [Activa] bit NOT NULL,

    [Version] int NOT NULL,

    [FechaCreacionUtc] datetime2 NOT NULL,

    [CreadaPor] uniqueidentifier NOT NULL,

    [ReglaAnteriorId] uniqueidentifier NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_ReglasValidacion] PRIMARY KEY ([Id])

);
GO

CREATE TABLE [Reportes] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [EstadoReporte] int NOT NULL,

    [Resumen] nvarchar(4000) NULL,

    [GeneradoPorUsuarioId] uniqueidentifier NULL,

    [Version] int NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_Reportes] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_Reportes_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,

    CONSTRAINT [FK_Reportes_Usuario_GeneradoPorUsuarioId] FOREIGN KEY ([GeneradoPorUsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION

);
GO

CREATE TABLE [SellosIntegridad] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [CodigoSello] nvarchar(50) NOT NULL,

    [Nombre] nvarchar(max) NOT NULL,

    [Nivel] int NOT NULL,

    [UrlQr] nvarchar(500) NOT NULL,

    [FirmaDigital] nvarchar(1000) NOT NULL,

    [FechaEmisionUtc] datetime2 NOT NULL,

    [FechaExpiracionUtc] datetime2 NOT NULL,

    [Estado] int NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_SellosIntegridad] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION

);
GO

CREATE TABLE [UsuarioLegacy] (

    [IdUsuario] uniqueidentifier NOT NULL,

    [Nombre] nvarchar(100) NOT NULL,

    [Apellido] nvarchar(100) NOT NULL,

    [NombreCompleto] AS [Nombre] + ' ' + [Apellido] PERSISTED,

    [Email] nvarchar(100) NOT NULL,

    [ContrasenaHash] nvarchar(255) NOT NULL,

    [Telefono] nvarchar(15) NOT NULL,

    [Cedula] nvarchar(15) NOT NULL,
    [Rnc] varchar(20) NULL,

    CONSTRAINT [PK_UsuarioLegacy] PRIMARY KEY ([IdUsuario])

);
GO

CREATE TABLE [ValidacionesAyuntamiento] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [Municipio] nvarchar(max) NOT NULL,

    [Result] int NOT NULL,

    [Detalle] nvarchar(max) NULL,

    [FechaConsulta] datetime2 NOT NULL,

    [DisponibilidadServicio] bit NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_ValidacionesAyuntamiento] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_ValidacionesAyuntamiento_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE

);
GO

CREATE TABLE [ValidacionesDgii] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [Rnc] nvarchar(max) NOT NULL,

    [Status] int NOT NULL,

    [TieneDeudas] bit NOT NULL,

    [FechaConsulta] datetime2 NOT NULL,

    [ErrorMessage] nvarchar(max) NULL,

    [OrigenDatos] nvarchar(max) NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_ValidacionesDgii] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE

);
GO

CREATE TABLE [ResultadosCrediticios] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [ConsentimientoId] uniqueidentifier NOT NULL,

    [ScoreCrediticio] int NOT NULL,

    [PorcentajeEndeudamiento] decimal(5,2) NOT NULL,

    [CantidadAtrasosUltimos12Meses] int NOT NULL,

    [NivelRiesgo] int NOT NULL,

    [FechaConsultaUtc] datetime2 NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_ResultadosCrediticios] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_ResultadosCrediticios_ConsentimientosFinancieros_ConsentimientoId] FOREIGN KEY ([ConsentimientoId]) REFERENCES [ConsentimientosFinancieros] ([Id]) ON DELETE NO ACTION,

    CONSTRAINT [FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION

);
GO

CREATE TABLE [AlertasValidacion] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [DocumentoId] uniqueidentifier NULL,

    [Type] int NOT NULL,

    [Category] int NOT NULL,

    [Titulo] nvarchar(max) NOT NULL,

    [Descripcion] nvarchar(max) NOT NULL,

    [Recomendacion] nvarchar(max) NULL,

    [Resuelta] bit NOT NULL,

    [FechaGeneracion] datetime2 NOT NULL,

    [NivelRiesgo] nvarchar(max) NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_AlertasValidacion] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_AlertasValidacion_Documentos_DocumentoId] FOREIGN KEY ([DocumentoId]) REFERENCES [Documentos] ([Id]),

    CONSTRAINT [FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE

);
GO

CREATE TABLE [Certificaciones] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [ReporteId] uniqueidentifier NULL,

    [CodigoVerificacion] nvarchar(max) NOT NULL,

    [EstadoCertificacion] int NOT NULL,

    [FechaEmisionUtc] datetime2 NOT NULL,

    [FechaVigenciaUtc] datetime2 NULL,

    [UrlVerificacion] nvarchar(max) NOT NULL,

    [ScoreIntegridad] int NULL,

    [EstadoIntegridad] int NOT NULL,

    [Version] int NOT NULL,

    [EmisorId] uniqueidentifier NOT NULL,

    [Revocado] bit NOT NULL,

    [MotivoRevocacion] nvarchar(max) NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_Certificaciones] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_Certificaciones_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,

    CONSTRAINT [FK_Certificaciones_Reportes_ReporteId] FOREIGN KEY ([ReporteId]) REFERENCES [Reportes] ([Id])

);
GO

CREATE TABLE [Validaciones] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [DocumentoId] uniqueidentifier NULL,

    [FuenteValidacion] nvarchar(200) NOT NULL,

    [EstadoValidacion] int NOT NULL,

    [EsLegitimo] bit NULL,

    [PorcentajeIntegridad] float NULL,

    [Detalle] nvarchar(2000) NULL,

    [CamposValidadosJson] nvarchar(max) NULL,

    [SelloId] uniqueidentifier NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_Validaciones] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_Validaciones_Documentos_DocumentoId] FOREIGN KEY ([DocumentoId]) REFERENCES [Documentos] ([Id]) ON DELETE NO ACTION,

    CONSTRAINT [FK_Validaciones_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,

    CONSTRAINT [FK_Validaciones_SellosIntegridad_SelloId] FOREIGN KEY ([SelloId]) REFERENCES [SellosIntegridad] ([Id]) ON DELETE SET NULL

);
GO

CREATE TABLE [DatoValidado] (

    [Id] int NOT NULL IDENTITY,

    [Campo] nvarchar(max) NOT NULL,

    [ValorEsperado] nvarchar(max) NOT NULL,

    [ValorEncontrado] nvarchar(max) NOT NULL,

    [Coincide] bit NOT NULL,

    [MetodoComparacion] nvarchar(max) NULL,

    [ValidacionId] uniqueidentifier NOT NULL,

    CONSTRAINT [PK_DatoValidado] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_DatoValidado_Validaciones_ValidacionId] FOREIGN KEY ([ValidacionId]) REFERENCES [Validaciones] ([Id]) ON DELETE CASCADE

);
GO

CREATE TABLE [Hallazgos] (

    [Id] uniqueidentifier NOT NULL,

    [ProyectoId] uniqueidentifier NOT NULL,

    [ValidacionId] uniqueidentifier NULL,

    [Severidad] int NOT NULL,

    [Codigo] nvarchar(50) NOT NULL,

    [Titulo] nvarchar(200) NOT NULL,

    [Descripcion] nvarchar(2000) NOT NULL,

    [Recomendacion] nvarchar(2000) NULL,

    [SistemaOrigen] nvarchar(max) NULL,

    [Resuelto] bit NOT NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_Hallazgos] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_Hallazgos_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,

    CONSTRAINT [FK_Hallazgos_Validaciones_ValidacionId] FOREIGN KEY ([ValidacionId]) REFERENCES [Validaciones] ([Id]) ON DELETE NO ACTION

);
GO

CREATE TABLE [ResultadosRegla] (

    [Id] uniqueidentifier NOT NULL,

    [ValidacionId] uniqueidentifier NOT NULL,

    [RuleCode] nvarchar(50) NOT NULL,

    [RuleName] nvarchar(200) NOT NULL,

    [Status] int NOT NULL,

    [Message] nvarchar(1000) NOT NULL,

    [Severity] int NULL,

    [RelatedDocumentId] uniqueidentifier NULL,

    [CreatedAtUtc] datetime2 NOT NULL,

    [UpdatedAtUtc] datetime2 NULL,

    CONSTRAINT [PK_ResultadosRegla] PRIMARY KEY ([Id]),

    CONSTRAINT [FK_ResultadosRegla_Validaciones_ValidacionId] FOREIGN KEY ([ValidacionId]) REFERENCES [Validaciones] ([Id]) ON DELETE CASCADE

);
GO

CREATE INDEX [IX_AlertasValidacion_DocumentoId] ON [AlertasValidacion] ([DocumentoId]);
GO

CREATE INDEX [IX_AlertasValidacion_ProyectoId] ON [AlertasValidacion] ([ProyectoId]);
GO

CREATE INDEX [IX_Auditorias_ProyectoId] ON [Auditorias] ([ProyectoId]);
GO

CREATE INDEX [IX_Auditorias_UsuarioId] ON [Auditorias] ([UsuarioId]);
GO

CREATE INDEX [IX_Certificaciones_ProyectoId] ON [Certificaciones] ([ProyectoId]);
GO

CREATE INDEX [IX_Certificaciones_ReporteId] ON [Certificaciones] ([ReporteId]);
GO

CREATE INDEX [IX_ConsentimientosFinancieros_UsuarioId] ON [ConsentimientosFinancieros] ([UsuarioId]);
GO

CREATE INDEX [IX_DatoValidado_ValidacionId] ON [DatoValidado] ([ValidacionId]);
GO

CREATE INDEX [IX_DeteccionesDuplicidad_ProyectoDuplicadoId] ON [DeteccionesDuplicidad] ([ProyectoDuplicadoId]);
GO

CREATE INDEX [IX_DeteccionesDuplicidad_ProyectoId] ON [DeteccionesDuplicidad] ([ProyectoId]);
GO

CREATE INDEX [IX_Documentos_Activo] ON [Documentos] ([Activo]);
GO

CREATE INDEX [IX_Documentos_ProyectoId] ON [Documentos] ([ProyectoId]);
GO

CREATE INDEX [IX_Documentos_TipoDocumento] ON [Documentos] ([TipoDocumento]);
GO

CREATE INDEX [IX_Hallazgos_ProyectoId] ON [Hallazgos] ([ProyectoId]);
GO

CREATE INDEX [IX_Hallazgos_ValidacionId] ON [Hallazgos] ([ValidacionId]);
GO

CREATE INDEX [IX_Reportes_GeneradoPorUsuarioId] ON [Reportes] ([GeneradoPorUsuarioId]);
GO

CREATE INDEX [IX_Reportes_ProyectoId] ON [Reportes] ([ProyectoId]);
GO

CREATE INDEX [IX_ResultadosCrediticios_ConsentimientoId] ON [ResultadosCrediticios] ([ConsentimientoId]);
GO

CREATE INDEX [IX_ResultadosCrediticios_ProyectoId] ON [ResultadosCrediticios] ([ProyectoId]);
GO

CREATE INDEX [IX_ResultadosRegla_ValidacionId] ON [ResultadosRegla] ([ValidacionId]);
GO

CREATE INDEX [IX_SellosIntegridad_ProyectoId] ON [SellosIntegridad] ([ProyectoId]);
GO

CREATE INDEX [IX_Validaciones_DocumentoId] ON [Validaciones] ([DocumentoId]);
GO

CREATE INDEX [IX_Validaciones_ProyectoId] ON [Validaciones] ([ProyectoId]);
GO

CREATE INDEX [IX_Validaciones_SelloId] ON [Validaciones] ([SelloId]);
GO

CREATE INDEX [IX_ValidacionesAyuntamiento_ProyectoId] ON [ValidacionesAyuntamiento] ([ProyectoId]);
GO

CREATE INDEX [IX_ValidacionesDgii_ProyectoId] ON [ValidacionesDgii] ([ProyectoId]);
GO


-- Tabla de historial de migraciones de EF Core
CREATE TABLE [__EFMigrationsHistory] (
    [MigrationId] NVARCHAR(150) NOT NULL PRIMARY KEY,
    [ProductVersion] NVARCHAR(32) NOT NULL
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES ('20260625043417_InitialCreate', '8.0.6');
GO
