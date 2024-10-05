const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const filesToCopy = ['index.html', 'styles.css', 'script.js'];

filesToCopy.forEach(file => {
  const srcPath = path.join(rootDir, file);
  const publicPath = path.join(rootDir, 'public', file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, publicPath);
    console.log(`Copied ${file} to public directory`);
  } else {
    console.log(`Warning: ${file} not found in root directory`);
  }
});

console.log('Build process completed.');