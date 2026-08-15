import pymssql
import csv
import datetime
import os

conn = pymssql.connect(server='localhost', user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True)
cursor = conn.cursor()

tables_to_export = [
    ("PermisoSuelo", "Bots/PermisoSuelo/PermisoSuelo_{date}.csv"),
    ("JCE_Ciudadano", "Bots/JCE_Ciudadano/JCE_Ciudadano_{date}.csv"),
    ("CatastroTitulo", "Bots/CatastroTitulo/CatastroTitulo_{date}.csv"),
    ("PagoIPI", "Bots/PagoIPI/PagoIPI_{date}.csv"),
    ("ProyectosInmobiliarios", "Bots/ProyectosInmobiliarios/ProyectosInmobiliarios_{date}.csv")
]

date_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

for table, path_template in tables_to_export:
    path = path_template.format(date=date_str)
    print(f"Exporting {table} to {path}...")
    
    # We will export in chunks to prevent memory overload (CatastroTitulo is 1.3M rows)
    # Using raw cursor to avoid dict memory overhead for millions of rows
    cursor_raw = conn.cursor()
    cursor_raw.execute(f"SELECT * FROM {table}")
    
    # Get column names
    col_names = [col[0] for col in cursor_raw.description]
    
    with open(path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter='|')
        writer.writerow(col_names)
        
        while True:
            rows = cursor_raw.fetchmany(100000)
            if not rows:
                break
            # Convert values to strings, handling None
            for row in rows:
                str_row = [str(x) if x is not None else '' for x in row]
                writer.writerow(str_row)
                
    print(f"Finished exporting {table}.")

conn.close()
print("All exports completed successfully!")
