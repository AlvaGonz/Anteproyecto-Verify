with open('docker/SQL_Server/entrypoint.sh', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the wait loop with direct execution
new_c = c[:c.find('    for j in')]
new_c += '    echo "[Seed] Running canonical schema rebuild (Build-Database-Sql.sql)..."\n'
new_c += '      -i "" || echo "[Seed] Warning: Build-Database-Sql.sql had errors."\n\n'
new_c += '    echo "[Seed] Running seed files..."\n'
new_c += '    for seed_file in /usr/config/seeds/*.sql; do\n'
new_c += '        [ -f "" ] || continue\n'
new_c += '        echo "[Seed]  -> "\n'
new_c += '          -d "" -i "" \\\n'
new_c += '            || echo "[Seed] Warning:  completed with errors."\n'
new_c += '    done\n\n'
new_c += '    echo "[Seed] All seeds complete."\n'

# Find the end of the original loop
end_loop = c.find('    if [ "" -lt 12 ] 2>/dev/null; then')
end_block = c.find('fi\n)', end_loop) + 4

new_c += c[end_block:]

with open('docker/SQL_Server/entrypoint.sh', 'w', encoding='utf-8') as f:
    f.write(new_c)

print('Updated entrypoint.sh successfully!')
