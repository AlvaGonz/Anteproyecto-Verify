import os

fixes = [
    ('e2e/projects/validation.spec.ts', 'Pendiente', 'Requerido'),
    ('e2e/projects/upload-edge-cases.spec.ts', 'Pendiente', 'Requerido'),
]

for path, old, new in fixes:
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    if old in c:
        count = c.count(old)
        c = c.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'  -> replaced {count} occurrences in {path}')
print('Done.')
