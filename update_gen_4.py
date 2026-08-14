import re

with open('generador_entidades_gubernamentales.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Superficie rule in generate_catastro_ps_ipi_records
old_cat_sup = '''                superficie = random.choice(SUPERFICIE_OPTIONS)'''
new_cat_sup = '''                base_superficie = random.choice(SUPERFICIE_OPTIONS)
                superficie = base_superficie * 3.44'''
content = content.replace(old_cat_sup, new_cat_sup)

# 2. Add generate_linked_records function before main
linked_gen = '''
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

def main():'''

content = content.replace("def main():", linked_gen)

# 3. Update main to execute the linked records generator FIRST
old_main_submit = '''    print("Loading LicenciaConstruccion to use as base for PermisoSuelo...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MivedId, NumeroPermiso, Provincia, Municipio, UnidadesHabitacionales, LocalesComerciales FROM LicenciaConstruccion")'''

new_main_submit = '''    print("Loading LicenciaConstruccion to use as base for Linked Generation...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MivedId, NumeroPermiso, Provincia, Municipio, UnidadesHabitacionales, LocalesComerciales, Rnc FROM LicenciaConstruccion")'''

content = content.replace(old_main_submit, new_main_submit)
content = content.replace('''"UnidadesHabitacionales": r[4], "LocalesComerciales": r[5]} for r in lic_rows]''', '''"UnidadesHabitacionales": r[4], "LocalesComerciales": r[5], "Rnc": r[6]} for r in lic_rows]''')

old_ps_submit = '''    print("Submitting PermisoSuelo tasks...")
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

    print("Submitting Catastro and IPI tasks simultaneously...")'''

new_ps_submit = '''    print("Submitting Linked Generation (Catastro + PS + IPI from Licencias)...")
    t_ps_start = time.time()
    catastro_chunk = []
    ps_chunk = []
    ipi_chunk = []
    c_count, p_count, i_count = 0, 0, 0
    
    with ThreadPoolExecutor(max_workers=6) as executor:
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
            
    t_ps_end = time.time()
    print("Submitting remaining Catastro and IPI tasks simultaneously...")'''

content = content.replace(old_ps_submit, new_ps_submit)

with open('generador_entidades_gubernamentales.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated generador_entidades_gubernamentales.py successfully")
