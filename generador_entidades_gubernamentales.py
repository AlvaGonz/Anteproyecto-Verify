import os
import sys
import time
import random
import uuid
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

def ensure_db_library():
    try:
        import pymssql
        return "pymssql"
    except ImportError:
        pass
    try:
        import pyodbc
        return "pyodbc"
    except ImportError:
        pass
    print("DB drivers (pymssql/pyodbc) not found. Attempting to install pymssql...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pymssql"])
        import pymssql
        return "pymssql"
    except Exception as e:
        print(f"Failed to install pymssql: {e}. Trying pyodbc...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pyodbc"])
            import pyodbc
            return "pyodbc"
        except Exception as ex:
            print(f"Failed to install pyodbc: {ex}.")
            print("Please install pymssql or pyodbc manually.")
            sys.exit(1)

db_lib = ensure_db_library()
if db_lib == "pymssql":
    import pymssql
else:
    import pyodbc

def parse_env():
    env_vars = {}
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.strip().split("=", 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

env = parse_env()
conn_str = env.get("ConnectionStrings__DefaultConnection", "")

def get_conn_params(conn_str):
    params = {
        "server": "localhost",
        "port": 1433,
        "database": "verifinca-spm-uce-2026",
        "user": "sa",
        "password": "Your_password123"
    }
    if conn_str:
        parts = conn_str.split(";")
        for p in parts:
            if "=" in p:
                k, v = p.split("=", 1)
                kl = k.strip().lower()
                vl = v.strip()
                if kl in ["server", "data source"]:
                    params["server"] = vl
                elif kl in ["database", "initial catalog"]:
                    params["database"] = vl
                elif kl in ["user id", "uid"]:
                    params["user"] = vl
                elif kl in ["password", "pwd"]:
                    params["password"] = vl
    return params

conn_params = get_conn_params(conn_str)

def wait_for_database():
    target_db = conn_params["database"]
    print(f"[WaitDB] Waiting for database '{target_db}' to exist...")
    for attempt in range(60):
        for h in ["sqlserver", conn_params["server"], "localhost", "127.0.0.1"]:
            if not h: continue
            try:
                if db_lib == "pymssql":
                    server = h
                    port = conn_params["port"]
                    if "," in server:
                        server, port_str = server.split(",", 1)
                        port = int(port_str.strip())
                    conn = pymssql.connect(server=server, port=port, user=conn_params["user"], password=conn_params["password"], database="master", autocommit=False, login_timeout=3)
                else:
                    srv = h
                    if "," not in srv and conn_params["port"]:
                        srv = f"{srv},{conn_params['port']}"
                    conn = pyodbc.connect(f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={srv};DATABASE=master;UID={conn_params['user']};PWD={conn_params['password']};TrustServerCertificate=yes;Connection Timeout=3;")
                cursor = conn.cursor()
                cursor.execute(f"SELECT COUNT(*) FROM sys.databases WHERE name = '{target_db}'")
                exists = cursor.fetchone()[0] > 0
                conn.close()
                if exists:
                    print(f"[WaitDB] Database '{target_db}' exists. Proceeding.")
                    return True
            except Exception:
                continue
        time.sleep(2)
    return False

# wait_for_database() called in main()

def get_db_connection():
    hosts_to_try = [conn_params["server"], "localhost", "127.0.0.1", "sqlserver"]
    seen = set()
    hosts_to_try = [x for x in hosts_to_try if x and not (x in seen or seen.add(x))]
    last_ex = None
    for h in hosts_to_try:
        try:
            if db_lib == "pymssql":
                server = h
                port = conn_params["port"]
                if "," in server:
                    server, port_str = server.split(",", 1)
                    port = int(port_str.strip())
                return pymssql.connect(server=server, port=port, user=conn_params["user"], password=conn_params["password"], database=conn_params["database"], autocommit=False, login_timeout=5)
            else:
                server = h
                if "," not in server and conn_params["port"]:
                    server = f"{server},{conn_params['port']}"
                driver = "{ODBC Driver 17 for SQL Server}"
                try:
                    import pyodbc
                    drivers = [d for d in pyodbc.drivers() if "SQL Server" in d]
                    if drivers: driver = drivers[0]
                except: pass
                odbc_conn_str = f"DRIVER={driver};SERVER={server};DATABASE={conn_params['database']};UID={conn_params['user']};PWD={conn_params['password']};TrustServerCertificate=yes;Connection Timeout=5;"
                return pyodbc.connect(odbc_conn_str)
        except Exception as e:
            last_ex = e
            continue
    raise last_ex

PROVINCIAS_COORDENADAS = {
    "Distrito Nacional": {"lat": 18.4861, "lon": -69.9312, "municipios": ["Santo Domingo de Guzman"]},
    "Santo Domingo": {"lat": 18.5833, "lon": -69.8333, "municipios": ["Santo Domingo Este", "Santo Domingo Oeste", "Santo Domingo Norte", "Boca Chica", "San Antonio de Guerra"]},
    "Santiago": {"lat": 19.4500, "lon": -70.7000, "municipios": ["Santiago de los Caballeros", "Tamboril", "Villa Gonzalez", "Licey al Medio", "Bisono"]},
    "La Altagracia": {"lat": 18.6167, "lon": -68.7000, "municipios": ["Higuey", "San Rafael del Yuma"]},
    "San Pedro de Macoris": {"lat": 18.4500, "lon": -69.3000, "municipios": ["San Pedro de Macoris", "Consuelo", "Ramon Santana", "Quisqueya"]},
    "La Romana": {"lat": 18.4333, "lon": -68.9667, "municipios": ["La Romana", "Guaymate", "Villa Hermosa"]},
    "Puerto Plata": {"lat": 19.7833, "lon": -70.6833, "municipios": ["San Felipe de Puerto Plata", "Sosua", "Cabarete", "Imbert", "Altamira"]},
    "Duarte": {"lat": 19.3000, "lon": -70.2500, "municipios": ["San Francisco de Macoris", "Pimentel", "Castillo", "Villa Riva"]},
    "San Cristobal": {"lat": 18.4167, "lon": -70.1000, "municipios": ["San Cristobal", "Haina", "Yaguate", "Villa Altagracia"]},
    "La Vega": {"lat": 19.2200, "lon": -70.5300, "municipios": ["Concepcion de La Vega", "Constanza", "Jarabacoa"]},
    "Espaillat": {"lat": 19.5000, "lon": -70.5000, "municipios": ["Moca", "Gaspar Hernandez", "Cayetano Germosen"]},
    "Monsenor Nouel": {"lat": 18.9400, "lon": -70.4100, "municipios": ["Bonao", "Maimon", "Piedra Blanca"]},
    "Peravia": {"lat": 18.2800, "lon": -70.3300, "municipios": ["Bani", "Nizao"]},
    "San Juan": {"lat": 18.8000, "lon": -71.2300, "municipios": ["San Juan de la Maguana", "Las Matas de Farfan", "El Cercado"]},
    "Barahona": {"lat": 18.2000, "lon": -71.1000, "municipios": ["Santa Cruz de Barahona", "Cabral", "Enriquillo", "Vicente Noble"]},
    "Samana": {"lat": 19.2000, "lon": -69.3300, "municipios": ["Santa Barbara de Samana", "Sanchez", "Las Terrenas"]},
    "Monte Plata": {"lat": 18.8000, "lon": -69.8000, "municipios": ["Monte Plata", "Bayaguana", "Sabana Grande de Boya", "Yamasao"]},
    "Azua": {"lat": 18.4532, "lon": -70.7368, "municipios": ["Azua de Compostela", "Las Yayas de Viajama", "Padre Las Casas"]},
    "Bahoruco": {"lat": 18.4833, "lon": -71.4167, "municipios": ["Neiba", "Galvan", "Villa Jaragua"]},
    "Dajabon": {"lat": 19.5500, "lon": -71.7167, "municipios": ["Dajabon", "Loma de Cabrera", "Restauracion"]},
    "El Seibo": {"lat": 18.7667, "lon": -69.0333, "municipios": ["Santa Cruz de El Seibo", "Miches"]},
    "Elias Pina": {"lat": 18.8800, "lon": -71.7000, "municipios": ["Comendador", "Bánica"]},
    "Hato Mayor": {"lat": 18.7667, "lon": -69.2500, "municipios": ["Hato Mayor del Rey", "Sabana de la Mar", "El Valle"]},
    "Hermanas Mirabal": {"lat": 19.3833, "lon": -70.4167, "municipios": ["Salcedo", "Tenares", "Villa Tapia"]},
    "Independencia": {"lat": 18.4833, "lon": -71.8500, "municipios": ["Jimani", "Duverge", "La Descubierta"]},
    "Maria Trinidad Sanchez": {"lat": 19.3833, "lon": -69.8500, "municipios": ["Nagua", "Cabrera", "El Factor", "Rio San Juan"]},
    "Monte Cristi": {"lat": 19.8500, "lon": -71.6500, "municipios": ["San Fernando de Monte Cristi", "Guayubin", "Villa Vasquez"]},
    "Pedernales": {"lat": 18.0333, "lon": -71.7500, "municipios": ["Pedernales", "Oviedo"]},
    "Sanchez Ramirez": {"lat": 19.0500, "lon": -70.1500, "municipios": ["Cotui", "Fantino", "Cevicos"]},
    "Santiago Rodriguez": {"lat": 19.4667, "lon": -71.3333, "municipios": ["Sabaneta", "Moncion"]},
    "Valverde": {"lat": 19.5500, "lon": -71.0833, "municipios": ["Mao", "Esperanza", "Laguna Salada"]},
    "San Jose de Ocoa": {"lat": 18.5500, "lon": -70.5000, "municipios": ["San Jose de Ocoa", "Sabana Larga"]}
}
PROVINCIA_NAMES = list(PROVINCIAS_COORDENADAS.keys())
SUPERFICIE_OPTIONS = [50.00, 75.50, 100.00, 126.51, 150.00, 200.00, 250.00, 300.00, 500.00]

def setup_tables():
    print("Setting up/updating tables in database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PagoIPI')
    BEGIN
        CREATE TABLE PagoIPI (Rnc VARCHAR(20) PRIMARY KEY, Cuota_ipi DECIMAL(18,2) NOT NULL, Estatus VARCHAR(20) NOT NULL, FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE());
    END
    """)
    conn.commit()
    
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CatastroTitulo')
    BEGIN
        CREATE TABLE CatastroTitulo (
            IdCatastroTitulo UNIQUEIDENTIFIER PRIMARY KEY,
            CodigoDesignacionCatastral VARCHAR(20) NULL,
            NumeroTitulo VARCHAR(50) NULL,
            Rnc VARCHAR(20) NULL,
            Provincia VARCHAR(100) NULL,
            Municipio VARCHAR(100) NULL,
            Latitud DECIMAL(9,6) NULL,
            Longitud DECIMAL(9,6) NULL,
            Superficie DECIMAL(18,2) NULL,
            Matricula VARCHAR(50) NULL
        );
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'IdProyecto') ALTER TABLE CatastroTitulo DROP COLUMN IdProyecto;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'CodigoDesignacionCatastral') ALTER TABLE CatastroTitulo ADD CodigoDesignacionCatastral VARCHAR(20) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Rnc') ALTER TABLE CatastroTitulo ADD Rnc VARCHAR(20) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Provincia') ALTER TABLE CatastroTitulo ADD Provincia VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Municipio') ALTER TABLE CatastroTitulo ADD Municipio VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Latitud') ALTER TABLE CatastroTitulo ADD Latitud DECIMAL(9,6) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Longitud') ALTER TABLE CatastroTitulo ADD Longitud DECIMAL(9,6) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Superficie') ALTER TABLE CatastroTitulo ADD Superficie DECIMAL(18,2) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Matricula') ALTER TABLE CatastroTitulo ADD Matricula VARCHAR(50) NULL;
    END
    """)
    conn.commit()
    
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PermisoSuelo')
    BEGIN
        CREATE TABLE PermisoSuelo (
            IdPSuelo UNIQUEIDENTIFIER PRIMARY KEY,
            NumeroPermiso VARCHAR(50) NULL,
            NumeroExpediente VARCHAR(50) NULL,
            FechaEmision DATE NULL,
            Rnc VARCHAR(20) NULL,
            Provincia VARCHAR(100) NULL,
            Municipio VARCHAR(100) NULL,
            Latitud DECIMAL(9,6) NULL,
            Longitud DECIMAL(9,6) NULL,
            Superficie DECIMAL(18,2) NULL,
            TienePermiso VARCHAR(10) NULL,
            Documento VARCHAR(250) NULL
        );
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'IdProyecto') ALTER TABLE PermisoSuelo DROP COLUMN IdProyecto;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'NumeroExpediente') ALTER TABLE PermisoSuelo ADD NumeroExpediente VARCHAR(50) NULL;
    END
    """)
    conn.commit()
    
    print("Clearing old seed records from PagoIPI, CatastroTitulo and PermisoSuelo...")
    try: cursor.execute("DELETE FROM PagoIPI;")
    except: pass
    try: cursor.execute("DELETE FROM CatastroTitulo;")
    except: pass
    try: cursor.execute("DELETE FROM PermisoSuelo;")
    except: pass
    conn.commit()
    conn.close()
    print("Table setup/update complete!")

def get_rncs(file_path):
    rncs = []
    with open(file_path, "r", encoding="latin-1") as f:
        for line in f:
            l = line.strip()
            if not l: continue
            parts = l.split("|")
            if parts and parts[0].strip():
                rnc = parts[0].strip()
                if rnc.isdigit() and len(rnc) in [9, 11]:
                    rncs.append(rnc)
    return list(set(rncs))

def generate_ipi_records(rncs_list):
    for rnc in rncs_list:
        cuota_ipi = round(random.uniform(500.0, 25000.0), 2)
        estatus_ipi = random.choice(["Pagado", "No Pagado"])
        yield {
            "rnc": rnc, "cuota_ipi": cuota_ipi, "estatus_ipi": estatus_ipi
        }

def generate_catastro_ps_records(rncs_list):
    import datetime
    base_matricula = random.randint(1000000000, 2000000000)
    base_titulo = random.randint(1000000000, 2000000000)
    start_date = datetime.date(2026, 7, 1)
    
    for p_idx, provincia in enumerate(PROVINCIA_NAMES):
        coord_info = PROVINCIAS_COORDENADAS[provincia]
        for parcel in range(1, 501):
            base_dc = f"{p_idx+1:02d}{parcel:04d}{random.randint(100000, 999999)}"
            for unit in range(1, 101):
                dc = f"{base_dc}:{unit:04d}"
                rnc = random.choice(rncs_list)
                municipio = random.choice(coord_info["municipios"])
                lat = coord_info["lat"] + random.uniform(-0.02, 0.02)
                lon = coord_info["lon"] + random.uniform(-0.02, 0.02)
                superficie = random.choice(SUPERFICIE_OPTIONS)
                base_matricula += 1
                base_titulo += 1
                
                cat_record = {
                    "id": str(uuid.uuid4()).upper(), "dc": dc, "titulo": str(base_titulo),
                    "rnc": rnc, "provincia": provincia, "municipio": municipio,
                    "lat": lat, "lon": lon, "superficie": superficie, "matricula": str(base_matricula)
                }
                
                ps_record = None
                if random.random() < 0.4877: # Approx 780,000 / 1,600,000
                    letras = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
                    nums1 = "".join(random.choices("0123456789", k=2))
                    nums2 = "".join(random.choices("0123456789", k=random.choice([2, 3])))
                    num_exp = f"{letras} {nums1}{nums2}"
                    num_permiso = str(random.randint(1000, 99999))
                    day_offset = random.randint(0, 183)
                    fecha_emision = start_date + datetime.timedelta(days=day_offset)
                    tiene_permiso = random.choice(["1", "0"])
                    
                    ps_record = {
                        "id": str(uuid.uuid4()).upper(), "num_permiso": num_permiso,
                        "num_exp": num_exp, "fecha": fecha_emision.strftime("%Y-%m-%d"),
                        "rnc": rnc, "provincia": provincia, "municipio": municipio,
                        "lat": lat, "lon": lon, "superficie": superficie,
                        "tiene_permiso": tiene_permiso
                    }
                    
                yield cat_record, ps_record

def insert_ipi_chunk(chunk_id, chunk_records):
    print(f"[IPI Worker {chunk_id}] Inserting {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 300
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            sql_ipi = f"INSERT INTO PagoIPI (Rnc, Cuota_ipi, Estatus) VALUES " + ", ".join([f"({ph}, {ph}, {ph})"] * len(batch))
            params_ipi = []
            for r in batch: params_ipi.extend([r["rnc"], r["cuota_ipi"], r["estatus_ipi"]])
            cursor.execute(sql_ipi, tuple(params_ipi))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        raise e
    finally:
        if conn: conn.close()

def insert_catastro_chunk(chunk_id, chunk_records):
    print(f"[Catastro Worker {chunk_id}] Inserting {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 200 # Incrementado a 200 para menos llamadas (límite 2100 params)
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            
            sql_cat = f"INSERT INTO CatastroTitulo (IdCatastroTitulo, CodigoDesignacionCatastral, NumeroTitulo, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, Matricula) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_cat = []
            for r in batch: 
                params_cat.extend([r["id"], r["dc"], r["titulo"], r["rnc"], r["provincia"], r["municipio"], r["lat"], r["lon"], r["superficie"], r["matricula"]])
            cursor.execute(sql_cat, tuple(params_cat))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        raise e
    finally:
        if conn: conn.close()

def insert_ps_chunk(chunk_id, chunk_records):
    if not chunk_records: return 0
    print(f"[PermisoSuelo Worker {chunk_id}] Inserting {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 180 # Incrementado a 180 para menos llamadas
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            
            sql_ps = f"INSERT INTO PermisoSuelo (IdPSuelo, NumeroPermiso, NumeroExpediente, FechaEmision, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, TienePermiso, Documento) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, NULL)"] * len(batch))
            params_ps = []
            for p in batch:
                params_ps.extend([p["id"], p["num_permiso"], p["num_exp"], p["fecha"], p["rnc"], p["provincia"], p["municipio"], p["lat"], p["lon"], p["superficie"], p["tiene_permiso"]])
            cursor.execute(sql_ps, tuple(params_ps))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        raise e
    finally:
        if conn: conn.close()

def main():
    wait_for_database()
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "Bots", "DGII", "src", "DGII_RNC.TXT"))
    if not os.path.exists(file_path):
        print(f"Error: DGII source file not found at {file_path}")
        sys.exit(1)
        
    print(f"Starting optimized seed generator...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM CatastroTitulo")
        count = cursor.fetchone()[0]
        conn.close()
        if count >= 1590000:
            print(f"CatastroTitulo seeds are already fully loaded ({count} records). Skipping.")
            return
    except Exception as e:
        print(f"Database check failed: {e}. Proceeding.")

    setup_tables()
    print("Reading RNCs...")
    rncs_list = get_rncs(file_path)
    print(f"Loaded {len(rncs_list)} unique RNCs.")
    
    t_start = time.time()
    
    # Generate IPI
    print("Submitting IPI tasks...")
    chunk_size = 150000
    current_chunk = []
    chunk_count = 0
    t_ipi_start = time.time()
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures_ipi = []
        for rec in generate_ipi_records(rncs_list):
            current_chunk.append(rec)
            if len(current_chunk) >= chunk_size:
                chunk_count += 1
                futures_ipi.append(executor.submit(insert_ipi_chunk, f"IPI_{chunk_count}", current_chunk))
                current_chunk = []
        if current_chunk:
            chunk_count += 1
            futures_ipi.append(executor.submit(insert_ipi_chunk, f"IPI_{chunk_count}", current_chunk))
            
        print("Waiting for IPI completion...")
        for fut in as_completed(futures_ipi):
            try:
                fut.result()
            except Exception as e:
                print(f"Worker error IPI: {e}")
                
    t_ipi_end = time.time()
            
    print("Submitting CatastroTitulo and PermisoSuelo tasks simultaneously...")
    catastro_chunk = []
    ps_chunk = []
    c_count = 0
    p_count = 0
    t_cat_ps_start = time.time()
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures_cat_ps = []
        for cat_r, ps_r in generate_catastro_ps_records(rncs_list):
            catastro_chunk.append(cat_r)
            if ps_r is not None:
                ps_chunk.append(ps_r)
                
            if len(catastro_chunk) >= chunk_size:
                c_count += 1
                futures_cat_ps.append(executor.submit(insert_catastro_chunk, f"CAT_{c_count}", catastro_chunk))
                catastro_chunk = []
                
            if len(ps_chunk) >= chunk_size:
                p_count += 1
                futures_cat_ps.append(executor.submit(insert_ps_chunk, f"PS_{p_count}", ps_chunk))
                ps_chunk = []
                
        if catastro_chunk:
            c_count += 1
            futures_cat_ps.append(executor.submit(insert_catastro_chunk, f"CAT_{c_count}", catastro_chunk))
            
        if ps_chunk:
            p_count += 1
            futures_cat_ps.append(executor.submit(insert_ps_chunk, f"PS_{p_count}", ps_chunk))
            
        print("Waiting for Catastro and PermisoSuelo completion...")
        for fut in as_completed(futures_cat_ps):
            try:
                fut.result()
            except Exception as e:
                print(f"Worker error CAT/PS: {e}")
                
    t_cat_ps_end = time.time()
            
    t_total = time.time() - t_start
    m_ipi, s_ipi = divmod(t_ipi_end - t_ipi_start, 60)
    m_cat_ps, s_cat_ps = divmod(t_cat_ps_end - t_cat_ps_start, 60)
    m_tot, s_tot = divmod(t_total, 60)
    
    print("\n" + "="*50)
    print("--- Resumen Final de Generación ---")
    print(f"IPI: {int(m_ipi)} minutos {int(s_ipi)} segundos")
    print(f"Catastro y PermisoSuelo (Simultáneo): {int(m_cat_ps)} minutos {int(s_cat_ps)} segundos")
    print(f"Tiempo Total: {int(m_tot)} minutos {int(s_tot)} segundos")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
