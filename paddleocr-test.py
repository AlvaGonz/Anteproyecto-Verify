# pyrefly: ignore [missing-import]
from pathlib import Path
from paddleocr import PaddleOCR

pdf_path = Path(
    r"C:\Users\Alva\OneDrive - Universidad Central del Este\UCE"
    r"\Doceavo Cuatrimestre\Proyecto de Grado"
    r"\Documentos para MODELO aplicacion UCE\Cedula nueva A.pdf"
)

if not pdf_path.is_file():
    raise FileNotFoundError(f"No se encontró el archivo: {pdf_path}")

ocr = PaddleOCR(
    lang="es",
    use_doc_orientation_classify=True,
    use_doc_unwarping=False,
    use_textline_orientation=True,
    engine="paddle",
)

results = ocr.predict(str(pdf_path))

for page_number, result in enumerate(results, start=1):
    print(f"\n--- Página {page_number} ---")
    result.print()
    result.save_to_json("output")

print("\nResultado guardado en la carpeta output/")