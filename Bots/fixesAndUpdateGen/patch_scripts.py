import os
import re

def patch_dgii():
    path = "Bots/DGII/code/up_DGII.py"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Connection hosts
    content = content.replace(
        "hosts_to_try = [conn_params[\"server\"], \"localhost\", \"127.0.0.1\", \"sqlserver\"]",
        "hosts_to_try = [\"sqlserver\", conn_params[\"server\"], \"localhost\", \"127.0.0.1\"]"
    )

    # 2. TRUNCATE instead of DELETE
    content = content.replace(
        "cursor.execute(\"DELETE FROM DGII;\")",
        "cursor.execute(\"TRUNCATE TABLE DGII;\")"
    )

    # 3. insert_chunk rewrite
    old_insert_chunk = """def insert_chunk(chunk_id, chunk_records, attempt=1):
    max_retries = 3
    print(f"[Chunk {chunk_id}] Attempt {attempt}/{max_retries} — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        columns = [
            "Rnc", "NombreRazonSocial", "NombreComercial", "Categoria", "RegimenPagos", 
            "Estado", "ActividadEconomica", "AdministracionLocal", "FacturadorElectronico", 
            "LicenciasVhm", "FechaModificacion"
        ]
        
        batch_size = 150
        count = 0
        t0 = time.time()
        
        cols_str = ", ".join(columns)
        placeholder = "%s" if db_lib == "pymssql" else "?"
        row_placeholder = "(" + ", ".join([placeholder] * len(columns)) + ")"
        
        for i in range(0, len(chunk_records), batch_size):
            batch = chunk_records[i : i + batch_size]
            placeholders_str = ", ".join([row_placeholder] * len(batch))
            sql = f"INSERT INTO DGII WITH (TABLOCK) ({cols_str}) VALUES {placeholders_str}"
            
            params = []
            for r in batch:
                params.extend(r)
                
            cursor.execute(sql, tuple(params))
            count += len(batch)
            if count % 10000 == 0 or count == len(chunk_records):
                conn.commit()
                elapsed = time.time() - t0
                speed = count / elapsed if elapsed > 0 else 0
                print(f"[Chunk {chunk_id}] Inserted {count}/{len(chunk_records)} records. Speed: {speed:.1f} rec/sec")
                
        conn.commit()
        print(f"[Chunk {chunk_id}] Completed in {time.time() - t0:.2f}s — {len(chunk_records)} records inserted successfully!")
        return len(chunk_records)
    except Exception as e:
        if conn:
            try: conn.rollback()
            except: pass
        if attempt < max_retries and is_transient_error(e):
            wait = 2 ** attempt
            print(f"[Chunk {chunk_id}] Transient error (attempt {attempt}/{max_retries}): {e}. Retrying in {wait}s...")
            time.sleep(wait)
            return insert_chunk(chunk_id, chunk_records, attempt + 1)
        print(f"[Chunk {chunk_id}] PERMANENT ERROR after {attempt} attempt(s): {e}")
        traceback.print_exc()
        raise e
    finally:
        if conn: conn.close()"""

    new_insert_chunk = """def insert_chunk(chunk_id, chunk_records):
    max_retries = 3
    print(f"[Chunk {chunk_id}] Started — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        columns = [
            "Rnc", "NombreRazonSocial", "NombreComercial", "Categoria", "RegimenPagos", 
            "Estado", "ActividadEconomica", "AdministracionLocal", "FacturadorElectronico", 
            "LicenciasVhm", "FechaModificacion"
        ]
        
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
                
            for batch_attempt in range(1, max_retries + 1):
                try:
                    cursor.execute(sql, tuple(params))
                    conn.commit()
                    break
                except Exception as e:
                    err_str = str(e)
                    if batch_attempt > 1 and ("2627" in err_str or "PRIMARY KEY" in err_str.upper()):
                        print(f"    [Chunk {chunk_id}] Ignoring PK violation on retry {batch_attempt}, assuming previous attempt committed successfully.")
                        break
                        
                    if conn:
                        try: conn.rollback()
                        except: pass
                        
                    if batch_attempt < max_retries and is_transient_error(e):
                        wait = 2 ** batch_attempt
                        time.sleep(wait)
                        try: conn.close()
                        except: pass
                        conn = get_db_connection()
                        cursor = conn.cursor()
                    else:
                        raise e
                        
            count += len(batch)
            if count % 10000 == 0 or count == len(chunk_records):
                elapsed = time.time() - t0
                speed = count / elapsed if elapsed > 0 else 0
                print(f"[Chunk {chunk_id}] Inserted {count}/{len(chunk_records)} records. Speed: {speed:.1f} rec/sec")
                
        print(f"[Chunk {chunk_id}] Completed in {time.time() - t0:.2f}s — {len(chunk_records)} records inserted successfully!")
        return len(chunk_records)
    except Exception as e:
        print(f"[Chunk {chunk_id}] PERMANENT ERROR: {e}")
        traceback.print_exc()
        raise e
    finally:
        if conn: conn.close()"""
        
    content = content.replace(old_insert_chunk, new_insert_chunk)

    # 4. Remove PERDIDOS logic
    old_perdidos = """    expected = sum(v["size"] for v in chunk_map.values())
    if total_rows < expected:
        print(f"  PERDIDOS:         {expected - total_rows:>10,} registros")"""
    content = content.replace(old_perdidos, "")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def patch_licencias():
    path = "Bots/Mived Licencias/code/up_Licencias.py"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Connection hosts
    content = content.replace(
        "hosts_to_try = [conn_params[\"server\"], \"localhost\", \"127.0.0.1\", \"sqlserver\"]",
        "hosts_to_try = [\"sqlserver\", conn_params[\"server\"], \"localhost\", \"127.0.0.1\"]"
    )

    # 2. TRUNCATE instead of DELETE
    content = content.replace(
        "cursor.execute(\"DELETE FROM LicenciaConstruccion;\")",
        "cursor.execute(\"TRUNCATE TABLE LicenciaConstruccion;\")"
    )

    # 3. insert_chunk rewrite
    old_insert_chunk = """def insert_chunk(chunk_id, chunk_records, attempt=1):
    import uuid
    max_retries = 3
    print(f"[Chunk {chunk_id}] Attempt {attempt}/{max_retries} — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        columns = [
            "MivedId", "NumeroPermiso", "NombreProyecto", "Tipologia",
            "FechaEntrada", "FechaEmision",
            "Provincia", "Municipio", "UnidadesHabitacionales", "LocalesComerciales"
        ]
        count = 0
        t0 = time.time()
        cols_str = ", ".join(columns)
        placeholder = "%s" if db_lib == "pymssql" else "?"
        row_placeholder = "(" + ", ".join([placeholder] * len(columns)) + ")"

        for i in range(0, len(chunk_records), BATCH_SIZE):
            batch = chunk_records[i : i + BATCH_SIZE]
            placeholders_str = ", ".join([row_placeholder] * len(batch))
            sql = f"INSERT INTO LicenciaConstruccion WITH (TABLOCK) ({cols_str}) VALUES {placeholders_str}"
            params = []
            for r in batch:
                params.append(str(uuid.uuid4()))
                params.extend(r)
            cursor.execute(sql, tuple(params))
            count += len(batch)
            if count % 10000 == 0 or count == len(chunk_records):
                conn.commit()
                elapsed = time.time() - t0
                speed = count / elapsed if elapsed > 0 else 0
                print(f"[Chunk {chunk_id}] Inserted {count}/{len(chunk_records)} records. Speed: {speed:.1f} rec/sec")

        conn.commit()
        print(f"[Chunk {chunk_id}] Completed in {time.time() - t0:.2f}s — {len(chunk_records)} records inserted!")
        return len(chunk_records)
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except:
                pass
        if attempt < max_retries and is_transient_error(e):
            wait = 2 ** attempt
            print(f"[Chunk {chunk_id}] Transient error (attempt {attempt}/{max_retries}): {e}. Retrying in {wait}s...")
            time.sleep(wait)
            return insert_chunk(chunk_id, chunk_records, attempt + 1)
        print(f"[Chunk {chunk_id}] PERMANENT ERROR after {attempt} attempt(s): {e}")
        traceback.print_exc()
        raise e
    finally:
        if conn:
            conn.close()"""

    new_insert_chunk = """def insert_chunk(chunk_id, chunk_records):
    import uuid
    max_retries = 3
    print(f"[Chunk {chunk_id}] Started — {len(chunk_records)} records...")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        columns = [
            "MivedId", "NumeroPermiso", "NombreProyecto", "Tipologia",
            "FechaEntrada", "FechaEmision",
            "Provincia", "Municipio", "UnidadesHabitacionales", "LocalesComerciales"
        ]
        count = 0
        t0 = time.time()
        cols_str = ", ".join(columns)
        placeholder = "%s" if db_lib == "pymssql" else "?"
        row_placeholder = "(" + ", ".join([placeholder] * len(columns)) + ")"

        for i in range(0, len(chunk_records), BATCH_SIZE):
            batch = chunk_records[i : i + BATCH_SIZE]
            placeholders_str = ", ".join([row_placeholder] * len(batch))
            sql = f"INSERT INTO LicenciaConstruccion ({cols_str}) VALUES {placeholders_str}"
            params = []
            for r in batch:
                params.append(str(uuid.uuid4()))
                params.extend(r)
                
            for batch_attempt in range(1, max_retries + 1):
                try:
                    cursor.execute(sql, tuple(params))
                    conn.commit()
                    break
                except Exception as e:
                    err_str = str(e)
                    if batch_attempt > 1 and ("2627" in err_str or "PRIMARY KEY" in err_str.upper()):
                        print(f"    [Chunk {chunk_id}] Ignoring PK violation on retry {batch_attempt}, assuming previous attempt committed successfully.")
                        break
                        
                    if conn:
                        try: conn.rollback()
                        except: pass
                        
                    if batch_attempt < max_retries and is_transient_error(e):
                        wait = 2 ** batch_attempt
                        time.sleep(wait)
                        try: conn.close()
                        except: pass
                        conn = get_db_connection()
                        cursor = conn.cursor()
                    else:
                        raise e
                        
            count += len(batch)
            if count % 10000 == 0 or count == len(chunk_records):
                elapsed = time.time() - t0
                speed = count / elapsed if elapsed > 0 else 0
                print(f"[Chunk {chunk_id}] Inserted {count}/{len(chunk_records)} records. Speed: {speed:.1f} rec/sec")

        print(f"[Chunk {chunk_id}] Completed in {time.time() - t0:.2f}s — {len(chunk_records)} records inserted!")
        return len(chunk_records)
    except Exception as e:
        print(f"[Chunk {chunk_id}] PERMANENT ERROR: {e}")
        traceback.print_exc()
        raise e
    finally:
        if conn:
            conn.close()"""
            
    content = content.replace(old_insert_chunk, new_insert_chunk)

    # 4. Remove PERDIDOS logic
    old_perdidos = """    expected = sum(v["size"] for v in chunk_map.values())
    if total_rows < expected:
        print(f"  PERDIDOS:         {expected - total_rows:>10,} registros")"""
    content = content.replace(old_perdidos, "")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

patch_dgii()
patch_licencias()
print("PATCHES APPLIED")
