using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RedesignDatoValidadoJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DatoValidado_Validaciones_ValidacionId",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "Campo",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "Coincide",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "MetodoComparacion",
                table: "DatoValidado");

            migrationBuilder.RenameColumn(
                name: "ValorEsperado",
                table: "DatoValidado",
                newName: "DatosOcrJson");

            migrationBuilder.RenameColumn(
                name: "ValorEncontrado",
                table: "DatoValidado",
                newName: "DatosMatchJson");

            migrationBuilder.RenameColumn(
                name: "ValidacionId",
                table: "DatoValidado",
                newName: "ProyectoId");

            migrationBuilder.RenameIndex(
                name: "IX_DatoValidado_ValidacionId",
                table: "DatoValidado",
                newName: "IX_DatoValidado_ProyectoId");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DatoValidado",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "DatoValidado");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "DatoValidado",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWSEQUENTIALID()");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DatoValidado",
                table: "DatoValidado",
                column: "Id");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "DatoValidado",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentoId",
                table: "DatoValidado",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "PorcentajeTotal",
                table: "DatoValidado",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "TipoDocumento",
                table: "DatoValidado",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "DatoValidado",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DatoValidado_DocumentoId",
                table: "DatoValidado",
                column: "DocumentoId");

            migrationBuilder.AddForeignKey(
                name: "FK_DatoValidado_Documentos_DocumentoId",
                table: "DatoValidado",
                column: "DocumentoId",
                principalTable: "Documentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DatoValidado_ProyectosInmobiliarios_ProyectoId",
                table: "DatoValidado",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DatoValidado_Documentos_DocumentoId",
                table: "DatoValidado");

            migrationBuilder.DropForeignKey(
                name: "FK_DatoValidado_ProyectosInmobiliarios_ProyectoId",
                table: "DatoValidado");

            migrationBuilder.DropIndex(
                name: "IX_DatoValidado_DocumentoId",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "DocumentoId",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "PorcentajeTotal",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "TipoDocumento",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "DatoValidado");

            migrationBuilder.RenameColumn(
                name: "ProyectoId",
                table: "DatoValidado",
                newName: "ValidacionId");

            migrationBuilder.RenameColumn(
                name: "DatosOcrJson",
                table: "DatoValidado",
                newName: "ValorEsperado");

            migrationBuilder.RenameColumn(
                name: "DatosMatchJson",
                table: "DatoValidado",
                newName: "ValorEncontrado");

            migrationBuilder.RenameIndex(
                name: "IX_DatoValidado_ProyectoId",
                table: "DatoValidado",
                newName: "IX_DatoValidado_ValidacionId");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DatoValidado",
                table: "DatoValidado");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "DatoValidado");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "DatoValidado",
                type: "int",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DatoValidado",
                table: "DatoValidado",
                column: "Id");

            migrationBuilder.AddColumn<string>(
                name: "Campo",
                table: "DatoValidado",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "Coincide",
                table: "DatoValidado",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MetodoComparacion",
                table: "DatoValidado",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DatoValidado_Validaciones_ValidacionId",
                table: "DatoValidado",
                column: "ValidacionId",
                principalTable: "Validaciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
