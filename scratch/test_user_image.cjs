const fs = require('fs');

async function run() {
    const filePath = "C:\\Users\\Alva\\OneDrive - Universidad Central del Este\\UCE\\Doceavo Cuatrimestre\\Proyecto de Grado\\Documentos para MODELO aplicacion UCE\\Cedula nueva A.webp";
    const file = fs.readFileSync(filePath);
    
    const formData = new FormData();
    const blob = new Blob([file], { type: 'image/webp' });
    formData.append('file', blob, 'Cedula nueva A.webp');
    
    try {
        const response = await fetch('http://localhost:8000/api/v1/ocr/extract', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log("ExtractedText:\\n", data.ExtractedText);
        console.log("\\nRawJson:\\n", data.RawJson);
    } catch (err) {
        console.error(err);
    }
}
run();
