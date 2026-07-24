import sys
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='es')
result = ocr.ocr('requirements.txt', cls=True)
print("Result for requirements.txt:", result)
