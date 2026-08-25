-- Seed for UsuarioLegacy
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '57C501E0-58D7-40AC-B234-97547306ADFE')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('57C501E0-58D7-40AC-B234-97547306ADFE', 'Elena', 'Alvarez', 'elena.alvarez.0@example.com', 'HASHED_PWD', '809-555-0000', '402-0000000-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '674320B5-9F12-43AF-9951-8EAA7091A973')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('674320B5-9F12-43AF-9951-8EAA7091A973', 'Carlos', 'Gonzalez', 'carlos.gonzalez.1@example.com', 'HASHED_PWD', '809-555-0000', '402-0000001-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '22A1C157-0F48-4100-B17C-1E6FA138A4E0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('22A1C157-0F48-4100-B17C-1E6FA138A4E0', 'Maria', 'Rodriguez', 'maria.rodriguez.2@example.com', 'HASHED_PWD', '809-555-0000', '402-0000002-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '40391257-54F8-4A5F-BF73-2EE95AE0AB8C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('40391257-54F8-4A5F-BF73-2EE95AE0AB8C', 'Miguel', 'Perez', 'miguel.perez.3@example.com', 'HASHED_PWD', '809-555-0000', '402-0000003-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B9B9AA2F-70A8-4281-8F0F-B06FE5FB975C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B9B9AA2F-70A8-4281-8F0F-B06FE5FB975C', 'Isabel', 'Sanchez', 'isabel.sanchez.4@example.com', 'HASHED_PWD', '809-555-0000', '402-0000004-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '86735638-F988-45C4-A8B4-9A6C5EECFB46')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('86735638-F988-45C4-A8B4-9A6C5EECFB46', 'Antonio', 'Torres', 'antonio.torres.5@example.com', 'HASHED_PWD', '809-555-0000', '402-0000005-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '3F7947D3-B9ED-4B86-86FF-670F26B674A5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('3F7947D3-B9ED-4B86-86FF-670F26B674A5', 'Laura', 'Fernandez', 'laura.fernandez.6@example.com', 'HASHED_PWD', '809-555-0000', '402-0000006-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8B62BADE-9D6D-43E0-BD81-18EF7E2AD9E9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8B62BADE-9D6D-43E0-BD81-18EF7E2AD9E9', 'Francisco', 'Alvarez', 'francisco.alvarez.7@example.com', 'HASHED_PWD', '809-555-0000', '402-0000007-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FEA2A1B0-DCF3-48CC-BB6E-902BC651B7B2')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FEA2A1B0-DCF3-48CC-BB6E-902BC651B7B2', 'Laura', 'Ruiz', 'laura.ruiz.8@example.com', 'HASHED_PWD', '809-555-0000', '402-0000008-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '313446EF-34CD-4414-8F67-FFED09075890')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('313446EF-34CD-4414-8F67-FFED09075890', 'Maria', 'Romero', 'maria.romero.9@example.com', 'HASHED_PWD', '809-555-0000', '402-0000009-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'DEEF4D74-215D-40B4-B8D8-B7EB8FEC2BF3')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('DEEF4D74-215D-40B4-B8D8-B7EB8FEC2BF3', 'Sofia', 'Ruiz', 'sofia.ruiz.10@example.com', 'HASHED_PWD', '809-555-0000', '402-0000010-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8E468558-E943-4331-B4AD-DF6254149313')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8E468558-E943-4331-B4AD-DF6254149313', 'Juan', 'Martinez', 'juan.martinez.11@example.com', 'HASHED_PWD', '809-555-0000', '402-0000011-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '73B2CF82-9EF4-4536-B0B1-BC6CCED7539A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('73B2CF82-9EF4-4536-B0B1-BC6CCED7539A', 'Francisco', 'Ruiz', 'francisco.ruiz.12@example.com', 'HASHED_PWD', '809-555-0000', '402-0000012-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BDB62E77-B645-4135-A28C-B2CB64033D9D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BDB62E77-B645-4135-A28C-B2CB64033D9D', 'Antonio', 'Diaz', 'antonio.diaz.13@example.com', 'HASHED_PWD', '809-555-0000', '402-0000013-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '694A90AA-C7C9-46BF-BDC6-6987CFB1C389')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('694A90AA-C7C9-46BF-BDC6-6987CFB1C389', 'Antonio', 'Alvarez', 'antonio.alvarez.14@example.com', 'HASHED_PWD', '809-555-0000', '402-0000014-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F03984E4-9E4F-4DD0-B79D-93C600539BA0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F03984E4-9E4F-4DD0-B79D-93C600539BA0', 'Ana', 'Ruiz', 'ana.ruiz.15@example.com', 'HASHED_PWD', '809-555-0000', '402-0000015-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '81CAA6A4-70CB-4601-9455-1EED9D1E3183')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('81CAA6A4-70CB-4601-9455-1EED9D1E3183', 'Isabel', 'Torres', 'isabel.torres.16@example.com', 'HASHED_PWD', '809-555-0000', '402-0000016-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8C350154-4039-4BFB-A3E0-50BC2C0EAB92')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8C350154-4039-4BFB-A3E0-50BC2C0EAB92', 'Isabel', 'Perez', 'isabel.perez.17@example.com', 'HASHED_PWD', '809-555-0000', '402-0000017-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '4500B959-C2A2-4069-9196-654623A953F1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('4500B959-C2A2-4069-9196-654623A953F1', 'Luis', 'Gomez', 'luis.gomez.18@example.com', 'HASHED_PWD', '809-555-0000', '402-0000018-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '12BED521-5706-4310-A86F-52B90C4E6C53')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('12BED521-5706-4310-A86F-52B90C4E6C53', 'Miguel', 'Romero', 'miguel.romero.19@example.com', 'HASHED_PWD', '809-555-0000', '402-0000019-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FECF7C42-FE51-4777-B75B-49405BAE8D10')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FECF7C42-FE51-4777-B75B-49405BAE8D10', 'Laura', 'Romero', 'laura.romero.20@example.com', 'HASHED_PWD', '809-555-0000', '402-0000020-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '43D454CC-6657-4191-B72E-BFE6A5FADD9E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('43D454CC-6657-4191-B72E-BFE6A5FADD9E', 'Elena', 'Ruiz', 'elena.ruiz.21@example.com', 'HASHED_PWD', '809-555-0000', '402-0000021-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1C919431-1CA5-4A45-A924-6F061518DBD6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1C919431-1CA5-4A45-A924-6F061518DBD6', 'Elena', 'Gomez', 'elena.gomez.22@example.com', 'HASHED_PWD', '809-555-0000', '402-0000022-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C1190A27-9CE3-4816-87AA-6797249D21FC')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C1190A27-9CE3-4816-87AA-6797249D21FC', 'Laura', 'Gomez', 'laura.gomez.23@example.com', 'HASHED_PWD', '809-555-0000', '402-0000023-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C94A17D2-F73B-4AE2-8C9F-1C6749BDE2DC')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C94A17D2-F73B-4AE2-8C9F-1C6749BDE2DC', 'Elena', 'Diaz', 'elena.diaz.24@example.com', 'HASHED_PWD', '809-555-0000', '402-0000024-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '281105D5-D354-4F90-8386-0BF3C3829418')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('281105D5-D354-4F90-8386-0BF3C3829418', 'Luis', 'Sanchez', 'luis.sanchez.25@example.com', 'HASHED_PWD', '809-555-0000', '402-0000025-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '74B8FB1E-30E0-4E5E-910F-6135F3B61E49')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('74B8FB1E-30E0-4E5E-910F-6135F3B61E49', 'Elena', 'Alvarez', 'elena.alvarez.26@example.com', 'HASHED_PWD', '809-555-0000', '402-0000026-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EC62D3AE-9453-443E-B25F-66DD7A1A3024')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EC62D3AE-9453-443E-B25F-66DD7A1A3024', 'Francisco', 'Perez', 'francisco.perez.27@example.com', 'HASHED_PWD', '809-555-0000', '402-0000027-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A0BAE369-2D8B-4925-B0EE-B2B46F617342')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A0BAE369-2D8B-4925-B0EE-B2B46F617342', 'Elena', 'Lopez', 'elena.lopez.28@example.com', 'HASHED_PWD', '809-555-0000', '402-0000028-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C7A19BD3-7D0F-4798-BCA3-9212B1E9AB7D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C7A19BD3-7D0F-4798-BCA3-9212B1E9AB7D', 'Jose', 'Gomez', 'jose.gomez.29@example.com', 'HASHED_PWD', '809-555-0000', '402-0000029-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '29BF9DDE-3625-4312-AC98-E9D6296026F7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('29BF9DDE-3625-4312-AC98-E9D6296026F7', 'Antonio', 'Rodriguez', 'antonio.rodriguez.30@example.com', 'HASHED_PWD', '809-555-0000', '402-0000030-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '7303F996-ADD2-4CD1-8E27-89369F823697')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('7303F996-ADD2-4CD1-8E27-89369F823697', 'Laura', 'Perez', 'laura.perez.31@example.com', 'HASHED_PWD', '809-555-0000', '402-0000031-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2C6BAD30-EA19-4279-9A70-8A3359E4CA72')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2C6BAD30-EA19-4279-9A70-8A3359E4CA72', 'Miguel', 'Torres', 'miguel.torres.32@example.com', 'HASHED_PWD', '809-555-0000', '402-0000032-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '06460BD6-5A4D-408B-9DAA-E757C58DD453')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('06460BD6-5A4D-408B-9DAA-E757C58DD453', 'Jose', 'Martinez', 'jose.martinez.33@example.com', 'HASHED_PWD', '809-555-0000', '402-0000033-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BFEA2341-7215-45EA-BB41-EDF2DA346079')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BFEA2341-7215-45EA-BB41-EDF2DA346079', 'Ana', 'Gonzalez', 'ana.gonzalez.34@example.com', 'HASHED_PWD', '809-555-0000', '402-0000034-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'CA4C20ED-FCD2-474D-B1DE-316E446F24C7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('CA4C20ED-FCD2-474D-B1DE-316E446F24C7', 'Miguel', 'Gonzalez', 'miguel.gonzalez.35@example.com', 'HASHED_PWD', '809-555-0000', '402-0000035-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B5BBD698-EF71-454B-9380-F165168EABF6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B5BBD698-EF71-454B-9380-F165168EABF6', 'Francisco', 'Rodriguez', 'francisco.rodriguez.36@example.com', 'HASHED_PWD', '809-555-0000', '402-0000036-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9BFC1589-DFAD-4B07-915E-DE3E34FC5B40')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9BFC1589-DFAD-4B07-915E-DE3E34FC5B40', 'Juan', 'Alvarez', 'juan.alvarez.37@example.com', 'HASHED_PWD', '809-555-0000', '402-0000037-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EDADFC1A-2A05-4346-93CC-BC17FC443B9D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EDADFC1A-2A05-4346-93CC-BC17FC443B9D', 'Elena', 'Fernandez', 'elena.fernandez.38@example.com', 'HASHED_PWD', '809-555-0000', '402-0000038-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A68C0B1A-43D3-4B09-9B63-DEEED6A085CA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A68C0B1A-43D3-4B09-9B63-DEEED6A085CA', 'Luis', 'Fernandez', 'luis.fernandez.39@example.com', 'HASHED_PWD', '809-555-0000', '402-0000039-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '49606361-1D72-4C7E-BC52-54D76A1A6F2E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('49606361-1D72-4C7E-BC52-54D76A1A6F2E', 'Francisco', 'Alvarez', 'francisco.alvarez.40@example.com', 'HASHED_PWD', '809-555-0000', '402-0000040-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'ADAAFACF-42EB-4FAD-B5B6-AA92D1D5516D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('ADAAFACF-42EB-4FAD-B5B6-AA92D1D5516D', 'Miguel', 'Lopez', 'miguel.lopez.41@example.com', 'HASHED_PWD', '809-555-0000', '402-0000041-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '68CDCB71-2D49-4481-B3C3-7710BA506614')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('68CDCB71-2D49-4481-B3C3-7710BA506614', 'Francisco', 'Martinez', 'francisco.martinez.42@example.com', 'HASHED_PWD', '809-555-0000', '402-0000042-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '7FC9E917-FF1D-4E8C-97F1-D9D46521803A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('7FC9E917-FF1D-4E8C-97F1-D9D46521803A', 'Jose', 'Fernandez', 'jose.fernandez.43@example.com', 'HASHED_PWD', '809-555-0000', '402-0000043-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D9DC8A0E-8665-4981-B307-0C76619EF491')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D9DC8A0E-8665-4981-B307-0C76619EF491', 'Antonio', 'Rodriguez', 'antonio.rodriguez.44@example.com', 'HASHED_PWD', '809-555-0000', '402-0000044-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0A0F8E83-8C8F-421E-AC03-2D3D552052FF')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0A0F8E83-8C8F-421E-AC03-2D3D552052FF', 'Maria', 'Fernandez', 'maria.fernandez.45@example.com', 'HASHED_PWD', '809-555-0000', '402-0000045-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '14A31013-7DA5-415A-B0C1-393B0EC8F0D5')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('14A31013-7DA5-415A-B0C1-393B0EC8F0D5', 'Luis', 'Torres', 'luis.torres.46@example.com', 'HASHED_PWD', '809-555-0000', '402-0000046-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9445DEB8-D5F5-4CD7-9328-524F9B1008F7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9445DEB8-D5F5-4CD7-9328-524F9B1008F7', 'Carmen', 'Fernandez', 'carmen.fernandez.47@example.com', 'HASHED_PWD', '809-555-0000', '402-0000047-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C5A651C4-D754-44C2-A154-F50B2792B04F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C5A651C4-D754-44C2-A154-F50B2792B04F', 'Pedro', 'Torres', 'pedro.torres.48@example.com', 'HASHED_PWD', '809-555-0000', '402-0000048-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'AC4DCFB3-8CD4-4207-933B-E98A685FEE9D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('AC4DCFB3-8CD4-4207-933B-E98A685FEE9D', 'Carmen', 'Torres', 'carmen.torres.49@example.com', 'HASHED_PWD', '809-555-0000', '402-0000049-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'AE986FA6-3C2C-4EC2-99F9-16D9B66A8148')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('AE986FA6-3C2C-4EC2-99F9-16D9B66A8148', 'Miguel', 'Gonzalez', 'miguel.gonzalez.50@example.com', 'HASHED_PWD', '809-555-0000', '402-0000050-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0CB5A57D-A6F7-4781-8FFF-093D662EAD7A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0CB5A57D-A6F7-4781-8FFF-093D662EAD7A', 'Francisco', 'Gonzalez', 'francisco.gonzalez.51@example.com', 'HASHED_PWD', '809-555-0000', '402-0000051-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '02AEA315-B5C2-4D67-9147-1A2AE53327D6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('02AEA315-B5C2-4D67-9147-1A2AE53327D6', 'Sofia', 'Rodriguez', 'sofia.rodriguez.52@example.com', 'HASHED_PWD', '809-555-0000', '402-0000052-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FE907AF7-23B8-492A-A11F-81553AB9E647')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FE907AF7-23B8-492A-A11F-81553AB9E647', 'Sofia', 'Romero', 'sofia.romero.53@example.com', 'HASHED_PWD', '809-555-0000', '402-0000053-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6C0255EF-8D70-4159-8BCF-55DA14FD94D2')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6C0255EF-8D70-4159-8BCF-55DA14FD94D2', 'Maria', 'Ruiz', 'maria.ruiz.54@example.com', 'HASHED_PWD', '809-555-0000', '402-0000054-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '7965E0BD-EB36-4634-8692-FB40B47A57CC')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('7965E0BD-EB36-4634-8692-FB40B47A57CC', 'Maria', 'Ruiz', 'maria.ruiz.55@example.com', 'HASHED_PWD', '809-555-0000', '402-0000055-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '79224ABF-FAF3-4715-8767-A07F40367553')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('79224ABF-FAF3-4715-8767-A07F40367553', 'Antonio', 'Gomez', 'antonio.gomez.56@example.com', 'HASHED_PWD', '809-555-0000', '402-0000056-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F83A0441-DDA6-4AE9-896D-4C5F9C8F56FD')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F83A0441-DDA6-4AE9-896D-4C5F9C8F56FD', 'Carmen', 'Romero', 'carmen.romero.57@example.com', 'HASHED_PWD', '809-555-0000', '402-0000057-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '4AA7111D-67E7-4EC2-8BD8-8E188CFC1C33')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('4AA7111D-67E7-4EC2-8BD8-8E188CFC1C33', 'Pedro', 'Rodriguez', 'pedro.rodriguez.58@example.com', 'HASHED_PWD', '809-555-0000', '402-0000058-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '35B83D78-8F7E-4AE8-94D5-350D61C4BFD0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('35B83D78-8F7E-4AE8-94D5-350D61C4BFD0', 'Sofia', 'Torres', 'sofia.torres.59@example.com', 'HASHED_PWD', '809-555-0000', '402-0000059-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '12D0A2D8-1A26-4F53-8077-7E355F868332')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('12D0A2D8-1A26-4F53-8077-7E355F868332', 'Carlos', 'Ruiz', 'carlos.ruiz.60@example.com', 'HASHED_PWD', '809-555-0000', '402-0000060-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D29FD047-C76C-49CF-A12A-5CF69A05526E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D29FD047-C76C-49CF-A12A-5CF69A05526E', 'Sofia', 'Torres', 'sofia.torres.61@example.com', 'HASHED_PWD', '809-555-0000', '402-0000061-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B353A62C-AB2B-4709-89A8-5F1EF1A88569')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B353A62C-AB2B-4709-89A8-5F1EF1A88569', 'Juan', 'Lopez', 'juan.lopez.62@example.com', 'HASHED_PWD', '809-555-0000', '402-0000062-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EE80D932-4E6B-4B35-BD28-36C6F05A0905')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EE80D932-4E6B-4B35-BD28-36C6F05A0905', 'Carlos', 'Perez', 'carlos.perez.63@example.com', 'HASHED_PWD', '809-555-0000', '402-0000063-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '16B4BFAE-7638-42CF-9B66-B4166A27C202')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('16B4BFAE-7638-42CF-9B66-B4166A27C202', 'Maria', 'Alvarez', 'maria.alvarez.64@example.com', 'HASHED_PWD', '809-555-0000', '402-0000064-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C3E5D6BF-3FE3-4E30-9534-F2B82781CBE6')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C3E5D6BF-3FE3-4E30-9534-F2B82781CBE6', 'Laura', 'Martinez', 'laura.martinez.65@example.com', 'HASHED_PWD', '809-555-0000', '402-0000065-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'CD9AF9BE-9CB0-40FC-8347-2854414637AD')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('CD9AF9BE-9CB0-40FC-8347-2854414637AD', 'Carmen', 'Sanchez', 'carmen.sanchez.66@example.com', 'HASHED_PWD', '809-555-0000', '402-0000066-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9A956D43-14DC-4073-A6B8-92128199BFAA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9A956D43-14DC-4073-A6B8-92128199BFAA', 'Pedro', 'Gomez', 'pedro.gomez.67@example.com', 'HASHED_PWD', '809-555-0000', '402-0000067-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '79B7F081-8B8F-44DD-AF55-2C5E49FB776A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('79B7F081-8B8F-44DD-AF55-2C5E49FB776A', 'Francisco', 'Diaz', 'francisco.diaz.68@example.com', 'HASHED_PWD', '809-555-0000', '402-0000068-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '943E33C0-30C0-470B-B458-BD7E0F416911')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('943E33C0-30C0-470B-B458-BD7E0F416911', 'Laura', 'Gomez', 'laura.gomez.69@example.com', 'HASHED_PWD', '809-555-0000', '402-0000069-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BE549320-89D6-408E-B779-981B50EFDEBE')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BE549320-89D6-408E-B779-981B50EFDEBE', 'Pedro', 'Alvarez', 'pedro.alvarez.70@example.com', 'HASHED_PWD', '809-555-0000', '402-0000070-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F13E2865-345C-4137-997C-3D6D6413850E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F13E2865-345C-4137-997C-3D6D6413850E', 'Isabel', 'Perez', 'isabel.perez.71@example.com', 'HASHED_PWD', '809-555-0000', '402-0000071-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D0D0AABF-728F-434E-B535-95404181FF27')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D0D0AABF-728F-434E-B535-95404181FF27', 'Antonio', 'Romero', 'antonio.romero.72@example.com', 'HASHED_PWD', '809-555-0000', '402-0000072-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F4901A5F-CC10-4D99-8393-AB6140B273C0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F4901A5F-CC10-4D99-8393-AB6140B273C0', 'Laura', 'Perez', 'laura.perez.73@example.com', 'HASHED_PWD', '809-555-0000', '402-0000073-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C77E9DEF-AF0A-4AE8-AC12-3C2F2C376AE9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C77E9DEF-AF0A-4AE8-AC12-3C2F2C376AE9', 'Isabel', 'Diaz', 'isabel.diaz.74@example.com', 'HASHED_PWD', '809-555-0000', '402-0000074-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E4E54147-4CC2-4D04-AD30-9360216BF608')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E4E54147-4CC2-4D04-AD30-9360216BF608', 'Miguel', 'Alvarez', 'miguel.alvarez.75@example.com', 'HASHED_PWD', '809-555-0000', '402-0000075-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1292A095-F7DA-434C-A6EF-BE94A34BED7D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1292A095-F7DA-434C-A6EF-BE94A34BED7D', 'Carmen', 'Diaz', 'carmen.diaz.76@example.com', 'HASHED_PWD', '809-555-0000', '402-0000076-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '079E7AF2-25D0-4D89-AC1F-F5669FAF8C01')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('079E7AF2-25D0-4D89-AC1F-F5669FAF8C01', 'Miguel', 'Gomez', 'miguel.gomez.77@example.com', 'HASHED_PWD', '809-555-0000', '402-0000077-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '52D28B67-0D6F-4B26-BF5A-838B2D5EFF44')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('52D28B67-0D6F-4B26-BF5A-838B2D5EFF44', 'Laura', 'Perez', 'laura.perez.78@example.com', 'HASHED_PWD', '809-555-0000', '402-0000078-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C5C426AD-93E0-4E32-A410-2C1965982C9B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C5C426AD-93E0-4E32-A410-2C1965982C9B', 'Elena', 'Torres', 'elena.torres.79@example.com', 'HASHED_PWD', '809-555-0000', '402-0000079-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2910FF40-D03E-4427-8AEC-52C06F2EC2D1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2910FF40-D03E-4427-8AEC-52C06F2EC2D1', 'Miguel', 'Diaz', 'miguel.diaz.80@example.com', 'HASHED_PWD', '809-555-0000', '402-0000080-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1D85FC66-3C19-445B-9454-87D1D4041E96')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1D85FC66-3C19-445B-9454-87D1D4041E96', 'Carmen', 'Alvarez', 'carmen.alvarez.81@example.com', 'HASHED_PWD', '809-555-0000', '402-0000081-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '17681876-3902-4475-8005-B969512E4860')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('17681876-3902-4475-8005-B969512E4860', 'Pedro', 'Martinez', 'pedro.martinez.82@example.com', 'HASHED_PWD', '809-555-0000', '402-0000082-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '65174A32-F540-4687-9204-B3E9FDEB2A4D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('65174A32-F540-4687-9204-B3E9FDEB2A4D', 'Isabel', 'Romero', 'isabel.romero.83@example.com', 'HASHED_PWD', '809-555-0000', '402-0000083-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '3E475EFC-DF79-41DB-AA70-DAAD8EA513D9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('3E475EFC-DF79-41DB-AA70-DAAD8EA513D9', 'Antonio', 'Diaz', 'antonio.diaz.84@example.com', 'HASHED_PWD', '809-555-0000', '402-0000084-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '88410948-FB22-4734-85C7-E16917D11B9F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('88410948-FB22-4734-85C7-E16917D11B9F', 'Carlos', 'Lopez', 'carlos.lopez.85@example.com', 'HASHED_PWD', '809-555-0000', '402-0000085-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EEBB9DB8-6E72-4387-BB1D-3D14EF20D8C0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EEBB9DB8-6E72-4387-BB1D-3D14EF20D8C0', 'Carlos', 'Perez', 'carlos.perez.86@example.com', 'HASHED_PWD', '809-555-0000', '402-0000086-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9BC4BD98-048C-4DF2-85FD-9815CC23F103')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9BC4BD98-048C-4DF2-85FD-9815CC23F103', 'Laura', 'Lopez', 'laura.lopez.87@example.com', 'HASHED_PWD', '809-555-0000', '402-0000087-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F3CD1C4E-DC53-4EC1-8725-2BFAA60EBA92')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F3CD1C4E-DC53-4EC1-8725-2BFAA60EBA92', 'Carmen', 'Gonzalez', 'carmen.gonzalez.88@example.com', 'HASHED_PWD', '809-555-0000', '402-0000088-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '7CCBF785-6ECC-4D93-AE05-26E6987C7ED7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('7CCBF785-6ECC-4D93-AE05-26E6987C7ED7', 'Francisco', 'Fernandez', 'francisco.fernandez.89@example.com', 'HASHED_PWD', '809-555-0000', '402-0000089-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'ADB80434-BAC6-48A5-BF96-D431FE032744')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('ADB80434-BAC6-48A5-BF96-D431FE032744', 'Pedro', 'Romero', 'pedro.romero.90@example.com', 'HASHED_PWD', '809-555-0000', '402-0000090-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F0780F10-1B49-4B13-85FD-4BAC30CDD9E9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F0780F10-1B49-4B13-85FD-4BAC30CDD9E9', 'Maria', 'Martinez', 'maria.martinez.91@example.com', 'HASHED_PWD', '809-555-0000', '402-0000091-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C86E495E-85DA-4ED0-BFBA-3D0FE87C5A48')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C86E495E-85DA-4ED0-BFBA-3D0FE87C5A48', 'Juan', 'Alvarez', 'juan.alvarez.92@example.com', 'HASHED_PWD', '809-555-0000', '402-0000092-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '1CABC20D-95AD-4B4F-9C85-29D668935B5D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('1CABC20D-95AD-4B4F-9C85-29D668935B5D', 'Pedro', 'Alvarez', 'pedro.alvarez.93@example.com', 'HASHED_PWD', '809-555-0000', '402-0000093-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F79D4D38-D2A8-4326-8416-3A11E573A672')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F79D4D38-D2A8-4326-8416-3A11E573A672', 'Francisco', 'Gomez', 'francisco.gomez.94@example.com', 'HASHED_PWD', '809-555-0000', '402-0000094-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '71638179-DC54-4D94-BB4F-A1D5F1ECA7F0')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('71638179-DC54-4D94-BB4F-A1D5F1ECA7F0', 'Pedro', 'Diaz', 'pedro.diaz.95@example.com', 'HASHED_PWD', '809-555-0000', '402-0000095-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'D2455E92-D788-4B03-86F7-F90AFD2A22FD')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('D2455E92-D788-4B03-86F7-F90AFD2A22FD', 'Luis', 'Lopez', 'luis.lopez.96@example.com', 'HASHED_PWD', '809-555-0000', '402-0000096-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '31FBA97B-1F23-4C2D-BE15-4422B12D949F')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('31FBA97B-1F23-4C2D-BE15-4422B12D949F', 'Luis', 'Lopez', 'luis.lopez.97@example.com', 'HASHED_PWD', '809-555-0000', '402-0000097-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '97400E44-427A-4030-9F51-1106B9E39D27')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('97400E44-427A-4030-9F51-1106B9E39D27', 'Pedro', 'Sanchez', 'pedro.sanchez.98@example.com', 'HASHED_PWD', '809-555-0000', '402-0000098-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '02A9D8B3-74BA-480A-8108-FF41DC390D37')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('02A9D8B3-74BA-480A-8108-FF41DC390D37', 'Carlos', 'Alvarez', 'carlos.alvarez.99@example.com', 'HASHED_PWD', '809-555-0000', '402-0000099-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'BDE86734-BABF-43F1-A7E7-4C29D2D947C1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('BDE86734-BABF-43F1-A7E7-4C29D2D947C1', 'Antonio', 'Torres', 'antonio.torres.100@example.com', 'HASHED_PWD', '809-555-0000', '402-0000100-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6BC9F590-11E4-446E-825A-0D5BF9CA0A98')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6BC9F590-11E4-446E-825A-0D5BF9CA0A98', 'Carmen', 'Ruiz', 'carmen.ruiz.101@example.com', 'HASHED_PWD', '809-555-0000', '402-0000101-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6C89D29E-F279-4E57-91EF-03925B392A3A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6C89D29E-F279-4E57-91EF-03925B392A3A', 'Miguel', 'Torres', 'miguel.torres.102@example.com', 'HASHED_PWD', '809-555-0000', '402-0000102-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'A6C8E240-2F92-4962-880A-B08EA4B175B7')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('A6C8E240-2F92-4962-880A-B08EA4B175B7', 'Jose', 'Alvarez', 'jose.alvarez.103@example.com', 'HASHED_PWD', '809-555-0000', '402-0000103-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F73D160C-DCCA-4E69-8DAD-9F3B4B0F089B')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F73D160C-DCCA-4E69-8DAD-9F3B4B0F089B', 'Sofia', 'Alvarez', 'sofia.alvarez.104@example.com', 'HASHED_PWD', '809-555-0000', '402-0000104-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '98D32EDF-02F5-476C-ACFF-B8EBC15AC90A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('98D32EDF-02F5-476C-ACFF-B8EBC15AC90A', 'Elena', 'Ruiz', 'elena.ruiz.105@example.com', 'HASHED_PWD', '809-555-0000', '402-0000105-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F60C1805-468E-4C38-AA35-D054D190A1F4')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F60C1805-468E-4C38-AA35-D054D190A1F4', 'Laura', 'Torres', 'laura.torres.106@example.com', 'HASHED_PWD', '809-555-0000', '402-0000106-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9C51C76F-6ACF-4B30-91C5-6B726E1A32FD')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9C51C76F-6ACF-4B30-91C5-6B726E1A32FD', 'Antonio', 'Lopez', 'antonio.lopez.107@example.com', 'HASHED_PWD', '809-555-0000', '402-0000107-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6CAAB756-BAE7-40CB-96F8-68A88F930C44')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6CAAB756-BAE7-40CB-96F8-68A88F930C44', 'Isabel', 'Diaz', 'isabel.diaz.108@example.com', 'HASHED_PWD', '809-555-0000', '402-0000108-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '445435D1-B41E-4E3E-B305-59537E45FA60')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('445435D1-B41E-4E3E-B305-59537E45FA60', 'Francisco', 'Perez', 'francisco.perez.109@example.com', 'HASHED_PWD', '809-555-0000', '402-0000109-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'E2320BFE-DC60-4990-A094-7464F60CDFDA')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('E2320BFE-DC60-4990-A094-7464F60CDFDA', 'Pedro', 'Rodriguez', 'pedro.rodriguez.110@example.com', 'HASHED_PWD', '809-555-0000', '402-0000110-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'EE65969E-DACB-4EF8-9674-88360ABCBE8A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('EE65969E-DACB-4EF8-9674-88360ABCBE8A', 'Pedro', 'Diaz', 'pedro.diaz.111@example.com', 'HASHED_PWD', '809-555-0000', '402-0000111-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '4002A7A3-6B8F-4F77-8C13-A17AE1296F61')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('4002A7A3-6B8F-4F77-8C13-A17AE1296F61', 'Francisco', 'Torres', 'francisco.torres.112@example.com', 'HASHED_PWD', '809-555-0000', '402-0000112-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '696A43EC-FC67-4669-9F0E-6B6AAC745997')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('696A43EC-FC67-4669-9F0E-6B6AAC745997', 'Luis', 'Torres', 'luis.torres.113@example.com', 'HASHED_PWD', '809-555-0000', '402-0000113-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'F295A8A1-431B-41E1-9A38-8F15D53D8A67')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('F295A8A1-431B-41E1-9A38-8F15D53D8A67', 'Francisco', 'Martinez', 'francisco.martinez.114@example.com', 'HASHED_PWD', '809-555-0000', '402-0000114-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C38C959B-7B5D-460D-8738-07B62133B5AF')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C38C959B-7B5D-460D-8738-07B62133B5AF', 'Antonio', 'Alvarez', 'antonio.alvarez.115@example.com', 'HASHED_PWD', '809-555-0000', '402-0000115-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'ACBFB14A-0649-40AC-BF32-D9AD3F4D92DE')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('ACBFB14A-0649-40AC-BF32-D9AD3F4D92DE', 'Carlos', 'Perez', 'carlos.perez.116@example.com', 'HASHED_PWD', '809-555-0000', '402-0000116-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6C134752-AB1F-41D0-833D-AD00427E3BC9')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6C134752-AB1F-41D0-833D-AD00427E3BC9', 'Laura', 'Ruiz', 'laura.ruiz.117@example.com', 'HASHED_PWD', '809-555-0000', '402-0000117-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FE585C1B-581D-4D53-804B-804A0CD34EEF')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FE585C1B-581D-4D53-804B-804A0CD34EEF', 'Carmen', 'Diaz', 'carmen.diaz.118@example.com', 'HASHED_PWD', '809-555-0000', '402-0000118-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '8C24EB8A-5933-443A-8E83-DFE68CE177AE')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('8C24EB8A-5933-443A-8E83-DFE68CE177AE', 'Laura', 'Sanchez', 'laura.sanchez.119@example.com', 'HASHED_PWD', '809-555-0000', '402-0000119-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B17C447C-46E9-42E6-A2B0-857C7DDE3ED1')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B17C447C-46E9-42E6-A2B0-857C7DDE3ED1', 'Maria', 'Lopez', 'maria.lopez.120@example.com', 'HASHED_PWD', '809-555-0000', '402-0000120-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '272B42BB-FBB6-4F0D-ABF8-774E6A8E84EB')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('272B42BB-FBB6-4F0D-ABF8-774E6A8E84EB', 'Miguel', 'Martinez', 'miguel.martinez.121@example.com', 'HASHED_PWD', '809-555-0000', '402-0000121-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'CA7C5E1C-BA97-44CB-9198-2C82ADF5566C')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('CA7C5E1C-BA97-44CB-9198-2C82ADF5566C', 'Miguel', 'Fernandez', 'miguel.fernandez.122@example.com', 'HASHED_PWD', '809-555-0000', '402-0000122-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6D2A9945-B894-41AF-AC7C-A2714E3ECB8D')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6D2A9945-B894-41AF-AC7C-A2714E3ECB8D', 'Jose', 'Rodriguez', 'jose.rodriguez.123@example.com', 'HASHED_PWD', '809-555-0000', '402-0000123-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '6D195834-5B28-4156-9BAC-7BACAE5EED2E')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('6D195834-5B28-4156-9BAC-7BACAE5EED2E', 'Isabel', 'Fernandez', 'isabel.fernandez.124@example.com', 'HASHED_PWD', '809-555-0000', '402-0000124-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '9C48C052-4907-4D33-9327-4789DF394C42')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('9C48C052-4907-4D33-9327-4789DF394C42', 'Carlos', 'Lopez', 'carlos.lopez.125@example.com', 'HASHED_PWD', '809-555-0000', '402-0000125-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '0E912F03-048E-482F-84BC-59278FCEEA44')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('0E912F03-048E-482F-84BC-59278FCEEA44', 'Ana', 'Alvarez', 'ana.alvarez.126@example.com', 'HASHED_PWD', '809-555-0000', '402-0000126-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'C4A5ECAB-D350-485C-AC67-CAC50B5D4E76')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('C4A5ECAB-D350-485C-AC67-CAC50B5D4E76', 'Antonio', 'Diaz', 'antonio.diaz.127@example.com', 'HASHED_PWD', '809-555-0000', '402-0000127-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FF72359B-872D-4D43-B34E-7838EF871886')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FF72359B-872D-4D43-B34E-7838EF871886', 'Carlos', 'Fernandez', 'carlos.fernandez.128@example.com', 'HASHED_PWD', '809-555-0000', '402-0000128-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'FC321E19-5495-4E3F-B644-BFE01BC2BC03')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('FC321E19-5495-4E3F-B644-BFE01BC2BC03', 'Miguel', 'Torres', 'miguel.torres.129@example.com', 'HASHED_PWD', '809-555-0000', '402-0000129-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '2D28BD4C-08D8-4CF1-A3B1-147D7374F69A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('2D28BD4C-08D8-4CF1-A3B1-147D7374F69A', 'Sofia', 'Fernandez', 'sofia.fernandez.130@example.com', 'HASHED_PWD', '809-555-0000', '402-0000130-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '67BE4B48-59CE-4675-9C94-DF84DB395B84')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('67BE4B48-59CE-4675-9C94-DF84DB395B84', 'Luis', 'Rodriguez', 'luis.rodriguez.131@example.com', 'HASHED_PWD', '809-555-0000', '402-0000131-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '46BCD066-057F-49DA-B2B5-B675FDBD61A3')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('46BCD066-057F-49DA-B2B5-B675FDBD61A3', 'Sofia', 'Lopez', 'sofia.lopez.132@example.com', 'HASHED_PWD', '809-555-0000', '402-0000132-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '82D1B9CD-2DC4-4048-A1A2-3CC27D299060')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('82D1B9CD-2DC4-4048-A1A2-3CC27D299060', 'Maria', 'Perez', 'maria.perez.133@example.com', 'HASHED_PWD', '809-555-0000', '402-0000133-1');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '3EA413F0-3194-4EFB-8A2E-04EACA4BCD05')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('3EA413F0-3194-4EFB-8A2E-04EACA4BCD05', 'Maria', 'Torres', 'maria.torres.134@example.com', 'HASHED_PWD', '809-555-0000', '402-0000134-1');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'B5586726-67C0-454B-9BCF-BE94D5D6A8D8')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas, PerfilId) VALUES ('B5586726-67C0-454B-9BCF-BE94D5D6A8D8', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0, '0E82F5EE-BEFA-46E6-835B-9E556F1A6FBC');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = 'B5586726-67C0-454B-9BCF-BE94D5D6A8D8')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('B5586726-67C0-454B-9BCF-BE94D5D6A8D8', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '460EA2B7-B152-463E-BB0B-886DE319F9AB')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas, PerfilId) VALUES ('460EA2B7-B152-463E-BB0B-886DE319F9AB', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0, '0E82F5EE-BEFA-46E6-835B-9E556F1A6FBC');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '460EA2B7-B152-463E-BB0B-886DE319F9AB')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('460EA2B7-B152-463E-BB0B-886DE319F9AB', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '405B8915-D543-4672-B02A-49C79CC0F652')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas, PerfilId) VALUES ('405B8915-D543-4672-B02A-49C79CC0F652', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0, '0E82F5EE-BEFA-46E6-835B-9E556F1A6FBC');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '405B8915-D543-4672-B02A-49C79CC0F652')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('405B8915-D543-4672-B02A-49C79CC0F652', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '55133466-EB95-4CDA-BE55-C3AB524B5C1A')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas, PerfilId) VALUES ('55133466-EB95-4CDA-BE55-C3AB524B5C1A', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0, '0E82F5EE-BEFA-46E6-835B-9E556F1A6FBC');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '55133466-EB95-4CDA-BE55-C3AB524B5C1A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('55133466-EB95-4CDA-BE55-C3AB524B5C1A', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0');
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '909ADD8F-66E7-4D23-BD42-2F34D628212A')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas, PerfilId) VALUES ('909ADD8F-66E7-4D23-BD42-2F34D628212A', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0, '0E82F5EE-BEFA-46E6-835B-9E556F1A6FBC');
IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '909ADD8F-66E7-4D23-BD42-2F34D628212A')
INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('909ADD8F-66E7-4D23-BD42-2F34D628212A', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0');
