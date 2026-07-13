using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalProjectImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagenAdicional1",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagenAdicional2",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagenAdicional3",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagenAdicional4",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagenAdicional5",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagenAdicional1",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "ImagenAdicional2",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "ImagenAdicional3",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "ImagenAdicional4",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "ImagenAdicional5",
                table: "ProyectosInmobiliarios");
        }
    }
}
