const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const rootDir = __dirname;

const filesToCopy = ['index.html', 'styles.css', 'script.js'];

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(rootDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to root directory`);
  } else {
    console.log(`Warning: ${file} not found in src directory`);
  }
});

console.log('Build process completed.');