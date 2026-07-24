import fitz
doc = fitz.open(r'C:\Users\Alva\Desktop\Anteproyecto-Verify\Certificacion-IPI.pdf')
for i, page in enumerate(doc):
    text = page.get_text()
    print(f'=== PAGE {i+1} ===')
    print(text)
    print()