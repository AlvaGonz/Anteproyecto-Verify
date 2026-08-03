using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCatastroOcrFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DesigCatastralPosicional",
                table: "CatastroTitulo",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DesignCatastralOrigen",
                table: "CatastroTitulo",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaEmision",
                table: "CatastroTitulo",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaInscripcion",
                table: "CatastroTitulo",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VieneDe",
                table: "CatastroTitulo",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DesigCatastralPosicional",
                table: "CatastroTitulo");

            migrationBuilder.DropColumn(
                name: "DesignCatastralOrigen",
                table: "CatastroTitulo");

            migrationBuilder.DropColumn(
                name: "FechaEmision",
                table: "CatastroTitulo");

            migrationBuilder.DropColumn(
                name: "FechaInscripcion",
                table: "CatastroTitulo");

            migrationBuilder.DropColumn(
                name: "VieneDe",
                table: "CatastroTitulo");
        }
    }
}
