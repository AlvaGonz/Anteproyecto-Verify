using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProyectoValidacionDescargo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ponytail: MunicipioId→ProvinciaId rename already applied in production.
            // Snapshot drift caused EF to re-emit those ops. Stripped.

            migrationBuilder.CreateTable(
                name: "ProyectoValidacionDescargo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProyectoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProyectoValidacionDescargo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProyectoValidacionDescargo_ProyectosInmobiliarios_ProyectoId",
                        column: x => x.ProyectoId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProyectoValidacionDescargo_Usuario_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoValidacionDescargo_ProyectoId",
                table: "ProyectoValidacionDescargo",
                column: "ProyectoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoValidacionDescargo_UsuarioId_ProyectoId",
                table: "ProyectoValidacionDescargo",
                columns: new[] { "UsuarioId", "ProyectoId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProyectoValidacionDescargo");
        }
    }
}
