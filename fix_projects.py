import csv

consultor_csv_id = '99696AE4-03C5-4F1F-A028-BD1D8C466AA8'.lower()
profesional_csv_id = 'C470AEF4-AC85-41E1-B7A6-C05C8B0CEF64'.lower()
empresa_csv_id = '0C35A8C2-A285-496B-B4B4-115838AEBC5F'.lower()
corporativo_csv_id = '5EC7194E-72CC-43E6-A47F-88312217A23F'.lower()
freemium_csv_id = '5EC7194E-72CC-43E6-A47F-88312217A23F'.lower()

consultor_db_id = '8EECEFD7-2474-4E86-A01F-BB8E80322610'
profesional_db_id = '0545DAAD-6B46-4AE9-8FCD-5D6F87846F55'
empresa_db_id = '4DE35F9B-4E94-4C6B-A704-DC496B98997F'
corporativo_db_id = 'F853C4F0-EF4A-4AB1-8065-2E3EB1092865'

print("Updating CSV file...")
in_csv = r'Bots\ProyectosInmobiliarios\ProyectosInmobiliarios_20260824_220307.csv'
out_csv = r'Bots\ProyectosInmobiliarios\ProyectosInmobiliarios_Nuevos.csv'
sql_out = 'update_projects.sql'

with open(in_csv, 'r', encoding='utf-8') as f:
    rows = list(csv.reader(f))

user_col = 15
status_col = 28

publicado_csv = '8006E230-79A0-40B7-AD3B-B399B564F8F8'.lower()
observacion_csv = 'E82F586D-B007-4F1F-B6CC-3FF2ACB5442A'.lower()
editado_csv = '0694D868-A8AE-42FF-8F88-58E75F4034D2'.lower()
revision_csv = '4F756062-8E28-4907-B633-C6285CE2C5E5'.lower()
creado_csv = '4793E761-8E4A-4414-B64B-BA71FF57EEB5'.lower()

consultor_kept = False
profesional_statuses = set()
empresa_kept_count = 0
empresa_target_count = 10

sql_commands = []

for row in rows:
    if len(row) <= user_col: continue
    uid = row[user_col].lower()
    stat = row[status_col].lower() if len(row) > status_col else ''
    pid = row[1] # CodigoInterno
    
    if uid == consultor_csv_id:
        if stat == publicado_csv and not consultor_kept:
            consultor_kept = True
        else:
            row[user_col] = corporativo_csv_id
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{corporativo_db_id}' WHERE CodigoInterno = '{pid}' AND IdUsuario = '{consultor_db_id}';")
            
    elif uid == profesional_csv_id:
        if stat not in profesional_statuses and len(profesional_statuses) < 5:
            profesional_statuses.add(stat)
        else:
            row[user_col] = corporativo_csv_id
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{corporativo_db_id}' WHERE CodigoInterno = '{pid}' AND IdUsuario = '{profesional_db_id}';")
            
    elif uid == empresa_csv_id:
        if empresa_kept_count < empresa_target_count:
            empresa_kept_count += 1
        else:
            row[user_col] = corporativo_csv_id
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{corporativo_db_id}' WHERE CodigoInterno = '{pid}' AND IdUsuario = '{empresa_db_id}';")

if not consultor_kept:
    for row in rows:
        if row[user_col].lower() == corporativo_csv_id and 'consultor' in str(row).lower():
            row[user_col] = consultor_csv_id
            consultor_kept = True
            break

with open(out_csv, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

with open(sql_out, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_commands))

print(f"Created updated CSV at {out_csv}")
print(f"Created SQL script at {sql_out}")
