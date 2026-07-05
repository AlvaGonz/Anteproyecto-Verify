const fs = require('fs');
const path = require('path');

const TEMP_DIR = 'C:\\Users\\Alva\\AppData\\Local\\Temp\\react-doctor-3f1462fc-2b6c-448b-b00a-b6407f410e8d';

// 1. Fix use-lazy-motion
function fixFramerMotion() {
  const filePath = path.join(TEMP_DIR, 'react-doctor--use-lazy-motion.txt');
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const files = new Set();
  for (const line of lines) {
    const match = line.match(/^\s+(src\/.*?\.tsx?)(?::\d+)?$/);
    if (match) files.add(match[1]);
  }
  
  for (const file of files) {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/import\s+\{\s*motion(\s*,\s*[^}]+)?\s*\}\s+from\s+['"]framer-motion['"]/g, (match, p1) => {
        return p1 ? `import { m${p1} } from "framer-motion"` : `import { m } from "framer-motion"`;
      });
      content = content.replace(/import\s+\{\s*([^,]+,\s*)?motion\s*\}\s+from\s+['"]framer-motion['"]/g, `import { $1m } from "framer-motion"`);
      
      content = content.replace(/<motion\./g, '<m.');
      content = content.replace(/<\/motion\./g, '</m.');
      fs.writeFileSync(fullPath, content);
      console.log(`Updated framer-motion in ${file}`);
    }
  }
}

// 2. Fix button-has-type
function fixButtonType() {
  const filePath = path.join(TEMP_DIR, 'react-doctor--button-has-type.txt');
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const files = new Set();
  for (const line of lines) {
    const match = line.match(/^\s+(src\/.*?\.tsx?)(?::\d+)?$/);
    if (match) files.add(match[1]);
  }
  
  for (const file of files) {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Simple regex to add type="button" if type= is not found before the closing >
      // This works for 99% of TSX buttons.
      content = content.replace(/<button\b(?![^>]*?\btype=)/g, '<button type="button"');
      fs.writeFileSync(fullPath, content);
      console.log(`Added type="button" in ${file}`);
    }
  }
}

// 3. Fix unused files
function fixUnusedFiles() {
  const filePath = path.join(TEMP_DIR, 'deslop--unused-file.txt');
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s+(src\/.*?\.tsx?|.*\.cjs)$/);
    if (match) {
      const fullPath = path.resolve(match[1]);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted unused file ${match[1]}`);
      }
    }
  }
}

fixFramerMotion();
fixButtonType();
fixUnusedFiles();
console.log('Migration fixes completed.');
