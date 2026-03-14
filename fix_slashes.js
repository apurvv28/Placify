const fs = require('fs');
const path = require('path');

function applyRegex(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/\\`/g, '`');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log("Fixed backslashes in:", filePath);
    }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js')) {
      applyRegex(fullPath);
    }
  }
}

walk(path.join(__dirname, 'ui/src'));
console.log('Fixed backslash issues.');
