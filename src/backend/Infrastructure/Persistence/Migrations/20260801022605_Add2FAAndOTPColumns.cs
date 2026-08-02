using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add2FAAndOTPColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EmailOtpLastSentUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Failed2FAAttempts",
                table: "Usuario",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "Last2FAVerifiedUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Lockout2FAUntilUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecoveryCodesHashJson",
                table: "Usuario",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                table: "Usuario",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorSecretEncrypted",
                table: "Usuario",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "DGII",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailOtpLastSentUtc",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "Failed2FAAttempts",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "Last2FAVerifiedUtc",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "Lockout2FAUntilUtc",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "RecoveryCodesHashJson",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TwoFactorSecretEncrypted",
                table: "Usuario");

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "DGII",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20);
        }
    }
}
