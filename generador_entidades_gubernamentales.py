import os
import sys
import time
import random
import uuid
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# Fixed seed for reproducibility — same random data every run
random.seed(42)

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
    # Try sqlserver first because in Docker that's the hostname, avoids 15s timeout
    hosts_to_try = ["sqlserver", conn_params["server"], "localhost", "127.0.0.1"]
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
    "Distrito Nacional": {"lat": 18.4861, "lon": -69.9312, "municipios": {
        "Santo Domingo de Guzman": {"lat": 18.485, "lon": -69.93},
    }},
    "Santo Domingo": {"lat": 18.5833, "lon": -69.8333, "municipios": {
        "Santo Domingo Este": {"lat": 18.526, "lon": -69.802},
        "Santo Domingo Oeste": {"lat": 18.463, "lon": -69.992},
        "Santo Domingo Norte": {"lat": 18.612, "lon": -69.912},
        "Boca Chica": {"lat": 18.457, "lon": -69.615},
        "San Antonio de Guerra": {"lat": 18.581, "lon": -69.654},
    }},
    "Santiago": {"lat": 19.45, "lon": -70.7, "municipios": {
        "Santiago de los Caballeros": {"lat": 19.517, "lon": -70.697},
        "Tamboril": {"lat": 19.488, "lon": -70.608},
        "Villa Gonzalez": {"lat": 19.45, "lon": -70.7},
        "Licey al Medio": {"lat": 19.428, "lon": -70.619},
        "Bisono": {"lat": 19.45, "lon": -70.7},
    }},
    "La Altagracia": {"lat": 18.6167, "lon": -68.7, "municipios": {
        "Higuey": {"lat": 18.708, "lon": -68.687},
        "San Rafael del Yuma": {"lat": 18.373, "lon": -68.727},
    }},
    "San Pedro de Macoris": {"lat": 18.45, "lon": -69.3, "municipios": {
        "San Pedro de Macoris": {"lat": 18.482, "lon": -69.26},
        "Consuelo": {"lat": 18.594, "lon": -69.253},
        "Ramon Santana": {"lat": 18.45, "lon": -69.3},
        "Quisqueya": {"lat": 18.546, "lon": -69.423},
    }},
    "La Romana": {"lat": 18.4333, "lon": -68.9667, "municipios": {
        "La Romana": {"lat": 18.155, "lon": -68.677},
        "Guaymate": {"lat": 18.567, "lon": -68.951},
        "Villa Hermosa": {"lat": 18.451, "lon": -69.051},
    }},
    "Puerto Plata": {"lat": 19.7833, "lon": -70.6833, "municipios": {
        "San Felipe de Puerto Plata": {"lat": 19.71, "lon": -70.692},
        "Sosua": {"lat": 19.666, "lon": -70.491},
        "Cabarete": {"lat": 19.7833, "lon": -70.6833},
        "Imbert": {"lat": 19.765, "lon": -70.872},
        "Altamira": {"lat": 19.651, "lon": -70.793},
    }},
    "Duarte": {"lat": 19.3, "lon": -70.25, "municipios": {
        "San Francisco de Macoris": {"lat": 19.339, "lon": -70.206},
        "Pimentel": {"lat": 19.216, "lon": -70.147},
        "Castillo": {"lat": 19.24, "lon": -70.028},
        "Villa Riva": {"lat": 19.152, "lon": -69.903},
    }},
    "San Cristobal": {"lat": 18.4167, "lon": -70.1, "municipios": {
        "San Cristobal": {"lat": 18.415, "lon": -70.11},
        "Haina": {"lat": 18.432, "lon": -70.031},
        "Yaguate": {"lat": 18.34, "lon": -70.188},
        "Villa Altagracia": {"lat": 18.656, "lon": -70.226},
    }},
    "La Vega": {"lat": 19.22, "lon": -70.53, "municipios": {
        "Concepcion de La Vega": {"lat": 19.208, "lon": -70.458},
        "Constanza": {"lat": 18.865, "lon": -70.691},
        "Jarabacoa": {"lat": 19.106, "lon": -70.702},
    }},
    "Espaillat": {"lat": 19.5, "lon": -70.5, "municipios": {
        "Moca": {"lat": 19.478, "lon": -70.505},
        "Gaspar Hernandez": {"lat": 19.614, "lon": -70.241},
        "Cayetano Germosen": {"lat": 19.344, "lon": -70.472},
    }},
    "Monsenor Nouel": {"lat": 18.94, "lon": -70.41, "municipios": {
        "Bonao": {"lat": 18.943, "lon": -70.441},
        "Maimon": {"lat": 18.888, "lon": -70.27},
        "Piedra Blanca": {"lat": 18.812, "lon": -70.331},
    }},
    "Peravia": {"lat": 18.28, "lon": -70.33, "municipios": {
        "Bani": {"lat": 18.351, "lon": -70.37},
        "Nizao": {"lat": 18.269, "lon": -70.21},
    }},
    "San Juan": {"lat": 18.8, "lon": -71.23, "municipios": {
        "San Juan de la Maguana": {"lat": 18.897, "lon": -71.326},
        "Las Matas de Farfan": {"lat": 18.954, "lon": -71.493},
        "El Cercado": {"lat": 18.71, "lon": -71.512},
    }},
    "Barahona": {"lat": 18.2, "lon": -71.1, "municipios": {
        "Santa Cruz de Barahona": {"lat": 18.187, "lon": -71.139},
        "Cabral": {"lat": 18.195, "lon": -71.248},
        "Enriquillo": {"lat": 17.979, "lon": -71.339},
        "Vicente Noble": {"lat": 18.41, "lon": -71.088},
    }},
    "Samana": {"lat": 19.2, "lon": -69.33, "municipios": {
        "Santa Barbara de Samana": {"lat": 19.272, "lon": -69.32},
        "Sanchez": {"lat": 19.143, "lon": -69.678},
        "Las Terrenas": {"lat": 19.284, "lon": -69.566},
    }},
    "Monte Plata": {"lat": 18.8, "lon": -69.8, "municipios": {
        "Monte Plata": {"lat": 18.76, "lon": -69.839},
        "Bayaguana": {"lat": 18.815, "lon": -69.592},
        "Sabana Grande de Boya": {"lat": 18.976, "lon": -69.775},
        "Yamasao": {"lat": 18.768, "lon": -70.085},
    }},
    "Azua": {"lat": 18.4532, "lon": -70.7368, "municipios": {
        "Azua de Compostela": {"lat": 18.459, "lon": -70.754},
        "Las Yayas de Viajama": {"lat": 18.594, "lon": -71.034},
        "Padre Las Casas": {"lat": 18.833, "lon": -70.895},
    }},
    "Bahoruco": {"lat": 18.4833, "lon": -71.4167, "municipios": {
        "Neiba": {"lat": 18.419, "lon": -71.262},
        "Galvan": {"lat": 18.4833, "lon": -71.4167},
        "Villa Jaragua": {"lat": 18.544, "lon": -71.493},
    }},
    "Dajabon": {"lat": 19.55, "lon": -71.7167, "municipios": {
        "Dajabon": {"lat": 19.571, "lon": -71.622},
        "Loma de Cabrera": {"lat": 19.433, "lon": -71.618},
        "Restauracion": {"lat": 19.304, "lon": -71.633},
    }},
    "El Seibo": {"lat": 18.7667, "lon": -69.0333, "municipios": {
        "Santa Cruz de El Seibo": {"lat": 18.741, "lon": -69.031},
        "Miches": {"lat": 18.962, "lon": -68.981},
    }},
    "Elias Pina": {"lat": 18.88, "lon": -71.7, "municipios": {
        "Comendador": {"lat": 18.919, "lon": -71.696},
        "Banica": {"lat": 19.018, "lon": -71.645},
    }},
    "Hato Mayor": {"lat": 18.7667, "lon": -69.25, "municipios": {
        "Hato Mayor del Rey": {"lat": 18.709, "lon": -69.326},
        "Sabana de la Mar": {"lat": 19.008, "lon": -69.412},
        "El Valle": {"lat": 18.944, "lon": -69.385},
    }},
    "Hermanas Mirabal": {"lat": 19.3833, "lon": -70.4167, "municipios": {
        "Salcedo": {"lat": 19.447, "lon": -70.389},
        "Tenares": {"lat": 19.448, "lon": -70.307},
        "Villa Tapia": {"lat": 19.291, "lon": -70.39},
    }},
    "Independencia": {"lat": 18.4833, "lon": -71.85, "municipios": {
        "Jimani": {"lat": 18.501, "lon": -71.844},
        "Duverge": {"lat": 18.32, "lon": -71.621},
        "La Descubierta": {"lat": 18.598, "lon": -71.756},
    }},
    "Maria Trinidad Sanchez": {"lat": 19.3833, "lon": -69.85, "municipios": {
        "Nagua": {"lat": 19.35, "lon": -70.003},
        "Cabrera": {"lat": 19.58, "lon": -69.98},
        "El Factor": {"lat": 19.294, "lon": -69.931},
        "Rio San Juan": {"lat": 19.3833, "lon": -69.85},
    }},
    "Monte Cristi": {"lat": 19.85, "lon": -71.65, "municipios": {
        "San Fernando de Monte Cristi": {"lat": 19.76, "lon": -71.652},
        "Guayubin": {"lat": 19.688, "lon": -71.309},
        "Villa Vasquez": {"lat": 19.809, "lon": -71.443},
    }},
    "Pedernales": {"lat": 18.0333, "lon": -71.75, "municipios": {
        "Pedernales": {"lat": 18.064, "lon": -71.567},
        "Oviedo": {"lat": 17.827, "lon": -71.46},
    }},
    "Sanchez Ramirez": {"lat": 19.05, "lon": -70.15, "municipios": {
        "Cotui": {"lat": 18.998, "lon": -70.131},
        "Fantino": {"lat": 19.103, "lon": -70.303},
        "Cevicos": {"lat": 19.007, "lon": -69.976},
    }},
    "Santiago Rodriguez": {"lat": 19.4667, "lon": -71.3333, "municipios": {
        "Sabaneta": {"lat": 19.369, "lon": -71.327},
        "Moncion": {"lat": 19.391, "lon": -71.185},
    }},
    "Valverde": {"lat": 19.55, "lon": -71.0833, "municipios": {
        "Mao": {"lat": 19.534, "lon": -71.042},
        "Esperanza": {"lat": 19.628, "lon": -70.96},
        "Laguna Salada": {"lat": 19.669, "lon": -71.101},
    }},
    "San Jose de Ocoa": {"lat": 18.55, "lon": -70.5, "municipios": {
        "San Jose de Ocoa": {"lat": 18.557, "lon": -70.439},
        "Sabana Larga": {"lat": 18.645, "lon": -70.559},
    }},
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
        CREATE TABLE PagoIPI (
            Rnc VARCHAR(20) PRIMARY KEY, 
            Cuota_ipi DECIMAL(18,2) NOT NULL, 
            Estatus VARCHAR(20) NOT NULL, 
            FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            NoCertificacion VARCHAR(50) NULL,
            NoInmueble VARCHAR(50) NULL,
            ParcelaNo VARCHAR(50) NULL
        );
    END
    ELSE
    BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PagoIPI') AND name = 'NoCertificacion') ALTER TABLE PagoIPI ADD NoCertificacion VARCHAR(50) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PagoIPI') AND name = 'NoInmueble') ALTER TABLE PagoIPI ADD NoInmueble VARCHAR(50) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PagoIPI') AND name = 'ParcelaNo') ALTER TABLE PagoIPI ADD ParcelaNo VARCHAR(50) NULL;
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
            Matricula VARCHAR(50) NULL,
            Oficina VARCHAR(100) NULL,
            FechaInscripcion DATETIME2 NULL,
            FechaEmision DATETIME2 NULL,
            VieneDe VARCHAR(100) NULL,
            DesignCatastralOrigen VARCHAR(100) NULL,
            DesigCatastralPosicional VARCHAR(100) NULL
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
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'Oficina') ALTER TABLE CatastroTitulo ADD Oficina VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'FechaInscripcion') ALTER TABLE CatastroTitulo ADD FechaInscripcion DATETIME2 NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'FechaEmision') ALTER TABLE CatastroTitulo ADD FechaEmision DATETIME2 NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'VieneDe') ALTER TABLE CatastroTitulo ADD VieneDe VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'DesignCatastralOrigen') ALTER TABLE CatastroTitulo ADD DesignCatastralOrigen VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CatastroTitulo') AND name = 'DesigCatastralPosicional') ALTER TABLE CatastroTitulo ADD DesigCatastralPosicional VARCHAR(100) NULL;
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
            Documento VARCHAR(250) NULL,
            Departamento VARCHAR(100) NULL,
            Operacion VARCHAR(100) NULL,
            Seccion VARCHAR(100) NULL,
            Lugar VARCHAR(100) NULL,
            MivedId UNIQUEIDENTIFIER NULL,
            UnidadesHabitacionales INT NULL,
            LocalesComerciales INT NULL
        );
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'IdProyecto') ALTER TABLE PermisoSuelo DROP COLUMN IdProyecto;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'NumeroExpediente') ALTER TABLE PermisoSuelo ADD NumeroExpediente VARCHAR(50) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Departamento') ALTER TABLE PermisoSuelo ADD Departamento VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Operacion') ALTER TABLE PermisoSuelo ADD Operacion VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Seccion') ALTER TABLE PermisoSuelo ADD Seccion VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Lugar') ALTER TABLE PermisoSuelo ADD Lugar VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'MivedId') ALTER TABLE PermisoSuelo ADD MivedId UNIQUEIDENTIFIER NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'UnidadesHabitacionales') ALTER TABLE PermisoSuelo ADD UnidadesHabitacionales INT NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'LocalesComerciales') ALTER TABLE PermisoSuelo ADD LocalesComerciales INT NULL;
    END
    """)
    conn.commit()
    
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'JCE_Ciudadano')
    BEGIN
        CREATE TABLE JCE_Ciudadano (
            Cedula VARCHAR(11) PRIMARY KEY,
            Nombres VARCHAR(100) NOT NULL,
            Apellidos VARCHAR(100) NOT NULL,
            FechaNacimiento DATE NOT NULL,
            FechaExpiracion DATE NOT NULL
        );
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
    try: cursor.execute("DELETE FROM JCE_Ciudadano;")
    except: pass
    conn.commit()
    conn.close()
    print("Table setup/update complete!")

def get_rncs(file_path):
    rncs = []
    cedulas = []
    with open(file_path, "r", encoding="latin-1") as f:
        for line in f:
            l = line.strip()
            if not l: continue
            parts = l.split("|")
            if parts and parts[0].strip():
                rnc = parts[0].strip()
                if rnc.isdigit():
                    if len(rnc) in [9, 11]:
                        rncs.append(rnc)
                    if len(rnc) == 11:
                        cedulas.append(rnc)
    return sorted(list(set(rncs))), sorted(list(set(cedulas)))

def generate_jce_records(cedulas_list):
    import datetime
    
    nombres_pool = ["JUAN", "MARIA", "PEDRO", "LUIS", "ANA", "CARMEN", "JOSE", "FRANCISCO", "RAMON", "ALTAGRACIA", "MIGUEL", "ANTONIO", "ROSA", "JUANA"]
    apellidos_pool = ["PEREZ", "RODRIGUEZ", "SANCHEZ", "GARCIA", "MARTINEZ", "GONZALEZ", "LOPEZ", "FERNANDEZ", "GOMEZ", "SANTANA", "RAMIREZ", "CRUZ"]
    
    for ced in cedulas_list:
        nombre = random.choice(nombres_pool) + " " + random.choice(nombres_pool)
        apellido = random.choice(apellidos_pool) + " " + random.choice(apellidos_pool)
        
        sexo = random.choice(["M", "F"])
        estado_civil = random.choice(["Soltero(a)", "Casado(a)", "Divorciado(a)"])
        lugar_nacimiento = random.choice(PROVINCIA_NAMES)
        nacionalidad = "DOMINICANA"
        
        # Fecha Nacimiento y FechaExpiracion en formato DD-MM-YYYY
        fecha_nac = (datetime.date(1960, 1, 1) + datetime.timedelta(days=random.randint(0, 15000)))
        fecha_exp = (datetime.date(2025, 1, 1) + datetime.timedelta(days=random.randint(0, 3650)))
        
        # Use YYYY-MM-DD string for DB
        yield {
            "cedula": ced, "nombres": nombre, "apellidos": apellido,
            "sexo": sexo, "estado_civil": estado_civil, "lugar_nacimiento": lugar_nacimiento,
            "fnac": fecha_nac.strftime("%Y-%m-%d"),
            "nacionalidad": nacionalidad,
            "fexp": fecha_exp.strftime("%Y-%m-%d")
        }

def generate_ipi_records(rncs_list):
    pass # Replaced by integrated generator

def generate_catastro_ps_ipi_records(rncs_list):
    import datetime
    base_matricula = random.randint(1000000000, 2000000000)
    base_titulo = random.randint(1000000000, 2000000000)
    start_date = datetime.date(2026, 7, 1)
    
    rnc_ipi_generated = set()
    oficinas = ["D.N.", "SANTO DOMINGO ESTE", "SANTIAGO", "VIRTUAL", "PUERTO PLATA", "LA VEGA"]
    departamentos = ["NORTE", "SUR", "ESTE", "OESTE", "DISTRITO NACIONAL"]
    
    for p_idx, provincia in enumerate(PROVINCIA_NAMES):
        coord_info = PROVINCIAS_COORDENADAS[provincia]
        municipio_names = list(coord_info["municipios"].keys())
        for parcel in range(1, 501):
            base_dc = f"{p_idx+1:02d}{parcel:04d}{random.randint(100000, 999999)}"
            for unit in range(1, 101):
                dc = f"{base_dc}:{unit:04d}"
                rnc = random.choice(rncs_list)
                municipio = random.choice(municipio_names)
                muni_coords = coord_info["municipios"][municipio]
                lat = muni_coords["lat"] + random.uniform(-0.02, 0.02)
                lon = muni_coords["lon"] + random.uniform(-0.02, 0.02)
                base_superficie = random.choice(SUPERFICIE_OPTIONS)
                superficie = base_superficie * 3.44
                base_matricula += 1
                base_titulo += 1
                
                cat_record = {
                    "id": str(uuid.uuid4()).upper(), "dc": dc, "titulo": str(base_titulo),
                    "rnc": rnc, "provincia": provincia, "municipio": municipio,
                    "lat": lat, "lon": lon, "superficie": superficie, "matricula": str(base_matricula),
                    "oficina": random.choice(oficinas),
                    "fecha_inscripcion": (datetime.datetime.now() - datetime.timedelta(days=random.randint(1000, 5000))).strftime('%Y-%m-%d %H:%M:%S'),
                    "fecha_emision": (datetime.datetime.now() - datetime.timedelta(days=random.randint(100, 999))).strftime('%Y-%m-%d %H:%M:%S'),
                    "viene_de": f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.{random.randint(10,999)},{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.{random.randint(10,99)}",
                    "desig_catastral_origen": f"Parc. {random.randint(10,99)}, DC-{random.randint(1,99):02d}",
                    "desig_catastral_posicional": f"{random.randint(100000000000, 999999999999)}"
                }
                
                ps_record = None
                ipi_record = None
                if rnc not in rnc_ipi_generated:
                    rnc_ipi_generated.add(rnc)
                    cuota_ipi = round(random.uniform(500.0, 25000.0), 2)
                    estatus_ipi = random.choice(["Pagado", "No Pagado"])
                    num_cert = str(random.randint(100000000000, 999999999999))
                    day_offset_ipi = random.randint(0, 183)
                    fecha_creacion_ipi = start_date + datetime.timedelta(days=day_offset_ipi)
                    ipi_record = {
                        "rnc": rnc, "cuota_ipi": cuota_ipi, "estatus_ipi": estatus_ipi,
                        "no_cert": num_cert, "no_inmueble": dc, "parcela_no": base_dc,
                        "fecha_creacion": fecha_creacion_ipi.strftime("%Y-%m-%d")
                    }
                    
                yield cat_record, ps_record, ipi_record


def generate_ps_records(licencias_list, rncs_list):
    import datetime
    start_date = datetime.date(2026, 7, 1)
    departamentos = ["NORTE", "SUR", "ESTE", "OESTE", "DISTRITO NACIONAL"]
    for licencia in licencias_list:
        mived_id = licencia["MivedId"]
        num_permiso = licencia["NumeroPermiso"]
        provincia = licencia["Provincia"]
        municipio = licencia["Municipio"]
        unidades = licencia.get("UnidadesHabitacionales", 0)
        locales = licencia.get("LocalesComerciales", 0)
        rnc = licencia.get("Rnc")
        if not rnc: rnc = random.choice(rncs_list)
        
        letras = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
        nums1 = "".join(random.choices("0123456789", k=2))
        nums2 = "".join(random.choices("0123456789", k=random.choice([2, 3])))
        num_exp = f"{letras} {nums1}{nums2}"
        day_offset = random.randint(0, 183)
        fecha_emision = start_date + datetime.timedelta(days=day_offset)
        tiene_permiso = random.choice(["1", "0"])
        
        lat, lon = None, None
        coord_info = PROVINCIAS_COORDENADAS.get(provincia)
        if coord_info and municipio in coord_info["municipios"]:
            muni_coords = coord_info["municipios"][municipio]
            lat = muni_coords["lat"] + random.uniform(-0.02, 0.02)
            lon = muni_coords["lon"] + random.uniform(-0.02, 0.02)
        else:
            lat = 18.4861 + random.uniform(-0.5, 0.5)
            lon = -69.9312 + random.uniform(-0.5, 0.5)
            
        base_superficie = random.choice(SUPERFICIE_OPTIONS)
        final_superficie = base_superficie * 3.44
        
        yield {
            "id": str(uuid.uuid4()).upper(), "num_permiso": num_permiso,
            "num_exp": num_exp, "fecha": fecha_emision.strftime("%Y-%m-%d"),
            "rnc": rnc, "provincia": provincia, "municipio": municipio,
            "lat": lat, "lon": lon, "superficie": final_superficie,
            "tiene_permiso": tiene_permiso,
            "departamento": random.choice(departamentos),
            "operacion": random.choice(["MENSURA", "DESLINDE", "SUBDIVISION", "REFUNDICION"]),
            "seccion": "SECCION " + str(random.randint(1, 10)),
            "lugar": "LUGAR " + str(random.randint(1, 100)),
            "mived_id": mived_id,
            "unidades": unidades,
            "locales": locales
        }

TRANSIENT_ERROR_CODES = {1205, 1204, 1222, 3960, 3961, -2, 0, 11, 64, 258, 4060, 40197, 40501, 40613, 42108, 42109}
TRANSIENT_ERROR_MSGS = ["deadlock", "timeout", "connection", "network", "transport", "refused", "reset", "broken"]

def is_transient_error(e):
    err_msg = str(e).lower()
    if hasattr(e, 'args') and e.args:
        for arg in e.args:
            if isinstance(arg, (int, float)):
                if arg in TRANSIENT_ERROR_CODES:
                    return True
    for keyword in TRANSIENT_ERROR_MSGS:
        if keyword in err_msg:
            return True
    return False

def insert_ipi_chunk(chunk_id, chunk_records, attempt=1):
    max_retries = 10
    print(f"[IPI Worker {chunk_id}] Attempt {attempt}/{max_retries} — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 300
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            sql_ipi = f"INSERT INTO PagoIPI (Rnc, Cuota_ipi, Estatus, NoCertificacion, NoInmueble, ParcelaNo, FechaCreacion) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_ipi = []
            for r in batch: params_ipi.extend([r["rnc"], r["cuota_ipi"], r["estatus_ipi"], r.get("no_cert"), r.get("no_inmueble"), r.get("parcela_no"), r.get("fecha_creacion")])
            cursor.execute(sql_ipi, tuple(params_ipi))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        if attempt < max_retries and is_transient_error(e):
            wait = (2 ** attempt) + (attempt * 0.5)
            print(f"[IPI Worker {chunk_id}] Transient error (attempt {attempt}/{max_retries}): {e}. Retrying in {wait}s...")
            time.sleep(wait)
            return insert_ipi_chunk(chunk_id, chunk_records, attempt + 1)
        raise e
    finally:
        if conn: conn.close()

def insert_catastro_chunk(chunk_id, chunk_records, attempt=1):
    max_retries = 10
    print(f"[Catastro Worker {chunk_id}] Attempt {attempt}/{max_retries} — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 200 # Incrementado a 200 para menos llamadas (límite 2100 params)
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            
            sql_cat = f"INSERT INTO CatastroTitulo (IdCatastroTitulo, CodigoDesignacionCatastral, NumeroTitulo, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, Matricula, Oficina, FechaInscripcion, FechaEmision, VieneDe, DesignCatastralOrigen, DesigCatastralPosicional) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_cat = []
            for r in batch: 
                params_cat.extend([r["id"], r["dc"], r["titulo"], r["rnc"], r["provincia"], r["municipio"], r["lat"], r["lon"], r["superficie"], r["matricula"], r["oficina"], r["fecha_inscripcion"], r["fecha_emision"], r["viene_de"], r["desig_catastral_origen"], r["desig_catastral_posicional"]])
            cursor.execute(sql_cat, tuple(params_cat))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        if attempt < max_retries and is_transient_error(e):
            wait = (2 ** attempt) + (attempt * 0.5)
            print(f"[Catastro Worker {chunk_id}] Transient error (attempt {attempt}/{max_retries}): {e}. Retrying in {wait}s...")
            time.sleep(wait)
            return insert_catastro_chunk(chunk_id, chunk_records, attempt + 1)
        raise e
    finally:
        if conn: conn.close()

def insert_ps_chunk(chunk_id, chunk_records, attempt=1):
    if not chunk_records: return 0
    max_retries = 10
    print(f"[PermisoSuelo Worker {chunk_id}] Attempt {attempt}/{max_retries} — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 180 # Incrementado a 180 para menos llamadas
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            
            sql_ps = f"INSERT INTO PermisoSuelo (IdPSuelo, NumeroPermiso, NumeroExpediente, FechaEmision, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, TienePermiso, Documento, Departamento, Operacion, Seccion, Lugar, MivedId, UnidadesHabitacionales, LocalesComerciales) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, NULL, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_ps = []
            for p in batch:
                params_ps.extend([p["id"], p["num_permiso"], p["num_exp"], p["fecha"], p["rnc"], p["provincia"], p["municipio"], p["lat"], p["lon"], p["superficie"], p["tiene_permiso"], p["departamento"], p["operacion"], p["seccion"], p["lugar"], p.get("mived_id"), p.get("unidades"), p.get("locales")])
            cursor.execute(sql_ps, tuple(params_ps))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        if attempt < max_retries and is_transient_error(e):
            wait = (2 ** attempt) + (attempt * 0.5)
            print(f"[PermisoSuelo Worker {chunk_id}] Transient error (attempt {attempt}/{max_retries}): {e}. Retrying in {wait}s...")
            time.sleep(wait)
            return insert_ps_chunk(chunk_id, chunk_records, attempt + 1)
        raise e
    finally:
        if conn: conn.close()


def insert_jce_chunk(chunk_id, chunk_records, attempt=1):
    if not chunk_records: return 0
    max_retries = 10
    print(f"[JCE Worker {chunk_id}] Attempt {attempt}/{max_retries} — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        ph = "%s" if db_lib == "pymssql" else "?"
        batch_size = 300
        for chunk_idx, i in enumerate(range(0, len(chunk_records), batch_size)):
            batch = chunk_records[i:i+batch_size]
            sql = f"INSERT INTO JCE_Ciudadano (Cedula, Nombres, Apellidos, FechaNacimiento, FechaExpiracion) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params = []
            for r in batch: params.extend([r["cedula"], r["nombres"], r["apellidos"], r["fnac"], r["fexp"]])
            cursor.execute(sql, tuple(params))
            if (chunk_idx + 1) % 50 == 0:
                conn.commit()
        conn.commit()
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        if attempt < max_retries and is_transient_error(e):
            wait = (2 ** attempt) + (attempt * 0.5)
            time.sleep(wait)
            return insert_jce_chunk(chunk_id, chunk_records, attempt + 1)
        raise e
    finally:
        if conn: conn.close()


def generate_linked_records(licencias_list):
    import datetime
    import uuid
    import random
    start_date = datetime.date(2026, 7, 1)
    departamentos = ["NORTE", "SUR", "ESTE", "OESTE", "DISTRITO NACIONAL"]
    oficinas = ["D.N.", "SANTO DOMINGO ESTE", "SANTIAGO", "VIRTUAL", "PUERTO PLATA", "LA VEGA"]
    
    base_matricula = random.randint(1000000000, 2000000000)
    base_titulo = random.randint(1000000000, 2000000000)
    
    for licencia in licencias_list:
        mived_id = licencia["MivedId"]
        num_permiso = licencia["NumeroPermiso"]
        provincia = licencia["Provincia"]
        municipio = licencia["Municipio"]
        unidades = licencia.get("UnidadesHabitacionales", 0)
        locales = licencia.get("LocalesComerciales", 0)
        rnc = licencia.get("Rnc", '000000000')
        
        # --- CATASTRO TITULO ---
        base_dc = f"{random.randint(1,99):02d}{random.randint(1,500):04d}{random.randint(100000, 999999)}"
        dc = f"{base_dc}:{random.randint(1,100):04d}"
        
        lat, lon = None, None
        coord_info = PROVINCIAS_COORDENADAS.get(provincia)
        if coord_info and municipio in coord_info["municipios"]:
            muni_coords = coord_info["municipios"][municipio]
            lat = muni_coords["lat"] + random.uniform(-0.02, 0.02)
            lon = muni_coords["lon"] + random.uniform(-0.02, 0.02)
        else:
            lat = 18.4861 + random.uniform(-0.5, 0.5)
            lon = -69.9312 + random.uniform(-0.5, 0.5)
            
        base_superficie = random.choice(SUPERFICIE_OPTIONS)
        final_superficie = base_superficie * 3.44
        
        base_matricula += 1
        base_titulo += 1
        
        cat_record = {
            "id": str(uuid.uuid4()).upper(), "dc": dc, "titulo": str(base_titulo),
            "rnc": rnc, "provincia": provincia, "municipio": municipio,
            "lat": lat, "lon": lon, "superficie": final_superficie, "matricula": str(base_matricula),
            "oficina": random.choice(oficinas),
            "fecha_inscripcion": (datetime.datetime.now() - datetime.timedelta(days=random.randint(1000, 5000))).strftime('%Y-%m-%d %H:%M:%S'),
            "fecha_emision": (datetime.datetime.now() - datetime.timedelta(days=random.randint(100, 999))).strftime('%Y-%m-%d %H:%M:%S'),
            "viene_de": f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.{random.randint(10,999)},{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.{random.randint(10,99)}",
            "desig_catastral_origen": f"Parc. {random.randint(10,99)}, DC-{random.randint(1,99):02d}",
            "desig_catastral_posicional": f"{random.randint(100000000000, 999999999999)}"
        }
        
        # --- PERMISO SUELO ---
        letras = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
        nums1 = "".join(random.choices("0123456789", k=2))
        nums2 = "".join(random.choices("0123456789", k=random.choice([2, 3])))
        num_exp = f"{letras} {nums1}{nums2}"
        day_offset = random.randint(0, 183)
        fecha_emision_ps = start_date + datetime.timedelta(days=day_offset)
        tiene_permiso = random.choice(["1", "0"])
        
        ps_record = {
            "id": str(uuid.uuid4()).upper(), "num_permiso": num_permiso,
            "num_exp": num_exp, "fecha": fecha_emision_ps.strftime("%Y-%m-%d"),
            "rnc": rnc, "provincia": provincia, "municipio": municipio,
            "lat": lat, "lon": lon, "superficie": final_superficie,
            "tiene_permiso": tiene_permiso,
            "departamento": random.choice(departamentos),
            "operacion": random.choice(["MENSURA", "DESLINDE", "SUBDIVISION", "REFUNDICION"]),
            "seccion": "SECCION " + str(random.randint(1, 10)),
            "lugar": "LUGAR " + str(random.randint(1, 100)),
            "mived_id": mived_id,
            "unidades": unidades,
            "locales": locales
        }
        
        # --- PAGO IPI ---
        cuota_ipi = round(random.uniform(500.0, 25000.0), 2)
        estatus_ipi = random.choice(["Pagado", "No Pagado"])
        num_cert = str(random.randint(100000000000, 999999999999))
        day_offset_ipi = random.randint(0, 183)
        fecha_creacion_ipi = start_date + datetime.timedelta(days=day_offset_ipi)
        ipi_record = {
            "rnc": rnc, "cuota_ipi": cuota_ipi, "estatus_ipi": estatus_ipi,
            "no_cert": num_cert, "no_inmueble": dc, "parcela_no": base_dc,
            "fecha_creacion": fecha_creacion_ipi.strftime("%Y-%m-%d")
        }
        
        yield cat_record, ps_record, ipi_record


def get_latest_csv(folder_path):
    import glob
    search_pattern = os.path.join(folder_path, '*.csv')
    files = glob.glob(search_pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

def import_csv_to_db(csv_path, table_name, conn_params, db_lib):
    import csv
    print(f'Starting import for {table_name} from {csv_path}')
    t_start = time.time()
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = '%s' if db_lib == 'pymssql' else '?'
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='|')
        headers = next(reader)
        cols = ', '.join(headers)
        placeholders = ', '.join([ph] * len(headers))
        sql = f'INSERT INTO {table_name} ({cols}) VALUES ({placeholders})'
        
        batch = []
        batch_size = 5000
        count = 0
        for row in reader:
            processed_row = tuple(val if val != '' else None for val in row)
            batch.append(processed_row)
            if len(batch) >= batch_size:
                cursor.executemany(sql, batch)
                conn.commit()
                count += len(batch)
                batch = []
                if count % 100000 == 0:
                    print(f'Imported {count} records into {table_name}...')
        if batch:
            cursor.executemany(sql, batch)
            conn.commit()
            count += len(batch)
    conn.close()
    t_end = time.time()
    print(f'Successfully imported {count} records into {table_name} in {int(t_end - t_start)} seconds.')
    return True

def main():
    wait_for_database()
    setup_tables()
    
    # Check for CSV caching first
    base_bots = os.path.join(os.path.dirname(__file__), "Bots")
    tables_to_check = ["JCE_Ciudadano", "CatastroTitulo", "PermisoSuelo", "PagoIPI"]
    all_csvs_found = True
    csv_paths = {}
    for tbl in tables_to_check:
        folder = os.path.join(base_bots, tbl)
        csv_file = get_latest_csv(folder) if os.path.exists(folder) else None
        if csv_file:
            csv_paths[tbl] = csv_file
        else:
            all_csvs_found = False
            
    if all_csvs_found:
        print("CSV cache files found for all entities! Bypassing random generation and restoring from CSV...")
        for tbl, path in csv_paths.items():
            import_csv_to_db(path, tbl, conn_params, db_lib)
        print("Restoration from CSV complete!")
        return
        
    print("CSV cache files missing or incomplete. Proceeding with standard generation...")
    # --- Standard Generation Logic Starts Here ---
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "Bots", "DGII", "src", "DGII_RNC.TXT"))

    print("Reading RNCs...")
    rncs_list, cedulas_list = get_rncs(file_path)
    print(f"Loaded {len(rncs_list)} unique RNCs and {len(cedulas_list)} cedulas.")
    
    t_start = time.time()
    
    print("Submitting JCE tasks...")
    chunk_size = 150000
    jce_chunk = []
    jce_count = 0
    t_jce_start = time.time()
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures_jce = []
        for rec in generate_jce_records(cedulas_list):
            jce_chunk.append(rec)
            if len(jce_chunk) >= chunk_size:
                jce_count += 1
                futures_jce.append(executor.submit(insert_jce_chunk, f"JCE_{jce_count}", jce_chunk))
                jce_chunk = []
        if jce_chunk:
            jce_count += 1
            futures_jce.append(executor.submit(insert_jce_chunk, f"JCE_{jce_count}", jce_chunk))
        print("Waiting for JCE completion...")
        for fut in as_completed(futures_jce):
            try: fut.result()
            except Exception as e: print(f"Worker error JCE: {e}")
    t_jce_end = time.time()
    

    print("Loading LicenciaConstruccion to use as base for Linked Generation...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MivedId, NumeroPermiso, Provincia, Municipio, UnidadesHabitacionales, LocalesComerciales, Rnc FROM LicenciaConstruccion")
        lic_rows = cursor.fetchall()
        licencias_list = [{"MivedId": r[0], "NumeroPermiso": r[1], "Provincia": r[2], "Municipio": r[3], "UnidadesHabitacionales": r[4], "LocalesComerciales": r[5], "Rnc": r[6]} for r in lic_rows]
        conn.close()
        print(f"Loaded {len(licencias_list)} Licencias.")
    except Exception as e:
        print(f"Failed to load Licencias: {e}")
        licencias_list = []
        
    print("Submitting Linked Generation (Catastro + PS + IPI from Licencias)...")
    t_ps_start = time.time()
    catastro_chunk = []
    ps_chunk = []
    ipi_chunk = []
    c_count, p_count, i_count = 0, 0, 0
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures_linked = []
        for cat_r, ps_r, ipi_r in generate_linked_records(licencias_list):
            catastro_chunk.append(cat_r)
            ps_chunk.append(ps_r)
            ipi_chunk.append(ipi_r)
            
            if len(catastro_chunk) >= chunk_size:
                c_count += 1
                futures_linked.append(executor.submit(insert_catastro_chunk, f"LINKED_CAT_{c_count}", catastro_chunk))
                catastro_chunk = []
            if len(ps_chunk) >= chunk_size:
                p_count += 1
                futures_linked.append(executor.submit(insert_ps_chunk, f"LINKED_PS_{p_count}", ps_chunk))
                ps_chunk = []
            if len(ipi_chunk) >= chunk_size:
                i_count += 1
                futures_linked.append(executor.submit(insert_ipi_chunk, f"LINKED_IPI_{i_count}", ipi_chunk))
                ipi_chunk = []
                
        if catastro_chunk:
            c_count += 1
            futures_linked.append(executor.submit(insert_catastro_chunk, f"LINKED_CAT_{c_count}", catastro_chunk))
        if ps_chunk:
            p_count += 1
            futures_linked.append(executor.submit(insert_ps_chunk, f"LINKED_PS_{p_count}", ps_chunk))
        if ipi_chunk:
            i_count += 1
            futures_linked.append(executor.submit(insert_ipi_chunk, f"LINKED_IPI_{i_count}", ipi_chunk))
            
        for fut in as_completed(futures_linked):
            try: fut.result()
            except Exception as e: print(f"Worker error Linked: {e}")
            
    print("Submitting remaining Catastro and IPI tasks simultaneously...")
    catastro_chunk = []
    ps_chunk = []
    ipi_chunk = []
    c_count = 0
    p_count = 0
    i_count = 0
    t_cat_ps_start = time.time()
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures_all = []
        for cat_r, ps_r, ipi_r in generate_catastro_ps_ipi_records(rncs_list):
            catastro_chunk.append(cat_r)
            if ps_r is not None:
                ps_chunk.append(ps_r)
            if ipi_r is not None:
                ipi_chunk.append(ipi_r)
                
            if len(catastro_chunk) >= chunk_size:
                c_count += 1
                futures_all.append(executor.submit(insert_catastro_chunk, f"CAT_{c_count}", catastro_chunk))
                catastro_chunk = []
                
            if len(ps_chunk) >= chunk_size:
                p_count += 1
                futures_all.append(executor.submit(insert_ps_chunk, f"PS_{p_count}", ps_chunk))
                ps_chunk = []
                
            if len(ipi_chunk) >= chunk_size:
                i_count += 1
                futures_all.append(executor.submit(insert_ipi_chunk, f"IPI_{i_count}", ipi_chunk))
                ipi_chunk = []
                
        if catastro_chunk:
            c_count += 1
            futures_all.append(executor.submit(insert_catastro_chunk, f"CAT_{c_count}", catastro_chunk))
        if ps_chunk:
            p_count += 1
            futures_all.append(executor.submit(insert_ps_chunk, f"PS_{p_count}", ps_chunk))
        if ipi_chunk:
            i_count += 1
            futures_all.append(executor.submit(insert_ipi_chunk, f"IPI_{i_count}", ipi_chunk))
            
        print("Waiting for Catastro, PS, IPI completion...")
        for fut in as_completed(futures_all):
            try: fut.result()
            except Exception as e: print(f"Worker error CAT/PS/IPI: {e}")
                
    t_cat_ps_end = time.time()
            
    t_total = time.time() - t_start
    m_jce, s_jce = divmod(t_jce_end - t_jce_start, 60)
    m_cat_ps, s_cat_ps = divmod(t_cat_ps_end - t_cat_ps_start, 60)
    m_tot, s_tot = divmod(t_total, 60)
    
    print("\n" + "="*50)
    print("--- Resumen Final de Generación ---")
    print(f"JCE: {int(m_jce)} minutos {int(s_jce)} segundos")
    print(f"Catastro, PermisoSuelo e IPI: {int(m_cat_ps)} minutos {int(s_cat_ps)} segundos")
    print(f"Tiempo Total: {int(m_tot)} minutos {int(s_tot)} segundos")
    print("="*50 + "\n")
    
    print("Auto-exporting generated data to CSV cache for future runs...")
    export_tables_to_csv()

def export_tables_to_csv():
    import datetime
    import csv
    print("Starting CSV auto-export process...")
    conn = get_db_connection()
    cursor = conn.cursor()
    tables_to_export = [
        ("PermisoSuelo", "Bots/PermisoSuelo/PermisoSuelo_{date}.csv"),
        ("JCE_Ciudadano", "Bots/JCE_Ciudadano/JCE_Ciudadano_{date}.csv"),
        ("CatastroTitulo", "Bots/CatastroTitulo/CatastroTitulo_{date}.csv"),
        ("PagoIPI", "Bots/PagoIPI/PagoIPI_{date}.csv"),
        ("ProyectosInmobiliarios", "Bots/ProyectosInmobiliarios/ProyectosInmobiliarios_{date}.csv")
    ]
    date_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    base_dir = os.path.dirname(__file__)
    for table, path_template in tables_to_export:
        rel_path = path_template.format(date=date_str)
        full_path = os.path.join(base_dir, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        print(f"Exporting {table} to {full_path}...")
        
        cursor_raw = conn.cursor()
        cursor_raw.execute(f"SELECT * FROM {table}")
        col_names = [col[0] for col in cursor_raw.description]
        
        with open(full_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f, delimiter='|')
            writer.writerow(col_names)
            while True:
                rows = cursor_raw.fetchmany(100000)
                if not rows:
                    break
                for row in rows:
                    str_row = [str(x) if x is not None else '' for x in row]
                    writer.writerow(str_row)
        print(f"Finished exporting {table}.")
    conn.close()
    print("All auto-exports completed successfully!")

if __name__ == "__main__":
    main()
