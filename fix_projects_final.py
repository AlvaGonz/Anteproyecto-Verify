import os
import sys

consultor_csv_id = '99696AE4-03C5-4F1F-A028-BD1D8C466AA8'.lower()
profesional_csv_id = 'C470AEF4-AC85-41E1-B7A6-C05C8B0CEF64'.lower()
empresa_csv_id = '0C35A8C2-A285-496B-B4B4-115838AEBC5F'.lower()
corporativo_csv_id = '5EC7194E-72CC-43E6-A47F-88312217A23F'.lower()
freemium_csv_id = '5EC7194E-72CC-43E6-A47F-88312217A23F'.lower()

consultor_db_id = '8EECEFD7-2474-4E86-A01F-BB8E80322610'.lower()
profesional_db_id = '0545DAAD-6B46-4AE9-8FCD-5D6F87846F55'.lower()
empresa_db_id = '4DE35F9B-4E94-4C6B-A704-DC496B98997F'.lower()
corporativo_db_id = 'F853C4F0-EF4A-4AB1-8065-2E3EB1092865'.lower()
admin_db_id = '2EA184A5-70ED-49D6-AC20-9DA492A711FA'.lower()

in_csv = r'Bots\ProyectosInmobiliarios\ProyectosInmobiliarios_20260824_220307.csv'
out_csv = r'Bots\ProyectosInmobiliarios\ProyectosInmobiliarios_Nuevos.csv'
sql_out = 'update_projects2.sql'

with open(in_csv, 'r', encoding='utf-8') as f:
    lines = f.readlines()

publicado_csv = '8006E230-79A0-40B7-AD3B-B399B564F8F8'.lower()
observacion_csv = 'E82F586D-B007-4F1F-B6CC-3FF2ACB5442A'.lower()
editado_csv = '0694D868-A8AE-42FF-8F88-58E75F4034D2'.lower()
revision_csv = '4F756062-8E28-4907-B633-C6285CE2C5E5'.lower()
creado_csv = '4793E761-8E4A-4414-B64B-BA71FF57EEB5'.lower()

consultor_kept = False
profesional_statuses = set()
empresa_kept_count = 0
empresa_target_count = 10

new_lines = []
sql_commands = []

for line in lines:
    parts = line.strip().split(',')
    if len(parts) < 15:
        new_lines.append(line)
        continue
    
    # User ID is the 16th column if no extra commas. If there are extra commas, it shifts.
    # It is exactly 14 positions from the right end of the row in the sample:
    # 5EC7194E-72CC-43E6-A47F-88312217A23F,2026-07-27,2026-07-27,, , , ,,50.00,,,,,,329FCDB4...,,
    # Let's just find the GUID by checking the parts
    uid_index = -1
    for i, p in enumerate(parts):
        pl = p.lower()
        if pl in [consultor_csv_id, profesional_csv_id, empresa_csv_id, corporativo_csv_id]:
            uid_index = i
            break
            
    if uid_index == -1:
        new_lines.append(line)
        continue
        
    uid = parts[uid_index].lower()
    pid = parts[1] # CodigoInterno is always index 1 (no commas in GUID)
    
    # Status ID is near the end
    stat = ""
    stat_index = -1
    for i, p in enumerate(parts):
        pl = p.lower()
        if pl in [publicado_csv, observacion_csv, editado_csv, revision_csv, creado_csv]:
            stat = pl
            stat_index = i
            break

    if uid == consultor_csv_id:
        if stat == publicado_csv and not consultor_kept:
            consultor_kept = True
        else:
            parts[uid_index] = corporativo_csv_id
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{corporativo_db_id}' WHERE CodigoInterno = '{pid}';")
            
    elif uid == profesional_csv_id:
        if stat not in profesional_statuses and len(profesional_statuses) < 5:
            profesional_statuses.add(stat)
        else:
            parts[uid_index] = corporativo_csv_id
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{corporativo_db_id}' WHERE CodigoInterno = '{pid}';")
            
    elif uid == empresa_csv_id:
        if empresa_kept_count < empresa_target_count:
            empresa_kept_count += 1
        else:
            parts[uid_index] = corporativo_csv_id
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{corporativo_db_id}' WHERE CodigoInterno = '{pid}';")

    new_lines.append(','.join(parts) + '\n')

if not consultor_kept:
    for i, line in enumerate(new_lines):
        if corporativo_csv_id in line.lower() and 'consultor' in line.lower():
            new_lines[i] = line.replace(corporativo_csv_id.upper(), consultor_csv_id.upper())
            parts = new_lines[i].split(',')
            sql_commands.append(f"UPDATE ProyectosInmobiliarios SET IdUsuario = '{consultor_db_id}' WHERE CodigoInterno = '{parts[1]}';")
            consultor_kept = True
            break

with open(out_csv, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(sql_out, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_commands))

print(f"Created updated CSV at {out_csv}")
print(f"Created SQL script at {sql_out} with {len(sql_commands)} commands.")
