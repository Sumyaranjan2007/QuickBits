const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'services', 'api', 'src', 'database', 'entities');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

let totalFixes = 0;
for (const file of files) {
  const fp = path.join(dir, file);
  const original = fs.readFileSync(fp, 'utf8');
  let content = original;

  // Remove precision: N from column decorators
  content = content.replace(/,?\s*precision:\s*\d+/g, '');
  // Remove scale: N from column decorators  
  content = content.replace(/,?\s*scale:\s*\d+/g, '');
  // Clean up any resulting {, } or { , } patterns
  content = content.replace(/\{\s*,\s*/g, '{ ');
  content = content.replace(/,\s*\}/g, ' }');
  // Clean up double commas
  content = content.replace(/,\s*,/g, ',');

  if (content !== original) {
    fs.writeFileSync(fp, content);
    console.log('Fixed precision/scale:', file);
    totalFixes++;
  }
}
console.log(`Done! Fixed ${totalFixes} files.`);
