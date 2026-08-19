using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixJceCiudadanoCedulaLength : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // AlterColumn is now handled in 20260818140602_AddJceCiudadanoForeignKey.cs
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // AlterColumn is now handled in 20260818140602_AddJceCiudadanoForeignKey.cs
        }
    }
}
