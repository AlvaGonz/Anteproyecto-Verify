import pymssql
conn = pymssql.connect(server='localhost', user='sa', password='Your_password123', database='verifinca-spm-uce-2026', as_dict=True)
cursor = conn.cursor()
cursor.execute("SELECT TOP 1 * FROM CatastroTitulo")
print(cursor.fetchall())
conn.close()
