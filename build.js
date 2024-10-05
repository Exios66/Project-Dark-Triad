const fs = require('fs');
const path = require('path');

// Copy static files to public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const filesToCopy = ['index.html', 'styles.css', 'script.js'];

filesToCopy.forEach(file => {
  fs.copyFileSync(path.join(__dirname, file), path.join(publicDir, file));
});

console.log('Static files built successfully.');