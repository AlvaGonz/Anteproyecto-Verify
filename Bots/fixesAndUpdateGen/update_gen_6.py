import sys
import os
import glob
import csv
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_latest_csv(folder_path):
    search_pattern = os.path.join(folder_path, '*.csv')
    files = glob.glob(search_pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

def import_csv_to_db(csv_path, table_name, conn_params, db_lib):
    print(f'Starting import for {table_name} from {csv_path}')
    t_start = time.time()
    
    if db_lib == 'pymssql':
        import pymssql
        server = conn_params['server']
        port = conn_params['port']
        if ',' in server:
            server, port_str = server.split(',', 1)
            port = int(port_str.strip())
        conn = pymssql.connect(server=server, port=port, user=conn_params['user'], password=conn_params['password'], database=conn_params['database'], autocommit=False)
    else:
        import pyodbc
        server = conn_params['server']
        if ',' not in server and conn_params['port']:
            server = f"{server},{conn_params['port']}"
        driver = '{ODBC Driver 18 for SQL Server}'
        conn = pyodbc.connect(f'DRIVER={driver};SERVER={server};DATABASE={conn_params["database"]};UID={conn_params["user"]};PWD={conn_params["password"]};TrustServerCertificate=yes;')
        
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
            # Convert empty strings to None
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

# To inject this, we will write a script to rewrite main in generador
with open('generador_entidades_gubernamentales.py', 'r', encoding='utf-8') as f:
    content = f.read()

import_logic = '''
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
'''

# Find def main():
parts = content.split('def main():')
new_content = parts[0] + import_logic + parts[1].split('setup_tables()')[1]

with open('generador_entidades_gubernamentales.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully updated generador_entidades_gubernamentales.py to support CSV caching!")
