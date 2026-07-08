using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Infrastructure.Persistence;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260708173000_Add_DGII_Fields_To_Usuario")]
    public partial class Add_DGII_Fields_To_Usuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RazonSocial",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreComercial",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActividadEconomica",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RazonSocial",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "NombreComercial",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "ActividadEconomica",
                table: "Usuario");
        }
    }
}
