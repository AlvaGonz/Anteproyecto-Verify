import os
import glob
import csv

with open('generate_dummy_projects.py', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to inject CSV cache checking right before generation
inject_code = '''
# ---------------------------------------------------------
# CSV CACHE CHECK
# ---------------------------------------------------------
def get_latest_csv(folder_path):
    search_pattern = os.path.join(folder_path, '*.csv')
    files = glob.glob(search_pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

csv_cache_path = get_latest_csv(os.path.abspath(os.path.join(os.path.dirname(__file__), "Bots", "ProyectosInmobiliarios")))
if csv_cache_path:
    print(f"Found CSV cache for ProyectosInmobiliarios: {csv_cache_path}")
    print("Generating SQL from CSV instead of random seeds...")
    
    lines = []
    lines.append("-- ============================================================")
    lines.append("-- 14_Proyectos_Realistas.sql (RESTORED FROM CSV CACHE)")
    lines.append("-- ============================================================")
    lines.append("SET NOCOUNT ON;")
    lines.append("SET QUOTED_IDENTIFIER ON;")
    lines.append("")
    
    with open(csv_cache_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="|")
        for row in reader:
            codigo = row["CodigoInterno"].replace("'", "''")
            lines.append(f"IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE CodigoInterno = '{codigo}')")
            lines.append("BEGIN")
            
            cols = []
            vals = []
            for k, v in row.items():
                if v != "":
                    cols.append(k)
                    # if it's a UUID, Date, or string, we quote it (unless it's a number that parses to float/int, but quoting strings is safer for SQL inserts if they aren't strict numeric)
                    # Actually, simple string replacement is safer for exact reproduction
                    val_safe = v.replace("'", "''")
                    if val_safe.lower() in ['true', 'false']:
                        vals.append('1' if val_safe.lower()=='true' else '0')
                    elif val_safe.replace('.', '', 1).isdigit():
                        vals.append(val_safe)
                    else:
                        vals.append(f"'{val_safe}'")
            
            col_str = ", ".join(cols)
            val_str = ", ".join(vals)
            lines.append(f"    INSERT INTO ProyectosInmobiliarios ({col_str}) VALUES ({val_str});")
            lines.append("END")
            
    with open(os.path.join(output_dir, "14_Proyectos_Realistas.sql"), "w", encoding="utf-8") as f:
        f.write("\\n".join(lines) + "\\n")
    print("Generated 14_Proyectos_Realistas.sql from CSV Cache successfully.")
    import sys
    sys.exit(0)
# ---------------------------------------------------------
'''

search = 'lines = []\nlines.append("-- ============================================================")'
new_content = content.replace(search, inject_code + '\n' + search)

with open('generate_dummy_projects.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully injected CSV logic into generate_dummy_projects.py")
