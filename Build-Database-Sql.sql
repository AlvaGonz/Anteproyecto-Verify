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
    Email,
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
    EstadoProyecto INT NOT NULL,
    EstadoIntegridad INT NOT NULL,
    EstadoJuridico INT NOT NULL DEFAULT 0,
    SelladoBloqueado BIT NOT NULL DEFAULT 0,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAtUtc DATETIME2 NULL,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdMunicipio) REFERENCES Municipio(IdMunicipio)
);
GO

-- Tabla DgiiRnc
CREATE TABLE DgiiRnc (
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
    IdProyecto UNIQUEIDENTIFIER,
    NumeroPermiso VARCHAR(50),
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
    IdProyecto UNIQUEIDENTIFIER,
    NumeroTitulo VARCHAR(50),
    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)
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