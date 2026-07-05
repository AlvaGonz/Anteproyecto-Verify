-- Seed for DGII
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02601322098')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02601322098', 'ALBA ALEJANDRA GERMAN LUIS', '', '', '', 'ACTIVO', 'LIMPIEZA DE CASAS O APARTAMENT', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00300749256')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00300749256', 'CASTALIO LEONIDAS RUIZ SANTANA', 'MOTO PRESTAMO LA SOMBRA', '', '', 'ACTIVO', 'PRÉSTAMO DE DINERO FUERA DEL S', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600787341')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600787341', 'WARREN ADOLFO PEGUERO ROLLINS', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE CONSULTORES EN IN', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00800235491')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00800235491', 'JUAN CARLOS HERNANDEZ MARIANO', '', '', '', 'ACTIVO', 'MANTENIMIENTO Y REPARACIÓN DEL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600649111')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600649111', 'CARLOS ALBERTO CRUZ ALTAGRACIA', '', '', '', 'ACTIVO', 'INGENIERO MECANICO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00800131252')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00800131252', 'DEMILIS FRANSUA YUDEPH', 'TAISON', '', '', 'SUSPENDIDO', 'MANTENIMIENTO Y REPARACIÓN DEL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00300092947')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00300092947', 'PABLO LARA', '', '', '', 'ACTIVO', 'CULTIVO DE CEBOLLA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00300120011')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00300120011', 'JUAN ONERIS FERMIN GUZMAN', 'CAFETERIA ONESI', '', '', 'ACTIVO', 'SERVICIOS DE BARES Y CONFITERÍ', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02800449619')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02800449619', 'JUAN MOJICA RODRIGUEZ', '', '', '', 'ACTIVO', 'SERVICIOS INMOBILIARIOS REALIZ', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03100536345')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03100536345', 'YSAIAS RANDOL ALMONTE PALLERO', '', '', '', 'SUSPENDIDO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00300010592')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00300010592', 'PEDRO ELEUTERIO REYES PIMENTEL', '', '', '', 'SUSPENDIDO', 'OPERACIONES VEHICULOS DE MOTOR', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00300685070')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00300685070', 'LUIS MANUEL ARIAS DE LA CRUZ', 'TIENDA Y MUEBLERIA ARIAS', '', '', 'ACTIVO', 'VENTA DE MUEBLES Y ENSERES DOM', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000144103')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000144103', 'RAFAEL GERALDO RAMIREZ MEJIA', 'COMERCIAL NAROJIMA', '', '', 'ACTIVO', 'ELABORACIÓN DE GALLETITAS Y BI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01100294907')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01100294907', 'LEIDY  SANCHEZ AQUINO', '', '', '', 'ACTIVO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04800058424')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04800058424', 'JUAN CEPEDA MARMOL', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE PAPEL, C', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01100168655')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01100168655', 'RAFAEL VARGAS MELO', '', '', '', 'ACTIVO', 'SERVICIOS DE PUBLICIDAD', '', '', 'RST', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01200428835')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01200428835', 'JOSE MANUEL MONERO RODRIGUEZ', '', '', '', 'SUSPENDIDO', 'SERVICIOS JURÍDICOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01200488201')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01200488201', 'ARCADIO ALCANTARA DE LOS SANTOS', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE PARTES,', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01200491122')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01200491122', 'MILCIADES RAMIREZ FAMILIA', '', '', '', 'ACTIVO', 'BANCAS DE APUESTAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03105009033')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03105009033', 'MIGUEL ARIEL AVILA', 'AVILACELL GROUP BY MIGUEL ARIEL', '', '', 'ACTIVO', 'REPARACION Y/O VENTA DE CELULA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01200476925')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01200476925', 'MELQUIADES VALDEZ', '', '', '', 'ACTIVO', 'CULTIVO DE LEGUMBRES FRESCAS (', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01200778163')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01200778163', 'FREDDY TAVERAS VALENZUELA', '', '', '', 'ACTIVO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01200016747')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01200016747', 'WASCAR ELIAS DE POOL LAPAIX', '', '', '', 'SUSPENDIDO', 'CONSTRUCCIÓN, REFORMA Y REPARA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03103450403')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03103450403', 'SOFANNY YUDELKA GUTIERREZ FERNANDEZ', '', '', '', 'SUSPENDIDO', 'SERVICIO DE TRANSPORTE ESCOLAR', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04700082359')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04700082359', 'JOSE JOAQUIN GOMEZ SALCEDO', '', '', '', 'SUSPENDIDO', 'FABRICACIÓN DE MEDICAMENTOS DE', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03700775897')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03700775897', 'LICETTE ANICO', 'JK ANICO VARIEDADES', '', '', 'SUSPENDIDO', 'VENTA AL POR MAYOR DE ROPA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03300367749')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03300367749', 'REYES FRANCISCO DE HURTADO', 'MERCADITO HURTADO', '', '', 'ACTIVO', 'VENTA AL POR MENOR DE FRUTAS,', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03103587725')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03103587725', 'CARLOS BISMARK UREÑA DAMIAN', '', '', '', 'ACTIVO', 'PINTURA Y TRABAJOS DE DECORACI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01300044672')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01300044672', 'MANUEL ANTONIO ARIAS', 'COMPRA VENTA Y MOTO PRESTAMOS EL MELLO', '', '', 'ACTIVO', 'SERVICIOS DE CRÉDITO N.C.P. (I', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01300328463')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01300328463', 'RICART BIENVENIDO CASADO PEÑA', '', '', '', 'ACTIVO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03104911700')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03104911700', 'CARLOS ARIEL RAMIREZ CUEVAS', 'CARLOS ARIEL RAMIREZ CUEVAS', '', '', 'SUSPENDIDO', 'REMODELACIÓN O RENOVACIÓN DE E', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000517001')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000517001', 'MANUEL OSIRIS MENDEZ MATOS', '', '', '', 'SUSPENDIDO', 'PINTURA Y TRABAJOS DE DECORACI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000335818')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000335818', 'RUSBER PINEDA', '', '', '', 'ACTIVO', 'VENTA AL POR MAYOR DE BEBIDAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000069680')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000069680', 'DESPRADEL MARTE COMAS', '', '', '', 'ACTIVO', 'PRODUCCION DE BANANA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000393460')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000393460', 'MAURICIO MENDEZ FIGUEREO', '', '', '', 'ACTIVO', 'PRODUCCION DE BANANA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000593606')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000593606', 'MILTON ANTONIO ARIAS CALDERON', 'TROFEOS SAN CRISTOBAL', '', '', 'SUSPENDIDO', 'FABRICACIÓN DE PRODUCTOS METÁL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03800166112')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03800166112', 'RANDY VARGAS REYES', '', '', '', 'ACTIVO', 'VENTA AL POR MAYOR DE BEBIDAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01300185632')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01300185632', 'WILFREDO KENNEDY ROSSIS', '', '', '', 'ACTIVO', 'CULTIVO DE BULBOS, BROTES, RAÍ', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01300187836')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01300187836', 'CORNELIO MINYETY DIAZ', '', '', '', 'ACTIVO', 'CULTIVO DE TOMATE', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800178251')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800178251', 'MOISES LOPEZ PEREZ', '', '', '', 'ACTIVO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800305128')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800305128', 'MILCIADES FELIZ ENCARNACION', 'HORACERODIGITAL.NET', '', '', 'ACTIVO', 'SERVICIOS DE PUBLICIDAD', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800438176')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800438176', 'LUIS ERNESTO ESPINOSA MATOS', 'SOLUCIONES ELECTRICAS ESPINOSA DE PAZ', '', '', 'SUSPENDIDO', 'SERVICIOS DE ELECTROMECANICA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05601539603')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05601539603', 'LEONIDAS CASTRO RODRIGUEZ', '', '', '', 'ACTIVO', 'ARQUITECTOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05400245113')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05400245113', 'JOSE DEL CARMEN CAMACHO LIZARDO', 'IDEAL SABATINO', '', '', 'ACTIVO', 'SERVICIOS DE PUBLICIDAD', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05601141707')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05601141707', 'MARLENNY SANTOS ZORRILLA', '', '', '', 'ACTIVO', 'ENSEÑANZA INICIAL Y PRIMARIA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800026799')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800026799', 'VICTOR TOMAS MATOS', 'SERVICIOS DE MANTENIMIENTO MECANICO', '', '', 'SUSPENDIDO', 'MANTENIMIENTO Y REPARACIÓN DEL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800081703')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800081703', 'EDDY LEANDRO CUELLO CASTILLO', 'REFRIELECTRICA EDDY', '', '', 'SUSPENDIDO', 'REPARACIÓN Y VENTAS DE ARTÍCUL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05400610779')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05400610779', 'FABIO ANTONIO LIZARDO PERALTA', '', '', '', 'ACTIVO', 'CONSTRUC. REFORMA Y REPARACIÓN', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04800781371')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04800781371', 'ELPIDIO PABLO TORRES CRUZ', '', '', '', 'ACTIVO', 'DRENAJE DE LOS PRODUCTOS AGRÍC', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02000106373')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02000106373', 'JUSTINO FELIZ PEREZ', 'COLMADO JUSTINO', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800493627')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800493627', 'FRAN EMILIO SUAREZ PEREZ', 'FABRICA Y VENTA DE ATAUDES SUAREZ', '', '', 'ACTIVO', 'FABRICACIÓN DE PUERTAS Y VENTA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01800488742')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01800488742', 'EDISON BOLIVAR ALCANTARA SOTO', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE INGENIEROS CIVILE', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02000142451')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02000142451', 'UANDER YONJAIRO SENA', '', '', '', 'SUSPENDIDO', 'EMPLEADOS (ASALARIADOS)', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300831696')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300831696', 'FRANCISCO ALONSO DE LA ROSA BAEZ', 'SUPLIDORA DE LA ROSA', '', '', 'SUSPENDIDO', 'VENTA DE ARTICULOS DE BELLEZA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300658313')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300658313', 'PERFECTO IGNACIO JIMENEZ GUZMAN', '', '', '', 'SUSPENDIDO', 'EMPLEADOS (ASALARIADOS)', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300185069')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300185069', 'FLORANGEL MARTE', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE PELUQUERÍA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02200155980')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02200155980', 'ELIFERBO HERASME DIAZ', 'DRINK MI ESCUELITA', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE BEBIDAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300260862')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300260862', 'RUBEN LIRIANO PERALTA', 'MOTO REPUESTO EL GUARAGUAO', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE PARTES,', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300004989')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300004989', 'JOSE DOLORES MOTA MEDINA', '', '', '', 'ACTIVO', 'SERVICIOS DE TRANSPORTE DE MER', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01600015570')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01600015570', 'BRAULINO PERDOMO ENCARNACION', '', '', '', 'ACTIVO', 'POMPAS FÚNEBRES Y SERVICIOS CO', '', '', 'RST', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '07200107162')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('07200107162', 'JUAN CRISOTOMO PEREZ ESPINAL', 'PRODUCTO PARA LA HIGIENE TAINOS', '', '', 'SUSPENDIDO', 'FABRICACIÓN DE PREPARADOS PARA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '06500044935')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('06500044935', 'MIGUEL ANGEL DE CASTRO COPLIN', '', '', '', 'SUSPENDIDO', 'REPARACIÓN Y PINTURA DE CARROC', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '07100329247')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('07100329247', 'ALFREDO OZORIA ESPINO', '', '', '', 'ACTIVO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01300262415')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01300262415', 'MELQUIS SEDED MORDAN SANCHEZ', '', '', '', 'SUSPENDIDO', 'BANCAS DE APUESTAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01500008915')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01500008915', 'ANA TIVIDAD BERIHUETE ROSARIO', '', '', '', 'ACTIVO', 'SERVICIOS INMOBILIARIOS REALIZ', '', '', 'RST', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02500080532')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02500080532', 'NATALIO SOLANO SOSA', 'SOLANO Y ASOCIADOS', '', '', 'ACTIVO', 'CULTIVO DE OLEAGINOSAS N.C.P.', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02500311176')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02500311176', 'MIGUEL ALEXANDER ABAD DE PEÑA', '', '', '', 'SUSPENDIDO', 'LAVADO AUTOMÁTICO Y MANUAL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02400149015')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02400149015', 'RUDDY DIAZ SANCHEZ', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE PELUQUERÍA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02500274044')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02500274044', 'CARLOS RAMON JOSE GUZMAN DIAZ', '', '', '', 'SUSPENDIDO', 'MANTENIMIENTO Y REPARACIÓN DEL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02500275660')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02500275660', 'MOISES LIMA COTES', '', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02500279522')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02500279522', 'RADHAMES ANTONIO MEJIA MERCEDES', '', '', '', 'ACTIVO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02700028042')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02700028042', 'NICOLAS MATA NIEVES', '', '', '', 'ACTIVO', 'SERVICIOS JURÍDICOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02400199689')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02400199689', 'ALEXANDRO ROJAS ROSARIO', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE TRANSPORTE DE MER', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600256875')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600256875', 'ANA VIRGINIA ASTACIO CARABALLO', '', '', '', 'ACTIVO', 'EMPLEADOS (ASALARIADOS)', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600226506')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600226506', 'HECTOR PACHE', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE BATERÍAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600290171')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600290171', 'SAMUEL ENRIQUE DE LOS SANTOS PEÑA', '', '', '', 'SUSPENDIDO', 'SERVICIOS JURÍDICOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600022640')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600022640', 'YUDELQUIS CEDEÑO', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE ROPA INT', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600359224')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600359224', 'EURIPIDES SANTIAGO RODRIGUEZ PACHANO', '', '', '', 'ACTIVO', 'ARQUITECTOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '22500099829')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('22500099829', 'STEPHANIE ROSSEL RUIZ CABRAL', 'JAYLAST TALLER CREATIVO', '', '', 'ACTIVO', 'IMPRESIÓN DIRECTA SOBRE MATERI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02800409373')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02800409373', 'JULIO CESAR RODRIGUEZ SANTANA', 'PANADERIA HARLEN', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE PAN Y PR', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300653439')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300653439', 'NARDA IVELISSE RIJO GONZALEZ', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE ROPA INT', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300845159')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300845159', 'ARACELIS ALTAGRACIA GUZMAN SILVESTRE', '', '', '', 'SUSPENDIDO', 'BOUTIQUES', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '06000149762')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('06000149762', 'RAFAEL AMPARO GUZMAN', 'MINI MARKET TAINO', '', '', 'ACTIVO', 'CONSTRUCCIÓN DE VIVIENDAS UNIF', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600697839')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600697839', 'LUCAS LIZARDO CASTRO', '', '', '', 'ACTIVO', 'SERVICIOS DE CRÉDITO N.C.P. (I', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300684392')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300684392', 'CARLOS MANUEL PUJOLS PUJOLS', '', '', '', 'SUSPENDIDO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300686876')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300686876', 'JOSE ANTONIO ALMANZAR', '', '', '', 'ACTIVO', 'SERVICIO DE TRANSPORTE URBANO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600700112')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600700112', 'ELIAS GARCIA LOPEZ', '', '', '', 'ACTIVO', 'INSTRUCCIÓN EN HABILIDADES PAR', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02300911290')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02300911290', 'NORIA JOSEPH BREDI DE MALDONADO', '', '', '', 'ACTIVO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02301114878')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02301114878', 'DEMOSTENES FERNANDEZ CARRASCO', '', '', '', 'ACTIVO', 'CENTROS DE TELECOMUNICACIONES', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600957266')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600957266', 'ARIEL ZACARIAS BELTRE RIJO', '', '', '', 'SUSPENDIDO', 'CORREDORES DE SEGUROS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02301099681')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02301099681', 'SAUL SORIANO SABINO', 'CENTRO ACADEMICO NEW LIFE INSTITUTE', '', '', 'ACTIVO', 'ENSEÑANZA  TERCIARIA(ESCUELA O', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02301175663')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02301175663', 'ORLANDO QUEZADA UBIERA', 'SUPER COLMADO ORLANDO', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600745430')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600745430', 'BRAULIO SOTO CHALAS', '', '', '', 'ACTIVO', 'FABRICACIÓN DE CERRADURAS, HER', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03101021529')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03101021529', 'ALEJANDRO ALBERTO TRINIDAD POLANCO', 'CENTRO DE RADIOGRAFIA & SONOGRAFIA RADYUSI', '', '', 'SUSPENDIDO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02700226836')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02700226836', 'NICOLAS PEGUERO SOSA', 'D NICOLAS INMOBILIARIA', '', '', 'SUSPENDIDO', 'SERVICIOS INMOBILIARIOS REALIZ', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02700204213')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02700204213', 'RADHAMES MOTA MAURICIO', '', '', '', 'SUSPENDIDO', 'ELABORACIÓN DE QUESOS (INCL. L', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02800122810')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02800122810', 'JUAN DE LOS SANTOS GUERRERO', '', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02700304542')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02700304542', 'RAYMUNDO UBIERA SANTANA', '', '', '', 'SUSPENDIDO', 'REPARACIÓN Y VENTAS DE ARTÍCUL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02700229624')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02700229624', 'CRISTINA VILLA CEDEÑO', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE PELUQUERÍA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00100980044')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00100980044', 'FRANCIS ERNESTO ROMAN GONZALEZ', '', '', '', 'SUSPENDIDO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600098749')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600098749', 'SIGFRIDO DE REGLA SUAZO GUERRERO', '', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02600738815')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02600738815', 'JUANA AVILA SANTANA', '', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00101490589')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00101490589', 'EWALD THEODORE HEINSEN BOGAERT', '', '', '', 'ACTIVO', 'RENTISTAS DE VALORES MOBILIARI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02800098986')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02800098986', 'JUANA RICHIEZ CASTILLO', '', '', '', 'ACTIVO', 'BANCAS DEPORTIVAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00106564305')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00106564305', 'SIXTO EDUARDO MELO ORTIZ', 'COLMADO MELO', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00105521942')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00105521942', 'VALENTINA  MOREL TEJADA', 'A Y M  AUTO PAINT', '', '', 'ACTIVO', 'VENTA AL POR MENOR DE PINTURAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00300911286')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00300911286', 'JUAN ADALBERTO FRANJUL DE LEON', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE PRODUCTO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00500310925')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00500310925', 'DANY HERNANDEZ TINEO', 'CINTURONES VASQUEZ', '', '', 'SUSPENDIDO', 'SASTRERÍAS, ATELIER', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05600811540')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05600811540', 'SANTANA MUÑOZ MARTINEZ', 'SANTANA COMERCIAL', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '08600006467')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('08600006467', 'RAFAEL ANTONIO GUZMAN TORRES', 'RESTAURANT JOSE MANUEL', '', '', 'ACTIVO', 'SERVICIOS DE RESTAURANTES Y CA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00114609647')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00114609647', 'ALEJANDRO SWENEY UBRI', 'RALE AUTO PARTS', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE PARTES,', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00108116245')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00108116245', 'MARIA MARGARITA MORENO DE JESUS', '', '', '', 'ACTIVO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'RST', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00116974262')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00116974262', 'ALFREDO MOISES SEBASTIAN GUTIERREZ', '', '', '', 'ACTIVO', 'EMPLEADOS Y OBREROS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00101833069')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00101833069', 'JUAN BAUTISTA SUERO SUERO', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MAYOR DE MATERIAL', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00101421048')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00101421048', 'ROSELIO SANTOS ORTIZ', '', '', '', 'ACTIVO', 'ELABORACIÓN DE GALLETITAS Y BI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '06100162194')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('06100162194', 'SAMUEL DARIO BRITO PERDOMO', 'FUNERARIA DAHINEL', '', '', 'SUSPENDIDO', 'POMPAS FÚNEBRES Y SERVICIOS CO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03103375576')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03103375576', 'CARLOS MANUEL BULDIE COLLADO', '', '', '', 'SUSPENDIDO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00101486819')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00101486819', 'CRISTINA ALEJANDRA A VIAU RODRIGUEZ', '', '', '', 'ACTIVO', 'VENTA AL POR MENOR DE ARTÍCULO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00110945565')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00110945565', 'RAMON HUMBERTO RODRIGUEZ FORTUNA', 'COMPRAVENTA FORTUNA', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00500328315')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00500328315', 'PEDRO ANTONIO TINEO NUÑEZ', 'DISTRIBUIDORA ATLANTIC', '', '', 'ACTIVO', 'ELABORACIÓN INDUSTRIAL DE PROD', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '02800962900')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('02800962900', 'EMMANUEL CARPIO RUIZ', 'FARMACIA SAN FRANCISCO', '', '', 'ACTIVO', 'SERVICIOS INMOBILIARIOS REALIZ', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03100789423')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03100789423', 'ISI MARIA VALERIO LEDESMA DE CEBALLOS', '', '', '', 'SUSPENDIDO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03700791878')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03700791878', 'MARCOS AMAURY SANTOS PERALTA', 'AMAURY GIFT SHOP', '', '', 'ACTIVO', 'VENTA AL POR MENOR DE ARTÍCULO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03200139537')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03200139537', 'VICTOR RAFAEL VASQUEZ VASQUEZ', '', '', '', 'ACTIVO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04701138788')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04701138788', 'MERCEDES ANTONIA PATRIA SUERO GARCIA', '', '', '', 'ACTIVO', 'SERVICIOS JURÍDICOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '01000648863')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('01000648863', 'EUDOCIO RAMIREZ DIAZ', 'NERLOGISTIC COMERCIAL', '', '', 'SUSPENDIDO', 'VENTA AL POR MAYOR DE PARTES,', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05400664107')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05400664107', 'JESUS MARIA MARTINEZ CHALAS', '', '', '', 'SUSPENDIDO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05401484810')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05401484810', 'FRANCISCO ALBERTO CAMACHO GONZALEZ', '', '', '', 'ACTIVO', 'PRODUCCION DE BANANA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04600345161')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04600345161', 'DARIEL DANILO AGUILERA GOMEZ', '', '', '', 'ACTIVO', 'SERVICIOS DE TRANSPORTE DE ANI', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04900203524')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04900203524', 'MARIA DEL CARMEN ROSARIO PAULINO', 'COLMADO BETRY DEKMI RODRIGUEZ', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '40221828144')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('40221828144', 'HECTOR ISRAEL NUÑEZ PILIER', '', '', '', 'SUSPENDIDO', 'CONSTR. REFORMA Y REPARACIÓN D', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '06600212416')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('06600212416', 'FELIX ERISBEL MELENDEZ ACOSTA', '', '', '', 'ACTIVO', 'INGENIERÍA DE SISTEMAS Y DE SE', '', '', 'RST', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00100775519')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00100775519', 'FELIX ANTONIO ARIAS PEÑA ARIAS PE¥A', '', '', '', 'ACTIVO', 'ACTIVIDADES DE CHOFERES, CUIDA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '530295391')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('530295391', 'HAIHUA LIU', '', '', '', 'ACTIVO', 'VENTA AL POR MENOR DE ARTÍCULO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05600238207')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05600238207', 'DIGNA MARIA MEJIA FERREIRA', 'CREACIONES DIGNALIS', '', '', 'ACTIVO', 'CONFECCIÓN DE INDUMENTARIA DE', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '40225448246')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('40225448246', 'FRANK NARY BRIOSO ROSA', 'FRANK NARY BAR Y BILLAR', '', '', 'ACTIVO', 'SERVICIOS DE SALONES DE JUEGOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '40214824779')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('40214824779', 'HECTOR EDWARDO GONZALEZ PADILLA', 'SMART KING', '', '', 'ACTIVO', 'VENTA AL POR MAYOR DE MÁQUINAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '40211899345')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('40211899345', 'CRISANNI MANUELA QUIÑONES', 'CYD QUIÑONES VARIEDADES', '', '', 'ACTIVO', 'VENTA AL POR MENOR DE PRENDAS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '08500065704')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('08500065704', 'GENARO PEGUERO DIAZ', '', '', '', 'SUSPENDIDO', 'SERVICIOS DE PUBLICIDAD', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '11500013575')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('11500013575', 'VIRGILIO JIMENEZ MEZON', 'CAFETERIA LOS FLACOS', '', '', 'ACTIVO', 'SERVICIOS RELACIONADOS CON LA', '', '', 'RST', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03100866189')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03100866189', 'DEMETRIO ANTONIO ESPINAL', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE ARTÍCULO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03102280363')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03102280363', 'RICARDO ADRIANO TORRES BAEZ', 'COLMADO ESTEVEZ', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '04900337447')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('04900337447', 'JUAN MENDOZA FRANCISCO', 'COLMADO PILARTE II', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03700065190')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03700065190', 'GRACIANO SANCHEZ SEVERINO', 'COLMADO LEOCADIO', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '05200023223')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('05200023223', 'SANTIAGO DE JESUS VARGAS ORTEGA', 'DIAZ Y VARGAS ASOCIADOS', '', '', 'SUSPENDIDO', 'SERVICIOS JURÍDICOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03103719989')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03103719989', 'OMAR ANTONIO NUÑEZ VIDAL', '', '', '', 'SUSPENDIDO', 'SERVICIOS PERSONALES EN GENERA', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03700281003')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03700281003', 'JUAN REYES CHEBALIER', 'COLMADO KARINA', '', '', 'SUSPENDIDO', 'COLMADOS', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '00100129410')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('00100129410', 'ZUNILDA MILAGROSA FERMIN PEREZ', 'ZUNIFLOR', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE FLORES Y', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '03200234197')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('03200234197', 'JOSE LUIS DE JESUS DIAZ DESCHAMPS', '', '', '', 'SUSPENDIDO', 'VENTA AL POR MENOR DE ARTÍCULO', '', '', 'NORMAL', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '09300255669')
INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('09300255669', 'FRANCISCO ANDUJAR', '', '', '', 'SUSPENDIDO', 'MANTENIMIENTO Y REPARACIÓN DEL', '', '', 'NORMAL', GETUTCDATE());
