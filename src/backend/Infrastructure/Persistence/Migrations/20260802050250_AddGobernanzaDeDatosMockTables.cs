using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGobernanzaDeDatosMockTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CatastroTitulo",
                columns: table => new
                {
                    IdCatastroTitulo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoDesignacionCatastral = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumeroTitulo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rnc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Provincia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Municipio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Superficie = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Matricula = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Oficina = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatastroTitulo", x => x.IdCatastroTitulo);
                });

            migrationBuilder.CreateTable(
                name: "JCE_Ciudadano",
                columns: table => new
                {
                    Cedula = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombres = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellidos = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaExpiracion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JCE_Ciudadano", x => x.Cedula);
                });

            migrationBuilder.CreateTable(
                name: "PagoIPI",
                columns: table => new
                {
                    Rnc = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Cuota_ipi = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Estatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NoCertificacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoInmueble = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParcelaNo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagoIPI", x => x.Rnc);
                });

            migrationBuilder.CreateTable(
                name: "PermisoSuelo",
                columns: table => new
                {
                    IdPSuelo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroPermiso = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumeroExpediente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaEmision = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Rnc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Provincia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Municipio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Superficie = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TienePermiso = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Documento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Departamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Operacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Seccion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lugar = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermisoSuelo", x => x.IdPSuelo);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatastroTitulo");

            migrationBuilder.DropTable(
                name: "JCE_Ciudadano");

            migrationBuilder.DropTable(
                name: "PagoIPI");

            migrationBuilder.DropTable(
                name: "PermisoSuelo");
        }
    }
}
