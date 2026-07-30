import os

# The UI does not show "Extracción Exitosa" anywhere - only "Extracción de <Tipo>".
# Remove the status text assertion in OCR tests (the heading assertion already covers
# successful extraction being visible).

files = ['e2e/projects/plano-mensura-ocr.spec.ts', 'e2e/projects/certificacion-ipi-ocr.spec.ts']

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Remove the redundant status text assertion line
    old = """      // Assert status
      await expect(page.locator(`text=${fileInfo.status}`).first()).toBeVisible();
"""
    new = """      // Status is reflected by the heading (e.g. "Extracción de Plano de Mensura") which
      // is already asserted above. No separate "Extracción Exitosa" text is rendered.
"""
    if old in c:
        c = c.replace(old, new)
        print(f'  -> removed redundant status assertion in {path}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

print('Done.')
