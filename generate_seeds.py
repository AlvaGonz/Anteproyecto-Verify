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

def load_real_companies(file_path, count=50):
    companies = []
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="latin-1") as f:
            for line in f:
                line_str = line.strip()
                if not line_str:
                    continue
                parts = line_str.split("|")
                if len(parts) < 2:
                    continue
                rnc = parts[0].strip()
                # 9-digit RNCs represent companies (personas jurídicas)
                if rnc.isdigit() and len(rnc) == 9:
                    name = parts[1].strip()
                    comercial = parts[2].strip() if len(parts) > 2 else ""
                    companies.append({"rnc": rnc, "name": name, "comercial": comercial})
                    if len(companies) >= count:
                        break
    if len(companies) < count:
        # Fallback to random if file doesn't have enough
        needed = count - len(companies)
        for i in range(needed):
            companies.append({
                "rnc": f"101{random.randint(100000, 999999)}",
                "name": f"Constructora Fallback {i}",
                "comercial": f"Inmobiliaria Fallback {i}"
            })
    return companies

def load_real_dgii_records(file_path, count=150):
    records = []
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="latin-1") as f:
            for line in f:
                line_str = line.strip()
                if not line_str:
                    continue
                parts = line_str.split("|")
                if len(parts) < 2:
                    continue
                rnc = parts[0].strip()
                if rnc.isdigit() and len(rnc) in [9, 11]:
                    name = parts[1].strip()
                    comercial = parts[2].strip() if len(parts) > 2 else ""
                    actividad = parts[3].strip() if len(parts) > 3 else ""
                    categoria = parts[4].strip() if len(parts) > 4 else ""
                    regimen = parts[5].strip() if len(parts) > 5 else ""
                    admin = parts[6].strip() if len(parts) > 6 else ""
                    facturador = parts[7].strip() if len(parts) > 7 else ""
                    estado = parts[9].strip() if len(parts) > 9 else "ACTIVO"
                    licencias = parts[10].strip() if len(parts) > 10 else ""
                    
                    records.append({
                        "rnc": rnc,
                        "name": name,
                        "comercial": comercial,
                        "actividad": actividad,
                        "categoria": categoria,
                        "regimen": regimen,
                        "admin": admin,
                        "facturador": facturador,
                        "estado": estado,
                        "licencias": licencias
                    })
                    if len(records) >= count:
                        break
    return records

def main():
    output_dir = "src/backend/Tools/DbSeeder/Scripts"
    os.makedirs(output_dir, exist_ok=True)
    
    file_path = "Bots/DGII/src/DGII_RNC.TXT"

    # 1. Plans (PlanSuscripcion) - Using DB GUIDs matched with AppDbContextSeeder
    plans = [
        {"id": "5F1F3417-402F-4CAC-AE39-F9802A5E72D2", "name": "Gratuito", "price": 0.0},
        {"id": "66AFDABF-632E-434C-86F4-6F9060D2656F", "name": "Profesional", "price": 60.0},
        {"id": "41037268-58B6-40A3-A8AE-C18EFE00C7D3", "name": "Empresa", "price": 170.0},
        {"id": "F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4", "name": "Corporativo", "price": 500.0}
    ]

    # Roles / Perfiles
    perfil_ids = generate_guids(5)
    perfiles = [
        {"id": perfil_ids[0], "name": "Freemium User"},
        {"id": perfil_ids[1], "name": "Intermediate User"},
        {"id": perfil_ids[2], "name": "Company Admin"},
        {"id": perfil_ids[3], "name": "Corporativo Admin"},
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
                # Basic logic: Corporativo/Company get everything, Freemium only READ/CREATE
                if "Freemium" in perfil["name"] and perm["name"] in ["INVITE_USER", "API_ACCESS"]:
                    continue
                f.write(f"IF NOT EXISTS (SELECT 1 FROM PerfilPermiso WHERE IdPerfil = '{perfil['id']}' AND IdPermiso = '{perm['id']}')\n")
                f.write(f"INSERT INTO PerfilPermiso (IdPerfil, IdPermiso) VALUES ('{perfil['id']}', '{perm['id']}');\n")

    # Load 50 real companies for the users
    real_companies = load_real_companies(file_path, 50)

    # Users
    users = []
    company_titulars = []
    corporativo_titulars = []
    # 25 Freemium
    for i in range(25):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[0], "role": perfiles[0]})
    # 25 Intermediate (Profesional)
    for i in range(25):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[1], "role": perfiles[1]})
    # 25 Company (Empresa)
    for i in range(25):
        u_id = str(uuid.uuid4()).upper()
        comp = real_companies[i]
        users.append({
            "id": u_id,
            "plan": plans[2],
            "role": perfiles[2],
            "rnc": comp["rnc"],
            "company_name": comp["name"],
            "comercial_name": comp["comercial"]
        })
        company_titulars.append(u_id)
    # 25 Corporativo
    for i in range(25):
        u_id = str(uuid.uuid4()).upper()
        comp = real_companies[25 + i]
        users.append({
            "id": u_id,
            "plan": plans[3],
            "role": perfiles[3],
            "rnc": comp["rnc"],
            "company_name": comp["name"],
            "comercial_name": comp["comercial"]
        })
        corporativo_titulars.append(u_id)
    
    # 35 Guests divided into Company and Corporativo
    for i in range(17):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[2], "role": perfiles[4], "is_guest": True, "titular": random.choice(company_titulars)})
    for i in range(18):
        users.append({"id": str(uuid.uuid4()).upper(), "plan": plans[3], "role": perfiles[4], "is_guest": True, "titular": random.choice(corporativo_titulars)})
    
    # Names for random generation
    first_names = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Elena", "Pedro", "Laura", "Jose", "Carmen", "Miguel", "Isabel", "Francisco", "Sofia", "Antonio"]
    last_names = ["Perez", "Rodriguez", "Gomez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Diaz", "Gonzalez", "Romero", "Alvarez", "Torres", "Ruiz"]
    
    # Enrich users with personal information beforehand
    for idx, u in enumerate(users):
        u["nombre"] = random.choice(first_names)
        u["apellido"] = random.choice(last_names)
        u["email"] = f"{u['nombre'].lower()}.{u['apellido'].lower()}.{idx}@example.com"
        u["cedula"] = f"402-0000{str(idx).zfill(3)}-1"

    with open(f"{output_dir}/05_Usuario.sql", "w") as f:
        f.write("-- Seed for Usuario\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for idx, u in enumerate(users):
            titular_val = f"'{u['titular']}'" if "titular" in u else "NULL"
            rnc_val = f"'{u['rnc']}'" if "rnc" in u else "NULL"
            
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '{u['id']}')\n")
            f.write(f"INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, TitularId, Rnc) VALUES ('{u['id']}', '{u['nombre']}', '{u['apellido']}', '{u['email']}', 'HASHED_PWD', '809-555-0000', '{u['cedula']}', 2, 1, 1, '{u['plan']['id']}', GETUTCDATE(), GETUTCDATE(), {titular_val}, {rnc_val});\n")
            
            if "rnc" in u:
                company_name = u["company_name"].replace(chr(39), chr(39)+chr(39))
                comercial_name = u["comercial_name"].replace(chr(39), chr(39)+chr(39))
                f.write(f"IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '{u['rnc']}')\n")
                f.write(f"INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Estado, Categoria, FechaModificacion) VALUES ('{u['rnc']}', '{company_name}', '{comercial_name}', 'ACTIVO', 'INMOBILIARIA', GETUTCDATE());\n")

    # UsuarioLegacy - Seed UsuarioLegacy and match with Usuario
    with open(f"{output_dir}/06_UsuarioLegacy.sql", "w") as f:
        f.write("-- Seed for UsuarioLegacy\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        
        # 1. Insert modern users into UsuarioLegacy
        for u in users:
            f.write(f"IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '{u['id']}')\n")
            f.write(f"INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('{u['id']}', '{u['nombre']}', '{u['apellido']}', '{u['email']}', 'HASHED_PWD', '809-555-0000', '{u['cedula']}');\n")
            
        # 2. Insert 5 legacy users to both Usuario and UsuarioLegacy
        for i in range(5):
            u_id = str(uuid.uuid4()).upper()
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '{u_id}')\n")
            f.write(f"INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('{u_id}', 'Legacy{i}', 'User{i}', 'legacy{i}@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '{plans[0]['id']}', GETUTCDATE(), GETUTCDATE(), 0);\n")
            f.write(f"IF NOT EXISTS (SELECT 1 FROM UsuarioLegacy WHERE IdUsuario = '{u_id}')\n")
            f.write(f"INSERT INTO UsuarioLegacy (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula) VALUES ('{u_id}', 'Legacy{i}', 'User{i}', 'legacy{i}@example.com', 'HASH', '809-000-0000', '000-0000000-0');\n")

    # Acceso
    with open(f"{output_dir}/07_Acceso.sql", "w") as f:
        f.write("-- Seed for Acceso\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for u in users:
            acceso_id = str(uuid.uuid4()).upper()
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Acceso WHERE IdPerfil = '{u['role']['id']}' AND IdUsuario = '{u['id']}')\n")
            f.write(f"INSERT INTO Acceso (IdAcceso, IdPerfil, IdUsuario) VALUES ('{acceso_id}', '{u['role']['id']}', '{u['id']}');\n")

    # Pagos & Recibo & LogPagos
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
                f.write(f"IF NOT EXISTS (SELECT 1 FROM Pagos WHERE IdUsuario = '{u['id']}' AND Idsuscripcion = '{u['plan']['id']}')\n")
                f.write(f"INSERT INTO Pagos (IdPago, IdUsuario, IdApiGobernanza, Idsuscripcion, Monto, FechaPago) VALUES ('{pago_id}', '{u['id']}', '{api_id}', '{u['plan']['id']}', {u['plan']['price']}, GETDATE());\n")
                
                # Write to LogPagos script here as well but we will separate it
                with open(f"{output_dir}/09_LogPagos.sql", "a") as fl:
                    log_id = str(uuid.uuid4()).upper()
                    fl.write(f"IF NOT EXISTS (SELECT 1 FROM LogPagos WHERE Idpago = '{pago_id}')\n")
                    fl.write(f"INSERT INTO LogPagos (IdLog, Idpago, IdUsuario, Idsuscripcion, FechaLog, Estado) VALUES ('{log_id}', '{pago_id}', '{u['id']}', '{u['plan']['id']}', GETDATE(), 'COMPLETADO');\n")
                
                # Write to Recibo script here
                with open(f"{output_dir}/10_Recibo.sql", "a") as fr:
                    desglose = '{"subtotal":' + str(round(u["plan"]["price"]*0.82, 2)) + ',"tax":' + str(round(u["plan"]["price"]*0.18, 2)) + '}'
                    fr.write(f"IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '{pago_id}')\n")
                    fr.write(f"INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('{pago_id}', '{u['id']}', {u['plan']['price']}, GETDATE(), 'Suscripcion {u['plan']['name']}', 'Suscripcion', '{desglose}');\n")

    # LogProyectos (Dummy Projects)
    with open(f"{output_dir}/11_FremiunProyectos_Log.sql", "w") as f:
        f.write("-- Seed for Dummy Projects and LogProyectos\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        count = 0
        for u in users:
            if not u.get("is_guest", False) and count < 60:
                proj_id = str(uuid.uuid4()).upper()
                f.write(f"IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '{u['id']}')\n")
                f.write(f"BEGIN\n")
                f.write(f"    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('{proj_id}', '{u['id']}', 'Dummy Project {count+1}', 'DUMMY-{u['id'][:5]}', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());\n")
                
                log_id = str(uuid.uuid4()).upper()
                f.write(f"    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('{log_id}', '{proj_id}', '{u['id']}', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());\n")
                f.write(f"END\n")
                count += 1

    # Notificaciones
    with open(f"{output_dir}/12_Notificaciones.sql", "w") as f:
        f.write("-- Seed for Notificaciones\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for u in users:
            notif_id = str(uuid.uuid4()).upper()
            msg = f"Se te ha asignado el perfil {u['role']['id']}"
            f.write(f"IF NOT EXISTS (SELECT 1 FROM Notificaciones WHERE UsuarioId = '{u['id']}' AND Mensaje = '{msg}')\n")
            f.write(f"INSERT INTO Notificaciones (Id, UsuarioId, Mensaje, Tipo, Leida, FechaUtc, CreatedAtUtc) VALUES ('{notif_id}', '{u['id']}', '{msg}', 'INFO', 0, 'Borrador', GETUTCDATE(), GETUTCDATE());\n")
            
            if random.random() > 0.5:
                notif2_id = str(uuid.uuid4()).upper()
                msg2 = "Bienvenido a VeriFinca"
                f.write(f"IF NOT EXISTS (SELECT 1 FROM Notificaciones WHERE UsuarioId = '{u['id']}' AND Mensaje = '{msg2}')\n")
                f.write(f"INSERT INTO Notificaciones (Id, UsuarioId, Mensaje, Tipo, Leida, FechaUtc, CreatedAtUtc) VALUES ('{notif2_id}', '{u['id']}', '{msg2}', 'INFO', 1, GETUTCDATE(), GETUTCDATE());\n")

    # DGII (using real records loaded from DGII_RNC.TXT)
    real_dgii = load_real_dgii_records(file_path, 150)
    with open(f"{output_dir}/13_DGII.sql", "w") as f:
        f.write("-- Seed for DGII\n")
        f.write("SET NOCOUNT ON;\n")
        f.write("SET QUOTED_IDENTIFIER ON;\n")
        for r in real_dgii:
            f.write(f"IF NOT EXISTS (SELECT 1 FROM DGII WHERE Rnc = '{r['rnc']}')\n")
            f.write(f"INSERT INTO DGII (Rnc, NombreRazonSocial, NombreComercial, Categoria, RegimenPagos, Estado, ActividadEconomica, AdministracionLocal, FacturadorElectronico, LicenciasVhm, FechaModificacion) VALUES ('{r['rnc']}', '{r['name'].replace(chr(39), chr(39)+chr(39))}', '{r['comercial'].replace(chr(39), chr(39)+chr(39))}', '{r['categoria']}', '{r['regimen']}', '{r['estado']}', '{r['actividad'].replace(chr(39), chr(39)+chr(39))}', '{r['admin']}', '{r['facturador']}', '{r['licencias']}', GETUTCDATE());\n")

if __name__ == "__main__":
    output_dir = "src/backend/Tools/DbSeeder/Scripts"
    os.makedirs(output_dir, exist_ok=True)
    open(f"{output_dir}/10_Recibo.sql", "w").write("SET NOCOUNT ON;\nSET QUOTED_IDENTIFIER ON;\n")
    open(f"{output_dir}/09_LogPagos.sql", "w").write("SET NOCOUNT ON;\nSET QUOTED_IDENTIFIER ON;\n")
    
    main()
    print("Seed scripts generated successfully in " + output_dir)

