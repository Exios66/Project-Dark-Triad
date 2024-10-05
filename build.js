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

// Copy additional files and directories
const additionalItems = ['components', 'constants', 'services', 'index.js', 'reportWebVitals.js'];

additionalItems.forEach(item => {
  const srcPath = path.join(srcDir, item);
  const destPath = path.join(rootDir, item);
  
  if (fs.existsSync(srcPath)) {
    if (fs.lstatSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      console.log(`Copied directory ${item} to root`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied file ${item} to root`);
    }
  } else {
    console.log(`Warning: ${item} not found in src directory`);
  }
});

console.log('Build process completed.');