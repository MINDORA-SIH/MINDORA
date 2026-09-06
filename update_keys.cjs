const fs = require('fs');
const enFile = 'src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

let added = 0;
// Note: handling quotes around default value properly.
const regex = /t\("([^"]+)"(?:,\s*(?:"([^"]+)"|'([^']+)'))?/g;

process.argv.slice(2).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const keyPath = match[1];
    const defaultVal = match[2] || match[3] || "";
    
    if(keyPath.includes('"') || keyPath.includes('+') || keyPath.includes('${')) continue;

    const parts = keyPath.split('.');
    let curr = en;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    const last = parts[parts.length - 1];
    if (curr[last] === undefined) {
      curr[last] = defaultVal || keyPath;
      added++;
    }
  }
});

fs.writeFileSync(enFile, JSON.stringify(en, null, 2));
console.log('Added keys:', added);
