import pymssql
import random

conn = pymssql.connect(server='localhost', user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True)
cursor = conn.cursor()

# 1. First, multiply CatastroTitulo Superficie by 3.44
print("Updating CatastroTitulo Superficie x3.44...")
cursor.execute("UPDATE CatastroTitulo SET Superficie = Superficie * 3.44")
conn.commit()

# 2. Get all PermisoSuelo records
cursor.execute("SELECT Id, Rnc FROM PermisoSuelo")
permisos = cursor.fetchall()

# 3. For each PermisoSuelo, find ONE CatastroTitulo with the same RNC, and copy its Superficie
print(f"Syncing {len(permisos)} PermisoSuelo records with their CatastroTitulo...")
update_ps_sql = "UPDATE PermisoSuelo SET Superficie = %s WHERE Id = %s"
params = []

for p in permisos:
    rnc = p['Rnc']
    cursor.execute("SELECT TOP 1 Superficie FROM CatastroTitulo WHERE Rnc = %s", (rnc,))
    cat = cursor.fetchone()
    if cat:
        sup = cat['Superficie']
    else:
        # If none found for some reason, just multiply 150*3.44 as a fallback
        sup = 150.0 * 3.44
    params.append((sup, p['Id']))

cursor.executemany(update_ps_sql, params)
conn.commit()

# 4. Remove fake dummy RNCs from IPI if any (all IPI RNCs should match DGII)
print("Cleaning dummy RNCs from IPI and CatastroTitulo...")
cursor.execute("DELETE FROM PagoIPI WHERE Rnc NOT IN (SELECT Rnc FROM DGII)")
cursor.execute("DELETE FROM CatastroTitulo WHERE Rnc NOT IN (SELECT Rnc FROM DGII)")
conn.commit()

conn.close()
print("SQL database perfectly synchronized with the new logic!")
