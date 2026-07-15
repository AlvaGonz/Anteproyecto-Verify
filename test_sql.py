import pymssql
conn = pymssql.connect(server="sqlserver", port=1433, user="sa", password="Your_password123", database="verifinca-spm-uce-2026", autocommit=True)
cursor = conn.cursor()
with open("/src/Build-Database-Sql.sql", "r", encoding="utf-8") as f:
    sql = f.read()
batches = sql.split("GO")
for i, batch in enumerate(batches):
    if batch.strip():
        try:
            cursor.execute(batch)
        except Exception as e:
            print(f"Error in batch {i}: {e}")
            print("Batch preview:", batch.strip()[:100])
