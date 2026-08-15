import re

with open('generador_entidades_gubernamentales.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CREATE TABLE PermisoSuelo
content = content.replace(
'''            Seccion VARCHAR(100) NULL,
            Lugar VARCHAR(100) NULL
        );''',
'''            Seccion VARCHAR(100) NULL,
            Lugar VARCHAR(100) NULL,
            MivedId UNIQUEIDENTIFIER NULL,
            UnidadesHabitacionales INT NULL,
            LocalesComerciales INT NULL
        );''')

# 2. Update ALTER TABLE PermisoSuelo
content = content.replace(
'''        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Lugar') ALTER TABLE PermisoSuelo ADD Lugar VARCHAR(100) NULL;
    END''',
'''        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'Lugar') ALTER TABLE PermisoSuelo ADD Lugar VARCHAR(100) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'MivedId') ALTER TABLE PermisoSuelo ADD MivedId UNIQUEIDENTIFIER NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'UnidadesHabitacionales') ALTER TABLE PermisoSuelo ADD UnidadesHabitacionales INT NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PermisoSuelo') AND name = 'LocalesComerciales') ALTER TABLE PermisoSuelo ADD LocalesComerciales INT NULL;
    END''')

# 3. Add generate_ps_records function
ps_gen_func = '''
def generate_ps_records(licencias_list, rncs_list):
    import datetime
    start_date = datetime.date(2026, 7, 1)
    departamentos = ["NORTE", "SUR", "ESTE", "OESTE", "DISTRITO NACIONAL"]
    for licencia in licencias_list:
        mived_id = licencia["MivedId"]
        num_permiso = licencia["NumeroPermiso"]
        provincia = licencia["Provincia"]
        municipio = licencia["Municipio"]
        unidades = licencia["UnidadesHabitacionales"]
        locales = licencia["LocalesComerciales"]
        
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
            
        yield {
            "id": str(uuid.uuid4()).upper(), "num_permiso": num_permiso,
            "num_exp": num_exp, "fecha": fecha_emision.strftime("%Y-%m-%d"),
            "rnc": random.choice(rncs_list), "provincia": provincia, "municipio": municipio,
            "lat": lat, "lon": lon, "superficie": random.choice(SUPERFICIE_OPTIONS),
            "tiene_permiso": tiene_permiso,
            "departamento": random.choice(departamentos),
            "operacion": random.choice(["MENSURA", "DESLINDE", "SUBDIVISION", "REFUNDICION"]),
            "seccion": "SECCION " + str(random.randint(1, 10)),
            "lugar": "LUGAR " + str(random.randint(1, 100)),
            "mived_id": mived_id,
            "unidades": unidades,
            "locales": locales
        }

TRANSIENT_ERROR_CODES ='''

content = content.replace("TRANSIENT_ERROR_CODES =", ps_gen_func)

# 4. Remove PermisoSuelo from generate_catastro_ps_ipi_records
old_ps_gen = '''                ps_record = None
                if random.random() < 0.4877:
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
                        "tiene_permiso": tiene_permiso,
                        "departamento": random.choice(departamentos),
                        "operacion": random.choice(["MENSURA", "DESLINDE", "SUBDIVISION", "REFUNDICION"]),
                        "seccion": "SECCION " + str(random.randint(1, 10)),
                        "lugar": "LUGAR " + str(random.randint(1, 100))
                    }
                    
                ipi_record = None'''

content = content.replace(old_ps_gen, '''                ps_record = None
                ipi_record = None''')

# 5. Update insert_ps_chunk
old_insert_ps = '''            sql_ps = f"INSERT INTO PermisoSuelo (IdPSuelo, NumeroPermiso, NumeroExpediente, FechaEmision, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, TienePermiso, Documento, Departamento, Operacion, Seccion, Lugar) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, NULL, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_ps = []
            for p in batch:
                params_ps.extend([p["id"], p["num_permiso"], p["num_exp"], p["fecha"], p["rnc"], p["provincia"], p["municipio"], p["lat"], p["lon"], p["superficie"], p["tiene_permiso"], p["departamento"], p["operacion"], p["seccion"], p["lugar"]])'''

new_insert_ps = '''            sql_ps = f"INSERT INTO PermisoSuelo (IdPSuelo, NumeroPermiso, NumeroExpediente, FechaEmision, Rnc, Provincia, Municipio, Latitud, Longitud, Superficie, TienePermiso, Documento, Departamento, Operacion, Seccion, Lugar, MivedId, UnidadesHabitacionales, LocalesComerciales) VALUES " + ", ".join([f"({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, NULL, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})"] * len(batch))
            params_ps = []
            for p in batch:
                params_ps.extend([p["id"], p["num_permiso"], p["num_exp"], p["fecha"], p["rnc"], p["provincia"], p["municipio"], p["lat"], p["lon"], p["superficie"], p["tiene_permiso"], p["departamento"], p["operacion"], p["seccion"], p["lugar"], p.get("mived_id"), p.get("unidades"), p.get("locales")])'''

content = content.replace(old_insert_ps, new_insert_ps)

# 6. Update main() to process PS separately
old_main_submit = '''    print("Submitting Catastro, PermisoSuelo and IPI tasks simultaneously...")
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
    
    print("\\n" + "=" * 55)
    print("  RESUMEN FINAL ?" GENERADOR SEEDS DGII, MIVED, ETC.")
    print("=" * 55)
    print(f"JCE: {int(m_jce)} minutos {int(s_jce)} segundos")
    print(f"Catastro, PermisoSuelo e IPI: {int(m_cat_ps)} minutos {int(s_cat_ps)} segundos")
    print("-" * 55)
    print(f"TIEMPO TOTAL: {int(m_tot)} minutos {int(s_tot)} segundos")
    print("=" * 55 + "\\n")'''

new_main_submit = '''    print("Loading LicenciaConstruccion to use as base for PermisoSuelo...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MivedId, NumeroPermiso, Provincia, Municipio, UnidadesHabitacionales, LocalesComerciales FROM LicenciaConstruccion")
        lic_rows = cursor.fetchall()
        conn.close()
        licencias_list = [{"MivedId": r[0], "NumeroPermiso": r[1], "Provincia": r[2], "Municipio": r[3], "UnidadesHabitacionales": r[4], "LocalesComerciales": r[5]} for r in lic_rows]
        print(f"Loaded {len(licencias_list)} records from LicenciaConstruccion.")
    except Exception as e:
        print(f"Could not load LicenciaConstruccion: {e}")
        licencias_list = []

    print("Submitting PermisoSuelo tasks...")
    t_ps_start = time.time()
    ps_chunk = []
    p_count = 0
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures_ps = []
        for ps_r in generate_ps_records(licencias_list, rncs_list):
            ps_chunk.append(ps_r)
            if len(ps_chunk) >= chunk_size:
                p_count += 1
                futures_ps.append(executor.submit(insert_ps_chunk, f"PS_{p_count}", ps_chunk))
                ps_chunk = []
        if ps_chunk:
            p_count += 1
            futures_ps.append(executor.submit(insert_ps_chunk, f"PS_{p_count}", ps_chunk))
        for fut in as_completed(futures_ps):
            try: fut.result()
            except Exception as e: print(f"Worker error PS: {e}")
    t_ps_end = time.time()

    print("Submitting Catastro and IPI tasks simultaneously...")
    catastro_chunk = []
    ipi_chunk = []
    c_count = 0
    i_count = 0
    t_cat_ipi_start = time.time()
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures_all = []
        for cat_r, ps_r, ipi_r in generate_catastro_ps_ipi_records(rncs_list):
            catastro_chunk.append(cat_r)
            if ipi_r is not None:
                ipi_chunk.append(ipi_r)
                
            if len(catastro_chunk) >= chunk_size:
                c_count += 1
                futures_all.append(executor.submit(insert_catastro_chunk, f"CAT_{c_count}", catastro_chunk))
                catastro_chunk = []
                
            if len(ipi_chunk) >= chunk_size:
                i_count += 1
                futures_all.append(executor.submit(insert_ipi_chunk, f"IPI_{i_count}", ipi_chunk))
                ipi_chunk = []
                
        if catastro_chunk:
            c_count += 1
            futures_all.append(executor.submit(insert_catastro_chunk, f"CAT_{c_count}", catastro_chunk))
        if ipi_chunk:
            i_count += 1
            futures_all.append(executor.submit(insert_ipi_chunk, f"IPI_{i_count}", ipi_chunk))
            
        print("Waiting for Catastro, IPI completion...")
        for fut in as_completed(futures_all):
            try: fut.result()
            except Exception as e: print(f"Worker error CAT/IPI: {e}")
                
    t_cat_ipi_end = time.time()
            
    t_total = time.time() - t_start
    m_jce, s_jce = divmod(t_jce_end - t_jce_start, 60)
    m_ps, s_ps = divmod(t_ps_end - t_ps_start, 60)
    m_cat_ipi, s_cat_ipi = divmod(t_cat_ipi_end - t_cat_ipi_start, 60)
    m_tot, s_tot = divmod(t_total, 60)
    
    print("\\n" + "=" * 55)
    print("  RESUMEN FINAL — GENERADOR SEEDS DGII, MIVED, ETC.")
    print("=" * 55)
    print(f"JCE: {int(m_jce)} minutos {int(s_jce)} segundos")
    print(f"PermisoSuelo: {int(m_ps)} minutos {int(s_ps)} segundos")
    print(f"Catastro e IPI: {int(m_cat_ipi)} minutos {int(s_cat_ipi)} segundos")
    print("-" * 55)
    print(f"TIEMPO TOTAL: {int(m_tot)} minutos {int(s_tot)} segundos")
    print("=" * 55 + "\\n")'''

content = content.replace(old_main_submit, new_main_submit)

with open('generador_entidades_gubernamentales.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Changes applied successfully!")
