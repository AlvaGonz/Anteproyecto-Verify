using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLegacyUserAcceso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The original AddLegacyProfilesAndPermissions migration created
            // the table/FK with singular names (UsuarioLegacy), while the EF
            // model snapshot drifted to plural (UsuariosLegacy) without a
            // migration. Drop by the REAL names so this works on any database
            // built from the migration history.
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_UsuarioLegacy_IdUsuario",
                table: "Pagos");

            migrationBuilder.DropTable(
                name: "Acceso");

            migrationBuilder.DropTable(
                name: "UsuarioLegacy");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_Usuario_IdUsuario",
                table: "Pagos",
                column: "IdUsuario",
                principalTable: "Usuario",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_Usuario_IdUsuario",
                table: "Pagos");

            migrationBuilder.CreateTable(
                name: "UsuariosLegacy",
                columns: table => new
                {
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cedula = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContrasenaHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NombreCompleto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuariosLegacy", x => x.IdUsuario);
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
                        name: "FK_Acceso_UsuariosLegacy_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "UsuariosLegacy",
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

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_UsuariosLegacy_IdUsuario",
                table: "Pagos",
                column: "IdUsuario",
                principalTable: "UsuariosLegacy",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
