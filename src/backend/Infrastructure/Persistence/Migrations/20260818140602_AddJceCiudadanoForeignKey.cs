using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJceCiudadanoForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Usuario_JCE_Ciudadano_Cedula')
                    ALTER TABLE [Usuario] DROP CONSTRAINT [FK_Usuario_JCE_Ciudadano_Cedula];
            ");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano");

            migrationBuilder.AlterColumn<string>(
                name: "Cedula",
                table: "JCE_Ciudadano",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano",
                column: "Cedula");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Cedula' AND object_id = OBJECT_ID('Usuario'))
                    CREATE INDEX [IX_Usuario_Cedula] ON [Usuario] ([Cedula]);
            ");

            migrationBuilder.Sql("ALTER TABLE [Usuario] WITH NOCHECK ADD CONSTRAINT [FK_Usuario_JCE_Ciudadano_Cedula] FOREIGN KEY ([Cedula]) REFERENCES [JCE_Ciudadano] ([Cedula]) ON DELETE SET NULL;");
            migrationBuilder.Sql("ALTER TABLE [Usuario] CHECK CONSTRAINT [FK_Usuario_JCE_Ciudadano_Cedula];");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Usuario_JCE_Ciudadano_Cedula')
                    ALTER TABLE [Usuario] DROP CONSTRAINT [FK_Usuario_JCE_Ciudadano_Cedula];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Cedula' AND object_id = OBJECT_ID('Usuario'))
                    DROP INDEX [IX_Usuario_Cedula] ON [Usuario];
            ");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano");

            migrationBuilder.AlterColumn<string>(
                name: "Cedula",
                table: "JCE_Ciudadano",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(15)",
                oldMaxLength: 15);

            migrationBuilder.AddPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano",
                column: "Cedula");
        }
    }
}
