const fs = require('fs');

const path = 'frontend/src/pages/LevelPracticeRoom.jsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `  const currentPassageImageUrl = isPassageMode 
    ? (currentPassageQuestions.find(q => q.imageUrl || q.image)?.imageUrl || currentPassageQuestions.find(q => q.imageUrl || q.image)?.image || currentPassageQ?.imageUrl || currentPassageQ?.image || '') 
    : (partNum === 1 ? (currentPassageQ?.imageUrl || currentPassageQ?.image || getPart1ImageUrl(currentPassageQ, currentIdx, topicParam)) : (currentPassageQ?.imageUrl || currentPassageQ?.image || ''));`;

const replace1 = `  const currentPassageImageUrl = isPassageMode 
    ? (currentPassageQuestions.find(q => (q.imageUrl && (q.imageUrl.startsWith('/media/') || q.imageUrl.startsWith('http'))))?.imageUrl || currentPassageQ?.imageUrl || '') 
    : (partNum === 1 ? getPart1ImageUrl(currentPassageQ, currentIdx, topicParam) : (currentPassageQ?.imageUrl || ''));`;

const target2 = `    const rawAudio = currentPassageQ.audioUrl || currentPassageQ.audio;
    // 1. If audioUrl or audio is valid and not the dead Supabase CDN link
    if (rawAudio && !rawAudio.includes('supabase.co')) {
      return rawAudio;
    }`;

const replace2 = `    const rawAudio = currentPassageQ.audioUrl || currentPassageQ.audio;
    // 1. If audioUrl or audio is valid self-hosted file (starts with /media/ or http)
    if (rawAudio && !rawAudio.includes('supabase.co') && (rawAudio.startsWith('/media/') || rawAudio.startsWith('http'))) {
      return rawAudio;
    }`;

content = content.replace(/\r\n/g, '\n');
if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replace1).replace(target2, replace2);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully patched media resolvers in LevelPracticeRoom.jsx');
} else {
  console.error('Target not found!', { has1: content.includes(target1), has2: content.includes(target2) });
}

