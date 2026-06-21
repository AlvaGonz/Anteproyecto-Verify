using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameCorreoToEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @UQConstraintName nvarchar(200);
                SELECT TOP 1 @UQConstraintName = kc.name 
                FROM sys.key_constraints kc
                JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
                JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                WHERE kc.parent_object_id = OBJECT_ID('Usuario') AND kc.type = 'UQ' AND c.name = 'CorreoElectronico';
                
                IF @UQConstraintName IS NOT NULL 
                    EXEC('ALTER TABLE Usuario DROP CONSTRAINT ' + @UQConstraintName);
                
                IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE Name = 'CK_Usuario_CorreoElectronico')
                    ALTER TABLE Usuario DROP CONSTRAINT CK_Usuario_CorreoElectronico;
                
                IF OBJECT_ID('UsuarioLegacy', 'V') IS NOT NULL
                    DROP VIEW UsuarioLegacy;
            ");

            migrationBuilder.RenameColumn(
                name: "CorreoElectronico",
                table: "Usuario",
                newName: "Email");

            migrationBuilder.Sql(@"
                ALTER TABLE Usuario ADD UNIQUE (Email);
                ALTER TABLE Usuario ADD CONSTRAINT CK_Usuario_Email CHECK (Email LIKE '%_@__%.__%');
                
                EXEC('
                CREATE VIEW UsuarioLegacy AS
                SELECT 
                    IdUsuario,
                    Nombre,
                    Apellido,
                    NombreCompleto,
                    Email AS Email,
                    ContrasenaHash,
                    Telefono,
                    Cedula
                FROM Usuario;
                ');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Usuario",
                newName: "CorreoElectronico");
        }
    }
}
