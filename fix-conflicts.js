const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('<<<<<<< HEAD')) return;
    
    // We want to keep the 'theirs' part, which is after ======= and before >>>>>>>
    const regex = /<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> .*?(?:\r?\n|$)/g;
    const newContent = content.replace(regex, '$1');
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed:', filePath);
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.idea') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (stat.isFile()) {
            try {
                processFile(fullPath);
            } catch (e) { }
        }
    }
}

traverseDir(process.cwd());
console.log('Finished resolving conflicts');
