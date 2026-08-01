-- Seed for PlanSuscripcion to prevent Foreign Key errors when seeding Usuario

SET NOCOUNT ON;

SET QUOTED_IDENTIFIER ON;



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '99999999-9999-9999-9999-999999999999')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido)

    VALUES ('99999999-9999-9999-9999-999999999999', 'Administrador', 0.00, 1, -1, -1, 1, 1);



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '5F1F3417-402F-4CAC-AE39-F9802A5E72D2')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido)

    VALUES ('5F1F3417-402F-4CAC-AE39-F9802A5E72D2', 'Consultor', 0.00, 0, 1, 1, 0, 0);



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '66AFDABF-632E-434C-86F4-6F9060D2656F')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido)

    VALUES ('66AFDABF-632E-434C-86F4-6F9060D2656F', 'Profesional', 60.00, 0, 25, 5, 1, 1);



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '41037268-58B6-40A3-A8AE-C18EFE00C7D3')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido)

    VALUES ('41037268-58B6-40A3-A8AE-C18EFE00C7D3', 'Empresa', 170.00, 1, 100, 10, 1, 1);



IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = 'F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4')

    INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, PresentacionPublica, QrIncluido)

    VALUES ('F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4', 'Corporativo', 500.00, 1, -1, 50, 1, 1);

GO

