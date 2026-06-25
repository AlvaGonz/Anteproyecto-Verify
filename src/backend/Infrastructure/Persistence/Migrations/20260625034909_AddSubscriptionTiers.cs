using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionTiers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Data migration: Fix legacy roles to ensure they are either Administrator (1) or User (2)
            // Assuming Professional(2) and Consultation(3) -> User(2). Administrator(1) stays 1.
            migrationBuilder.Sql("UPDATE Usuario SET Rol = 2 WHERE Rol NOT IN (1, 2);");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuario_PlanSuscripcion_PlanSuscripcionId",
                table: "Usuario",
                column: "PlanSuscripcionId",
                principalTable: "PlanSuscripcion",
                principalColumn: "Idsuscripcion",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuario_PlanSuscripcion_PlanSuscripcionId",
                table: "Usuario");
        }
    }
}
