import os
import uuid
import random
from datetime import datetime, timedelta

def generate_guids(n):
    return [str(uuid.uuid4()).upper() for _ in range(n)]

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, str):
        return f"'{val.replace(chr(39), chr(39)+chr(39))}'"
    return str(val)

def main():
    output_dir = "src/backend/Tools/DbSeeder/Scripts"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Plans (PlanSuscripcion) - Using DB GUIDs
    plans = [
        {"id": "5F1F3417-402F-4CAC-AE39-F9802A5E72D2", "name": "Freemium", "price": 0.0},
        {"id": "66AFDABF-632E-434C-86F4-6F9060D2656F", "name": "Intermedio", "price": 1000.0},
        {"id": "41037268-58B6-40A3-A8AE-C18EFE00C7D3", "name": "Company", "price": 2500.0},
        {"id": "F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4", "name": "Enterprise", "price": 5000.0}
    ]
    # We do NOT generate 01_PlanSuscripcion.sql because these plans are already seeded by EF Core.

    # Roles / Perfiles
    perfil_ids = generate_guids(5)
    perfiles = [
        {"id": perfil_ids[0], "name": "Freemium User"},
        {"id": perfil_ids[1], "name": "Intermediate User"},
        {"id": perfil_ids[2], "name": "Company Admin"},
        {"id": perfil_ids[3], "name": "Enterprise Admin"},
        {"id": perfil_ids[4], "name": "Invitee"}
    ]
    with open(f"{output_dir}/02_Perfiles.sql", "w") as f:
        f.write("-- Seed for Perfiles\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for p in perfiles:
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Perfiles WHERE IdPerfil = '{p['id']}')\n")
            f.write(f"INSERT INTO Perfiles (IdPerfil, NombrePerfil) VALUES ('{p['id']}', '{p['name']}');\n")

    # Permissions / Permisos
    permisos_ids = generate_guids(4)
    permisos = [
        {"id": permisos_ids[0], "name": "READ_PROJECT"},
        {"id": permisos_ids[1], "name": "CREATE_PROJECT"},
        {"id": permisos_ids[2], "name": "INVITE_USER"},
        {"id": permisos_ids[3], "name": "API_ACCESS"}
    ]
    with open(f"{output_dir}/03_Permisos.sql", "w") as f:
        f.write("-- Seed for Permisos\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for p in permisos:
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Permisos WHERE IdPermiso = '{p['id']}')\n")
            f.write(f"INSERT INTO Permisos (IdPermiso, Descripcion) VALUES ('{p['id']}', '{p['name']}');\n")

    # PerfilPermiso
    with open(f"{output_dir}/04_PerfilPermiso.sql", "w") as f:
        f.write("-- Seed for PerfilPermiso\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for perfil in perfiles:
            for perm in permisos:
                # Basic logic: Enterprise/Company get everything, Freemium only READ/CREATE
                if "Freemium" in perfil["name"] and perm["name"] in ["INVITE_USER", "API_ACCESS"]:
                    continue
                f.write(f"IF NOT EXISTS (SELECT 1 FROM PerfilPermiso WHERE IdPerfil = '{perfil['id']}' AND IdPermiso = '{perm['id']}')\n")
                f.write(f"INSERT INTO PerfilPermiso (IdPerfil, IdPermiso) VALUES ('{perfil['id']}', '{perm['id']}');\n")

    # Users
    users = []
    # 25 Freemium
    for i in range(25):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[0], "role": perfiles[0]})
    # 25 Intermediate
    for i in range(25):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[1], "role": perfiles[1]})
    # 25 Company
    for i in range(25):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[2], "role": perfiles[2]})
    # 25 Enterprise
    for i in range(25):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[3], "role": perfiles[3]})
    
    # 35 Guests divided into Company and Enterprise
    # Company guests: 17, Enterprise guests: 18
    for i in range(17):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[2], "role": perfiles[4], "is_guest": True})
    for i in range(18):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[3], "role": perfiles[4], "is_guest": True})
    
    with open(f"{output_dir}/05_Usuario.sql", "w") as f:
        f.write("-- Seed for Usuario\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for idx, u in enumerate(users):
            nombre = f"User{idx}"
            apellido = f"LastName{idx}"
            email = f"user{idx}@example.com"
            cedula = f"402-0000{str(idx).zfill(3)}-1"
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '{u['id']}')\n")
            f.write(f"INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc) VALUES ('{u['id']}', '{nombre}', '{apellido}', '{email}', 'HASHED_PWD', '809-555-0000', '{cedula}', 2, 1, 1, '{u['plan']['id']}', GETUTCDATE(), GETUTCDATE());\n")

    # UsuarioLegacy - Let's pick 5 users to simulate migrated ones
    with open(f"{output_dir}/06_UsuarioLegacy.sql", "w") as f:
        f.write("-- Seed for UsuarioLegacy (inserting via the view or directly simulating legacy migration)\n")
        f.write("-- Since UsuarioLegacy is a view, inserting into it populates Usuario.\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for i in range(5):
            u_id = str(uuid.uuid4()).upper()
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '{u_id}')\n")
            f.write(f"INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('{u_id}', 'Legacy{i}', 'User{i}', 'legacy{i}@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '{plans[0]['id']}', GETUTCDATE(), GETUTCDATE(), 0);\n")

    # Acceso
    with open(f"{output_dir}/07_Acceso.sql", "w") as f:
        f.write("-- Seed for Acceso\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for u in users:
            acceso_id = str(uuid.uuid4()).upper()
            f.write(f"INSERT INTO Acceso (IdAcceso, IdPerfil, IdUsuario) VALUES ('{acceso_id}', '{u['role']['id']}', '{u['id']}');\n")

    # Pagos & Recibo & LogPagos
    # First ensure ApiGobernanza exists
    api_id = str(uuid.uuid4()).upper()
    with open(f"{output_dir}/08_Pagos.sql", "w") as f:
        f.write("-- Seed for Pagos\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        f.write(f"IF NOT EXISTS (SELECT 1 FROM ApiGobernanza WHERE IdApiGobernanza = '{api_id}') INSERT INTO ApiGobernanza (IdApiGobernanza, NombreApi, Endpoint) VALUES ('{api_id}', 'Dummy API', 'https://api.dummy.com');\n")
        for u in users:
            if u.get("is_guest"):
                continue # Guests don't pay
            if u["plan"]["price"] > 0:
                pago_id = str(uuid.uuid4()).upper()
                f.write(f"INSERT INTO Pagos (IdPago, IdUsuario, IdApiGobernanza, Idsuscripcion, Monto, FechaPago) VALUES ('{pago_id}', '{u['id']}', '{api_id}', '{u['plan']['id']}', {u['plan']['price']}, GETDATE());\n")
                
                # Write to LogPagos script here as well but we will separate it
                with open(f"{output_dir}/09_LogPagos.sql", "a") as fl:
                    fl.write(f"INSERT INTO LogPagos (IdLog, Idpago, IdUsuario, Idsuscripcion, FechaLog, Estado) VALUES ('{str(uuid.uuid4()).upper()}', '{pago_id}', '{u['id']}', '{u['plan']['id']}', GETDATE(), 'COMPLETADO');\n")
                
                # Write to Recibo script here
                with open(f"{output_dir}/10_Recibo.sql", "a") as fr:
                    desglose = '{"subtotal":' + str(round(u["plan"]["price"]*0.82, 2)) + ',"tax":' + str(round(u["plan"]["price"]*0.18, 2)) + '}'
                    fr.write(f"INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('{pago_id}', '{u['id']}', {u['plan']['price']}, GETDATE(), 'Suscripcion {u['plan']['name']}', 'Suscripcion', '{desglose}');\n")

    # FremiunProyectos_Log
    # Need to generate some dummy ProyectosInmobiliarios for the Freemium users
    with open(f"{output_dir}/11_FremiunProyectos_Log.sql", "w") as f:
        f.write("-- Seed for FremiunProyectos_Log\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for u in users:
            if u["plan"]["name"] == "Freemium":
                proj_id = str(uuid.uuid4()).upper()
                # Insert dummy project to satisfy FK
                f.write(f"IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdProyecto = '{proj_id}')\n")
                f.write(f"INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('{proj_id}', '{u['id']}', 'Dummy Project', 'DUMMY-{u['id'][:5]}', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());\n")
                
                log_id = str(uuid.uuid4()).upper()
                f.write(f"INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('{log_id}', '{proj_id}', '{u['id']}', GETDATE());\n")

    # Notificaciones
    with open(f"{output_dir}/12_Notificaciones.sql", "w") as f:
        f.write("-- Seed for Notificaciones\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for u in users:
            notif_id = generate_guids(1)[0]
            # Notificar asignacion de permisos
            msg = f"Se te ha asignado el perfil {u['role']['id']}"
            f.write(f"INSERT INTO Notificaciones (Id, UsuarioId, Mensaje, Tipo, Leida, FechaUtc, CreatedAtUtc) VALUES ('{notif_id}', '{u['id']}', '{msg}', 'INFO', 0, GETUTCDATE(), GETUTCDATE());\n")
            
            # Opcional: una segunda notificacion para algunos
            if random.random() > 0.5:
                notif2_id = generate_guids(1)[0]
                f.write(f"INSERT INTO Notificaciones (Id, UsuarioId, Mensaje, Tipo, Leida, FechaUtc, CreatedAtUtc) VALUES ('{notif2_id}', '{u['id']}', 'Bienvenido a VeriFinca', 'INFO', 1, GETUTCDATE(), GETUTCDATE());\n")

    # DGII
    with open(f"{output_dir}/13_DGII.sql", "w") as f:
        f.write("-- Seed for DGII\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for idx, u in enumerate(users):
            rnc = f"4020000{str(idx).zfill(3)}1"
            nombre = f"User{idx} LastName{idx}"
            f.write(f"IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '{rnc}')\n")
            f.write(f"INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('{rnc}', 'Razon Social {nombre}', 'Comercial {nombre}', 'MIPYME', 'NORMAL', 'ACTIVO', 'SERVICIOS INMOBILIARIOS', 'SAN PEDRO DE MACORIS', 'SI', 'NO', GETUTCDATE());\n")

if __name__ == "__main__":
    # Clear append files
    output_dir = "src/backend/Tools/DbSeeder/Scripts"
    os.makedirs(output_dir, exist_ok=True)
    open(f"{output_dir}/10_Recibo.sql", "w").write("SET NOCOUNT ON;\nSET QUOTED_IDENTIFIER ON;\n")
    open(f"{output_dir}/09_LogPagos.sql", "w").write("SET NOCOUNT ON;\nSET QUOTED_IDENTIFIER ON;\n")
    
    main()
    print("Seed scripts generated successfully in " + output_dir)
