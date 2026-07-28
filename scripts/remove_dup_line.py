path = r'src\frontend\web\src\features\documents\components\CertificadoTituloExtractionCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove duplicate line 363 (1-indexed = lines[362])
# Verify both 362 and 363 are "/>" before deleting
if lines[361].strip() == '/>' and lines[362].strip() == '/>':
    del lines[362]
    print('Deleted duplicate /> line')
else:
    print('Lines not duplicates, aborting')
    print(repr(lines[361]))
    print(repr(lines[362]))

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
