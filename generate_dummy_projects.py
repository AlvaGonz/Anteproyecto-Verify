"""
Dummy Projects Generator — VeriFinca  (Real-Data Edition from JSON)
=========================================================
Generates 120 realistic projects for the 4 test accounts using:
  - demo_seed_data.json (which contains real extracted Cedulas, RNCs, Matriculas)
  
Output: 14_Proyectos_Realistas.sql (IF NOT EXISTS style)
"""

import os
import json
import random
import uuid
from datetime import datetime, timedelta

SEED = 42
random.seed(SEED)

output_dir = "src/backend/Tools/DbSeeder/Scripts"
os.makedirs(output_dir, exist_ok=True)

seed_file = "src/backend/Tools/DbSeeder/Data/demo_seed_data.json"
with open(seed_file, "r", encoding="utf-8") as f:
    demo_data = json.load(f)

# Load mock DGII for extra data like company names if needed
DGII_FILE = "Bots/DGII/src/DGII_RNC.TXT"
dgii_records = {}
if os.path.exists(DGII_FILE):
    with open(DGII_FILE, "r", encoding="latin-1") as f:
        for line in f:
            l = line.strip()
            if l:
                parts = l.split("|")
                if len(parts) >= 2:
                    rnc = parts[0].strip()
                    name = parts[1].strip()[:100]
                    actividad = parts[3].strip()[:100] if len(parts) > 3 else ""
                    dgii_records[rnc] = {"name": name, "actividad": actividad}

PROVINCIAS_COORDENADAS = {
    "Distrito Nacional":     {"lat": 18.4861, "lon": -69.9312, "municipios": ["Santo Domingo de Guzman"]},
    "Santiago":              {"lat": 19.4500, "lon": -70.7000, "municipios": ["Santiago de los Caballeros"]},
    "La Altagracia":         {"lat": 18.6167, "lon": -68.7000, "municipios": ["Higuey", "San Rafael del Yuma"]},
}
PROVINCIA_NAMES = list(PROVINCIAS_COORDENADAS.keys())

PREFIXES = ["Torre", "Residencial", "Edificio", "Villa", "Plaza", "Condominio", "Complejo", "Altos de", "Jardines de", "Vista"]
NAMES = ["Bella Vista", "Piantini", "Naco", "Bavaro", "Punta Cana", "Serralles", "Cacicazgos", "La Esperilla", "Evaristo Morales", "Los Rios", "Paraiso", "Arroyo Hondo", "Mirador Sur"]
SUFFIXES = ["Residencial", "Empresarial", "Turistico", "Premium", "Golf & Country Club", "Beach Resort", "Suites", "Tower", "Boutique", "Palace"]

def generate_project_name(idx: int) -> str:
    r = random.Random(SEED + idx)
    return f"{r.choice(PREFIXES)} {r.choice(NAMES)} {r.choice(SUFFIXES)} {idx}"

def make_codigo_interno(label: str, idx: int, r: random.Random) -> str:
    return f"{label.upper()[:3]}-{r.randint(1000, 99999)}"

# 120 projects total
PLAN_CONFIG = [
    ("consultor@verifinca.do",   "Consultor",   5,  True),
    ("profesional@verifinca.do", "Profesional", 15,  False),
    ("empresa@verifinca.do",     "Empresa",    40,  False),
    ("corporativo@verifinca.do", "Corporativo", 60, False),
]


# ---------------------------------------------------------
# CSV CACHE CHECK
# ---------------------------------------------------------
def get_latest_csv(folder_path):
    search_pattern = os.path.join(folder_path, '*.csv')
    files = glob.glob(search_pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

csv_cache_path = get_latest_csv(os.path.abspath(os.path.join(os.path.dirname(__file__), "Bots", "ProyectosInmobiliarios")))
if csv_cache_path:
    print(f"Found CSV cache for ProyectosInmobiliarios: {csv_cache_path}")
    print("Generating SQL from CSV instead of random seeds...")
    
    lines = []
    lines.append("-- ============================================================")
    lines.append("-- 14_Proyectos_Realistas.sql (RESTORED FROM CSV CACHE)")
    lines.append("-- ============================================================")
    lines.append("SET NOCOUNT ON;")
    lines.append("SET QUOTED_IDENTIFIER ON;")
    lines.append("")
    
    with open(csv_cache_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="|")
        for row in reader:
            codigo = row["CodigoInterno"].replace("'", "''")
            lines.append(f"IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE CodigoInterno = '{codigo}')")
            lines.append("BEGIN")
            
            cols = []
            vals = []
            for k, v in row.items():
                if v != "":
                    cols.append(k)
                    # if it's a UUID, Date, or string, we quote it (unless it's a number that parses to float/int, but quoting strings is safer for SQL inserts if they aren't strict numeric)
                    # Actually, simple string replacement is safer for exact reproduction
                    val_safe = v.replace("'", "''")
                    if val_safe.lower() in ['true', 'false']:
                        vals.append('1' if val_safe.lower()=='true' else '0')
                    elif val_safe.replace('.', '', 1).isdigit():
                        vals.append(val_safe)
                    else:
                        vals.append(f"'{val_safe}'")
            
            col_str = ", ".join(cols)
            val_str = ", ".join(vals)
            lines.append(f"    INSERT INTO ProyectosInmobiliarios ({col_str}) VALUES ({val_str});")
            lines.append("END")
            
    with open(os.path.join(output_dir, "14_Proyectos_Realistas.sql"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("Generated 14_Proyectos_Realistas.sql from CSV Cache successfully.")
    import sys
    sys.exit(0)
# ---------------------------------------------------------

lines = []
lines.append("-- ============================================================")
lines.append("-- 14_Proyectos_Realistas.sql")
lines.append("-- Generated by generate_dummy_projects.py from demo_seed_data.json")
lines.append("-- ============================================================")
lines.append("SET NOCOUNT ON;")
lines.append("SET QUOTED_IDENTIFIER ON;")
lines.append("")

# Create Users
lines.append("-- ============================================================")
lines.append("-- Seed VeriFinca test users (needed for project FK references)")
lines.append("-- ============================================================")
user_config = [
    ("consultor@verifinca.do",   "Consultor",  "809-555-2002", "5F1F3417-402F-4CAC-AE39-F9802A5E72D2"),
    ("profesional@verifinca.do", "Profesional","809-555-2003", "66AFDABF-632E-434C-86F4-6F9060D2656F"),
    ("empresa@verifinca.do",     "Empresa",    "809-555-2004", "41037268-58B6-40A3-A8AE-C18EFE00C7D3"),
    ("corporativo@verifinca.do", "Corporativo","809-555-2005", "F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4"),
]

for idx, (email, apellido, telefono, plan_id) in enumerate(user_config):
    # Use real Cedulas from demo_seed_data users if available
    cedula = demo_data["users"][idx]["cedula"] if idx < len(demo_data["users"]) else "402-0000000-1"
    real_nombres = demo_data["users"][idx]["nombres"] if idx < len(demo_data["users"]) else "Usuario"
    real_apellidos = demo_data["users"][idx]["apellidos"] if idx < len(demo_data["users"]) else apellido
    
    lines.append(f"IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Email = '{email}')")
    lines.append(f"    INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, TitularId, Rnc)")
    lines.append(f"    VALUES (NEWID(), '{real_nombres}', '{real_apellidos}', '{email}', 'HASHED_PWD', '{telefono}', '{cedula}', 2, 1, 1, '{plan_id}', GETUTCDATE(), GETUTCDATE(), NULL, NULL);")
lines.append("")

project_counter = 0
projects_data = demo_data["projects"]

lines.append("DECLARE @uId UNIQUEIDENTIFIER;")
lines.append("DECLARE @estId UNIQUEIDENTIFIER;")

for email, label, max_count, is_freemium in PLAN_CONFIG:
    published_min = max_count // 2
    remaining = max_count - published_min
    statuses = [4] * published_min + [random.choice([1,2,3]) for _ in range(remaining)]
    random.shuffle(statuses)
    
    lines.append(f"-- ============================================================")
    lines.append(f"-- {label} ({email}) -- {max_count} projects")
    lines.append(f"-- ============================================================")
    
    for i in range(max_count):
        r = random.Random(SEED + project_counter)
        proj_seed = projects_data[project_counter] if project_counter < len(projects_data) else projects_data[0]
        
        provincia = r.choice(PROVINCIA_NAMES)
        coord_info = PROVINCIAS_COORDENADAS[provincia]
        municipio = r.choice(coord_info["municipios"])
        lat = round(coord_info["lat"] + random.uniform(-0.02, 0.02), 6)
        lon = round(coord_info["lon"] + random.uniform(-0.02, 0.02), 6)
        
        real_rnc = proj_seed["desarrollador_rnc"]
        dgii_rec = dgii_records.get(real_rnc, {"name": "Constructora Real S.R.L.", "actividad": "Construccion"})
        desarrollador = dgii_rec["name"].replace("'", "''")
        
        dc = proj_seed["designacion"]
        matricula = proj_seed["matricula"]
        
        rid = str(uuid.UUID(int=r.randint(0, 2**128 - 1))).upper()
        project_name = generate_project_name(project_counter)
        codigo = make_codigo_interno(label, i, r)
        status = statuses[i]
        estado_codigo = {1: 'CREADO', 2: 'EDITADO', 3: 'REVISION', 4: 'PUBLICADO'}[status]
        
        ubicacion = f"{municipio}, {provincia}"
        ubicacion_gps = f"{lat},{lon}"
        
        lines.append(f"IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE CodigoInterno = '{codigo}')")
        lines.append("BEGIN")
        lines.append(f"    SELECT @uId = IdUsuario FROM Usuario WHERE Email = '{email}';")
        lines.append(f"    SELECT @estId = Id FROM ProyectosEstados WHERE CodigoUnico = '{estado_codigo}';")
        lines.append("    IF @uId IS NOT NULL AND @estId IS NOT NULL")
        lines.append("    BEGIN")
        lines.append("    INSERT INTO ProyectosInmobiliarios (")
        lines.append("        IdProyecto, CodigoInterno, NombreProyecto, UbicacionTexto, UbicacionGps, CategoriaId, SuperficieM2,")
        lines.append("        ValorEstimado, EstadoJuridico, EstadoIntegridad,")
        lines.append("        SelladoBloqueado, IdUsuario, CreatedAtUtc, UpdatedAtUtc,")
        lines.append("        DatosDesarrollador, EstadoId,")
        lines.append("        RncDesarrollador, DesignacionCatastral, Matricula")
        lines.append("    ) VALUES (")
        lines.append(f"        '{rid}', '{codigo}', '{project_name}', '{ubicacion}', '{ubicacion_gps}', {r.randint(1,16)}, {r.choice([50,100,200])},")
        lines.append(f"        {r.randint(2000000, 50000000)}, {r.randint(0,3)}, {r.randint(0,2)},")
        # 4 months ago is roughly 120 days
        date_offset = r.randint(120, 150) if status in [3, 4] else r.randint(1, 30)
        lines.append(f"        0, @uId, DATEADD(day, -{date_offset}, GETUTCDATE()), DATEADD(day, -{date_offset}, GETUTCDATE()),")
        lines.append(f"        '{desarrollador}', @estId,")
        lines.append(f"        '{real_rnc}', '{dc}', '{matricula}'")
        lines.append("    );")
        lines.append("    END")
        lines.append("END")
        
        project_counter += 1

with open(os.path.join(output_dir, "14_Proyectos_Realistas.sql"), "w") as f:
    f.write("\n".join(lines) + "\n")
print(f"Generated {project_counter} projects in 14_Proyectos_Realistas.sql")
