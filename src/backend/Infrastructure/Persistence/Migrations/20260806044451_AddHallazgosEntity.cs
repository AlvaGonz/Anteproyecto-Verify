using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHallazgosEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DatoValidado_Documentos_DocumentoId",
                table: "DatoValidado");

            migrationBuilder.AddColumn<string>(
                name: "Campo",
                table: "Hallazgos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DatoValidadoId",
                table: "Hallazgos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hallazgos_DatoValidadoId",
                table: "Hallazgos",
                column: "DatoValidadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_DatoValidado_Documentos_DocumentoId",
                table: "DatoValidado",
                column: "DocumentoId",
                principalTable: "Documentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Hallazgos_DatoValidado_DatoValidadoId",
                table: "Hallazgos",
                column: "DatoValidadoId",
                principalTable: "DatoValidado",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DatoValidado_Documentos_DocumentoId",
                table: "DatoValidado");

            migrationBuilder.DropForeignKey(
                name: "FK_Hallazgos_DatoValidado_DatoValidadoId",
                table: "Hallazgos");

            migrationBuilder.DropIndex(
                name: "IX_Hallazgos_DatoValidadoId",
                table: "Hallazgos");

            migrationBuilder.DropColumn(
                name: "Campo",
                table: "Hallazgos");

            migrationBuilder.DropColumn(
                name: "DatoValidadoId",
                table: "Hallazgos");

            migrationBuilder.AddForeignKey(
                name: "FK_DatoValidado_Documentos_DocumentoId",
                table: "DatoValidado",
                column: "DocumentoId",
                principalTable: "Documentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
