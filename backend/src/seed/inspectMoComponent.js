const fs = require('fs');

const js = fs.readFileSync('dautoeic_modulerouter.js', 'utf8');

// Find definition of function mo(...)
const regex = /function\s+mo\s*\([^)]*\)\s*\{/g;
let m = regex.exec(js);
if (m) {
  const start = m.index;
  const end = Math.min(js.length, start + 8000);
  console.log('--- Video component definition (mo) ---');
  console.log(js.substring(start, end));
  fs.writeFileSync('dautoeic_video_main_component.js', js.substring(start, end), 'utf8');
} else {
  console.log('Could not find function mo, searching other functions near Ud...');
  const idx = js.indexOf('function Ud');
  if (idx !== -1) {
    console.log(js.substring(Math.max(0, idx - 4000), idx + 500));
  }
}
