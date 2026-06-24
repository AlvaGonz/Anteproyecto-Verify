using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Auditorias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoEvento = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Accion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Entidad = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntidadId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Detalle = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IpOrigen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaEventoUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoOperacion = table.Column<int>(type: "int", nullable: false),
                    Resultado = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ReferenciaExpedienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auditorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auditorias_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Auditorias_Usuario_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConsentimientosFinancieros",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaHoraUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpOrigen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    VersionPolitica = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    FechaExpiracionUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsentimientosFinancieros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsentimientosFinancieros_Usuario_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DeteccionesDuplicidad",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoDuplicadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NivelRiesgo = table.Column<int>(type: "int", nullable: false),
                    DescripcionCoincidencia = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaDeteccion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Bloqueante = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeteccionesDuplicidad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId",
                        column: x => x.ProyectoDuplicadoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto");
                    table.ForeignKey(
                        name: "FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Documentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoDocumento = table.Column<int>(type: "int", nullable: false),
                    NombreArchivoOriginal = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NombreArchivoAlmacenado = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RutaArchivo = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Extension = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TamanoBytes = table.Column<long>(type: "bigint", nullable: false),
                    EstadoDocumento = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InstitucionEmisora = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UsuarioCargaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FormalStatus = table.Column<int>(type: "int", nullable: true),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VersionReglaAplicada = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaEvaluacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documentos_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notificaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Mensaje = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Leida = table.Column<bool>(type: "bit", nullable: false),
                    FechaUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnlaceRelacionado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificaciones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReglasValidacion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CondicionLogica = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    TipoDocumentoAplicable = table.Column<int>(type: "int", nullable: false),
                    NivelAlerta = table.Column<int>(type: "int", nullable: false),
                    TipoProyecto = table.Column<int>(type: "int", nullable: false),
                    Activa = table.Column<bool>(type: "bit", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    FechaCreacionUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadaPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReglaAnteriorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReglasValidacion", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reportes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstadoReporte = table.Column<int>(type: "int", nullable: false),
                    Resumen = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    GeneradoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reportes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reportes_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reportes_Usuario_GeneradoPorUsuarioId",
                        column: x => x.GeneradoPorUsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SellosIntegridad",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoSello = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nivel = table.Column<int>(type: "int", nullable: false),
                    UrlQr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FirmaDigital = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FechaEmisionUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaExpiracionUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellosIntegridad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ValidacionesAyuntamiento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Result = table.Column<int>(type: "int", nullable: false),
                    Detalle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaConsulta = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DisponibilidadServicio = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValidacionesAyuntamiento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValidacionesAyuntamiento_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ValidacionesDgii",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Rnc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TieneDeudas = table.Column<bool>(type: "bit", nullable: false),
                    FechaConsulta = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrigenDatos = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValidacionesDgii", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResultadosCrediticios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsentimientoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScoreCrediticio = table.Column<int>(type: "int", nullable: false),
                    PorcentajeEndeudamiento = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CantidadAtrasosUltimos12Meses = table.Column<int>(type: "int", nullable: false),
                    NivelRiesgo = table.Column<int>(type: "int", nullable: false),
                    FechaConsultaUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultadosCrediticios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResultadosCrediticios_ConsentimientosFinancieros_ConsentimientoId",
                        column: x => x.ConsentimientoId,
                        principalTable: "ConsentimientosFinancieros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AlertasValidacion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Recomendacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Resuelta = table.Column<bool>(type: "bit", nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NivelRiesgo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertasValidacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertasValidacion_Documentos_DocumentoId",
                        column: x => x.DocumentoId,
                        principalTable: "Documentos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Certificaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReporteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CodigoVerificacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstadoCertificacion = table.Column<int>(type: "int", nullable: false),
                    FechaEmisionUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaVigenciaUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UrlVerificacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScoreIntegridad = table.Column<int>(type: "int", nullable: true),
                    EstadoIntegridad = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    EmisorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Revocado = table.Column<bool>(type: "bit", nullable: false),
                    MotivoRevocacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certificaciones_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Certificaciones_Reportes_ReporteId",
                        column: x => x.ReporteId,
                        principalTable: "Reportes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Validaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FuenteValidacion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EstadoValidacion = table.Column<int>(type: "int", nullable: false),
                    EsLegitimo = table.Column<bool>(type: "bit", nullable: true),
                    PorcentajeIntegridad = table.Column<double>(type: "float", nullable: true),
                    Detalle = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CamposValidadosJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SelloId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Validaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Validaciones_Documentos_DocumentoId",
                        column: x => x.DocumentoId,
                        principalTable: "Documentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Validaciones_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Validaciones_SellosIntegridad_SelloId",
                        column: x => x.SelloId,
                        principalTable: "SellosIntegridad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DatoValidado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Campo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValorEsperado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValorEncontrado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Coincide = table.Column<bool>(type: "bit", nullable: false),
                    MetodoComparacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValidacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatoValidado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DatoValidado_Validaciones_ValidacionId",
                        column: x => x.ValidacionId,
                        principalTable: "Validaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Hallazgos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ValidacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Severidad = table.Column<int>(type: "int", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Recomendacion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SistemaOrigen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Resuelto = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hallazgos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hallazgos_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Hallazgos_Validaciones_ValidacionId",
                        column: x => x.ValidacionId,
                        principalTable: "Validaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResultadosRegla",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ValidacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RuleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RuleName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: true),
                    RelatedDocumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultadosRegla", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResultadosRegla_Validaciones_ValidacionId",
                        column: x => x.ValidacionId,
                        principalTable: "Validaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertasValidacion_DocumentoId",
                table: "AlertasValidacion",
                column: "DocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertasValidacion_ProyectoId",
                table: "AlertasValidacion",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Auditorias_ProyectoId",
                table: "Auditorias",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Auditorias_UsuarioId",
                table: "Auditorias",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificaciones_ProyectoId",
                table: "Certificaciones",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificaciones_ReporteId",
                table: "Certificaciones",
                column: "ReporteId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsentimientosFinancieros_UsuarioId",
                table: "ConsentimientosFinancieros",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_DatoValidado_ValidacionId",
                table: "DatoValidado",
                column: "ValidacionId");

            migrationBuilder.CreateIndex(
                name: "IX_DeteccionesDuplicidad_ProyectoDuplicadoId",
                table: "DeteccionesDuplicidad",
                column: "ProyectoDuplicadoId");

            migrationBuilder.CreateIndex(
                name: "IX_DeteccionesDuplicidad_ProyectoId",
                table: "DeteccionesDuplicidad",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_Activo",
                table: "Documentos",
                column: "Activo");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_ProyectoId",
                table: "Documentos",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_TipoDocumento",
                table: "Documentos",
                column: "TipoDocumento");

            migrationBuilder.CreateIndex(
                name: "IX_Hallazgos_ProyectoId",
                table: "Hallazgos",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Hallazgos_ValidacionId",
                table: "Hallazgos",
                column: "ValidacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Reportes_GeneradoPorUsuarioId",
                table: "Reportes",
                column: "GeneradoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Reportes_ProyectoId",
                table: "Reportes",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosCrediticios_ConsentimientoId",
                table: "ResultadosCrediticios",
                column: "ConsentimientoId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosCrediticios_ProyectoId",
                table: "ResultadosCrediticios",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosRegla_ValidacionId",
                table: "ResultadosRegla",
                column: "ValidacionId");

            migrationBuilder.CreateIndex(
                name: "IX_SellosIntegridad_CodigoSello",
                table: "SellosIntegridad",
                column: "CodigoSello",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SellosIntegridad_ProyectoId",
                table: "SellosIntegridad",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Validaciones_DocumentoId",
                table: "Validaciones",
                column: "DocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Validaciones_ProyectoId",
                table: "Validaciones",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_Validaciones_SelloId",
                table: "Validaciones",
                column: "SelloId");

            migrationBuilder.CreateIndex(
                name: "IX_ValidacionesAyuntamiento_ProyectoId",
                table: "ValidacionesAyuntamiento",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_ValidacionesDgii_ProyectoId",
                table: "ValidacionesDgii",
                column: "ProyectoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertasValidacion");

            migrationBuilder.DropTable(
                name: "Auditorias");

            migrationBuilder.DropTable(
                name: "Certificaciones");

            migrationBuilder.DropTable(
                name: "DatoValidado");

            migrationBuilder.DropTable(
                name: "DeteccionesDuplicidad");

            migrationBuilder.DropTable(
                name: "Hallazgos");

            migrationBuilder.DropTable(
                name: "Notificaciones");

            migrationBuilder.DropTable(
                name: "ReglasValidacion");

            migrationBuilder.DropTable(
                name: "ResultadosCrediticios");

            migrationBuilder.DropTable(
                name: "ResultadosRegla");

            migrationBuilder.DropTable(
                name: "ValidacionesAyuntamiento");

            migrationBuilder.DropTable(
                name: "ValidacionesDgii");

            migrationBuilder.DropTable(
                name: "Reportes");

            migrationBuilder.DropTable(
                name: "ConsentimientosFinancieros");

            migrationBuilder.DropTable(
                name: "Validaciones");

            migrationBuilder.DropTable(
                name: "Documentos");

            migrationBuilder.DropTable(
                name: "SellosIntegridad");
        }
    }
}
