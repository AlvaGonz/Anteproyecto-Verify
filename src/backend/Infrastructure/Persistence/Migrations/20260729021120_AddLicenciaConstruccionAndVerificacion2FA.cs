using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenciaConstruccionAndVerificacion2FA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LicenciaConstruccion",
                columns: table => new
                {
                    MivedId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    NumeroPermiso = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NombreProyecto = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Tipologia = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaEntrada = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaEmision = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Provincia = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Municipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UnidadesHabitacionales = table.Column<int>(type: "int", nullable: true),
                    LocalesComerciales = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LicenciaConstruccion", x => x.MivedId);
                });

            migrationBuilder.CreateTable(
                name: "Verificacion2FA",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SesionId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NumeroVerificable = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Verificacion2FA", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Verificacion2FA_Usuario_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LicenciaConstruccion_NumeroPermiso",
                table: "LicenciaConstruccion",
                column: "NumeroPermiso");

            migrationBuilder.CreateIndex(
                name: "IX_Verificacion2FA_UsuarioId",
                table: "Verificacion2FA",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LicenciaConstruccion");

            migrationBuilder.DropTable(
                name: "Verificacion2FA");
        }
    }
}
