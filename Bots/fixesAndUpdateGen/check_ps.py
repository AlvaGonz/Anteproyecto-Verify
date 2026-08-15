import pymssql
conn = pymssql.connect(server='localhost', user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True)
cursor = conn.cursor()
cursor.execute("SELECT TOP 10 IdPSuelo, Rnc, Superficie FROM PermisoSuelo")
print("PermisoSuelo:")
for r in cursor.fetchall():
    print(r)
cursor.execute("SELECT TOP 10 IdCatastro, Rnc, Superficie FROM CatastroTitulo")
print("\nCatastroTitulo:")
for r in cursor.fetchall():
    print(r)
conn.close()
