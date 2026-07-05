-- Seed for PlanSuscripcion
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9')
INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, MultiUsuario, PresentacionPublica, QrIncluido) VALUES ('536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9', 'Freemium', 0.0, 1, 100, 10, 1, 1, 1);
IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = 'B704881E-AC38-436B-A81B-FA9374542C77')
INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, MultiUsuario, PresentacionPublica, QrIncluido) VALUES ('B704881E-AC38-436B-A81B-FA9374542C77', 'Intermedio', 1000.0, 1, 100, 10, 1, 1, 1);
IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '93350FC6-6A0C-4EB2-BD4D-A605ECF7DA03')
INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, MultiUsuario, PresentacionPublica, QrIncluido) VALUES ('93350FC6-6A0C-4EB2-BD4D-A605ECF7DA03', 'Company', 2500.0, 1, 100, 10, 1, 1, 1);
IF NOT EXISTS (SELECT 1 FROM PlanSuscripcion WHERE Idsuscripcion = '95A53EFA-37CD-40E0-949F-E7E63D39FCF0')
INSERT INTO PlanSuscripcion (Idsuscripcion, NombrePlan, Precio, AccesoApi, MaxConsultas, MaxProyectos, MultiUsuario, PresentacionPublica, QrIncluido) VALUES ('95A53EFA-37CD-40E0-949F-E7E63D39FCF0', 'Enterprise', 5000.0, 1, 100, 10, 1, 1, 1);
