using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProvinciasYMunicipiosTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Provincia' and xtype='U')
BEGIN
    CREATE TABLE Provincia (
        IdProvincia UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        NombreProvincia VARCHAR(100) NOT NULL,
        Latitud DECIMAL(18,10) NULL,
        Longitud DECIMAL(18,10) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Municipio' and xtype='U')
BEGIN
    CREATE TABLE Municipio (
        IdMunicipio UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        IdProvincia UNIQUEIDENTIFIER NOT NULL,
        NombreMunicipio VARCHAR(100) NOT NULL,
        Latitud DECIMAL(9,6) NULL,
        Longitud DECIMAL(9,6) NULL,
        CONSTRAINT FK_Municipio_Provincia FOREIGN KEY (IdProvincia) REFERENCES Provincia(IdProvincia)
    );
END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT * FROM sysobjects WHERE name='Municipio' and xtype='U')
BEGIN
    DROP TABLE Municipio;
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='Provincia' and xtype='U')
BEGIN
    DROP TABLE Provincia;
END
            ");
        }
    }
}
