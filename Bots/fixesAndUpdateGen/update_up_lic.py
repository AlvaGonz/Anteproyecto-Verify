import re

with open('Bots/Mived Licencias/code/up_Licencias.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update columns in insert_chunk
old_cols = '''        columns = [
            "MivedId", "NumeroPermiso", "NombreProyecto", "Tipologia",
            "FechaEntrada", "FechaEmision",
            "Provincia", "Municipio", "UnidadesHabitacionales", "LocalesComerciales"
        ]'''
new_cols = '''        columns = [
            "MivedId", "NumeroPermiso", "NombreProyecto", "Tipologia",
            "FechaEntrada", "FechaEmision",
            "Provincia", "Municipio", "UnidadesHabitacionales", "LocalesComerciales",
            "Rnc", "NombreRazonSocial"
        ]'''
content = content.replace(old_cols, new_cols)

# 2. Update the main function to fetch DGII and append to records
old_parse_loop = '''    records_generator = parse_excel(file_path)
    current_chunk = []
    chunk_count = 0
    futures = []
    chunk_map = {}
    t_start = time.time()

    with ThreadPoolExecutor(max_workers=6) as executor:
        for record in records_generator:
            current_chunk.append(record)'''

new_parse_loop = '''    print("Fetching DGII data for RNC assignment...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Rnc, ISNULL(NombreRazonSocial, NombreComercial) FROM DGII WHERE Rnc IS NOT NULL")
        dgii_data = cursor.fetchall()
        conn.close()
        import random
        if not dgii_data:
            dgii_data = [('000000000', 'Desconocido')]
        print(f"Loaded {len(dgii_data)} DGII records.")
    except Exception as e:
        print(f"Error loading DGII: {e}")
        dgii_data = [('000000000', 'Desconocido')]

    records_generator = parse_excel(file_path)
    current_chunk = []
    chunk_count = 0
    futures = []
    chunk_map = {}
    t_start = time.time()

    with ThreadPoolExecutor(max_workers=6) as executor:
        for record in records_generator:
            d = random.choice(dgii_data)
            record = list(record)
            record.extend([d[0], d[1]])
            current_chunk.append(tuple(record))'''

content = content.replace(old_parse_loop, new_parse_loop)

with open('Bots/Mived Licencias/code/up_Licencias.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated up_Licencias.py successfully")
