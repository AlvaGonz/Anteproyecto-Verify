import os
import sys
import time
import random
import uuid
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# 1. Auto-install missing database drivers (pymssql is preferred, pyodbc as fallback)
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

# 2. Parse .env to get connection info
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
                    if vl.lower() == "sqlserver":
                        params["server"] = "127.0.0.1"
                    else:
                        params["server"] = vl
                elif kl in ["database", "initial catalog"]:
                    params["database"] = vl
                elif kl in ["user id", "uid"]:
                    params["user"] = vl
                elif kl in ["password", "pwd"]:
                    params["password"] = vl
    return params

conn_params = get_conn_params(conn_str)

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
                return pymssql.connect(
                    server=server,
                    port=port,
                    user=conn_params["user"],
                    password=conn_params["password"],
                    database=conn_params["database"],
                    autocommit=False,
                    login_timeout=5
                )
            else:
                server = h
                if "," not in server and conn_params["port"]:
                    server = f"{server},{conn_params['port']}"
                driver = "{ODBC Driver 17 for SQL Server}"
                try:
                    import pyodbc
                    drivers = [d for d in pyodbc.drivers() if "SQL Server" in d]
                    if drivers:
                        driver = drivers[0]
                except:
                    pass
                odbc_conn_str = f"DRIVER={driver};SERVER={server};DATABASE={conn_params['database']};UID={conn_params['user']};PWD={conn_params['password']};TrustServerCertificate=yes;Connection Timeout=5;"
                return pyodbc.connect(odbc_conn_str)
        except Exception as e:
            last_ex = e
            print(f"[Connection] Failed to connect to server '{h}': {e}")
            continue
    raise last_ex

# 3. Dominican Republic Provinces and Municipios with Latitudes & Longitudes
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

# Setup Database Tables
def setup_tables():
    print("Setting up/updating tables in database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. PagoIPI
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PagoIPI')
    BEGIN
        CREATE TABLE PagoIPI (
            Rnc VARCHAR(20) PRIMARY KEY,
            Cuota_ipi DECIMAL(18,2) NOT NULL,
            Estatus VARCHAR(20) NOT NULL,
            FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE()
        );
    END
    """)
    conn.commit()
    
    # 2. Add columns to CatastroTitulo if they do not exist
    alter_queries_catastro = [
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Rnc') ALTER TABLE CatastroTitulo ADD Rnc VARCHAR(20) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Provincia') ALTER TABLE CatastroTitulo ADD Provincia VARCHAR(100) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Municipio') ALTER TABLE CatastroTitulo ADD Municipio VARCHAR(100) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Latitud') ALTER TABLE CatastroTitulo ADD Latitud DECIMAL(9,6) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Longitud') ALTER TABLE CatastroTitulo ADD Longitud DECIMAL(9,6) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Superficie') ALTER TABLE CatastroTitulo ADD Superficie DECIMAL(18,2) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Matricula') ALTER TABLE CatastroTitulo ADD Matricula VARCHAR(50) NULL;"
    ]
    for q in alter_queries_catastro:
        cursor.execute(q)
    conn.commit()
    
    # 3. Add columns to PermisoSuelo if they do not exist
    alter_queries_permiso = [
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Rnc') ALTER TABLE PermisoSuelo ADD Rnc VARCHAR(20) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Provincia') ALTER TABLE PermisoSuelo ADD Provincia VARCHAR(100) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Municipio') ALTER TABLE PermisoSuelo ADD Municipio VARCHAR(100) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Latitud') ALTER TABLE PermisoSuelo ADD Latitud DECIMAL(9,6) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Longitud') ALTER TABLE PermisoSuelo ADD Longitud DECIMAL(9,6) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Superficie') ALTER TABLE PermisoSuelo ADD Superficie DECIMAL(18,2) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'TienePermiso') ALTER TABLE PermisoSuelo ADD TienePermiso VARCHAR(10) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Documento') ALTER TABLE PermisoSuelo ADD Documento VARCHAR(250) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'FechaEmision') ALTER TABLE PermisoSuelo ADD FechaEmision DATE NULL;"
    ]
    for q in alter_queries_permiso:
        cursor.execute(q)
    conn.commit()
    
    # Clear existing seeds to prevent primary key conflicts and duplicate seeds
    print("Clearing old seed records from PagoIPI, CatastroTitulo and PermisoSuelo...")
    try: cursor.execute("DELETE FROM PagoIPI;")
    except Exception as e: print(e)
    try: cursor.execute("DELETE FROM CatastroTitulo WHERE Rnc IS NOT NULL;")
    except Exception as e: print(e)
    try: cursor.execute("DELETE FROM PermisoSuelo WHERE Rnc IS NOT NULL;")
    except Exception as e: print(e)
    conn.commit()
    
    conn.close()
    print("Table setup/update complete!")

# Yield parser to stream RNCs from file
def get_rncs(file_path):
    seen_rncs = set()
    with open(file_path, "r", encoding="latin-1") as f:
        for line in f:
            l = line.strip()
            if not l:
                continue
            parts = l.split("|")
            if parts and parts[0].strip():
                rnc = parts[0].strip()
                # Clean and validate RNC: must be numeric and either 9 or 11 digits
                if not rnc.isdigit() or len(rnc) not in [9, 11]:
                    continue
                if rnc in seen_rncs:
                    continue
                seen_rncs.add(rnc)
                yield rnc

# Generate seed record values based on an RNC
def generate_record_values(rnc):
    # PagoIPI
    cuota_ipi = round(random.uniform(500.0, 25000.0), 2)
    estatus_ipi = random.choice(["payment", "non-payment"])
    
    # Coordinates mapping based on randomly selected Province
    provincia = random.choice(PROVINCIA_NAMES)
    coord_info = PROVINCIAS_COORDENADAS[provincia]
    municipio = random.choice(coord_info["municipios"])
    lat = coord_info["lat"] + random.uniform(-0.02, 0.02)
    lon = coord_info["lon"] + random.uniform(-0.02, 0.02)
    
    # Superficie based on 4 Categories
    category = random.choice(["House", "Apartment", "Residential", "Offices"])
    if category == "House":
        # Average lot size: 250 m2 adjuster
        superficie = round(random.normalvariate(250, 45), 2)
    elif category == "Apartment":
        # Average lot size: 120 m2 adjuster
        superficie = round(random.normalvariate(120, 20), 2)
    elif category == "Residential":
        superficie = round(random.uniform(1000.0, 4500.0), 2)
    else: # Offices
        superficie = round(random.uniform(80.0, 550.0), 2)
        
    superficie = max(10.0, superficie)
    
    # Matricula del Inmueble
    matricula = f"M-{random.randint(1000000, 9999999)}"
    
    # PermisoSuelo (yes/no)
    tiene_permiso = random.choice(["yes", "no"])
    
    return {
        "rnc": rnc,
        "cuota_ipi": cuota_ipi,
        "estatus_ipi": estatus_ipi,
        "provincia": provincia,
        "municipio": municipio,
        "lat": lat,
        "lon": lon,
        "superficie": superficie,
        "matricula": matricula,
        "tiene_permiso": tiene_permiso
    }

def insert_chunk(chunk_id, chunk_records):
    print(f"[Worker {chunk_id}] Inserting {len(chunk_records)} seed records using multi-row inserts...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        ph = "%s" if db_lib == "pymssql" else "?"
        
        # Batch size of 150 rows to fit within parameter limit (150 * 8 = 1200 parameters)
        batch_size = 150
        count = 0
        t0 = time.time()
        
        for i in range(0, len(chunk_records), batch_size):
            batch = chunk_records[i : i + batch_size]
            
            # 1. PagoIPI (3 columns)
            sql_ipi = f"INSERT INTO PagoIPI (Rnc, Cuota_ipi, Estatus) VALUES " + ", ".join([f"({ph}, {ph}, {ph})"] * len(batch))
            params_ipi = []
            for r in batch:
                params_ipi.extend([r["rnc"], r["cuota_ipi"], r["estatus_ipi"]])
            cursor.execute(sql_ipi, tuple(params_ipi))
            
            # 2. CatastroTitulo (8 columns)
            sql_catastro = f"INSERT INTO CatastroTitulo (IdCatastroTitulo, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, Matricula) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_catastro = []
            for r in batch:
                params_catastro.extend([
                    str(uuid.uuid4()).upper(), r["rnc"], r["provincia"], r["municipio"],
                    r["lat"], r["lon"], r["superficie"], r["matricula"]
                ])
            cursor.execute(sql_catastro, tuple(params_catastro))
            
            # 3. PermisoSuelo (9 columns)
            sql_permiso = f"INSERT INTO PermisoSuelo (IdPSuelo, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, TienePermiso, Documento) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, NULL)"] * len(batch))
            params_permiso = []
            for r in batch:
                params_permiso.extend([
                    str(uuid.uuid4()).upper(), r["rnc"], r["provincia"], r["municipio"],
                    r["lat"], r["lon"], r["superficie"], r["tiene_permiso"]
                ])
            cursor.execute(sql_permiso, tuple(params_permiso))
            
            conn.commit()
            count += len(batch)
            if count % 10000 == 0 or count == len(chunk_records):
                elapsed = time.time() - t0
                speed = count / elapsed if elapsed > 0 else 0
                print(f"[Worker {chunk_id}] Processed {count}/{len(chunk_records)} seeds. Speed: {speed:.1f} rec/sec")
                
        print(f"[Worker {chunk_id}] Completed chunk seeds successfully in {time.time() - t0:.2f} seconds!")
        return len(chunk_records)
    except Exception as e:
        print(f"[Worker {chunk_id}] ERROR: {e}")
        if conn:
            try: conn.rollback()
            except: pass
        raise e
    finally:
        if conn: conn.close()

def main():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.abspath(os.path.join(base_dir, "Bots", "DGII", "src", "DGII_RNC.TXT"))
    
    if not os.path.exists(file_path):
        print(f"Error: DGII source file not found at {file_path}")
        sys.exit(1)
        
    print(f"Starting optimized seed generator...")
    print(f"Source file: {file_path}")
    print(f"Database Server: {conn_params['server']}, Database: {conn_params['database']}")

    # Check if already fully loaded
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM PagoIPI")
        count = cursor.fetchone()[0]
        conn.close()
        if count >= 780000:
            print(f"Government entities seeds are already fully loaded ({count} records). Skipping.")
            return
    except Exception as e:
        print(f"Database check failed: {e}. Proceeding with fresh seed generation.")

    setup_tables()
    
    print("Reading RNCs from file and generating seeds...")
    rnc_generator = get_rncs(file_path)
    
    chunk_size = 100000
    current_chunk = []
    chunk_count = 0
    futures = []
    t_start = time.time()
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        for rnc in rnc_generator:
            vals = generate_record_values(rnc)
            current_chunk.append(vals)
            
            if len(current_chunk) >= chunk_size:
                chunk_count += 1
                futures.append(executor.submit(insert_chunk, chunk_count, current_chunk))
                current_chunk = []
                
        if current_chunk:
            chunk_count += 1
            futures.append(executor.submit(insert_chunk, chunk_count, current_chunk))
            
    print(f"All {chunk_count} chunk tasks submitted to ThreadPoolExecutor. Waiting for completion...")
    
    total_seeds = 0
    for fut in as_completed(futures):
        try:
            inserted = fut.result()
            total_seeds += inserted
        except Exception as e:
            print(f"Worker thread error: {e}")
            
    print(f"Government entities seed generation completed! Generated {total_seeds} records for each table in {time.time() - t_start:.2f} seconds.")

if __name__ == "__main__":
    main()
