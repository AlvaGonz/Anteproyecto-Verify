using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDgiiTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DGII",
                columns: table => new
                {
                    Rnc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NombreRazonSocial = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    NombreComercial = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RegimenPagos = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ActividadEconomica = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    AdministracionLocal = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FacturadorElectronico = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LicenciasVhm = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DGII", x => x.Rnc);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DGII");
        }
    }
}
