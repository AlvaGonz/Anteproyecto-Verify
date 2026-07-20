const { execSync } = require('child_process');
execSync('curl.exe -F "file=@test.pdf" http://localhost:8000/api/v1/ocr/extract', {stdio: 'inherit'});
