const fs = require('fs');

const content = fs.readFileSync('./src/data/allVideoChaptersData.js', 'utf8');

// Parse lessons and chapters
const lines = content.split('\n');
let currentChapter = null;
let lessons = [];

for (const line of lines) {
  const chMatch = line.match(/"title":\s*"(\d+\.\s*[^"]+)"/);
  if (chMatch) {
    console.log(`\n=== CHƯƠNG: ${chMatch[1]} ===`);
  }
  const lessonMatch = line.match(/"title":\s*"([^"]+)"/);
  const isProMatch = line.match(/"isPro":\s*(true|false)/);
  if (lessonMatch && !lessonMatch[1].match(/^\d+\./)) {
    console.log(`  - Bài: ${lessonMatch[1]}`);
  }
}
