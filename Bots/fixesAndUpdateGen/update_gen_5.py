import re

with open('generador_entidades_gubernamentales.py', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the main function's execution section for Catastro, PS, IPI
# First, I need to make sure the main function actually loads LicenciaConstruccion
main_code_to_inject = '''
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
'''

# Currently, the script has this after JCE tasks:
search_text = '''    print("Submitting Catastro, PermisoSuelo and IPI tasks simultaneously...")
    catastro_chunk = []
    ps_chunk = []
    ipi_chunk = []'''

replacement_text = main_code_to_inject + '''    catastro_chunk = []
    ps_chunk = []
    ipi_chunk = []'''

if search_text in content:
    content = content.replace(search_text, replacement_text)
    with open('generador_entidades_gubernamentales.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully injected generate_linked_records execution into main!")
else:
    print("Could not find the target text to replace in main.")

