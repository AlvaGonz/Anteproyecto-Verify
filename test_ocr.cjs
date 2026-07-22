const fs = require('fs');
const path = require('path');

async function testOcr() {
  try {
    const files = [
      "C:\\Users\\Alva\\OneDrive - Universidad Central del Este\\UCE\\Doceavo Cuatrimestre\\Proyecto de Grado\\Documentos para MODELO aplicacion UCE\\Título de Propiedad A.pdf",
      "C:\\Users\\Alva\\OneDrive - Universidad Central del Este\\UCE\\Doceavo Cuatrimestre\\Proyecto de Grado\\Documentos para MODELO aplicacion UCE\\Título de Propiedad B.pdf"
    ];

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        continue;
      }
      console.log(`Processing ${path.basename(filePath)}...`);
      
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      const form = new FormData();
      form.append('file', blob, path.basename(filePath));

      const res = await fetch('http://localhost:8000/api/v1/ocr/extract', {
        method: 'POST',
        body: form
      });

      const data = await res.json();
      const outPath = `ocr_${i === 0 ? 'a' : 'b'}.json`;
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`Saved result to ${outPath}`);
    }
  } catch (err) {
    console.error(err);
  }
}

testOcr();
