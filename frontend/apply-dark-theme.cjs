const fs = require('fs');
const path = require('path');

// Padrões de substituição
const replacements = [
  // Backgrounds
  { from: /className="([^"]*?)bg-white([^"]*?)"/g, to: 'className="$1bg-white dark:bg-neutral-800$2"' },
  { from: /className="([^"]*?)bg-neutral-50([^"]*?)"/g, to: 'className="$1bg-neutral-50 dark:bg-neutral-900$2"' },
  { from: /className="([^"]*?)bg-neutral-100([^"]*?)"/g, to: 'className="$1bg-neutral-100 dark:bg-neutral-800$2"' },
  { from: /className="([^"]*?)bg-gray-50([^"]*?)"/g, to: 'className="$1bg-gray-50 dark:bg-neutral-900$2"' },
  { from: /className="([^"]*?)bg-gray-100([^"]*?)"/g, to: 'className="$1bg-gray-100 dark:bg-neutral-800$2"' },
  
  // Text colors
  { from: /className="([^"]*?)text-neutral-900([^"]*?)"/g, to: 'className="$1text-neutral-900 dark:text-neutral-100$2"' },
  { from: /className="([^"]*?)text-neutral-800([^"]*?)"/g, to: 'className="$1text-neutral-800 dark:text-neutral-200$2"' },
  { from: /className="([^"]*?)text-neutral-700([^"]*?)"/g, to: 'className="$1text-neutral-700 dark:text-neutral-300$2"' },
  { from: /className="([^"]*?)text-neutral-600([^"]*?)"/g, to: 'className="$1text-neutral-600 dark:text-neutral-400$2"' },
  { from: /className="([^"]*?)text-neutral-500([^"]*?)"/g, to: 'className="$1text-neutral-500 dark:text-neutral-500$2"' },
  { from: /className="([^"]*?)text-gray-900([^"]*?)"/g, to: 'className="$1text-gray-900 dark:text-neutral-100$2"' },
  { from: /className="([^"]*?)text-gray-700([^"]*?)"/g, to: 'className="$1text-gray-700 dark:text-neutral-300$2"' },
  { from: /className="([^"]*?)text-gray-600([^"]*?)"/g, to: 'className="$1text-gray-600 dark:text-neutral-400$2"' },
  { from: /className="([^"]*?)text-gray-500([^"]*?)"/g, to: 'className="$1text-gray-500 dark:text-neutral-500$2"' },
  
  // Borders
  { from: /className="([^"]*?)border-neutral-200([^"]*?)"/g, to: 'className="$1border-neutral-200 dark:border-neutral-700$2"' },
  { from: /className="([^"]*?)border-neutral-300([^"]*?)"/g, to: 'className="$1border-neutral-300 dark:border-neutral-600$2"' },
  { from: /className="([^"]*?)border-gray-200([^"]*?)"/g, to: 'className="$1border-gray-200 dark:border-neutral-700$2"' },
  { from: /className="([^"]*?)border-gray-300([^"]*?)"/g, to: 'className="$1border-gray-300 dark:border-neutral-600$2"' },
  
  // Hover states - text
  { from: /hover:text-primary-700/g, to: 'hover:text-primary-700 dark:hover:text-primary-400' },
  { from: /hover:text-bronze-700/g, to: 'hover:text-bronze-700 dark:hover:text-bronze-400' },
  
  // Hover states - background
  { from: /hover:bg-neutral-100/g, to: 'hover:bg-neutral-100 dark:hover:bg-neutral-700' },
  { from: /hover:bg-gray-100/g, to: 'hover:bg-gray-100 dark:hover:bg-neutral-700' },
  { from: /hover:bg-neutral-50/g, to: 'hover:bg-neutral-50 dark:hover:bg-neutral-800' },
  { from: /hover:bg-primary-50/g, to: 'hover:bg-primary-50 dark:hover:bg-neutral-700' },
];

function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsxFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') && !file.includes('.backup') && !file.includes('.old')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function applyDarkMode(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has dark: classes
  if (content.includes('dark:')) {
    return { modified: false, reason: 'already has dark mode' };
  }
  
  let modified = false;
  const originalContent = content;
  
  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { modified: true };
  }
  
  return { modified: false, reason: 'no changes needed' };
}

// Main execution
console.log('🌓 Aplicando tema escuro em todos os componentes...\n');

const srcDir = path.join(__dirname, 'src');
const files = getAllJsxFiles(srcDir);

console.log(`📁 Encontrados ${files.length} arquivos .jsx\n`);

let modifiedCount = 0;
let skippedCount = 0;

files.forEach((file, index) => {
  const relativePath = path.relative(__dirname, file);
  const result = applyDarkMode(file);
  
  if (result.modified) {
    console.log(`✅ [${index + 1}/${files.length}] ${relativePath}`);
    modifiedCount++;
  } else {
    console.log(`⏭️  [${index + 1}/${files.length}] ${relativePath} (${result.reason})`);
    skippedCount++;
  }
});

console.log('\n✨ Concluído!');
console.log(`📊 Arquivos processados: ${files.length}`);
console.log(`📝 Arquivos modificados: ${modifiedCount}`);
console.log(`⏭️  Arquivos pulados: ${skippedCount}`);
console.log('\n⚠️  IMPORTANTE: Revise as mudanças antes de commitar!');
console.log('💡 Teste o tema escuro no navegador com: npm run dev');
