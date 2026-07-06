using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLegacyProfilesAndPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permisos",
                columns: table => new
                {
                    IdPermiso = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permisos", x => x.IdPermiso);
                });

            migrationBuilder.CreateTable(
                name: "Perfiles",
                columns: table => new
                {
                    IdPerfil = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NombrePerfil = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perfiles", x => x.IdPerfil);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioLegacy",
                columns: table => new
                {
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Cedula = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    ContrasenaHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioLegacy", x => x.IdUsuario);
                });

            migrationBuilder.CreateTable(
                name: "PerfilPermiso",
                columns: table => new
                {
                    IdPerfil = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdPermiso = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilPermiso", x => new { x.IdPerfil, x.IdPermiso });
                    table.ForeignKey(
                        name: "FK_PerfilPermiso_Perfiles_IdPerfil",
                        column: x => x.IdPerfil,
                        principalTable: "Perfiles",
                        principalColumn: "IdPerfil",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PerfilPermiso_Permisos_IdPermiso",
                        column: x => x.IdPermiso,
                        principalTable: "Permisos",
                        principalColumn: "IdPermiso",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Acceso",
                columns: table => new
                {
                    IdAcceso = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdPerfil = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Acceso", x => x.IdAcceso);
                    table.ForeignKey(
                        name: "FK_Acceso_Perfiles_IdPerfil",
                        column: x => x.IdPerfil,
                        principalTable: "Perfiles",
                        principalColumn: "IdPerfil",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Acceso_UsuarioLegacy_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "UsuarioLegacy",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    IdPago = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaPago = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IdApiGobernanza = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Idsuscripcion = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Monto = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.IdPago);
                    table.ForeignKey(
                        name: "FK_Pagos_PlanSuscripcion_Idsuscripcion",
                        column: x => x.Idsuscripcion,
                        principalTable: "PlanSuscripcion",
                        principalColumn: "Idsuscripcion",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pagos_UsuarioLegacy_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "UsuarioLegacy",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Acceso_IdPerfil",
                table: "Acceso",
                column: "IdPerfil");

            migrationBuilder.CreateIndex(
                name: "IX_Acceso_IdUsuario",
                table: "Acceso",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_Idsuscripcion",
                table: "Pagos",
                column: "Idsuscripcion");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdUsuario",
                table: "Pagos",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermiso_IdPermiso",
                table: "PerfilPermiso",
                column: "IdPermiso");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioLegacy_Email",
                table: "UsuarioLegacy",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Acceso");
            migrationBuilder.DropTable(name: "PerfilPermiso");
            migrationBuilder.DropTable(name: "Pagos");
            migrationBuilder.DropTable(name: "Perfiles");
            migrationBuilder.DropTable(name: "Permisos");
            migrationBuilder.DropTable(name: "UsuarioLegacy");
        }
    }
}
