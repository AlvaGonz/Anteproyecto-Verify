import requests
import json

url = "http://localhost:8000/api/v1/ocr/extract"
file_path = r"C:\Users\Alva\OneDrive - Universidad Central del Este\UCE\Doceavo Cuatrimestre\Proyecto de Grado\Documentos para MODELO aplicacion UCE\Cedula nueva A.webp"

try:
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        data = response.json()
        print("ExtractedText:", data.get("ExtractedText"))
        print("\nRawJson:", data.get("RawJson"))
    else:
        print("Error:", response.status_code, response.text)
except Exception as e:
    print("Exception:", e)
