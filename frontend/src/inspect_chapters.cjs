const fs = require('fs');

const content = fs.readFileSync('./src/data/allVideoChaptersData.js', 'utf8');

const lines = content.split('\n');
for (const line of lines) {
  const chMatch = line.match(/"title":\s*"(\d+\.\s*[^"]+)"/);
  if (chMatch) {
    console.log(`\n=== CHƯƠNG: ${chMatch[1]} ===`);
  }
  const lessonMatch = line.match(/"title":\s*"([^"]+)"/);
  if (lessonMatch && !lessonMatch[1].match(/^\d+\./)) {
    console.log(`  - ${lessonMatch[1]}`);
  }
}
