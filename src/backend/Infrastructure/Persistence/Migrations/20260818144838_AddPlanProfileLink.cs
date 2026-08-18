using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanProfileLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PerfilId",
                table: "Usuario",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DefaultPerfilId",
                table: "PlanSuscripcion",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_PerfilId",
                table: "Usuario",
                column: "PerfilId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanSuscripcion_DefaultPerfilId",
                table: "PlanSuscripcion",
                column: "DefaultPerfilId");

            migrationBuilder.AddForeignKey(
                name: "FK_PlanSuscripcion_Perfiles_DefaultPerfilId",
                table: "PlanSuscripcion",
                column: "DefaultPerfilId",
                principalTable: "Perfiles",
                principalColumn: "IdPerfil",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Usuario_Perfiles_PerfilId",
                table: "Usuario",
                column: "PerfilId",
                principalTable: "Perfiles",
                principalColumn: "IdPerfil",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanSuscripcion_Perfiles_DefaultPerfilId",
                table: "PlanSuscripcion");

            migrationBuilder.DropForeignKey(
                name: "FK_Usuario_Perfiles_PerfilId",
                table: "Usuario");

            migrationBuilder.DropIndex(
                name: "IX_Usuario_PerfilId",
                table: "Usuario");

            migrationBuilder.DropIndex(
                name: "IX_PlanSuscripcion_DefaultPerfilId",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "PerfilId",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "DefaultPerfilId",
                table: "PlanSuscripcion");
        }
    }
}
