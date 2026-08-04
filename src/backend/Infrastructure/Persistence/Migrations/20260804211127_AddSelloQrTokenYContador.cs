using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSelloQrTokenYContador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ContadorAccesos",
                table: "SellosIntegridad",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "QrToken",
                table: "SellosIntegridad",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_SellosIntegridad_QrToken",
                table: "SellosIntegridad",
                column: "QrToken",
                unique: true,
                filter: "[QrToken] IS NOT NULL AND [QrToken] <> ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SellosIntegridad_QrToken",
                table: "SellosIntegridad");

            migrationBuilder.DropColumn(
                name: "ContadorAccesos",
                table: "SellosIntegridad");

            migrationBuilder.DropColumn(
                name: "QrToken",
                table: "SellosIntegridad");
        }
    }
}
