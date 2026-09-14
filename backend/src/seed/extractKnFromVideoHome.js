const fs = require('fs');

const js = fs.readFileSync('dautoeic_video_page_chunk.js', 'utf8');

// Find export { ... as kn ... } or export { kn ... }
const exportMatch = js.match(/export\s*\{[^}]*\bkn\b[^}]*\}/);
console.log('Export match:', exportMatch ? exportMatch[0] : 'None');

if (exportMatch) {
  // Extract internal variable name for kn
  const m = exportMatch[0].match(/(\w+)\s+as\s+kn/) || exportMatch[0].match(/\bkn\b/);
  const internalName = m ? (m[1] || 'kn') : 'kn';
  console.log(`Internal component name: ${internalName}`);

  // Find definition of internalName
  const defRegex = new RegExp(`(?:function\\s+${internalName}\\s*\\(|const\\s+${internalName}\\s*=)`, 'g');
  const defMatch = defRegex.exec(js);
  if (defMatch) {
    const start = defMatch.index;
    const end = Math.min(js.length, start + 15000);
    fs.writeFileSync('dautoeic_video_page_full_component.js', js.substring(start, end), 'utf8');
    console.log(`Saved ${end - start} chars to dautoeic_video_page_full_component.js`);
    console.log(js.substring(start, start + 3000));
  }
}
