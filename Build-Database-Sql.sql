IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'VeriFinca')
BEGIN
    CREATE DATABASE VeriFinca;
END;
GO

USE VeriFinca;
GO

IF OBJECT_ID(N'[__EFMigrationsHistory]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[__EFMigrationsHistory](
    	[MigrationId] [nvarchar](150) NOT NULL,
    	[ProductVersion] [nvarchar](32) NOT NULL,
     CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
    (
    	[MigrationId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Acceso]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Acceso](
    	[IdAcceso] [uniqueidentifier] NOT NULL,
    	[IdPerfil] [uniqueidentifier] NULL,
    	[IdUsuario] [uniqueidentifier] NULL,
     CONSTRAINT [PK_Acceso] PRIMARY KEY CLUSTERED 
    (
    	[IdAcceso] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[AlertasValidacion]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AlertasValidacion](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[DocumentoId] [uniqueidentifier] NULL,
    	[Type] [int] NOT NULL,
    	[Category] [int] NOT NULL,
    	[Titulo] [nvarchar](max) NOT NULL,
    	[Descripcion] [nvarchar](max) NOT NULL,
    	[Recomendacion] [nvarchar](max) NULL,
    	[Resuelta] [bit] NOT NULL,
    	[FechaGeneracion] [datetime2](7) NOT NULL,
    	[NivelRiesgo] [nvarchar](max) NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_AlertasValidacion] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ApiGobernanza]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ApiGobernanza](
    	[IdApiGobernanza] [uniqueidentifier] NOT NULL,
    	[NombreApi] [varchar](100) NULL,
    	[Endpoint] [varchar](255) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdApiGobernanza] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Auditorias]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Auditorias](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NULL,
    	[ProyectoId] [uniqueidentifier] NULL,
    	[TipoEvento] [nvarchar](max) NOT NULL,
    	[Accion] [nvarchar](200) NOT NULL,
    	[Entidad] [nvarchar](max) NULL,
    	[EntidadId] [nvarchar](max) NULL,
    	[Detalle] [nvarchar](2000) NULL,
    	[IpOrigen] [nvarchar](50) NULL,
    	[UserAgent] [nvarchar](max) NULL,
    	[FechaEventoUtc] [datetime2](7) NOT NULL,
    	[TipoOperacion] [int] NOT NULL,
    	[Resultado] [nvarchar](2000) NULL,
    	[ReferenciaExpedienteId] [uniqueidentifier] NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_Auditorias] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[AyuntamientoTarifa]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AyuntamientoTarifa](
    	[IdAyuntamiento] [uniqueidentifier] NOT NULL,
    	[IdTarifaAyuntamiento] [uniqueidentifier] NULL,
    	[IdMunicipio] [uniqueidentifier] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdAyuntamiento] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[CatastroTitulo]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[CatastroTitulo](
    	[IdCatastroTitulo] [uniqueidentifier] NOT NULL,
    	[CodigoDesignacionCatastral] [varchar](20) NULL,
    	[NumeroTitulo] [varchar](50) NULL,
    	[Rnc] [varchar](20) NULL,
    	[Provincia] [varchar](100) NULL,
    	[Municipio] [varchar](100) NULL,
    	[Latitud] [decimal](9, 6) NULL,
    	[Longitud] [decimal](9, 6) NULL,
    	[Superficie] [decimal](18, 2) NULL,
    	[Matricula] [varchar](50) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdCatastroTitulo] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Certificaciones]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Certificaciones](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[ReporteId] [uniqueidentifier] NULL,
    	[CodigoVerificacion] [nvarchar](max) NOT NULL,
    	[EstadoCertificacion] [int] NOT NULL,
    	[FechaEmisionUtc] [datetime2](7) NOT NULL,
    	[FechaVigenciaUtc] [datetime2](7) NULL,
    	[UrlVerificacion] [nvarchar](max) NOT NULL,
    	[ScoreIntegridad] [int] NULL,
    	[EstadoIntegridad] [int] NOT NULL,
    	[Version] [int] NOT NULL,
    	[EmisorId] [uniqueidentifier] NOT NULL,
    	[Revocado] [bit] NOT NULL,
    	[MotivoRevocacion] [nvarchar](max) NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_Certificaciones] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[CertiMivhed]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[CertiMivhed](
    	[IdMivhed] [uniqueidentifier] NOT NULL,
    	[IdProyecto] [uniqueidentifier] NULL,
    	[Certificado] [varchar](100) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdMivhed] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ConsentimientosFinancieros]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ConsentimientosFinancieros](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NOT NULL,
    	[FechaHoraUtc] [datetime2](7) NOT NULL,
    	[IpOrigen] [nvarchar](50) NOT NULL,
    	[VersionPolitica] [nvarchar](20) NOT NULL,
    	[Estado] [int] NOT NULL,
    	[FechaExpiracionUtc] [datetime2](7) NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ConsentimientosFinancieros] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Consultas]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Consultas](
    	[IdConsulta] [uniqueidentifier] NOT NULL,
    	[Descripcion] [varchar](255) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdConsulta] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[DatoValidado]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[DatoValidado](
    	[Id] [int] IDENTITY(1,1) NOT NULL,
    	[Campo] [nvarchar](max) NOT NULL,
    	[ValorEsperado] [nvarchar](max) NOT NULL,
    	[ValorEncontrado] [nvarchar](max) NOT NULL,
    	[Coincide] [bit] NOT NULL,
    	[MetodoComparacion] [nvarchar](max) NULL,
    	[ValidacionId] [uniqueidentifier] NOT NULL,
     CONSTRAINT [PK_DatoValidado] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[DeteccionesDuplicidad]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[DeteccionesDuplicidad](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[ProyectoDuplicadoId] [uniqueidentifier] NULL,
    	[NivelRiesgo] [int] NOT NULL,
    	[DescripcionCoincidencia] [nvarchar](max) NOT NULL,
    	[FechaDeteccion] [datetime2](7) NOT NULL,
    	[Bloqueante] [bit] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_DeteccionesDuplicidad] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[DGII]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[DGII](
    	[Rnc] [nvarchar](20) NOT NULL,
    	[NombreRazonSocial] [nvarchar](250) NOT NULL,
    	[NombreComercial] [nvarchar](250) NULL,
    	[Categoria] [nvarchar](100) NULL,
    	[RegimenPagos] [nvarchar](100) NULL,
    	[Estado] [nvarchar](50) NULL,
    	[ActividadEconomica] [nvarchar](250) NULL,
    	[AdministracionLocal] [nvarchar](100) NULL,
    	[FacturadorElectronico] [nvarchar](50) NULL,
    	[LicenciasVhm] [nvarchar](100) NULL,
    	[FechaModificacion] [datetime2](7) NULL,
     CONSTRAINT [PK_DGII] PRIMARY KEY CLUSTERED 
    (
    	[Rnc] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Documento]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Documento](
    	[IdDocumento] [uniqueidentifier] NOT NULL,
    	[IdProyecto] [uniqueidentifier] NULL,
    	[IdTipoDcumento] [uniqueidentifier] NULL,
    	[RutaDocumento] [varchar](255) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdDocumento] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Documentos]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Documentos](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[TipoDocumento] [int] NOT NULL,
    	[NombreArchivoOriginal] [nvarchar](500) NOT NULL,
    	[NombreArchivoAlmacenado] [nvarchar](500) NOT NULL,
    	[RutaArchivo] [nvarchar](1000) NOT NULL,
    	[ContentType] [nvarchar](100) NOT NULL,
    	[Extension] [nvarchar](10) NOT NULL,
    	[TamanoBytes] [bigint] NOT NULL,
    	[EstadoDocumento] [int] NOT NULL,
    	[Activo] [bit] NOT NULL,
    	[Version] [int] NOT NULL,
    	[FechaEmision] [datetime2](7) NULL,
    	[InstitucionEmisora] [nvarchar](200) NULL,
    	[UsuarioCargaId] [uniqueidentifier] NOT NULL,
    	[Observaciones] [nvarchar](1000) NULL,
    	[FormalStatus] [int] NULL,
    	[FechaVencimiento] [datetime2](7) NULL,
    	[VersionReglaAplicada] [nvarchar](max) NULL,
    	[FechaEvaluacion] [datetime2](7) NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
    	[HashSHA256] [nvarchar](max) NULL,
    	[ResultadoOcrJson] [nvarchar](max) NULL,
     CONSTRAINT [PK_Documentos] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[EstudioSuelo]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[EstudioSuelo](
    	[IdESuelo] [uniqueidentifier] NOT NULL,
    	[IdProyecto] [uniqueidentifier] NULL,
    	[FechaEstudio] [date] NULL,
    	[Resultado] [text] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdESuelo] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[FremiunConsultas_Log]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[FremiunConsultas_Log](
    	[IdConsultaLog] [uniqueidentifier] NOT NULL,
    	[IdProyecto] [uniqueidentifier] NULL,
    	[IdConsulta] [uniqueidentifier] NULL,
    	[IdUsuario] [uniqueidentifier] NULL,
    	[FechaConsulta] [datetime] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdConsultaLog] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[FremiunProyectos_Log]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[FremiunProyectos_Log](
    	[IdProyectoLog] [uniqueidentifier] NOT NULL,
    	[IdProyecto] [uniqueidentifier] NULL,
    	[IdUsuario] [uniqueidentifier] NULL,
    	[FechaAcceso] [datetime] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdProyectoLog] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Hallazgos]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Hallazgos](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[ValidacionId] [uniqueidentifier] NULL,
    	[Severidad] [int] NOT NULL,
    	[Codigo] [nvarchar](50) NOT NULL,
    	[Titulo] [nvarchar](200) NOT NULL,
    	[Descripcion] [nvarchar](2000) NOT NULL,
    	[Recomendacion] [nvarchar](2000) NULL,
    	[SistemaOrigen] [nvarchar](max) NULL,
    	[Resuelto] [bit] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_Hallazgos] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Invitaciones]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Invitaciones](
    	[Id] [uniqueidentifier] NOT NULL,
    	[EmisorId] [uniqueidentifier] NOT NULL,
    	[Email] [nvarchar](200) NOT NULL,
    	[Nombre] [nvarchar](100) NOT NULL,
    	[Apellido] [nvarchar](100) NOT NULL,
    	[Telefono] [nvarchar](15) NOT NULL,
    	[Cedula] [nvarchar](15) NOT NULL,
    	[FechaInvitacion] [datetime2](7) NOT NULL,
    	[Aceptada] [bit] NOT NULL,
     CONSTRAINT [PK_Invitaciones] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[LicenciaConstruccion]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LicenciaConstruccion](
    	[NumeroPermiso] [nvarchar](50) NOT NULL,
    	[NombreProyecto] [nvarchar](500) NOT NULL,
    	[Tipologia] [nvarchar](100) NULL,
    	[FechaEntrada] [datetime2](7) NULL,
    	[FechaEmision] [datetime2](7) NULL,
    	[Provincia] [nvarchar](100) NULL,
    	[Municipio] [nvarchar](100) NULL,
    	[UnidadesHabitacionales] [int] NULL,
    	[LocalesComerciales] [int] NULL,
     CONSTRAINT [PK_LicenciaConstruccion] PRIMARY KEY CLUSTERED 
    (
    	[NumeroPermiso] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[LogConsultas]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LogConsultas](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NOT NULL,
    	[FechaConsulta] [datetime2](7) NOT NULL,
    	[Exitoso] [bit] NOT NULL,
    	[Detalle] [nvarchar](500) NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_LogConsultas] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[LogPagos]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LogPagos](
    	[IdLog] [uniqueidentifier] NOT NULL,
    	[Idpago] [uniqueidentifier] NULL,
    	[IdUsuario] [uniqueidentifier] NULL,
    	[Idsuscripcion] [uniqueidentifier] NULL,
    	[FechaLog] [datetime] NULL,
    	[Estado] [varchar](50) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdLog] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[LogProyectos]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LogProyectos](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[FechaCreacion] [datetime2](7) NOT NULL,
    	[Detalle] [nvarchar](500) NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_LogProyectos] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Municipio]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Municipio](
    	[IdMunicipio] [uniqueidentifier] NOT NULL,
    	[IdProvincia] [uniqueidentifier] NULL,
    	[NombreMunicipio] [varchar](100) NULL,
    	[Latitud] [decimal](9, 6) NULL,
    	[Longitud] [decimal](9, 6) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdMunicipio] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Notificaciones]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Notificaciones](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NOT NULL,
    	[Mensaje] [nvarchar](max) NOT NULL,
    	[Tipo] [nvarchar](max) NOT NULL,
    	[Leida] [bit] NOT NULL,
    	[FechaUtc] [datetime2](7) NOT NULL,
    	[EnlaceRelacionado] [nvarchar](max) NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
    	[CodigoReferencia] [nvarchar](max) NOT NULL,
     CONSTRAINT [PK_Notificaciones] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[PagoIPI]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[PagoIPI](
    	[Rnc] [varchar](20) NOT NULL,
    	[Cuota_ipi] [decimal](18, 2) NOT NULL,
    	[Estatus] [varchar](20) NOT NULL,
    	[FechaCreacion] [datetime2](7) NOT NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[Rnc] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Pagos]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Pagos](
    	[IdPago] [uniqueidentifier] NOT NULL,
    	[FechaPago] [datetime2](7) NOT NULL,
    	[IdApiGobernanza] [uniqueidentifier] NULL,
    	[IdUsuario] [uniqueidentifier] NULL,
    	[Idsuscripcion] [uniqueidentifier] NULL,
    	[Monto] [decimal](10, 2) NOT NULL,
     CONSTRAINT [PK_Pagos] PRIMARY KEY CLUSTERED 
    (
    	[IdPago] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Perfiles]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Perfiles](
    	[IdPerfil] [uniqueidentifier] NOT NULL,
    	[NombrePerfil] [nvarchar](100) NOT NULL,
     CONSTRAINT [PK_Perfiles] PRIMARY KEY CLUSTERED 
    (
    	[IdPerfil] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[PerfilPermiso]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[PerfilPermiso](
    	[IdPerfil] [uniqueidentifier] NOT NULL,
    	[IdPermiso] [uniqueidentifier] NOT NULL,
     CONSTRAINT [PK_PerfilPermiso] PRIMARY KEY CLUSTERED 
    (
    	[IdPerfil] ASC,
    	[IdPermiso] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Permisos]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Permisos](
    	[IdPermiso] [uniqueidentifier] NOT NULL,
    	[Descripcion] [nvarchar](100) NOT NULL,
     CONSTRAINT [PK_Permisos] PRIMARY KEY CLUSTERED 
    (
    	[IdPermiso] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[PermisoSuelo]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[PermisoSuelo](
    	[IdPSuelo] [uniqueidentifier] NOT NULL,
    	[NumeroPermiso] [varchar](50) NULL,
    	[NumeroExpediente] [varchar](50) NULL,
    	[FechaEmision] [date] NULL,
    	[Rnc] [varchar](20) NULL,
    	[Provincia] [varchar](100) NULL,
    	[Municipio] [varchar](100) NULL,
    	[Latitud] [decimal](9, 6) NULL,
    	[Longitud] [decimal](9, 6) NULL,
    	[Superficie] [decimal](18, 2) NULL,
    	[TienePermiso] [varchar](10) NULL,
    	[Documento] [varchar](250) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdPSuelo] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[PlanCaracteristica]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[PlanCaracteristica](
    	[IdPlan] [uniqueidentifier] NOT NULL,
    	[Idsuscripcion] [uniqueidentifier] NULL,
    	[Caracteristica] [varchar](255) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdPlan] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[PlanSuscripcion]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[PlanSuscripcion](
    	[Idsuscripcion] [uniqueidentifier] NOT NULL,
    	[NombrePlan] [nvarchar](100) NOT NULL,
    	[Precio] [decimal](10, 2) NOT NULL,
    	[MaxConsultas] [int] NOT NULL,
    	[MaxProyectos] [int] NOT NULL,
    	[PresentacionPublica] [bit] NOT NULL,
    	[QrIncluido] [bit] NOT NULL,
    	[AccesoApi] [bit] NOT NULL,
    	[AlertasTiempoRealDisponible] [bit] NOT NULL,
    	[ExportacionExcelDisponible] [bit] NOT NULL,
    	[ExportacionPdfDisponible] [bit] NOT NULL,
    	[IntegracionCrmDisponible] [bit] NOT NULL,
    	[MaxAlmacenamientoMb] [int] NOT NULL,
    	[MaxUsuariosSecundarios] [int] NOT NULL,
    	[ModeloLmDisponible] [bit] NOT NULL,
    	[SoporteTipo] [nvarchar](50) NOT NULL,
    	[ValidacionLoteDisponible] [bit] NOT NULL,
     CONSTRAINT [PK_PlanSuscripcion] PRIMARY KEY CLUSTERED 
    (
    	[Idsuscripcion] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Provincia]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Provincia](
    	[IdProvincia] [uniqueidentifier] NOT NULL,
    	[NombreProvincia] [varchar](100) NOT NULL,
    	[Latitud] [decimal](18, 10) NULL,
    	[Longitud] [decimal](18, 10) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdProvincia] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ProyectoGuardado]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProyectoGuardado](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProjectId] [uniqueidentifier] NOT NULL,
    	[CreatorId] [uniqueidentifier] NOT NULL,
    	[SaverId] [uniqueidentifier] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ProyectoGuardado] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ProyectoInteres]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProyectoInteres](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProjectId] [uniqueidentifier] NOT NULL,
    	[CreatorId] [uniqueidentifier] NOT NULL,
    	[InterestedUserId] [uniqueidentifier] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ProyectoInteres] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ProyectosEstados]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProyectosEstados](
    	[Id] [uniqueidentifier] NOT NULL,
    	[CodigoUnico] [nvarchar](50) NOT NULL,
    	[Nombre] [nvarchar](100) NOT NULL,
    	[Descripcion] [nvarchar](500) NOT NULL,
    	[Condiciones] [nvarchar](1000) NOT NULL,
    	[ColorHex] [nvarchar](20) NOT NULL,
    	[Activo] [bit] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ProyectosEstados] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ProyectosInmobiliarios]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProyectosInmobiliarios](
    	[IdProyecto] [uniqueidentifier] NOT NULL,
    	[CodigoInterno] [nvarchar](50) NOT NULL,
    	[NombreProyecto] [nvarchar](200) NOT NULL,
    	[UbicacionTexto] [nvarchar](500) NOT NULL,
    	[UbicacionGps] [nvarchar](100) NULL,
    	[ValorEstimado] [decimal](18, 2) NULL,
    	[DatosDesarrollador] [nvarchar](max) NULL,
    	[RncDesarrollador] [nvarchar](max) NULL,
    	[Matricula] [nvarchar](max) NULL,
    	[Categoria] [int] NOT NULL,
    	[DesignacionCatastral] [nvarchar](max) NULL,
    	[EstadoJuridico] [int] NOT NULL,
    	[EstadoIntegridad] [int] NOT NULL,
    	[SelladoBloqueado] [bit] NOT NULL,
    	[IdUsuario] [uniqueidentifier] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
    	[ImagenUrl] [nvarchar](2048) NULL,
    	[Propietario] [nvarchar](200) NULL,
    	[CedulaRncPropietario] [nvarchar](50) NULL,
    	[Ipi] [nvarchar](50) NULL,
    	[EstatusIpi] [nvarchar](max) NULL,
    	[SuperficieM2] [decimal](18, 2) NULL,
    	[ImagenAdicional1] [nvarchar](2048) NULL,
    	[ImagenAdicional2] [nvarchar](2048) NULL,
    	[ImagenAdicional3] [nvarchar](2048) NULL,
    	[ImagenAdicional4] [nvarchar](2048) NULL,
    	[ImagenAdicional5] [nvarchar](2048) NULL,
    	[EstadoId] [uniqueidentifier] NOT NULL,
    	[IdMivhed] [uniqueidentifier] NULL,
    	[IdCatastroTitulo] [uniqueidentifier] NULL,
    	[IdTarifaAyuntamiento] [uniqueidentifier] NULL,
    	[IdPSuelo] [uniqueidentifier] NULL,
    	[IdESuelo] [uniqueidentifier] NULL,
     CONSTRAINT [PK_ProyectosInmobiliarios] PRIMARY KEY CLUSTERED 
    (
    	[IdProyecto] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Recibo]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Recibo](
    	[IdPago] [uniqueidentifier] NOT NULL,
    	[IdUsuario] [uniqueidentifier] NULL,
    	[Monto] [decimal](10, 2) NULL,
    	[FechaPago] [date] NULL,
    	[Detalle] [varchar](500) NULL,
    	[Categoria] [varchar](100) NULL,
    	[Desglose] [varchar](max) NULL,
    	[IdSello] [uniqueidentifier] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdPago] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ReglasValidacion]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ReglasValidacion](
    	[Id] [uniqueidentifier] NOT NULL,
    	[Nombre] [nvarchar](200) NOT NULL,
    	[Descripcion] [nvarchar](1000) NOT NULL,
    	[CondicionLogica] [nvarchar](2000) NOT NULL,
    	[TipoDocumentoAplicable] [int] NOT NULL,
    	[NivelAlerta] [int] NOT NULL,
    	[TipoProyecto] [int] NOT NULL,
    	[Activa] [bit] NOT NULL,
    	[Version] [int] NOT NULL,
    	[FechaCreacionUtc] [datetime2](7) NOT NULL,
    	[CreadaPor] [uniqueidentifier] NOT NULL,
    	[ReglaAnteriorId] [uniqueidentifier] NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ReglasValidacion] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Reportes]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Reportes](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[EstadoReporte] [int] NOT NULL,
    	[Resumen] [nvarchar](4000) NULL,
    	[GeneradoPorUsuarioId] [uniqueidentifier] NULL,
    	[Version] [int] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_Reportes] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ResultadosCrediticios]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ResultadosCrediticios](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[ConsentimientoId] [uniqueidentifier] NOT NULL,
    	[ScoreCrediticio] [int] NOT NULL,
    	[PorcentajeEndeudamiento] [decimal](5, 2) NOT NULL,
    	[CantidadAtrasosUltimos12Meses] [int] NOT NULL,
    	[NivelRiesgo] [int] NOT NULL,
    	[FechaConsultaUtc] [datetime2](7) NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ResultadosCrediticios] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[SelloIntegridad]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[SelloIntegridad](
    	[IdSello] [uniqueidentifier] NOT NULL,
    	[IdDocumento] [uniqueidentifier] NULL,
    	[HashSello] [varchar](255) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdSello] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[SellosIntegridad]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[SellosIntegridad](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[CodigoSello] [nvarchar](50) NOT NULL,
    	[Nombre] [nvarchar](max) NOT NULL,
    	[Nivel] [int] NOT NULL,
    	[UrlQr] [nvarchar](500) NOT NULL,
    	[FirmaDigital] [nvarchar](1000) NOT NULL,
    	[FechaEmisionUtc] [datetime2](7) NOT NULL,
    	[FechaExpiracionUtc] [datetime2](7) NOT NULL,
    	[Estado] [int] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_SellosIntegridad] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[SesionUsuario]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[SesionUsuario](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NOT NULL,
    	[RefreshToken] [nvarchar](max) NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[ExpiresAtUtc] [datetime2](7) NOT NULL,
    	[IsRevoked] [bit] NOT NULL,
    	[IpAddress] [nvarchar](max) NULL,
    	[UserAgent] [nvarchar](max) NULL,
     CONSTRAINT [PK_SesionUsuario] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[SolvenciaFinanciera]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[SolvenciaFinanciera](
    	[IdSolvencia] [uniqueidentifier] NOT NULL,
    	[IdMoviliario] [uniqueidentifier] NULL,
    	[FechaEmision] [date] NULL,
    	[Monto] [decimal](10, 2) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdSolvencia] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[TarifaSueloAyuntamiento]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[TarifaSueloAyuntamiento](
    	[IdTarifaAyuntamiento] [uniqueidentifier] NOT NULL,
    	[IdMunicipio] [uniqueidentifier] NULL,
    	[Monto] [decimal](10, 2) NULL,
    	[Anio] [int] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdTarifaAyuntamiento] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[TipoDocumento]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[TipoDocumento](
    	[IdTipoDcumento] [uniqueidentifier] NOT NULL,
    	[Descripcion] [varchar](100) NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdTipoDcumento] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[TipoInmoviliario]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[TipoInmoviliario](
    	[IdMoviliario] [uniqueidentifier] NOT NULL,
    	[Tipo] [varchar](100) NULL,
    	[IdProyecto] [uniqueidentifier] NULL,
    PRIMARY KEY CLUSTERED 
    (
    	[IdMoviliario] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Usuario]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Usuario](
    	[IdUsuario] [uniqueidentifier] NOT NULL,
    	[Nombre] [nvarchar](100) NOT NULL,
    	[Apellido] [nvarchar](100) NOT NULL,
    	[NombreCompleto]  AS (([Nombre]+' ')+[Apellido]) PERSISTED NOT NULL,
    	[Email] [nvarchar](200) NOT NULL,
    	[ContrasenaHash] [nvarchar](500) NOT NULL,
    	[Telefono] [nvarchar](15) NOT NULL,
    	[Cedula] [nvarchar](15) NOT NULL,
    	[Rol] [int] NOT NULL,
    	[Activo] [bit] NOT NULL,
    	[EmailVerificado] [bit] NOT NULL,
    	[TokenVerificacion] [nvarchar](4000) NULL,
    	[TokenVerificacionExpiraUtc] [datetime2](7) NULL,
    	[RowVersion] [timestamp] NULL,
    	[PlanSuscripcionId] [uniqueidentifier] NULL,
    	[ConsultasUsadas] [int] NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
    	[AvatarUrl] [nvarchar](max) NULL,
    	[ProyectosCreados] [int] NOT NULL,
    	[TitularId] [uniqueidentifier] NULL,
    	[CurrentPeriodEnd] [datetime2](7) NULL,
    	[StripeCustomerId] [nvarchar](max) NULL,
    	[StripeSubscriptionId] [nvarchar](max) NULL,
    	[SubscriptionStatus] [nvarchar](max) NULL,
    	[AccountStatus] [int] NOT NULL,
    	[DeletedAtUtc] [datetime2](7) NULL,
    	[DeletionReason] [nvarchar](max) NULL,
    	[PendingBillingCycle] [nvarchar](max) NULL,
    	[PendingPlanCode] [nvarchar](max) NULL,
    	[PurgeAtUtc] [datetime2](7) NULL,
    	[RecoverUntilUtc] [datetime2](7) NULL,
    	[Rnc] [nvarchar](max) NULL,
    	[RazonSocial] [nvarchar](max) NULL,
    	[NombreComercial] [nvarchar](max) NULL,
    	[ActividadEconomica] [nvarchar](max) NULL,
    	[GoogleId] [nvarchar](100) NULL,
    	[SocialLogin] [bit] NOT NULL,
    	[CancelAt] [datetime2](7) NULL,
    	[CancelAtPeriodEnd] [bit] NOT NULL,
    	[PasswordResetToken] [nvarchar](max) NULL,
    	[PasswordResetTokenExpiraUtc] [datetime2](7) NULL,
    	[MaxConsultasDelegadas] [int] NULL,
    	[MaxProyectosDelegados] [int] NULL,
    	[Direccion] [nvarchar](200) NULL,
    	[Nickname] [nvarchar](30) NULL,
    	[Provincia] [nvarchar](50) NULL,
    	[AceptoDescargo] [bit] NOT NULL,
     CONSTRAINT [PK_Usuario] PRIMARY KEY CLUSTERED 
    (
    	[IdUsuario] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[UsuarioLegacy]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UsuarioLegacy](
    	[IdUsuario] [uniqueidentifier] NOT NULL,
    	[Nombre] [nvarchar](100) NOT NULL,
    	[Apellido] [nvarchar](100) NOT NULL,
    	[Cedula] [nvarchar](15) NOT NULL,
    	[ContrasenaHash] [nvarchar](255) NOT NULL,
    	[Email] [nvarchar](100) NOT NULL,
    	[Telefono] [nvarchar](15) NOT NULL,
     CONSTRAINT [PK_UsuarioLegacy] PRIMARY KEY CLUSTERED 
    (
    	[IdUsuario] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Validaciones]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Validaciones](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[DocumentoId] [uniqueidentifier] NULL,
    	[FuenteValidacion] [nvarchar](200) NOT NULL,
    	[EstadoValidacion] [int] NOT NULL,
    	[EsLegitimo] [bit] NULL,
    	[PorcentajeIntegridad] [float] NULL,
    	[Detalle] [nvarchar](2000) NULL,
    	[CamposValidadosJson] [nvarchar](max) NULL,
    	[SelloId] [uniqueidentifier] NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_Validaciones] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[ValidacionesDgii]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ValidacionesDgii](
    	[Id] [uniqueidentifier] NOT NULL,
    	[ProyectoId] [uniqueidentifier] NOT NULL,
    	[Rnc] [nvarchar](max) NOT NULL,
    	[Status] [int] NOT NULL,
    	[TieneDeudas] [bit] NOT NULL,
    	[FechaConsulta] [datetime2](7) NOT NULL,
    	[ErrorMessage] [nvarchar](max) NULL,
    	[OrigenDatos] [nvarchar](max) NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_ValidacionesDgii] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END;
GO

IF OBJECT_ID(N'[Verificacion2FA]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Verificacion2FA](
    	[Id] [uniqueidentifier] NOT NULL,
    	[UsuarioId] [uniqueidentifier] NOT NULL,
    	[SesionId] [nvarchar](200) NOT NULL,
    	[NumeroVerificable] [nvarchar](6) NOT NULL,
    	[FechaCreacion] [datetime2](7) NOT NULL,
    	[CreatedAtUtc] [datetime2](7) NOT NULL,
    	[UpdatedAtUtc] [datetime2](7) NULL,
     CONSTRAINT [PK_Verificacion2FA] PRIMARY KEY CLUSTERED 
    (
    	[Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Acceso_IdPerfil' AND object_id = OBJECT_ID(N'[Acceso]'))
BEGIN
    /****** Object:  Index [IX_Acceso_IdPerfil]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Acceso_IdPerfil] ON [dbo].[Acceso]
    (
    	[IdPerfil] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Acceso_IdUsuario' AND object_id = OBJECT_ID(N'[Acceso]'))
BEGIN
    /****** Object:  Index [IX_Acceso_IdUsuario]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Acceso_IdUsuario] ON [dbo].[Acceso]
    (
    	[IdUsuario] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AlertasValidacion_DocumentoId' AND object_id = OBJECT_ID(N'[AlertasValidacion]'))
BEGIN
    /****** Object:  Index [IX_AlertasValidacion_DocumentoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_AlertasValidacion_DocumentoId] ON [dbo].[AlertasValidacion]
    (
    	[DocumentoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AlertasValidacion_ProyectoId' AND object_id = OBJECT_ID(N'[AlertasValidacion]'))
BEGIN
    /****** Object:  Index [IX_AlertasValidacion_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_AlertasValidacion_ProyectoId] ON [dbo].[AlertasValidacion]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Auditorias_ProyectoId' AND object_id = OBJECT_ID(N'[Auditorias]'))
BEGIN
    /****** Object:  Index [IX_Auditorias_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Auditorias_ProyectoId] ON [dbo].[Auditorias]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Auditorias_UsuarioId' AND object_id = OBJECT_ID(N'[Auditorias]'))
BEGIN
    /****** Object:  Index [IX_Auditorias_UsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Auditorias_UsuarioId] ON [dbo].[Auditorias]
    (
    	[UsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Certificaciones_ProyectoId' AND object_id = OBJECT_ID(N'[Certificaciones]'))
BEGIN
    /****** Object:  Index [IX_Certificaciones_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Certificaciones_ProyectoId] ON [dbo].[Certificaciones]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Certificaciones_ReporteId' AND object_id = OBJECT_ID(N'[Certificaciones]'))
BEGIN
    /****** Object:  Index [IX_Certificaciones_ReporteId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Certificaciones_ReporteId] ON [dbo].[Certificaciones]
    (
    	[ReporteId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ConsentimientosFinancieros_UsuarioId' AND object_id = OBJECT_ID(N'[ConsentimientosFinancieros]'))
BEGIN
    /****** Object:  Index [IX_ConsentimientosFinancieros_UsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ConsentimientosFinancieros_UsuarioId] ON [dbo].[ConsentimientosFinancieros]
    (
    	[UsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_DatoValidado_ValidacionId' AND object_id = OBJECT_ID(N'[DatoValidado]'))
BEGIN
    /****** Object:  Index [IX_DatoValidado_ValidacionId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_DatoValidado_ValidacionId] ON [dbo].[DatoValidado]
    (
    	[ValidacionId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_DeteccionesDuplicidad_ProyectoDuplicadoId' AND object_id = OBJECT_ID(N'[DeteccionesDuplicidad]'))
BEGIN
    /****** Object:  Index [IX_DeteccionesDuplicidad_ProyectoDuplicadoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_DeteccionesDuplicidad_ProyectoDuplicadoId] ON [dbo].[DeteccionesDuplicidad]
    (
    	[ProyectoDuplicadoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_DeteccionesDuplicidad_ProyectoId' AND object_id = OBJECT_ID(N'[DeteccionesDuplicidad]'))
BEGIN
    /****** Object:  Index [IX_DeteccionesDuplicidad_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_DeteccionesDuplicidad_ProyectoId] ON [dbo].[DeteccionesDuplicidad]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Documentos_Activo' AND object_id = OBJECT_ID(N'[Documentos]'))
BEGIN
    /****** Object:  Index [IX_Documentos_Activo]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Documentos_Activo] ON [dbo].[Documentos]
    (
    	[Activo] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Documentos_ProyectoId' AND object_id = OBJECT_ID(N'[Documentos]'))
BEGIN
    /****** Object:  Index [IX_Documentos_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Documentos_ProyectoId] ON [dbo].[Documentos]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Documentos_TipoDocumento' AND object_id = OBJECT_ID(N'[Documentos]'))
BEGIN
    /****** Object:  Index [IX_Documentos_TipoDocumento]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Documentos_TipoDocumento] ON [dbo].[Documentos]
    (
    	[TipoDocumento] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Hallazgos_ProyectoId' AND object_id = OBJECT_ID(N'[Hallazgos]'))
BEGIN
    /****** Object:  Index [IX_Hallazgos_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Hallazgos_ProyectoId] ON [dbo].[Hallazgos]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Hallazgos_ValidacionId' AND object_id = OBJECT_ID(N'[Hallazgos]'))
BEGIN
    /****** Object:  Index [IX_Hallazgos_ValidacionId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Hallazgos_ValidacionId] ON [dbo].[Hallazgos]
    (
    	[ValidacionId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Invitaciones_EmisorId' AND object_id = OBJECT_ID(N'[Invitaciones]'))
BEGIN
    /****** Object:  Index [IX_Invitaciones_EmisorId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Invitaciones_EmisorId] ON [dbo].[Invitaciones]
    (
    	[EmisorId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LogConsultas_FechaConsulta' AND object_id = OBJECT_ID(N'[LogConsultas]'))
BEGIN
    /****** Object:  Index [IX_LogConsultas_FechaConsulta]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_LogConsultas_FechaConsulta] ON [dbo].[LogConsultas]
    (
    	[FechaConsulta] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LogConsultas_UsuarioId' AND object_id = OBJECT_ID(N'[LogConsultas]'))
BEGIN
    /****** Object:  Index [IX_LogConsultas_UsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_LogConsultas_UsuarioId] ON [dbo].[LogConsultas]
    (
    	[UsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LogProyectos_FechaCreacion' AND object_id = OBJECT_ID(N'[LogProyectos]'))
BEGIN
    /****** Object:  Index [IX_LogProyectos_FechaCreacion]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_LogProyectos_FechaCreacion] ON [dbo].[LogProyectos]
    (
    	[FechaCreacion] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LogProyectos_ProyectoId' AND object_id = OBJECT_ID(N'[LogProyectos]'))
BEGIN
    /****** Object:  Index [IX_LogProyectos_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_LogProyectos_ProyectoId] ON [dbo].[LogProyectos]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LogProyectos_UsuarioId' AND object_id = OBJECT_ID(N'[LogProyectos]'))
BEGIN
    /****** Object:  Index [IX_LogProyectos_UsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_LogProyectos_UsuarioId] ON [dbo].[LogProyectos]
    (
    	[UsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Pagos_Idsuscripcion' AND object_id = OBJECT_ID(N'[Pagos]'))
BEGIN
    /****** Object:  Index [IX_Pagos_Idsuscripcion]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Pagos_Idsuscripcion] ON [dbo].[Pagos]
    (
    	[Idsuscripcion] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Pagos_IdUsuario' AND object_id = OBJECT_ID(N'[Pagos]'))
BEGIN
    /****** Object:  Index [IX_Pagos_IdUsuario]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Pagos_IdUsuario] ON [dbo].[Pagos]
    (
    	[IdUsuario] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_PerfilPermiso_IdPermiso' AND object_id = OBJECT_ID(N'[PerfilPermiso]'))
BEGIN
    /****** Object:  Index [IX_PerfilPermiso_IdPermiso]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_PerfilPermiso_IdPermiso] ON [dbo].[PerfilPermiso]
    (
    	[IdPermiso] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectoGuardado_CreatorId' AND object_id = OBJECT_ID(N'[ProyectoGuardado]'))
BEGIN
    /****** Object:  Index [IX_ProyectoGuardado_CreatorId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectoGuardado_CreatorId] ON [dbo].[ProyectoGuardado]
    (
    	[CreatorId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectoGuardado_ProjectId' AND object_id = OBJECT_ID(N'[ProyectoGuardado]'))
BEGIN
    /****** Object:  Index [IX_ProyectoGuardado_ProjectId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectoGuardado_ProjectId] ON [dbo].[ProyectoGuardado]
    (
    	[ProjectId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectoGuardado_SaverId' AND object_id = OBJECT_ID(N'[ProyectoGuardado]'))
BEGIN
    /****** Object:  Index [IX_ProyectoGuardado_SaverId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectoGuardado_SaverId] ON [dbo].[ProyectoGuardado]
    (
    	[SaverId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectoInteres_CreatorId' AND object_id = OBJECT_ID(N'[ProyectoInteres]'))
BEGIN
    /****** Object:  Index [IX_ProyectoInteres_CreatorId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectoInteres_CreatorId] ON [dbo].[ProyectoInteres]
    (
    	[CreatorId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectoInteres_InterestedUserId' AND object_id = OBJECT_ID(N'[ProyectoInteres]'))
BEGIN
    /****** Object:  Index [IX_ProyectoInteres_InterestedUserId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectoInteres_InterestedUserId] ON [dbo].[ProyectoInteres]
    (
    	[InterestedUserId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectoInteres_ProjectId' AND object_id = OBJECT_ID(N'[ProyectoInteres]'))
BEGIN
    /****** Object:  Index [IX_ProyectoInteres_ProjectId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectoInteres_ProjectId] ON [dbo].[ProyectoInteres]
    (
    	[ProjectId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

BEGIN TRY
    SET ANSI_PADDING ON
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    /****** Object:  Index [IX_ProyectosEstados_CodigoUnico]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE UNIQUE NONCLUSTERED INDEX [IX_ProyectosEstados_CodigoUnico] ON [dbo].[ProyectosEstados]
    (
    	[CodigoUnico] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    SET ANSI_PADDING ON
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    /****** Object:  Index [IX_ProyectosInmobiliarios_CodigoInterno]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE UNIQUE NONCLUSTERED INDEX [IX_ProyectosInmobiliarios_CodigoInterno] ON [dbo].[ProyectosInmobiliarios]
    (
    	[CodigoInterno] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectosInmobiliarios_EstadoId' AND object_id = OBJECT_ID(N'[ProyectosInmobiliarios]'))
BEGIN
    /****** Object:  Index [IX_ProyectosInmobiliarios_EstadoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectosInmobiliarios_EstadoId] ON [dbo].[ProyectosInmobiliarios]
    (
    	[EstadoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ProyectosInmobiliarios_IdUsuario' AND object_id = OBJECT_ID(N'[ProyectosInmobiliarios]'))
BEGIN
    /****** Object:  Index [IX_ProyectosInmobiliarios_IdUsuario]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ProyectosInmobiliarios_IdUsuario] ON [dbo].[ProyectosInmobiliarios]
    (
    	[IdUsuario] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Reportes_GeneradoPorUsuarioId' AND object_id = OBJECT_ID(N'[Reportes]'))
BEGIN
    /****** Object:  Index [IX_Reportes_GeneradoPorUsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Reportes_GeneradoPorUsuarioId] ON [dbo].[Reportes]
    (
    	[GeneradoPorUsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Reportes_ProyectoId' AND object_id = OBJECT_ID(N'[Reportes]'))
BEGIN
    /****** Object:  Index [IX_Reportes_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Reportes_ProyectoId] ON [dbo].[Reportes]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ResultadosCrediticios_ConsentimientoId' AND object_id = OBJECT_ID(N'[ResultadosCrediticios]'))
BEGIN
    /****** Object:  Index [IX_ResultadosCrediticios_ConsentimientoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ResultadosCrediticios_ConsentimientoId] ON [dbo].[ResultadosCrediticios]
    (
    	[ConsentimientoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ResultadosCrediticios_ProyectoId' AND object_id = OBJECT_ID(N'[ResultadosCrediticios]'))
BEGIN
    /****** Object:  Index [IX_ResultadosCrediticios_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ResultadosCrediticios_ProyectoId] ON [dbo].[ResultadosCrediticios]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

BEGIN TRY
    SET ANSI_PADDING ON
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    /****** Object:  Index [IX_SellosIntegridad_CodigoSello]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE UNIQUE NONCLUSTERED INDEX [IX_SellosIntegridad_CodigoSello] ON [dbo].[SellosIntegridad]
    (
    	[CodigoSello] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_SellosIntegridad_ProyectoId' AND object_id = OBJECT_ID(N'[SellosIntegridad]'))
BEGIN
    /****** Object:  Index [IX_SellosIntegridad_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_SellosIntegridad_ProyectoId] ON [dbo].[SellosIntegridad]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_SesionUsuario_UsuarioId' AND object_id = OBJECT_ID(N'[SesionUsuario]'))
BEGIN
    /****** Object:  Index [IX_SesionUsuario_UsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_SesionUsuario_UsuarioId] ON [dbo].[SesionUsuario]
    (
    	[UsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Usuario_PlanSuscripcionId' AND object_id = OBJECT_ID(N'[Usuario]'))
BEGIN
    /****** Object:  Index [IX_Usuario_PlanSuscripcionId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Usuario_PlanSuscripcionId] ON [dbo].[Usuario]
    (
    	[PlanSuscripcionId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Usuario_TitularId' AND object_id = OBJECT_ID(N'[Usuario]'))
BEGIN
    /****** Object:  Index [IX_Usuario_TitularId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Usuario_TitularId] ON [dbo].[Usuario]
    (
    	[TitularId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

BEGIN TRY
    SET ANSI_PADDING ON
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    /****** Object:  Index [UQ_Usuario_Email]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_Usuario_Email] ON [dbo].[Usuario]
    (
    	[Email] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    SET ANSI_PADDING ON
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    /****** Object:  Index [UQ_Usuario_Nickname]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_Usuario_Nickname] ON [dbo].[Usuario]
    (
    	[Nickname] ASC
    )
    WHERE ([Nickname] IS NOT NULL)
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    SET ANSI_PADDING ON
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    /****** Object:  Index [IX_UsuarioLegacy_Email]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE UNIQUE NONCLUSTERED INDEX [IX_UsuarioLegacy_Email] ON [dbo].[UsuarioLegacy]
    (
    	[Email] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Validaciones_DocumentoId' AND object_id = OBJECT_ID(N'[Validaciones]'))
BEGIN
    /****** Object:  Index [IX_Validaciones_DocumentoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Validaciones_DocumentoId] ON [dbo].[Validaciones]
    (
    	[DocumentoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Validaciones_ProyectoId' AND object_id = OBJECT_ID(N'[Validaciones]'))
BEGIN
    /****** Object:  Index [IX_Validaciones_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Validaciones_ProyectoId] ON [dbo].[Validaciones]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Validaciones_SelloId' AND object_id = OBJECT_ID(N'[Validaciones]'))
BEGIN
    /****** Object:  Index [IX_Validaciones_SelloId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Validaciones_SelloId] ON [dbo].[Validaciones]
    (
    	[SelloId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ValidacionesDgii_ProyectoId' AND object_id = OBJECT_ID(N'[ValidacionesDgii]'))
BEGIN
    /****** Object:  Index [IX_ValidacionesDgii_ProyectoId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_ValidacionesDgii_ProyectoId] ON [dbo].[ValidacionesDgii]
    (
    	[ProyectoId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Verificacion2FA_UsuarioId' AND object_id = OBJECT_ID(N'[Verificacion2FA]'))
BEGIN
    /****** Object:  Index [IX_Verificacion2FA_UsuarioId]    Script Date: 7/28/2026 11:18:17 PM ******/
    CREATE NONCLUSTERED INDEX [IX_Verificacion2FA_UsuarioId] ON [dbo].[Verificacion2FA]
    (
    	[UsuarioId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ApiGobernanza] ADD  DEFAULT (newid()) FOR [IdApiGobernanza]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[AyuntamientoTarifa] ADD  DEFAULT (newid()) FOR [IdAyuntamiento]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[CatastroTitulo] ADD  DEFAULT (newid()) FOR [IdCatastroTitulo]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[CertiMivhed] ADD  DEFAULT (newid()) FOR [IdMivhed]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Consultas] ADD  DEFAULT (newid()) FOR [IdConsulta]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Documento] ADD  DEFAULT (newid()) FOR [IdDocumento]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[EstudioSuelo] ADD  DEFAULT (newid()) FOR [IdESuelo]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunConsultas_Log] ADD  DEFAULT (newid()) FOR [IdConsultaLog]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunConsultas_Log] ADD  DEFAULT (getdate()) FOR [FechaConsulta]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunProyectos_Log] ADD  DEFAULT (newid()) FOR [IdProyectoLog]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunProyectos_Log] ADD  DEFAULT (getdate()) FOR [FechaAcceso]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Invitaciones] ADD  DEFAULT (CONVERT([bit],(0))) FOR [Aceptada]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogPagos] ADD  DEFAULT (newid()) FOR [IdLog]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogPagos] ADD  DEFAULT (getdate()) FOR [FechaLog]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Municipio] ADD  DEFAULT (newid()) FOR [IdMunicipio]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Notificaciones] ADD  DEFAULT (N'') FOR [CodigoReferencia]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PagoIPI] ADD  DEFAULT (getutcdate()) FOR [FechaCreacion]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Pagos] ADD  DEFAULT (getdate()) FOR [FechaPago]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PermisoSuelo] ADD  DEFAULT (newid()) FOR [IdPSuelo]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanCaracteristica] ADD  DEFAULT (newid()) FOR [IdPlan]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT ((0)) FOR [MaxConsultas]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT ((0)) FOR [MaxProyectos]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [PresentacionPublica]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [QrIncluido]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [AccesoApi]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [AlertasTiempoRealDisponible]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [ExportacionExcelDisponible]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [ExportacionPdfDisponible]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [IntegracionCrmDisponible]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT ((0)) FOR [MaxAlmacenamientoMb]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT ((0)) FOR [MaxUsuariosSecundarios]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [ModeloLmDisponible]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (N'Comunidad') FOR [SoporteTipo]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanSuscripcion] ADD  DEFAULT (CONVERT([bit],(0))) FOR [ValidacionLoteDisponible]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Provincia] ADD  DEFAULT (newid()) FOR [IdProvincia]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosEstados] ADD  DEFAULT (CONVERT([bit],(1))) FOR [Activo]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosInmobiliarios] ADD  DEFAULT ('06d8b31a-3d06-43bc-865a-b7c6057e8e9d') FOR [EstadoId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Recibo] ADD  DEFAULT (newid()) FOR [IdPago]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[SelloIntegridad] ADD  DEFAULT (newid()) FOR [IdSello]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[SolvenciaFinanciera] ADD  DEFAULT (newid()) FOR [IdSolvencia]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[TarifaSueloAyuntamiento] ADD  DEFAULT (newid()) FOR [IdTarifaAyuntamiento]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[TipoDocumento] ADD  DEFAULT (newid()) FOR [IdTipoDcumento]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[TipoInmoviliario] ADD  DEFAULT (newid()) FOR [IdMoviliario]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (CONVERT([bit],(1))) FOR [Activo]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (CONVERT([bit],(1))) FOR [EmailVerificado]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((0)) FOR [ConsultasUsadas]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((0)) FOR [ProyectosCreados]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((0)) FOR [AccountStatus]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (CONVERT([bit],(0))) FOR [SocialLogin]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (CONVERT([bit],(0))) FOR [CancelAtPeriodEnd]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (CONVERT([bit],(0))) FOR [AceptoDescargo]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Acceso_Perfiles_IdPerfil]') AND parent_object_id = OBJECT_ID(N'[Acceso]'))
BEGIN
    ALTER TABLE [dbo].[Acceso]  WITH CHECK ADD  CONSTRAINT [FK_Acceso_Perfiles_IdPerfil] FOREIGN KEY([IdPerfil])
    REFERENCES [dbo].[Perfiles] ([IdPerfil])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Acceso] CHECK CONSTRAINT [FK_Acceso_Perfiles_IdPerfil]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Acceso_UsuarioLegacy_IdUsuario]') AND parent_object_id = OBJECT_ID(N'[Acceso]'))
BEGIN
    ALTER TABLE [dbo].[Acceso]  WITH CHECK ADD  CONSTRAINT [FK_Acceso_UsuarioLegacy_IdUsuario] FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[UsuarioLegacy] ([IdUsuario])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Acceso] CHECK CONSTRAINT [FK_Acceso_UsuarioLegacy_IdUsuario]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_AlertasValidacion_Documentos_DocumentoId]') AND parent_object_id = OBJECT_ID(N'[AlertasValidacion]'))
BEGIN
    ALTER TABLE [dbo].[AlertasValidacion]  WITH CHECK ADD  CONSTRAINT [FK_AlertasValidacion_Documentos_DocumentoId] FOREIGN KEY([DocumentoId])
    REFERENCES [dbo].[Documentos] ([Id])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[AlertasValidacion] CHECK CONSTRAINT [FK_AlertasValidacion_Documentos_DocumentoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[AlertasValidacion]'))
BEGIN
    ALTER TABLE [dbo].[AlertasValidacion]  WITH CHECK ADD  CONSTRAINT [FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[AlertasValidacion] CHECK CONSTRAINT [FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Auditorias_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[Auditorias]'))
BEGIN
    ALTER TABLE [dbo].[Auditorias]  WITH CHECK ADD  CONSTRAINT [FK_Auditorias_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Auditorias] CHECK CONSTRAINT [FK_Auditorias_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Auditorias_Usuario_UsuarioId]') AND parent_object_id = OBJECT_ID(N'[Auditorias]'))
BEGIN
    ALTER TABLE [dbo].[Auditorias]  WITH CHECK ADD  CONSTRAINT [FK_Auditorias_Usuario_UsuarioId] FOREIGN KEY([UsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Auditorias] CHECK CONSTRAINT [FK_Auditorias_Usuario_UsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[AyuntamientoTarifa]  WITH CHECK ADD FOREIGN KEY([IdMunicipio])
    REFERENCES [dbo].[Municipio] ([IdMunicipio])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[AyuntamientoTarifa]  WITH CHECK ADD FOREIGN KEY([IdTarifaAyuntamiento])
    REFERENCES [dbo].[TarifaSueloAyuntamiento] ([IdTarifaAyuntamiento])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Certificaciones_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[Certificaciones]'))
BEGIN
    ALTER TABLE [dbo].[Certificaciones]  WITH CHECK ADD  CONSTRAINT [FK_Certificaciones_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Certificaciones] CHECK CONSTRAINT [FK_Certificaciones_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Certificaciones_Reportes_ReporteId]') AND parent_object_id = OBJECT_ID(N'[Certificaciones]'))
BEGIN
    ALTER TABLE [dbo].[Certificaciones]  WITH CHECK ADD  CONSTRAINT [FK_Certificaciones_Reportes_ReporteId] FOREIGN KEY([ReporteId])
    REFERENCES [dbo].[Reportes] ([Id])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Certificaciones] CHECK CONSTRAINT [FK_Certificaciones_Reportes_ReporteId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[CertiMivhed]  WITH CHECK ADD FOREIGN KEY([IdProyecto])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ConsentimientosFinancieros_Usuario_UsuarioId]') AND parent_object_id = OBJECT_ID(N'[ConsentimientosFinancieros]'))
BEGIN
    ALTER TABLE [dbo].[ConsentimientosFinancieros]  WITH CHECK ADD  CONSTRAINT [FK_ConsentimientosFinancieros_Usuario_UsuarioId] FOREIGN KEY([UsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ConsentimientosFinancieros] CHECK CONSTRAINT [FK_ConsentimientosFinancieros_Usuario_UsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_DatoValidado_Validaciones_ValidacionId]') AND parent_object_id = OBJECT_ID(N'[DatoValidado]'))
BEGIN
    ALTER TABLE [dbo].[DatoValidado]  WITH CHECK ADD  CONSTRAINT [FK_DatoValidado_Validaciones_ValidacionId] FOREIGN KEY([ValidacionId])
    REFERENCES [dbo].[Validaciones] ([Id])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[DatoValidado] CHECK CONSTRAINT [FK_DatoValidado_Validaciones_ValidacionId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId]') AND parent_object_id = OBJECT_ID(N'[DeteccionesDuplicidad]'))
BEGIN
    ALTER TABLE [dbo].[DeteccionesDuplicidad]  WITH CHECK ADD  CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId] FOREIGN KEY([ProyectoDuplicadoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[DeteccionesDuplicidad] CHECK CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[DeteccionesDuplicidad]'))
BEGIN
    ALTER TABLE [dbo].[DeteccionesDuplicidad]  WITH CHECK ADD  CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[DeteccionesDuplicidad] CHECK CONSTRAINT [FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Documento]  WITH CHECK ADD FOREIGN KEY([IdProyecto])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Documento]  WITH CHECK ADD FOREIGN KEY([IdTipoDcumento])
    REFERENCES [dbo].[TipoDocumento] ([IdTipoDcumento])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Documentos_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[Documentos]'))
BEGIN
    ALTER TABLE [dbo].[Documentos]  WITH CHECK ADD  CONSTRAINT [FK_Documentos_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Documentos] CHECK CONSTRAINT [FK_Documentos_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[EstudioSuelo]  WITH CHECK ADD FOREIGN KEY([IdProyecto])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunConsultas_Log]  WITH CHECK ADD FOREIGN KEY([IdConsulta])
    REFERENCES [dbo].[Consultas] ([IdConsulta])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunConsultas_Log]  WITH CHECK ADD FOREIGN KEY([IdProyecto])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunConsultas_Log]  WITH CHECK ADD FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunProyectos_Log]  WITH CHECK ADD FOREIGN KEY([IdProyecto])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[FremiunProyectos_Log]  WITH CHECK ADD FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Hallazgos_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[Hallazgos]'))
BEGIN
    ALTER TABLE [dbo].[Hallazgos]  WITH CHECK ADD  CONSTRAINT [FK_Hallazgos_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Hallazgos] CHECK CONSTRAINT [FK_Hallazgos_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Hallazgos_Validaciones_ValidacionId]') AND parent_object_id = OBJECT_ID(N'[Hallazgos]'))
BEGIN
    ALTER TABLE [dbo].[Hallazgos]  WITH CHECK ADD  CONSTRAINT [FK_Hallazgos_Validaciones_ValidacionId] FOREIGN KEY([ValidacionId])
    REFERENCES [dbo].[Validaciones] ([Id])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Hallazgos] CHECK CONSTRAINT [FK_Hallazgos_Validaciones_ValidacionId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Invitaciones_Usuario_EmisorId]') AND parent_object_id = OBJECT_ID(N'[Invitaciones]'))
BEGIN
    ALTER TABLE [dbo].[Invitaciones]  WITH CHECK ADD  CONSTRAINT [FK_Invitaciones_Usuario_EmisorId] FOREIGN KEY([EmisorId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Invitaciones] CHECK CONSTRAINT [FK_Invitaciones_Usuario_EmisorId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_LogConsultas_Usuario_UsuarioId]') AND parent_object_id = OBJECT_ID(N'[LogConsultas]'))
BEGIN
    ALTER TABLE [dbo].[LogConsultas]  WITH CHECK ADD  CONSTRAINT [FK_LogConsultas_Usuario_UsuarioId] FOREIGN KEY([UsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogConsultas] CHECK CONSTRAINT [FK_LogConsultas_Usuario_UsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogPagos]  WITH CHECK ADD FOREIGN KEY([Idpago])
    REFERENCES [dbo].[Pagos] ([IdPago])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogPagos]  WITH CHECK ADD FOREIGN KEY([Idsuscripcion])
    REFERENCES [dbo].[PlanSuscripcion] ([Idsuscripcion])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogPagos]  WITH CHECK ADD FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_LogProyectos_Proyectos_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[LogProyectos]'))
BEGIN
    ALTER TABLE [dbo].[LogProyectos]  WITH CHECK ADD  CONSTRAINT [FK_LogProyectos_Proyectos_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogProyectos] CHECK CONSTRAINT [FK_LogProyectos_Proyectos_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_LogProyectos_Usuario_UsuarioId]') AND parent_object_id = OBJECT_ID(N'[LogProyectos]'))
BEGIN
    ALTER TABLE [dbo].[LogProyectos]  WITH CHECK ADD  CONSTRAINT [FK_LogProyectos_Usuario_UsuarioId] FOREIGN KEY([UsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[LogProyectos] CHECK CONSTRAINT [FK_LogProyectos_Usuario_UsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Municipio]  WITH CHECK ADD FOREIGN KEY([IdProvincia])
    REFERENCES [dbo].[Provincia] ([IdProvincia])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Pagos_PlanSuscripcion_Idsuscripcion]') AND parent_object_id = OBJECT_ID(N'[Pagos]'))
BEGIN
    ALTER TABLE [dbo].[Pagos]  WITH CHECK ADD  CONSTRAINT [FK_Pagos_PlanSuscripcion_Idsuscripcion] FOREIGN KEY([Idsuscripcion])
    REFERENCES [dbo].[PlanSuscripcion] ([Idsuscripcion])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Pagos] CHECK CONSTRAINT [FK_Pagos_PlanSuscripcion_Idsuscripcion]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Pagos_UsuarioLegacy_IdUsuario]') AND parent_object_id = OBJECT_ID(N'[Pagos]'))
BEGIN
    ALTER TABLE [dbo].[Pagos]  WITH CHECK ADD  CONSTRAINT [FK_Pagos_UsuarioLegacy_IdUsuario] FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[UsuarioLegacy] ([IdUsuario])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Pagos] CHECK CONSTRAINT [FK_Pagos_UsuarioLegacy_IdUsuario]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_PerfilPermiso_Perfiles_IdPerfil]') AND parent_object_id = OBJECT_ID(N'[PerfilPermiso]'))
BEGIN
    ALTER TABLE [dbo].[PerfilPermiso]  WITH CHECK ADD  CONSTRAINT [FK_PerfilPermiso_Perfiles_IdPerfil] FOREIGN KEY([IdPerfil])
    REFERENCES [dbo].[Perfiles] ([IdPerfil])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PerfilPermiso] CHECK CONSTRAINT [FK_PerfilPermiso_Perfiles_IdPerfil]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_PerfilPermiso_Permisos_IdPermiso]') AND parent_object_id = OBJECT_ID(N'[PerfilPermiso]'))
BEGIN
    ALTER TABLE [dbo].[PerfilPermiso]  WITH CHECK ADD  CONSTRAINT [FK_PerfilPermiso_Permisos_IdPermiso] FOREIGN KEY([IdPermiso])
    REFERENCES [dbo].[Permisos] ([IdPermiso])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PerfilPermiso] CHECK CONSTRAINT [FK_PerfilPermiso_Permisos_IdPermiso]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[PlanCaracteristica]  WITH CHECK ADD FOREIGN KEY([Idsuscripcion])
    REFERENCES [dbo].[PlanSuscripcion] ([Idsuscripcion])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectoGuardado_ProyectosInmobiliarios_ProjectId]') AND parent_object_id = OBJECT_ID(N'[ProyectoGuardado]'))
BEGIN
    ALTER TABLE [dbo].[ProyectoGuardado]  WITH CHECK ADD  CONSTRAINT [FK_ProyectoGuardado_ProyectosInmobiliarios_ProjectId] FOREIGN KEY([ProjectId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectoGuardado] CHECK CONSTRAINT [FK_ProyectoGuardado_ProyectosInmobiliarios_ProjectId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectoGuardado_Usuario_CreatorId]') AND parent_object_id = OBJECT_ID(N'[ProyectoGuardado]'))
BEGIN
    ALTER TABLE [dbo].[ProyectoGuardado]  WITH CHECK ADD  CONSTRAINT [FK_ProyectoGuardado_Usuario_CreatorId] FOREIGN KEY([CreatorId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectoGuardado] CHECK CONSTRAINT [FK_ProyectoGuardado_Usuario_CreatorId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectoGuardado_Usuario_SaverId]') AND parent_object_id = OBJECT_ID(N'[ProyectoGuardado]'))
BEGIN
    ALTER TABLE [dbo].[ProyectoGuardado]  WITH CHECK ADD  CONSTRAINT [FK_ProyectoGuardado_Usuario_SaverId] FOREIGN KEY([SaverId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectoGuardado] CHECK CONSTRAINT [FK_ProyectoGuardado_Usuario_SaverId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectoInteres_ProyectosInmobiliarios_ProjectId]') AND parent_object_id = OBJECT_ID(N'[ProyectoInteres]'))
BEGIN
    ALTER TABLE [dbo].[ProyectoInteres]  WITH CHECK ADD  CONSTRAINT [FK_ProyectoInteres_ProyectosInmobiliarios_ProjectId] FOREIGN KEY([ProjectId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectoInteres] CHECK CONSTRAINT [FK_ProyectoInteres_ProyectosInmobiliarios_ProjectId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectoInteres_Usuario_CreatorId]') AND parent_object_id = OBJECT_ID(N'[ProyectoInteres]'))
BEGIN
    ALTER TABLE [dbo].[ProyectoInteres]  WITH CHECK ADD  CONSTRAINT [FK_ProyectoInteres_Usuario_CreatorId] FOREIGN KEY([CreatorId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectoInteres] CHECK CONSTRAINT [FK_ProyectoInteres_Usuario_CreatorId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectoInteres_Usuario_InterestedUserId]') AND parent_object_id = OBJECT_ID(N'[ProyectoInteres]'))
BEGIN
    ALTER TABLE [dbo].[ProyectoInteres]  WITH CHECK ADD  CONSTRAINT [FK_ProyectoInteres_Usuario_InterestedUserId] FOREIGN KEY([InterestedUserId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectoInteres] CHECK CONSTRAINT [FK_ProyectoInteres_Usuario_InterestedUserId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosInmobiliarios]  WITH CHECK ADD FOREIGN KEY([IdCatastroTitulo])
    REFERENCES [dbo].[CatastroTitulo] ([IdCatastroTitulo])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosInmobiliarios]  WITH CHECK ADD FOREIGN KEY([IdMivhed])
    REFERENCES [dbo].[CertiMivhed] ([IdMivhed])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosInmobiliarios]  WITH CHECK ADD FOREIGN KEY([IdPSuelo])
    REFERENCES [dbo].[PermisoSuelo] ([IdPSuelo])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId]') AND parent_object_id = OBJECT_ID(N'[ProyectosInmobiliarios]'))
BEGIN
    ALTER TABLE [dbo].[ProyectosInmobiliarios]  WITH CHECK ADD  CONSTRAINT [FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId] FOREIGN KEY([EstadoId])
    REFERENCES [dbo].[ProyectosEstados] ([Id])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosInmobiliarios] CHECK CONSTRAINT [FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ProyectosInmobiliarios_Usuario_IdUsuario]') AND parent_object_id = OBJECT_ID(N'[ProyectosInmobiliarios]'))
BEGIN
    ALTER TABLE [dbo].[ProyectosInmobiliarios]  WITH CHECK ADD  CONSTRAINT [FK_ProyectosInmobiliarios_Usuario_IdUsuario] FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ProyectosInmobiliarios] CHECK CONSTRAINT [FK_ProyectosInmobiliarios_Usuario_IdUsuario]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Recibo]  WITH CHECK ADD FOREIGN KEY([IdUsuario])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Reportes_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[Reportes]'))
BEGIN
    ALTER TABLE [dbo].[Reportes]  WITH CHECK ADD  CONSTRAINT [FK_Reportes_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Reportes] CHECK CONSTRAINT [FK_Reportes_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Reportes_Usuario_GeneradoPorUsuarioId]') AND parent_object_id = OBJECT_ID(N'[Reportes]'))
BEGIN
    ALTER TABLE [dbo].[Reportes]  WITH CHECK ADD  CONSTRAINT [FK_Reportes_Usuario_GeneradoPorUsuarioId] FOREIGN KEY([GeneradoPorUsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Reportes] CHECK CONSTRAINT [FK_Reportes_Usuario_GeneradoPorUsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ResultadosCrediticios_ConsentimientosFinancieros_ConsentimientoId]') AND parent_object_id = OBJECT_ID(N'[ResultadosCrediticios]'))
BEGIN
    ALTER TABLE [dbo].[ResultadosCrediticios]  WITH CHECK ADD  CONSTRAINT [FK_ResultadosCrediticios_ConsentimientosFinancieros_ConsentimientoId] FOREIGN KEY([ConsentimientoId])
    REFERENCES [dbo].[ConsentimientosFinancieros] ([Id])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ResultadosCrediticios] CHECK CONSTRAINT [FK_ResultadosCrediticios_ConsentimientosFinancieros_ConsentimientoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[ResultadosCrediticios]'))
BEGIN
    ALTER TABLE [dbo].[ResultadosCrediticios]  WITH CHECK ADD  CONSTRAINT [FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ResultadosCrediticios] CHECK CONSTRAINT [FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[SelloIntegridad]  WITH CHECK ADD FOREIGN KEY([IdDocumento])
    REFERENCES [dbo].[Documento] ([IdDocumento])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[SellosIntegridad]'))
BEGIN
    ALTER TABLE [dbo].[SellosIntegridad]  WITH CHECK ADD  CONSTRAINT [FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[SellosIntegridad] CHECK CONSTRAINT [FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_SesionUsuario_Usuario_UsuarioId]') AND parent_object_id = OBJECT_ID(N'[SesionUsuario]'))
BEGIN
    ALTER TABLE [dbo].[SesionUsuario]  WITH CHECK ADD  CONSTRAINT [FK_SesionUsuario_Usuario_UsuarioId] FOREIGN KEY([UsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[SesionUsuario] CHECK CONSTRAINT [FK_SesionUsuario_Usuario_UsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[SolvenciaFinanciera]  WITH CHECK ADD FOREIGN KEY([IdMoviliario])
    REFERENCES [dbo].[TipoInmoviliario] ([IdMoviliario])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[TarifaSueloAyuntamiento]  WITH CHECK ADD FOREIGN KEY([IdMunicipio])
    REFERENCES [dbo].[Municipio] ([IdMunicipio])
END TRY
BEGIN CATCH
END CATCH;
GO

BEGIN TRY
    ALTER TABLE [dbo].[TipoInmoviliario]  WITH CHECK ADD FOREIGN KEY([IdProyecto])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Usuario_PlanSuscripcion_PlanSuscripcionId]') AND parent_object_id = OBJECT_ID(N'[Usuario]'))
BEGIN
    ALTER TABLE [dbo].[Usuario]  WITH CHECK ADD  CONSTRAINT [FK_Usuario_PlanSuscripcion_PlanSuscripcionId] FOREIGN KEY([PlanSuscripcionId])
    REFERENCES [dbo].[PlanSuscripcion] ([Idsuscripcion])
    ON DELETE SET NULL
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [FK_Usuario_PlanSuscripcion_PlanSuscripcionId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Usuario_Usuario_TitularId]') AND parent_object_id = OBJECT_ID(N'[Usuario]'))
BEGIN
    ALTER TABLE [dbo].[Usuario]  WITH CHECK ADD  CONSTRAINT [FK_Usuario_Usuario_TitularId] FOREIGN KEY([TitularId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [FK_Usuario_Usuario_TitularId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Validaciones_Documentos_DocumentoId]') AND parent_object_id = OBJECT_ID(N'[Validaciones]'))
BEGIN
    ALTER TABLE [dbo].[Validaciones]  WITH CHECK ADD  CONSTRAINT [FK_Validaciones_Documentos_DocumentoId] FOREIGN KEY([DocumentoId])
    REFERENCES [dbo].[Documentos] ([Id])
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Validaciones] CHECK CONSTRAINT [FK_Validaciones_Documentos_DocumentoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Validaciones_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[Validaciones]'))
BEGIN
    ALTER TABLE [dbo].[Validaciones]  WITH CHECK ADD  CONSTRAINT [FK_Validaciones_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Validaciones] CHECK CONSTRAINT [FK_Validaciones_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Validaciones_SellosIntegridad_SelloId]') AND parent_object_id = OBJECT_ID(N'[Validaciones]'))
BEGIN
    ALTER TABLE [dbo].[Validaciones]  WITH CHECK ADD  CONSTRAINT [FK_Validaciones_SellosIntegridad_SelloId] FOREIGN KEY([SelloId])
    REFERENCES [dbo].[SellosIntegridad] ([Id])
    ON DELETE SET NULL
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Validaciones] CHECK CONSTRAINT [FK_Validaciones_SellosIntegridad_SelloId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId]') AND parent_object_id = OBJECT_ID(N'[ValidacionesDgii]'))
BEGIN
    ALTER TABLE [dbo].[ValidacionesDgii]  WITH CHECK ADD  CONSTRAINT [FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId] FOREIGN KEY([ProyectoId])
    REFERENCES [dbo].[ProyectosInmobiliarios] ([IdProyecto])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[ValidacionesDgii] CHECK CONSTRAINT [FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId]
END TRY
BEGIN CATCH
END CATCH;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[FK_Verificacion2FA_Usuario_UsuarioId]') AND parent_object_id = OBJECT_ID(N'[Verificacion2FA]'))
BEGIN
    ALTER TABLE [dbo].[Verificacion2FA]  WITH CHECK ADD  CONSTRAINT [FK_Verificacion2FA_Usuario_UsuarioId] FOREIGN KEY([UsuarioId])
    REFERENCES [dbo].[Usuario] ([IdUsuario])
    ON DELETE CASCADE
END;
GO

BEGIN TRY
    ALTER TABLE [dbo].[Verificacion2FA] CHECK CONSTRAINT [FK_Verificacion2FA_Usuario_UsuarioId]
END TRY
BEGIN CATCH
END CATCH;
GO
