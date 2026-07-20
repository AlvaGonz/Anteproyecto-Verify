import sys

try:
    from fpdf import FPDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(40, 10, 'Hello World!')
    pdf.output('test.pdf', 'F')
except ImportError:
    pass # If fpdf is not installed, we'll try without it if test.pdf exists, else fail

from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='es')
result = ocr.ocr('test.pdf', cls=True)
print("Type of result:", type(result))
print("Len of result:", len(result) if result else 0)
if result and len(result) > 0:
    print("Type of result[0]:", type(result[0]))
print("Result:", result)
