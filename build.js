const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');

const filesToCopy = ['index.html', 'styles.css', 'script.js'];

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

filesToCopy.forEach(file => {
  const srcPath = path.join(rootDir, file);
  const destPath = path.join(publicDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to public directory`);
  } else {
    console.log(`Warning: ${file} not found in root directory`);
  }
});

console.log('Build process completed.');