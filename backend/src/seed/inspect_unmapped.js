const fs = require('fs');
const unmapped = JSON.parse(fs.readFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/unmapped.json', 'utf8'));

console.log('Unmapped count:', unmapped.length);

const listeningList = unmapped.filter(u => u.collections.includes('listeningexercises'));
const readingList = unmapped.filter(u => u.collections.includes('readingexercises') && !u.collections.includes('listeningexercises'));
const mockList = unmapped.filter(u => u.collections.includes('mocktests') && !u.collections.includes('listeningexercises') && !u.collections.includes('readingexercises'));

console.log(`Listening: ${listeningList.length}`);
console.log(`Reading: ${readingList.length}`);
console.log(`Mock only: ${mockList.length}`);

console.log('\n--- FIRST 25 LISTENING UNMAPPED ---');
listeningList.slice(0, 25).forEach((u, i) => console.log(`${i+1}. "${u.text}"`));

console.log('\n--- FIRST 25 READING UNMAPPED ---');
readingList.slice(0, 25).forEach((u, i) => console.log(`${i+1}. "${u.text}"`));

console.log('\n--- ALL MOCK UNMAPPED ---');
mockList.forEach((u, i) => console.log(`${i+1}. "${u.text}"`));
