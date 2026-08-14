import pymssql
import random

conn = pymssql.connect(server='localhost', user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True)
cursor = conn.cursor()

print("Fetching DGII data...")
cursor.execute("SELECT Rnc, ISNULL(NombreRazonSocial, NombreComercial) AS Nombre FROM DGII WHERE Rnc IS NOT NULL")
dgii_data = cursor.fetchall()
print(f"Loaded {len(dgii_data)} DGII records.")

cursor.execute("SELECT MivedId FROM LicenciaConstruccion")
licencias = cursor.fetchall()

print(f"Updating {len(licencias)} LicenciaConstruccion records...")
update_sql = "UPDATE LicenciaConstruccion SET Rnc = %s, NombreRazonSocial = %s WHERE MivedId = %s"
params = []

for lic in licencias:
    d = random.choice(dgii_data)
    params.append((d['Rnc'], d['Nombre'], lic['MivedId']))

cursor.executemany(update_sql, params)
conn.commit()
conn.close()
print("Done updating LicenciaConstruccion!")
