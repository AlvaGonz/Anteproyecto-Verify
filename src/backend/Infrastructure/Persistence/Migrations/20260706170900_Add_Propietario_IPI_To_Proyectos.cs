using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Propietario_IPI_To_Proyectos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Propietario",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CedulaRncPropietario",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ipi",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Propietario",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "CedulaRncPropietario",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "Ipi",
                table: "ProyectosInmobiliarios");
        }
    }
}
