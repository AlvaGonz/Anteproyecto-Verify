import os
import sys
import time
import csv
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

# Try to import setup_tables and wait_for_database from the main script
main_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(main_dir)
try:
    from generador_entidades_gubernamentales import setup_tables, wait_for_database
except ImportError:
    print("Could not import from main script. Run from the correct directory.")
    sys.exit(1)

# Make sure we can import db_lib from the root script if we wanted, 
# but let's just duplicate the connection logic here to be fully standalone
# and avoid unintended side effects from importing the main script.

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
    import subprocess
    print("DB drivers not found. Installing pymssql...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymssql"])
    import pymssql
    return "pymssql"

db_lib = ensure_db_library()
if db_lib == "pymssql":
    import pymssql
else:
    import pyodbc

def parse_env():
    env_vars = {}
    # Go up two directories from Bots/pruebas/ to root
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
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

def get_db_connection():
    if db_lib == "pymssql":
        server = conn_params["server"]
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
            autocommit=False
        )
    else:
        server = conn_params["server"]
        if "," not in server:
            server = f"{server},{conn_params['port']}"
        conn_string = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={conn_params['database']};UID={conn_params['user']};PWD={conn_params['password']}"
        conn = pyodbc.connect(conn_string)
        conn.autocommit = False
        return conn

def get_latest_csv(folder_path):
    import glob
    search_pattern = os.path.join(folder_path, '*.csv')
    files = glob.glob(search_pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

def import_csv_to_db(csv_path, table_name, conn_params, db_lib):
    print(f'[Hilo-{table_name}] Starting import for {table_name} from {os.path.basename(csv_path)}')
    t_start = time.time()
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = '%s' if db_lib == 'pymssql' else '?'
    
    # Query valid RNCs from DGII to guarantee referential integrity
    valid_rncs = set()
    try:
        cursor.execute("SELECT Rnc FROM DGII")
        valid_rncs = {r[0] for r in cursor.fetchall() if r[0]}
        print(f"[Hilo-{table_name}] Loaded {len(valid_rncs)} valid RNCs from DGII.")
    except Exception as e:
        print(f"[Hilo-{table_name}] Warning: Could not fetch valid RNCs from DGII: {e}")

    inserted_pago_ipi_rncs = set()
    available_rncs = list(valid_rncs)
    random.shuffle(available_rncs) # Shuffle to pop randomly without loops

    def get_unused_rnc():
        # Pop from available RNCs to guarantee uniqueness
        while available_rncs:
            r = available_rncs.pop()
            if r not in inserted_pago_ipi_rncs:
                inserted_pago_ipi_rncs.add(r)
                return r
        # Fallback if we run out of valid RNCs (unlikely, but should be handled)
        raise ValueError("No more valid, unused RNCs available for PagoIPI.")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='|')
        headers = next(reader)
        rnc_idx = headers.index('Rnc') if 'Rnc' in headers else -1
        
        cols = ', '.join(headers)
        placeholders = ', '.join([ph] * len(headers))
        sql = f'INSERT INTO {table_name} ({cols}) VALUES ({placeholders})'
        
        batch = []
        batch_size = 5000
        count = 0
        for row in reader:
            processed_vals = []
            for i, val in enumerate(row):
                if val == '':
                    processed_vals.append(None)
                else:
                    if i == rnc_idx:
                        if val in valid_rncs:
                            if table_name == 'PagoIPI':
                                # If this RNC is already used during this run, force a new one
                                if val in inserted_pago_ipi_rncs:
                                    val = get_unused_rnc()
                                else:
                                    inserted_pago_ipi_rncs.add(val)
                        else:
                            if valid_rncs:
                                if table_name == 'PagoIPI':
                                    val = get_unused_rnc()
                                else:
                                    val = random.choice(list(valid_rncs))
                    processed_vals.append(val)
            
            processed_row = tuple(processed_vals)
            batch.append(processed_row)
            if len(batch) >= batch_size:
                cursor.executemany(sql, batch)
                conn.commit()
                count += len(batch)
                batch = []
                if count % 100000 == 0:
                    print(f'[Hilo-{table_name}] Imported {count} records...')
        if batch:
            cursor.executemany(sql, batch)
            conn.commit()
            count += len(batch)
    conn.close()
    t_end = time.time()
    elapsed_time = int(t_end - t_start)
    print(f'[Hilo-{table_name}] Successfully imported {count} records into {table_name} in {elapsed_time} seconds.')
    return elapsed_time

def main():
    print("Iniciando prueba de carga paralela de CSVs y corrección de PK...")
    
    # Wait for DB and setup tables (drops and creates them so they are empty)
    wait_for_database()
    setup_tables()
    
    base_bots = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    tables_to_check = ["JCE_Ciudadano", "CatastroTitulo", "PermisoSuelo", "PagoIPI"]
    
    csv_paths = {}
    
    # 1. Variables booleanas para comprobar si se encontraron
    # Como solicitó el usuario, validamos la existencia y lo marcamos.
    found_flags = {}
    
    for tbl in tables_to_check:
        folder = os.path.join(base_bots, tbl)
        csv_file = get_latest_csv(folder) if os.path.exists(folder) else None
        if csv_file:
            print(f"  [+] CSV de caché ENCONTRADO para '{tbl}': {os.path.basename(csv_file)}")
            csv_paths[tbl] = csv_file
            found_flags[tbl] = True
        else:
            print(f"  [-] CSV de caché NO ENCONTRADO para '{tbl}'.")
            found_flags[tbl] = False
            
    all_csvs_found = all(found_flags.values())
            
    if all_csvs_found:
        print("\n=> Todos los archivos CSV fueron encontrados (variables booleanas = True). Restaurando datos simultáneamente...")
        t_global_start = time.time()
        
        # 2. Uso de ThreadPoolExecutor para cargar los CSV en paralelo (simultáneamente)
        import_times = {}
        with ThreadPoolExecutor(max_workers=len(tables_to_check)) as executor:
            futures = {
                executor.submit(import_csv_to_db, path, tbl, conn_params, db_lib): tbl
                for tbl, path in csv_paths.items()
            }
            
            for future in as_completed(futures):
                tbl = futures[future]
                try:
                    elapsed = future.result()
                    import_times[tbl] = elapsed
                except Exception as e:
                    print(f"[!] Error importando {tbl}: {e}")
                    
        t_global_end = time.time()
        
        print("\n" + "="*50)
        print("--- Resumen de Carga desde CSV ---")
        for tbl in tables_to_check:
            if tbl in import_times:
                print(f"{tbl}: {import_times[tbl]} segundos")
        print(f"Tiempo Total de Carga Paralela: {int(t_global_end - t_global_start)} segundos")
        print("="*50 + "\n")
    else:
        print("\n=> Faltan archivos CSV, no se puede probar la carga paralela. Falta:")
        for tbl, found in found_flags.items():
            if not found:
                print(f"   - {tbl}")

if __name__ == "__main__":
    main()
