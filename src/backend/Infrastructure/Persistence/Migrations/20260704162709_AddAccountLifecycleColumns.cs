using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountLifecycleColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccountStatus",
                table: "Usuario",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAtUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletionReason",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingBillingCycle",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingPlanCode",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PurgeAtUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RecoverUntilUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountStatus",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "DeletedAtUtc",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "DeletionReason",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "PendingBillingCycle",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "PendingPlanCode",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "PurgeAtUtc",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "RecoverUntilUtc",
                table: "Usuario");
        }
    }
}
