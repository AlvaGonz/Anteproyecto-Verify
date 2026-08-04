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
            // ponytail: columns may already exist in DB due to out-of-order migrations
            AddColumnIfNotExists(migrationBuilder, "Usuario", "EmailOtpLastSentUtc", "datetime2", nullable: true);
            AddColumnIfNotExists(migrationBuilder, "Usuario", "Failed2FAAttempts", "int", nullable: false, defaultValue: "0");
            AddColumnIfNotExists(migrationBuilder, "Usuario", "Last2FAVerifiedUtc", "datetime2", nullable: true);
            AddColumnIfNotExists(migrationBuilder, "Usuario", "Lockout2FAUntilUtc", "datetime2", nullable: true);
            AddColumnIfNotExists(migrationBuilder, "Usuario", "RecoveryCodesHashJson", "nvarchar(max)", nullable: true);
            AddColumnIfNotExists(migrationBuilder, "Usuario", "TwoFactorEnabled", "bit", nullable: false, defaultValue: "0");
            AddColumnIfNotExists(migrationBuilder, "Usuario", "TwoFactorSecretEncrypted", "nvarchar(max)", nullable: true);
        }

        private void AddColumnIfNotExists(MigrationBuilder migrationBuilder, string table, string column, string type, bool nullable, string defaultValue = null!)
        {
            var nullStr = nullable ? "NULL" : "NOT NULL";
            var defaultStr = defaultValue != null ? $" DEFAULT {defaultValue}" : "";
            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'{column}' AND Object_ID = Object_ID(N'{table}'))
                BEGIN
                    ALTER TABLE [{table}] ADD [{column}] {type} {nullStr}{defaultStr}
                END");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ponytail: skip Down — these columns were applied out-of-order and should persist
        }
    }
}
