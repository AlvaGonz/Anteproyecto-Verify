import re

def read_utf16(path):
    with open(path, 'r', encoding='utf-16') as f:
        return f.read()

def read_utf8(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_utf8(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

ef_content = read_utf16('src/backend/ef_script.sql')

tables_to_add = ['Invitaciones', 'LicenciaConstruccion', 'ProyectoGuardado', 'ProyectoInteres', 'ProyectosEstados', 'SesionUsuario', 'Verificacion2FA']

new_schema_blocks = []
for t in tables_to_add:
    # Match CREATE TABLE with IF OBJECT_ID wrapper for idempotency
    match = re.search(r'CREATE TABLE \[' + t + r'\].*?\n    \);', ef_content, re.DOTALL)
    if match:
        table_def = match.group(0)
        wrapped = f"""IF OBJECT_ID(N'[{t}]', 'U') IS NULL\nBEGIN\n    {table_def}\nEND"""
        new_schema_blocks.append(wrapped)
    else:
        print("COULD NOT FIND TABLE:", t)
    
    idx_matches = re.finditer(r'CREATE (UNIQUE )?INDEX \[IX_' + t + r'_.*?;', ef_content)
    for idx in idx_matches:
        idx_def = idx.group(0)
        # Extract index name
        idx_name_match = re.search(r'\[(IX_[^\]]+)\]', idx_def)
        idx_name = idx_name_match.group(1) if idx_name_match else 'UNKNOWN'
        
        wrapped_idx = f"""IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = '{idx_name}' AND object_id = OBJECT_ID(N'[{t}]'))\nBEGIN\n    {idx_def}\nEND"""
        new_schema_blocks.append(wrapped_idx)

# Append to Build-Database-Sql.sql
build_sql = read_utf8('Build-Database-Sql.sql')

# Remove ResultadosRegla
build_sql = re.sub(r'IF OBJECT_ID\(N\'\[ResultadosRegla\]\', \'U\'\) IS NULL\s*CREATE TABLE \[ResultadosRegla\][^;]+;\s*GO\s*', '', build_sql, flags=re.DOTALL)
build_sql = re.sub(r'IF NOT EXISTS \(SELECT 1 FROM sys\.indexes WHERE name = \'IX_ResultadosRegla_ValidacionId\'.*?\[ValidacionId\]\);\s*GO\s*', '', build_sql, flags=re.DOTALL)

# Remove ValidacionesAyuntamiento
build_sql = re.sub(r'IF OBJECT_ID\(N\'\[ValidacionesAyuntamiento\]\', \'U\'\) IS NULL\s*CREATE TABLE \[ValidacionesAyuntamiento\][^;]+;\s*GO\s*', '', build_sql, flags=re.DOTALL)
build_sql = re.sub(r'IF NOT EXISTS \(SELECT 1 FROM sys\.indexes WHERE name = \'IX_ValidacionesAyuntamiento_ProyectoId\'.*?\[ProyectoId\]\);\s*GO\s*', '', build_sql, flags=re.DOTALL)

# Add new schemas at the end
new_content_str = '\nGO\n\n'.join(new_schema_blocks) + '\nGO\n'
build_sql = build_sql + '\n-- ============================================================\n-- ADDED NEW TABLES FROM SCHEMA DIFF\n-- ============================================================\n\n' + new_content_str

write_utf8('Build-Database-Sql.sql', build_sql)
print('Successfully updated Build-Database-Sql.sql')
