const fs = require('fs');
const path = require('path');

const targetUrlVar = "process.env.REACT_APP_API_URL || 'http://localhost:5000'";

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace io('http://localhost:5000') --> io(process.env.REACT_APP_API_URL || 'http://localhost:5000')
  if (content.includes("'http://localhost:5000'")) {
    content = content.replace(/'http:\/\/localhost:5000'/g, `(${targetUrlVar})`);
    changed = true;
  }
  
  // Replace `http://localhost:5000/...` --> `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/...`
  if (content.includes("`http://localhost:5000/")) {
    content = content.replace(/`http:\/\/localhost:5000\//g, "\\`${" + targetUrlVar + "}/");
    changed = true;
  }
  
  // Replace 'http://localhost:5000/...` --> `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/...`
  if (content.includes("'http://localhost:5000/")) {
    content = content.replace(/'http:\/\/localhost:5000\//g, "\\`${" + targetUrlVar + "}/");
    
    // Some lines might now have mismatched quotes because they started with ' but now start with `
    // e.g. const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts';
    // Let's use Regex to safely replace 'http://localhost:5000/something' with `${...}/something`
  }

  // Safer Regex for single quotes
  // Re-read content because the above naive string replacement for single quotes is flawed and leaves a trailing quote mismach.
  
  fs.writeFileSync(filePath, content);
}

// Better logic:
function applyRegex(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Exact match 'http://localhost:5000' -> (process.env.REACT_APP_API_URL || 'http://localhost:5000')
    content = content.replace(/'http:\/\/localhost:5000'/g, `(${targetUrlVar})`);

    // 2. Backtick match `http://localhost:5000/api/...` -> `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...`
    content = content.replace(/`http:\/\/localhost:5000\//g, "\\`${" + targetUrlVar + "}/");

    // 3. Single Quote match 'http://localhost:5000/api/...' -> `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...`
    // This looks for anything matching 'http://localhost:5000/ followed by any characters except single-quote, and then the single quote.
    // Replace the opening 'http://localhost:5000/ with `${targetUrlVar}/ and the closing ' with `
    content = content.replace(/'http:\/\/localhost:5000\/([^']*)'/g, "\\`${" + targetUrlVar + "}/$1\\`");

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log("Updated:", filePath);
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
console.log('Replaced all localhost:5000 references.');
