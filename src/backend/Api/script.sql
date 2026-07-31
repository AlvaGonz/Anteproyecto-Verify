IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
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

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE TABLE [Notificaciones] (
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AlertasValidacion_DocumentoId] ON [AlertasValidacion] ([DocumentoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AlertasValidacion_ProyectoId] ON [AlertasValidacion] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Auditorias_ProyectoId] ON [Auditorias] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Auditorias_UsuarioId] ON [Auditorias] ([UsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Certificaciones_ProyectoId] ON [Certificaciones] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Certificaciones_ReporteId] ON [Certificaciones] ([ReporteId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ConsentimientosFinancieros_UsuarioId] ON [ConsentimientosFinancieros] ([UsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_DatoValidado_ValidacionId] ON [DatoValidado] ([ValidacionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_DeteccionesDuplicidad_ProyectoDuplicadoId] ON [DeteccionesDuplicidad] ([ProyectoDuplicadoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_DeteccionesDuplicidad_ProyectoId] ON [DeteccionesDuplicidad] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Documentos_Activo] ON [Documentos] ([Activo]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Documentos_ProyectoId] ON [Documentos] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Documentos_TipoDocumento] ON [Documentos] ([TipoDocumento]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Hallazgos_ProyectoId] ON [Hallazgos] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Hallazgos_ValidacionId] ON [Hallazgos] ([ValidacionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProyectosInmobiliarios_CodigoInterno] ON [ProyectosInmobiliarios] ([CodigoInterno]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProyectosInmobiliarios_IdUsuario] ON [ProyectosInmobiliarios] ([IdUsuario]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reportes_GeneradoPorUsuarioId] ON [Reportes] ([GeneradoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reportes_ProyectoId] ON [Reportes] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ResultadosCrediticios_ConsentimientoId] ON [ResultadosCrediticios] ([ConsentimientoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ResultadosCrediticios_ProyectoId] ON [ResultadosCrediticios] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ResultadosRegla_ValidacionId] ON [ResultadosRegla] ([ValidacionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SellosIntegridad_CodigoSello] ON [SellosIntegridad] ([CodigoSello]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SellosIntegridad_ProyectoId] ON [SellosIntegridad] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Usuario_PlanSuscripcionId] ON [Usuario] ([PlanSuscripcionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [UQ_Usuario_Email] ON [Usuario] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Validaciones_DocumentoId] ON [Validaciones] ([DocumentoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Validaciones_ProyectoId] ON [Validaciones] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Validaciones_SelloId] ON [Validaciones] ([SelloId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ValidacionesAyuntamiento_ProyectoId] ON [ValidacionesAyuntamiento] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ValidacionesDgii_ProyectoId] ON [ValidacionesDgii] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625043417_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260625043417_InitialCreate', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260629151626_Add_ImagenUrl_To_Proyecto'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenUrl] nvarchar(2048) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260629151626_Add_ImagenUrl_To_Proyecto'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260629151626_Add_ImagenUrl_To_Proyecto', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260629191121_Baseline'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260629191121_Baseline', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630024820_Add_AvatarUrl_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [AvatarUrl] nvarchar(500) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630024820_Add_AvatarUrl_To_Usuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630024820_Add_AvatarUrl_To_Usuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PlanSuscripcion]') AND [c].[name] = N'MultiUsuario');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [PlanSuscripcion] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [PlanSuscripcion] DROP COLUMN [MultiUsuario];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [AlertasTiempoRealDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [ExportacionExcelDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [ExportacionPdfDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [IntegracionCrmDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [MaxAlmacenamientoMb] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [MaxUsuariosSecundarios] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [ModeloLmDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [SoporteTipo] nvarchar(50) NOT NULL DEFAULT N'Comunidad';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [PlanSuscripcion] ADD [ValidacionLoteDisponible] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [Usuario] ADD [ProyectosCreados] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [Usuario] ADD [TitularId] uniqueidentifier NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    CREATE INDEX [IX_Usuario_TitularId] ON [Usuario] ([TitularId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    ALTER TABLE [Usuario] ADD CONSTRAINT [FK_Usuario_Usuario_TitularId] FOREIGN KEY ([TitularId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630130218_AddSubscriptionLimitsAndTeamSupport'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630130218_AddSubscriptionLimitsAndTeamSupport', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630145810_AddDgiiTable'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630145810_AddDgiiTable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630145810_AddDgiiTable', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630151900_MakeAvatarUrlMax'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Usuario]') AND [c].[name] = N'AvatarUrl');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Usuario] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [Usuario] ALTER COLUMN [AvatarUrl] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630151900_MakeAvatarUrlMax'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630151900_MakeAvatarUrlMax', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
    CREATE INDEX [IX_LogConsultas_FechaConsulta] ON [LogConsultas] ([FechaConsulta]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
    CREATE INDEX [IX_LogConsultas_UsuarioId] ON [LogConsultas] ([UsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
    CREATE INDEX [IX_LogProyectos_FechaCreacion] ON [LogProyectos] ([FechaCreacion]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
    CREATE INDEX [IX_LogProyectos_ProyectoId] ON [LogProyectos] ([ProyectoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
    CREATE INDEX [IX_LogProyectos_UsuarioId] ON [LogProyectos] ([UsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630154200_AddLogsAuditoria'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630154200_AddLogsAuditoria', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630163528_Add_Stripe_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [CurrentPeriodEnd] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630163528_Add_Stripe_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [StripeCustomerId] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630163528_Add_Stripe_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [StripeSubscriptionId] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630163528_Add_Stripe_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [SubscriptionStatus] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630163528_Add_Stripe_Fields_To_Usuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630163528_Add_Stripe_Fields_To_Usuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195243_AddStripeFieldsToUsuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630195243_AddStripeFieldsToUsuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE TABLE [Permisos] (
        [IdPermiso] uniqueidentifier NOT NULL,
        [Descripcion] nvarchar(100) NOT NULL,
        CONSTRAINT [PK_Permisos] PRIMARY KEY ([IdPermiso])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE TABLE [Perfiles] (
        [IdPerfil] uniqueidentifier NOT NULL,
        [NombrePerfil] nvarchar(100) NOT NULL,
        CONSTRAINT [PK_Perfiles] PRIMARY KEY ([IdPerfil])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE TABLE [PerfilPermiso] (
        [IdPerfil] uniqueidentifier NOT NULL,
        [IdPermiso] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_PerfilPermiso] PRIMARY KEY ([IdPerfil], [IdPermiso]),
        CONSTRAINT [FK_PerfilPermiso_Perfiles_IdPerfil] FOREIGN KEY ([IdPerfil]) REFERENCES [Perfiles] ([IdPerfil]) ON DELETE CASCADE,
        CONSTRAINT [FK_PerfilPermiso_Permisos_IdPermiso] FOREIGN KEY ([IdPermiso]) REFERENCES [Permisos] ([IdPermiso]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE TABLE [Acceso] (
        [IdAcceso] uniqueidentifier NOT NULL,
        [IdPerfil] uniqueidentifier NULL,
        [IdUsuario] uniqueidentifier NULL,
        CONSTRAINT [PK_Acceso] PRIMARY KEY ([IdAcceso]),
        CONSTRAINT [FK_Acceso_Perfiles_IdPerfil] FOREIGN KEY ([IdPerfil]) REFERENCES [Perfiles] ([IdPerfil]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Acceso_UsuarioLegacy_IdUsuario] FOREIGN KEY ([IdUsuario]) REFERENCES [UsuarioLegacy] ([IdUsuario]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE INDEX [IX_Acceso_IdPerfil] ON [Acceso] ([IdPerfil]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE INDEX [IX_Acceso_IdUsuario] ON [Acceso] ([IdUsuario]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE INDEX [IX_Pagos_Idsuscripcion] ON [Pagos] ([Idsuscripcion]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE INDEX [IX_Pagos_IdUsuario] ON [Pagos] ([IdUsuario]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE INDEX [IX_PerfilPermiso_IdPermiso] ON [PerfilPermiso] ([IdPermiso]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UsuarioLegacy_Email] ON [UsuarioLegacy] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260630195722_AddLegacyProfilesAndPermissions'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260630195722_AddLegacyProfilesAndPermissions', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [AccountStatus] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [DeletedAtUtc] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [DeletionReason] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [PendingBillingCycle] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [PendingPlanCode] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [PurgeAtUtc] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    ALTER TABLE [Usuario] ADD [RecoverUntilUtc] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260704162709_AddAccountLifecycleColumns'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260704162709_AddAccountLifecycleColumns', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260705040519_Add_RNC_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [Rnc] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260705040519_Add_RNC_To_Usuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260705040519_Add_RNC_To_Usuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260706170900_Add_Propietario_IPI_To_Proyectos'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [Propietario] nvarchar(200) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260706170900_Add_Propietario_IPI_To_Proyectos'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [CedulaRncPropietario] nvarchar(50) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260706170900_Add_Propietario_IPI_To_Proyectos'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [Ipi] nvarchar(50) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260706170900_Add_Propietario_IPI_To_Proyectos'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260706170900_Add_Propietario_IPI_To_Proyectos', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708173000_Add_DGII_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [RazonSocial] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708173000_Add_DGII_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [NombreComercial] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708173000_Add_DGII_Fields_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [ActividadEconomica] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708173000_Add_DGII_Fields_To_Usuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260708173000_Add_DGII_Fields_To_Usuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260709034014_Add_GoogleAuth_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [GoogleId] nvarchar(100) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260709034014_Add_GoogleAuth_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [SocialLogin] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260709034014_Add_GoogleAuth_To_Usuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260709034014_Add_GoogleAuth_To_Usuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260710000344_Add_CancelAt_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [CancelAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260710000344_Add_CancelAt_To_Usuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [CancelAtPeriodEnd] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260710000344_Add_CancelAt_To_Usuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260710000344_Add_CancelAt_To_Usuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712173705_Add_CodigoReferencia_To_Notificaciones'
)
BEGIN
    ALTER TABLE [Notificaciones] ADD [CodigoReferencia] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712173705_Add_CodigoReferencia_To_Notificaciones'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260712173705_Add_CodigoReferencia_To_Notificaciones', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712204727_Add_Invitacion_Table'
)
BEGIN
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
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712204727_Add_Invitacion_Table'
)
BEGIN
    CREATE INDEX [IX_Invitaciones_EmisorId] ON [Invitaciones] ([EmisorId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712204727_Add_Invitacion_Table'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260712204727_Add_Invitacion_Table', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713115949_AddPasswordResetToken'
)
BEGIN
    ALTER TABLE [Usuario] ADD [PasswordResetToken] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713115949_AddPasswordResetToken'
)
BEGIN
    ALTER TABLE [Usuario] ADD [PasswordResetTokenExpiraUtc] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713115949_AddPasswordResetToken'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260713115949_AddPasswordResetToken', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713164614_AddEstatusIpiToProjects'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [EstatusIpi] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713164614_AddEstatusIpiToProjects'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260713164614_AddEstatusIpiToProjects', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713170059_AddDelegatedLimitsToUsuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [MaxConsultasDelegadas] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713170059_AddDelegatedLimitsToUsuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [MaxProyectosDelegados] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713170059_AddDelegatedLimitsToUsuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260713170059_AddDelegatedLimitsToUsuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713173829_AddSuperficieM2ToProjects'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [SuperficieM2] decimal(18,2) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713173829_AddSuperficieM2ToProjects'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260713173829_AddSuperficieM2ToProjects', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713205731_AddAdditionalProjectImages'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenAdicional1] nvarchar(2048) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713205731_AddAdditionalProjectImages'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenAdicional2] nvarchar(2048) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713205731_AddAdditionalProjectImages'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenAdicional3] nvarchar(2048) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713205731_AddAdditionalProjectImages'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenAdicional4] nvarchar(2048) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713205731_AddAdditionalProjectImages'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [ImagenAdicional5] nvarchar(2048) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260713205731_AddAdditionalProjectImages'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260713205731_AddAdditionalProjectImages', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    CREATE TABLE [ProyectosEstados] (
        [Id] uniqueidentifier NOT NULL,
        [CodigoUnico] nvarchar(50) NOT NULL,
        [Nombre] nvarchar(100) NOT NULL,
        [Descripcion] nvarchar(500) NOT NULL,
        [Condiciones] nvarchar(1000) NOT NULL,
        [ColorHex] nvarchar(20) NOT NULL,
        [Activo] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        CONSTRAINT [PK_ProyectosEstados] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProyectosEstados_CodigoUnico] ON [ProyectosEstados] ([CodigoUnico]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
                    INSERT INTO ProyectosEstados (Id, CodigoUnico, Nombre, Descripcion, Condiciones, ColorHex, Activo, CreatedAtUtc)
                    VALUES 
                    ('e408861d-96fd-457b-9888-e47155dcf3d6', 'CREADO', 'Creado', 'Proyecto recién creado', 'El proyecto ha sido registrado en la plataforma.', '#9BACD8', 1, '2026-07-29 17:57:00'),
                    ('16687428-9ce4-45a1-b6eb-e54fcdf92493', 'EDITADO', 'Editado', 'Proyecto editado por el usuario', 'El proyecto ha sufrido modificaciones.', '#F98513', 1, '2026-07-29 17:57:00'),
                    ('2424d39b-ec40-43ef-84f5-2aa2bb25382b', 'REVISION', 'En Revisión', 'El proyecto está siendo revisado', 'Se están verificando los documentos y datos.', '#EAB308', 1, '2026-07-29 17:57:00'),
                    ('6c135367-fc31-44d8-9c11-f607d52178bf', 'OBSERVACION', 'Con Observación', 'El proyecto requiere atención', 'Se encontraron observaciones que deben corregirse.', '#EF4444', 1, '2026-07-29 17:57:00'),
                    ('6da07829-6ea2-4c7f-b889-14d27fbdc88b', 'PUBLICADO', 'Publicado', 'Proyecto validado y publicado', 'El proyecto ha completado su proceso y está publicado.', '#10B981', 1, '2026-07-29 17:57:00');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD [EstadoId] uniqueidentifier NOT NULL DEFAULT 'e408861d-96fd-457b-9888-e47155dcf3d6';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
                    UPDATE ProyectosInmobiliarios SET EstadoId = 'e408861d-96fd-457b-9888-e47155dcf3d6';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    CREATE INDEX [IX_ProyectosInmobiliarios_EstadoId] ON [ProyectosInmobiliarios] ([EstadoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    ALTER TABLE [ProyectosInmobiliarios] ADD CONSTRAINT [FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId] FOREIGN KEY ([EstadoId]) REFERENCES [ProyectosEstados] ([Id]) ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ProyectosInmobiliarios]') AND [c].[name] = N'Status');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [ProyectosInmobiliarios] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [ProyectosInmobiliarios] DROP COLUMN [Status];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260716181609_AddProyectoEstadosAndMigrateData'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260716181609_AddProyectoEstadosAndMigrateData', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260717001730_Add_Hash_Ocr_Fields_To_Documento'
)
BEGIN
    ALTER TABLE [Documentos] ADD [HashSHA256] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260717001730_Add_Hash_Ocr_Fields_To_Documento'
)
BEGIN
    ALTER TABLE [Documentos] ADD [ResultadoOcrJson] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260717001730_Add_Hash_Ocr_Fields_To_Documento'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260717001730_Add_Hash_Ocr_Fields_To_Documento', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260719041340_AddProfileExtensionToUsuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [Direccion] nvarchar(200) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260719041340_AddProfileExtensionToUsuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [Nickname] nvarchar(30) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260719041340_AddProfileExtensionToUsuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [Provincia] nvarchar(50) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260719041340_AddProfileExtensionToUsuario'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UQ_Usuario_Nickname] ON [Usuario] ([Nickname]) WHERE [Nickname] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260719041340_AddProfileExtensionToUsuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260719041340_AddProfileExtensionToUsuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE TABLE [ProyectoGuardado] (
        [Id] uniqueidentifier NOT NULL,
        [ProjectId] uniqueidentifier NOT NULL,
        [CreatorId] uniqueidentifier NOT NULL,
        [SaverId] uniqueidentifier NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        CONSTRAINT [PK_ProyectoGuardado] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProyectoGuardado_ProyectosInmobiliarios_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProyectoGuardado_Usuario_CreatorId] FOREIGN KEY ([CreatorId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProyectoGuardado_Usuario_SaverId] FOREIGN KEY ([SaverId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE TABLE [ProyectoInteres] (
        [Id] uniqueidentifier NOT NULL,
        [ProjectId] uniqueidentifier NOT NULL,
        [CreatorId] uniqueidentifier NOT NULL,
        [InterestedUserId] uniqueidentifier NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        CONSTRAINT [PK_ProyectoInteres] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProyectoInteres_ProyectosInmobiliarios_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [ProyectosInmobiliarios] ([IdProyecto]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProyectoInteres_Usuario_CreatorId] FOREIGN KEY ([CreatorId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProyectoInteres_Usuario_InterestedUserId] FOREIGN KEY ([InterestedUserId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE INDEX [IX_ProyectoGuardado_CreatorId] ON [ProyectoGuardado] ([CreatorId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE INDEX [IX_ProyectoGuardado_ProjectId] ON [ProyectoGuardado] ([ProjectId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE INDEX [IX_ProyectoGuardado_SaverId] ON [ProyectoGuardado] ([SaverId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE INDEX [IX_ProyectoInteres_CreatorId] ON [ProyectoInteres] ([CreatorId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE INDEX [IX_ProyectoInteres_InterestedUserId] ON [ProyectoInteres] ([InterestedUserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    CREATE INDEX [IX_ProyectoInteres_ProjectId] ON [ProyectoInteres] ([ProjectId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723015859_Add_Proyectos_Interesados_Guardados'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260723015859_Add_Proyectos_Interesados_Guardados', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723204400_AddSesionesUsuario'
)
BEGIN
    CREATE TABLE [SesionUsuario] (
        [Id] uniqueidentifier NOT NULL,
        [UsuarioId] uniqueidentifier NOT NULL,
        [RefreshToken] nvarchar(max) NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [ExpiresAtUtc] datetime2 NOT NULL,
        [IsRevoked] bit NOT NULL,
        [IpAddress] nvarchar(max) NULL,
        [UserAgent] nvarchar(max) NULL,
        CONSTRAINT [PK_SesionUsuario] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SesionUsuario_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723204400_AddSesionesUsuario'
)
BEGIN
    CREATE INDEX [IX_SesionUsuario_UsuarioId] ON [SesionUsuario] ([UsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260723204400_AddSesionesUsuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260723204400_AddSesionesUsuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260727203205_AddAceptoDescargoToUsuario'
)
BEGIN
    ALTER TABLE [Usuario] ADD [AceptoDescargo] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260727203205_AddAceptoDescargoToUsuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260727203205_AddAceptoDescargoToUsuario', N'8.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA'
)
BEGIN
    CREATE TABLE [LicenciaConstruccion] (
        [MivedId] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [NumeroPermiso] nvarchar(50) NOT NULL,
        [NombreProyecto] nvarchar(500) NOT NULL,
        [Tipologia] nvarchar(100) NULL,
        [FechaEntrada] datetime2 NULL,
        [FechaEmision] datetime2 NULL,
        [Provincia] nvarchar(100) NULL,
        [Municipio] nvarchar(100) NULL,
        [UnidadesHabitacionales] int NULL,
        [LocalesComerciales] int NULL,
        CONSTRAINT [PK_LicenciaConstruccion] PRIMARY KEY ([MivedId])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA'
)
BEGIN
    CREATE TABLE [Verificacion2FA] (
        [Id] uniqueidentifier NOT NULL,
        [UsuarioId] uniqueidentifier NOT NULL,
        [SesionId] nvarchar(200) NOT NULL,
        [NumeroVerificable] nvarchar(6) NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        CONSTRAINT [PK_Verificacion2FA] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Verificacion2FA_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA'
)
BEGIN
    CREATE INDEX [IX_LicenciaConstruccion_NumeroPermiso] ON [LicenciaConstruccion] ([NumeroPermiso]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA'
)
BEGIN
    CREATE INDEX [IX_Verificacion2FA_UsuarioId] ON [Verificacion2FA] ([UsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260729021120_AddLicenciaConstruccionAndVerificacion2FA', N'8.0.2');
END;
GO

COMMIT;
GO

