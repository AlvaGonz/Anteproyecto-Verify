import os

for root, _, files in os.walk('e2e'):
    for fn in files:
        if fn.endswith('.spec.ts'):
            path = os.path.join(root, fn)
            with open(path, 'r', encoding='utf-8') as f:
                c = f.read()
            count = c.count('Extracción Exitosa')
            if count > 0:
                print(f'{count:3d} hits: {path}')
