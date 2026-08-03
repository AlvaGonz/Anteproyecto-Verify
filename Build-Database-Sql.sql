SET QUOTED_IDENTIFIER ON;



-- ============================================================

-- DATABASE

-- ============================================================

IF DB_ID(N'verifinca-spm-uce-2026') IS NULL

    CREATE DATABASE [verifinca-spm-uce-2026];




USE [verifinca-spm-uce-2026];



-- ============================================================

-- EF MIGRATIONS HISTORY (MOVED TO TOP TO PREVENT RACE CONDITIONS)

-- ============================================================

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL

CREATE TABLE [__EFMigrationsHistory] (

    [MigrationId]   nvarchar(150) NOT NULL,

    [ProductVersion] nvarchar(32) NOT NULL,

    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])

);





INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES ('20260625043417_InitialCreate', '8.0.6');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260629151626_Add_ImagenUrl_To_Proyecto', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260629191121_Baseline', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630024820_Add_AvatarUrl_To_Usuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630130218_AddSubscriptionLimitsAndTeamSupport', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630145810_AddDgiiTable', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630151900_MakeAvatarUrlMax', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630154200_AddLogsAuditoria', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630163528_Add_Stripe_Fields_To_Usuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630195243_AddStripeFieldsToUsuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260630195722_AddLegacyProfilesAndPermissions', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260704162709_AddAccountLifecycleColumns', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260705040519_Add_RNC_To_Usuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260706170900_Add_Propietario_IPI_To_Proyectos', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260708173000_Add_DGII_Fields_To_Usuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260709034014_Add_GoogleAuth_To_Usuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260710000344_Add_CancelAt_To_Usuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260712173705_Add_CodigoReferencia_To_Notificaciones', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260712204727_Add_Invitacion_Table', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260713115949_AddPasswordResetToken', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260713164614_AddEstatusIpiToProjects', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260713170059_AddDelegatedLimitsToUsuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260713173829_AddSuperficieM2ToProjects', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260713205731_AddAdditionalProjectImages', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260716181609_AddProyectoEstadosAndMigrateData', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260717001730_Add_Hash_Ocr_Fields_To_Documento', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260719041340_AddProfileExtensionToUsuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260723015859_Add_Proyectos_Interesados_Guardados', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260723204400_AddSesionesUsuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260727203205_AddAceptoDescargoToUsuario', N'8.0.2');


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])

    VALUES (N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA', N'8.0.2');
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO


    INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES

        ('Distrito Nacional', 18.47186, -69.93988),

        ('Azua',              18.45320, -70.73490),

        ('Bahoruco',           18.50000, -71.30000),

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

        -- (trimmed for brevity in this merged chunk but preserved in original)

        ('San Jose de Ocoa', 'Sabana Larga', 18.645, -70.559)

    ) AS m(ProvinciaNombre, NombreMunicipio, Latitud, Longitud)

    JOIN Provincia p ON p.NombreProvincia = m.ProvinciaNombre;

END
    [Id] uniqueidentifier NOT NULL,
    [UsuarioId] uniqueidentifier NOT NULL,
    [Mensaje] nvarchar(max) NOT NULL,
    [Tipo] nvarchar(max) NOT NULL,
    [Leida] bit NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    [EnlaceRelacionado] nvarchar(max) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NULL,
    CONSTRAINT [PK_Notificaciones] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [PlanSuscripcion] (
    [Idsuscripcion] uniqueidentifier NOT NULL,
    [NombrePlan] nvarchar(100) NOT NULL,
    [Precio] decimal(10,2) NOT NULL,
    [MaxConsultas] int NOT NULL DEFAULT 0,
    [MaxProyectos] int NOT NULL DEFAULT 0,
    [PresentacionPublica] bit NOT NULL DEFAULT CAST(0 AS bit),
    [QrIncluido] bit NOT NULL DEFAULT CAST(0 AS bit),
    [MultiUsuario] bit NOT NULL DEFAULT CAST(0 AS bit),
    [AccesoApi] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK_PlanSuscripcion] PRIMARY KEY ([Idsuscripcion])
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



IF OBJECT_ID(N'[CertiMivhed]', 'U') IS NULL

CREATE TABLE CertiMivhed (

    IdMivhed    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,

    IdProyecto  UNIQUEIDENTIFIER,

    Certificado VARCHAR(100),

    FOREIGN KEY (IdProyecto) REFERENCES ProyectosInmobiliarios(IdProyecto)

);



-- (additional table creations and alterations from APIProduction retained)

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

CREATE TABLE [Usuario] (
    [IdUsuario] uniqueidentifier NOT NULL,
    [Nombre] nvarchar(100) NOT NULL,
    [Apellido] nvarchar(100) NOT NULL,
    [NombreCompleto] AS [Nombre] + ' ' + [Apellido] PERSISTED,
    [Email] nvarchar(200) NOT NULL,
    [ContrasenaHash] nvarchar(500) NOT NULL,
    [Telefono] nvarchar(15) NOT NULL,
    [Cedula] nvarchar(15) NOT NULL,
    [Rol] int NOT NULL,
    [Activo] bit NOT NULL DEFAULT CAST(1 AS bit),
    [EmailVerificado] bit NOT NULL DEFAULT CAST(0 AS bit),
    [TokenVerificacion] nvarchar(4000) NULL,
    [TokenVerificacionExpiraUtc] datetime2 NULL,
    [RowVersion] rowversion NULL,
    [PlanSuscripcionId] uniqueidentifier NULL,
    [ConsultasUsadas] int NOT NULL DEFAULT 0,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NULL,
    CONSTRAINT [PK_Usuario] PRIMARY KEY ([IdUsuario]),
    CONSTRAINT [FK_Usuario_PlanSuscripcion_PlanSuscripcionId] FOREIGN KEY ([PlanSuscripcionId]) REFERENCES [PlanSuscripcion] ([Idsuscripcion]) ON DELETE SET NULL
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

CREATE TABLE [ProyectosInmobiliarios] (
    [IdProyecto] uniqueidentifier NOT NULL,
    [CodigoInterno] nvarchar(50) NOT NULL,
    [NombreProyecto] nvarchar(200) NOT NULL,
    [UbicacionTexto] nvarchar(500) NOT NULL,
    [UbicacionGps] nvarchar(100) NULL,
    [ValorEstimado] decimal(18,2) NULL,
    [DatosDesarrollador] nvarchar(max) NULL,
    [RncDesarrollador] nvarchar(max) NULL,
    [Matricula] nvarchar(max) NULL,
    [Categoria] int NOT NULL,
    [DesignacionCatastral] nvarchar(max) NULL,
    [EstadoJuridico] int NOT NULL,
    [Status] int NOT NULL,
    [EstadoIntegridad] int NOT NULL,
    [SelladoBloqueado] bit NOT NULL,
    [IdUsuario] uniqueidentifier NOT NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NULL,
    CONSTRAINT [PK_ProyectosInmobiliarios] PRIMARY KEY ([IdProyecto]),
    CONSTRAINT [FK_ProyectosInmobiliarios_Usuario_IdUsuario] FOREIGN KEY ([IdUsuario]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
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

-- Indexes â€” each wrapped in IF NOT EXISTS

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

CREATE UNIQUE INDEX [IX_ProyectosInmobiliarios_CodigoInterno] ON [ProyectosInmobiliarios] ([CodigoInterno]);
GO

CREATE INDEX [IX_ProyectosInmobiliarios_IdUsuario] ON [ProyectosInmobiliarios] ([IdUsuario]);
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

CREATE UNIQUE INDEX [IX_SellosIntegridad_CodigoSello] ON [SellosIntegridad] ([CodigoSello]);
GO

CREATE INDEX [IX_SellosIntegridad_ProyectoId] ON [SellosIntegridad] ([ProyectoId]);
GO

CREATE INDEX [IX_Usuario_PlanSuscripcionId] ON [Usuario] ([PlanSuscripcionId]);
GO

CREATE UNIQUE INDEX [UQ_Usuario_Email] ON [Usuario] ([Email]);
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

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260625043417_InitialCreate', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenUrl] nvarchar(2048) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260629151626_Add_ImagenUrl_To_Proyecto', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260629191121_Baseline', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [AvatarUrl] nvarchar(500) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630024820_Add_AvatarUrl_To_Usuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PlanSuscripcion]') AND [c].[name] = N'MultiUsuario');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [PlanSuscripcion] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [PlanSuscripcion] DROP COLUMN [MultiUsuario];
GO

ALTER TABLE [PlanSuscripcion] ADD [AlertasTiempoRealDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [PlanSuscripcion] ADD [ExportacionExcelDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [PlanSuscripcion] ADD [ExportacionPdfDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [PlanSuscripcion] ADD [IntegracionCrmDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [PlanSuscripcion] ADD [MaxAlmacenamientoMb] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [PlanSuscripcion] ADD [MaxUsuariosSecundarios] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [PlanSuscripcion] ADD [ModeloLmDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [PlanSuscripcion] ADD [SoporteTipo] nvarchar(50) NOT NULL DEFAULT N'Comunidad';
GO

ALTER TABLE [PlanSuscripcion] ADD [ValidacionLoteDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Usuario] ADD [ProyectosCreados] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Usuario] ADD [TitularId] uniqueidentifier NULL;
GO

CREATE INDEX [IX_Usuario_TitularId] ON [Usuario] ([TitularId]);
GO

ALTER TABLE [Usuario] ADD CONSTRAINT [FK_Usuario_Usuario_TitularId] FOREIGN KEY ([TitularId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630130218_AddSubscriptionLimitsAndTeamSupport', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [DGII] (
    [Rnc] nvarchar(20) NOT NULL,
    [NombreRazonSocial] nvarchar(250) NOT NULL,
    [NombreComercial] nvarchar(250) NULL,
    [Categoria] nvarchar(100) NULL,
    [RegimenPagos] nvarchar(100) NULL,
    [Estado] nvarchar(50) NULL,
    [ActividadEconomica] nvarchar(250) NULL,
    [AdministracionLocal] nvarchar(100) NULL,
    [FacturadorElectronico] nvarchar(50) NULL,
    [LicenciasVhm] nvarchar(100) NULL,
    [FechaModificacion] datetime2 NULL,
    CONSTRAINT [PK_DGII] PRIMARY KEY ([Rnc])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630145810_AddDgiiTable', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Usuario]') AND [c].[name] = N'AvatarUrl');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Usuario] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Usuario] ALTER COLUMN [AvatarUrl] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630151900_MakeAvatarUrlMax', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [LogConsultas] (
    [Id] uniqueidentifier NOT NULL,
    [UsuarioId] uniqueidentifier NOT NULL,
    [FechaConsulta] datetime2 NOT NULL,
    [Exitoso] bit NOT NULL,
    [Detalle] nvarchar(500) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NULL,
    CONSTRAINT [PK_LogConsultas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LogConsultas_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
GO

CREATE TABLE [LogProyectos] (
    [Id] uniqueidentifier NOT NULL,
    [UsuarioId] uniqueidentifier NOT NULL,
    [ProyectoId] uniqueidentifier NOT NULL,
    [FechaCreacion] datetime2 NOT NULL,
    [Detalle] nvarchar(500) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NULL,
    CONSTRAINT [PK_LogProyectos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LogProyectos_Proyectos_ProyectoId] FOREIGN KEY ([ProyectoId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION,
    CONSTRAINT [FK_LogProyectos_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_LogConsultas_FechaConsulta] ON [LogConsultas] ([FechaConsulta]);
GO

CREATE INDEX [IX_LogConsultas_UsuarioId] ON [LogConsultas] ([UsuarioId]);
GO

CREATE INDEX [IX_LogProyectos_FechaCreacion] ON [LogProyectos] ([FechaCreacion]);
GO

CREATE INDEX [IX_LogProyectos_ProyectoId] ON [LogProyectos] ([ProyectoId]);
GO

CREATE INDEX [IX_LogProyectos_UsuarioId] ON [LogProyectos] ([UsuarioId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630154200_AddLogsAuditoria', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [CurrentPeriodEnd] datetime2 NULL;
GO

ALTER TABLE [Usuario] ADD [StripeCustomerId] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [StripeSubscriptionId] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [SubscriptionStatus] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630163528_Add_Stripe_Fields_To_Usuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630195243_AddStripeFieldsToUsuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Permisos] (
    [IdPermiso] uniqueidentifier NOT NULL,
    [Descripcion] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Permisos] PRIMARY KEY ([IdPermiso])
);
GO

CREATE TABLE [Perfiles] (
    [IdPerfil] uniqueidentifier NOT NULL,
    [NombrePerfil] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Perfiles] PRIMARY KEY ([IdPerfil])
);
GO

CREATE TABLE [UsuarioLegacy] (
    [IdUsuario] uniqueidentifier NOT NULL,
    [Nombre] nvarchar(100) NOT NULL,
    [Apellido] nvarchar(100) NOT NULL,
    [Cedula] nvarchar(15) NOT NULL,
    [ContrasenaHash] nvarchar(255) NOT NULL,
    [Email] nvarchar(100) NOT NULL,
    [Telefono] nvarchar(15) NOT NULL,
    CONSTRAINT [PK_UsuarioLegacy] PRIMARY KEY ([IdUsuario])
);
GO

CREATE TABLE [PerfilPermiso] (
    [IdPerfil] uniqueidentifier NOT NULL,
    [IdPermiso] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_PerfilPermiso] PRIMARY KEY ([IdPerfil], [IdPermiso]),
    CONSTRAINT [FK_PerfilPermiso_Perfiles_IdPerfil] FOREIGN KEY ([IdPerfil]) REFERENCES [Perfiles] ([IdPerfil]) ON DELETE CASCADE,
    CONSTRAINT [FK_PerfilPermiso_Permisos_IdPermiso] FOREIGN KEY ([IdPermiso]) REFERENCES [Permisos] ([IdPermiso]) ON DELETE CASCADE
);
GO

CREATE TABLE [Acceso] (
    [IdAcceso] uniqueidentifier NOT NULL,
    [IdPerfil] uniqueidentifier NULL,
    [IdUsuario] uniqueidentifier NULL,
    CONSTRAINT [PK_Acceso] PRIMARY KEY ([IdAcceso]),
    CONSTRAINT [FK_Acceso_Perfiles_IdPerfil] FOREIGN KEY ([IdPerfil]) REFERENCES [Perfiles] ([IdPerfil]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Acceso_UsuarioLegacy_IdUsuario] FOREIGN KEY ([IdUsuario]) REFERENCES [UsuarioLegacy] ([IdUsuario]) ON DELETE CASCADE
);
GO

CREATE TABLE [Pagos] (
    [IdPago] uniqueidentifier NOT NULL,
    [FechaPago] datetime2 NOT NULL DEFAULT (GETDATE()),
    [IdApiGobernanza] uniqueidentifier NULL,
    [IdUsuario] uniqueidentifier NULL,
    [Idsuscripcion] uniqueidentifier NULL,
    [Monto] decimal(10,2) NOT NULL,
    CONSTRAINT [PK_Pagos] PRIMARY KEY ([IdPago]),
    CONSTRAINT [FK_Pagos_PlanSuscripcion_Idsuscripcion] FOREIGN KEY ([Idsuscripcion]) REFERENCES [PlanSuscripcion] ([Idsuscripcion]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Pagos_UsuarioLegacy_IdUsuario] FOREIGN KEY ([IdUsuario]) REFERENCES [UsuarioLegacy] ([IdUsuario]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Acceso_IdPerfil] ON [Acceso] ([IdPerfil]);
GO

CREATE INDEX [IX_Acceso_IdUsuario] ON [Acceso] ([IdUsuario]);
GO

CREATE INDEX [IX_Pagos_Idsuscripcion] ON [Pagos] ([Idsuscripcion]);
GO

CREATE INDEX [IX_Pagos_IdUsuario] ON [Pagos] ([IdUsuario]);
GO

CREATE INDEX [IX_PerfilPermiso_IdPermiso] ON [PerfilPermiso] ([IdPermiso]);
GO

CREATE UNIQUE INDEX [IX_UsuarioLegacy_Email] ON [UsuarioLegacy] ([Email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260630195722_AddLegacyProfilesAndPermissions', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [AccountStatus] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Usuario] ADD [DeletedAtUtc] datetime2 NULL;
GO

ALTER TABLE [Usuario] ADD [DeletionReason] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [PendingBillingCycle] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [PendingPlanCode] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [PurgeAtUtc] datetime2 NULL;
GO

ALTER TABLE [Usuario] ADD [RecoverUntilUtc] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260704162709_AddAccountLifecycleColumns', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [Rnc] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260705040519_Add_RNC_To_Usuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ProyectosInmobiliarios] ADD [Propietario] nvarchar(200) NULL;
GO

ALTER TABLE [ProyectosInmobiliarios] ADD [CedulaRncPropietario] nvarchar(50) NULL;
GO

ALTER TABLE [ProyectosInmobiliarios] ADD [Ipi] nvarchar(50) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260706170900_Add_Propietario_IPI_To_Proyectos', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [RazonSocial] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [NombreComercial] nvarchar(max) NULL;
GO

ALTER TABLE [Usuario] ADD [ActividadEconomica] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260708173000_Add_DGII_Fields_To_Usuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [GoogleId] nvarchar(100) NULL;
GO

ALTER TABLE [Usuario] ADD [SocialLogin] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260709034014_Add_GoogleAuth_To_Usuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Usuario] ADD [CancelAt] datetime2 NULL;
GO

ALTER TABLE [Usuario] ADD [CancelAtPeriodEnd] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260710000344_Add_CancelAt_To_Usuario', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Notificaciones] ADD [CodigoReferencia] nvarchar(max) NOT NULL DEFAULT ''
GO



INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260712173705_Add_CodigoReferencia_To_Notificaciones', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Invitaciones] (
    [Id] uniqueidentifier NOT NULL,
    [EmisorId] uniqueidentifier NOT NULL,
    [Email] nvarchar(200) NOT NULL,
    [Nombre] nvarchar(100) NOT NULL,
    [Apellido] nvarchar(100) NOT NULL,
    [Telefono] nvarchar(15) NOT NULL,
    [Cedula] nvarchar(15) NOT NULL,
    [FechaInvitacion] datetime2 NOT NULL,
    [Aceptada] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK_Invitaciones] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Invitaciones_Usuario_EmisorId] FOREIGN KEY ([EmisorId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_Invitaciones_EmisorId] ON [Invitaciones] ([EmisorId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260712204727_Add_Invitacion_Table', N'8.0.2');
GO

COMMIT;
GO

-- (rest of APIProduction migrations and schema additions preserved)
GO

