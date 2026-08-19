-- Seed for PlanSuscripcion to prevent Foreign Key errors when seeding Usuario

SET NOCOUNT ON;

SET QUOTED_IDENTIFIER ON;



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '99999999-9999-9999-9999-999999999999')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido, DefaultPerfilId)

    VALUES ('99999999-9999-9999-9999-999999999999', 'Administrador', 0.00, 1, -1, -1, 1, 1, '145672C7-646C-4DB8-917B-F470C12CD645');



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '5F1F3417-402F-4CAC-AE39-F9802A5E72D2')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido, DefaultPerfilId)

    VALUES ('5F1F3417-402F-4CAC-AE39-F9802A5E72D2', 'Consultor', 0.00, 0, 1, 1, 0, 0, '8ADB33EC-81E8-4C39-AFAF-466ED024B6F5');



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '66AFDABF-632E-434C-86F4-6F9060D2656F')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido, DefaultPerfilId)

    VALUES ('66AFDABF-632E-434C-86F4-6F9060D2656F', 'Profesional', 60.00, 0, 25, 5, 1, 1, '1F14C07F-E1AE-4C44-BA0B-B8EA36BC841C');



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '41037268-58B6-40A3-A8AE-C18EFE00C7D3')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido, DefaultPerfilId)

    VALUES ('41037268-58B6-40A3-A8AE-C18EFE00C7D3', 'Empresa', 170.00, 1, 100, 10, 1, 1, '196AF7D7-7984-4A15-90E6-D21EB61852A9');



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = 'F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido, DefaultPerfilId)

    VALUES ('F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4', 'Corporativo', 500.00, 1, -1, 50, 1, 1, '145672C7-646C-4DB8-917B-F470C12CD645');

GO

