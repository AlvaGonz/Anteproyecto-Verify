import pymssql
import random

print("Connecting to DB...")
conn = pymssql.connect(server='localhost', user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True)
cursor = conn.cursor()

print("Fetching CatastroTitulo...")
cursor.execute("SELECT Rnc, Superficie FROM CatastroTitulo")
catastros = cursor.fetchall()

cat_by_rnc = {}
for c in catastros:
    rnc = c['Rnc']
    cat_by_rnc.setdefault(rnc, []).append(c['Superficie'])

print("Fetching PermisoSuelo...")
cursor.execute("SELECT IdPSuelo, Rnc FROM PermisoSuelo")
permisos = cursor.fetchall()

print("Preparing updates...")
updates = []
for p in permisos:
    rnc = p['Rnc']
    if rnc in cat_by_rnc and cat_by_rnc[rnc]:
        if len(cat_by_rnc[rnc]) > 1:
            # We pop to ensure we don't reuse the same surface if they have multiple
            sup = cat_by_rnc[rnc].pop(random.randint(0, len(cat_by_rnc[rnc])-1))
        else:
            sup = cat_by_rnc[rnc][0]
        updates.append((sup, p['IdPSuelo']))
    else:
        # Fallback if no catastro found (shouldn't happen since we cleaned dummy RNCs)
        updates.append((150.0 * 3.44, p['IdPSuelo']))

print(f"Executing {len(updates)} updates on PermisoSuelo...")
update_query = "UPDATE PermisoSuelo SET Superficie = %s WHERE IdPSuelo = %s"
cursor.executemany(update_query, updates)
conn.commit()

print("Database updated successfully with diverse surfaces!")
conn.close()

# Now re-export the CSVs
from generador_entidades_gubernamentales import export_tables_to_csv
print("Starting re-export of CSVs...")
export_tables_to_csv()
print("All done!")
