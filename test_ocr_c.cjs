const fs = require('fs');
const path = require('path');

async function testOcr() {
  try {
    const filePath = "C:\\Users\\Alva\\OneDrive - Universidad Central del Este\\UCE\\Doceavo Cuatrimestre\\Proyecto de Grado\\Documentos para MODELO aplicacion UCE\\Título de Propiedad\\Cert.  505483687149 Exp. 2024-0086769.pdf";
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
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
    fs.writeFileSync('ocr_c.json', JSON.stringify(data, null, 2));
    
    // Also print out the raw words to see the text flow
    const fullText = data.text_blocks.map(b => b.text).join(' ');
    console.log("\nRAW TEXT:\n", fullText);

  } catch (err) {
    console.error(err);
  }
}

testOcr();
