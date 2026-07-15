import os
import sys
import time
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# Auto-install missing database drivers (pymssql is preferred, pyodbc as fallback)
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

# Parse .env to get connection info
def parse_env():
    env_vars = {}
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))
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
    """Connect to 'master' and wait for the target database to exist."""
    target_db = conn_params["database"]
    print(f"[WaitDB] Waiting for database '{target_db}' to exist...")
    for attempt in range(60):
        for h in ["sqlserver", conn_params["server"], "localhost", "127.0.0.1"]:
            if not h:
                continue
            try:
                if db_lib == "pymssql":
                    server = h
                    port = conn_params["port"]
                    if "," in server:
                        server, port_str = server.split(",", 1)
                        port = int(port_str.strip())
                    conn = pymssql.connect(server=server, port=port, user=conn_params["user"],
                                           password=conn_params["password"], database="master",
                                           autocommit=False, login_timeout=3)
                else:
                    srv = h
                    if "," not in srv and conn_params["port"]:
                        srv = f"{srv},{conn_params['port']}"
                    conn = pyodbc.connect(
                        f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={srv};DATABASE=master;"
                        f"UID={conn_params['user']};PWD={conn_params['password']};"
                        f"TrustServerCertificate=yes;Connection Timeout=3;"
                    )
                cursor = conn.cursor()
                cursor.execute(f"SELECT COUNT(*) FROM sys.databases WHERE name = '{target_db}'")
                exists = cursor.fetchone()[0] > 0
                conn.close()
                if exists:
                    print(f"[WaitDB] Database '{target_db}' exists. Proceeding.")
                    return True
            except Exception:
                continue
        if attempt % 10 == 0:
            print(f"[WaitDB] Still waiting for database '{target_db}'... ({attempt+1}/60)")
        time.sleep(2)
    print(f"[WaitDB] Database '{target_db}' not found after 60 attempts. Proceeding anyway (will fail gracefully).")
    return False

# wait_for_database() is called in main()

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

# Yield generator to parse lines of the text file one by one
def parse_dgii_file(file_path):
    seen_rncs = set()
    with open(file_path, "r", encoding="latin-1") as f:
        for line in f:
            line_str = line.strip()
            if not line_str:
                continue
            parts = line_str.split("|")
            if len(parts) < 2:
                continue
            
            rnc = parts[0].strip()
            # Clean and validate RNC: must be numeric and either 9 or 11 digits
            if not rnc.isdigit() or len(rnc) not in [9, 11]:
                continue
            if rnc in seen_rncs:
                continue
            seen_rncs.add(rnc)
            
            nombre = parts[1].strip()
            comercial = parts[2].strip() if len(parts) > 2 else ""
            actividad = parts[3].strip() if len(parts) > 3 else ""
            categoria = parts[4].strip() if len(parts) > 4 else ""
            regimen = parts[5].strip() if len(parts) > 5 else ""
            admin = parts[6].strip() if len(parts) > 6 else ""
            facturador = parts[7].strip() if len(parts) > 7 else ""
            
            fecha_mod = None
            if len(parts) > 8 and parts[8].strip():
                try:
                    from datetime import datetime
                    fecha_mod = datetime.strptime(parts[8].strip(), "%d/%m/%Y")
                except:
                    pass
            
            estado = parts[9].strip() if len(parts) > 9 else ""
            licencias = parts[10].strip() if len(parts) > 10 else ""
            
            yield (rnc, nombre, comercial, categoria, regimen, estado, actividad, admin, facturador, licencias, fecha_mod)

def insert_chunk(chunk_id, chunk_records):
    print(f"[Thread {chunk_id}] Starting optimized insertion of {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        columns = [
            "Rnc", "NombreRazonSocial", "NombreComercial", "Categoria", "RegimenPagos", 
            "Estado", "ActividadEconomica", "AdministracionLocal", "FacturadorElectronico", 
            "LicenciasVhm", "FechaModificacion"
        ]
        
        # Batch size of 150 (under parameter limit: 150 * 11 = 1650 parameters)
        batch_size = 150
        count = 0
        t0 = time.time()
        
        cols_str = ", ".join(columns)
        placeholder = "%s" if db_lib == "pymssql" else "?"
        row_placeholder = "(" + ", ".join([placeholder] * len(columns)) + ")"
        
        for i in range(0, len(chunk_records), batch_size):
            batch = chunk_records[i : i + batch_size]
            placeholders_str = ", ".join([row_placeholder] * len(batch))
            sql = f"INSERT INTO DGII ({cols_str}) VALUES {placeholders_str}"
            
            params = []
            for r in batch:
                params.extend(r)
                
            cursor.execute(sql, tuple(params))
            count += len(batch)
            if count % 10000 == 0 or count == len(chunk_records):
                conn.commit()
                elapsed = time.time() - t0
                speed = count / elapsed if elapsed > 0 else 0
                print(f"[Thread {chunk_id}] Inserted {count}/{len(chunk_records)} records. Speed: {speed:.1f} rec/sec")
                
        conn.commit()
        print(f"[Thread {chunk_id}] Completed chunk insertion successfully in {time.time() - t0:.2f} seconds!")
        return len(chunk_records)
    except Exception as e:
        print(f"[Thread {chunk_id}] ERROR during insert: {e}")
        if conn:
            try: conn.rollback()
            except: pass
        raise e
    finally:
        if conn: conn.close()

def main():
    wait_for_database()
    base_dir = os.path.dirname(__file__)
    file_path = os.path.abspath(os.path.join(base_dir, "..", "src", "DGII_RNC.TXT"))
    
    if not os.path.exists(file_path):
        print(f"Error: DGII source file not found at {file_path}")
        sys.exit(1)
        
    print(f"Starting optimized DGII mounting...")
    print(f"Source file: {file_path}")
    print(f"Database Server: {conn_params['server']}, Database: {conn_params['database']}")
    
    # Check if already fully loaded
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM DGII")
        count = cursor.fetchone()[0]
        conn.close()
        if count >= 780000:
            print(f"DGII table is already fully loaded ({count} records). Skipping mount.")
            return
    except Exception as e:
        print(f"Database check failed: {e}. Proceeding with fresh mount.")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        print("Cleaning up old data in DGII table to prevent primary key conflicts...")
        cursor.execute("DELETE FROM DGII;")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Warning during DGII cleanup: {e}")

    records_generator = parse_dgii_file(file_path)
    
    chunk_size = 150000
    current_chunk = []
    chunk_count = 0
    futures = []
    t_start = time.time()
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        for record in records_generator:
            current_chunk.append(record)
            if len(current_chunk) >= chunk_size:
                chunk_count += 1
                futures.append(executor.submit(insert_chunk, chunk_count, current_chunk))
                current_chunk = []
                
        if current_chunk:
            chunk_count += 1
            futures.append(executor.submit(insert_chunk, chunk_count, current_chunk))
            
        print(f"All {chunk_count} chunks submitted to ThreadPoolExecutor. Waiting for completion...")
        
        total_rows = 0
        for fut in as_completed(futures):
            try:
                rows_inserted = fut.result()
                total_rows += rows_inserted
            except Exception as e:
                print(f"A thread worker encountered an error: {e}")
                
    t_end = time.time()
    t_total = t_end - t_start
    m, s = divmod(t_total, 60)
    
    print("\n" + "="*50)
    print("--- Resumen Final DGII ---")
    print(f"Total de registros insertados: {total_rows}")
    print(f"Tiempo Total: {int(m)} minutos {int(s)} segundos")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
