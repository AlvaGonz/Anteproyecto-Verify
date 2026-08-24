using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUmbralFieldsToReglaValidacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "ReglasValidacion",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Expresion",
                table: "ReglasValidacion",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxValor",
                table: "ReglasValidacion",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinValor",
                table: "ReglasValidacion",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ReglasValidacion",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorUmbral",
                table: "ReglasValidacion",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "ReglasValidacion");

            migrationBuilder.DropColumn(
                name: "Expresion",
                table: "ReglasValidacion");

            migrationBuilder.DropColumn(
                name: "MaxValor",
                table: "ReglasValidacion");

            migrationBuilder.DropColumn(
                name: "MinValor",
                table: "ReglasValidacion");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ReglasValidacion");

            migrationBuilder.DropColumn(
                name: "ValorUmbral",
                table: "ReglasValidacion");
        }
    }
}
