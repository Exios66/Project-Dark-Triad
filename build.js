const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const rootDir = __dirname;
publicDir = path.join(rootDir, 'public');

const filesToCopy = ['index.html', 'styles.css', 'script.js'];

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const publicPath = path.join(publicDir, file);
  const destPath = path.join(rootDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, publicPath);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to public and root directories`);
  } else if (fs.existsSync(publicPath)) {
    fs.copyFileSync(publicPath, destPath);
    console.log(`Copied ${file} from public to root directory`);
  } else {
    console.log(`Warning: ${file} not found in src or public directory`);
  }
});

console.log('Build process completed.');