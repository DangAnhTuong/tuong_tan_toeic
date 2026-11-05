const fs = require('fs');

const path = 'frontend/src/pages/LevelPracticeRoom.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `        const res = await axios.get(endpoint);
        if (res.data?.data && res.data.data.length > 0) {
          const matched = modeParam === 'topic' && topicParam
            ? (res.data.data.find(ex => ex.topic === topicParam || ex.title === topicParam) || res.data.data[0])
            : (res.data.data.find(ex => ex.level === levelNum) || res.data.data[0]);

          if (matched && matched.questions && matched.questions.length > 0) {
            setQuestions(matched.questions);
            return;
          }
        }
        setLoadError('Không tìm thấy câu hỏi bài tập cho phần luyện tập này trong cơ sở dữ liệu.');`;

const replacement = `        const res = await axios.get(endpoint);
        let exercisesList = [];
        if (res.data?.data && res.data.data.length > 0) {
          exercisesList = res.data.data;
        } else {
          // Fallback: fetch all exercises for this part & mode without rigid topic filter
          const fallbackRes = await axios.get(\`/api/v1/listening/exercises?mode=\${modeParam}&part=\${partNum}\`);
          if (fallbackRes.data?.data && fallbackRes.data.data.length > 0) {
            exercisesList = fallbackRes.data.data;
          }
        }

        if (exercisesList.length > 0) {
          let matched = null;
          if (modeParam === 'topic' && topicParam) {
            const lowerT = topicParam.toLowerCase().trim();
            matched = exercisesList.find(ex => {
              const exTopic = (ex.topic || '').toLowerCase().trim();
              const exKey = (ex.topicKey || '').toLowerCase().trim();
              const exTitle = (ex.title || '').toLowerCase().trim();

              if (exTopic === lowerT || exKey === lowerT || exTitle === lowerT) return true;
              if (exTitle.includes(lowerT) || (exTopic && lowerT.includes(exTopic))) return true;

              // Topic-specific keyword fallbacks for Part 1
              if (lowerT.includes('vật') && (exKey === 'object' || exTopic === 'object' || exTitle.includes('vật'))) return true;
              if (lowerT.includes('cảnh') && (exKey === 'scene' || exTopic === 'scene' || exTitle.includes('cảnh'))) return true;
              if (lowerT.includes('nhiều người') && (exKey === 'multi' || exTopic === 'multi' || exTitle.includes('nhiều người'))) return true;
              if (lowerT.includes('một người') && (exKey === 'single' || exTopic === 'single' || exTitle.includes('một người'))) return true;

              return false;
            }) || exercisesList[0];
          } else {
            matched = exercisesList.find(ex => Number(ex.level) === Number(levelNum)) || exercisesList[0];
          }

          if (matched && matched.questions && matched.questions.length > 0) {
            setQuestions(matched.questions);
            return;
          }
        }
        setLoadError('Không tìm thấy câu hỏi bài tập cho phần luyện tập này trong cơ sở dữ liệu.');`;

content = content.replace(/\r\n/g, '\n');
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated LevelPracticeRoom.jsx');
} else {
  console.error('Target not found in LevelPracticeRoom.jsx!');
}

