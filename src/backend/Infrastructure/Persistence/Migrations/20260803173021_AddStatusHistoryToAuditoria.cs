using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusHistoryToAuditoria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EstadoAnteriorId",
                table: "Auditorias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EstadoNuevoId",
                table: "Auditorias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Auditorias_EstadoAnteriorId",
                table: "Auditorias",
                column: "EstadoAnteriorId");

            migrationBuilder.CreateIndex(
                name: "IX_Auditorias_EstadoNuevoId",
                table: "Auditorias",
                column: "EstadoNuevoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Auditorias_ProyectosEstados_EstadoAnteriorId",
                table: "Auditorias",
                column: "EstadoAnteriorId",
                principalTable: "ProyectosEstados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Auditorias_ProyectosEstados_EstadoNuevoId",
                table: "Auditorias",
                column: "EstadoNuevoId",
                principalTable: "ProyectosEstados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Auditorias_ProyectosEstados_EstadoAnteriorId",
                table: "Auditorias");

            migrationBuilder.DropForeignKey(
                name: "FK_Auditorias_ProyectosEstados_EstadoNuevoId",
                table: "Auditorias");

            migrationBuilder.DropIndex(
                name: "IX_Auditorias_EstadoAnteriorId",
                table: "Auditorias");

            migrationBuilder.DropIndex(
                name: "IX_Auditorias_EstadoNuevoId",
                table: "Auditorias");

            migrationBuilder.DropColumn(
                name: "EstadoAnteriorId",
                table: "Auditorias");

            migrationBuilder.DropColumn(
                name: "EstadoNuevoId",
                table: "Auditorias");
        }
    }
}
