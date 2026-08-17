
import pymssql
import random

hosts_to_try = ["sqlserver", "localhost", "127.0.0.1"]
conn = None
for h in hosts_to_try:
    try:
        conn = pymssql.connect(server=h, user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True, login_timeout=5)
        break
    except:
        continue

if not conn:
    raise Exception("Could not connect to database")

cursor = conn.cursor()

print("Fetching Licencias...")
cursor.execute("SELECT MivedId, Provincia, Municipio FROM LicenciaConstruccion")
licencias = cursor.fetchall()
if not licencias:
    print("No licencias found. Exiting.")
    sys.exit(0)

unique_locs = list(set((lic['Provincia'], lic['Municipio']) for lic in licencias))
loc_to_rncs = {loc: [] for loc in unique_locs}

print("Fetching RNCs from CatastroTitulo...")
cursor.execute("""
    SELECT DISTINCT c.Rnc, ISNULL(d.NombreRazonSocial, d.NombreComercial) AS Nombre
    FROM CatastroTitulo c
    JOIN DGII d ON c.Rnc = d.Rnc
""")
catastro_rncs = cursor.fetchall()

print("Fetching DGII fallback...")
cursor.execute("SELECT Rnc, ISNULL(NombreRazonSocial, NombreComercial) AS Nombre FROM DGII WHERE Rnc IS NOT NULL")
dgii_data = cursor.fetchall()

if not catastro_rncs:
    catastro_rncs = dgii_data[:5000] # Use some DGII records if Catastro is empty

available_rncs = list(catastro_rncs)
random.shuffle(available_rncs)

print(f"Distributing {len(available_rncs)} RNCs among {len(unique_locs)} locations...")
while available_rncs:
    for loc in unique_locs:
        if available_rncs:
            loc_to_rncs[loc].append(available_rncs.pop())
        else:
            break

for loc in unique_locs:
    if not loc_to_rncs[loc]:
        loc_to_rncs[loc].append(random.choice(dgii_data))

print(f"Assigning RNCs to {len(licencias)} LicenciaConstruccion records...")
update_lic_sql = "UPDATE LicenciaConstruccion SET Rnc = %s, NombreRazonSocial = %s WHERE MivedId = %s"
lic_params = []
for lic in licencias:
    loc = (lic['Provincia'], lic['Municipio'])
    d = random.choice(loc_to_rncs[loc])
    lic_params.append((d['Rnc'], d['Nombre'], lic['MivedId']))

cursor.executemany(update_lic_sql, lic_params)

print("Aligning CatastroTitulo and PermisoSuelo locations and RNCs...")

# Fetch PermisoSuelo IDs to force an RNC match if needed
cursor.execute("SELECT IdPSuelo FROM PermisoSuelo")
per_ids = [r['IdPSuelo'] for r in cursor.fetchall()]
random.shuffle(per_ids)

update_cat_sql = "UPDATE CatastroTitulo SET Provincia = %s, Municipio = %s WHERE Rnc = %s"
update_per_sql = "UPDATE PermisoSuelo SET Provincia = %s, Municipio = %s, Rnc = %s WHERE IdPSuelo = %s"
update_per_fallback_sql = "UPDATE PermisoSuelo SET Provincia = %s, Municipio = %s WHERE Rnc = %s"

cat_params = []
per_params = []
per_fallback_params = []

for loc, rncs in loc_to_rncs.items():
    prov, mun = loc
    for d in rncs:
        rnc = d['Rnc']
        cat_params.append((prov, mun, rnc))
        
        # Force a PermisoSuelo record to have this RNC and location
        if per_ids:
            pid = per_ids.pop()
            per_params.append((prov, mun, rnc, pid))
        else:
            # If we run out of PermisoSuelo records (unlikely if lengths match), just try by Rnc
            per_fallback_params.append((prov, mun, rnc))

cursor.executemany(update_cat_sql, cat_params)
if per_params:
    cursor.executemany(update_per_sql, per_params)
if per_fallback_params:
    cursor.executemany(update_per_fallback_sql, per_fallback_params)

conn.commit()
conn.close()
print("Done standardizing RNCs and Locations across all tables!")
