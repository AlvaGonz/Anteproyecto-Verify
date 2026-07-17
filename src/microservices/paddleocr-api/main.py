from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
import shutil
import tempfile
import os

app = FastAPI(title="PaddleOCR API for VeriFinca", version="1.0.0")

# Initialize PaddleOCR model in memory (loaded once on startup)
# using use_angle_cls=True to auto-rotate if needed, lang='es' for Spanish
ocr = PaddleOCR(use_angle_cls=True, lang='es')

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/ocr/extract")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    try:
        # Save uploaded file to a temporary file for processing
        suffix = ".pdf" if file.filename.lower().endswith(".pdf") else ".png"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
            
        # Run OCR
        # cls=True enables text direction classification
        result = ocr.ocr(temp_path, cls=True)
        
        extracted_text = ""
        # result is a list of lines, where each line is [box, (text, score)]
        # For multi-page PDFs, result is a list of pages.
        # Let's handle both single image and multi-page pdf structures safely.
        
        if result is None:
            extracted_text = ""
        else:
            for page in result:
                if page is None:
                    continue
                for line in page:
                    # line format: [[[x1,y1], [x2,y2], [x3,y3], [x4,y4]], ('text', confidence_score)]
                    if isinstance(line, list) and len(line) == 2 and isinstance(line[1], tuple):
                        text = line[1][0]
                        extracted_text += text + " "
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return {
            "Success": True, 
            "ExtractedText": extracted_text.strip(), 
            "RawJson": str(result)
        }
    except Exception as e:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return {
            "Success": False, 
            "ExtractedText": "", 
            "RawJson": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
