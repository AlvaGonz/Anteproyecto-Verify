using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Proyectos_Interesados_Guardados : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProyectoGuardado",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SaverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProyectoGuardado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProyectoGuardado_ProyectosInmobiliarios_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProyectoGuardado_Usuario_CreatorId",
                        column: x => x.CreatorId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProyectoGuardado_Usuario_SaverId",
                        column: x => x.SaverId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProyectoInteres",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InterestedUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProyectoInteres", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProyectoInteres_ProyectosInmobiliarios_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "ProyectosInmobiliarios",
                        principalColumn: "IdProyecto",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProyectoInteres_Usuario_CreatorId",
                        column: x => x.CreatorId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProyectoInteres_Usuario_InterestedUserId",
                        column: x => x.InterestedUserId,
                        principalTable: "Usuario",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoGuardado_CreatorId",
                table: "ProyectoGuardado",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoGuardado_ProjectId",
                table: "ProyectoGuardado",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoGuardado_SaverId",
                table: "ProyectoGuardado",
                column: "SaverId");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoInteres_CreatorId",
                table: "ProyectoInteres",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoInteres_InterestedUserId",
                table: "ProyectoInteres",
                column: "InterestedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectoInteres_ProjectId",
                table: "ProyectoInteres",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProyectoGuardado");

            migrationBuilder.DropTable(
                name: "ProyectoInteres");
        }
    }
}
