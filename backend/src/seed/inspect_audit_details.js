const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'ultimate_audit_summary.json');
if (fs.existsSync(file)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('=== Reading missingOptTrans (' + data.reading.missingOptTrans.length + ') ===');
  for (const item of data.reading.missingOptTrans) {
    console.log(JSON.stringify(item));
  }
} else {
  console.log('File not found');
}
