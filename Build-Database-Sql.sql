SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================
-- DATABASE
-- ============================================================
IF DB_ID(N'verifinca-spm-uce-2026') IS NULL
    CREATE DATABASE [verifinca-spm-uce-2026];
GO

USE [verifinca-spm-uce-2026];
GO

-- ============================================================
-- Core tables (no foreign-key dependencies)
-- ============================================================

IF OBJECT_ID(N'[Usuario]', 'U') IS NULL
CREATE TABLE Usuario (
    IdUsuario                   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Nombre                      VARCHAR(100)  NOT NULL,
    Apellido                    VARCHAR(100)  NOT NULL,
    NombreCompleto AS (Nombre + ' ' + Apellido) PERSISTED,
    Email                       VARCHAR(200)  NOT NULL UNIQUE
        CONSTRAINT CK_Usuario_Email CHECK (Email LIKE '%_@__%.__%'),
    ContrasenaHash              VARCHAR(500)  NOT NULL,
    Telefono                    VARCHAR(15)   NOT NULL,
    Cedula                      VARCHAR(15)   NOT NULL,
    Rol                         INT           NOT NULL DEFAULT 2,
    Activo                      BIT           NOT NULL DEFAULT 1,
    EmailVerificado             BIT           NOT NULL DEFAULT 0,
    TokenVerificacion           VARCHAR(MAX)  NULL,
    TokenVerificacionExpiraUtc  DATETIME2     NULL,
    PlanSuscripcionId           UNIQUEIDENTIFIER NULL,
    ConsultasUsadas             INT           NOT NULL DEFAULT 0,
    CreatedAtUtc                DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc                DATETIME2     NULL,
    RowVersion                  TIMESTAMP
);
GO

-- UsuarioLegacy: only create as a VIEW if the EF Core TABLE does not exist yet.
-- (EF Core creates UsuarioLegacy as a table; the view is used only in the
--  legacy/raw-SQL layer when EF Core has not run yet.)
IF OBJECT_ID(N'[UsuarioLegacy]', 'V') IS NULL
   AND OBJECT_ID(N'[UsuarioLegacy]', 'U') IS NULL
EXEC('
CREATE VIEW UsuarioLegacy AS
SELECT IdUsuario, Nombre, Apellido, NombreCompleto, Email,
       ContrasenaHash, Telefono, Cedula,
       NULL AS Rnc,
       PlanSuscripcionId, ConsultasUsadas
FROM   Usuario
');
GO

IF OBJECT_ID(N'[TipoDocumento]', 'U') IS NULL
CREATE TABLE TipoDocumento (
    IdTipoDcumento  UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Descripcion     VARCHAR(100)
);
GO

IF OBJECT_ID(N'[Permisos]', 'U') IS NULL
CREATE TABLE Permisos (
    IdPermiso   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Descripcion VARCHAR(100)
);
GO

IF OBJECT_ID(N'[Perfiles]', 'U') IS NULL
CREATE TABLE Perfiles (
    IdPerfil      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombrePerfil  VARCHAR(100)
);
GO

IF OBJECT_ID(N'[Acceso]', 'U') IS NULL
CREATE TABLE Acceso (
    IdAcceso  UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdPerfil  UNIQUEIDENTIFIER,
    IdUsuario UNIQUEIDENTIFIER,
    FOREIGN KEY (IdPerfil)  REFERENCES Perfiles(IdPerfil),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

IF OBJECT_ID(N'[PerfilPermiso]', 'U') IS NULL
CREATE TABLE PerfilPermiso (
    IdPerfil  UNIQUEIDENTIFIER,
    IdPermiso UNIQUEIDENTIFIER,
    PRIMARY KEY (IdPerfil, IdPermiso),
    FOREIGN KEY (IdPerfil)  REFERENCES Perfiles(IdPerfil),
    FOREIGN KEY (IdPermiso) REFERENCES Permisos(IdPermiso)
);
GO

IF OBJECT_ID(N'[Provincia]', 'U') IS NULL
BEGIN
    CREATE TABLE Provincia (
        IdProvincia     UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        NombreProvincia VARCHAR(100) NOT NULL,
        Latitud         DECIMAL(18,10) NULL,
        Longitud        DECIMAL(18,10) NULL
    );

    INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES
        ('Distrito Nacional', 18.47186, -69.93988),
        ('Azua',              18.45320, -70.73490),
        ('Baoruco',           18.50000, -71.30000),
        ('Barahona',          18.20850, -71.10080),
        ('Dajabón',           19.54000, -71.70000),
        ('Duarte',            19.30000, -70.25000),
        ('El Seibo',          18.76000, -69.04000),
        ('Elías Piña',        18.88000, -71.68000),
        ('Espaillat',         19.50000, -70.50000),
        ('Hato Mayor',        18.76000, -69.25000),
        ('Hermanas Mirabal',  19.38000, -70.35000),
        ('Independencia',     18.40000, -71.60000),
        ('La Altagracia',     18.61890, -68.70830),
        ('La Romana',         18.42730, -68.97280),
        ('La Vega',           19.22000, -70.53000),
        ('María Trinidad Sánchez', 19.38000, -69.95000),
        ('Monseñor Nouel',    18.91000, -70.43000),
        ('Monte Cristi',      19.72000, -71.58000),
        ('Monte Plata',       18.80700, -69.78900),
        ('Pedernales',        18.03000, -71.74000),
        ('Peravia',           18.28000, -70.33000),
        ('Puerto Plata',      19.79340, -70.68840),
        ('Samaná',            19.20000, -69.33000),
        ('San Cristóbal',     18.41667, -70.10000),
        ('San José de Ocoa',  18.55000, -70.50000),
        ('San Juan',          18.80580, -71.22990),
        ('San Pedro de Macorís', 18.45390, -69.30820),
        ('Sánchez Ramírez',   19.00160, -70.14920),
        ('Santiago',          19.45170, -70.69703),
        ('Santiago Rodríguez',19.48000, -71.34000),
        ('Santo Domingo',     18.54118, -69.83988),
        ('Valverde',          19.58000, -71.07000);
END
GO

IF OBJECT_ID(N'[Municipio]', 'U') IS NULL
BEGIN
    CREATE TABLE Municipio (
        IdMunicipio     UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        IdProvincia     UNIQUEIDENTIFIER,
        NombreMunicipio VARCHAR(100),
        Latitud         DECIMAL(9,6) NULL,
        Longitud        DECIMAL(9,6) NULL,
        FOREIGN KEY (IdProvincia) REFERENCES Provincia(IdProvincia)
    );

    INSERT INTO Municipio (IdProvincia, NombreMunicipio, Latitud, Longitud)
    SELECT p.IdProvincia, m.NombreMunicipio, m.Latitud, m.Longitud
    FROM (VALUES
        ('Distrito Nacional', 'Santo Domingo de Guzman', 18.485, -69.93),
        ('Santo Domingo', 'Santo Domingo Este', 18.526, -69.802),
        ('Santo Domingo', 'Santo Domingo Oeste', 18.463, -69.992),
        ('Santo Domingo', 'Santo Domingo Norte', 18.612, -69.912),
        ('Santo Domingo', 'Boca Chica', 18.457, -69.615),
        ('Santo Domingo', 'San Antonio de Guerra', 18.581, -69.654),
        ('Santiago', 'Santiago de los Caballeros', 19.517, -70.697),
        ('Santiago', 'Tamboril', 19.488, -70.608),
        ('Santiago', 'Villa Gonzalez', 19.45, -70.7),
        ('Santiago', 'Licey al Medio', 19.428, -70.619),
        ('Santiago', 'Bisono', 19.45, -70.7),
        ('La Altagracia', 'Higuey', 18.708, -68.687),
        ('La Altagracia', 'San Rafael del Yuma', 18.373, -68.727),
        ('San Pedro de Macoris', 'San Pedro de Macoris', 18.482, -69.26),
        ('San Pedro de Macoris', 'Consuelo', 18.594, -69.253),
        ('San Pedro de Macoris', 'Ramon Santana', 18.45, -69.3),
        ('San Pedro de Macoris', 'Quisqueya', 18.546, -69.423),
        ('La Romana', 'La Romana', 18.155, -68.677),
        ('La Romana', 'Guaymate', 18.567, -68.951),
        ('La Romana', 'Villa Hermosa', 18.451, -69.051),
        ('Puerto Plata', 'San Felipe de Puerto Plata', 19.71, -70.692),
        ('Puerto Plata', 'Sosua', 19.666, -70.491),
        ('Puerto Plata', 'Cabarete', 19.7833, -70.6833),
        ('Puerto Plata', 'Imbert', 19.765, -70.872),
        ('Puerto Plata', 'Altamira', 19.651, -70.793),
        ('Duarte', 'San Francisco de Macoris', 19.339, -70.206),
        ('Duarte', 'Pimentel', 19.216, -70.147),
        ('Duarte', 'Castillo', 19.24, -70.028),
        ('Duarte', 'Villa Riva', 19.152, -69.903),
        ('San Cristobal', 'San Cristobal', 18.415, -70.11),
        ('San Cristobal', 'Haina', 18.432, -70.031),
        ('San Cristobal', 'Yaguate', 18.34, -70.188),
        ('San Cristobal', 'Villa Altagracia', 18.656, -70.226),
        ('La Vega', 'Concepcion de La Vega', 19.208, -70.458),
        ('La Vega', 'Constanza', 18.865, -70.691),
        ('La Vega', 'Jarabacoa', 19.106, -70.702),
        ('Espaillat', 'Moca', 19.478, -70.505),
        ('Espaillat', 'Gaspar Hernandez', 19.614, -70.241),
        ('Espaillat', 'Cayetano Germosen', 19.344, -70.472),
        ('Monsenor Nouel', 'Bonao', 18.943, -70.441),
        ('Monsenor Nouel', 'Maimon', 18.888, -70.27),
        ('Monsenor Nouel', 'Piedra Blanca', 18.812, -70.331),
        ('Peravia', 'Bani', 18.351, -70.37),
        ('Peravia', 'Nizao', 18.269, -70.21),
        ('San Juan', 'San Juan de la Maguana', 18.897, -71.326),
        ('San Juan', 'Las Matas de Farfan', 18.954, -71.493),
        ('San Juan', 'El Cercado', 18.71, -71.512),
        ('Barahona', 'Santa Cruz de Barahona', 18.187, -71.139),
        ('Barahona', 'Cabral', 18.195, -71.248),
        ('Barahona', 'Enriquillo', 17.979, -71.339),
        ('Barahona', 'Vicente Noble', 18.41, -71.088),
        ('Samana', 'Santa Barbara de Samana', 19.272, -69.32),
        ('Samana', 'Sanchez', 19.143, -69.678),
        ('Samana', 'Las Terrenas', 19.284, -69.566),
        ('Monte Plata', 'Monte Plata', 18.76, -69.839),
        ('Monte Plata', 'Bayaguana', 18.815, -69.592),
        ('Monte Plata', 'Sabana Grande de Boya', 18.976, -69.775),
        ('Monte Plata', 'Yamasao', 18.768, -70.085),
        ('Azua', 'Azua de Compostela', 18.459, -70.754),
        ('Azua', 'Las Yayas de Viajama', 18.594, -71.034),
        ('Azua', 'Padre Las Casas', 18.833, -70.895),
        ('Bahoruco', 'Neiba', 18.419, -71.262),
        ('Bahoruco', 'Galvan', 18.4833, -71.4167),
        ('Bahoruco', 'Villa Jaragua', 18.544, -71.493),
        ('Dajabon', 'Dajabon', 19.571, -71.622),
        ('Dajabon', 'Loma de Cabrera', 19.433, -71.618),
        ('Dajabon', 'Restauracion', 19.304, -71.633),
        ('El Seibo', 'Santa Cruz de El Seibo', 18.741, -69.031),
        ('El Seibo', 'Miches', 18.962, -68.981),
        ('Elias Pina', 'Comendador', 18.919, -71.696),
        ('Elias Pina', 'Banica', 19.018, -71.645),
        ('Hato Mayor', 'Hato Mayor del Rey', 18.709, -69.326),
        ('Hato Mayor', 'Sabana de la Mar', 19.008, -69.412),
        ('Hato Mayor', 'El Valle', 18.944, -69.385),
        ('Hermanas Mirabal', 'Salcedo', 19.447, -70.389),
        ('Hermanas Mirabal', 'Tenares', 19.448, -70.307),
        ('Hermanas Mirabal', 'Villa Tapia', 19.291, -70.39),
        ('Independencia', 'Jimani', 18.501, -71.844),
        ('Independencia', 'Duverge', 18.32, -71.621),
        ('Independencia', 'La Descubierta', 18.598, -71.756),
        ('Maria Trinidad Sanchez', 'Nagua', 19.35, -70.003),
        ('Maria Trinidad Sanchez', 'Cabrera', 19.58, -69.98),
        ('Maria Trinidad Sanchez', 'El Factor', 19.294, -69.931),
        ('Maria Trinidad Sanchez', 'Rio San Juan', 19.3833, -69.85),
        ('Monte Cristi', 'San Fernando de Monte Cristi', 19.76, -71.652),
        ('Monte Cristi', 'Guayubin', 19.688, -71.309),
        ('Monte Cristi', 'Villa Vasquez', 19.809, -71.443),
        ('Pedernales', 'Pedernales', 18.064, -71.567),
        ('Pedernales', 'Oviedo', 17.827, -71.46),
        ('Sanchez Ramirez', 'Cotui', 18.998, -70.131),
        ('Sanchez Ramirez', 'Fantino', 19.103, -70.303),
        ('Sanchez Ramirez', 'Cevicos', 19.007, -69.976),
        ('Santiago Rodriguez', 'Sabaneta', 19.369, -71.327),
        ('Santiago Rodriguez', 'Moncion', 19.391, -71.185),
        ('Valverde', 'Mao', 19.534, -71.042),
        ('Valverde', 'Esperanza', 19.628, -70.96),
        ('Valverde', 'Laguna Salada', 19.669, -71.101),
        ('San Jose de Ocoa', 'San Jose de Ocoa', 18.557, -70.439),
        ('San Jose de Ocoa', 'Sabana Larga', 18.645, -70.559)
    ) AS m(ProvinciaNombre, NombreMunicipio, Latitud, Longitud)
    JOIN Provincia p ON p.NombreProvincia = m.ProvinciaNombre;
END
GO

IF OBJECT_ID(N'[PlanSuscripcion]', 'U') IS NULL
CREATE TABLE PlanSuscripcion (
    Idsuscripcion      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombrePlan         VARCHAR(100),
    Precio             DECIMAL(10,2),
    AccesoApi          BIT NOT NULL DEFAULT 0,
    MaxConsultas       INT NOT NULL DEFAULT 0,
    MaxProyectos       INT NOT NULL DEFAULT 0,
    MultiUsuario       BIT NOT NULL DEFAULT 0,
    PresentacionPublica BIT NOT NULL DEFAULT 0,
    QrIncluido         BIT NOT NULL DEFAULT 0
);
GO

IF OBJECT_ID(N'[PlanCaracteristica]', 'U') IS NULL
CREATE TABLE PlanCaracteristica (
    IdPlan        UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Idsuscripcion UNIQUEIDENTIFIER,
    Caracteristica VARCHAR(255),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

IF OBJECT_ID(N'[ProyectosInmobiliarios]', 'U') IS NULL
CREATE TABLE ProyectosInmobiliarios (
    IdProyecto          UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario           UNIQUEIDENTIFIER NOT NULL,
    IdMunicipio         UNIQUEIDENTIFIER NULL,
    NombreProyecto      VARCHAR(200) NOT NULL,
    CodigoInterno       VARCHAR(50)  NOT NULL UNIQUE,
    UbicacionTexto      VARCHAR(500) NOT NULL,
    UbicacionGps        VARCHAR(100) NULL,
    ValorEstimado       DECIMAL(18,2) NULL,
    DatosDesarrollador  VARCHAR(500) NULL,
    RncDesarrollador    VARCHAR(50)  NULL,
    Matricula           VARCHAR(100) NULL,
    Categoria           INT NOT NULL,
    DesignacionCatastral VARCHAR(200) NULL,
    Status              INT NOT NULL,
    EstadoIntegridad    INT NOT NULL,
    EstadoJuridico      INT NOT NULL DEFAULT 0,
    SelladoBloqueado    BIT NOT NULL DEFAULT 0,
    EstatusDescripcion  VARCHAR(100) NULL,
    CreatedAtUtc        DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc        DATETIME2 NULL,
    RowVersion          TIMESTAMP,
    FOREIGN KEY (IdUsuario)   REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

IF OBJECT_ID(N'[DGII]', 'U') IS NULL
CREATE TABLE DGII (
    Rnc                 VARCHAR(20)  PRIMARY KEY,
    NombreRazonSocial   VARCHAR(250) NOT NULL,
    NombreComercial     VARCHAR(250) NULL,
    Categoria           VARCHAR(100) NULL,
    RegimenPagos        VARCHAR(100) NULL,
    Estado              VARCHAR(50)  NULL,
    ActividadEconomica  VARCHAR(250) NULL,
    AdministracionLocal VARCHAR(100) NULL,
    FacturadorElectronico VARCHAR(50) NULL,
    LicenciasVhm        VARCHAR(100) NULL,
    FechaModificacion   DATETIME2    NULL
);
GO

IF OBJECT_ID(N'[TipoInmoviliario]', 'U') IS NULL
CREATE TABLE TipoInmoviliario (
    IdMoviliario UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Tipo         VARCHAR(100)
);
GO

IF OBJECT_ID(N'[Documento]', 'U') IS NULL
CREATE TABLE Documento (
    IdDocumento    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto     UNIQUEIDENTIFIER,
    IdTipoDcumento UNIQUEIDENTIFIER,
    RutaDocumento  VARCHAR(255),
    FOREIGN KEY (IdProyecto)     REFERENCES ProyectosInmobiliarios(IdProyecto),
    FOREIGN KEY (IdTipoDcumento) REFERENCES TipoDocumento(IdTipoDcumento)
);
GO

IF OBJECT_ID(N'[SelloIntegridad]', 'U') IS NULL
CREATE TABLE SelloIntegridad (
    IdSello      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdDocumento  UNIQUEIDENTIFIER,
    HashSello    VARCHAR(255),
    FOREIGN KEY (IdDocumento) REFERENCES Documento(IdDocumento)
);
GO

IF OBJECT_ID(N'[LogProyectos]', 'U') IS NULL
CREATE TABLE LogProyectos (
    IdLog      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario  UNIQUEIDENTIFIER,
    IdProyecto UNIQUEIDENTIFIER,
    FechaHora  DATETIME DEFAULT GETDATE(),
    Accion     VARCHAR(100),
    FOREIGN KEY (IdUsuario)   REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdProyecto)  REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

IF OBJECT_ID(N'[EstudioSuelo]', 'U') IS NULL
CREATE TABLE EstudioSuelo (
    IdESuelo   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto UNIQUEIDENTIFIER,
    FechaEstudio DATE,
    Resultado  TEXT,
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

IF OBJECT_ID(N'[PermisoSuelo]', 'U') IS NULL
CREATE TABLE PermisoSuelo (
    IdPSuelo         UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NumeroPermiso    VARCHAR(50)  NULL,
    NumeroExpediente VARCHAR(50)  NULL,
    FechaEmision     DATE         NULL,
    Rnc              VARCHAR(20)  NULL,
    Provincia        VARCHAR(100) NULL,
    Municipio        VARCHAR(100) NULL,
    Latitud          DECIMAL(9,6) NULL,
    Longitud         DECIMAL(9,6) NULL,
    Superficie       DECIMAL(18,2) NULL,
    TienePermiso     VARCHAR(10)  NULL,
    Documento        VARCHAR(250) NULL
);
GO

IF OBJECT_ID(N'[CertiMivhed]', 'U') IS NULL
CREATE TABLE CertiMivhed (
    IdMivhed    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto  UNIQUEIDENTIFIER,
    Certificado VARCHAR(100),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
);
GO

IF OBJECT_ID(N'[CatastroTitulo]', 'U') IS NULL
CREATE TABLE CatastroTitulo (
    IdCatastroTitulo UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    CodigoDesignacionCatastral VARCHAR(20) NULL,
    NumeroTitulo     VARCHAR(50)  NULL,
    Rnc              VARCHAR(20)  NULL,
    Provincia        VARCHAR(100) NULL,
    Municipio        VARCHAR(100) NULL,
    Latitud          DECIMAL(9,6) NULL,
    Longitud         DECIMAL(9,6) NULL,
    Superficie       DECIMAL(18,2) NULL,
    Matricula        VARCHAR(50)  NULL
);
GO

IF OBJECT_ID(N'[PagoIPI]', 'U') IS NULL
CREATE TABLE PagoIPI (
    Rnc           VARCHAR(20)   PRIMARY KEY,
    Cuota_ipi     DECIMAL(18,2) NOT NULL,
    Estatus       VARCHAR(20)   NOT NULL,
    FechaCreacion DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

IF OBJECT_ID(N'[TarifaSueloAyuntamiento]', 'U') IS NULL
CREATE TABLE TarifaSueloAyuntamiento (
    IdTarifaAyuntamiento UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdMunicipio          UNIQUEIDENTIFIER,
    Monto                DECIMAL(10,2),
    Anio                 INT,
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

IF OBJECT_ID(N'[AyuntamientoTarifa]', 'U') IS NULL
CREATE TABLE AyuntamientoTarifa (
    IdAyuntamiento       UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdTarifaAyuntamiento UNIQUEIDENTIFIER,
    IdMunicipio          UNIQUEIDENTIFIER,
    FOREIGN KEY (IdTarifaAyuntamiento) REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento),
    FOREIGN KEY (IdMunicipio)          REFERENCES Municipio(IdMunicipio)
);
GO

IF OBJECT_ID(N'[SolvenciaFinanciera]', 'U') IS NULL
CREATE TABLE SolvenciaFinanciera (
    IdSolvencia  UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdMoviliario UNIQUEIDENTIFIER,
    FechaEmision DATE,
    Monto        DECIMAL(10,2),
    FOREIGN KEY (IdMoviliario) REFERENCES TipoInmoviliario(IdMoviliario)
);
GO

IF OBJECT_ID(N'[ApiGobernanza]', 'U') IS NULL
CREATE TABLE ApiGobernanza (
    IdApiGobernanza UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    NombreApi       VARCHAR(100),
    Endpoint        VARCHAR(255)
);
GO

IF OBJECT_ID(N'[Recibo]', 'U') IS NULL
CREATE TABLE Recibo (
    IdPago    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario UNIQUEIDENTIFIER,
    Monto     DECIMAL(10,2),
    FechaPago DATE,
    Detalle   VARCHAR(500) NULL,
    Categoria VARCHAR(100) NULL,
    Desglose  VARCHAR(MAX) NULL,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

IF OBJECT_ID(N'[Pagos]', 'U') IS NULL
CREATE TABLE Pagos (
    IdPago          UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario       UNIQUEIDENTIFIER,
    IdApiGobernanza UNIQUEIDENTIFIER,
    Idsuscripcion   UNIQUEIDENTIFIER,
    Monto           DECIMAL(10,2),
    FechaPago       DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdUsuario)       REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdApiGobernanza) REFERENCES ApiGobernanza(IdApiGobernanza),
    FOREIGN KEY (Idsuscripcion)   REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

IF OBJECT_ID(N'[LogPagos]', 'U') IS NULL
CREATE TABLE LogPagos (
    IdLog         UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Idpago        UNIQUEIDENTIFIER,
    IdUsuario     UNIQUEIDENTIFIER,
    Idsuscripcion UNIQUEIDENTIFIER,
    FechaLog      DATETIME DEFAULT GETDATE(),
    Estado        VARCHAR(50),
    FOREIGN KEY (Idpago)        REFERENCES Pagos(IdPago),
    FOREIGN KEY (IdUsuario)     REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (Idsuscripcion) REFERENCES PlanSuscripcion(Idsuscripcion)
);
GO

IF OBJECT_ID(N'[Consultas]', 'U') IS NULL
CREATE TABLE Consultas (
    IdConsulta  UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Descripcion VARCHAR(255)
);
GO

IF OBJECT_ID(N'[FremiunConsultas_Log]', 'U') IS NULL
CREATE TABLE FremiunConsultas_Log (
    IdConsultaLog  UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto     UNIQUEIDENTIFIER,
    IdConsulta     UNIQUEIDENTIFIER,
    IdUsuario      UNIQUEIDENTIFIER,
    FechaConsulta  DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto),
    FOREIGN KEY (IdConsulta) REFERENCES Consultas(IdConsulta),
    FOREIGN KEY (IdUsuario)  REFERENCES Usuario(IdUsuario)
);
GO

IF OBJECT_ID(N'[FremiunProyectos_Log]', 'U') IS NULL
CREATE TABLE FremiunProyectos_Log (
    IdProyectoLog UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdProyecto    UNIQUEIDENTIFIER,
    IdUsuario     UNIQUEIDENTIFIER,
    FechaAcceso   DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto),
    FOREIGN KEY (IdUsuario)  REFERENCES Usuario(IdUsuario)
);
GO

IF OBJECT_ID(N'[LogConsultas]', 'U') IS NULL
CREATE TABLE LogConsultas (
    IdLog         UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdUsuario     UNIQUEIDENTIFIER,
    IdResultado   UNIQUEIDENTIFIER,
    FechaConsulta DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);
GO

IF OBJECT_ID(N'[Notificaciones]', 'U') IS NULL
CREATE TABLE Notificaciones (
    Id                 UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    UsuarioId          UNIQUEIDENTIFIER NOT NULL,
    Mensaje            NVARCHAR(MAX)    NOT NULL,
    Tipo               NVARCHAR(50)     NOT NULL,
    Leida              BIT              NOT NULL DEFAULT 0,
    FechaUtc           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    EnlaceRelacionado  NVARCHAR(MAX)    NULL,
    CreatedAtUtc       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc       DATETIME2        NULL
);
GO

-- ============================================================
-- ALTER TABLE ADD COLUMN — each column guarded individually
-- ============================================================

-- TipoInmoviliario.IdProyecto
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[TipoInmoviliario]') AND name = 'IdProyecto'
)
BEGIN
    ALTER TABLE TipoInmoviliario ADD IdProyecto UNIQUEIDENTIFIER;
    ALTER TABLE TipoInmoviliario ADD FOREIGN KEY (IdProyecto)
        REFERENCES ProyectosInmobiliarios(IdProyecto);
END
GO

-- Recibo.IdSello
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[Recibo]') AND name = 'IdSello'
)
BEGIN
    ALTER TABLE Recibo ADD IdSello UNIQUEIDENTIFIER;
    ALTER TABLE Recibo ADD FOREIGN KEY (IdSello)
        REFERENCES SelloIntegridad(IdSello);
END
GO

-- ProyectosInmobiliarios.IdMivhed
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[ProyectosInmobiliarios]') AND name = 'IdMivhed'
)
BEGIN
    ALTER TABLE ProyectosInmobiliarios ADD IdMivhed UNIQUEIDENTIFIER;
    ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdMivhed)
        REFERENCES CertiMivhed(IdMivhed);
END
GO

-- ProyectosInmobiliarios.IdCatastroTitulo
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[ProyectosInmobiliarios]') AND name = 'IdCatastroTitulo'
)
BEGIN
    ALTER TABLE ProyectosInmobiliarios ADD IdCatastroTitulo UNIQUEIDENTIFIER;
    ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdCatastroTitulo)
        REFERENCES CatastroTitulo(IdCatastroTitulo);
END
GO

-- ProyectosInmobiliarios.IdTarifaAyuntamiento
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[ProyectosInmobiliarios]') AND name = 'IdTarifaAyuntamiento'
)
BEGIN
    ALTER TABLE ProyectosInmobiliarios ADD IdTarifaAyuntamiento UNIQUEIDENTIFIER;
    ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdTarifaAyuntamiento)
        REFERENCES TarifaSueloAyuntamiento(IdTarifaAyuntamiento);
END
GO

-- ProyectosInmobiliarios.IdPSuelo
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[ProyectosInmobiliarios]') AND name = 'IdPSuelo'
)
BEGIN
    ALTER TABLE ProyectosInmobiliarios ADD IdPSuelo UNIQUEIDENTIFIER;
    ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdPSuelo)
        REFERENCES PermisoSuelo(IdPSuelo);
END
GO

-- ProyectosInmobiliarios.IdESuelo
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[ProyectosInmobiliarios]') AND name = 'IdESuelo'
)
BEGIN
    ALTER TABLE ProyectosInmobiliarios ADD IdESuelo UNIQUEIDENTIFIER;
    ALTER TABLE ProyectosInmobiliarios ADD FOREIGN KEY (IdESuelo)
        REFERENCES EstudioSuelo(IdESuelo);
END
GO

-- Usuario -> PlanSuscripcion FK (only if not already present)
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID(N'[Usuario]')
      AND referenced_object_id = OBJECT_ID(N'[PlanSuscripcion]')
)
    ALTER TABLE Usuario ADD FOREIGN KEY (PlanSuscripcionId)
        REFERENCES PlanSuscripcion(Idsuscripcion);
GO

-- ============================================================
-- EF Core tables + migration history
-- (All guarded — EF Core may have already created these)
-- ============================================================

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
CREATE TABLE [__EFMigrationsHistory] (
    [MigrationId]   nvarchar(150) NOT NULL,
    [ProductVersion] nvarchar(32) NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
);
GO

IF OBJECT_ID(N'[Auditorias]', 'U') IS NULL
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
    CONSTRAINT [FK_Auditorias_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,
    CONSTRAINT [FK_Auditorias_Usuario_UsuarioId]
        FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
GO

IF OBJECT_ID(N'[ConsentimientosFinancieros]', 'U') IS NULL
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
    CONSTRAINT [FK_ConsentimientosFinancieros_Usuario_UsuarioId]
        FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
GO

IF OBJECT_ID(N'[DeteccionesDuplicidad]', 'U') IS NULL
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
    CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId]
        FOREIGN KEY ([ProyectoDuplicadoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]),
    CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'[Documentos]', 'U') IS NULL
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
    CONSTRAINT [FK_Documentos_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'[ReglasValidacion]', 'U') IS NULL
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

IF OBJECT_ID(N'[Reportes]', 'U') IS NULL
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
    CONSTRAINT [FK_Reportes_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,
    CONSTRAINT [FK_Reportes_Usuario_GeneradoPorUsuarioId]
        FOREIGN KEY ([GeneradoPorUsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
GO

IF OBJECT_ID(N'[SellosIntegridad]', 'U') IS NULL
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
    CONSTRAINT [FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION
);
GO

-- UsuarioLegacy: EF Core creates this as a TABLE; only create it here if absent
IF OBJECT_ID(N'[UsuarioLegacy]', 'U') IS NULL
CREATE TABLE [UsuarioLegacy] (
    [IdUsuario]      uniqueidentifier NOT NULL,
    [Nombre]         nvarchar(100)    NOT NULL,
    [Apellido]       nvarchar(100)    NOT NULL,
    [NombreCompleto] AS [Nombre] + ' ' + [Apellido] PERSISTED,
    [Email]          nvarchar(100)    NOT NULL,
    [ContrasenaHash] nvarchar(255)    NOT NULL,
    [Telefono]       nvarchar(15)     NOT NULL,
    [Cedula]         nvarchar(15)     NOT NULL,
    [Rnc]            varchar(20)      NULL,
    CONSTRAINT [PK_UsuarioLegacy] PRIMARY KEY ([IdUsuario])
);
GO

IF OBJECT_ID(N'[ValidacionesAyuntamiento]', 'U') IS NULL
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
    CONSTRAINT [FK_ValidacionesAyuntamiento_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'[ValidacionesDgii]', 'U') IS NULL
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
    CONSTRAINT [FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'[ResultadosCrediticios]', 'U') IS NULL
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
    CONSTRAINT [FK_ResultadosCrediticios_ConsentimientosFinancieros_ConsentimientoId]
        FOREIGN KEY ([ConsentimientoId]) REFERENCES [ConsentimientosFinancieros] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION
);
GO

IF OBJECT_ID(N'[AlertasValidacion]', 'U') IS NULL
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
    CONSTRAINT [FK_AlertasValidacion_Documentos_DocumentoId]
        FOREIGN KEY ([DocumentoId]) REFERENCES [Documentos] ([Id]),
    CONSTRAINT [FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'[Certificaciones]', 'U') IS NULL
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
    CONSTRAINT [FK_Certificaciones_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,
    CONSTRAINT [FK_Certificaciones_Reportes_ReporteId]
        FOREIGN KEY ([ReporteId]) REFERENCES [Reportes] ([Id])
);
GO

IF OBJECT_ID(N'[Validaciones]', 'U') IS NULL
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
    CONSTRAINT [FK_Validaciones_Documentos_DocumentoId]
        FOREIGN KEY ([DocumentoId]) REFERENCES [Documentos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Validaciones_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,
    CONSTRAINT [FK_Validaciones_SellosIntegridad_SelloId]
        FOREIGN KEY ([SelloId]) REFERENCES [SellosIntegridad] ([Id]) ON DELETE SET NULL
);
GO

IF OBJECT_ID(N'[DatoValidado]', 'U') IS NULL
CREATE TABLE [DatoValidado] (
    [Id] int NOT NULL IDENTITY,
    [Campo] nvarchar(max) NOT NULL,
    [ValorEsperado] nvarchar(max) NOT NULL,
    [ValorEncontrado] nvarchar(max) NOT NULL,
    [Coincide] bit NOT NULL,
    [MetodoComparacion] nvarchar(max) NULL,
    [ValidacionId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_DatoValidado] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DatoValidado_Validaciones_ValidacionId]
        FOREIGN KEY ([ValidacionId]) REFERENCES [Validaciones] ([Id]) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'[Hallazgos]', 'U') IS NULL
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
    CONSTRAINT [FK_Hallazgos_ProyectosInmobiliarios_ProyectoId]
        FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE CASCADE,
    CONSTRAINT [FK_Hallazgos_Validaciones_ValidacionId]
        FOREIGN KEY ([ValidacionId]) REFERENCES [Validaciones] ([Id]) ON DELETE NO ACTION
);
GO

IF OBJECT_ID(N'[ResultadosRegla]', 'U') IS NULL
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
    CONSTRAINT [FK_ResultadosRegla_Validaciones_ValidacionId]
        FOREIGN KEY ([ValidacionId]) REFERENCES [Validaciones] ([Id]) ON DELETE CASCADE
);
GO

-- ============================================================
-- Indexes — each wrapped in IF NOT EXISTS
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AlertasValidacion_DocumentoId'   AND object_id = OBJECT_ID(N'[AlertasValidacion]'))
    CREATE INDEX [IX_AlertasValidacion_DocumentoId]   ON [AlertasValidacion] ([DocumentoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AlertasValidacion_ProyectoId'     AND object_id = OBJECT_ID(N'[AlertasValidacion]'))
    CREATE INDEX [IX_AlertasValidacion_ProyectoId]    ON [AlertasValidacion] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Auditorias_ProyectoId'            AND object_id = OBJECT_ID(N'[Auditorias]'))
    CREATE INDEX [IX_Auditorias_ProyectoId]           ON [Auditorias] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Auditorias_UsuarioId'             AND object_id = OBJECT_ID(N'[Auditorias]'))
    CREATE INDEX [IX_Auditorias_UsuarioId]            ON [Auditorias] ([UsuarioId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Certificaciones_ProyectoId'       AND object_id = OBJECT_ID(N'[Certificaciones]'))
    CREATE INDEX [IX_Certificaciones_ProyectoId]      ON [Certificaciones] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Certificaciones_ReporteId'        AND object_id = OBJECT_ID(N'[Certificaciones]'))
    CREATE INDEX [IX_Certificaciones_ReporteId]       ON [Certificaciones] ([ReporteId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ConsentimientosFinancieros_UsuarioId' AND object_id = OBJECT_ID(N'[ConsentimientosFinancieros]'))
    CREATE INDEX [IX_ConsentimientosFinancieros_UsuarioId] ON [ConsentimientosFinancieros] ([UsuarioId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DatoValidado_ValidacionId'        AND object_id = OBJECT_ID(N'[DatoValidado]'))
    CREATE INDEX [IX_DatoValidado_ValidacionId]       ON [DatoValidado] ([ValidacionId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DeteccionesDuplicidad_ProyectoDuplicadoId' AND object_id = OBJECT_ID(N'[DeteccionesDuplicidad]'))
    CREATE INDEX [IX_DeteccionesDuplicidad_ProyectoDuplicadoId] ON [DeteccionesDuplicidad] ([ProyectoDuplicadoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DeteccionesDuplicidad_ProyectoId' AND object_id = OBJECT_ID(N'[DeteccionesDuplicidad]'))
    CREATE INDEX [IX_DeteccionesDuplicidad_ProyectoId] ON [DeteccionesDuplicidad] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Documentos_Activo'                AND object_id = OBJECT_ID(N'[Documentos]'))
    CREATE INDEX [IX_Documentos_Activo]               ON [Documentos] ([Activo]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Documentos_ProyectoId'            AND object_id = OBJECT_ID(N'[Documentos]'))
    CREATE INDEX [IX_Documentos_ProyectoId]           ON [Documentos] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Documentos_TipoDocumento'         AND object_id = OBJECT_ID(N'[Documentos]'))
    CREATE INDEX [IX_Documentos_TipoDocumento]        ON [Documentos] ([TipoDocumento]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Hallazgos_ProyectoId'             AND object_id = OBJECT_ID(N'[Hallazgos]'))
    CREATE INDEX [IX_Hallazgos_ProyectoId]            ON [Hallazgos] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Hallazgos_ValidacionId'           AND object_id = OBJECT_ID(N'[Hallazgos]'))
    CREATE INDEX [IX_Hallazgos_ValidacionId]          ON [Hallazgos] ([ValidacionId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reportes_GeneradoPorUsuarioId'    AND object_id = OBJECT_ID(N'[Reportes]'))
    CREATE INDEX [IX_Reportes_GeneradoPorUsuarioId]   ON [Reportes] ([GeneradoPorUsuarioId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reportes_ProyectoId'              AND object_id = OBJECT_ID(N'[Reportes]'))
    CREATE INDEX [IX_Reportes_ProyectoId]             ON [Reportes] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ResultadosCrediticios_ConsentimientoId' AND object_id = OBJECT_ID(N'[ResultadosCrediticios]'))
    CREATE INDEX [IX_ResultadosCrediticios_ConsentimientoId] ON [ResultadosCrediticios] ([ConsentimientoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ResultadosCrediticios_ProyectoId' AND object_id = OBJECT_ID(N'[ResultadosCrediticios]'))
    CREATE INDEX [IX_ResultadosCrediticios_ProyectoId] ON [ResultadosCrediticios] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ResultadosRegla_ValidacionId'     AND object_id = OBJECT_ID(N'[ResultadosRegla]'))
    CREATE INDEX [IX_ResultadosRegla_ValidacionId]    ON [ResultadosRegla] ([ValidacionId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SellosIntegridad_ProyectoId'      AND object_id = OBJECT_ID(N'[SellosIntegridad]'))
    CREATE INDEX [IX_SellosIntegridad_ProyectoId]     ON [SellosIntegridad] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Validaciones_DocumentoId'         AND object_id = OBJECT_ID(N'[Validaciones]'))
    CREATE INDEX [IX_Validaciones_DocumentoId]        ON [Validaciones] ([DocumentoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Validaciones_ProyectoId'          AND object_id = OBJECT_ID(N'[Validaciones]'))
    CREATE INDEX [IX_Validaciones_ProyectoId]         ON [Validaciones] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Validaciones_SelloId'             AND object_id = OBJECT_ID(N'[Validaciones]'))
    CREATE INDEX [IX_Validaciones_SelloId]            ON [Validaciones] ([SelloId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ValidacionesAyuntamiento_ProyectoId' AND object_id = OBJECT_ID(N'[ValidacionesAyuntamiento]'))
    CREATE INDEX [IX_ValidacionesAyuntamiento_ProyectoId] ON [ValidacionesAyuntamiento] ([ProyectoId]);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ValidacionesDgii_ProyectoId'      AND object_id = OBJECT_ID(N'[ValidacionesDgii]'))
    CREATE INDEX [IX_ValidacionesDgii_ProyectoId]     ON [ValidacionesDgii] ([ProyectoId]);
GO

-- ============================================================
-- Migration history seed row
-- ============================================================

IF NOT EXISTS (
    SELECT 1 FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = '20260625043417_InitialCreate'
)
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20260625043417_InitialCreate', '8.0.6');
GO
