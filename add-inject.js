const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'services', 'api', 'src', 'modules');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.controller.ts') || file.endsWith('.service.ts') || file.endsWith('.gateway.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles(baseDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Make sure Inject is imported from @nestjs/common if needed
  const constructorMatch = content.match(/constructor\s*\(([\s\S]*?)\)\s*\{/);
  if (!constructorMatch) continue;

  const rawParams = constructorMatch[1];
  // Parse params
  const paramLines = rawParams.split(',\n').map(p => p.trim()).filter(Boolean);
  
  let newRawParams = rawParams;

  // Match parameters like: private readonly somethingService: SomethingService
  // or: private somethingService: SomethingService
  const paramRegex = /(?:(public|private|protected)\s+(?:readonly\s+)?)?(\w+)\s*:\s*([A-Z]\w+)/g;
  
  let match;
  while ((match = paramRegex.exec(rawParams)) !== null) {
    const fullParam = match[0];
    const paramName = match[2];
    const paramType = match[3];

    // Skip if already has @Inject or @InjectRepository or primitive types
    if (['string', 'number', 'boolean', 'any'].includes(paramType.toLowerCase())) continue;
    
    // Check if preceding text has @Inject or @InjectRepository
    const paramIndex = match.index;
    const prefix = rawParams.substring(Math.max(0, paramIndex - 50), paramIndex);
    if (prefix.includes('@Inject(') || prefix.includes('@InjectRepository(')) continue;

    // We should inject @Inject(paramType)
    const replacement = `@Inject(${paramType}) ${fullParam}`;
    newRawParams = newRawParams.replace(fullParam, replacement);
    changed = true;
    console.log(`In ${path.basename(file)}: injected @Inject(${paramType}) for ${paramName}`);
  }

  if (changed) {
    content = content.replace(rawParams, newRawParams);
    // Ensure Inject is imported from @nestjs/common
    if (!content.includes('Inject,') && !content.includes('Inject }') && !content.includes(', Inject')) {
      content = content.replace(
        /import\s*\{([^}]+)\}\s*from\s*['"]@nestjs\/common['"]/,
        (m, imports) => `import { Inject, ${imports.trim()} } from '@nestjs/common'`
      );
    }
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log('Finished updating constructors with @Inject()');
