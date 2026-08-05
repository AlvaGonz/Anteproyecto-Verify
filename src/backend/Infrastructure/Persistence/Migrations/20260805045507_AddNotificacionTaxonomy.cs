using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificacionTaxonomy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EntidadReferenciaId",
                table: "Notificaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntidadReferenciaTipo",
                table: "Notificaciones",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Prioridad",
                table: "Notificaciones",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)3);

            migrationBuilder.AddColumn<int>(
                name: "TipoNotificacionId",
                table: "Notificaciones",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NotificacionEntregas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotificacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Canal = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaLectura = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMensaje = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reintentos = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificacionEntregas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificacionEntregas_Notificaciones_NotificacionId",
                        column: x => x.NotificacionId,
                        principalTable: "Notificaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TiposNotificaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Categoria = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prioridad = table.Column<byte>(type: "tinyint", nullable: false),
                    Canales = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PlantillaTitulo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlantillaMensaje = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposNotificaciones", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_TipoNotificacionId",
                table: "Notificaciones",
                column: "TipoNotificacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_UsuarioId_TipoNotificacionId",
                table: "Notificaciones",
                columns: new[] { "UsuarioId", "TipoNotificacionId" },
                filter: "[TipoNotificacionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NotificacionEntregas_NotificacionId",
                table: "NotificacionEntregas",
                column: "NotificacionId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificacionEntregas_NotificacionId_Canal",
                table: "NotificacionEntregas",
                columns: new[] { "NotificacionId", "Canal" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposNotificaciones_Codigo",
                table: "TiposNotificaciones",
                column: "Codigo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Notificaciones_TiposNotificaciones_TipoNotificacionId",
                table: "Notificaciones",
                column: "TipoNotificacionId",
                principalTable: "TiposNotificaciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notificaciones_TiposNotificaciones_TipoNotificacionId",
                table: "Notificaciones");

            migrationBuilder.DropTable(
                name: "NotificacionEntregas");

            migrationBuilder.DropTable(
                name: "TiposNotificaciones");

            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_TipoNotificacionId",
                table: "Notificaciones");

            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_UsuarioId_TipoNotificacionId",
                table: "Notificaciones");

            migrationBuilder.DropColumn(
                name: "EntidadReferenciaId",
                table: "Notificaciones");

            migrationBuilder.DropColumn(
                name: "EntidadReferenciaTipo",
                table: "Notificaciones");

            migrationBuilder.DropColumn(
                name: "Prioridad",
                table: "Notificaciones");

            migrationBuilder.DropColumn(
                name: "TipoNotificacionId",
                table: "Notificaciones");
        }
    }
}
