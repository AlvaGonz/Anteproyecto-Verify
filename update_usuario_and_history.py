import re

def read_utf8(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def read_utf16(path):
    with open(path, 'r', encoding='utf-16') as f:
        return f.read()

def write_utf8(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

ef_content = read_utf16('src/backend/ef_script.sql')
build_sql = read_utf8('Build-Database-Sql.sql')

# Extract all migrations from ef_script.sql
migrations = re.findall(r"INSERT INTO \[\_\_EFMigrationsHistory\].*?\);", ef_content, re.DOTALL)

# Find where __EFMigrationsHistory inserts are in build_sql
# We will append the missing ones.
existing_migrations = re.findall(r"VALUES \(N?\'([^\']+)\'", build_sql)
new_migrations = []
for m in migrations:
    mig_id = re.search(r"VALUES \(N?\'([^\']+)\'", m).group(1)
    if mig_id not in existing_migrations:
        new_migrations.append(m)

# Update Usuario table definition
usuario_additions = """    Direccion                   VARCHAR(200)  NULL,
    Nickname                    VARCHAR(30)   NULL,
    Provincia                   VARCHAR(50)   NULL,
    AceptoDescargo              BIT           NOT NULL DEFAULT 0,"""
build_sql = re.sub(r'    EmailVerificado             BIT           NOT NULL DEFAULT 0,',
                   f'{usuario_additions}\n    EmailVerificado             BIT           NOT NULL DEFAULT 0,', build_sql)

# Add unique index for Nickname
nickname_idx = "\nIF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Usuario_Nickname' AND object_id = OBJECT_ID(N'[Usuario]'))\n    CREATE UNIQUE INDEX [UQ_Usuario_Nickname] ON [Usuario] ([Nickname]) WHERE [Nickname] IS NOT NULL;\nGO\n"

# We will just append the missing migrations and the unique index
appends = "\n-- ============================================================\n-- ADDED MIGRATIONS HISTORY AND INDEXES\n-- ============================================================\n"
appends += nickname_idx + "\n"
appends += "\nGO\n".join(new_migrations) + "\nGO\n"

build_sql += appends

write_utf8('Build-Database-Sql.sql', build_sql)
print("Updated Usuario and Migrations History successfully.")
