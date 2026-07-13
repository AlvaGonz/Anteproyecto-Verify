-- Seed for UsuarioLegacy
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2C5E0EB2-0F09-4030-9605-DF8E624E24E7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2C5E0EB2-0F09-4030-9605-DF8E624E24E7', 'Miguel', 'Fernandez', 'miguel.fernandez.0@example.com', 'HASHED_PWD', '809-555-0000', '402-0000000-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8384DA90-37FE-4DD8-8043-B09CB1BDEFA2')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8384DA90-37FE-4DD8-8043-B09CB1BDEFA2', 'Carmen', 'Alvarez', 'carmen.alvarez.1@example.com', 'HASHED_PWD', '809-555-0000', '402-0000001-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'CF849410-E809-4983-94CE-4363DD8EFCCE')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('CF849410-E809-4983-94CE-4363DD8EFCCE', 'Juan', 'Fernandez', 'juan.fernandez.2@example.com', 'HASHED_PWD', '809-555-0000', '402-0000002-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '296484B4-AA5E-4D46-8C9A-89C3531EA62B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('296484B4-AA5E-4D46-8C9A-89C3531EA62B', 'Carlos', 'Perez', 'carlos.perez.3@example.com', 'HASHED_PWD', '809-555-0000', '402-0000003-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '38FB0A7D-3A81-4678-83E0-8F7D90E11B30')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('38FB0A7D-3A81-4678-83E0-8F7D90E11B30', 'Antonio', 'Gomez', 'antonio.gomez.4@example.com', 'HASHED_PWD', '809-555-0000', '402-0000004-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '075E564A-B639-49D4-A0A7-2CD08626A298')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('075E564A-B639-49D4-A0A7-2CD08626A298', 'Miguel', 'Alvarez', 'miguel.alvarez.5@example.com', 'HASHED_PWD', '809-555-0000', '402-0000005-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8A6DE7CF-785A-4402-80C4-B421F9DA5488')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8A6DE7CF-785A-4402-80C4-B421F9DA5488', 'Francisco', 'Ruiz', 'francisco.ruiz.6@example.com', 'HASHED_PWD', '809-555-0000', '402-0000006-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9DEED183-DBEB-4927-8B44-57BF6F0331CE')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9DEED183-DBEB-4927-8B44-57BF6F0331CE', 'Isabel', 'Romero', 'isabel.romero.7@example.com', 'HASHED_PWD', '809-555-0000', '402-0000007-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F2F067F0-2542-4E8D-B2D4-B6547F785D0D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F2F067F0-2542-4E8D-B2D4-B6547F785D0D', 'Ana', 'Diaz', 'ana.diaz.8@example.com', 'HASHED_PWD', '809-555-0000', '402-0000008-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B9ADB028-FCD9-47D9-9C22-D1951F99683D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B9ADB028-FCD9-47D9-9C22-D1951F99683D', 'Miguel', 'Romero', 'miguel.romero.9@example.com', 'HASHED_PWD', '809-555-0000', '402-0000009-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'AAB47578-5E65-486A-930B-BCF0DAC89168')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('AAB47578-5E65-486A-930B-BCF0DAC89168', 'Ana', 'Torres', 'ana.torres.10@example.com', 'HASHED_PWD', '809-555-0000', '402-0000010-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '09F3096A-DC61-4FC6-A306-6FD54517001C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('09F3096A-DC61-4FC6-A306-6FD54517001C', 'Elena', 'Fernandez', 'elena.fernandez.11@example.com', 'HASHED_PWD', '809-555-0000', '402-0000011-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8B6A6EA2-0567-4957-BB4F-CFA98DB21BFC')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8B6A6EA2-0567-4957-BB4F-CFA98DB21BFC', 'Pedro', 'Fernandez', 'pedro.fernandez.12@example.com', 'HASHED_PWD', '809-555-0000', '402-0000012-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C188C5CD-0372-4EF6-8ABF-96F6770E8298')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C188C5CD-0372-4EF6-8ABF-96F6770E8298', 'Antonio', 'Ruiz', 'antonio.ruiz.13@example.com', 'HASHED_PWD', '809-555-0000', '402-0000013-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '959A3F4E-A7D0-42DD-AC8D-E17FB23FC02C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('959A3F4E-A7D0-42DD-AC8D-E17FB23FC02C', 'Isabel', 'Fernandez', 'isabel.fernandez.14@example.com', 'HASHED_PWD', '809-555-0000', '402-0000014-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BC0C4C88-C0EA-4F77-8A95-207D6ABF6EB6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BC0C4C88-C0EA-4F77-8A95-207D6ABF6EB6', 'Jose', 'Martinez', 'jose.martinez.15@example.com', 'HASHED_PWD', '809-555-0000', '402-0000015-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EF506328-C18C-479C-B8AC-D5DE0A2A6D6A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EF506328-C18C-479C-B8AC-D5DE0A2A6D6A', 'Laura', 'Gonzalez', 'laura.gonzalez.16@example.com', 'HASHED_PWD', '809-555-0000', '402-0000016-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '845F7BDF-F4E3-4EE7-8BA5-95F36DDF568E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('845F7BDF-F4E3-4EE7-8BA5-95F36DDF568E', 'Isabel', 'Rodriguez', 'isabel.rodriguez.17@example.com', 'HASHED_PWD', '809-555-0000', '402-0000017-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1128A109-C906-43A5-A3C5-6F62DA63C2D8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1128A109-C906-43A5-A3C5-6F62DA63C2D8', 'Carlos', 'Lopez', 'carlos.lopez.18@example.com', 'HASHED_PWD', '809-555-0000', '402-0000018-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '986A93A3-73AF-464D-BE11-658C21EBAC76')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('986A93A3-73AF-464D-BE11-658C21EBAC76', 'Sofia', 'Fernandez', 'sofia.fernandez.19@example.com', 'HASHED_PWD', '809-555-0000', '402-0000019-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2F59A372-97A0-468B-8A21-0ACA78A3222F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2F59A372-97A0-468B-8A21-0ACA78A3222F', 'Miguel', 'Rodriguez', 'miguel.rodriguez.20@example.com', 'HASHED_PWD', '809-555-0000', '402-0000020-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A0159C99-46E7-4093-9660-C5F8C98B2EB9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A0159C99-46E7-4093-9660-C5F8C98B2EB9', 'Jose', 'Torres', 'jose.torres.21@example.com', 'HASHED_PWD', '809-555-0000', '402-0000021-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E5CCD3CB-0206-45BE-8288-E58D165D68E9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E5CCD3CB-0206-45BE-8288-E58D165D68E9', 'Carlos', 'Rodriguez', 'carlos.rodriguez.22@example.com', 'HASHED_PWD', '809-555-0000', '402-0000022-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EAE3BFE0-DFC9-4EB7-8AE0-B5F2A8EC4C8D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EAE3BFE0-DFC9-4EB7-8AE0-B5F2A8EC4C8D', 'Maria', 'Lopez', 'maria.lopez.23@example.com', 'HASHED_PWD', '809-555-0000', '402-0000023-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E09C4632-2BC3-4211-A043-8A989E21904A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E09C4632-2BC3-4211-A043-8A989E21904A', 'Pedro', 'Diaz', 'pedro.diaz.24@example.com', 'HASHED_PWD', '809-555-0000', '402-0000024-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '996E3A66-A9E0-4018-9386-9E2CF2D93645')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('996E3A66-A9E0-4018-9386-9E2CF2D93645', 'Sofia', 'Fernandez', 'sofia.fernandez.25@example.com', 'HASHED_PWD', '809-555-0000', '402-0000025-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A9A2D2BF-9493-4B5A-BCE7-3441BF48FCC0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A9A2D2BF-9493-4B5A-BCE7-3441BF48FCC0', 'Carlos', 'Rodriguez', 'carlos.rodriguez.26@example.com', 'HASHED_PWD', '809-555-0000', '402-0000026-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '4991BD50-66EB-4960-99D9-71372518CC1B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('4991BD50-66EB-4960-99D9-71372518CC1B', 'Miguel', 'Martinez', 'miguel.martinez.27@example.com', 'HASHED_PWD', '809-555-0000', '402-0000027-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '728D3A0E-F30A-45E5-84A5-E7DCCC1CCD07')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('728D3A0E-F30A-45E5-84A5-E7DCCC1CCD07', 'Luis', 'Gomez', 'luis.gomez.28@example.com', 'HASHED_PWD', '809-555-0000', '402-0000028-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EA5910C0-EF2C-4967-97F8-2788469EC983')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EA5910C0-EF2C-4967-97F8-2788469EC983', 'Francisco', 'Alvarez', 'francisco.alvarez.29@example.com', 'HASHED_PWD', '809-555-0000', '402-0000029-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1DE1E717-C806-449A-9B54-A28E26BA8078')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1DE1E717-C806-449A-9B54-A28E26BA8078', 'Ana', 'Sanchez', 'ana.sanchez.30@example.com', 'HASHED_PWD', '809-555-0000', '402-0000030-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BCF25042-2F19-4C4C-B841-F84E602BAC01')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BCF25042-2F19-4C4C-B841-F84E602BAC01', 'Pedro', 'Romero', 'pedro.romero.31@example.com', 'HASHED_PWD', '809-555-0000', '402-0000031-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BDEBA221-CA20-4EEB-AC9F-95B895F2E510')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BDEBA221-CA20-4EEB-AC9F-95B895F2E510', 'Antonio', 'Diaz', 'antonio.diaz.32@example.com', 'HASHED_PWD', '809-555-0000', '402-0000032-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '03A30E11-7993-4ABF-B3D7-5ED880755B44')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('03A30E11-7993-4ABF-B3D7-5ED880755B44', 'Jose', 'Gomez', 'jose.gomez.33@example.com', 'HASHED_PWD', '809-555-0000', '402-0000033-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '17C8598A-E5B3-4125-940D-4556F6FC7C2A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('17C8598A-E5B3-4125-940D-4556F6FC7C2A', 'Pedro', 'Ruiz', 'pedro.ruiz.34@example.com', 'HASHED_PWD', '809-555-0000', '402-0000034-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '77220801-5A87-4153-BC33-0E24F6DC82B8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('77220801-5A87-4153-BC33-0E24F6DC82B8', 'Antonio', 'Diaz', 'antonio.diaz.35@example.com', 'HASHED_PWD', '809-555-0000', '402-0000035-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '81D958D2-2D72-419F-A3C0-C7C27FF0E7BC')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('81D958D2-2D72-419F-A3C0-C7C27FF0E7BC', 'Luis', 'Gomez', 'luis.gomez.36@example.com', 'HASHED_PWD', '809-555-0000', '402-0000036-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BD6AB453-F080-4E59-9452-A625762B3FC2')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BD6AB453-F080-4E59-9452-A625762B3FC2', 'Ana', 'Martinez', 'ana.martinez.37@example.com', 'HASHED_PWD', '809-555-0000', '402-0000037-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D8FA5C06-E858-4240-909B-3971A0168F09')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D8FA5C06-E858-4240-909B-3971A0168F09', 'Miguel', 'Ruiz', 'miguel.ruiz.38@example.com', 'HASHED_PWD', '809-555-0000', '402-0000038-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '896E6980-1A9C-444E-A673-3B0F05CBF094')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('896E6980-1A9C-444E-A673-3B0F05CBF094', 'Pedro', 'Torres', 'pedro.torres.39@example.com', 'HASHED_PWD', '809-555-0000', '402-0000039-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '72B4865B-460D-41BC-A5A2-E1AE113D7A47')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('72B4865B-460D-41BC-A5A2-E1AE113D7A47', 'Sofia', 'Ruiz', 'sofia.ruiz.40@example.com', 'HASHED_PWD', '809-555-0000', '402-0000040-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E8648A42-3A31-4D99-B2B1-93387D4EF8C1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E8648A42-3A31-4D99-B2B1-93387D4EF8C1', 'Maria', 'Diaz', 'maria.diaz.41@example.com', 'HASHED_PWD', '809-555-0000', '402-0000041-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'AC7613C0-0A20-410E-A3C5-76433651B08D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('AC7613C0-0A20-410E-A3C5-76433651B08D', 'Luis', 'Fernandez', 'luis.fernandez.42@example.com', 'HASHED_PWD', '809-555-0000', '402-0000042-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E68FE080-1ED6-4067-B80C-0E5E7C841DB5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E68FE080-1ED6-4067-B80C-0E5E7C841DB5', 'Ana', 'Torres', 'ana.torres.43@example.com', 'HASHED_PWD', '809-555-0000', '402-0000043-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '83532083-3109-419F-865F-B4A29C27F845')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('83532083-3109-419F-865F-B4A29C27F845', 'Ana', 'Gonzalez', 'ana.gonzalez.44@example.com', 'HASHED_PWD', '809-555-0000', '402-0000044-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9F0DFEF1-D4BF-460E-BF35-135A81D5CA85')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9F0DFEF1-D4BF-460E-BF35-135A81D5CA85', 'Isabel', 'Sanchez', 'isabel.sanchez.45@example.com', 'HASHED_PWD', '809-555-0000', '402-0000045-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '026BD6F7-79DF-4698-8C8A-A11AD5D48ACF')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('026BD6F7-79DF-4698-8C8A-A11AD5D48ACF', 'Carmen', 'Diaz', 'carmen.diaz.46@example.com', 'HASHED_PWD', '809-555-0000', '402-0000046-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6C8D614E-4CE8-4480-8BD1-CA4E4791BBC8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6C8D614E-4CE8-4480-8BD1-CA4E4791BBC8', 'Carlos', 'Fernandez', 'carlos.fernandez.47@example.com', 'HASHED_PWD', '809-555-0000', '402-0000047-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '04D9D4FD-B3B1-431C-AB94-5EEF23BC055D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('04D9D4FD-B3B1-431C-AB94-5EEF23BC055D', 'Francisco', 'Ruiz', 'francisco.ruiz.48@example.com', 'HASHED_PWD', '809-555-0000', '402-0000048-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1265D79D-9D35-4C32-B3CC-89A3B949EF8E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1265D79D-9D35-4C32-B3CC-89A3B949EF8E', 'Isabel', 'Ruiz', 'isabel.ruiz.49@example.com', 'HASHED_PWD', '809-555-0000', '402-0000049-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1DB71D4E-5A3D-4FC9-8575-0F04B31BE06B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1DB71D4E-5A3D-4FC9-8575-0F04B31BE06B', 'Carmen', 'Romero', 'carmen.romero.50@example.com', 'HASHED_PWD', '809-555-0000', '402-0000050-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '24B7DD44-8F25-4106-A8CF-E97D918FBAF1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('24B7DD44-8F25-4106-A8CF-E97D918FBAF1', 'Elena', 'Fernandez', 'elena.fernandez.51@example.com', 'HASHED_PWD', '809-555-0000', '402-0000051-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '066FE386-52EE-49D1-A69E-F75D6BEAD469')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('066FE386-52EE-49D1-A69E-F75D6BEAD469', 'Francisco', 'Lopez', 'francisco.lopez.52@example.com', 'HASHED_PWD', '809-555-0000', '402-0000052-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '66DB0821-53B3-4F21-B77E-584859B22198')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('66DB0821-53B3-4F21-B77E-584859B22198', 'Maria', 'Perez', 'maria.perez.53@example.com', 'HASHED_PWD', '809-555-0000', '402-0000053-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'AB916DDA-374F-4A9C-99FD-674E1E03BEEA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('AB916DDA-374F-4A9C-99FD-674E1E03BEEA', 'Miguel', 'Torres', 'miguel.torres.54@example.com', 'HASHED_PWD', '809-555-0000', '402-0000054-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1721B58F-968E-4399-BB70-1F8BB0BBDFEA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1721B58F-968E-4399-BB70-1F8BB0BBDFEA', 'Ana', 'Gonzalez', 'ana.gonzalez.55@example.com', 'HASHED_PWD', '809-555-0000', '402-0000055-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '98882661-7979-4E9B-82C6-31B3E38299A7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('98882661-7979-4E9B-82C6-31B3E38299A7', 'Pedro', 'Perez', 'pedro.perez.56@example.com', 'HASHED_PWD', '809-555-0000', '402-0000056-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0678AA83-AD23-4C6C-A780-BCEC36B7D7B4')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0678AA83-AD23-4C6C-A780-BCEC36B7D7B4', 'Ana', 'Alvarez', 'ana.alvarez.57@example.com', 'HASHED_PWD', '809-555-0000', '402-0000057-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9807DB33-0FE1-4FD1-8426-B8B103894586')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9807DB33-0FE1-4FD1-8426-B8B103894586', 'Jose', 'Lopez', 'jose.lopez.58@example.com', 'HASHED_PWD', '809-555-0000', '402-0000058-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '17760077-1D2E-4EF8-B250-40E32894CD83')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('17760077-1D2E-4EF8-B250-40E32894CD83', 'Pedro', 'Gonzalez', 'pedro.gonzalez.59@example.com', 'HASHED_PWD', '809-555-0000', '402-0000059-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9206880C-D09A-473F-9507-F3D2442E4B09')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9206880C-D09A-473F-9507-F3D2442E4B09', 'Maria', 'Lopez', 'maria.lopez.60@example.com', 'HASHED_PWD', '809-555-0000', '402-0000060-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0C1ECDE5-4C38-47BD-987A-197FE80CA137')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0C1ECDE5-4C38-47BD-987A-197FE80CA137', 'Isabel', 'Ruiz', 'isabel.ruiz.61@example.com', 'HASHED_PWD', '809-555-0000', '402-0000061-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6880031F-4E6D-477E-923D-BF20FC629E6C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6880031F-4E6D-477E-923D-BF20FC629E6C', 'Carlos', 'Alvarez', 'carlos.alvarez.62@example.com', 'HASHED_PWD', '809-555-0000', '402-0000062-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1C0E0617-D7DC-448E-97BC-270620162D80')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1C0E0617-D7DC-448E-97BC-270620162D80', 'Francisco', 'Perez', 'francisco.perez.63@example.com', 'HASHED_PWD', '809-555-0000', '402-0000063-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '29D80C64-1E1B-461C-8D08-4C67E34D8C30')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('29D80C64-1E1B-461C-8D08-4C67E34D8C30', 'Miguel', 'Lopez', 'miguel.lopez.64@example.com', 'HASHED_PWD', '809-555-0000', '402-0000064-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B00844E6-53FD-4C3C-B974-6989E441A066')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B00844E6-53FD-4C3C-B974-6989E441A066', 'Juan', 'Gomez', 'juan.gomez.65@example.com', 'HASHED_PWD', '809-555-0000', '402-0000065-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '60DD6271-8996-4FBC-BA75-7FF9F58A07D8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('60DD6271-8996-4FBC-BA75-7FF9F58A07D8', 'Miguel', 'Rodriguez', 'miguel.rodriguez.66@example.com', 'HASHED_PWD', '809-555-0000', '402-0000066-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EF5DD0A6-7A45-4594-93E4-5300246DD438')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EF5DD0A6-7A45-4594-93E4-5300246DD438', 'Luis', 'Gonzalez', 'luis.gonzalez.67@example.com', 'HASHED_PWD', '809-555-0000', '402-0000067-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E848886D-CA7B-45E1-B351-D2C1EB24134C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E848886D-CA7B-45E1-B351-D2C1EB24134C', 'Luis', 'Fernandez', 'luis.fernandez.68@example.com', 'HASHED_PWD', '809-555-0000', '402-0000068-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '4AE57645-89B1-4D49-B08C-0A8B37A1F604')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('4AE57645-89B1-4D49-B08C-0A8B37A1F604', 'Maria', 'Sanchez', 'maria.sanchez.69@example.com', 'HASHED_PWD', '809-555-0000', '402-0000069-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0FE4B256-9BB2-441C-8CD7-F7DA0CA0D81A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0FE4B256-9BB2-441C-8CD7-F7DA0CA0D81A', 'Sofia', 'Romero', 'sofia.romero.70@example.com', 'HASHED_PWD', '809-555-0000', '402-0000070-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B2FC8891-90A7-413E-9D71-58CBC602CF83')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B2FC8891-90A7-413E-9D71-58CBC602CF83', 'Luis', 'Lopez', 'luis.lopez.71@example.com', 'HASHED_PWD', '809-555-0000', '402-0000071-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2F12AB99-DB19-450D-8240-F8A6F34B2D8E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2F12AB99-DB19-450D-8240-F8A6F34B2D8E', 'Luis', 'Gonzalez', 'luis.gonzalez.72@example.com', 'HASHED_PWD', '809-555-0000', '402-0000072-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '64CE5962-F9DC-454A-9412-A5C215B457A7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('64CE5962-F9DC-454A-9412-A5C215B457A7', 'Elena', 'Torres', 'elena.torres.73@example.com', 'HASHED_PWD', '809-555-0000', '402-0000073-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A614E18C-7C18-40D2-B5DD-96F81D3FEB3B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A614E18C-7C18-40D2-B5DD-96F81D3FEB3B', 'Antonio', 'Alvarez', 'antonio.alvarez.74@example.com', 'HASHED_PWD', '809-555-0000', '402-0000074-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '422F9FED-8D42-4C5B-9F72-F3EEA923460F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('422F9FED-8D42-4C5B-9F72-F3EEA923460F', 'Maria', 'Perez', 'maria.perez.75@example.com', 'HASHED_PWD', '809-555-0000', '402-0000075-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FE3A200B-6E9D-415C-82C0-0321318D0E3E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FE3A200B-6E9D-415C-82C0-0321318D0E3E', 'Miguel', 'Alvarez', 'miguel.alvarez.76@example.com', 'HASHED_PWD', '809-555-0000', '402-0000076-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EF57507F-6BA1-4D47-92A5-20D5EFA6ADA8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EF57507F-6BA1-4D47-92A5-20D5EFA6ADA8', 'Isabel', 'Lopez', 'isabel.lopez.77@example.com', 'HASHED_PWD', '809-555-0000', '402-0000077-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '35ABB853-3A98-4098-A3FD-35A626D228EB')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('35ABB853-3A98-4098-A3FD-35A626D228EB', 'Laura', 'Perez', 'laura.perez.78@example.com', 'HASHED_PWD', '809-555-0000', '402-0000078-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EC2EB1EE-0AF7-442A-B2A8-73464E5A8F9F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EC2EB1EE-0AF7-442A-B2A8-73464E5A8F9F', 'Juan', 'Diaz', 'juan.diaz.79@example.com', 'HASHED_PWD', '809-555-0000', '402-0000079-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '3F75E2DE-6EDE-4489-9ADB-E1097D8250E5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('3F75E2DE-6EDE-4489-9ADB-E1097D8250E5', 'Maria', 'Fernandez', 'maria.fernandez.80@example.com', 'HASHED_PWD', '809-555-0000', '402-0000080-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '81806519-52BB-4BAB-B8B0-9A853AB79CE4')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('81806519-52BB-4BAB-B8B0-9A853AB79CE4', 'Miguel', 'Romero', 'miguel.romero.81@example.com', 'HASHED_PWD', '809-555-0000', '402-0000081-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '280260E8-A791-46CA-A09A-62D2D25D7525')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('280260E8-A791-46CA-A09A-62D2D25D7525', 'Elena', 'Sanchez', 'elena.sanchez.82@example.com', 'HASHED_PWD', '809-555-0000', '402-0000082-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '81C1D5D0-07E3-4C9E-B05F-9C8F17DA1977')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('81C1D5D0-07E3-4C9E-B05F-9C8F17DA1977', 'Elena', 'Fernandez', 'elena.fernandez.83@example.com', 'HASHED_PWD', '809-555-0000', '402-0000083-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '40A9C329-1089-406C-9853-23A5AD598B20')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('40A9C329-1089-406C-9853-23A5AD598B20', 'Ana', 'Rodriguez', 'ana.rodriguez.84@example.com', 'HASHED_PWD', '809-555-0000', '402-0000084-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2E8EA371-7BC1-4A53-AAE4-3CB317F23759')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2E8EA371-7BC1-4A53-AAE4-3CB317F23759', 'Carmen', 'Romero', 'carmen.romero.85@example.com', 'HASHED_PWD', '809-555-0000', '402-0000085-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2BEF201D-49AE-4CD1-8423-0BFA186830D9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2BEF201D-49AE-4CD1-8423-0BFA186830D9', 'Luis', 'Ruiz', 'luis.ruiz.86@example.com', 'HASHED_PWD', '809-555-0000', '402-0000086-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A0A227EE-74B2-47B0-98A0-108D619C8C43')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A0A227EE-74B2-47B0-98A0-108D619C8C43', 'Antonio', 'Lopez', 'antonio.lopez.87@example.com', 'HASHED_PWD', '809-555-0000', '402-0000087-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '569D49EF-C16C-478A-9D40-E0338BC3CF58')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('569D49EF-C16C-478A-9D40-E0338BC3CF58', 'Sofia', 'Fernandez', 'sofia.fernandez.88@example.com', 'HASHED_PWD', '809-555-0000', '402-0000088-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '4391F3B8-283A-43B5-B5F9-76E14383ADE6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('4391F3B8-283A-43B5-B5F9-76E14383ADE6', 'Miguel', 'Romero', 'miguel.romero.89@example.com', 'HASHED_PWD', '809-555-0000', '402-0000089-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8220CD16-6425-4DA0-B230-83D21B9797C0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8220CD16-6425-4DA0-B230-83D21B9797C0', 'Laura', 'Lopez', 'laura.lopez.90@example.com', 'HASHED_PWD', '809-555-0000', '402-0000090-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '67BD675B-6A79-426F-BB1B-C3CA4735BA07')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('67BD675B-6A79-426F-BB1B-C3CA4735BA07', 'Carmen', 'Lopez', 'carmen.lopez.91@example.com', 'HASHED_PWD', '809-555-0000', '402-0000091-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C3392BDA-88A3-4E20-A313-9C17784B66AA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C3392BDA-88A3-4E20-A313-9C17784B66AA', 'Luis', 'Sanchez', 'luis.sanchez.92@example.com', 'HASHED_PWD', '809-555-0000', '402-0000092-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '70FAC0FB-D0B7-4C50-A3D3-FEC351EE7397')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('70FAC0FB-D0B7-4C50-A3D3-FEC351EE7397', 'Carlos', 'Romero', 'carlos.romero.93@example.com', 'HASHED_PWD', '809-555-0000', '402-0000093-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '75675B76-B795-4C08-B719-D3CA736AED2F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('75675B76-B795-4C08-B719-D3CA736AED2F', 'Juan', 'Diaz', 'juan.diaz.94@example.com', 'HASHED_PWD', '809-555-0000', '402-0000094-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '5529D67E-5B1C-4BC8-B3E7-0CFD14659F59')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('5529D67E-5B1C-4BC8-B3E7-0CFD14659F59', 'Laura', 'Romero', 'laura.romero.95@example.com', 'HASHED_PWD', '809-555-0000', '402-0000095-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6C443E86-255E-4E73-ACF6-66874310CC08')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6C443E86-255E-4E73-ACF6-66874310CC08', 'Laura', 'Gomez', 'laura.gomez.96@example.com', 'HASHED_PWD', '809-555-0000', '402-0000096-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'AD340E30-9DE5-4940-AB37-016E4DB2553F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('AD340E30-9DE5-4940-AB37-016E4DB2553F', 'Miguel', 'Torres', 'miguel.torres.97@example.com', 'HASHED_PWD', '809-555-0000', '402-0000097-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '21CCF0C2-3751-41A4-AB2F-CB5490DEDB75')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('21CCF0C2-3751-41A4-AB2F-CB5490DEDB75', 'Juan', 'Fernandez', 'juan.fernandez.98@example.com', 'HASHED_PWD', '809-555-0000', '402-0000098-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1D35FD41-03BC-485E-9040-4F17DC77E103')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1D35FD41-03BC-485E-9040-4F17DC77E103', 'Isabel', 'Diaz', 'isabel.diaz.99@example.com', 'HASHED_PWD', '809-555-0000', '402-0000099-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A73E6CA8-61A1-4F67-9FB2-3FBD507022AF')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A73E6CA8-61A1-4F67-9FB2-3FBD507022AF', 'Ana', 'Perez', 'ana.perez.100@example.com', 'HASHED_PWD', '809-555-0000', '402-0000100-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E771A098-E2DE-4F1D-93DE-5EFC65699FCB')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E771A098-E2DE-4F1D-93DE-5EFC65699FCB', 'Laura', 'Sanchez', 'laura.sanchez.101@example.com', 'HASHED_PWD', '809-555-0000', '402-0000101-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FBEBDEC5-AB94-4F2B-92A6-C224B9B948E5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FBEBDEC5-AB94-4F2B-92A6-C224B9B948E5', 'Maria', 'Gomez', 'maria.gomez.102@example.com', 'HASHED_PWD', '809-555-0000', '402-0000102-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '48E7B3E2-AEF5-4E27-9099-BDEE680BE036')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('48E7B3E2-AEF5-4E27-9099-BDEE680BE036', 'Sofia', 'Fernandez', 'sofia.fernandez.103@example.com', 'HASHED_PWD', '809-555-0000', '402-0000103-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '62C4DFC3-C0C8-4F57-9BDE-99542C1E0EE8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('62C4DFC3-C0C8-4F57-9BDE-99542C1E0EE8', 'Maria', 'Torres', 'maria.torres.104@example.com', 'HASHED_PWD', '809-555-0000', '402-0000104-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '03932995-1C41-4E40-B36B-5B14998F62FD')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('03932995-1C41-4E40-B36B-5B14998F62FD', 'Carmen', 'Rodriguez', 'carmen.rodriguez.105@example.com', 'HASHED_PWD', '809-555-0000', '402-0000105-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B5D96C86-2218-42BE-98B9-7E090A74C56B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B5D96C86-2218-42BE-98B9-7E090A74C56B', 'Antonio', 'Perez', 'antonio.perez.106@example.com', 'HASHED_PWD', '809-555-0000', '402-0000106-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A0B5E6C3-2DD1-43FA-8CE2-63B6635E1A0F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A0B5E6C3-2DD1-43FA-8CE2-63B6635E1A0F', 'Jose', 'Gomez', 'jose.gomez.107@example.com', 'HASHED_PWD', '809-555-0000', '402-0000107-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9C86A094-E548-47A3-97C7-577D63AEC195')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9C86A094-E548-47A3-97C7-577D63AEC195', 'Juan', 'Ruiz', 'juan.ruiz.108@example.com', 'HASHED_PWD', '809-555-0000', '402-0000108-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BE743D4D-1A12-4A49-9CE3-CA9988E93009')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BE743D4D-1A12-4A49-9CE3-CA9988E93009', 'Maria', 'Lopez', 'maria.lopez.109@example.com', 'HASHED_PWD', '809-555-0000', '402-0000109-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F5A427E7-D0AD-4267-8B8F-7CAF05D6905A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F5A427E7-D0AD-4267-8B8F-7CAF05D6905A', 'Carlos', 'Alvarez', 'carlos.alvarez.110@example.com', 'HASHED_PWD', '809-555-0000', '402-0000110-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0B67A0F5-F4CD-4965-B8DB-7ECAFD51228A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0B67A0F5-F4CD-4965-B8DB-7ECAFD51228A', 'Carlos', 'Alvarez', 'carlos.alvarez.111@example.com', 'HASHED_PWD', '809-555-0000', '402-0000111-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C67DA789-52DD-4713-A1D8-F01C6D665888')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C67DA789-52DD-4713-A1D8-F01C6D665888', 'Sofia', 'Rodriguez', 'sofia.rodriguez.112@example.com', 'HASHED_PWD', '809-555-0000', '402-0000112-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '68B2FF5B-DA08-42E3-9A70-0965BA9D93B0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('68B2FF5B-DA08-42E3-9A70-0965BA9D93B0', 'Laura', 'Torres', 'laura.torres.113@example.com', 'HASHED_PWD', '809-555-0000', '402-0000113-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '3C8CC112-F563-4DB4-AF2C-A42D0A7590F1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('3C8CC112-F563-4DB4-AF2C-A42D0A7590F1', 'Pedro', 'Alvarez', 'pedro.alvarez.114@example.com', 'HASHED_PWD', '809-555-0000', '402-0000114-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1382FDF2-0F96-4C6C-95E3-D46BE73727F7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1382FDF2-0F96-4C6C-95E3-D46BE73727F7', 'Francisco', 'Martinez', 'francisco.martinez.115@example.com', 'HASHED_PWD', '809-555-0000', '402-0000115-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2D9612AD-27ED-4A15-8BAF-A401C6701729')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2D9612AD-27ED-4A15-8BAF-A401C6701729', 'Jose', 'Romero', 'jose.romero.116@example.com', 'HASHED_PWD', '809-555-0000', '402-0000116-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'CD40EB61-CD1B-434D-B6BE-A8F0EBBBAEEC')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('CD40EB61-CD1B-434D-B6BE-A8F0EBBBAEEC', 'Maria', 'Gomez', 'maria.gomez.117@example.com', 'HASHED_PWD', '809-555-0000', '402-0000117-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'DA757A7E-8E85-45AA-84C9-D8F0627EDA3E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('DA757A7E-8E85-45AA-84C9-D8F0627EDA3E', 'Francisco', 'Lopez', 'francisco.lopez.118@example.com', 'HASHED_PWD', '809-555-0000', '402-0000118-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '60F8FCAA-9C62-49B3-BBAC-55C0717A8403')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('60F8FCAA-9C62-49B3-BBAC-55C0717A8403', 'Miguel', 'Ruiz', 'miguel.ruiz.119@example.com', 'HASHED_PWD', '809-555-0000', '402-0000119-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1670CA1D-586C-4A55-8082-411D0053F293')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1670CA1D-586C-4A55-8082-411D0053F293', 'Isabel', 'Gonzalez', 'isabel.gonzalez.120@example.com', 'HASHED_PWD', '809-555-0000', '402-0000120-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D8656FBD-B328-4DF3-B13B-5185E8BAB101')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D8656FBD-B328-4DF3-B13B-5185E8BAB101', 'Luis', 'Ruiz', 'luis.ruiz.121@example.com', 'HASHED_PWD', '809-555-0000', '402-0000121-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EECE9770-C0F3-4708-B9F5-06B72396EBB5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EECE9770-C0F3-4708-B9F5-06B72396EBB5', 'Isabel', 'Diaz', 'isabel.diaz.122@example.com', 'HASHED_PWD', '809-555-0000', '402-0000122-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A2BF135D-43F2-4094-8762-48E38E3785B9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A2BF135D-43F2-4094-8762-48E38E3785B9', 'Pedro', 'Ruiz', 'pedro.ruiz.123@example.com', 'HASHED_PWD', '809-555-0000', '402-0000123-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F5712FF7-6F79-4173-973E-8CE97D821577')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F5712FF7-6F79-4173-973E-8CE97D821577', 'Miguel', 'Romero', 'miguel.romero.124@example.com', 'HASHED_PWD', '809-555-0000', '402-0000124-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B16F1F33-C577-4780-ADD4-AE7D02BD26B5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B16F1F33-C577-4780-ADD4-AE7D02BD26B5', 'Pedro', 'Gonzalez', 'pedro.gonzalez.125@example.com', 'HASHED_PWD', '809-555-0000', '402-0000125-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '7E7CE553-D1B9-4E59-B7C4-32AA25369B09')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('7E7CE553-D1B9-4E59-B7C4-32AA25369B09', 'Pedro', 'Sanchez', 'pedro.sanchez.126@example.com', 'HASHED_PWD', '809-555-0000', '402-0000126-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '59E49746-2B1F-4D55-AF99-4C1FD135D79B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('59E49746-2B1F-4D55-AF99-4C1FD135D79B', 'Elena', 'Gonzalez', 'elena.gonzalez.127@example.com', 'HASHED_PWD', '809-555-0000', '402-0000127-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6FBE081B-F2C7-42CE-A393-FC2F935CEC5C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6FBE081B-F2C7-42CE-A393-FC2F935CEC5C', 'Jose', 'Martinez', 'jose.martinez.128@example.com', 'HASHED_PWD', '809-555-0000', '402-0000128-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'CF8CC7C7-322D-49AD-8234-979BE693316D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('CF8CC7C7-322D-49AD-8234-979BE693316D', 'Laura', 'Perez', 'laura.perez.129@example.com', 'HASHED_PWD', '809-555-0000', '402-0000129-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '575619E5-021E-4861-9DE8-8EB7C0F1BC5F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('575619E5-021E-4861-9DE8-8EB7C0F1BC5F', 'Francisco', 'Lopez', 'francisco.lopez.130@example.com', 'HASHED_PWD', '809-555-0000', '402-0000130-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1C62C562-071A-495D-88EC-0D015324E8B5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1C62C562-071A-495D-88EC-0D015324E8B5', 'Francisco', 'Diaz', 'francisco.diaz.131@example.com', 'HASHED_PWD', '809-555-0000', '402-0000131-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BB8E0490-F366-4D68-8F5C-A13FA2073A2C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BB8E0490-F366-4D68-8F5C-A13FA2073A2C', 'Francisco', 'Gonzalez', 'francisco.gonzalez.132@example.com', 'HASHED_PWD', '809-555-0000', '402-0000132-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D055B57D-1379-4F74-AF1E-8D816E55F12E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D055B57D-1379-4F74-AF1E-8D816E55F12E', 'Jose', 'Alvarez', 'jose.alvarez.133@example.com', 'HASHED_PWD', '809-555-0000', '402-0000133-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E00BFF8D-D8D5-49DF-A6A2-B8BB586C2ACA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E00BFF8D-D8D5-49DF-A6A2-B8BB586C2ACA', 'Sofia', 'Fernandez', 'sofia.fernandez.134@example.com', 'HASHED_PWD', '809-555-0000', '402-0000134-1');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '1B03056C-79FF-4568-A494-8FC9F5EFEDF6')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('1B03056C-79FF-4568-A494-8FC9F5EFEDF6', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1B03056C-79FF-4568-A494-8FC9F5EFEDF6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1B03056C-79FF-4568-A494-8FC9F5EFEDF6', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '8651D1CD-90C1-446C-AC7E-F2DB6B5BA3EA')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('8651D1CD-90C1-446C-AC7E-F2DB6B5BA3EA', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8651D1CD-90C1-446C-AC7E-F2DB6B5BA3EA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8651D1CD-90C1-446C-AC7E-F2DB6B5BA3EA', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '021B11B8-7E24-42D1-8527-5A5A91F72703')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('021B11B8-7E24-42D1-8527-5A5A91F72703', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '021B11B8-7E24-42D1-8527-5A5A91F72703')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('021B11B8-7E24-42D1-8527-5A5A91F72703', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'BC018766-B511-4257-9DC8-58B7C41C0A60')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('BC018766-B511-4257-9DC8-58B7C41C0A60', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BC018766-B511-4257-9DC8-58B7C41C0A60')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BC018766-B511-4257-9DC8-58B7C41C0A60', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '57B5A749-7642-42C3-9927-B6165E29BFF6')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('57B5A749-7642-42C3-9927-B6165E29BFF6', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '57B5A749-7642-42C3-9927-B6165E29BFF6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('57B5A749-7642-42C3-9927-B6165E29BFF6', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0');
