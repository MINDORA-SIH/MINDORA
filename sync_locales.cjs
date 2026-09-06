const fs = require('fs');
const path = require('path');

const enFile = 'src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

const targetLangs = ['hi', 'ne', 'as', 'bn', 'brx', 'mni'];

// Deep merge function
function syncObj(enObj, targetObj) {
  const result = {};
  for (const key in enObj) {
    if (typeof enObj[key] === 'object' && enObj[key] !== null) {
      result[key] = syncObj(enObj[key], targetObj[key] || {});
    } else {
      result[key] = targetObj[key] !== undefined ? targetObj[key] : enObj[key];
    }
  }
  return result;
}

targetLangs.forEach(lang => {
  const file = `src/locales/${lang}.json`;
  let target = {};
  if (fs.existsSync(file)) {
    target = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const synced = syncObj(en, target);
  fs.writeFileSync(file, JSON.stringify(synced, null, 2));
  console.log(`Synced ${lang}.json`);
});
