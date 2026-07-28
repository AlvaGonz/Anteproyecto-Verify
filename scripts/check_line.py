path = r'src\frontend\web\src\features\documents\components\CertificadoTituloExtractionCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Delete line 363 (1-based) — duplicate "                />"
# Find the duplicate "                />"
for i, line in enumerate(lines):
    if i >= 360 and i <= 365:
        print(f'{i+1}: {repr(line)}')
