"""
Dummy Projects Generator — VeriFinca  (Real-Data Edition)
=========================================================
Generates realistic projects for the 4 test accounts using:
  - Real RNCs + company names from DGII_RNC.TXT (780K+ real taxpayers)
  - Real provincias/municipios + GPS from the Catastro coordinate map
  - DesignacionCatastral format matching CatastroTitulo generation
  - Fixed seed (42) so every run is identical and cross-references

Output: 14_Proyectos_Realistas.sql (IF NOT EXISTS style)
"""

import os
import random
import uuid
from datetime import datetime, timedelta

SEED = 42
random.seed(SEED)

output_dir = "src/backend/Tools/DbSeeder/Scripts"
os.makedirs(output_dir, exist_ok=True)

DGII_FILE = "Bots/DGII/src/DGII_RNC.TXT"

# ── Exact copy of PROVINCIAS_COORDENADAS from generador_entidades_gubernamentales.py ──
PROVINCIAS_COORDENADAS = {
    "Distrito Nacional":     {"lat": 18.4861, "lon": -69.9312, "municipios": ["Santo Domingo de Guzman"]},
    "Santo Domingo":         {"lat": 18.5833, "lon": -69.8333, "municipios": ["Santo Domingo Este", "Santo Domingo Oeste", "Santo Domingo Norte", "Boca Chica", "San Antonio de Guerra"]},
    "Santiago":              {"lat": 19.4500, "lon": -70.7000, "municipios": ["Santiago de los Caballeros", "Tamboril", "Villa Gonzalez", "Licey al Medio", "Bisono"]},
    "La Altagracia":         {"lat": 18.6167, "lon": -68.7000, "municipios": ["Higuey", "San Rafael del Yuma"]},
    "San Pedro de Macoris":  {"lat": 18.4500, "lon": -69.3000, "municipios": ["San Pedro de Macoris", "Consuelo", "Ramon Santana", "Quisqueya"]},
    "La Romana":             {"lat": 18.4333, "lon": -68.9667, "municipios": ["La Romana", "Guaymate", "Villa Hermosa"]},
    "Puerto Plata":          {"lat": 19.7833, "lon": -70.6833, "municipios": ["San Felipe de Puerto Plata", "Sosua", "Cabarete", "Imbert", "Altamira"]},
    "Duarte":                {"lat": 19.3000, "lon": -70.2500, "municipios": ["San Francisco de Macoris", "Pimentel", "Castillo", "Villa Riva"]},
    "San Cristobal":         {"lat": 18.4167, "lon": -70.1000, "municipios": ["San Cristobal", "Haina", "Yaguate", "Villa Altagracia"]},
    "La Vega":               {"lat": 19.2200, "lon": -70.5300, "municipios": ["Concepcion de La Vega", "Constanza", "Jarabacoa"]},
    "Espaillat":             {"lat": 19.5000, "lon": -70.5000, "municipios": ["Moca", "Gaspar Hernandez", "Cayetano Germosen"]},
    "Monsenor Nouel":        {"lat": 18.9400, "lon": -70.4100, "municipios": ["Bonao", "Maimon", "Piedra Blanca"]},
    "Peravia":               {"lat": 18.2800, "lon": -70.3300, "municipios": ["Bani", "Nizao"]},
    "San Juan":              {"lat": 18.8000, "lon": -71.2300, "municipios": ["San Juan de la Maguana", "Las Matas de Farfan", "El Cercado"]},
    "Barahona":              {"lat": 18.2000, "lon": -71.1000, "municipios": ["Santa Cruz de Barahona", "Cabral", "Enriquillo", "Vicente Noble"]},
    "Samana":                {"lat": 19.2000, "lon": -69.3300, "municipios": ["Santa Barbara de Samana", "Sanchez", "Las Terrenas"]},
    "Monte Plata":           {"lat": 18.8000, "lon": -69.8000, "municipios": ["Monte Plata", "Bayaguana", "Sabana Grande de Boya", "Yamasao"]},
    "Azua":                  {"lat": 18.4532, "lon": -70.7368, "municipios": ["Azua de Compostela", "Las Yayas de Viajama", "Padre Las Casas"]},
    "Bahoruco":              {"lat": 18.4833, "lon": -71.4167, "municipios": ["Neiba", "Galvan", "Villa Jaragua"]},
    "Dajabon":               {"lat": 19.5500, "lon": -71.7167, "municipios": ["Dajabon", "Loma de Cabrera", "Restauracion"]},
    "El Seibo":              {"lat": 18.7667, "lon": -69.0333, "municipios": ["Santa Cruz de El Seibo", "Miches"]},
    "Elias Pina":            {"lat": 18.8800, "lon": -71.7000, "municipios": ["Comendador", "Bánica"]},
    "Hato Mayor":            {"lat": 18.7667, "lon": -69.2500, "municipios": ["Hato Mayor del Rey", "Sabana de la Mar", "El Valle"]},
    "Hermanas Mirabal":      {"lat": 19.3833, "lon": -70.4167, "municipios": ["Salcedo", "Tenares", "Villa Tapia"]},
    "Independencia":         {"lat": 18.4833, "lon": -71.8500, "municipios": ["Jimani", "Duverge", "La Descubierta"]},
    "Maria Trinidad Sanchez":{"lat": 19.3833, "lon": -69.8500, "municipios": ["Nagua", "Cabrera", "El Factor", "Rio San Juan"]},
    "Monte Cristi":          {"lat": 19.8500, "lon": -71.6500, "municipios": ["San Fernando de Monte Cristi", "Guayubin", "Villa Vasquez"]},
    "Pedernales":            {"lat": 18.0333, "lon": -71.7500, "municipios": ["Pedernales", "Oviedo"]},
    "Sanchez Ramirez":       {"lat": 19.0500, "lon": -70.1500, "municipios": ["Cotui", "Fantino", "Cevicos"]},
    "Santiago Rodriguez":    {"lat": 19.4667, "lon": -71.3333, "municipios": ["Sabaneta", "Moncion"]},
    "Valverde":              {"lat": 19.5500, "lon": -71.0833, "municipios": ["Mao", "Esperanza", "Laguna Salada"]},
    "San Jose de Ocoa":      {"lat": 18.5500, "lon": -70.5000, "municipios": ["San Jose de Ocoa", "Sabana Larga"]}
}
PROVINCIA_NAMES = list(PROVINCIAS_COORDENADAS.keys())

SUPERFICIE_OPTIONS = [50.00, 75.50, 100.00, 126.51, 150.00, 200.00, 250.00, 300.00, 500.00]

ESTIMATED_VALUES = [2500000, 3800000, 5200000, 7500000, 9800000, 12000000,
                    15500000, 22000000, 35000000, 50000000, 1800000, 4200000,
                    6100000, 8700000, 14000000, 2800000, 4500000, 7000000,
                    11000000, 16500000]

PREFIXES = [
    "Torre", "Residencial", "Edificio", "Villa", "Plaza", "Centro",
    "Complejo", "Jardines", "Portales", "Terrazas", "Mirador", "Paseo",
    "Bosque", "Marina", "Palacio", "Viviendas",
]

NAMES = [
    "Bella Vista", "Los Cacicazgos", "Piantini", "Naco", "Arroyo Hondo",
    "Gazcue", "Zona Universitaria", "La Julia", "Los Prados",
    "El Millon", "Ensanche Ozama", "Los Corales", "Playa Dorada",
    "Bavaro", "Punta Cana", "Cap Cana", "Juan Dolio",
    "Casa de Campo", "Sosua", "Cabarete", "Las Terrenas", "Samana",
    "Rio San Juan", "Jarabacoa", "Constanza", "Cumayasa", "Bayahibe",
    "Costa Azul", "Altos de Chavon", "Quisqueya", "Los Restauradores",
    "Cerros de Gurabo", "Reparto del Este", "Don Bosco", "Santa Fe",
    "Los Molinos", "La Esperanza", "El Cacique", "San Miguel",
]

SUFFIXES = [
    "Residencial", "Empresarial", "Comercial", "Corporativo",
    "Turistico", "Vacacional", "Ejecutivo", "Premium",
    "de Lujo", "Exclusivo", "Club", "Park", "Plaza",
    "Suites", "Towers", "del Este", "del Sur", "Oeste",
    "Norte", "Central", "Metropolitano", "Urbano",
    "Resort", "Beach", "Hills", "Gardens", "Palms",
]


# ── Load real RNCs + company names from DGII file ───────────────────────
def load_dgii_data(file_path):
    """Returns (rnc_list, full_records) where full_records has rnc, name, comercial."""
    rncs = []
    records = []
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="latin-1") as f:
            for line in f:
                l = line.strip()
                if not l:
                    continue
                parts = l.split("|")
                if len(parts) < 2:
                    continue
                rnc = parts[0].strip()
                if rnc.isdigit() and len(rnc) in [9, 11]:
                    name = parts[1].strip()[:100] if len(parts) > 1 else ""
                    comercial = parts[2].strip()[:100] if len(parts) > 2 else ""
                    actividad = parts[3].strip()[:100] if len(parts) > 3 else ""
                    rncs.append(rnc)
                    records.append({"rnc": rnc, "name": name, "comercial": comercial, "actividad": actividad})
    print(f"  Loaded {len(rncs)} real RNCs from DGII file")
    return rncs, records


def generate_project_name(idx: int) -> str:
    r = random.Random(SEED + idx)
    prefix = r.choice(PREFIXES)
    name = r.choice(NAMES)
    suffix = r.choice(SUFFIXES)
    if r.random() < 0.30:
        return f"{prefix} {name}"
    if r.random() < 0.20:
        return f"{name} {suffix}"
    return f"{prefix} {name} {suffix}"


def make_codigo_interno(label: str, idx: int, r: random.Random) -> str:
    return f"{label.upper()[:3]}-{r.randint(1000, 99999)}"


# ── Plan config ──────────────────────────────────────────────────────────
PLAN_CONFIG = [
    ("consultor@verifinca.do",   "Consultor",   1,  True),
    ("profesional@verifinca.do", "Profesional", 5,  False),
    ("empresa@verifinca.do",     "Empresa",    10,  False),
    ("corporativo@verifinca.do", "Corporativo", 50, False),
]

PROJECT_CATEGORIES = list(range(1, 17))

# ── Load data ────────────────────────────────────────────────────────────
print("Loading real data...")
dgii_rncs, dgii_records = load_dgii_data(DGII_FILE)

# ── Build SQL ────────────────────────────────────────────────────────────
lines = []
lines.append("-- ============================================================")
lines.append("-- 14_Proyectos_Realistas.sql")
lines.append("-- Generated by generate_dummy_projects.py (seed={})".format(SEED))
lines.append("-- Uses real RNCs from DGII_RNC.TXT + Catastro coordinate map")
lines.append("-- Creates realistic projects for 4 test accounts")
lines.append("-- At least 1/3 per user are Published (EstadoId = PUBLICADO)")
lines.append("-- EstadoId is looked up dynamically from ProyectosEstados by CodigoUnico")
lines.append("-- ============================================================")
lines.append("SET NOCOUNT ON;")
lines.append("SET QUOTED_IDENTIFIER ON;")
lines.append("")

# ── Ensure test users exist (05_Usuario.sql only creates @example.com users) ──
# The C# AppDbContextSeeder.SeedAsync() creates @verifinca.do users, but
# runs concurrently with SQL seeds. Pre-insert them here to avoid FK violations.
lines.append("-- ============================================================")
lines.append("-- Seed VeriFinca test users (needed for project FK references)")
lines.append("-- Must run BEFORE project INSERTs below. The C# seeder will")
lines.append("-- later update ContrasenaHash with real BCrypt hash.")
lines.append("-- ============================================================")
user_config = [
    ("consultor@verifinca.do",   "Consultor",  "809-555-2002", "402-0000002-1", "5F1F3417-402F-4CAC-AE39-F9802A5E72D2"),
    ("profesional@verifinca.do", "Profesional","809-555-2003", "402-0000003-1", "66AFDABF-632E-434C-86F4-6F9060D2656F"),
    ("empresa@verifinca.do",     "Empresa",    "809-555-2004", "402-0000004-1", "41037268-58B6-40A3-A8AE-C18EFE00C7D3"),
    ("corporativo@verifinca.do", "Corporativo","809-555-2005", "402-0000005-1", "F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4"),
]
for email, apellido, telefono, cedula, plan_id in user_config:
    lines.append(f"IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Email = '{email}')")
    lines.append(f"    INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, TitularId, Rnc)")
    lines.append(f"    VALUES (NEWID(), 'Usuario', '{apellido}', '{email}', 'HASHED_PWD', '{telefono}', '{cedula}', 2, 1, 1, '{plan_id}', GETUTCDATE(), GETUTCDATE(), NULL, NULL);")
lines.append("")

project_counter = 0

for email, label, max_count, is_freemium in PLAN_CONFIG:
    published_min = -(-max_count // 3)
    remaining = max_count - published_min

    status_pool = [1, 1, 1, 2, 2, 3]
    remaining_statuses = [random.choice(status_pool) for _ in range(remaining)]
    statuses = [4] * published_min + remaining_statuses
    random.shuffle(statuses)

    lines.append("-- ============================================================")
    lines.append(f"-- {label} ({email}) -- {max_count} projects, {published_min} published")
    lines.append("-- ============================================================")

    for i in range(max_count):
        r = random.Random(SEED + project_counter * 7 + 13)

        # ── Pick a real province + municipio (same as CatastroTitulo) ────
        p_idx = r.randint(0, len(PROVINCIA_NAMES) - 1)
        provincia = PROVINCIA_NAMES[p_idx]
        coord_info = PROVINCIAS_COORDENADAS[provincia]
        municipio = r.choice(coord_info["municipios"])

        # GPS within Catastro's jitter range
        lat = round(coord_info["lat"] + random.uniform(-0.02, 0.02), 6)
        lon = round(coord_info["lon"] + random.uniform(-0.02, 0.02), 6)

        # ── Real RNC + company from DGII ────────────────────────────────
        real_rnc = r.choice(dgii_rncs)
        # Find matching DGII record
        real_company = next((rec for rec in dgii_records if rec["rnc"] == real_rnc),
                            {"name": "Constructora Real S.R.L.", "comercial": "", "actividad": ""})
        desarrollador = real_company["name"][:100]
        actividad = real_company["actividad"][:100]

        # ── DesignacionCatastral matching CatastroTitulo format ──────────
        # Catastro uses: f"{p_idx+1:02d}{parcel:04d}{random.randint(100000, 999999)}:{unit:04d}"
        parcel = r.randint(1, 500)
        dc_base = r.randint(100000, 999999)
        unit = r.randint(1, 100)
        dc = f"{p_idx+1:02d}{parcel:04d}{dc_base}:{unit:04d}"

        # Matricula format matching Catastro
        matricula = str(r.randint(1000000001, 2000000000))

        rid = str(uuid.UUID(int=r.randint(0, 2**128 - 1))).upper()
        project_name = generate_project_name(project_counter)
        codigo = make_codigo_interno(label, i, r)
        categoria = r.choice(PROJECT_CATEGORIES)
        status = statuses[i]
        integridad = r.choice([0, 0, 1, 2])
        juridico = r.choice([0, 0, 1, 2, 3])
        valor = r.choice(ESTIMATED_VALUES)
        superficie = r.choice(SUPERFICIE_OPTIONS)
        sellado = 0
        now = datetime.utcnow() + timedelta(days=-r.randint(1, 180))

        ubicacion = f"{municipio}, {provincia}"

        # Map old-style status (1,2,3,4) to ProyectosEstados.CodigoUnico
        estado_codigo = {1: 'CREADO', 2: 'EDITADO', 3: 'REVISION', 4: 'PUBLICADO'}[status]

        lines.append(f"IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE CodigoInterno = '{codigo}')")
        lines.append("BEGIN")
        lines.append(f"    INSERT INTO ProyectosInmobiliarios (")
        lines.append(f"        IdProyecto, NombreProyecto, CodigoInterno,")
        lines.append(f"        IdUsuario,")
        lines.append(f"        UbicacionTexto, UbicacionGps, ValorEstimado,")
        lines.append(f"        DatosDesarrollador, RncDesarrollador, CategoriaId,")
        lines.append(f"        DesignacionCatastral, Matricula,")
        lines.append(f"        EstadoId,")
        lines.append(f"        EstadoIntegridad, EstadoJuridico, SelladoBloqueado,")
        lines.append(f"        CreatedAtUtc")
        lines.append(f"    ) VALUES (")
        lines.append(f"        '{rid}',")
        lines.append(f"        '{project_name}',")
        lines.append(f"        '{codigo}',")
        lines.append(f"        (SELECT IdUsuario FROM Usuario WHERE Email = '{email}'),")
        lines.append(f"        '{ubicacion}',")
        lines.append(f"        '{lat},{lon}',")
        lines.append(f"        {valor},")
        lines.append(f"        '{desarrollador}',")
        lines.append(f"        '{real_rnc}',")  # Real RNC from DGII
        lines.append(f"        {categoria},")
        lines.append(f"        '{dc}',")         # Catastro-consistent designacion
        lines.append(f"        '{matricula}',")
        lines.append(f"        (SELECT Id FROM ProyectosEstados WHERE CodigoUnico = '{estado_codigo}'),")
        lines.append(f"        {integridad},")
        lines.append(f"        {juridico},")
        lines.append(f"        {sellado},")
        lines.append(f"        '{now.strftime('%Y-%m-%dT%H:%M:%S')}'")
        lines.append(f"    );")

        # ── LogProyectos ──
        log_id = str(uuid.UUID(int=r.randint(0, 2**128 - 1)+1)).upper()
        detail = f"Creacion de proyecto: {project_name}"[:500]
        lines.append("")
        lines.append(f"    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc)")
        lines.append(f"    VALUES ('{log_id}', '{rid}', (SELECT IdUsuario FROM Usuario WHERE Email = '{email}'), '{now.strftime('%Y-%m-%dT%H:%M:%S')}', '{detail}', '{now.strftime('%Y-%m-%dT%H:%M:%S')}', '{now.strftime('%Y-%m-%dT%H:%M:%S')}');")

        # ── Status History (Auditorias con CambioEstado) ──────────────────
        status_chain = {
            1: ['CREADO'],
            2: ['CREADO', 'EDITADO'],
            3: ['CREADO', 'EDITADO', 'REVISION'],
            4: ['CREADO', 'EDITADO', 'REVISION', 'PUBLICADO'],
        }
        chain = status_chain.get(status, ['CREADO'])
        for step_idx, target_estado in enumerate(chain):
            if step_idx == 0:
                anterior_estado = None
                anterior_lookup = 'NULL'
            else:
                anterior_estado = chain[step_idx - 1]
                anterior_lookup = f"(SELECT Id FROM ProyectosEstados WHERE CodigoUnico = '{anterior_estado}')"
            nuevo_lookup = f"(SELECT Id FROM ProyectosEstados WHERE CodigoUnico = '{target_estado}')"
            step_date = now + timedelta(hours=step_idx * random.Random(SEED + project_counter * 17 + step_idx).randint(1, 48))
            hist_id = str(uuid.UUID(int=r.randint(0, 2**128 - 1)+2+step_idx)).upper()
            lines.append("")
            lines.append(f"    INSERT INTO Auditorias (Id, UsuarioId, ProyectoId, TipoEvento, Accion, TipoOperacion, Resultado, ReferenciaExpedienteId, FechaEventoUtc, CreatedAtUtc, EstadoAnteriorId, EstadoNuevoId, Detalle, IpOrigen, UserAgent)")
            lines.append(f"    VALUES ('{hist_id}', (SELECT IdUsuario FROM Usuario WHERE Email = '{email}'), '{rid}', 'CambioEstado', 'CambioEstado', 21, '{anterior_estado or 'null'} -> {target_estado}', '{rid}', '{step_date.strftime('%Y-%m-%dT%H:%M:%S')}', '{step_date.strftime('%Y-%m-%dT%H:%M:%S')}', {anterior_lookup}, {nuevo_lookup}, 'Transicion automatica de estado', '127.0.0.1', 'Seeder/1.0');")

        lines.append("END")
        lines.append("")

        project_counter += 1

# ── Write file ───────────────────────────────────────────────────────────
output_path = os.path.join(output_dir, "14_Proyectos_Realistas.sql")
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"[OK] Generated {project_counter} realistic projects -> {output_path}")
for email, label, max_count, _ in PLAN_CONFIG:
    published = -(-max_count // 3)
    print(f"  {label:15s} ({email:30s}): {max_count:2d} projects, {published:2d} published")
